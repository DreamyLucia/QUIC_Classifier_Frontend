import type {
  CommandType,
  DataType,
  DeviceEventType,
  DeviceType,
  MsgType,
} from "@/constants/centrifugo";

export interface CommandPayload {
  type: CommandType;
}

// Corresponds to Go's centrifugo.Data
export interface DataPayload {
  data_type: DataType;
  source_command_id: string;
  image_urls: string[];
  text: string;
}

// Corresponds to Go's centrifugo_model.DevicePresenceParam
export interface DeviceLeaveParam {
  source_device_typ: DeviceType;
  cilent_id: string;
}

// Corresponds to Go's centrifugo_model.SuccessMobileScanParam
export interface SuccessMobileScanParam {
  session_id: string;
}

export interface AckDevicePairParam {
  copilot_client_id: string,
  interview_client_id: string,
  is_ready: boolean,
  fail_reason: string
}

export interface InsufficientPointParam {
  interview_client_id: string,
  copilot_client_id: string,
  channel: string
}

// Corresponds to Go's centrifugo.DeviceEvent
export interface DeviceEventPayload {
  event_type: DeviceEventType;
  device_leave?: DeviceLeaveParam; // Optional: only if event_type indicates presence
  mobile_scan?: SuccessMobileScanParam; // Optional: only if event_type indicates mobile scan
  ack_pair?: AckDevicePairParam; // Optional: only if event_type indicates ack pair
  insufficient_point?: InsufficientPointParam; // Optional: only if event_type indicates insufficient point
}

// Corresponds to Go's centrifugo.Message (this is what we expect from Centrifugo publication)
export interface CentrifugoMessage {
  message_type: MsgType;
  id: string;
  data_payload?: DataPayload; // Optional, present if message_type is DataMsg
  command_payload?: CommandPayload; // Optional, present if message_type is CmdMsg
  event_payload?: DeviceEventPayload;// Optional, present if message_type is EventMsg
  from_device: DeviceType;
  to_device: DeviceType;
  created_at: string; // Dates are often stringified in JSON (ISO 8601 format)
}
