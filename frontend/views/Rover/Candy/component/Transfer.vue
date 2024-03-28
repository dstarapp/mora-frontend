<template>
    <el-dialog v-model="dialogVisible" :title="$t('roverSetting.identity.transfer')" :before-close="handleClose"
        @closed="afterClose">
        <div class="pid">
            <el-input v-model="PID" :placeholder="$t('roverSetting.transfer.placeholder')" class="mora-input"
                :class="{ active: isFocus }" @focus="isFocus = true" @blur="isFocus = false"></el-input>
        </div>
        <div class="mora-button">
            <div class="cancel" @click="cancel">
                {{ $t('planetTips.updates.cancel') }}
            </div>
            <div class="confirm" :class="{ loading: isLoading }" @click="confirm">
                <img src="@/assets/svg/loading.svg" v-if="isLoading" />
                {{ $t('roverSetting.confirm') }}
            </div>
        </div>
    </el-dialog>
</template>

<script lang="ts">
import { t } from '@/i18n';
import { ElMessage } from 'element-plus';
import { isPrincipalString } from '@/utils/functions';
import { defineComponent, ref, onMounted } from 'vue';

export default defineComponent({
    name: 'Remove',
    props: {
        componentData: { type: Array, default: [] },
    },
    emits: ['componentClose', 'transferSubmit'],
    setup(props, context) {
        const dialogVisible = ref(true);
        const isLoading = ref(false);
        const PID = ref();
        const isFocus = ref(false);
        const handleClose = () => {
            if (isLoading.value) {
                ElMessage.error(t('roverDashboard.subscriptions.removeComponent.closeLoading'));
                return false;
            }
            dialogVisible.value = false;
        };

        const afterClose = () => {
            context.emit('componentClose');
        };

        const confirm = () => {
            if (!PID.value) {
                ElMessage.error(t('roverSetting.transfer.emptyError'));
                return;
            }
            if (!isPrincipalString(PID.value)) {
                ElMessage.error(t('roverSetting.transfer.principalError'));
                return;
            }
            isLoading.value = true;
            context.emit('transferSubmit', PID.value);
        };

        const cancel = () => {
            dialogVisible.value = false;
        };

        onMounted(() => { });

        return {
            dialogVisible,
            isLoading,
            PID,
            isFocus,
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
