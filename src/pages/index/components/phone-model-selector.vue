<template>
  <wd-popup v-model="show" custom-style="border-radius: 32rpx;" :z-index="9999" @close="close">
    <view class="popup-content">
      <view class="popup-title">请选择您的手机型号</view>
      <view class="popup-desc">我们无法准确识别您的手机型号，请从以下列表中选择</view>

      <view class="model-list">
        <view
          v-for="(model, index) in candidateModels"
          :key="index"
          class="model-item"
          :class="{ active: selectedModel === model }"
          @click="selectModel(model)"
        >
          {{ model }}
        </view>
      </view>

      <view class="popup-actions">
        <wd-button block type="primary" custom-class="confirm-btn" @click="confirmSelection">
          确认选择
        </wd-button>
      </view>
    </view>
  </wd-popup>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'

const show = ref(false)
const selectedModel = ref('')

const props = defineProps<{
  candidateModels: string[]
  showSelector: boolean
}>()

const emit = defineEmits(['confirm', 'close'])

watch(
  () => props.showSelector,
  (newVal) => {
    show.value = newVal
  },
)

const selectModel = (model: string) => {
  selectedModel.value = model
}

const confirmSelection = () => {
  if (selectedModel.value) {
    emit('confirm', selectedModel.value)
    show.value = false
  }
}

const close = () => {
  emit('close')
}
</script>

<style lang="scss" scoped>
.popup-content {
  box-sizing: border-box;
  width: 650rpx;
  padding: 40rpx;
}

.popup-title {
  margin-bottom: 20rpx;
  font-size: 36rpx;
  font-weight: bold;
  color: #000;
  text-align: center;
}

.popup-desc {
  margin-bottom: 40rpx;
  font-size: 28rpx;
  line-height: 1.5;
  color: #666;
  text-align: center;
}

.model-list {
  max-height: 400rpx;
  margin-bottom: 40rpx;
  overflow-y: auto;
}

.model-item {
  padding: 24rpx 30rpx;
  margin-bottom: 16rpx;
  font-size: 28rpx;
  color: #333;
  text-align: center;
  background-color: #f5f5f5;
  border-radius: 16rpx;
  transition: all 0.3s;

  &.active {
    color: #fff;
    background-color: #003da5;
  }

  &:last-child {
    margin-bottom: 0;
  }
}

.popup-actions {
  margin-top: 40rpx;
}

.confirm-btn {
  height: 88rpx;
  font-size: 32rpx;
  line-height: 88rpx;
  background-color: #003da5 !important;
  border-radius: 16rpx;
}
</style>
