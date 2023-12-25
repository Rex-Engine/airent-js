import {
  AsyncLock,
  BaseEntity,
  EntityConstructor,
  LoadConfig,
  LoadKey,
  toArrayMap,
  toObjectMap,
} from '../../src';

/** generated */
import {
  ChatFieldRequest,
  ChatResponse,
  ChatModel,
} from './chat-type.js';

/** associations */
import { MessageEntity } from '../message.js';
import { ChatUserEntity } from '../chat-user.js';

export class ChatEntityBase extends BaseEntity<
  ChatModel, ChatFieldRequest, ChatResponse
> {
  public id: string;
  public createdAt: Date;
  public updatedAt: Date;
  public deletedAt: Date | null;

  /** @deprecated */
  protected chatUsers?: ChatUserEntity[];

  protected messages?: MessageEntity[];

  public constructor(
    model: ChatModel,
    group: ChatEntityBase[],
    lock: AsyncLock,
  ) {
    super(group, lock);

    this.id = model.id;
    this.createdAt = model.createdAt;
    this.updatedAt = model.updatedAt;
    this.deletedAt = model.deletedAt;

    this.initialize();
  }

  public async present(fieldRequest: ChatFieldRequest): Promise<ChatResponse> {
    return {
      id: fieldRequest.id === undefined ? undefined : this.id,
      createdAt: fieldRequest.createdAt === undefined ? undefined : this.createdAt,
      updatedAt: fieldRequest.updatedAt === undefined ? undefined : this.updatedAt,
      deletedAt: fieldRequest.deletedAt === undefined ? undefined : this.deletedAt,
      chatUsers: fieldRequest.chatUsers === undefined ? undefined : await this.getChatUsers().then((a) => Promise.all(a.map((one) => one.present(fieldRequest.chatUsers!)))),
      messages: fieldRequest.messages === undefined ? undefined : await this.getMessages().then((a) => Promise.all(a.map((one) => one.present(fieldRequest.messages!)))),
    };
  }

  /** self loaders */

  public static async getOne<ENTITY extends ChatEntityBase>(
    this: EntityConstructor<ChatModel, ENTITY>,
    key: LoadKey
  ): Promise<ENTITY | null> {
    return await (this as any)
      .getMany([key])
      .then((array: ENTITY[]) => array.at(0) ?? null);
  }

  public static async getMany<ENTITY extends ChatEntityBase>(
    this: EntityConstructor<ChatModel, ENTITY>,
    keys: LoadKey[]
  ): Promise<ENTITY[]> {
    const models = [/* TODO: load models for ChatEntity */];
    return (this as any).fromArray(models);
  }

  /** associations */

  /** @deprecated */
  protected chatUsersLoadConfig: LoadConfig<ChatEntityBase, ChatUserEntity> = {
    name: 'ChatEntity.chatUsers',
    filter: (one: ChatEntityBase) => one.chatUsers === undefined,
    getter: (sources: ChatEntityBase[]) => {
      return sources
        .map((one) => ({
          chatId: one.id,
        }));
    },
    // TODO: build your association data loader
    // loader: async (keys: LoadKey[]) => {
    //   const models = [/* TODO: load ChatUserEntity models */];
    //   return ChatUserEntity.fromArray(models);
    // },
    setter: (sources: ChatEntityBase[], targets: ChatUserEntity[]) => {
      const map = toArrayMap(targets, (one) => `${one.chatId}`, (one) => one);
      sources.forEach((one) => (one.chatUsers = map.get(`${one.id}`) ?? []));
    },
  };

  /** @deprecated */
  public async getChatUsers(): Promise<ChatUserEntity[]> {
    if (this.chatUsers !== undefined) {
      return this.chatUsers;
    }
    await this.load(this.chatUsersLoadConfig);
    return this.chatUsers!;
  }

  /** @deprecated */
  public setChatUsers(chatUsers?: ChatUserEntity[]): void {
    this.chatUsers = chatUsers;
  }

  protected messagesLoadConfig: LoadConfig<ChatEntityBase, MessageEntity> = {
    name: 'ChatEntity.messages',
    filter: (one: ChatEntityBase) => one.messages === undefined,
    getter: (sources: ChatEntityBase[]) => {
      return sources
        .map((one) => ({
          chatId: one.id,
        }));
    },
    // TODO: build your association data loader
    // loader: async (keys: LoadKey[]) => {
    //   const models = [/* TODO: load MessageEntity models */];
    //   return MessageEntity.fromArray(models);
    // },
    setter: (sources: ChatEntityBase[], targets: MessageEntity[]) => {
      const map = toArrayMap(targets, (one) => `${one.chatId}`, (one) => one);
      sources.forEach((one) => (one.messages = map.get(`${one.id}`) ?? []));
    },
  };

  public async getMessages(): Promise<MessageEntity[]> {
    if (this.messages !== undefined) {
      return this.messages;
    }
    await this.load(this.messagesLoadConfig);
    return this.messages!;
  }

  public setMessages(messages?: MessageEntity[]): void {
    this.messages = messages;
  }
}
