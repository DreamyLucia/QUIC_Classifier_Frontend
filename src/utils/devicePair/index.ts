import { PairingState } from '@/constants/pairingState'
import { ackPairApi, startPairApi } from '@/api/devicePair';
import { ref } from 'vue';
import type { Ref } from 'vue';
import type { AckDevicePairParam, StartDevicePairParam } from '@/types/devicePair';

/**
 * @enum {PairingState}
 * @description 定义了设备配对过程中的状态机。
 * - Listen: 初始状态，等待配对请求。
 * - SyncRevd: 已收到移动端的配对请求（SYN），并已发送确认（ACK），等待移动端最终的确认。
 * - Established: 配对成功，双方确认连接。
 */

class DevicePairManager extends EventTarget {
  private static instance: DevicePairManager;

  private stateRef: Ref<PairingState> = ref(PairingState.Listen);
  private timer: ReturnType<typeof setTimeout> | null = null;

  private constructor() {
    super();
  }

  public static getInstance(): DevicePairManager {
    if (!DevicePairManager.instance)
      DevicePairManager.instance = new DevicePairManager();

    return DevicePairManager.instance;
  }

  public getStateRef(): Ref<PairingState> {
    return this.stateRef;
  }

  public updateState(newState: PairingState) {
    if (this.stateRef.value === newState)
      return

    const oldState = this.stateRef.value;
    this.stateRef.value = newState;
    console.info(`[DevicePairManager] 全局状态跃迁: ${oldState} -> ${newState}`, 'DevicePairManager.updatestate');

    if (this.timer && this.stateRef.value !== PairingState.SyncRevd) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private createTimeoutPromise(ms: number) {
    // 先清除上一个尚未触发的超时计时器
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    return new Promise((_resolve, reject) => {
      this.timer = setTimeout(() => {
        this.timer = null;
        this.updateState(PairingState.Listen);
        console.warn('[DevicePairManager] 发送配对信息超时 DevicePairManager.handleStartDevicePair');
        reject(new Error('连接超时'));
      }, ms);
    });
  }

  public async handleStartPair(params: StartDevicePairParam) {
    if (this.stateRef.value !== PairingState.Listen)
      this.updateState(PairingState.Listen);

    console.info(`[DevicePairManager] 准备发送 StartDevicePair 请求, seq: ${params.copilot_client_id}`, 'DevicePairManager.handleStartDevicePair')

    try {
      const result = await Promise.race([
        startPairApi(params),
        this.createTimeoutPromise(5000),
      ]);
      if (result && result.pair_success) {
        this.updateState(PairingState.SyncRevd)
      }
      else {
        const reason = result?.pair_fail_reason || '发起配对失败，请稍后再试';
        console.warn(`[DevicePairManager] 发送配对信息失败: ${reason}, 'DevicePairManager.handleStartDevicePair'`);
        this.updateState(PairingState.Listen);
        throw new Error(reason);
      }
    }
    catch (error) {
      console.error('[DevicePairManager] 发送 StartDevicePair 时发生异常:', error);
      this.updateState(PairingState.Listen);
      throw error
    }
    finally {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
    }
  }

  public async handleAckDevicePair(params: AckDevicePairParam) {
    if (this.stateRef.value !== PairingState.SyncRevd)
      return

    console.info(`[DevicePairManager] 准备发送 AckDevicePair 请求, seq: ${params.copilot_client_id}`, 'DevicePairManager.handleAckDevicePair')
    try {
      const result = await ackPairApi(params)
      if (result && result.ack_success) {
        this.updateState(PairingState.Established)
      }
      else {
        const reason = result?.ack_fail_reason || '响应配对失败，请稍后再试';
        console.warn(`[DevicePairManager] 响应配对信息失败: ${reason}, 'DevicePairManager.handleAckDevicePair'`);
        this.updateState(PairingState.Listen);
        throw new Error(reason);
      }
    }
    catch (error) {
      console.error('[DevicePairManager] 发送 StartDevicePair 时发生异常:', error);
      this.updateState(PairingState.Listen);
      throw error
    }
  }
}

// 导出 DevicePairManager 的单例，供其他模块使用。
export const devicePairManager = DevicePairManager.getInstance();
