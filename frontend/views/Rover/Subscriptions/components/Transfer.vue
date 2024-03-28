<template>
    <el-dialog v-model="dialogVisible" :title="$t('roverDashboard.subscriptions.transfer.title')"
        :before-close="handleClose" @closed="afterClose" class="transfer">
        <div class="pid">
            <p>
                {{ $t('roverDashboard.transfer') }}
            </p>
            <el-input v-model="PID" placeholder="Principal ID" class="mora-input" :class="{ active: isFocus }"
                @focus="isFocus = true" @blur="isFocus = false"></el-input>
        </div>
        <div class="mora-button">
            <div class="cancel" @click="cancel">
                {{ $t('roverDashboard.subscriptions.removeComponent.cancel') }}
            </div>
            <div class="confirm" :class="{ disabled: !isPrincipalString(PID), loading: isLoading }" @click="confirm">
                <img src="@/assets/svg/loading.svg" v-if="isLoading" />
                {{ $t('roverDashboard.subscriptions.removeComponent.confirm') }}
            </div>
        </div>
    </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, inject } from 'vue';
import { t } from '@/i18n';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import { isPrincipalString } from '@/utils/functions';
import { Principal } from '@dfinity/principal';
import debug from '@/utils/debug';

export default defineComponent({
    name: 'Remove',
    props: {
        componentData: { type: Array, default: [] },
    },
    emits: ['componentClose'],
    setup(props, context) {
        const router = useRouter();
        const dialogVisible = ref(true);
        const isLoading = ref(false);
        const PID = ref();
        const isFocus = ref(false);
        const planetCanister: any = inject('planetCanister', null);
        const get_subscribes_canister: any = inject('get_subscribes_canister', null);

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
            if (!isPrincipalString(PID.value) || isLoading.value) {
                return;
            }
            isLoading.value = true;
            try {
                let res = await planetCanister.value.transferSubscribe(
                    Principal.fromText(PID.value),
                );
                if (res) {
                    get_subscribes_canister();
                    handleClose();
                    ElMessage.success(t('roverDashboard.subscriptions.transfer.transferSuccess'));
                    router.push({
                        name: 'roverPlanetSubscriptions',
                    });
                }
            } catch (err) {
                debug('failed', err);
            }
            isLoading.value = false;
        };

        const cancel = () => {
            dialogVisible.value = false;
        };

        return {
            dialogVisible,
            isLoading,
            PID,
            isFocus,
            isPrincipalString,
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
    .padding(0, 35, 5, 35);

    p {
        font-size: 13px;
        color: #999;
        width: 100%;
        text-align: left;
        margin-bottom: 5px;
    }
}
</style>
