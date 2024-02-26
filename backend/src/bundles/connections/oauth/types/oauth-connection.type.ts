import { type Providers } from '../enums/enums.js';
import { type ValueOf } from './types.js';

type OAuthConnection = {
    id: number;
    userId: number;
    tokenType: string;
    expiresIn: number;
    expiresAt: number;
    refreshToken: string;
    accessToken: string;
    scope: string;
    provider: ValueOf<typeof Providers>;
};

export { type OAuthConnection };
