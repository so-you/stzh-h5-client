<template>
  <view class="login-page">
    <view class="login-header">
      <text class="app-title">{{ $t('brand.brandName') }}</text>
      <text class="app-subtitle">{{ $t('auth.login') }}</text>
    </view>

    <view class="login-form">
      <view class="form-item">
        <input
          v-model="form.username"
          class="form-input"
          type="text"
          :placeholder="$t('auth.username')"
          :placeholder-style="'color: #9CA3AF'"
        />
      </view>
      <view class="form-item">
        <input
          v-model="form.password"
          class="form-input"
          type="password"
          :placeholder="$t('auth.password')"
          :placeholder-style="'color: #9CA3AF'"
        />
      </view>

      <button class="btn-primary" :disabled="loading" @tap="handleLogin">
        {{ loading ? $t('common.loading') : $t('auth.loginBtn') }}
      </button>

      <view class="demo-account">
        <text class="demo-title">{{ $t('auth.demoAccountTitle') }}</text>
        <text class="demo-line">customer01 / demo1234</text>
      </view>
    </view>

    <view class="login-footer">
      <text class="footer-text">{{ $t('auth.noAccount') }}</text>
      <text class="footer-link" @tap="goRegister">{{ $t('auth.goRegister') }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '../../stores/user'

const { t } = useI18n()
const userStore = useUserStore()
const loading = ref(false)

const form = reactive({
  username: '',
  password: '',
})

async function handleLogin() {
  if (!form.username.trim()) {
    uni.showToast({ title: t('auth.usernameRequired'), icon: 'none' })
    return
  }
  if (!form.password) {
    uni.showToast({ title: t('auth.passwordRequired'), icon: 'none' })
    return
  }

  loading.value = true
  try {
    await userStore.login(form.username.trim(), form.password)
    uni.showToast({ title: t('auth.loginSuccess'), icon: 'success' })
    uni.reLaunch({ url: '/pages/home/index' })
  } catch (err: unknown) {
    const message =
      (err as { message?: string; response?: { data?: { message?: string } } })?.message ||
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
      t('common.error')
    uni.showToast({ title: message, icon: 'none' })
  } finally {
    loading.value = false
  }
}

function goRegister() {
  uni.navigateTo({ url: '/pages/auth/register' })
}
</script>

<style lang="scss" scoped>
@import '../../styles/theme.scss';

.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 $space-lg;
  background-color: $bg-page;
}

.login-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 80rpx;
}

.app-title {
  font-size: 56rpx;
  font-weight: $font-weight-bold;
  color: $brand-primary;
  margin-bottom: 16rpx;
}

.app-subtitle {
  font-size: 32rpx;
  color: $text-secondary;
}

.login-form {
  width: 100%;
}

.form-item {
  margin-bottom: $space-md;
}

.form-input {
  width: 100%;
  height: 96rpx;
  padding: 0 $space-md;
  font-size: 32rpx;
  border: 1rpx solid $border-color;
  border-radius: $radius-md;
  background-color: $bg-card;
  color: $text-primary;
}

.btn-primary {
  width: 100%;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $brand-gradient;
  color: #ffffff;
  font-size: 34rpx;
  font-weight: $font-weight-semibold;
  border-radius: $radius-md;
  margin-top: $space-xl;
}

.btn-primary[disabled] {
  opacity: 0.6;
}

.demo-account {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-xs;
  margin-top: $space-md;
  padding: $space-sm;
  border-radius: $radius-md;
  background-color: $bg-card;
  border: 1rpx solid $border-color;
}

.demo-title {
  font-size: 26rpx;
  color: $text-secondary;
}

.demo-line {
  font-size: 28rpx;
  color: $text-primary;
  font-weight: $font-weight-medium;
}

.login-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: $space-xl;
  gap: $space-xs;
}

.footer-text {
  font-size: 28rpx;
  color: $text-placeholder;
}

.footer-link {
  font-size: 28rpx;
  color: $brand-primary;
  font-weight: $font-weight-medium;
}
</style>
