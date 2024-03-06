import fastifyPlugin from 'fastify-plugin';
import { type Server as SocketServer } from 'socket.io';

import { PluginName } from '~/common/enums/enums.js';

type Options = {
    io: SocketServer;
};

const socketInjectorPlugin = fastifyPlugin<Options>(
    (fastify, { io }, done) => {
        fastify.decorateRequest('io', null);
        // eslint-disable-next-line @typescript-eslint/require-await
        fastify.addHook('preHandler', async (request) => {
            request.io = io;
        });
        done();
    },
    { name: PluginName.SOCKET_INJECTOR },
);

export { socketInjectorPlugin };
