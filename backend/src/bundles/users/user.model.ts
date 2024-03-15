import { type RelationMappings, Model } from 'objection';

import { UserAchievementModel } from '~/bundles/achievements/achievements.js';
import {
    AiAssistantAttributes,
    AiAssistantModel,
} from '~/bundles/ai-assistants/ai-assistants.js';
import { ChatModel, ChatUserAttributes } from '~/bundles/chats/chats.js';
import { MessageAttributes } from '~/bundles/messages/messages.js';
import {
    OAuthInfoAttributes,
    OAuthModel,
    OAuthStateAttributes,
    OAuthStateModel,
} from '~/bundles/oauth/oauth.js';
import {
    SubscriptionAttributes,
    SubscriptionModel,
} from '~/bundles/subscriptions/subscriptions.js';
import {
    UserBonusAttributes,
    UserBonusModel,
} from '~/bundles/user-bonuses/user-bonuses.js';
import {
    WorkoutAttributes,
    WorkoutModel,
} from '~/bundles/workouts/workouts.js';
import {
    AbstractModel,
    DatabaseTableName,
} from '~/common/database/database.js';

import { UserAttributes, UserDetailsAttributes } from './enums/enums.js';
import { UserDetailsModel } from './user-details.model.js';

class UserModel extends AbstractModel {
    public 'email': string;

    public 'passwordHash': string | null;

    public 'stripeCustomerId': string;

    public 'userDetails': UserDetailsModel;

    public 'workouts': WorkoutModel;

    public 'userAchievements': UserAchievementModel;

    public 'userOAuthInfo': OAuthModel;

    public 'userOAuthState': OAuthStateModel;

    public 'userBonus': UserBonusModel;

    public 'chats': ChatModel[];

    public 'aiAssistant': AiAssistantModel;

    public static override get tableName(): string {
        return DatabaseTableName.USERS;
    }

    public static override get relationMappings(): RelationMappings {
        return {
            userDetails: {
                relation: Model.HasOneRelation,
                modelClass: UserDetailsModel,
                join: {
                    from: `${DatabaseTableName.USERS}.${UserAttributes.ID}`,
                    to: `${DatabaseTableName.USER_DETAILS}.${UserDetailsAttributes.USER_ID}`,
                },
            },
            subscription: {
                relation: Model.HasManyRelation,
                modelClass: SubscriptionModel,
                join: {
                    from: `${DatabaseTableName.USERS}.${UserAttributes.ID}`,
                    to: `${DatabaseTableName.SUBSCRIPTIONS}.${SubscriptionAttributes.USER_ID}`,
                },
            },
            oAuthInfo: {
                relation: Model.HasManyRelation,
                modelClass: OAuthModel,
                join: {
                    from: `${DatabaseTableName.USERS}.${UserAttributes.ID}`,
                    to: `${DatabaseTableName.OAUTH_INFO}.${OAuthInfoAttributes.ID}`,
                },
            },
            oAuthState: {
                relation: Model.HasManyRelation,
                modelClass: OAuthStateModel,
                join: {
                    from: `${DatabaseTableName.USERS}.${UserAttributes.ID}`,
                    to: `${DatabaseTableName.OAUTH_STATE}.${OAuthStateAttributes.ID}`,
                },
            },
            userBonus: {
                relation: Model.HasManyRelation,
                modelClass: UserBonusModel,
                join: {
                    from: `${DatabaseTableName.USERS}.${UserAttributes.ID}`,
                    to: `${DatabaseTableName.USER_BONUSES}.${UserBonusAttributes.USER_ID}`,
                },
            },
            userAchievements: {
                relation: Model.HasOneRelation,
                modelClass: UserAchievementModel,
                join: {
                    from: `${DatabaseTableName.USERS}.${UserAttributes.ID}`,
                    to: `${DatabaseTableName.USER_ACHIEVEMENTS}.${UserDetailsAttributes.USER_ID}`,
                },
            },
            workouts: {
                relation: Model.HasManyRelation,
                modelClass: WorkoutModel,
                join: {
                    from: `${DatabaseTableName.USERS}.${UserAttributes.ID}`,
                    to: `${DatabaseTableName.WORKOUTS}.${WorkoutAttributes.USER_ID}`,
                },
            },
            chats: {
                relation: Model.ManyToManyRelation,
                modelClass: ChatModel,
                join: {
                    from: `${DatabaseTableName.USERS}.${UserAttributes.ID}`,
                    through: {
                        from: `${DatabaseTableName.CHATS_USERS}.${ChatUserAttributes.USER_ID}`,
                        to: `${DatabaseTableName.CHATS_USERS}.${MessageAttributes.CHAT_ID}`,
                    },
                    to: `${DatabaseTableName.CHATS}.`,
                },
            },
            aiAssistant: {
                relation: Model.HasOneRelation,
                modelClass: AiAssistantModel,
                join: {
                    from: `${DatabaseTableName.USERS}.${UserAttributes.ID}`,
                    to: `${DatabaseTableName.AI_ASSISTANTS}.${AiAssistantAttributes.USER_ID}`,
                },
            },
        };
    }
}

export { UserModel };
