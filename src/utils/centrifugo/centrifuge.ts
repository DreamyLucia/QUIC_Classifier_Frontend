// centrifuge-client.ts
import { Centrifuge, State as CentrifugeConnectionState } from 'centrifuge';
import type {
  ErrorContext as CentrifugeErrorContext,
  ConnectedContext,
  ConnectingContext,
  ConnectionTokenContext,
  DisconnectedContext,
  Options,
  PublicationContext,
  StateContext,
  SubscribedContext,
  SubscribingContext,
  Subscription,
  SubscriptionErrorContext,
  SubscriptionOptions,
  SubscriptionTokenContext,
  UnsubscribedContext,
} from 'centrifuge';
import { getRefreshTokenApi } from '@/api/centrifugo'
import type { RefreshToken } from '@/types/devicePair';

export interface CentrifugeClientConfig {
  isTestEnv: boolean;
  initialConnectionToken: string;
  initialSubscribeToken?: string; // Optional initial token for a default channel
  centrifugeOptions?: Partial<Omit<Options, 'token' | 'getToken'>>;
  refreshTokenParams: RefreshToken;
}

interface CentrifugeClientEventMap {
  connecting: (ctx: ConnectingContext) => void;
  connected: (ctx: ConnectedContext) => void;
  disconnected: (ctx: DisconnectedContext) => void;
  publication: (payload: { channel: string; data: any; rawContext: PublicationContext }) => void; // data 可以用我们之前定义的 ServerMessageType
  subscribing: (payload: { channel: string; context: SubscribingContext }) => void;
  subscribed: (payload: { channel: string; context: SubscribedContext }) => void;
  unsubscribed: (payload: { channel: string; context: UnsubscribedContext }) => void;
  error: (payload: {
    type: 'connection' | 'subscription' | 'publish';
    channel?: string;
    context: CentrifugeErrorContext | SubscriptionErrorContext | any;
    data?: any
  }) => void;
  published: (payload: { channel: string; data: any; context: any }) => void; // publish 的 context 类型可能比较通用
}

// 声明 CentrifugeClient 类继承自 EventTarget，并使用我们的事件映射进行类型化
// 这使得 this.emit 和 this.on 方法具有类型检查
declare interface CentrifugeClient {
  on<E extends keyof CentrifugeClientEventMap>(event: E, listener: CentrifugeClientEventMap[E]): this;

  once<E extends keyof CentrifugeClientEventMap>(event: E, listener: CentrifugeClientEventMap[E]): this;

  emit<E extends keyof CentrifugeClientEventMap>(event: E, ...args: Parameters<CentrifugeClientEventMap[E]>): boolean;
}

const wsLocalhost = `ws://localhost:8000/connection/websocket`
const userId = import.meta.env.VITE_USER_ID

/**
 * @class CentrifugeClient
 * @extends EventTarget
 * @description 一个封装了 Centrifuge JS 客户端的类，方便在 Electron 主进程中使用。
 * 它继承自 EventTarget，允许我们发出自定义事件。
 */
class CentrifugeClient extends EventTarget {
  // notice: Static instance for Singleton
  private static instance: CentrifugeClient | null = null;

  // --- 成员变量类型定义 ---
  private wsURL!: string; // notice: Marked as definite assignment if initialized in a private init
  private initialConnectionToken!: string; // notice: Renamed from connectionToken
  private centrifuge: Centrifuge | null = null;
  private subscriptions: Record<string, Subscription> = {};
  // private screenshotInProgress = false; // Assuming this was moved to ScreenshotService
  private currentState: CentrifugeConnectionState = CentrifugeConnectionState.Disconnected;
  // private readonly refreshTokenUrl = 'http://localhost:8080/refresh_token'; // This should be in RefreshTokenService or configurable
  private initialSubscribeToken?: string; // notice: Made optional, for a default/main channel if any
  private centrifugeOptions?: Partial<Omit<Options, 'token' | 'getToken'>>;
  private clientId: string | null = null;
  private refreshTokenParams!: RefreshToken;

  // notice: Constructor is now private
  private constructor() {
    super();
  }

  public on<E extends keyof CentrifugeClientEventMap>(event: E, listener: CentrifugeClientEventMap[E]): this {
    this.addEventListener(event, (e: Event) => {
      // @ts-expect-error 因为 CustomEvent.detail 不是严格的数组类型，但此处我们确保派发事件时 detail 一定为数组，展开参数不会出错
      listener(...((e as CustomEvent).detail));
    });
    return this;
  }

  public emit<E extends keyof CentrifugeClientEventMap>(event: E, ...args: Parameters<CentrifugeClientEventMap[E]>): boolean {
    return this.dispatchEvent(new CustomEvent(event, { detail: args }));
  }

  public once<E extends keyof CentrifugeClientEventMap>(event: E, listener: CentrifugeClientEventMap[E]): this {
    const handler = (e: Event) => {
      // @ts-expect-error 因为 CustomEvent.detail 不是严格的数组类型，但此处我们确保派发事件时 detail 一定为数组，展开参数不会出错
      listener(...((e as CustomEvent).detail));
      this.removeEventListener(event, handler);
    }
    this.addEventListener(event, handler);
    return this;
  }

  /**
     * notice: Static method to get the singleton instance.
     * Configuration should be done once via initialize.
     */
  public static getInstance(): CentrifugeClient {
    if (!CentrifugeClient.instance) {
      // notice: Throw error if not initialized, or auto-initialize with defaults (less flexible)
      // Forcing initialization first is safer.
      throw new Error("CentrifugeClient has not been initialized. Call initialize() first.");
    }
    return CentrifugeClient.instance;
  }

  /**
     * notice: Initialization method for the singleton.
     * This should be called once at application startup.
     */
  public static initialize(config: CentrifugeClientConfig): CentrifugeClient {
    if (CentrifugeClient.instance) {
      console.warn("CentrifugeClient already initialized. Returning existing instance.", 'CentrifugeClient.initialize');
      return CentrifugeClient.instance;
    }
    const client = new CentrifugeClient();
    client.wsURL = wsLocalhost;

    client.initialConnectionToken = config.initialConnectionToken;
    client.initialSubscribeToken = config.initialSubscribeToken;
    client.centrifugeOptions = config.centrifugeOptions;
    client.refreshTokenParams = config.refreshTokenParams;

    CentrifugeClient.instance = client;
    console.info("CentrifugeClient initialized successfully.", 'CentrifugeClient.initialize');
    return client;
  }

  /**
     * 初始化并连接到 Centrifuge 服务器。
     * @returns {Promise<ConnectedContext>} 当连接成功建立时 resolve (携带连接上下文)，如果连接失败则 reject。
     */
  public async connect(): Promise<ConnectedContext> {
    if (this.centrifuge)
      await this.disconnect();

    // notice: 在尝试连接之前，将状态设置为 'connecting'
    this.currentState = CentrifugeConnectionState.Connecting;
    console.info(`准备连接到: ${this.wsURL}`, 'CentrifugeClient.connect');

    const centrifugeConfig: Partial<Options> = {
      token: this.initialConnectionToken,
      getToken: this.refreshConnectionToken,
    };
    this.centrifuge = new Centrifuge(this.wsURL, centrifugeConfig);

    this.centrifuge.on('state', (ctx: StateContext) => {
      console.info(`[Centrifuge Event] 连接状态改变: ${ctx.oldState} -> ${ctx.newState}`, 'CentrifugeClient.onState');
      this.currentState = ctx.newState;
    });

    // --- 设置 Centrifuge 连接级别的事件监听器 ---
    this.centrifuge.on('connecting', (ctx: ConnectingContext) => {
      console.info(`正在连接... Code: ${ctx.code}, Reason: ${ctx.reason}`, 'CentrifugeClient.connecting');
      this.emit('connecting', ctx);
    });

    this.centrifuge.on('connected', (ctx: ConnectedContext) => {
      console.info(`已连接! Transport: ${ctx.transport}`, 'CentrifugeClient.connected');
      this.clientId = ctx.client;
      this.emit('connected', ctx);
    });

    this.centrifuge.on('disconnected', (ctx: DisconnectedContext) => {
      console.info(`已断开连接. Code: ${ctx.code}, Reason: ${ctx.reason}`, 'CentrifugeClient.disconnected');
      this.emit('disconnected', ctx);
    });

    this.centrifuge.on('error', (errCtx: CentrifugeErrorContext) => {
      console.error('连接错误:', errCtx, 'CentrifugeClient.error');
      this.emit('error', { type: 'connection', context: errCtx });
    });

    return new Promise<ConnectedContext>((resolve, reject) => {
      // 确保 this 上下文正确
      const onConnected = (ctx: ConnectedContext) => {
        if (this.centrifuge) { // 确保 centrifuge 实例仍然存在
          /* eslint-disable @typescript-eslint/no-use-before-define */
          this.centrifuge.removeListener('error', onError);
        }
        resolve(ctx);
      };
      const onError = (errCtx: CentrifugeErrorContext) => {
        if (this.centrifuge) {
          // 移除某个特定事件的回调；这是为了防止事件回调被多次调用，保证“只会有一个结果”（要么 resolve，要么 reject），避免资源泄露或重复处理。

          this.centrifuge.removeListener('connected', onConnected);
        }
        reject(errCtx);
      };

      if (!this.centrifuge) { // 防御性检查
        this.currentState = CentrifugeConnectionState.Disconnected;
        return reject(new Error("Centrifuge instance was unexpectedly null before connect call."));
      }
      // 只执行一次
      this.centrifuge.once('connected', onConnected);
      this.centrifuge.once('error', onError);

      try {
        this.centrifuge.connect();
      }
      catch (error: any) { // 明确 error 类型为 any 或 unknown
        console.error('调用 connect() 时发生同步错误:', error, 'CentrifugeClient.connect');
        if (this.centrifuge) {
          // 为什么这里已经使用removeListen函数 后面还要传入onConnected，函数内部又执行了一遍removeListener
          this.centrifuge.removeListener('connected', onConnected);
          this.centrifuge.removeListener('error', onError);
        }
        reject(error);
      }
    });
  }

  /**
     * 断开与 Centrifuge 服务器的连接。
     * @returns {Promise<void>}
     */
  public async disconnect(): Promise<void> {
    const oldState = this.currentState;
    if (this.centrifuge) {
      console.info('主动断开连接...', 'CentrifugeClient.disconnect');

      // Centrifuge 的 disconnect 方法本身是同步的，不返回 Promise。
      // 如果未来它变为异步，这里需要 await。
      this.centrifuge.disconnect();
      this.centrifuge = null;
      console.info('已断开并清理资源。', 'CentrifugeClient.disconnect');
    }
    // Ensure state is updated even if events were missed or instance was already null
    if (this.currentState !== CentrifugeConnectionState.Disconnected) {
      this.currentState = CentrifugeConnectionState.Disconnected;
      console.warn(`Manually set state to Disconnected in disconnect(), previous: ${oldState}`, 'CentrifugeClient.disconnect');
      // If the state truly changed here and not through an event from a live centrifuge instance
      if (oldState !== this.currentState)
        this.emit('disconnected', { code: 0, reason: 'Client invoked disconnect' });
    }

    // 清理单例实例
    CentrifugeClient.instance = null;

    return Promise.resolve();
  }

  /**
     * 检查客户端当前是否已连接。
     * @returns {boolean} 如果已连接则为 true，否则为 false。
     */
  public isConnected(): boolean {
    return this.currentState === CentrifugeConnectionState.Connected;
  }

  public getCurrentState(): CentrifugeConnectionState {
    return this.currentState;
  }

  public getChannelName(): string {
    return `copilot:${userId}`;
  }

  public getClientId(): string | null {
    return this.clientId;
  }

  public subscribeToChannel(
    subscriptionToken?: string,
    options?: Omit<SubscriptionOptions, 'token' | 'getToken'>,
  ): Promise<SubscribedContext> { // 通常返回 SubscribedContext 表示订阅成功
    if (!this.centrifuge) {
      const msg = "nil centrifugo client";
      console.error(msg, undefined, 'CentrifugeClient.subscribeToChannel');
      return Promise.reject(new Error("Centrifuge client not initialized."));
    }
    if (this.currentState !== CentrifugeConnectionState.Connected) {
      const msg = `Client not connected. Current state: ${this.currentState}`;
      console.error(msg, undefined, 'CentrifugeFClient.subscribeToChannel');
      return Promise.reject(new Error(msg));
    }
    const channelName = this.getChannelName()
    const subOptions: Partial<SubscriptionOptions> = {
      ...options,
      ...(subscriptionToken && { token: subscriptionToken }),
      token: subscriptionToken,
      getToken: this.refreshSubscriptionToken,
    };
    const sub: Subscription = this.centrifuge.newSubscription(channelName, subOptions);

    // --- 为这个特定的 Subscription 对象设置事件监听器 ---
    sub.on('subscribing', (ctx: SubscribingContext) => {
      console.info(`正在订阅频道 [${channelName}]...`, 'CentrifugeClient.subscribing', ctx);
      // 发射给 CentrifugeClient 的外部监听者
      this.emit('subscribing', { channel: channelName, context: ctx });
    });

    sub.on('subscribed', (ctx: SubscribedContext) => {
      console.info(`成功订阅频道 [${channelName}]!`, 'CentrifugeClient.subscribed', ctx);
      this.subscriptions[channelName] = sub;
      // 发射给 CentrifugeClient 的外部监听者
      this.emit('subscribed', { channel: channelName, context: ctx });
    });

    sub.on('unsubscribed', (ctx: UnsubscribedContext) => {
      console.info(`已取消订阅频道 [${channelName}].`, 'CentrifugeClient.unsubscribed', ctx);
      delete this.subscriptions[channelName];
      // 发射给 CentrifugeClient 的外部监听者
      this.emit('unsubscribed', { channel: channelName, context: ctx });
    });

    sub.on('error', (errCtx: SubscriptionErrorContext) => {
      console.error(`频道 [${channelName}] 订阅错误:`, errCtx, 'CentrifugeClient.subscriptionError');
      // 发射给 CentrifugeClient 的外部监听者
      this.emit('error', { type: 'subscription', channel: channelName, context: errCtx });
    });

    // **核心：处理从这个特定频道接收到的原始消息**
    sub.on('publication', (ctx: PublicationContext) => {
      console.info(`频道 [${channelName}] 收到原始消息:`, 'CentrifugeClient.rawPublication', ctx.data);
      // 这里直接把消息发出，在外面有个截图处理器来监听消息
      this.emit('publication', { // 这个 'publication' 是我们自定义的 CentrifugeClient 事件
        channel: channelName,
        data: ctx.data, // 可以是原始的 ctx.data，也可以是处理/验证后的 message
        rawContext: ctx,
      });
    });

    // 返回 Promise，并在其中调用 sub.subscribe()
    return new Promise<SubscribedContext>((resolve, reject) => {
      // 监听 'subscribed' 事件来 resolve Promise
      sub.once('subscribed', (subscribedCtx: SubscribedContext) => {
        resolve(subscribedCtx);
      });
      // 监听 'error' 事件来 reject Promise (针对订阅过程中的错误)
      sub.once('error', (errorCtx: SubscriptionErrorContext) => {
        reject(errorCtx);
      });
      try {
        sub.subscribe(); // 发起订阅请求
      }
      catch (error: any) {
        console.error(`调用 sub.subscribe() 时发生同步错误 (频道: ${channelName}):`, error, 'CentrifugeClient.subscribeToChannel');
        reject(error);
      }
    });
  }

  // notice: getToken 回调
  private refreshConnectionToken = async (ctx: ConnectionTokenContext): Promise<string> => {
    console.info('尝试刷新主连接 token...', 'CentrifugeClient.refreshConnectionToken', ctx);
    try {
      const result = await getRefreshTokenApi(this.refreshTokenParams)
      return await result.connect_channel;
    }
    catch (error: any) {
      console.error('刷新主连接 token 失败:', error, 'CentrifugeClient.refreshConnectionToken');
      throw error; // 重新抛出，让 Centrifuge 处理
    }
  };

  private refreshSubscriptionToken = async (ctx: SubscriptionTokenContext): Promise<string> => {
    console.info(`尝试刷新频道token...`, 'CentrifugeClient.refreshSubscriptionToken', ctx);
    try {
      const result = await getRefreshTokenApi(this.refreshTokenParams)
      return await result.subscribe_channel;
    }
    catch (error: any) {
      console.error(`刷新频道token 失败:`, error, 'CentrifugeClient.refreshSubscriptionToken');
      throw error; // 重新抛出
    }
  };
}

export { CentrifugeClient }; // 使用 ES6 模块导出
