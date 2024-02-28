import { authController } from '~/bundles/auth/auth.js';
import { connectionController } from '~/bundles/connections/connections.js';
import { oAuthController } from '~/bundles/oauth/oauth.js';
import { passwordResetController } from '~/bundles/password-reset/password-reset.js';
import { userController } from '~/bundles/users/users.js';
import { workoutController } from '~/bundles/workouts/workouts.js';
import { config } from '~/common/config/config.js';
import { database } from '~/common/database/database.js';
import { logger } from '~/common/logger/logger.js';

import { BaseServerApp } from './base-server-app.js';
import { BaseServerAppApi } from './base-server-app-api.js';

const apiV1 = new BaseServerAppApi(
    'v1',
    config,
    ...authController.routes,
    ...userController.routes,
    ...workoutController.routes,
    ...connectionController.routes,
    ...oAuthController.routes,
    ...passwordResetController.routes,
);
const serverApp = new BaseServerApp({
    config,
    logger,
    database,
    apis: [apiV1],
});

export { serverApp };
export { type ServerAppRouteParameters } from './types/types.js';
