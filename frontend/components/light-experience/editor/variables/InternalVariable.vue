<script lang="ts" setup>
import { ref } from 'vue';
import ConstantValueVue from './constant/ConstantValue.vue';
import FormValueVue from './modules/FormValue.vue';
import ActionValueVue from './modules/ActionValue.vue';
import IdentityValueVue from './modules/IdentityValue.vue';

type TabType = 'constant' | 'form' | 'action' | 'identity';

const current = ref<TabType>('constant');

const up = ref<boolean>(false);
const editing = ref<boolean>(false);

const onTab = (chosen: TabType) => {
    if (current.value === chosen) return;
    current.value = chosen;
    editing.value = false;
};

const emits = defineEmits(['centerBoxIsUp']);
const onEditing = (value: boolean) => (editing.value = value);
const onUp = (value: boolean) => {
    up.value = !up.value;
    emits('centerBoxIsUp', value);
};
</script>

<template>
    <div class="internal-variable-content">
        <div class="tab">
            <span :class="{ current: current === 'constant' }" @click="onTab('constant')">
                {{ $t('plugin.internalVariable.tab.constant') }}
            </span>
            <span :class="{ current: current === 'form' }" @click="onTab('form')">
                {{ $t('plugin.internalVariable.tab.UIValue') }}
            </span>
            <span :class="{ current: current === 'action' }" @click="onTab('action')">
                {{ $t('plugin.internalVariable.tab.actionValue') }}
            </span>
            <span :class="{ current: current === 'identity' }" @click="onTab('identity')">
                {{ $t('plugin.internalVariable.tab.identity') }}
            </span>

            <div>
                <template v-if="editing">
                    <div class="icon" @click="onEditing(false)">
                        <i class="iconfont icon-plugin-add"></i>
                    </div>
                </template>
                <template v-else>
                    <div class="icon" v-if="up" @click="onUp(true)">
                        <i class="iconfont icon-plugin-aup"></i>
                    </div>
                    <div class="icon" v-else @click="onUp(false)">
                        <i class="iconfont icon-plugin-adown"></i>
                    </div>
                </template>
            </div>
        </div>

        <div class="variable-box">
            <template v-if="current === 'constant'">
                <ConstantValueVue :editing="editing" :onEditing="onEditing" />
            </template>
            <template v-else-if="current === 'form'">
                <FormValueVue />
            </template>
            <template v-else-if="current === 'action'">
                <ActionValueVue />
            </template>
            <template v-else-if="current === 'identity'">
                <IdentityValueVue />
            </template>
        </div>
    </div>
</template>

<style lang="less" scoped>
.internal-variable-content {
    width: 100%;
    height: 100%;
    .scrollbar();
    position: relative;

    >.tab {
        display: flex;
        padding: 7px 16px;
        justify-content: space-between;

        span {
            display: flex;
            font-size: 14px;
            color: #666666;
            line-height: 25px;
            cursor: pointer;
            transition: @transition;
            @apply dark:(text-light-900/60);

            &.current {
                color: #000;
                transition: @transition;
                @apply dark:(text-light-900);
            }

            &:hover {
                color: #000;
                transition: @transition;
                @apply dark:(text-light-900);
            }
        }

        >div {
            .center();

            .icon {
                .icon-plugin-add {
                    transform: rotate(45deg);
                    color: #4d4f69;
                    @apply dark:(text-light-900/60);
                }

                i {
                    display: flex;
                    cursor: pointer;
                    font-size: 16px;
                    color: #999999;
                }
            }
        }
    }

    >.variable-box {
        overflow-y: auto;
        height: calc(100% - 63px);
        padding: 0 16px;
        .pscrollbar();
    }
}

.content {
    display: flex;
}
</style>
