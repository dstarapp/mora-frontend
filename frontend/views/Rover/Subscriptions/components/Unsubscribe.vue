<template>
    <el-dialog v-model="dialogVisible" :title="$t('roverDashboard.subscriptions.removeComponent.title')"
        :before-close="handleClose" @closed="afterClose">
        <div class="text">
            {{ $t('roverDashboard.subscriptions.removeComponent.text') }}
        </div>

        <div class="planetid">
            <input type="text" v-model="pidConfirm" :placeholder="$t('roverDashboard.unsubplaceholder')" />
        </div>

        <div class="mora-button">
            <div class="cancel" @click="cancel">
                {{ $t('roverDashboard.subscriptions.removeComponent.cancel') }}
            </div>
            <div class="confirm" :class="{
        loading: isLoading,
        disabled: !isPrincipalString(pidConfirm),
    }" @click="confirm">
                <img src="@/assets/svg/loading.svg" v-if="isLoading" />
                {{ $t('roverDashboard.subscriptions.removeComponent.confirm') }}
            </div>
        </div>
    </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, inject } from 'vue';
import { t } from '@/i18n';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import debug from '@/utils/debug';
import { isPrincipalString } from '@/utils/functions';

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
        const pidConfirm = ref();

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
            isLoading.value = true;
            if (pidConfirm.value !== props.componentData.canister.toString()) {
                ElMessage.error(t('roverSubscriptions.unsubscribeError'));
                isLoading.value = false;
                return;
            }
            try {
                let res = await planetCanister.value.unsubscribe();
                if (res) {
                    get_subscribes_canister();
                    handleClose();
                    ElMessage.success(
                        t('roverDashboard.subscriptions.removeComponent.closeSuccess'),
                    );
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

        onMounted(() => { });

        return {
            dialogVisible,
            isLoading,
            pidConfirm,
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
.text {
    display: flex;
    font-style: normal;
    .font-size(16);
    .line-height(23);
    color: @text-color;
    text-align: left;
    .padding(0, 20, 0, 20);
    @apply dark:(text-light-900/80);
    word-break: normal;
}

.planetid {
    @apply mt-5 h-11 border border-gray-200 rounded-lg overflow-hidden mx-5 <sm:(mx-15px) dark:(border-dark-100);

    input {
        @apply w-full border-transparent w-full pl-3 h-full dark:(bg-dark-500);

        &::placeholder {
            @apply text-sm;
        }
    }
}

.mora-button {
    @apply px-5;
}

@media screen and (min-width: 0) and (max-width: 750px) {
    .text {
        .font-size(16);
        .line-height(20);
        .padding(0, 15, 0, 15);
    }
}
</style>
