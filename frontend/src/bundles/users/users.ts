import { config } from '~/framework/config/config.js';
import { http } from '~/framework/http/http.js';
import { storage } from '~/framework/storage/storage.js';

import { UserApi } from './users-api.js';

const userApi = new UserApi({
    baseUrl: config.ENV.API.ORIGIN_URL,
    storage,
    http,
});

export { userApi };
export {
    type UserGetAllItemResponseDto,
    type UserGetAllResponseDto,
    type UserSignUpRequestDto,
    type UserSignUpResponseDto,
    type UserUpdateProfileRequestDto,
} from './types/types.js';
export {
    userSignUpValidationSchema,
    userUpdateProfileValidationSchema,
} from './validation-schemas/validation-schemas.js';
