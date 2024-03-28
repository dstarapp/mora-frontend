<template>
    <el-dialog :title="$t('planetSettings.recover.title')" v-model="dialogVisible" :before-close="handleClose"
        @closed="afterClose">
        <div class="list">
            <div class="item">
                <el-input v-model="PID" :placeholder="$t('planetSettings.writer.placeholder')" type="text" />
            </div>
            <div class="tip">
                <p>
                    <i class="iconfont icon-warning"></i>
                    This owner permission only has the ability to transfer planets. It is
                    recommended to set it as a global identity.
                </p>
            </div>
        </div>
        <div class="mora-button">
            <div class="cancel" @click="cancel">
                {{ $t('planetSettings.writer.cancel') }}
            </div>
            <div class="confirm" :class="PID ? '' : isLoading ? isLoading : 'disabled'" @click="confirm">
                <img src="@/assets/svg/loading.svg" v-if="isLoading" />
                {{ $t('planetSettings.writer.confirm') }}
            </div>
        </div>
    </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, inject } from 'vue';
import { t } from '@/i18n';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Principal } from '@dfinity/principal';
import { isPrincipalString } from '@/utils/functions';
import { useRoute, useRouter } from 'vue-router';
import debug from '@/utils/debug';

export default defineComponent({
    name: 'Updates',
    emits: ['componentClose'],
    props: {
        componentData: {
            type: Object || Array,
            default: [],
        },
    },
    setup(props, context) {
        const route = useRoute();
        const router = useRouter();
        const dialogVisible = ref(true);
        const isLoading = ref();
        const PID = ref();
        const planetCanister: any = inject('planetCanister', null);

        const handleClose = () => {
            if (isLoading.value) {
                ElMessage.warning(t('planetSettings.owner.loading'));
                return;
            }
            dialogVisible.value = false;
        };

        const afterClose = () => {
            context.emit('componentClose');
        };

        const cancel = () => {
            dialogVisible.value = false;
        };

        const confirm = async () => {
            if (isLoading.value) {
                return;
            }
            isLoading.value = true;
            if (!isPrincipalString(PID.value)) {
                ElMessage.error(t('planetSettings.owner.pidError'));
                isLoading.value = false;
                return;
            }
            try {
                let res = await planetCanister.value.setRecoverOwner(Principal.fromText(PID.value));
                if (res) {
                    isLoading.value = false;
                    ElMessage.success('Recover update success');

                    handleClose();
                }
            } catch (err) {
                debug('transfer failed', err);
                ElMessage.error('Recover update error');
            }
        };

        onMounted(() => { });

        return {
            dialogVisible,
            isLoading,
            handleClose,
            afterClose,
            cancel,
            confirm,
            PID,
        };
    },
});
</script>

<style scoped lang="less">
:deep(.el-dialog) {
    .el-dialog__header {
        .margin(35, 0, 0, 0);
    }
}

.list {
    display: flex;
    flex-direction: column;
    .padding(0, 35, 0, 35);

    .item {
        display: flex;
        .margin(0, 0, 5, 0);

        :deep(.el-input) {
            // display: flex;
            flex: 1;
            height: 45px;

            .el-input__wrapper {
                .padding(0, 0, 0, 16);
                background: @bg-color-grey;
                .border-radius(10);
            }
        }
    }

    .tip {
        display: flex;
        flex: 1;
        color: @color-error;
        margin-top: 3px;

        i {
            margin-right: 5px;
        }

        p {
            font-size: 12px;
            line-height: 16px;
            text-align: left;
        }
    }
}

@media screen and (min-width: 0) and (max-width: 750px) {
    .list {
        .padding(0, 15, 0, 15);
    }
}
</style>
