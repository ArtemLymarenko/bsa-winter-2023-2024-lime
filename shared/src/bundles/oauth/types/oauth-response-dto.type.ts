import { type ValueOf } from '../../../types/types.js';
import { type OAuthProvider } from '../enums/enums.js';

type OAuthResponseDto = {
    id: number;
    userId: number;
    ownerId?: number;
    tokenType: string;
    expiresAt: number;
    accessToken: string;
    refreshToken: string;
    scope: string;
    provider: ValueOf<typeof OAuthProvider>;
};

export { type OAuthResponseDto };
