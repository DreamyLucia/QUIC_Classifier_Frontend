// Example usage (e.g., in main.ts or a service that manages Centrifugo)

import type { CentrifugoEventProcessor } from './event_processor'; // Adjust path
import { DeviceEventType } from '@/constants/centrifugo';
import type {
  CentrifugoMessage,
  CommandPayload,
  DataPayload,
  DeviceEventPayload,
} from '@/types/centrifugo';
import { EventBus } from '@/utils/eventBus'

export async function initializeAndListen(eventProcessor: CentrifugoEventProcessor) {
  eventProcessor.on('dataMessage', (message: CentrifugoMessage, payload: DataPayload) => {
    console.info('[AppLogic] Received Data Message:', 'main', { id: message.id, payload });
    EventBus.dispatchEvent(new CustomEvent('data-message', { detail: payload }));
  });

  eventProcessor.on('commandMessage', async (message: CentrifugoMessage, payload: CommandPayload) => {
    console.info('[AppLogic] Received Command Message:', 'main', { id: message.id, payload });
    switch (payload.type) {
      default:
        console.warn(`[AppLogic] Unknown command type: ${payload.type}`, 'main');
    }
  });

  eventProcessor.on('deviceEventMessage', async (message: CentrifugoMessage, payload: DeviceEventPayload) => {
    console.info('[AppLogic] Received Device Event Message:', 'main', { id: message.id, payload });
    switch (payload.event_type) {
      case DeviceEventType.DeviceLeaveChannel:
        console.info(`[AppLogic] Device ${payload.device_leave?.source_device_typ} left channel.`, 'main');
        EventBus.dispatchEvent(new CustomEvent("device-leave-channel", { detail: payload }));
        break;
      case DeviceEventType.AckDevicePair:
        console.info(`[AppLogic] Received ACK for device pair. AckNum: ${payload.ack_pair?.interview_client_id}`, 'main');
        EventBus.dispatchEvent(new CustomEvent("ack-device-pair", { detail: payload }))
        break;
      case DeviceEventType.InsufficientPoints:
        console.info(`[AppLogic] Insufficient points.`)
        EventBus.dispatchEvent(new CustomEvent("insufficient-points", { detail: payload }));
        break;
      default:
        console.warn(`[AppLogic] Unknown device event type: ${payload.event_type}`, 'main');
    }
  });

  eventProcessor.on('unknownMessage', (message: CentrifugoMessage) => {
    console.warn('[AppLogic] Received message with unknown type from processor:', 'main', { message });
  });

  eventProcessor.on('parseError', (error: Error, rawData: any) => {
    console.error('[AppLogic] Error parsing message in processor:', 'main', error.message);
  });

  console.info('Event listeners are set up. Waiting for messages...', 'main');
}
