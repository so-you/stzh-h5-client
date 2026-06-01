<template>
  <view class="profile-page">
    <view class="form-card">
      <view class="form-item">
        <text class="form-label">{{ $t('profile.displayName') }}</text>
        <input
          v-model="form.displayName"
          class="form-input"
          type="text"
          :placeholder="$t('profile.displayNamePlaceholder')"
          :placeholder-style="'color: #9CA3AF'"
        />
      </view>
      <view class="form-item">
        <text class="form-label">{{ $t('profile.contactPhone') }}</text>
        <input
          v-model="form.contactPhone"
          class="form-input"
          type="text"
          :placeholder="$t('profile.contactPhonePlaceholder')"
          :placeholder-style="'color: #9CA3AF'"
        />
      </view>
      <view class="form-item">
        <text class="form-label">{{ $t('profile.email') }}</text>
        <input
          v-model="form.email"
          class="form-input"
          type="text"
          :placeholder="$t('profile.emailPlaceholder')"
          :placeholder-style="'color: #9CA3AF'"
        />
      </view>
      <view class="form-item">
        <text class="form-label">{{ $t('profile.nationality') }}</text>
        <input
          v-model="form.nationality"
          class="form-input"
          type="text"
          :placeholder="$t('profile.nationalityPlaceholder')"
          :placeholder-style="'color: #9CA3AF'"
        />
      </view>
    </view>

    <button class="save-button" :loading="saving" :disabled="saving" @tap="saveProfile">
      {{ $t('profile.save') }}
    </button>
  </view>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useI18n } from 'vue-i18n'
import { updateProfile } from '../../api/user'
import { useUserStore } from '../../stores/user'

const { t } = useI18n()
const userStore = useUserStore()
const saving = ref(false)

const form = reactive({
  displayName: '',
  contactPhone: '',
  email: '',
  nationality: '',
})

onShow(async () => {
  if (userStore.isLoggedIn) {
    await userStore.fetchProfile().catch(() => undefined)
    fillForm()
  }
})

function fillForm() {
  const user = userStore.userInfo
  form.displayName = user?.displayName || ''
  form.contactPhone = user?.contactPhone || ''
  form.email = user?.email || ''
  form.nationality = user?.nationality || ''
}

async function saveProfile() {
  saving.value = true
  try {
    await updateProfile({
      displayName: form.displayName.trim() || undefined,
      contactPhone: form.contactPhone.trim() || undefined,
      email: form.email.trim() || undefined,
      nationality: form.nationality.trim() || undefined,
    })
    await userStore.fetchProfile().catch(() => undefined)
    uni.showToast({ title: t('profile.saveSuccess'), icon: 'success' })
    setTimeout(() => {
      uni.navigateBack()
    }, 500)
  } catch (err: unknown) {
    const message =
      (err as { message?: string; response?: { data?: { message?: string } } })?.message ||
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
      t('common.error')
    uni.showToast({ title: message, icon: 'none' })
  } finally {
    saving.value = false
  }
}
</script>

<style lang="scss" scoped>
@import '../../styles/theme.scss';

.profile-page {
  min-height: 100vh;
  padding: $space-md $space-lg 120rpx;
  background-color: $bg-page;
}

.form-card {
  background-color: $bg-card;
  border-radius: $radius-md;
  border: 1rpx solid $border-color;
  overflow: hidden;
}

.form-item {
  padding: $space-md $space-lg;
  border-bottom: 1rpx solid $divider-color;
}

.form-item:last-child {
  border-bottom: none;
}

.form-label {
  display: block;
  margin-bottom: $space-xs;
  font-size: $font-sm;
  color: $text-secondary;
}

.form-input {
  width: 100%;
  height: 64rpx;
  font-size: $font-base;
  color: $text-primary;
}

.save-button {
  margin-top: $space-lg;
  width: 100%;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-md;
  background: $brand-gradient;
  color: #ffffff;
  font-size: $font-md;
  font-weight: $font-weight-semibold;
}

.save-button[disabled] {
  opacity: 0.65;
}
</style>
