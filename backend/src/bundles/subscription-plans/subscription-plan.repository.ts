import { type Repository } from '~/common/types/types.js';

import { SubscriptionPlanEntity } from './subscription-plan.entity.js';
import { type SubscriptionPlanModel } from './subscription-plan.model.js';

class SubscriptionPlanRepository implements Repository {
    private subscriptionPlanModel: typeof SubscriptionPlanModel;

    public constructor(subscriptionPlanModel: typeof SubscriptionPlanModel) {
        this.subscriptionPlanModel = subscriptionPlanModel;
    }

    public async find(
        query: Record<string, unknown>,
    ): ReturnType<Repository['find']> {
        return await this.subscriptionPlanModel.query().findOne(query);
    }

    public async findAll(): Promise<SubscriptionPlanEntity[]> {
        const plans = await this.subscriptionPlanModel.query().execute();

        return plans.map((plan) => {
            return SubscriptionPlanEntity.initialize({ ...plan });
        });
    }

    public async create(
        entity: SubscriptionPlanEntity,
    ): Promise<SubscriptionPlanEntity> {
        const { name, price, description, productToken, priceToken } =
            entity.toNewObject();

        const plan = await this.subscriptionPlanModel
            .query()
            .insert({
                name,
                price,
                description,
                productToken,
                priceToken,
            })
            .returning('*')
            .execute();

        return SubscriptionPlanEntity.initialize({ ...plan });
    }

    public update(): ReturnType<Repository['update']> {
        return Promise.resolve(null);
    }

    public delete(): ReturnType<Repository['delete']> {
        return Promise.resolve(true);
    }
}

export { SubscriptionPlanRepository };
