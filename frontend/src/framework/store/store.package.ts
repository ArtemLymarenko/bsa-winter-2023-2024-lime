import {
    type ThunkMiddleware,
    type Tuple,
    type UnknownAction,
} from '@reduxjs/toolkit';
import { configureStore } from '@reduxjs/toolkit';

import { reducer as appReducer } from '~/app/store/app.js';
import { authApi } from '~/bundles/auth/auth.js';
import { reducer as authReducer } from '~/bundles/auth/store/auth.js';
import { AppEnvironment } from '~/bundles/common/enums/enums.js';
import { reducer as subscriptionsReducer } from '~/bundles/profile/components/subscription/store/slice.js';
import {
    subscriptionApi,
    subscriptionPlansApi,
} from '~/bundles/profile/components/subscription/subscription.js';
import { reducer as usersReducer } from '~/bundles/users/store/users.js';
import { userApi } from '~/bundles/users/users.js';
import { type Config } from '~/framework/config/config.js';

import { errorMiddleware } from './middlewares/error-middleware.js';

type RootReducer = {
    app: ReturnType<typeof appReducer>;
    auth: ReturnType<typeof authReducer>;
    users: ReturnType<typeof usersReducer>;
    subscriptions: ReturnType<typeof subscriptionsReducer>;
};

type ExtraArguments = {
    authApi: typeof authApi;
    userApi: typeof userApi;
    subscriptionPlansApi: typeof subscriptionPlansApi;
    subscriptionApi: typeof subscriptionApi;
};

class Store {
    public instance: ReturnType<
        typeof configureStore<
            RootReducer,
            UnknownAction,
            Tuple<[ThunkMiddleware<RootReducer, UnknownAction, ExtraArguments>]>
        >
    >;

    public constructor(config: Config) {
        this.instance = configureStore({
            devTools: config.ENV.APP.ENVIRONMENT !== AppEnvironment.PRODUCTION,
            reducer: {
                app: appReducer,
                auth: authReducer,
                users: usersReducer,
                subscriptions: subscriptionsReducer,
            },
            middleware: (getDefaultMiddleware) =>
                getDefaultMiddleware({
                    thunk: {
                        extraArgument: this.extraArguments,
                    },
                }).prepend(errorMiddleware),
        });
    }

    public get extraArguments(): ExtraArguments {
        return {
            authApi,
            userApi,
            subscriptionApi,
            subscriptionPlansApi,
        };
    }
}

export { Store };
