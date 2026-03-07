<script setup lang="ts">
import Header from './components/Header.vue'
import Siderbar from './components/Siderbar.vue'
import Content from './components/Content.vue'
import type { Exam, ExamType } from '@/types/exam'
import type { writtenTestQuestion, writtenTestQuestionDetail } from '@/types/writtenTest'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { fromBase64 } from '@/utils/base64';
import { getQuestionDetailApi, getQuestionListApi, postCommandApi, postCopilotImageSolverStreamApi } from '@/api/writtenTest'
import DeleteQuestionModal from './components/DeleteQuestionModal.vue'
import { v4 as uuidv4 } from 'uuid' // 可用uuid确保id唯一
import { getRefreshTokenApi } from '@/api/centrifugo'
import { CentrifugeClient } from '@/utils/centrifugo/centrifuge.ts'
import { CentrifugoEventProcessor } from '@/utils/centrifugo/event_processor.ts'
import { initializeAndListen } from '@/utils/centrifugo/handler'
import { devicePairManager } from '@/utils/devicePair'
import { PairingState } from '@/constants/pairingState'
import { EventBus } from '@/utils/eventBus'
import type { DataPayload, DeviceEventPayload } from '@/types/centrifugo'
import { endPairApi } from '@/api/devicePair'

// 避免数据不更新
defineOptions({
  name: 'WrittenTestPage',
})

const route = useRoute()
const router = useRouter();
const examData = ref<Exam | null>(null)
const isDataReady = ref(false);
let client: CentrifugeClient | null = null
let eventProcessor: CentrifugoEventProcessor | null = null

const modalRef = ref<InstanceType<typeof DeleteQuestionModal>>()

const questionList = ref<writtenTestQuestion[]>([])
const questionDetail = ref<writtenTestQuestionDetail | null>(null)
const isLoading = ref(false)
const isDetailLoading = ref(false)
const selectedId = ref<string | null>(null)
const selectedQuestionType = ref('单选题')
const clientId = ref<string | null>(null)
const stateRef = devicePairManager.getStateRef();

const imageList = ref<string[]>([])
const textList = ref<string[]>([])

// 正在解答的题目详情缓存（用于处理用户切换题目的情况）
const answeringQuestionDetail = ref<writtenTestQuestionDetail | null>(null)

// 页面关闭处理相关
const isDisconnecting = ref(false)
const disconnectPromise = ref<Promise<void> | null>(null)

// 断开连接标识符
const isPassiveDisconnect = ref(false)

const modelName = "qwq"

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
  () => route.query.examData,
  async (newData) => {
    if (typeof newData === 'string')
      await parseExamData(newData);
  },
  { immediate: true },
);

const fetchQuestionList = async () => {
  if (!examData.value)
    return;
  isLoading.value = true;
  try {
    const result = await getQuestionListApi(examData.value.exam_id)
    questionList.value = result
  }
  catch (error) {
    message.error('获取笔试题目历史失败')
    console.error('获取笔试题目历史失败:', error)
  }
  finally {
    isLoading.value = false
  }
}

const fetchQuestionDetail = async (id: string) => {
  isDetailLoading.value = true;
  try {
    const result = await getQuestionDetailApi(id)
    questionDetail.value = result
    console.info(questionDetail.value)
  }
  catch (error) {
    message.error('获取题目详情失败')
    console.error('获取题目详情失败:', error)
  }
  finally {
    isDetailLoading.value = false
  }
}

// 考试数据解析后加载题目
watch(
  () => isDataReady.value,
  () => {
    fetchQuestionList()
  },
)

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

// 选择题目
const onSidebarSelect = (id: string) => {
  const q = questionList.value.find(item => item.id === id)
  if (!q || selectedId.value === q.id)
    return
  selectedId.value = q.id
  fetchQuestionDetail(selectedId.value)
  selectedQuestionType.value = q.question_type || '简答题' // 如果无类型，给个默认
}

// 删除题目
const onSidebarDelete = (id: string) => {
  const q = questionList.value.find(item => item.id === id)
  if (!q)
    return
  modalRef.value?.open(q)
}

// 题型变更
const onSidebarTypeChange = (type: string) => {
  selectedQuestionType.value = type
}

// 解答/重答
const onSidebarAnswer = async () => {
  if (!examData.value) {
    message.error('缺少考试数据')
    return
  }

  // 检查是否有图片
  if (imageList.value.length === 0) {
    message.error('请先截屏获取题目图片')
    return
  }

  // 新建一个本地 question，写入 questionList
  const now = Date.now()
  const tmpId = uuidv4() // 本地唯一标记（会被后端返回的真正 id 替换）
  const tmpDetailId = uuidv4()
  let answeringQuestionId: string | null = null

  const newQuestion: writtenTestQuestion = {
    id: tmpId,
    question_type: selectedQuestionType.value,
    question_title: '新问题',
    create_time: now,
  }
  questionList.value.unshift(newQuestion)
  selectedId.value = tmpId

  // 新增问题详情
  const newQuestionDetail: writtenTestQuestionDetail = {
    id: tmpDetailId,
    question_text: '',
    question_type: newQuestion.question_type,
    question_title: newQuestion.question_title,
    create_time: newQuestion.create_time,
    image_url: imageList.value,
    question_status: 0,
    solutions: [],
  }

  // 设置当前显示和缓存
  questionDetail.value = newQuestionDetail
  answeringQuestionDetail.value = newQuestionDetail

  // 新增答案下标
  const solutionIdx = 0

  // 构造请求
  const body = {
    model_name: modelName,
    image_urls: imageList.value,
    exam_id: examData.value.exam_id,
    question_type: selectedQuestionType.value,
  }

  postCopilotImageSolverStreamApi(body, {
    onOcr: (text: string) => {
      // 直接操作缓存的正在解答的题目详情
      if (answeringQuestionDetail.value) {
        answeringQuestionDetail.value.question_text += text
        // 如果当前显示的就是正在解答的题目，同步更新显示
        if (questionDetail.value?.id === answeringQuestionDetail.value.id)
          questionDetail.value.question_text += text
      }
    },
    onCreated: (data: any) => {
      // 问题真正创建成功，替换id
      const { question_id } = JSON.parse(data)

      // 更新questionList中的题目ID
      newQuestion.id = question_id

      // 更新缓存的详情ID
      if (answeringQuestionDetail.value)
        answeringQuestionDetail.value.id = question_id

      // 更新当前显示的详情ID（如果还在显示这个题目）
      if (questionDetail.value?.id === tmpDetailId) {
        questionDetail.value.id = question_id
        selectedId.value = question_id
      }

      answeringQuestionId = question_id
    },
    onSolving: (solutionText: string) => {
      // 直接操作缓存的正在解答的题目详情
      if (answeringQuestionDetail.value) {
        answeringQuestionDetail.value.question_status = 1
        if (answeringQuestionDetail.value.solutions.length === 0) {
          // 新增一条
          answeringQuestionDetail.value.solutions.push({
            id: '0',
            model: modelName,
            answer_text: '',
            text_type: 0,
            create_time: Date.now(),
          })
        }
        answeringQuestionDetail.value.solutions[solutionIdx].answer_text += solutionText

        // 如果当前显示的就是正在解答的题目，同步更新显示
        if (questionDetail.value?.id === answeringQuestionDetail.value.id) {
          questionDetail.value.question_status = answeringQuestionDetail.value.question_status
          questionDetail.value.solutions = [...answeringQuestionDetail.value.solutions]
        }
      }
    },
    onFinish: (data: any) => {
      // 直接操作缓存的正在解答的题目详情
      if (answeringQuestionDetail.value) {
        answeringQuestionDetail.value.question_status = 2
        answeringQuestionDetail.value.solutions[solutionIdx].id = data.solution_id

        // 如果当前显示的就是正在解答的题目，同步更新显示
        if (questionDetail.value?.id === answeringQuestionDetail.value.id) {
          questionDetail.value.question_status = answeringQuestionDetail.value.question_status
          questionDetail.value.solutions = [...answeringQuestionDetail.value.solutions]
        }

        message.success('AI解答完成')
        fetchQuestionList()
        // 清理图片列表，为下一题做准备
        imageList.value = []

        // 解答完成后清除标识和缓存
        answeringQuestionId = null
        answeringQuestionDetail.value = null
      }
    },
    onError: () => {
      message.error('解答失败，请稍后再试')
      // 解答失败后清除标识和缓存
      answeringQuestionId = null
      answeringQuestionDetail.value = null
    },
  })
}

// 下一题
const onSidebarNext = () => {
  selectedId.value = null
  questionDetail.value = null
}

// 删除图片
const onSidebarDeleteImage = (index: number) => {
  imageList.value.splice(index, 1)
}

// 遥控截屏
const onSidebarScreenshot = async () => {
  if (!examData.value)
    return;
  try {
    await postCommandApi(1, examData.value.exam_id)
  }
  catch (error) {
    message.error('截屏失败，请稍后再试')
    console.error('截屏失败:', error)
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
  devicePairManager.updateState(PairingState.Listen);
}

const handleLink = async () => {
  try {
    const refreshTokenParams = {
      from_end: 2,
      exam_type: examData.value?.exam_type as ExamType,
      need_rtc: false,
    };
    const tokens = await getRefreshTokenApi(refreshTokenParams)

    // 初始化 Centrifuge 客户端
    client = CentrifugeClient.initialize({
      initialConnectionToken: tokens.connect_channel,
      initialSubscribeToken: tokens.subscribe_channel,
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
    })
  }
  catch (error: any) {
    const content
      = (error && typeof error === 'object' && 'message' in error && error.message)
        ? error.message
        : '双端互联失败，请稍后重试'
    message.error(content)
    console.error('双端互联失败:', error)

    // 保底措施
    cleanupResources();
  }
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

const onDataMessage = (e: Event) => {
  const payload = (e as CustomEvent<DataPayload>).detail
  // 保存图片
  if (payload.image_urls?.length)
    imageList.value.push(...payload.image_urls)

  // 保存文本
  if (payload.text)
    textList.value.push(payload.text)
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
  EventBus.addEventListener('data-message', onDataMessage)
  EventBus.addEventListener('ack-device-pair', ackDevicePair)
  EventBus.addEventListener('device-leave-channel', deviceLeaveChannel)
  EventBus.addEventListener('insufficient-points', insufficientPoints)

  // 添加页面关闭事件监听器
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onBeforeUnmount(async () => {
  EventBus.removeEventListener('data-message', onDataMessage)
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
</script>

<template>
  <DeleteQuestionModal ref="modalRef" />
  <div v-if="isDataReady && examData" class="h-screen w-screen flex flex-col normal-bg">
    <Header :exam-data="examData" @link="handleLink" @unlink="handleUnlink" />
    <div class="flex flex-1 w-full min-h-0">
      <Siderbar
        :question-list="questionList"
        :question-detail="questionDetail"
        :is-loading="isLoading"
        :selected-id="selectedId"
        :selected-question-type="selectedQuestionType"
        :image-list="imageList"
        :text-list="textList"
        :ready-shot="stateRef === PairingState.Established && selectedId === null"
        :ready-answer="stateRef === PairingState.Established"
        @select="onSidebarSelect"
        @delete-question="onSidebarDelete"
        @screenshot="onSidebarScreenshot"
        @next="onSidebarNext"
        @answer="onSidebarAnswer"
        @change-type="onSidebarTypeChange"
        @delete-image="onSidebarDeleteImage"
      />
      <Content
        :question-detail="questionDetail"
        :is-loading="isDetailLoading"
      />
    </div>
  </div>
</template>

<style lang="scss">
@use '@/style/custom-theme' as *;
</style>
