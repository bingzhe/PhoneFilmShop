<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationBarTitleText: '注册',
    navigationBarBackgroundColor: '#23B7EB',
    navigationBarTextStyle: 'white',
  },
}
</route>

<template>
  <view class="register-page">
    <view class="logo-container">
      <image class="logo-image" src="/static/images/search-btn.jpg" mode="aspectFill"></image>
    </view>

    <view class="login-wrapper">
      <input
        class="loginInput"
        placeholder="手机号"
        placeholder-class="placeholderClass"
        v-model="formModel.username"
      />

      <input
        class="loginInput"
        placeholder="邀请ID"
        placeholder-class="placeholderClass"
        v-model="formModel.invitation_id"
      />

      <input
        class="loginInput"
        type="password"
        placeholder="密码"
        placeholder-class="placeholderClass"
        v-model="formModel.password"
      />

      <input
        class="loginInput"
        placeholder="公司名"
        placeholder-class="placeholderClass"
        v-model="formModel.company_name"
      />

      <input
        class="loginInput"
        placeholder="姓名"
        placeholder-class="placeholderClass"
        v-model="formModel.name"
      />

      <wd-col-picker
        v-model="formModel.area_value"
        auto-complete
        :columns="area"
        :column-change="columnChange"
        @confirm="handleAreaConfirm"
        placeholder="请选择省市区"
        custom-class="loginInput-cus"
      ></wd-col-picker>

      <input
        class="loginInput"
        placeholder="详细地址"
        placeholder-class="placeholderClass"
        v-model="formModel.address"
      />

      <view class="login_button" @click="registerAction">注册</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useColPickerData } from '@/hooks/useColPickerData'
import { registerGetOpenid } from '@/utils/wxLogin'
import { useToast } from 'wot-design-uni'
import { httpPost } from '@/utils/http'

const formModel = ref({
  username: '',
  invitation_id: '',
  password: '',
  company_name: '',
  name: '',
  area_value: [],
  province_name: '',
  province_id: '',
  city_name: '',
  city_id: '',
  area_name: '',
  area_id: '',
  address: '',
})

const { colPickerData, findChildrenByCode } = useColPickerData()
const toast = useToast()

// 数据
const openid = ref('')

const area = ref<any[]>([])

const columnChange = async ({ selectedItem, resolve, finish }) => {
  // 模拟异步请求
  await sleep(0.1)
  const areaData = findChildrenByCode(colPickerData, selectedItem.value)
  if (areaData && areaData.length) {
    resolve(
      areaData.map((item) => {
        return {
          value: item.value,
          label: item.text,
        }
      }),
    )
  } else {
    finish()
  }
}

// 获取OpenID
const getRegisterOpenid = async () => {
  try {
    const result = await registerGetOpenid()
    // console.log('result', result)
    openid.value = result as string
    console.log('openid', openid.value)
  } catch (error) {
    console.error('获取openid失败', error)
  }
}

// 注册操作
const registerAction = async () => {
  if (!formModel.value.username) {
    toast.warning('请输入手机号')
    return
  }

  if (!formModel.value.invitation_id) {
    toast.warning('请输入邀请ID')
    return
  }

  if (!formModel.value.password) {
    toast.warning('请输入密码')
    return
  }

  if (!formModel.value.company_name) {
    toast.warning('请输入公司名')
    return
  }

  if (!formModel.value.name) {
    toast.warning('请输入姓名')
    return
  }

  if (formModel.value.area_value.length === 0) {
    toast.warning('请选择省市区')
    return
  }

  if (!formModel.value.address) {
    toast.warning('请输入详细地址')
    return
  }

  const params = {
    openid: openid.value,
    username: formModel.value.username,
    password: formModel.value.password,
    invitation_id: formModel.value.invitation_id,
    name: formModel.value.name,
    company_name: formModel.value.company_name,
    address: formModel.value.address,
    province: formModel.value.province_name,
    city: formModel.value.city_name,
    area: formModel.value.area_name,
  }

  // console.log(params)

  try {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const result = await httpPost('/api/Login/Register', params)

    if (result.code === 200) {
      toast.success('注册成功')
      setTimeout(() => {
        goBack()
      }, 1500)
    } else {
      toast.error(result.meg)
    }
  } catch (error) {
    console.error('注册失败', error)
    toast.error('注册失败，请重试')
  }
}

// 返回
const goBack = () => {
  uni.navigateBack({
    delta: 1,
  })
}

function sleep(second: number = 1) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true)
    }, 1000 * second)
  })
}

function handleAreaConfirm({ value, selectedItems }) {
  formModel.value.province_name = selectedItems[0].label
  formModel.value.province_id = selectedItems[0].value
  formModel.value.city_name = selectedItems[1].label
  formModel.value.city_id = selectedItems[1].value
  formModel.value.area_name = selectedItems[2].label
  formModel.value.area_id = selectedItems[2].value
}

// 生命周期
onMounted(() => {
  getRegisterOpenid()
})
</script>

<style lang="scss">
page {
  background: linear-gradient(to top, #fff 0%, #fff 20%, #23b7eb 100%);
}
</style>

<style lang="scss" scoped>
.register-page {
  //   height: 100vh;
}

.logo-container {
  padding-top: 10%;
  text-align: center;
}

.logo-image {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
}

.login-wrapper {
  margin-top: 5%;
}

.loginInput {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 600rpx;
  height: 88rpx;
  padding: 0rpx 40rpx;
  margin: 0 auto 20rpx;
  font-size: 30rpx;
  background: #eaf0f8;
  border-radius: 10rpx;
}

::v-deep .loginInput-cus {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 600rpx;
  height: 88rpx;
  padding: 0rpx 40rpx;
  margin: 0 auto 20rpx;
  font-size: 30rpx;
  background: #eaf0f8;
  border-radius: 10rpx;

  .wd-col-picker__cell {
    padding: 0;
    font-size: 30rpx;
    background-color: #eaf0f8;
  }

  .wd-col-picker__value--placeholder {
    color: #808080;
  }
}

.login_button {
  width: 600rpx;
  height: 88rpx;
  margin: 0 auto 60rpx;
  font-size: 32rpx;
  line-height: 88rpx;
  color: #ffffff;
  text-align: center;
  background: linear-gradient(to right, #68cef1 0%, #23b7eb 100%);
  border-radius: 10rpx;
}

.placeholderClass {
  font-size: 30rpx;
  color: #96b4dc;
}

.img_box {
  width: 60rpx;
  height: 100%;
}

.codeInput {
  width: 70%;
  height: 100%;
}

.border-error {
  border: 1px solid #ff3333;
}

.register-wrapper {
  width: 600rpx;
  margin: 10rpx auto;
  font-size: 14px;
  color: #23b7eb;
  text-align: right;
}

.active_font {
  color: #23b7eb;
}
</style>
