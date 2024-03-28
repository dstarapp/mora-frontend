<script lang="ts" setup>
import { TriggerMode } from '@mora-light/core/types/trigger';
import { PropType, ref, watch, computed } from 'vue';

const channelInputLimit = (e: any) => {
    if (e.keyCode === 110) {
        e.returnValue = false;
        return false;
    }
    return true;
};

const props = defineProps({
    show: {
        type: Boolean,
        required: true,
    },
    button: {
        type: Boolean,
        required: true,
    },
    trigger: {
        type: Object as PropType<TriggerMode>,
        required: true,
    },
});

const show = ref(props.show);
watch(
    () => props.show,
    (nv) => (show.value = nv),
);

const type = ref<'loading' | 'button' | 'clock'>(props.button ? 'button' : props.trigger.type);

const buttonText = ref<string>(props.trigger.type === 'button' ? props.trigger.text : 'Run');

const clockSleep = ref<number>(props.trigger.type === 'clock' ? props.trigger.sleep / 1000 : 60);

const checked = computed<boolean>(() => {
    switch (type.value) {
        case 'loading':
            return true;
        case 'button':
            return !!buttonText.value.trim();
        case 'clock':
            return true;
    }
});

const emit = defineEmits(['complete']);

const onDialogClose = () => emit('complete');

const onComplete = () => {
    if (!checked.value) return;
    let mode: TriggerMode;
    switch (type.value) {
        case 'loading':
            mode = { type: 'loading' };
            break;
        case 'button':
            mode = { type: 'button', text: buttonText.value.trim(), loading: false };
            break;
        case 'clock':
            mode = { type: 'clock', sleep: clockSleep.value * 1000, loading: true };
            break;
    }
    emit('complete', mode);
};
</script>

<template>
    <div class="trigger-mode-editing-content">
        <el-dialog :title="'Setting Trigger Method'" v-model="show" @closed="onDialogClose">
            <div class="items">
                <div class="item" v-if="!props.button">
                    <div class="control" :class="{ activate: type === 'loading' }" @click="type = 'loading'">
                        <span>
                            <i class="iconfont icon-plugin-page" />
                            {{ $t('plugin.trigger.loading') }}
                        </span>
                        <i class="iconfont icon-chose"></i>
                    </div>
                </div>
                <div class="item">
                    <div class="control" :class="{ activate: type === 'button' }" @click="type = 'button'">
                        <span>
                            <i class="iconfont icon-plugin-btn" />
                            {{ $t('plugin.trigger.button') }}
                        </span>
                        <i class="iconfont icon-chose"></i>
                    </div>
                    <div class="input" v-if="type === 'button'">
                        <el-input v-model="buttonText" :placeholder="$t('plugin.trigger.buttonPlaceholder')" />
                    </div>
                </div>
                <div class="item" v-if="!props.button">
                    <div class="control" :class="{ activate: type === 'clock' }" @click="type = 'clock'">
                        <span>
                            <i class="iconfont icon-plugin-clock" />
                            {{ $t('plugin.trigger.timer') }}
                        </span>
                        <i class="iconfont icon-chose"></i>
                    </div>
                    <div class="input" v-if="type === 'clock'">
                        <el-input-number :controls="false" :min="10" :max="600" v-model="clockSleep"
                            :placeholder="$t('plugin.trigger.timerPlaceholder')" @keydown="channelInputLimit" />
                    </div>
                </div>
            </div>
            <div class="mora-button">
                <div class="cancel" @click="onDialogClose">
                    {{ $t('plugin.generic.cancel') }}
                </div>
                <div class="confirm" v-if="checked" @click="onComplete">
                    {{ $t('plugin.generic.confirm') }}
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<style lang="less" scoped>
.trigger-mode-editing-content {
    width: 100%;

    .item {
        margin-bottom: 26px;
    }

    .control {
        background: #ffffff;
        border: 1px solid #dddddd;
        border-radius: 8px;
        font-size: 14px;
        display: flex;
        align-items: center;
        height: 45px;
        box-sizing: border-box;
        position: relative;
        cursor: pointer;
        transition: @transition;
        @apply dark:(bg-dark-300 border-dark-100);

        span {
            font-size: 14px;
            color: #000000;
            @apply dark:(text-light-900);

            i {
                margin-left: 15px;
                margin-right: 10px;
            }

            .icon-plugin-btn {
                font-size: 18px;
            }
        }

        >i {
            position: absolute;
            right: 13px;
            font-size: 16px;
            color: #cccccc;
            transition: @transition;
            @apply dark:(text-light-900/30);
        }

        &.activate {
            border: 2px solid #34d399;
            transition: @transition;

            >i {
                color: #34d399;
                transition: @transition;
            }
        }
    }

    .input {
        background: rgba(52, 211, 153, 0.12);
        border-radius: 8px;
        .center();
        margin-top: 14px;
        position: relative;
        padding: 6px;

        :deep(.el-input) {
            background: #fff;
            height: 40px;
            border-radius: 6px;
            @apply dark:(bg-dark-300);
        }

        :deep(.el-input-number) {
            width: 100%;

            .el-input__inner {
                text-align: left;
            }
        }

        &:before {
            display: block;
            content: '';
            border-width: 6px;
            border-style: solid;
            border-color: transparent transparent rgba(52, 211, 153, 0.12) transparent;
            position: absolute;
            top: -12px;
        }
    }

    .mora-button {
        padding: 0;
    }
}
</style>
