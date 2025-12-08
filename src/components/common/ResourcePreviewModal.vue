<template>
  <n-modal
    v-model:show="show"
    preset="card"
    :title="resource?.title || '资源预览'"
    style="width: 900px; max-width: 95vw;"
    :on-after-leave="handleClose"
  >
    <div class="preview-container">
      <!-- 视频预览 -->
      <div v-if="resource?.res_type === 'video'" class="video-wrapper relative">
        <video 
          ref="videoPlayer" 
          class="video-js vjs-default-skin vjs-big-play-centered" 
          controls 
          preload="auto"
          style="width: 100%; height: 500px;"
        >
          <source :src="resource.file_url" type="video/mp4" />
        </video>
        <!-- 弹幕层 -->
        <div ref="danmakuContainer" class="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden"></div>
      </div>

      <!-- 弹幕输入栏 (仅视频模式显示) -->
      <div v-if="resource?.res_type === 'video'" class="mt-4 bg-gray-100 p-3 rounded-lg flex items-center gap-3 shadow-inner">
        <!-- 颜色选择 -->
        <div class="flex items-center gap-1">
          <n-tooltip trigger="hover" v-for="color in predefinedColors" :key="color.value">
            <template #trigger>
              <div 
                class="w-6 h-6 rounded-full cursor-pointer border-2 transition-all"
                :class="danmakuColor === color.value ? 'border-blue-500 scale-110' : 'border-gray-300 hover:scale-110'"
                :style="{ backgroundColor: color.value }"
                @click="danmakuColor = color.value"
              ></div>
            </template>
            {{ color.label }}
          </n-tooltip>
        </div>

        <!-- 输入框 -->
        <div class="flex-1">
           <n-input 
            v-model:value="danmakuContent" 
            placeholder="发个友善的弹幕见证当下" 
            @keyup.enter="handleSendDanmaku"
            round
            class="danmaku-input"
          >
            <template #suffix>
              <n-button 
                type="primary" 
                size="small" 
                @click="handleSendDanmaku" 
                :loading="sending"
                :disabled="!danmakuContent.trim()"
                round
              >
                发送
              </n-button>
            </template>
          </n-input>
        </div>
      </div>

      <!-- 文档/图片预览 (使用 iframe) -->
      <div v-else-if="canIframePreview" class="iframe-wrapper">
        <iframe :src="resource.file_url" width="100%" height="600px" frameborder="0"></iframe>
      </div>

      <!-- 不支持的格式 -->
      <div v-else class="flex flex-col items-center justify-center h-[400px] bg-gray-50 w-full bg-white">
        <n-icon size="64" :component="DocumentTextOutline" class="text-gray-300 mb-4" />
        <p class="text-gray-500 mb-4">该格式暂不支持在线预览</p>
        <n-button type="primary" @click="downloadResource">下载查看</n-button>
      </div>
    </div>
  </n-modal>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount, nextTick } from 'vue'
import { NModal, NIcon, NButton, NInput, NTooltip, useMessage } from 'naive-ui'
import { DocumentTextOutline } from '@vicons/ionicons5'
import videojs from 'video.js'
import Danmaku from 'danmaku'
import { getDanmakuList, sendDanmaku } from '../../api/danmaku'

const props = defineProps({
  show: Boolean,
  resource: Object
})

const emit = defineEmits(['update:show'])
const message = useMessage()

const videoPlayer = ref(null)
const player = ref(null)
const danmakuContainer = ref(null)
const danmakuInstance = ref(null)

const danmakuContent = ref('')
const danmakuColor = ref('#FFFFFF')
const sending = ref(false)

const predefinedColors = [
  { label: '白色', value: '#FFFFFF' },
  { label: '红色', value: '#FE0302' },
  { label: '黄色', value: '#FFD302' },
  { label: '蓝色', value: '#00A1D6' },
  { label: '绿色', value: '#73D525' },
]

const show = computed({
  get: () => props.show,
  set: (val) => emit('update:show', val)
})

// 监听资源变化，初始化或更新播放器
watch(() => props.resource, (val) => {
  if (val && val.res_type === 'video' && props.show) {
    nextTick(() => {
      initPlayer()
    })
  }
}, { deep: true })

// 监听弹窗显示，初始化播放器
watch(() => props.show, (val) => {
  if (val && props.resource?.res_type === 'video') {
    nextTick(() => {
      initPlayer()
    })
  } else if (!val) {
    disposePlayer()
  }
})

const initPlayer = async () => {
  if (player.value) {
    player.value.src({ src: props.resource.file_url, type: 'video/mp4' })
  } else if (videoPlayer.value) {
    player.value = videojs(videoPlayer.value, {
      controls: true,
      fluid: false,
      sources: [{
        src: props.resource.file_url,
        type: 'video/mp4'
      }]
    })
    
    // 初始化弹幕
    initDanmaku()
  }
}

const initDanmaku = async () => {
  if (!danmakuContainer.value || !player.value) return
  
  // 销毁旧实例
  if (danmakuInstance.value) {
    danmakuInstance.value.destroy()
  }

  danmakuInstance.value = new Danmaku({
    container: danmakuContainer.value,
    media: videoPlayer.value, // 绑定 video 元素以同步时间
    comments: [],
    engine: 'dom' // 使用 DOM 引擎，兼容性好
  })

  // 加载弹幕列表
  try {
    const res = await getDanmakuList(props.resource.id)
    if (res.code === 0 && res.data) {
      const comments = res.data.map(d => ({
        text: d.content,
        time: d.time, // 前端接收的 JSON 字段名仍为 time (由 model 的 json tag 决定)
        style: {
          fontSize: '20px',
          color: d.color,
          textShadow: '1px 1px 2px black', // 增加描边效果
        },
        mode: 'rtl' // 既然数据库没 type 字段，暂时默认滚动
      }))
      // 直接替换 comments 可能会有问题，使用 emit 批量发送或者 reset
      // danmaku 库好像不支持直接 reset comments，但如果初始化时传入空，后面可以 emit
      // 其实 Danmaku 构造函数接收 comments，我们可能需要重新 new 或者 遍历 emit
      // 文档说 new Danmaku({ comments: [...] })
      // 让我们重新初始化带数据的
      danmakuInstance.value.destroy()
      danmakuInstance.value = new Danmaku({
        container: danmakuContainer.value,
        media: videoPlayer.value,
        comments: comments,
        engine: 'dom'
      })
    }
  } catch (e) {
    console.error('Failed to load danmaku', e)
  }
}

const handleSendDanmaku = async () => {
  if (!danmakuContent.value.trim()) return
  if (!player.value) return

  sending.value = true
  try {
    const currentTime = player.value.currentTime()
    const payload = {
      resource_id: props.resource.id,
      content: danmakuContent.value,
      time: currentTime,
      color: danmakuColor.value,
      type: 0 // 默认滚动
    }

    const res = await sendDanmaku(payload)
    if (res.code === 0) {
      message.success('发送成功')
      // 本地立即显示
      danmakuInstance.value.emit({
        text: payload.content,
        mode: 'rtl',
        style: {
          fontSize: '20px',
          color: payload.color,
          border: '1px solid #fff', // 发送者高亮
          textShadow: '1px 1px 2px black',
        }
      })
      danmakuContent.value = ''
    } else {
      message.error(res.msg || '发送失败')
    }
  } catch (e) {
    message.error('发送失败')
  } finally {
    sending.value = false
  }
}

const disposePlayer = () => {
  if (danmakuInstance.value) {
    danmakuInstance.value.destroy()
    danmakuInstance.value = null
  }
  if (player.value) {
    player.value.dispose()
    player.value = null
  }
}

onBeforeUnmount(() => {
  disposePlayer()
})

const canIframePreview = computed(() => {
  if (!props.resource?.file_url) return false
  const ext = props.resource.file_url.split('.').pop().toLowerCase()
  return ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'txt'].includes(ext)
})

const downloadResource = () => {
  window.open(props.resource.file_url, '_blank')
}

const handleClose = () => {
  disposePlayer()
}
</script>

<style scoped>
.preview-container {
  min-height: 400px;
  display: flex;
  flex-direction: column;
  background: #f0f0f0;
}
.video-wrapper {
  width: 100%;
  background: black;
}
.iframe-wrapper {
  width: 100%;
  background: white;
}
.danmaku-input :deep(.n-input-wrapper) {
  padding-right: 4px;
}
</style>
