<script setup lang="ts">
import { ref, watch } from 'vue'
import { t } from '@/i18n';
import { ElMessage } from 'element-plus';
import { number } from 'mathjs';
const dialogVisible = ref(true);
const isLoading = ref(false);
const amt1 = ref();
const amt2 = ref();
const emit = defineEmits(['close']);
const props = defineProps({
    amount: {
        type: number,
        default: 0
    }
})

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

    // isLoading.value = false;
};

const cancel = () => {
    dialogVisible.value = false;
};

watch(() => amt1.value, (newVal, oldVal) => {

})

const calculate = () => {
    if (amt1.value >= 1000) {
        ElMessage.error('Exceeds maximum value');
        return;
    }
    amt2.value = 1000 - amt1.value;
};
</script>

<template>
    <el-dialog v-model="dialogVisible" :title="$t('roverInscriptions.split.title')" :before-close="handleClose"
        @closed="afterClose">

        <div class="box">
            <div class="curtotal">Current total: <i>1000</i></div>
            <div class="w-full grid grid-cols-2 gap-5">
                <div class="item">
                    <p>Amount1</p>
                    <el-input v-model="amt1" :disabled="isLoading" placeholder="Split quantity" type="number"
                        @input="calculate"></el-input>
                </div>

                <div class="item">
                    <p>Amount2</p>
                    <el-input v-model="amt2" :disabled="true" placeholder="Split quantity" type="number"></el-input>
                </div>
            </div>
        </div>
        <div class="mora-button">
            <div class="cancel" @click="cancel">
                {{ $t('roverDashboard.subscriptions.removeComponent.cancel') }}
            </div>
            <div class="confirm" :class="{
        loading: isLoading,
        disabled: !amt1,
    }
        " @click="confirm">
                <img src="@/assets/svg/loading.svg" v-if="isLoading" />
                {{ $t('roverInscriptions.button.t4') }}
            </div>
        </div>
    </el-dialog>
</template>

<style lang="less" scoped>
.box {
    @apply w-full px-8 <sm:(px-3);

    .curtotal {
        @apply w-full rounded-lg py-2 mb-5 bg-purple-50;

        i {
            @apply not-italic text-purple-500 font-medium;
        }
    }

    .item {
        @apply w-full relative;

        p {
            @apply block text-left pb-2 text-sm;
        }

        .el-input {
            @apply h-11 bg-light-500 rounded-lg dark:(bg-transparent);

            &.is-disabled {
                .el-input__wrapper {
                    @apply !bg-transparent !shadow-transparent;
                }
            }
        }
    }

}

.mora-button {
    @apply px-8 <sm:(px-3);
}
</style>
