<script setup lang="ts">
import type { Exam, ExamType } from '@/types/exam'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { fromBase64 } from '@/utils/base64';
import { message } from 'ant-design-vue';
import { useRoute, useRouter } from 'vue-router';
import { devicePairManager } from '@/utils/devicePair';
import { PairingState } from '@/constants/pairingState'
import { CentrifugeClient } from '@/utils/centrifugo/centrifuge.ts'
import { CentrifugoEventProcessor } from '@/utils/centrifugo/event_processor';
import { initializeAndListen } from '@/utils/centrifugo/handler';
import { getRefreshTokenApi } from '@/api/centrifugo';
import { endPairApi } from '@/api/devicePair';
import { EventBus } from '@/utils/eventBus';
import type { DeviceEventPayload } from '@/types/centrifugo'
import { disconnectRTC, rtc, startAgoraRTC } from '@/utils/agora/rtc';
import { disconnectRTM, rtm, startRTM } from '@/utils/agora/rtm';
import { ConversationalAIAPI } from '@/utils/agora/conversationalAI';
import { EConversationalAIAPIEvents, ESubtitleHelperMode } from '@/utils/agora/conversationalAI/type';
import type { IAgentTranscription, ISubtitleHelperItem, IUserTranscription } from '@/utils/agora/conversationalAI/type';

defineOptions({
  name: 'InterviewPage',
})

const route = useRoute()
const router = useRouter();

const examData = ref<Exam | null>(null)
const isDataReady = ref(false)
const stateRef = devicePairManager.getStateRef();
const isPassiveDisconnect = ref(false) // 断开连接标识符
const clientId = ref<string | null>(null)
const tokens = ref<any>(null)
const conversationalAIAPI = ref<ConversationalAIAPI | null>(null)

// 实时字幕相关状态
const chatHistory = ref<ISubtitleHelperItem<Partial<IUserTranscription | IAgentTranscription>>[]>([])

let client: CentrifugeClient | null = null
let eventProcessor: CentrifugoEventProcessor | null = null

// 页面关闭处理相关
const isDisconnecting = ref(false)
const disconnectPromise = ref<Promise<void> | null>(null)

// 解析考试数据
const parseExamData = async (encodedData: string) => {
  try {
    if (encodedData) {
      // 确保 examData 是字符串
      if (typeof encodedData !== 'string')
        throw new Error('考试数据格式不正确');

      // 使用 fromBase64 函数进行 Base64 解码
      const decodedData = await fromBase64(encodedData);
      examData.value = JSON.parse(decodedData);
      isDataReady.value = true;
    }
  }
  catch (error) {
    message.error('解析考试数据失败')
    router.push({ name: 'Dashboard' });
  }
}

// 关键：监听路由变化
watch(
  () => route.query?.examData,
  async (newData) => {
    if (typeof newData === 'string')
      await parseExamData(newData);
  },
  { immediate: true },
);

// 监听连接状态变化
watch(
  () => stateRef.value,
  (newState, oldState) => {
    if (newState === PairingState.Established) {
      message.success('已连接')
    }
    else if (oldState === PairingState.Established && newState === PairingState.Listen) {
      // 只有在非被动断开时才显示消息
      if (!isPassiveDisconnect.value)
        message.info('已断开')

      // 重置标识符
      isPassiveDisconnect.value = false
    }
  },
)

// 监听转录内容更新，用于实时显示字幕转录内容
const onTextChanged = (transcription: ISubtitleHelperItem<Partial<IUserTranscription | IAgentTranscription>>[]) => {
  try {
    console.log('transcription', transcription)
    // 更新字幕历史
    chatHistory.value = transcription;
  }
  catch (error) {
    console.error('处理字幕更新时出错:', error);
  }
}

// 声网逻辑
const connectAgora = async (tokens: any) => {
  try {
    await startAgoraRTC(tokens);
    await startRTM(tokens);

    ConversationalAIAPI.init({
      rtcEngine: rtc.client,
      rtmEngine: rtm.client,
      renderMode: ESubtitleHelperMode.WORD,
    });

    conversationalAIAPI.value = ConversationalAIAPI.getInstance();

    // 监听转录内容更新，用于实时显示字幕转录内容
    conversationalAIAPI.value.on(EConversationalAIAPIEvents.TRANSCRIPTION_UPDATED, onTextChanged);
    conversationalAIAPI.value.subscribeMessage(tokens.rtc.channel);
  }
  catch (error) {
    console.error('声网连接失败:', error);
    throw error;
  }
}

// 清理资源
const cleanupResources = () => {
  if (eventProcessor) {
    eventProcessor.cleanup();
    eventProcessor = null;
  }
  if (client) {
    client.disconnect();
    client = null;
  }
  if (rtc.client)
    disconnectRTC();

  if (rtm.client)
    disconnectRTM();

  if (conversationalAIAPI.value) {
    conversationalAIAPI.value.unsubscribe()
    conversationalAIAPI.value.destroy()
    conversationalAIAPI.value = null
  }
  devicePairManager.updateState(PairingState.Listen);
}

// 核心断连逻辑
const disconnectCore = async (showUserMessage = true): Promise<void> => {
  if (!examData.value || !clientId.value)
    throw new Error('缺少必要的数据');

  try {
    const result = await endPairApi({
      exam_id: examData.value.exam_id,
      exam_type: examData.value.exam_type,
      client_id: clientId.value,
      channel_id: tokens.value.rtc.channel,
    });

    if (result && result.end_pair_success) {
      cleanupResources();
    }
    else {
      const reason = result?.end_fail_reason || '结束配对失败';
      const error = new Error(reason);
      if (reason)
        (error as any).isBusiness = true;

      throw error;
    }
  }
  catch (error) {
    console.error('[WrittenTest] 断连请求失败:', error);

    if (showUserMessage) {
      const content = (error && typeof error === 'object' && 'message' in error && (error as any).isBusiness && error.message)
        ? error.message
        : '结束配对失败，请稍后再试';
      message.error(content as string);
    }

    throw error;
  }
}

const handleLink = async () => {
  try {
    const refreshTokenParams = {
      from_end: 2,
      exam_type: examData.value?.exam_type as ExamType,
      need_rtc: true,
    };
    tokens.value = await getRefreshTokenApi(refreshTokenParams)

    // 初始化 Centrifuge 客户端
    client = CentrifugeClient.initialize({
      initialConnectionToken: tokens.value.connect_channel,
      initialSubscribeToken: tokens.value.subscribe_channel,
      isTestEnv: true,
      centrifugeOptions: {
        minReconnectDelay: 1000,
        maxReconnectDelay: 20000,
        timeout: 5000,
      },
      refreshTokenParams,
    });

    // 连接和订阅
    await client.connect();
    await client.subscribeToChannel();
    clientId.value = client.getClientId()
    console.info('My clientId:', clientId.value);

    // 设置事件处理
    eventProcessor = new CentrifugoEventProcessor(client);
    await initializeAndListen(eventProcessor);

    // 开始双端互联
    await devicePairManager.handleStartPair({
      copilot_client_id: clientId.value as string,
      exam_id: examData.value?.exam_id as string,
      exam_type: examData.value?.exam_type as ExamType,
      token: tokens.value.rtc.token,
      channel_id: tokens.value.rtc.channel,
    })

    // 连接声网
    await connectAgora(tokens.value)
  }
  catch (error: any) {
    const content
      = (error && typeof error === 'object' && 'message' in error && error.message)
        ? error.message
        : '双端互联失败，请稍后重试'
    message.error(content)
    console.error('双端互联失败:', error)

    // 保底措施
    if (stateRef.value === PairingState.Established)
      disconnectCore(false)

    else
      cleanupResources();
  }
}

// 用户主动断开
const handleUnlink = async () => {
  try {
    await disconnectCore(true); // 显示用户消息
  }
  catch (error) {
    // 错误已在 disconnectCore 中处理
  }
}

// 系统自动断开
const performDisconnect = async (): Promise<void> => {
  await disconnectCore(false); // 不显示用户消息
}

// 页面关闭前的处理函数
const handleBeforeUnload = (event: BeforeUnloadEvent) => {
  // 只有在已连接状态下才显示确认对话框
  if (stateRef.value === PairingState.Established && examData.value && clientId.value) {
    // 显示确认对话框
    const message = '您正在连接中，关闭页面将断开连接。确定要关闭吗？';
    event.preventDefault();
    event.returnValue = message;

    // 同时尝试断连
    if (!isDisconnecting.value) {
      isDisconnecting.value = true;
      disconnectPromise.value = performDisconnect();

      // 不等待完成，让用户选择是否继续关闭
      disconnectPromise.value.finally(() => {
        isDisconnecting.value = false;
        disconnectPromise.value = null;
      });
    }

    return message;
  }
}

const deviceLeaveChannel = () => {
  message.info("桌面端设备已断开连接")
  // 标记为被动断开，避免 watch 中重复显示消息
  isPassiveDisconnect.value = true
  // 清理资源并重置状态
  cleanupResources();
}

const insufficientPoints = () => {
  message.info("积分不足，已断开连接")
  // 标记为被动断开，避免 watch 中重复显示消息
  isPassiveDisconnect.value = true
  // 清理资源并重置状态
  cleanupResources();
}

const ackDevicePair = async (e: Event) => {
  const payload = (e as CustomEvent<DeviceEventPayload>).detail;
  try {
    if (payload.ack_pair && payload.ack_pair.is_ready) {
      await devicePairManager.handleAckDevicePair({
        device_type: 2,
        copilot_client_id: clientId.value as string,
        interview_client_id: payload.ack_pair?.interview_client_id as string,
      });
    }
    else {
      const reason = (payload.ack_pair && payload.ack_pair.fail_reason) ? payload.ack_pair.fail_reason : '配对响应失败，请稍后重试'
      const error = new Error(reason)
      if (reason)
        (error as any).isBusiness = true
      throw error
    }
  }
  catch (error: any) {
    console.error('AckDevicePair 配对响应失败', error)
    const content
      = (error && typeof error === 'object' && 'message' in error && (error as any).isBusiness && error.message)
        ? error.message
        : '结束配对失败，请稍后再试'
    message.error(content)
    // 标记为被动断开，避免 watch 中重复显示消息
    isPassiveDisconnect.value = true
    if (stateRef.value !== PairingState.Established)
      cleanupResources();
    throw (e)
  }
}

onMounted(() => {
  EventBus.addEventListener('ack-device-pair', ackDevicePair)
  EventBus.addEventListener('device-leave-channel', deviceLeaveChannel)
  EventBus.addEventListener('insufficient-points', insufficientPoints)

  // 添加页面关闭事件监听器
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onBeforeUnmount(async () => {
  EventBus.removeEventListener('ack-device-pair', ackDevicePair)
  EventBus.removeEventListener('device-leave-channel', deviceLeaveChannel);
  EventBus.removeEventListener('insufficient-points', insufficientPoints);

  // 移除页面关闭事件监听器
  window.removeEventListener('beforeunload', handleBeforeUnload)

  // 如果还在断连中，等待完成
  if (isDisconnecting.value && disconnectPromise.value) {
    try {
      await disconnectPromise.value;
    }
    catch (error) {
      console.warn('disconnect failed', error)
    }
  }

  // 正常组件卸载时的清理
  if (eventProcessor) {
    eventProcessor.cleanup();
    eventProcessor = null;
  }
  if (client) {
    try {
      if (stateRef.value !== PairingState.Listen) {
        // 组件卸载时也需要发送断连 API
        await disconnectCore(false);
        // 标记为被动断开，避免 watch 中重复显示消息
        isPassiveDisconnect.value = true
      }
    }
    catch (e) {
      console.warn('disconnect failed', e)
    }
  }
})

const testAgora = async () => {
  const refreshTokenParams = {
    from_end: 2,
    exam_type: examData.value?.exam_type as ExamType,
    need_rtc: true,
  };
  tokens.value = await getRefreshTokenApi(refreshTokenParams)
  await connectAgora(tokens.value)
}
</script>

<template>
  <div v-if="isDataReady && examData" class="h-screen w-screen flex flex-col normal-bg">
    <div class="flex-1 p-6">
      <!-- 页面标题 -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-800">
          面试页面
        </h1>
        <p class="text-gray-600">
          考试ID: {{ examData.exam_id }}
        </p>
      </div>

      <!-- 连接控制区域 -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-lg font-semibold mb-4">
          连接控制
        </h2>
        <div class="flex gap-4 items-center">
          <button
            :disabled="stateRef === PairingState.Established"
            class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            @click="handleLink"
          >
            {{ stateRef === PairingState.Established ? '已连接' : '开始连接' }}
          </button>

          <button
            v-if="stateRef === PairingState.Established"
            class="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            @click="handleUnlink"
          >
            断开连接
          </button>

          <button
            class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            @click="testAgora"
          >
            测试声网
          </button>
        </div>

        <!-- 连接状态显示 -->
        <div class="mt-4 p-3 bg-gray-50 rounded-lg">
          <div class="text-sm text-gray-600">
            <span class="font-medium">当前状态:</span>
            <span
              class="ml-2 px-2 py-1 rounded text-xs" :class="{
                'bg-yellow-100 text-yellow-800': stateRef === PairingState.Listen,
                'bg-blue-100 text-blue-800': stateRef === PairingState.SyncRevd,
                'bg-green-100 text-green-800': stateRef === PairingState.Established,
              }"
            >
              {{
                stateRef === PairingState.Listen ? '等待连接'
                : stateRef === PairingState.SyncRevd ? '同步中'
                  : stateRef === PairingState.Established ? '已连接' : '未知状态'
              }}
            </span>
          </div>
        </div>

        <!-- 调试信息显示 -->
        <div class="mt-4 p-3 bg-yellow-50 rounded-lg">
          <h3 class="text-sm font-medium text-yellow-800 mb-2">
            调试信息
          </h3>
          <div class="text-xs text-yellow-700 space-y-1">
            <div>RTC 状态: {{ rtc.isConnected ? '已连接' : '未连接' }}</div>
            <div>RTM 状态: {{ rtm.isLoggedIn ? '已登录' : '未登录' }}</div>
            <div>ConversationalAI API: {{ conversationalAIAPI ? '已初始化' : '未初始化' }}</div>
            <div>字幕历史数量: {{ chatHistory.length }}</div>
            <div>Client ID: {{ clientId || '未设置' }}</div>
          </div>
        </div>
      </div>

      <!-- 实时字幕显示区域 -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-lg font-semibold mb-4">
          实时字幕
        </h2>

        <!-- 字幕历史记录 -->
        <div class="bg-gray-50 rounded-lg p-4 min-h-[300px] max-h-[500px] overflow-y-auto">
          <div v-if="chatHistory.length === 0" class="text-gray-500 text-center py-8">
            暂无字幕内容，请先连接设备开始对话
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="(item, index) in chatHistory"
              :key="`${item.uid}-${item.turn_id}-${index}`"
              class="flex items-start gap-3"
            >
              <!-- 用户头像/标识 -->
              <div
                class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                :class="{
                  'bg-blue-100 text-blue-600': item.uid === 'user',
                  'bg-green-100 text-green-600': item.uid === 'agent',
                  'bg-gray-100 text-gray-600': !item.uid || (item.uid !== 'user' && item.uid !== 'agent'),
                }"
              >
                {{ item.uid === 'user' ? '我' : item.uid === 'agent' ? 'AI' : '?' }}
              </div>

              <!-- 字幕内容 -->
              <div class="flex-1 min-w-0">
                <div class="bg-white rounded-lg p-3 shadow-sm border">
                  <div class="text-sm text-gray-800 leading-relaxed">
                    {{ item.text || '暂无内容' }}
                  </div>

                  <!-- 字幕状态和元信息 -->
                  <div class="mt-2 flex items-center gap-4 text-xs text-gray-500">
                    <span
                      v-if="item.status !== undefined" class="px-2 py-1 rounded-full" :class="{
                        'bg-yellow-100 text-yellow-700': item.status === 0,
                        'bg-green-100 text-green-700': item.status === 1,
                        'bg-red-100 text-red-700': item.status === 2,
                      }"
                    >
                      {{
                        item.status === 0 ? '进行中'
                        : item.status === 1 ? '已完成'
                          : item.status === 2 ? '已中断' : '未知状态'
                      }}
                    </span>

                    <span v-if="item._time" class="text-gray-400">
                      {{ new Date(item._time).toLocaleTimeString() }}
                    </span>

                    <span v-if="item.turn_id" class="text-gray-400">
                      轮次: {{ item.turn_id }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 字幕统计信息 -->
        <div v-if="chatHistory.length > 0" class="mt-4 p-3 bg-blue-50 rounded-lg">
          <div class="text-sm text-blue-700">
            <span class="font-medium">字幕统计:</span>
            <span class="ml-2">共 {{ chatHistory.length }} 条字幕</span>
            <span class="ml-4">用户: {{ chatHistory.filter(item => item.uid === 'user').length }} 条</span>
            <span class="ml-4">AI: {{ chatHistory.filter(item => item.uid === 'agent').length }} 条</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
