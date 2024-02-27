import { type Config } from '~/common/config/config.js';
import {
    type ApiHandlerOptions,
    type ApiHandlerResponse,
    ApiHandlerResponseType,
    BaseController,
} from '~/common/controller/controller.js';
import { ApiPath } from '~/common/enums/enums.js';
import { type Logger } from '~/common/logger/logger.js';

import {
    type OAuthExchangeAuthCodeDto,
    type OAuthProvider,
    type OAuthService,
    ConnectionsOAuthActionsPath,
    ConnectionsOAuthPath,
    HttpCode,
} from '../oauth/oauth.js';
import { type UserAuthResponseDto } from '../users/users.js';
import { type ValueOf } from './types/types.js';

class OAuthController extends BaseController {
    private oAuthService: OAuthService;

    private config: Config;

    private baseUrl: string;

    public constructor(
        logger: Logger,
        oAuthService: OAuthService,
        config: Config,
    ) {
        super(logger, ApiPath.OAUTH);

        this.oAuthService = oAuthService;
        this.config = config;
        this.baseUrl = `http://${this.config.ENV.APP.HOST}:${this.config.ENV.APP.PORT}/api/v1`;

        this.addRoute({
            path: `/:provider${ConnectionsOAuthActionsPath.AUTHORIZE}`,
            method: 'GET',
            isProtected: true,
            handler: (options) =>
                this.authorize(
                    options as ApiHandlerOptions<{
                        user: UserAuthResponseDto;
                        params: { provider: ValueOf<typeof OAuthProvider> };
                    }>,
                ),
        });

        this.addRoute({
            path: '/:provider/exchange-token',
            method: 'GET',
            handler: (options) =>
                this.exchangeToken(
                    options as ApiHandlerOptions<{
                        query: OAuthExchangeAuthCodeDto;
                        params: { provider: ValueOf<typeof OAuthProvider> };
                    }>,
                ),
        });

        this.addRoute({
            path: `/:provider${ConnectionsOAuthActionsPath.DEAUTHORIZE}`,
            method: 'GET',
            isProtected: true,
            handler: (options) =>
                this.deauthorize(
                    options as ApiHandlerOptions<{
                        user: UserAuthResponseDto;
                        params: { provider: ValueOf<typeof OAuthProvider> };
                    }>,
                ),
        });
    }

    private async authorize(
        options: ApiHandlerOptions<{
            user: UserAuthResponseDto;
            params: { provider: ValueOf<typeof OAuthProvider> };
        }>,
    ): Promise<ApiHandlerResponse> {
        const { id } = options.user;
        const { provider } = options.params;
        const redirectUrl = await this.oAuthService.getAuthorizeRedirectUrl(
            provider,
            id,
        );

        return {
            type: ApiHandlerResponseType.REDIRECT,
            status: HttpCode.FOUND,
            redirectUrl: redirectUrl.href,
        };
    }

    private async exchangeToken(
        options: ApiHandlerOptions<{
            query: OAuthExchangeAuthCodeDto;
            params: { provider: ValueOf<typeof OAuthProvider> };
        }>,
    ): Promise<ApiHandlerResponse> {
        const { provider } = options.params;
        await this.oAuthService.exchangeAuthCode(provider, options.query);

        return {
            type: ApiHandlerResponseType.REDIRECT,
            status: HttpCode.FOUND,
            redirectUrl: `${this.baseUrl}${ApiPath.CONNECTIONS}${ConnectionsOAuthPath.ROOT}`,
        };
    }

    private async deauthorize(
        options: ApiHandlerOptions<{
            user: UserAuthResponseDto;
            params: { provider: ValueOf<typeof OAuthProvider> };
        }>,
    ): Promise<ApiHandlerResponse> {
        const { id } = options.user;
        const { provider } = options.params;

        await this.oAuthService.deauthorize(provider, id);

        return {
            type: ApiHandlerResponseType.REDIRECT,
            status: HttpCode.FOUND,
            redirectUrl: `${this.baseUrl}${ApiPath.CONNECTIONS}${ConnectionsOAuthPath.ROOT}`,
        };
    }
}

export { OAuthController };
