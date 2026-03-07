import { onBeforeUnmount, watch } from 'vue'
import type { Ref } from 'vue'

/**
 * 给 ref 绑定滚轮横向滚动事件
 * @param elRef - 需要横向滚动的容器ref
 */
export const useHorizontalWheelScroll = (elRef: Ref<HTMLElement | null>) => {
  let lastEl: HTMLElement | null = null
  let onWheel: ((e: WheelEvent) => void) | null = null

  // 每次 ref.value 变化，都重新绑定 wheel 事件
  const cleanup = () => {
    if (lastEl && onWheel)
      lastEl.removeEventListener('wheel', onWheel)

    lastEl = null
    onWheel = null
  }

  watch(
    elRef,
    (el, prevEl) => {
      cleanup()
      if (el) {
        onWheel = (e: WheelEvent) => {
          if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            el.scrollLeft += e.deltaY
            e.preventDefault()
          }
        }
        el.addEventListener('wheel', onWheel, { passive: false })
        lastEl = el
      }
    },
    { immediate: true },
  )

  onBeforeUnmount(() => {
    cleanup()
  })
}
