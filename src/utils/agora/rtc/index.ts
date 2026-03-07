import AgoraRTC from "agora-rtc-sdk-ng"
import type { IAgoraRTCClient } from "agora-rtc-sdk-ng"

interface RTCState {
  client: IAgoraRTCClient;
  isConnected: boolean;
}

// 在模块加载时立即初始化客户端
const rtc: RTCState = (() => {
  const client = AgoraRTC.createClient({
    mode: 'rtc',
    codec: 'vp8',
  })

  return {
    client,
    isConnected: false,
  }
})()

export const startAgoraRTC = async (token: any) => {
  try {
    const options = {
      appId: import.meta.env.VITE_AGORA_APP_ID,
      channel: '810test',
      token: null,
      uid: import.meta.env.VITE_USER_ID,
    }

    await rtc.client.join(options.appId, options.channel, options.token, options.uid)
    rtc.isConnected = true
    console.info('RTC 连接成功')
  }
  catch (error) {
    rtc.isConnected = false
    console.error('RTC 连接失败:', error)
    throw error
  }
}

export const disconnectRTC = async () => {
  try {
    await rtc.client.leave()
    rtc.isConnected = false
    console.info('RTC 断开连接')
  }
  catch (error) {
    console.error('RTC 断开连接失败:', error)
    throw error
  }
}

export { rtc }
