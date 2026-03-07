import AgoraRTM from 'agora-rtm'

const { RTM } = AgoraRTM;

interface RTMState {
  client: any; // RTM 客户端类型
  isLoggedIn: boolean;
}

// 在模块加载时立即初始化客户端
const rtm: RTMState = {
  client: new RTM(import.meta.env.VITE_AGORA_APP_ID, import.meta.env.VITE_USER_ID),
  isLoggedIn: false,
}

export const startRTM = async (token: any) => {
  try {
    await rtm.client.login()
    rtm.isLoggedIn = true
    console.info('RTM 连接成功')

    // 监听 RTM 消息
    rtm.client.addEventListener('message', (message: any) => {
      console.info('[RTM] 📨 收到消息:', message);

      try {
        // 尝试解析消息内容
        if (message.message && typeof message.message === 'string') {
          const parsedMessage = JSON.parse(message.message);
          console.info('[RTM] 📝 解析后的消息:', parsedMessage);
        }
      }
      catch (error) {
        console.error('[RTM] ⚠️ 消息解析失败:', error);
      }
    });

    // 监听 RTM 状态变化
    rtm.client.addEventListener('status', (status: any) => {
      console.info('[RTM] 📊 状态变化:', status);
    });

    // 监听 RTM 连接状态
    rtm.client.addEventListener('connection-status-change', (status: any) => {
      console.info('[RTM] 🔗 连接状态变化:', status);
    });

    console.info('[RTM] 🎧 消息监听器设置完成');
  }
  catch (error) {
    rtm.isLoggedIn = false
    console.error('RTM 连接失败:', error)
    throw error
  }
}

export const disconnectRTM = async () => {
  try {
    console.info('[RTM] 🛑 开始断开RTM连接...');

    // 移除所有事件监听器
    rtm.client.removeAllListeners();
    console.info('[RTM] 🧹 已移除所有事件监听器');

    await rtm.client.logout()
    rtm.isLoggedIn = false
    console.info('[RTM] ✅ 断开连接成功')
  }
  catch (error) {
    console.error('[RTM] ❌ 断开连接失败:', error)
    throw error
  }
}

export { rtm }
