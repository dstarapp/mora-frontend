<script lang="ts" setup>
import { PropType, provide, watch, ref, readonly } from 'vue';
import { LightExperience, SupportedAction } from '../types/core';
import { Splitpanes, Pane } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';
import { ConstantValue } from '../types/parts/constants';
import { PropValue } from '../types/parts/props';
import { InputValue } from '../types/parts/inputs';
import { hasCanisterActionResult } from '../types/parts/canisters';
import { hasCombinedActionResult } from '../types/parts/combined';
import { CanisterActionCurrentEditingState } from '../types/common/state';
import { DataShow } from '../types/parts/show';
import { checkLightExperience } from '../types/common/checks';
import { TriggerMode } from '@mora-light/core/types/trigger';
import { deepClone } from '@mora-light/core/types/common';
import ActionListVue from './action/ActionList.vue';
import WrappedActionEditingVue from './action/WrappedActionEditing.vue';
import InternalVariableVue from './variables/InternalVariable.vue';
import FormPreviewVue from './form/FormPreview.vue';
import ShowPreviewVue from './show/ShowPreview.vue';
import ActionParameterEditingVue from './action/ActionParameterEditing.vue';

const paneLeftSize = ref(60);
const paneRightSize = ref(20);

const rightTab = ref<'form' | 'show'>('show');

// watch(
//     () => rightTab.value,
//     () => {
//         if (paneRightSize.value > 30) paneRightSize.value = 20;
//     },
// );

const version = ref<string>('0.0.1');
const constants = ref<ConstantValue[]>([]);
const propSources = ref<PropValue[]>([]);
const inputs = ref<InputValue[]>([]);
const actions = ref<SupportedAction[]>([]);
const trigger = ref<TriggerMode>({ type: 'loading' });
const shows = ref<DataShow[]>([]);

const setExperience = (experience: LightExperience) => {
    version.value = experience.version;
    constants.value = experience.constants;
    propSources.value = experience.props;
    inputs.value = experience.inputs;
    actions.value = experience.actions;
    trigger.value = experience.trigger;
    shows.value = experience.shows;
};

defineExpose({ setExperience });

// constants
provide('CONSTANTS', readonly(constants));
provide('CONSTANTS_PUSH', (value: ConstantValue) => {
    constants.value = [...constants.value, value];
});
provide('CONSTANTS_DELETE', (index: number) => {
    const values = [...constants.value];
    values.splice(index, 1);
    constants.value = values;
});
provide('CONSTANTS_MOVE', (ov: number, nv: number) => {
    const values = [...constants.value];
    if (ov > nv) {

        const items = values.splice(ov, 1);
        values.splice(nv, 0, ...items);
    } else {

        const items = values.splice(ov, 1);
        values.splice(nv, 0, ...items);
    }
    constants.value = values;
});

// props
provide('PROP_SOURCES', readonly(propSources));
provide('PROP_SOURCES_PUSH', (value: PropValue) => {
    propSources.value = [...propSources.value, value];
});
provide('PROP_SOURCES_DELETE', (index: number) => {
    const values = [...propSources.value];
    values.splice(index, 1);
    propSources.value = values;
});
provide('PROP_SOURCES_REPLACE', (index: number, value: PropValue) => {
    const values = [...propSources.value];
    values[index] = value;
    propSources.value = values;
});
provide('PROP_SOURCES_MOVE', (ov: number, nv: number) => {
    const values = [...propSources.value];
    if (ov > nv) {

        const items = values.splice(ov, 1);
        values.splice(nv, 0, ...items);
    } else {

        const items = values.splice(ov, 1);
        values.splice(nv, 0, ...items);
    }
    propSources.value = values;
});

// inputs
provide('INPUTS', readonly(inputs));
provide('INPUTS_PUSH', (value: InputValue) => {
    inputs.value = [...inputs.value, value];
});
provide('INPUTS_DELETE', (index: number) => {
    const values = [...inputs.value];
    values.splice(index, 1);
    inputs.value = values;
});
provide('INPUTS_REPLACE', (index: number, value: InputValue) => {
    const values = [...inputs.value];
    values[index] = value;
    inputs.value = values;
});
provide('INPUTS_MOVE', (ov: number, nv: number) => {
    const values = [...inputs.value];
    if (ov > nv) {
        const items = values.splice(ov, 1);
        values.splice(nv, 0, ...items);
    } else {
        const items = values.splice(ov, 1);
        values.splice(nv, 0, ...items);
    }
    inputs.value = values;
});

// actions
provide('ACTIONS', actions);
provide('ACTIONS_PUSH', (action: SupportedAction) => {
    actions.value = [...actions.value, action];
});
provide('ACTIONS_DELETE', (index: number) => {
    const values = [...actions.value];
    values.splice(index, 1);
    actions.value = values;
});
provide('ACTIONS_REPLACE', (index: number, action: SupportedAction) => {
    const values = [...actions.value];
    values[index] = action;
    actions.value = values;
});
provide('ACTIONS_MOVE', (ov: number, nv: number) => {
    const values = [...actions.value];
    if (ov > nv) {
        const items = values.splice(ov, 1);
        values.splice(nv, 0, ...items);
    } else {
        const items = values.splice(ov, 1);
        values.splice(nv, 0, ...items);
    }
    actions.value = values;
});
provide('ACTIONS_REFRESH', () => (actions.value = [...actions.value]));

// trigger
provide('TRIGGER', readonly(trigger));
provide('TRIGGER_SET', (mode: TriggerMode) => (trigger.value = mode));

// shows
provide('SHOWS', readonly(shows));
provide('SHOWS_PUSH', (show: DataShow) => (shows.value = [...shows.value, show]));
provide('SHOWS_DELETE', (index: number) => {
    const values = [...shows.value];
    values.splice(index, 1);
    shows.value = values;
});
provide('SHOWS_REPLACE', (index: number, show: DataShow) => {
    const values = [...shows.value];
    values[index] = show;
    shows.value = values;
});
provide('SHOWS_MOVE', (ov: number, nv: number) => {
    const values = [...shows.value];
    if (ov > nv) {
        const items = values.splice(ov, 1);
        values.splice(nv, 0, ...items);
    } else {
        const items = values.splice(ov, 1);
        values.splice(nv, 0, ...items);
    }
    shows.value = values;
});

// current action and editing
const currentActionId = ref<string>(actions.value.length ? actions.value[0].id : '');
const currentEditing = ref<CanisterActionCurrentEditingState | undefined>(undefined);
provide('SET_CURRENT_EDITING', (state: CanisterActionCurrentEditingState | undefined) => {
    // if (state !== undefined && paneRightSize.value < 60) {
    //     paneRightSize.value = 70;
    // }
    currentEditing.value = state;
});
provide('RESET_CURRENT_EDITING', (state: CanisterActionCurrentEditingState) => {
    if (currentEditing.value && currentEditing.value.type === state.type) {
        currentEditing.value = state;
    }
});

const findExportedValue = (
    name: string,
    id: string,
): ConstantValue | PropValue | InputValue | SupportedAction | undefined => {
    const constantValue = constants.value.find((c) => c.name === name && (!id || c.id !== id));
    if (constantValue !== undefined) return constantValue;

    const propValue = propSources.value.find((c) => c.name === name && (!id || c.id !== id));
    if (propValue !== undefined) return propValue;

    const inputValue = inputs.value.find((c) => c.name === name && (!id || c.id !== id));
    if (inputValue !== undefined) return inputValue;

    const actionValue = actions.value.find((a) => {
        if (a.type === 'canister') {
            if (
                a.identity.from === 'host-login' &&
                a.name &&
                a.name === name &&
                (!id || a.id !== id)
            )
                return true;
            if (hasCanisterActionResult(name, id, a.result)) return true;
            if (a.identity.name && a.identity.name === name && (!id || a.identity.id !== id))
                return true;
        }
        if (a.type === 'combined') {
            if (hasCombinedActionResult(name, id, a.result)) return true;
        }
        return false;
    });
    if (actionValue !== undefined) return actionValue;

    return undefined;
};
provide('FIND_EXPORTED_VALUE', findExportedValue);

const centerBoxIsUp = (isUp: boolean) => {
    paneLeftSize.value = isUp ? 40 : 85;
};

const emit = defineEmits(['changed']);

watch(
    () => [
        deepClone(version.value),
        deepClone(constants.value),
        deepClone(propSources.value),
        deepClone(inputs.value),
        deepClone(actions.value),
        deepClone(trigger.value),
        deepClone(shows.value),
    ],
    (nv, ov) => {
        if (JSON.stringify(nv) === JSON.stringify(ov)) return;
        console.error('plugin changed', ov, nv);
        const experience: LightExperience = {
            version: version.value,
            constants: JSON.parse(JSON.stringify(constants.value)),
            props: JSON.parse(JSON.stringify(propSources.value)),
            inputs: JSON.parse(JSON.stringify(inputs.value)),
            actions: JSON.parse(JSON.stringify(actions.value)),
            trigger: JSON.parse(JSON.stringify(trigger.value)),
            shows: JSON.parse(JSON.stringify(shows.value)),
        };
        const core_json_result = checkLightExperience(experience);
        if (core_json_result.err)
            console.error('wrong experience', core_json_result.err, experience);
        emit('changed', JSON.stringify(experience), core_json_result);
    },
);

const onCurrentActionId = (id: string) => {
    currentEditing.value = undefined;
    currentActionId.value = id;
};
</script>

<template>
    <div class="edit-plugin-content">
        <splitpanes :first-splitter="false">
            <pane class="action-list" :size="11" :min-size="11" :max-size="15">
                <ActionListVue @currentActionId="onCurrentActionId" />
            </pane>
            <pane class="center-box" :size="20" :min-size="15">
                <splitpanes @resize="paneLeftSize = $event[0].size" horizontal>
                    <pane class="action-edit" :size="paneLeftSize">
                        <WrappedActionEditingVue :currentActionId="currentActionId" />
                    </pane>
                    <pane class="internal-variable" :size="100 - paneLeftSize">
                        <InternalVariableVue @centerBoxIsUp="centerBoxIsUp" />
                    </pane>
                </splitpanes>
            </pane>
            <pane>
                <splitpanes @resize="paneRightSize = $event[0].size" horizontal>
                    <pane :size="paneRightSize">
                        <ActionParameterEditingVue :currentEditing="currentEditing" />
                    </pane>
                    <pane class="right-box" :size="100 - paneRightSize">
                        <div class="title">
                            <div class="title-left">
                                <p @click="rightTab = 'form'" :class="{ active: rightTab === 'form' }">
                                    {{ $t('plugin.panel.title.form') }}
                                </p>
                                <p @click="rightTab = 'show'" :class="{ active: rightTab === 'show' }">
                                    {{ $t('plugin.panel.title.return') }}
                                </p>
                            </div>
                            <div class="title-right">
                                <i @click="paneRightSize = paneRightSize <= 10 ? 90 : 10" class="iconfont" :class="{
            'icon-plugin-adown': paneRightSize <= 10,
            'icon-plugin-aup': paneRightSize >= 10,
        }"></i>
                            </div>
                        </div>
                        <template v-if="rightTab === 'form'">
                            <FormPreviewVue />
                        </template>
                        <template v-if="rightTab === 'show'">
                            <ShowPreviewVue />
                        </template>
                    </pane>
                </splitpanes>
            </pane>
        </splitpanes>
    </div>
</template>

<style lang="less" scoped>
.edit-plugin-content {
    width: 100%;
    height: 100%;
    display: flex;

    .action-list {
        display: flex;
        flex-direction: column;
        height: 100%;
        min-width: 180px;
    }

    .center-box {
        min-width: 370px;

        .action-edit {
            display: flex;
            flex-direction: column;
            height: 100%;
        }

        .internal-variable {
            flex-direction: column;
            min-height: 38px;
            height: 100%;

            .title {
                height: 38px;
                line-height: 38px;
                font-size: 14px;
                color: #000000;
                display: flex;
                justify-content: space-between;
                padding: 0 12px 0 17px;
                cursor: pointer;
                @apply dark: (text-light-900/50);

                p {
                    display: flex;
                    width: 100%;
                    font-size: 14px;
                    color: #000000;
                    font-weight: bold;
                    @apply dark: (text-light-900);
                }
            }
        }
    }

    .right-box {
        min-height: 38px;

        .title {
            display: flex;
            background: #fbfbfb;
            width: 100%;
            height: 38px;
            align-items: center;
            padding-left: 15px;
            justify-content: space-between;
            @apply dark: (bg-dark-300);

            .title-left {
                display: flex;
                flex: 1;

                p {
                    margin-right: 42px;
                    cursor: pointer;
                    transition: @transition;
                    color: #666;
                    font-size: 14px;
                    @apply dark: (text-light-900/60);

                    &.active {
                        color: #000000;
                        transition: @transition;
                        font-weight: 500;
                        @apply dark: (text-light-900);
                    }

                    &:last-child {
                        margin-right: 0;
                    }
                }
            }

            .title-right {
                display: flex;

                i {
                    margin-right: 15px;
                    font-size: 16px;
                    color: #999999;
                    cursor: pointer;
                }
            }
        }
    }
}

:deep(.mora-button) {
    .cancel {
        color: #000000;
    }

    .confirm {
        background: linear-gradient(90deg, #34d399 2.69%, #7cee83 96.86%);
        color: #000000;
    }
}
</style>
