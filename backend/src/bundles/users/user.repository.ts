import { type UserFollowingsResponseDto } from '~/bundles/users/types/types.js';
import { UserEntity } from '~/bundles/users/user.entity.js';
import { type UserModel } from '~/bundles/users/user.model.js';
import { DatabaseTableName } from '~/common/database/database.js';
import { type Repository } from '~/common/types/types.js';

import { type UserDetailsModel } from './user-details.model.js';

const USER_ID = 'user_id';
const USER_DETAILS_GRAPH = '[userDetails]';
const USER_DETAILS_SELECT_FIELDS = [
    'ud.id',
    `ud.${USER_ID}`,
    'ud.full_name',
    'ud.avatar_url',
    'ud.username',
    'ud.date_of_birth',
    'ud.weight',
    'ud.height',
    'ud.gender',
];

class UserRepository implements Repository {
    private userModel: typeof UserModel;

    public constructor(userModel: typeof UserModel) {
        this.userModel = userModel;
    }

    public async find(
        query: Record<string, unknown>,
    ): Promise<UserEntity | null> {
        const user = await this.userModel
            .query()
            .findOne(query)
            .withGraphFetched(USER_DETAILS_GRAPH)
            .execute();

        if (!user) {
            return null;
        }

        const { userDetails, ...userInfo } = user;

        return UserEntity.initialize({
            ...userInfo,
            fullName: userDetails.fullName,
            avatarUrl: userDetails.avatarUrl,
            username: userDetails.username,
            dateOfBirth: userDetails.dateOfBirth,
            weight: userDetails.weight,
            height: userDetails.height,
            gender: userDetails.gender,
        });
    }

    public async findAll(): Promise<UserEntity[]> {
        const users = await this.userModel
            .query()
            .withGraphFetched(USER_DETAILS_GRAPH)
            .execute();

        return users.map((user) => {
            const { userDetails, ...userInfo } = user;

            return UserEntity.initialize({
                ...userInfo,
                fullName: userDetails.fullName,
                avatarUrl: userDetails.avatarUrl,
                username: userDetails.username,
                dateOfBirth: userDetails.dateOfBirth,
                weight: userDetails.weight,
                height: userDetails.height,
                gender: userDetails.gender,
            });
        });
    }

    public async create(entity: UserEntity): Promise<UserEntity> {
        const { email, passwordHash, stripeCustomerId } = entity.toNewObject();
        const trx = await this.userModel.startTransaction();

        try {
            const user = await this.userModel
                .query(trx)
                .insert({
                    email,
                    passwordHash,
                    stripeCustomerId,
                })
                .returning('*')
                .execute();

            const userDetails = await user
                .$relatedQuery('userDetails', trx)
                .insert({})
                .returning('*')
                .execute();

            await user
                .$relatedQuery('userAchievements', trx)
                .insert({ achievementId: 1 })
                .returning('*')
                .execute();

            await trx.commit();

            return UserEntity.initialize({
                ...user,
                fullName: userDetails.fullName,
                avatarUrl: userDetails.avatarUrl,
                username: userDetails.username,
                dateOfBirth: userDetails.dateOfBirth,
                weight: userDetails.weight,
                height: userDetails.height,
                gender: userDetails.gender,
            });
        } catch (error) {
            await trx.rollback();
            throw error;
        }
    }
    public async update(
        query: Record<string, unknown>,
        payload: Record<string, unknown>,
    ): ReturnType<Repository['update']> {
        return await this.userModel
            .query()
            .patch(payload)
            .where(query)
            .returning('*')
            .first()
            .execute();
    }

    public async updateUserProfile(
        userId: number,
        payload: Partial<UserDetailsModel>,
    ): Promise<UserEntity | null> {
        const trx = await this.userModel.startTransaction();
        try {
            const user = await this.userModel.query(trx).findById(userId);

            if (!user) {
                return null;
            }

            const userDetails = await user
                .$relatedQuery('userDetails', trx)
                .patch(payload)
                .returning('*')
                .first();

            await trx.commit();

            if (!userDetails) {
                return null;
            }
            return UserEntity.initialize({
                ...user,
                fullName: userDetails.fullName,
                avatarUrl: userDetails.avatarUrl,
                username: userDetails.username,
                dateOfBirth: userDetails.dateOfBirth,
                weight: userDetails.weight,
                height: userDetails.height,
                gender: userDetails.gender,
            });
        } catch (error) {
            await trx.rollback();
            throw new Error(`Error updating user details: ${error}`);
        }
    }
    public delete(): ReturnType<Repository['delete']> {
        return Promise.resolve(true);
    }

    public async addFollowing(
        id: number,
        followingId: number,
    ): Promise<UserFollowingsResponseDto | null> {
        const trx = await this.userModel.startTransaction();
        try {
            const user = await this.userModel.query(trx).findById(id);
            if (!user) {
                return null;
            }
            await user
                .$relatedQuery('userFriends', trx)
                .insert({ followingId })
                .returning('*')
                .first();

            const userDetails = await this.userModel
                .query(trx)
                .findById(followingId)
                .select('email', ...USER_DETAILS_SELECT_FIELDS)
                .leftJoin('user_details as ud', `ud.${USER_ID}`, 'users.id');

            await trx.commit();

            return userDetails as unknown as UserFollowingsResponseDto;
        } catch (error) {
            await trx.rollback();
            throw new Error(`Error adding user friend: ${error}`);
        }
    }

    public async removeFollowing(
        id: number,
        followingId: number,
    ): Promise<number> {
        const trx = await this.userModel.startTransaction();
        try {
            const user = await this.userModel.query(trx).findById(id);
            if (!user) {
                return 0;
            }
            await user
                .$relatedQuery('userFriends', trx)
                .delete()
                .where('following_id', followingId);
            await trx.commit();

            return followingId;
        } catch (error) {
            await trx.rollback();
            throw new Error(`Error removing user friend: ${error}`);
        }
    }

    public async getFollowings(
        userId: number,
    ): Promise<UserFollowingsResponseDto[] | null> {
        try {
            const friends = await this.userModel
                .query()
                .select('email', ...USER_DETAILS_SELECT_FIELDS)
                .from(`${DatabaseTableName.USER_FRIENDS} as uf`)
                .join(
                    `${DatabaseTableName.USERS} as u`,
                    'uf.following_id',
                    'u.id',
                )
                .leftJoin(
                    `${DatabaseTableName.USER_DETAILS} as ud`,
                    'u.id',
                    `ud.${USER_ID}`,
                )
                .where(`uf.${USER_ID}`, userId);
            return friends as unknown as UserFollowingsResponseDto[];
        } catch (error) {
            throw new Error(`Error fetching friends: ${error}`);
        }
    }

    public async getNotFollowed(
        userId: number,
    ): Promise<UserFollowingsResponseDto[] | null> {
        try {
            const allUsers = await this.userModel
                .query()
                .whereNot('id', userId)
                .withGraphFetched(USER_DETAILS_GRAPH);
            const friends = await this.getFollowings(userId);
            const followingIds =
                friends && friends.map((friend) => friend.userId);

            const nonFriendUsers = allUsers.filter(
                (user) => followingIds && !followingIds.includes(user.id),
            );

            const nonFriendUsersDetail = nonFriendUsers.map((user) => {
                const { userDetails, ...userInfo } = user;
                return {
                    ...userInfo,
                    email: user.email,
                    fullName: userDetails.fullName,
                    avatarUrl: userDetails.avatarUrl,
                    username: userDetails.username,
                    dateOfBirth: userDetails.dateOfBirth,
                    weight: userDetails.weight,
                    height: userDetails.height,
                    gender: userDetails.gender,
                };
            });

            return nonFriendUsersDetail as unknown as UserFollowingsResponseDto[];
        } catch (error) {
            throw new Error(`Error fetching non-friend users: ${error}`);
        }
    }
}

export { UserRepository };
