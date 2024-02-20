import {
    type ThunkMiddleware,
    type Tuple,
    type UnknownAction,
} from '@reduxjs/toolkit';
import { configureStore } from '@reduxjs/toolkit';

import { authApi } from '~/bundles/auth/auth.js';
import { reducer as authReducer } from '~/bundles/auth/store/auth.js';
import { AppEnvironment } from '~/bundles/common/enums/enums.js';
import { reducer as themeReducer } from '~/bundles/common/store/slice.js';
import { reducer as usersReducer } from '~/bundles/users/store/users.js';
import { userApi } from '~/bundles/users/users.js';
import { type Config } from '~/framework/config/config.js';

import { errorMiddleware } from './middlewares/error-middleware.js';

type RootReducer = {
    auth: ReturnType<typeof authReducer>;
    users: ReturnType<typeof usersReducer>;
    theme: ReturnType<typeof themeReducer>;
};

type ExtraArguments = {
    authApi: typeof authApi;
    userApi: typeof userApi;
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
                auth: authReducer,
                users: usersReducer,
                theme: themeReducer
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
        };
    }
}

export { Store };
