import { UserEntity } from '~/bundles/users/user.entity.js';
import { type UserModel } from '~/bundles/users/user.model.js';
import { type Repository } from '~/common/types/types.js';

class UserRepository implements Repository {
    private userModel: typeof UserModel;

    public constructor(userModel: typeof UserModel) {
        this.userModel = userModel;
    }

    public async find(
        query: Record<string, unknown>,
    ): ReturnType<Repository['find']> {
        return await this.userModel.query().findOne(query);
    }

    public async findAll(): Promise<UserEntity[]> {
        const users = await this.userModel
            .query()
            .withGraphFetched('userDetails')
            .execute();

        return users.map((user) => {
            const { userDetails, ...userInfo } = user;

            return UserEntity.initialize({
                ...userInfo,
                fullName: userDetails.fullName,
            });
        });
    }

    public async create(entity: UserEntity): Promise<UserEntity> {
        const { email, passwordHash } = entity.toNewObject();
        const trx = await this.userModel.startTransaction();

        try {
            const user = await this.userModel
                .query(trx)
                .insert({
                    email,
                    passwordHash,
                })
                .returning('*')
                .execute();

            const userDetails = await user
                .$relatedQuery('userDetails', trx)
                .insert({});

            await trx.commit();

            return UserEntity.initialize({
                ...user,
                fullName: userDetails.fullName,
            });
        } catch (error) {
            await trx.rollback();
            throw error;
        }
    }

    public update(): ReturnType<Repository['update']> {
        return Promise.resolve(null);
    }

    public delete(): ReturnType<Repository['delete']> {
        return Promise.resolve(true);
    }
}

export { UserRepository };
