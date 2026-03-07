export enum MsgType {
  DataMsg = 1,
  CmdMsg = 2,
  EventMsg = 3,
}

export type DeviceType = number;

export type CommandType = number;

export type DataType = number;

export const devices = {
  DeviceInterview: 1 as DeviceType,
  DeviceCopilot: 2 as DeviceType,
}

export const commands = {
  ScreenShot: 1 as CommandType, // 截图命令
}

export const datatypes = {
  text: 1 as DataType,
  image: 2 as DataType,
}

// Corresponds to Go's centrifugo_model.DeviceEvent
export enum DeviceEventType {
  DeviceLeaveChannel = 2,
  SuccessMobileScan = 3,
  AckDevicePair = 5,
  InsufficientPoints = 6,
}
