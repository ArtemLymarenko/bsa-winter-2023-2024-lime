import { type Entity, type ValueOf } from '~/common/types/types.js';

import { type UserBonusActionStatus } from './enums/enums.js';

class UserBonusEntity implements Entity {
    private 'id': number | null;

    private 'userId': number;

    private 'actionType': ValueOf<typeof UserBonusActionStatus>;

    private 'amount': number;

    private 'createdAt': string | null;

    private constructor({
        id,
        userId,
        actionType,
        amount,
        createdAt,
    }: {
        id: number | null;
        userId: number;
        actionType: ValueOf<typeof UserBonusActionStatus>;
        amount: number;
        createdAt: string | null;
    }) {
        this.id = id;
        this.userId = userId;
        this.actionType = actionType;
        this.amount = amount;
        this.createdAt = createdAt;
    }

    public static initialize({
        id,
        userId,
        actionType,
        amount,
        createdAt,
    }: {
        id: number;
        userId: number;
        actionType: ValueOf<typeof UserBonusActionStatus>;
        amount: number;
        createdAt: string | null;
    }): UserBonusEntity {
        return new UserBonusEntity({
            id,
            userId,
            actionType,
            amount,
            createdAt,
        });
    }

    public static initializeNew({
        userId,
        actionType,
        amount,
    }: {
        userId: number;
        actionType: ValueOf<typeof UserBonusActionStatus>;
        amount: number;
    }): UserBonusEntity {
        return new UserBonusEntity({
            id: null,
            userId,
            actionType,
            amount,
            createdAt: null,
        });
    }

    public toObject(): {
        id: number;
        userId: number;
        actionType: ValueOf<typeof UserBonusActionStatus>;
        amount: number;
        createdAt: string | null;
    } {
        return {
            id: this.id as number,
            userId: this.userId,
            actionType: this.actionType,
            amount: this.amount,
            createdAt: this.createdAt,
        };
    }

    public toNewObject(): {
        userId: number;
        actionType: ValueOf<typeof UserBonusActionStatus>;
        amount: number;
    } {
        return {
            userId: this.userId,
            actionType: this.actionType,
            amount: this.amount,
        };
    }
}

export { UserBonusEntity };
