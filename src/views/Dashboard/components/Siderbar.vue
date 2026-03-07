<script setup lang="ts">
import { t } from '@/locales';
import { ref } from 'vue'
import {
  DownloadOutlined,
  InfoCircleOutlined,
  MacCommandOutlined,
  PayCircleOutlined,
  PlayCircleOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  ToolOutlined,
} from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import GlobalSettingsModal from '@/components/GlobalSettingsModal/index.vue'

const modalRef = ref<InstanceType<typeof GlobalSettingsModal>>()

// 测试用户数据
const user = {
  name: "DreamyLucia742",
  balance: {
    points: 150,
    quickAnswers: 3,
    writtenQuestions: 8,
  },
  invitation: {
    count: 3,
    code: "test",
  },
};

// 拼接邀请链接
const inviteLink = `offerai.cloud/?code=${user.invitation.code}`;

// 好友互助计划数据
const friendPlans = [
  { text: '邀请好友，一人充值，两人受益', action: '查看规则' },
  { text: '加群领 10 元额度（每人限领一次）', action: '点我加群' },
  { text: '成为校园代理，邀请返佣', action: '点我报名' },
];

// 教程中心数据
const tutorials = [
  '面试笔试全场景教程（15min）',
  '笔试模式使用教程（2min）',
  '双端互联教程（10min）',
];

// 最新动态数据
const changelog = [
  { text: '客户端 2.0 已上线！', date: '2025.5.1' },
  { text: '教程中心已上线~', date: '2025.4.1' },
  { text: '💬 聊天模式已推出💬', date: '2025.3.1' },
];

// 第一排按钮数据
const firstRowButtons = [
  {
    icon: MacCommandOutlined,
    title: '快捷按键',
    action: () => message.success('点击了快捷按键'),
  },
  {
    icon: QuestionCircleOutlined,
    title: '使用手册',
    action: () => message.success('点击了使用手册'),
  },
  {
    icon: SettingOutlined,
    title: '全局设置',
    action: () => {
      modalRef.value?.open()
    },
  },
];

// 第二排按钮数据
const secondRowButtons = [
  {
    icon: DownloadOutlined,
    title: '下载客户端',
    action: () => message.success('开始下载客户端'),
  },
  {
    icon: ToolOutlined,
    title: '技术支持',
    action: () => message.success('点击了技术支持'),
  },
];

const copy = () => {
  navigator.clipboard.writeText(inviteLink);
  message.success("复制成功");
};

const recharge = () => {
  // TODO: 充值逻辑
};
</script>

<template>
  <GlobalSettingsModal ref="modalRef" />
  <div class="flex flex-col h-full">
    <!-- 头部 -->
    <div class="flex items-center gap-3 cursor-pointer justify-center">
      <div class="h-12 w-12">
        <img src="@/assets/logo.png" alt="Logo" class="h-full w-full object-contain">
      </div>
      <span class="text-3xl font-bold ml-2 primary">{{ t('productName') }}</span>
    </div>

    <!-- 主要部分 -->
    <div class="flex flex-col items-center h-full mt-4 rounded-[30px] body-bg px-4 py-4">
      <!-- 头像 -->
      <div class="flex w-full items-center">
        <div class="flex gap-3">
          <div class="h-8 w-8">
            <img src="@/assets/img/SelectPage/userImg.jpg" alt="UserImg" class="h-full w-full object-contain">
          </div>
          <span class="text-xl font-bold ml-2 text-primary text-ellipsis-single-line">{{ user.name }}</span>
        </div>
        <button
          class="flex items-center ml-auto normal-button px-4 py-2 font-bold"
          @click="recharge"
        >
          充值
          <PayCircleOutlined class="primary ml-2 text-xl" />
        </button>
      </div>

      <!-- 明细 -->
      <div class="flex w-full items-center space-x-4 mt-4">
        <div class="flex flex-col box-bg space-y-2 py-2 px-4 rounded-[10px] w-[200px] cursor-pointer box-stress">
          <div class="flex items-center justify-between">
            <span class="text-primary font-bold text-xl">余额</span>
            <span class="text-secondary text-sm">明细></span>
          </div>
          <div class="flex items-end">
            <span class="text-primary font-bold text-xl">{{ user.balance.points }}</span>
            <span class="text-secondary ml-2 text-sm">ACE 点</span>
          </div>
          <span class="text-secondary text-sm">{{ user.balance.quickAnswers }} 次快答 / {{ user.balance.writtenQuestions }} 道笔试题</span>
        </div>
        <div class="flex flex-col box-bg space-y-2 py-2 px-4 rounded-[10px] w-[200px] cursor-pointer box-stress">
          <div class="flex items-center justify-between">
            <span class="text-primary font-bold text-xl">邀请记录</span>
            <span class="text-secondary text-sm">明细></span>
          </div>
          <div class="flex items-end">
            <span class="text-primary font-bold text-xl">{{ user.invitation.count }}</span>
            <span class="text-secondary ml-2 text-sm">人</span>
          </div>
          <span class="text-secondary text-sm">加入好友互助计划</span>
        </div>
      </div>
      <!-- 好友互助计划 -->
      <div class="flex flex-col w-full box-bg space-y-2 py-2 px-4 rounded-[10px] mt-4">
        <div class="flex items-center justify-between">
          <span class="text-primary font-bold text-xl">好友互助计划</span>
          <span class="text-secondary text-sm">填写邀请码></span>
        </div>
        <div class="flex flex-col text-sm">
          <div v-for="(item, index) in friendPlans" :key="index" class="flex justify-between">
            <span class="text-secondary">{{ item.text }}</span>
            <span class="primary hover:underline cursor-pointer">{{ item.action }}</span>
          </div>
        </div>
        <div class="flex justify-between">
          <span class="text-primary invite-code-container px-4 text-sm rounded-[10px] allow-select">{{ inviteLink }}</span>
          <button
            class="flex items-center ml-auto normal-button px-4 text-sm font-bold"
            @click="copy"
          >
            复制
          </button>
        </div>
      </div>
      <!-- 教程中心 -->
      <div class="flex flex-col w-full box-bg space-y-2 py-2 px-4 rounded-[10px] mt-4">
        <div class="flex items-center justify-between">
          <span class="text-primary font-bold text-xl">教程中心</span>
        </div>
        <div class="flex flex-col text-sm text-secondary">
          <div v-for="(item, index) in tutorials" :key="index" class="flex space-x-2">
            <PlayCircleOutlined />
            <span class="hover:underline cursor-pointer">{{ item }}</span>
          </div>
        </div>
      </div>
      <!-- 最新动态 -->
      <div class="flex flex-col w-full box-bg space-y-2 py-2 px-4 rounded-[10px] mt-4">
        <div class="flex items-center justify-between">
          <span class="text-primary font-bold text-xl">最新动态</span>
        </div>
        <div class="flex flex-col text-sm text-secondary">
          <div v-for="(item, index) in changelog" :key="index" class="flex justify-between">
            <div class="flex space-x-2">
              <InfoCircleOutlined />
              <span class="hover:underline cursor-pointer">{{ item.text }}</span>
            </div>
            <span>{{ item.date }}</span>
          </div>
        </div>
      </div>
      <!-- 按键 -->
      <div class="flex flex-col w-full space-y-2 mt-auto">
        <!-- 第一排按钮 -->
        <div class="flex space-x-4 w-full">
          <button
            v-for="(btn, index) in firstRowButtons"
            :key="`first-${index}`"
            class="flex-1 flex items-center justify-center py-2 normal-button space-x-2"
            @click="btn.action"
          >
            <component :is="btn.icon" />
            <span class="text-sm">{{ btn.title }}</span>
          </button>
        </div>

        <!-- 第二排按钮 -->
        <div class="flex space-x-4 w-full">
          <button
            v-for="(btn, index) in secondRowButtons"
            :key="`second-${index}`"
            class="flex-1 flex items-center justify-center py-2 normal-button space-x-2"
            @click="btn.action"
          >
            <component :is="btn.icon" />
            <span class="text-sm">{{ btn.title }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@use '@/style/custom-theme' as *;
.box-stress {
  transition: all 0.2s ease;
  &:hover {
    background-color: var(--normal-layout-border-color);
  }
}

.invite-code-container {
  border: solid 2px var(--normal-layout-border-color);
}
</style>
