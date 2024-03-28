<template>
    <transition name="slideleft">
        <div class="subbox">
            <img src="@/assets/svg/loading2.svg" />
            <span>{{ $t('planet.freeSubscribe') }}</span>
        </div>
    </transition>
</template>

<script lang="ts">
import { defineComponent, onMounted, inject } from 'vue';
import { ElMessage } from 'element-plus';
import { t } from '@/i18n';
import bus from 'vue3-eventbus';

export default defineComponent({
    emits: ['componentClose'],
    setup(props, context) {
        const planetCanister: any = inject('planetCanister', null);

        const init = async () => {
            let res = await planetCanister.value.preSubscribe('Mora', {
                price: 0,
                subType: {
                    Free: null,
                },
            });
            if (res.Err) {
                ElMessage.error(res.Err);
                context.emit('componentClose');
            }
            if (res.Ok) {
                let invoice = res.Ok.invoice.id;
                let subscribe = await planetCanister.value.subscribe(invoice);
                if (!subscribe) {
                    ElMessage.error(t('planet.subscribeError'));
                    context.emit('componentClose');
                } else {
                    ElMessage.success(t('planet.subscribeSuccess'));
                    bus.emit('browserSubscribeSuccess');
                    context.emit('componentClose', true);
                }
            }
        };

        onMounted(() => {
            init();
            bus.emit('browserSubscribeStart');
        });

        return {};
    },
});
</script>

<style lang="less" scoped>
.subbox {
    @apply flex items-center w-75 p-5 bg-white rounded-xl fixed right-5 bottom-5 dark:(bg-dark-300);
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.15);
    z-index: 2000;
    img {
        @apply w-7 mr-2;
    }
    span {
        @apply dark:(text-light-900/80);
    }
}

.slideleft-enter-active {
    -webkit-animation: slide-left 0.3s ease-in;
    animation: slide-left 0.3s ease-in;
}

.slideleft-leave-active {
    -webkit-animation: slide-right 0.3s ease-out;
    animation: slide-right 0.3s ease-out;
}

@-webkit-keyframes slide-left {
    0% {
        -webkit-transform: translateX(400px);
        transform: translateX(400px);
    }

    100% {
        -webkit-transform: translateX(0);
        transform: translateX(0);
    }
}

@keyframes slide-left {
    0% {
        -webkit-transform: translateX(400px);
        transform: translateX(400px);
    }

    100% {
        -webkit-transform: translateX(0);
        transform: translateX(0);
    }
}

@keyframes slide-right {
    0% {
        -webkit-transform: translateX(0);
        transform: translateX(0);
    }

    100% {
        -webkit-transform: translateX(400px);
        transform: translateX(400px);
    }
}

@-webkit-keyframes slide-right {
    0% {
        -webkit-transform: translateX(0);
        transform: translateX(0);
    }

    100% {
        -webkit-transform: translateX(400px);
        transform: translateX(400px);
    }
}
</style>
