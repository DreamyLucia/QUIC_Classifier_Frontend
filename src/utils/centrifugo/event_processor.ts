import type { CentrifugeClient } from './centrifuge'; // Adjust path as needed
import type { CentrifugoMessage, CommandPayload, DataPayload, DeviceEventPayload } from '@/types/centrifugo';
import { MsgType } from '@/constants/centrifugo';
import { safeJsonStringify } from "@/utils/safeJsonStringify";

// Define the events that this processor will emit
interface CentrifugoEventProcessorEventMap {
  'dataMessage': (message: CentrifugoMessage, payload: DataPayload) => void;
  'commandMessage': (message: CentrifugoMessage, payload: CommandPayload) => void;
  'deviceEventMessage': (message: CentrifugoMessage, payload: DeviceEventPayload) => void;
  'unknownMessage': (message: CentrifugoMessage) => void;
  'parseError': (error: Error, rawData: any) => void;
}

// This helps TypeScript understand the events and their listener signatures for `on` and `emit`
declare interface CentrifugoEventProcessor {
  on<E extends keyof CentrifugoEventProcessorEventMap>(
    event: E,
    listener: CentrifugoEventProcessorEventMap[E]
  ): this;

  emit<E extends keyof CentrifugoEventProcessorEventMap>(
    event: E,
    ...args: Parameters<CentrifugoEventProcessorEventMap[E]>
  ): boolean;
}

class CentrifugoEventProcessor extends EventTarget {
  private centrifugeClient: CentrifugeClient;

  constructor(client: CentrifugeClient) {
    super();
    this.centrifugeClient = client;
    this.subscribeToPublications();
  }

  public on<E extends keyof CentrifugoEventProcessorEventMap>(event: E, listener: CentrifugoEventProcessorEventMap[E]): this {
    this.addEventListener(event, (e: Event) => {
      // @ts-expect-error 因为 CustomEvent.detail 不是严格的数组类型，但此处我们确保派发事件时 detail 一定为数组，展开参数不会出错
      listener(...((e as CustomEvent).detail));
    });
    return this;
  }

  public emit<E extends keyof CentrifugoEventProcessorEventMap>(event: E, ...args: Parameters<CentrifugoEventProcessorEventMap[E]>): boolean {
    return this.dispatchEvent(new CustomEvent(event, { detail: args }));
  }

  private subscribeToPublications(): void {
    this.centrifugeClient.on('publication', ({ channel, data, rawContext }) => {
      console.info(`[EventProcessor] Received publication on channel '${channel}'`, safeJsonStringify(data));
      const message = data as CentrifugoMessage;

      // Basic check to see if it looks like our message structure
      if (typeof message.message_type === 'undefined') {
        console.warn('[EventProcessor] Received data does not appear to be a valid CentrifugoMessage:', data);
        this.emit('parseError', new Error('Invalid message structure: missing message_type'), data);
        return;
      }

      switch (message.message_type) {
        case MsgType.DataMsg:
          if (message.data_payload) {
            this.emit('dataMessage', message, message.data_payload);
          }
          else {
            console.warn('[EventProcessor] DataMsg received without data_payload:');
            this.emit('parseError', new Error('DataMsg missing data_payload'), message);
          }
          break;
        case MsgType.CmdMsg:
          if (message.command_payload) {
            console.info(`hit command:${safeJsonStringify(message.command_payload)}`);
            this.emit('commandMessage', message, message.command_payload);
          }
          else {
            console.warn('[EventProcessor] CmdMsg received without command_payload:');
            this.emit('parseError', new Error('CmdMsg missing command_payload'), message);
          }
          break;
        case MsgType.EventMsg:
          if (message.event_payload) {
            this.emit('deviceEventMessage', message, message.event_payload);
          }
          else {
            console.warn('[EventProcessor] EventMsg received without event_payload:');
            this.emit('parseError', new Error('EventMsg missing event_payload'), message);
          }
          break;
        default:
          console.warn(`[EventProcessor] Received unknown message type: ${message.message_type}`);
          this.emit('unknownMessage', message);
          break;
      }
    });

    console.info('[EventProcessor] Subscribed to CentrifugeClient publications.', 'CentrifugoEventProcessor.constructor');
  }

  // You can add a public method to stop listening if needed, e.g., during cleanup
  public cleanup(): void {
    // 由于 EventTarget 的限制，我们通过断开连接来清理所有监听器
    if (this.centrifugeClient) {
      // 断开连接会自动清理所有监听器
      this.centrifugeClient.disconnect();
    }

    console.info('[EventProcessor] Cleaned up.', 'CentrifugoEventProcessor.cleanup');
  }
}

export { CentrifugoEventProcessor };
