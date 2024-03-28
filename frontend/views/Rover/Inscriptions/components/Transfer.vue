<script setup lang="ts">
import { ref, reactive } from 'vue'
import { t } from '@/i18n';
import { ElMessage } from 'element-plus';
const dialogVisible = ref(true);
const addressVal = ref();
const isLoading = ref(false);
const priceVal = ref();
const currentTab = ref('free');

const emit = defineEmits(['close']);
const handleClose = () => {
    if (isLoading.value) {
        ElMessage.error(t('roverNft.address.isLoadingClose'));
        return false;
    }
    dialogVisible.value = false;
};

const afterClose = () => {
    emit('close');
};

const confirm = async () => {
    isLoading.value = true;
};

const cancel = () => {
    dialogVisible.value = false;
};

// tab
const chooseTab = (str: string) => {
    currentTab.value = str;
}
</script>

<template>
    <el-dialog v-model="dialogVisible" :title="$t('roverNft.address.title')" :before-close="handleClose"
        @closed="afterClose">
        <div class="box">
            <div class="item">
                <p>{{ $t('roverNft.address.address') }}</p>
                <el-input v-model="addressVal" :disabled="isLoading"
                    :placeholder="$t('roverNft.address.placeholder')"></el-input>
            </div>
            <div class="tab">
                <span :class="{ active: currentTab === 'free' }" @click="chooseTab('free')">Free</span>
                <span :class="{ active: currentTab === 'price' }" @click="chooseTab('price')">Width price</span>
            </div>

            <div class="item mt-5" v-if="currentTab === 'price'">
                <el-input v-model="priceVal" :disabled="isLoading"
                    :placeholder="$t('roverInscriptions.placeholder.transfer')" type="number"></el-input>
                <i>CKBTC</i>
            </div>
        </div>
        <div class="mora-button">
            <div class="cancel" @click="cancel">
                {{ $t('roverDashboard.subscriptions.removeComponent.cancel') }}
            </div>
            <div class="confirm" :class="{
        loading: isLoading,
        disabled: !addressVal,
    }
        " @click="confirm">
                <img src="@/assets/svg/loading.svg" v-if="isLoading" />
                {{ $t('roverDashboard.subscriptions.removeComponent.confirm') }}
            </div>
        </div>
    </el-dialog>
</template>

<style lang="less" scoped>
.box {
    @apply w-full px-8 <sm:(px-3);

    .item {
        @apply w-full relative;

        p {
            @apply block text-left pb-2;
        }

        .el-input {
            @apply h-11 bg-light-500 rounded-lg dark:(bg-transparent);
        }

        i {
            @apply absolute right-4 bottom-0 not-italic h-11 leading-11 text-sm;
        }
    }

    .tab {
        @apply w-full text-right mt-3;

        span {
            @apply px-2 py-1 border rounded-lg text-xs cursor-pointer transition duration-300 dark:(border-dark-50) hover:(border-gray-400 text-gray-500);

            &.active {
                @apply border-purple-500 text-purple-500;
            }

            &:first-child {
                @apply mr-2;
            }
        }
    }
}

.mora-button {
    @apply px-8 <sm:(px-3);
}
</style>
