import axios from 'axios';

import {
    type OAuthClient,
    ConnectionsOAuthActionsPath,
    ConnectionsOAuthPath,
    HttpCode,
} from '~/bundles/connections/oauth/oauth.js';
import { type UserAuthResponseDto } from '~/bundles/users/users.js';
import {
    type ApiHandlerOptions,
    type ApiHandlerResponse,
    ApiHandlerResponseType,
    BaseController,
} from '~/common/controller/controller.js';
import { ApiPath } from '~/common/enums/enums.js';
import { type Logger } from '~/common/logger/logger.js';

import { StravaPaths } from './enums/enums.js';
import { type StravaService } from './strava.service.js';
import { type StravaOAuthQuery } from './types/types.js';

class StravaController extends BaseController {
    private stravaService: StravaService;

    private clientConfig: OAuthClient;

    public constructor(
        logger: Logger,
        stravaService: StravaService,
        clientConfig: OAuthClient,
    ) {
        super(logger, ApiPath.CONNECTIONS);

        this.stravaService = stravaService;
        this.clientConfig = clientConfig;

        this.addRoute({
            path: ConnectionsOAuthPath.ROOT,
            method: 'GET',
            isProtected: true,
            handler: (options) =>
                this.getUserConnections(
                    options as ApiHandlerOptions<{
                        user: UserAuthResponseDto;
                    }>,
                ),
        });

        this.addRoute({
            path: `${ConnectionsOAuthPath.STRAVA}${ConnectionsOAuthActionsPath.AUTHORIZE}`,
            method: 'GET',
            isProtected: true,
            handler: () => this.authorize(),
        });

        this.addRoute({
            path: `${ConnectionsOAuthPath.STRAVA}${StravaPaths.REDIRECT_URI}`,
            method: 'GET',
            isProtected: true,
            handler: (options) =>
                this.exchangeToken(
                    options as ApiHandlerOptions<{
                        query: StravaOAuthQuery;
                        user: UserAuthResponseDto;
                    }>,
                ),
        });

        this.addRoute({
            path: `${ConnectionsOAuthPath.STRAVA}${ConnectionsOAuthActionsPath.DEAUTHORIZE}`,
            method: 'GET',
            isProtected: true,
            handler: (options) =>
                this.deauthorize(
                    options as ApiHandlerOptions<{
                        user: UserAuthResponseDto;
                    }>,
                ),
        });
    }

    private async getUserConnections(
        options: ApiHandlerOptions<{
            user: UserAuthResponseDto;
        }>,
    ): Promise<ApiHandlerResponse> {
        return {
            type: ApiHandlerResponseType.DATA,
            status: HttpCode.OK,
            payload: await this.stravaService.findMany({
                userId: options.user.id,
            }),
        };
    }

    private authorize(): ApiHandlerResponse {
        return {
            type: ApiHandlerResponseType.REDIRECT,
            status: HttpCode.FOUND,
            redirectUrl: `${StravaPaths.AUTHORIZE}?client_id=${this.clientConfig.CLIENT_ID}&response_type=code&redirect_uri=http://localhost:3001/api/v1${ApiPath.CONNECTIONS}${ConnectionsOAuthPath.STRAVA}${StravaPaths.REDIRECT_URI}&approval_prompt=force&scope=read,activity:read_all`,
        };
    }

    private async exchangeToken(
        options: ApiHandlerOptions<{
            query: StravaOAuthQuery;
            user: UserAuthResponseDto;
        }>,
    ): Promise<ApiHandlerResponse> {
        const { code, scope } = options.query;
        const { id } = options.user;

        const config = {
            client_id: this.clientConfig.CLIENT_ID,
            client_secret: this.clientConfig.CLIENT_SECRET,
            code,
            grant_type: 'authorization_code',
        };

        const oAuthResponse = await axios.post(
            StravaPaths.TOKEN_EXCHANGE,
            config,
        );

        const payload = {
            tokenType: oAuthResponse.data.token_type,
            expiresIn: oAuthResponse.data.expires_in,
            expiresAt: oAuthResponse.data.expires_at,
            refreshToken: oAuthResponse.data.refresh_token,
            accessToken: oAuthResponse.data.access_token,
            scope,
        };

        await this.stravaService.create({
            ...payload,
            userId: id,
        });

        return {
            type: ApiHandlerResponseType.REDIRECT,
            status: HttpCode.FOUND,
            redirectUrl: 'http://localhost:3001/api/v1/connections/',
        };
    }

    private async deauthorize(
        options: ApiHandlerOptions<{
            user: UserAuthResponseDto;
        }>,
    ): Promise<ApiHandlerResponse> {
        const { id } = options.user;

        await this.stravaService.delete({ userId: id });

        return {
            type: ApiHandlerResponseType.REDIRECT,
            status: HttpCode.FOUND,
            redirectUrl: 'http://localhost:3001/api/v1/connections/',
        };
    }
}

export { StravaController };
