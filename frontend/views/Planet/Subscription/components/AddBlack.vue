<template>
    <el-dialog v-model="dialogVisible" :title="$t('planetSubscription.blacklistManage')" :before-close="handleClose"
        @closed="afterClose">
        <div class="addBlackBox">
            <el-input :disabled="isLoadingBlack || isLoadingWhite" v-model="pid"
                :placeholder="$t('planetSubscription.principalId')" />
            <div class="mora-button">
                <div class="cancel" :class="{
        loading: isLoadingBlack,
        disabled: !isPrincipalString(pid),
    }" @click="toBlackList">
                    <img src="@/assets/svg/loading2.svg" v-if="isLoadingBlack" />
                    {{ $t('planetSubscription.toBlackList') }}
                </div>

                <div class="confirm" :class="{
        loading: isLoadingWhite,
        disabled: !isPrincipalString(pid),
    }" @click="toWhitelist">
                    <img src="@/assets/svg/loading2.svg" v-if="isLoadingWhite" />
                    {{ $t('planetSubscription.toWhitelist') }}
                </div>
            </div>
        </div>
    </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, inject, onMounted } from 'vue';
import { t } from '@/i18n';
import { ElMessage } from 'element-plus';
import { isPrincipalString } from '@/utils/functions';
import debug from '@/utils/debug';
import { Principal } from '@dfinity/principal';

export default defineComponent({
    name: 'MetaBox',
    emits: ['componentClose'],
    props: {
        insertCallback: { type: Function },
    },
    components: {},
    setup(props, context) {
        const dialogVisible = ref(true);
        const pid = ref('');
        const isLoadingBlack = ref(false);
        const isLoadingWhite = ref(false);
        const planetCanister: any = inject('planetCanister', null);

        const handleClose = () => {
            dialogVisible.value = false;
        };

        const afterClose = () => {
            context.emit('componentClose');
        };

        const toBlackList = async () => {
            if (!isPrincipalString(pid.value)) {
                return;
            }
            if (isLoadingBlack.value || isLoadingWhite.value) {
                return;
            }
            isLoadingBlack.value = true;
            try {
                let res = await planetCanister.value.addBlackUser(Principal.fromText(pid.value));
                if (res) {
                    ElMessage.success(t('planetSubscription.blackListSuccess'));
                    isLoadingBlack.value = false;
                }
                handleClose();
            } catch (err) {
                debug('failed', err);
                handleClose();
            }
        };

        const toWhitelist = async () => {
            if (!isPrincipalString(pid.value)) {
                return;
            }
            if (isLoadingBlack.value || isLoadingWhite.value) {
                return;
            }
            isLoadingWhite.value = true;
            try {
                let res = await planetCanister.value.removeBlackUser(Principal.fromText(pid.value));
                if (res) {
                    ElMessage.success(t('planetSubscription.whiteListSuccess'));
                    isLoadingWhite.value = false;
                }
                handleClose();
            } catch (err) {
                debug('failed', err);
                handleClose();
            }
        };

        onMounted(() => { });

        return {
            dialogVisible,
            isLoadingBlack,
            isLoadingWhite,
            pid,
            isPrincipalString,
            handleClose,
            afterClose,
            toBlackList,
            toWhitelist,
        };
    },
});
</script>

<style scoped lang="less">
.addBlackBox {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 90%;
    margin-left: 5%;

    :deep(.el-input) {
        display: flex;
        height: 45px;

        .el-input__wrapper {
            .padding(0, 0, 0, 16);
            background: @bg-color-grey;
            .border-radius(10);
        }
    }

    .mora-button {
        display: flex;
        width: 100%;
        .margin(30, 0, 0, 0);
        padding: 0;

        .cancel {
            @apply bg-dark-500 text-light-50 transition duration-300 hover:(bg-dark-50 transition duration-300);

            &.disabled {
                @apply cursor-not-allowed;
            }
        }
    }
}
</style>
