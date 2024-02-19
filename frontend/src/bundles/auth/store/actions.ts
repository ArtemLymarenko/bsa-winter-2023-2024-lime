import { createAsyncThunk } from '@reduxjs/toolkit';

import { type AsyncThunkConfig } from '~/bundles/common/types/types.js';
import {
    type UserSignUpRequestDto,
    type UserSignUpResponseDto,
} from '~/bundles/users/users.js';

import { type User, name as sliceName } from './slice.js';

const signUp = createAsyncThunk<
    UserSignUpResponseDto,
    UserSignUpRequestDto,
    AsyncThunkConfig
>(`${sliceName}/sign-up`, (registerPayload, { extra }) => {
    const { authApi } = extra;

    return authApi.signUp(registerPayload);
});

const refreshUser = createAsyncThunk<User, undefined, AsyncThunkConfig>(
    `${sliceName}/refresh-user`,
    (_, { extra }) => {
        const { userApi } = extra;

        return userApi.refreshUser();
    },
);

export { refreshUser, signUp };
