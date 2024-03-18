import {
    type ChatFullResponseDto,
    type ChatGetAllItemsResponseDto,
} from '~/bundles/chats/types/types.js';
import { ApiPath, ContentType } from '~/bundles/common/enums/enums.js';
import { type Http } from '~/framework/http/http.js';
import { BaseHttpApi } from '~/framework/http-api/http-api.js';
import { type Storage } from '~/framework/storage/storage.js';

type Constructor = {
    baseUrl: string;
    http: Http;
    storage: Storage;
};

class ChatsApi extends BaseHttpApi {
    public constructor({ baseUrl, http, storage }: Constructor) {
        super({ path: ApiPath.CHATS, baseUrl, http, storage });
    }

    public async getAllChats(): Promise<ChatGetAllItemsResponseDto> {
        const response = await this.load(this.getFullEndpoint('/', {}), {
            method: 'GET',
            contentType: ContentType.JSON,
            hasAuth: true,
        });

        return await response.json<ChatGetAllItemsResponseDto>();
    }

    public async getChat(chatId: string): Promise<ChatFullResponseDto> {
        const response = await this.load(
            this.getFullEndpoint('/:id', { id: chatId }),
            {
                method: 'GET',
                contentType: ContentType.JSON,
                hasAuth: true,
            },
        );
        return await response.json<ChatFullResponseDto>();
    }
}

export { ChatsApi };
