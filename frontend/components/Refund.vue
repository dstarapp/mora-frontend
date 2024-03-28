<template>
    <el-dialog v-model="dialogVisible" :title="$t('subrefund.title')" :before-close="handleClose" @closed="afterClose">
        <div class="pid">
            <el-input v-model="address" placeholder="Wallet Address" class="mora-input" :class="{ active: isFocus }"
                @focus="isFocus = true" @blur="isFocus = false" />
        </div>
        <div class="mora-button">
            <div class="cancel" @click="cancel">
                {{ $t('roverDashboard.subscriptions.removeComponent.cancel') }}
            </div>
            <div class="confirm" :class="{
        disabled:
            isLoading || (!validatePrincipalId(address) && !validateAccountId(address)),
    }" @click="confirm">
                <img src="@/assets/svg/loading.svg" v-if="isLoading" />
                {{ $t('roverDashboard.subscriptions.removeComponent.confirm') }}
            </div>
        </div>
    </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, inject, onMounted } from 'vue';
import {
    validatePrincipalId,
    validateAccountId,
    get_account_id,
    fromHexString,
} from '@/utils/wallet';
import { ElMessage } from 'element-plus';
import { t } from '@/i18n';
import store from '@/store';

export default defineComponent({
    name: 'Refund',
    emits: ['componentClose'],
    props: {
        refundData: {},
        planetID: {
            type: String,
        },
    },
    setup(props, context) {
        const dialogVisible = ref(true);
        const isLoading = ref(false);
        const isFocus = ref(false);
        const address = ref('');
        const planetCanister: any = inject('planetCanister');

        const handleClose = () => {
            if (isLoading.value) {
                return false;
            }
            dialogVisible.value = false;
        };

        const afterClose = () => {
            context.emit('componentClose');
        };

        const confirm = async () => {
            if (
                isLoading.value ||
                (!validatePrincipalId(address.value) && !validateAccountId(address.value))
            ) {
                return;
            }

            isLoading.value = true;
            if (validatePrincipalId(address.value)) {
                address.value = get_account_id(address.value);
            }
            try {
                let res = await planetCanister.value.refundOrder(
                    props.refundData.id,
                    fromHexString(address.value),
                );
                if (res) {
                    isLoading.value = false;
                    handleClose();
                } else {
                    ElMessage.error(t('subOrder.refundFailure'));
                }
            } catch {
                ElMessage.error(t('subOrder.refundFailure'));
            }
        };

        const cancel = () => {
            dialogVisible.value = false;
        };

        return {
            dialogVisible,
            isLoading,
            address,
            isFocus,
            validatePrincipalId,
            validateAccountId,
            handleClose,
            afterClose,
            cancel,
            confirm,
        };
    },
});
</script>

<style lang="less" scoped>
.pid {
    .padding(5, 35, 5, 35);
}
</style>
