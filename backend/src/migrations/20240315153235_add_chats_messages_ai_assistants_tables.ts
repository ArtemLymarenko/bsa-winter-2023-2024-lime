import { type Knex } from 'knex';

const CHATS_TABLE_NAME = 'chats';
const ChatsColumnName = {
    ID: 'id',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at',
};

const MESSAGES_TABLE_NAME = 'messages';
const MessagesColumnName = {
    ID: 'id',
    CHAT_ID: 'chatId',
    SENDER_ID: 'senderId',
    TEXT: 'text',
    IS_SEEN: 'isSeen',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at',
};

const AI_ASSISTANTS_TABLE_NAME = 'ai_assistants';
const AiAssistantsColumnName = {
    ID: 'id',
    USER_ID: 'userId',
    CHAT_ID: 'chatId',
    THREAD_ID: 'threadId',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at',
};

const CHATS_USERS_TABLE_NAME = 'chats_users';
const ChatsUsersColumnName = {
    ID: 'id',
    CHAT_ID: 'chatId',
    USER_ID: 'userId',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at',
};

const USERS_TABLE_NAME = 'users';

async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable(CHATS_TABLE_NAME, (table) => {
        table.increments(ChatsColumnName.ID).primary();
        table
            .dateTime(ChatsColumnName.CREATED_AT)
            .notNullable()
            .defaultTo(knex.fn.now());
        table
            .dateTime(ChatsColumnName.UPDATED_AT)
            .notNullable()
            .defaultTo(knex.fn.now());
    });

    await knex.schema.createTable(MESSAGES_TABLE_NAME, (table) => {
        table.increments(MessagesColumnName.ID).primary();
        table
            .integer(MessagesColumnName.CHAT_ID)
            .unsigned()
            .unique()
            .notNullable()
            .references(MessagesColumnName.ID)
            .inTable(CHATS_TABLE_NAME)
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
        table
            .integer(MessagesColumnName.SENDER_ID)
            .unsigned()
            .unique()
            .notNullable()
            .references(MessagesColumnName.ID)
            .inTable(USERS_TABLE_NAME)
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
        table.string(MessagesColumnName.TEXT).notNullable();
        table.boolean(MessagesColumnName.IS_SEEN).notNullable();
        table
            .dateTime(MessagesColumnName.CREATED_AT)
            .notNullable()
            .defaultTo(knex.fn.now());
        table
            .dateTime(MessagesColumnName.UPDATED_AT)
            .notNullable()
            .defaultTo(knex.fn.now());
    });

    await knex.schema.createTable(AI_ASSISTANTS_TABLE_NAME, (table) => {
        table.increments(AiAssistantsColumnName.ID).primary();
        table
            .integer(AiAssistantsColumnName.CHAT_ID)
            .unsigned()
            .unique()
            .notNullable()
            .references(AiAssistantsColumnName.ID)
            .inTable(CHATS_TABLE_NAME)
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
        table
            .integer(AiAssistantsColumnName.USER_ID)
            .unsigned()
            .unique()
            .notNullable()
            .references(AiAssistantsColumnName.ID)
            .inTable(USERS_TABLE_NAME)
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
        table.string(AiAssistantsColumnName.THREAD_ID).nullable();
        table
            .dateTime(AiAssistantsColumnName.CREATED_AT)
            .notNullable()
            .defaultTo(knex.fn.now());
        table
            .dateTime(AiAssistantsColumnName.UPDATED_AT)
            .notNullable()
            .defaultTo(knex.fn.now());
    });

    await knex.schema.createTable(CHATS_USERS_TABLE_NAME, (table) => {
        table.increments(ChatsUsersColumnName.ID).primary();
        table
            .integer(ChatsUsersColumnName.CHAT_ID)
            .unsigned()
            .unique()
            .notNullable()
            .references(ChatsUsersColumnName.ID)
            .inTable(CHATS_TABLE_NAME)
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
        table
            .integer(ChatsUsersColumnName.USER_ID)
            .unsigned()
            .unique()
            .notNullable()
            .references(ChatsUsersColumnName.ID)
            .inTable(USERS_TABLE_NAME)
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
        table
            .dateTime(ChatsUsersColumnName.CREATED_AT)
            .notNullable()
            .defaultTo(knex.fn.now());
        table
            .dateTime(ChatsUsersColumnName.UPDATED_AT)
            .notNullable()
            .defaultTo(knex.fn.now());
    });
}

async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists(AI_ASSISTANTS_TABLE_NAME);

    await knex.schema.dropTableIfExists(MESSAGES_TABLE_NAME);

    await knex.schema.dropTableIfExists(CHATS_USERS_TABLE_NAME);

    await knex.schema.dropTableIfExists(CHATS_TABLE_NAME);
}

export { down, up };
