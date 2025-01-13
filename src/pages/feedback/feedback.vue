<!-- 使用 type="home" 属性设置首页，其他页面不需要设置，默认为page；推荐使用json5，更强大，且允许注释 -->
<route lang="json5">
{
  style: {
    // navigationStyle: 'custom',
    navigationBarTitleText: '反馈',
    navigationBarBackgroundColor: '#00A3FF',
    navigationBarTextStyle: 'white',
  },
}
</route>
<template>
  <view class="overflow-hidden pt-2 px-4" :style="{ marginTop: safeAreaInsets?.top + 'px' }">
    <view class="text-36rpx font-bold mt-50rpx mb-50rpx text-center">反馈意见</view>
    <view class="color-#666 text-30rpx ml-40rpx mr-40rpx mb-50rpx text-center">
      您的以及是我们进步的阶梯！
    </view>

    <wd-form ref="form" :model="formModel">
      <view
        class="pt-24rpx"
        style="background: #fff; border-radius: 20rpx; box-shadow: rgb(0 0 0 / 15%) 0px 2px 4px"
      >
        <wd-cell-group border>
          <wd-input
            label="手机品牌"
            label-width="80px"
            prop="model_name"
            clearable
            v-model="formModel.model_name"
            placeholder="请输入手机品牌"
            :rules="[{ required: true, message: '请填写手机品牌' }]"
          />
        </wd-cell-group>
        <wd-cell-group border>
          <wd-input
            label="手机型号"
            label-width="80px"
            prop="phone_name"
            clearable
            v-model="formModel.phone_name"
            placeholder="请输入手机型号"
            :rules="[{ required: true, message: '请填写手机型号' }]"
          />
        </wd-cell-group>
        <wd-cell-group border>
          <wd-input
            label="联系方式"
            label-width="80px"
            prop="phone"
            clearable
            v-model="formModel.phone"
            placeholder="请输入联系方式"
            :rules="[{ required: true, message: '请填写联系方式' }]"
          />
        </wd-cell-group>
        <wd-cell-group border>
          <wd-input
            label="建议"
            label-width="80px"
            prop="content"
            clearable
            v-model="formModel.content"
            placeholder="请输入建议"
            :rules="[{ required: true, message: '请填写建议' }]"
          />
        </wd-cell-group>
        <view class="p-24rpx mb-48rpx important-pb-48rpx">
          <wd-button type="primary" size="large" @click="handleSubmit" block>提交</wd-button>
        </view>
      </view>
    </wd-form>
  </view>
</template>

<script lang="ts" setup>
import PLATFORM from '@/utils/platform'
import { useToast } from 'wot-design-uni'
import { httpPost } from '@/utils/http'
import { useUserStore } from '@/store'

const userStore = useUserStore()
const userInfo = computed(() => {
  return userStore.userInfo
})

const { success: showSuccess } = useToast()

defineOptions({
  name: 'Feedback',
})

const formModel = reactive({
  model_name: '',
  phone_name: '',
  phone: userInfo.value.phone,
  content: '',
})

// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()

const yhxy = (e) => {
  uni.navigateTo({
    url: '/pages/yhxy-page/yhxy-page',
  })
}
const ysxy = (e) => {
  uni.navigateTo({
    url: '/pages/ysxy-page/ysxy-page',
  })
}
const form = ref()
const handleSubmit = () => {
  form.value
    .validate()
    .then(({ valid, errors }) => {
      if (valid) {
        httpPost('/api/Index/saveFeedback', formModel).then((res) => {
          showSuccess({
            msg: '提交成功',
          })
        })

        formModel.model_name = ''
        formModel.phone_name = ''
        formModel.phone = ''
        formModel.content = ''
      }
    })
    .catch((error) => {
      console.log(error, 'error')
    })
}
// 测试 uni API 自动引入
onLoad(() => {})
</script>

<style>
page {
  background: #f9f9f9;
}
</style>
