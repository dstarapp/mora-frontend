<script lang="ts" setup>
import { PropType, ref, computed } from 'vue';
import { ActionValues } from '../../../types/common/value';
import { CombinedActionResult } from '../../../types/parts/combined';
import { CanisterActionResult } from '../../../types/parts/canisters';
import { findTransformToCandidType } from '@mora-light/core/types/transform';
import { CandidType, isSameCandidType } from '@mora-light/core/types/candid';

type SupportedType = 'constant' | 'prop' | 'form' | 'action';

type ActionValue = {
    index: number;
    id: string;
    name: string;
    type: CandidType;
    order: number;
    count: () => number;
};

const props = defineProps({
    values: {
        type: Object as PropType<ActionValues>,
        required: true,
    },
    chosen: {
        type: Array as PropType<string[]>,
        required: true,
    },
    needs: {
        type: Function as PropType<(type: CandidType) => CandidType | undefined>,
        required: false,
    },
});

const alreadyChosen = (id: string): boolean => props.chosen.includes(id);

const isSameCandidTypeByNeeds = (type: CandidType): boolean => {
    if (props.needs === undefined) return true;
    return !!props.needs(type);
};

const constants = computed(() =>
    props.values.constants.filter(
        (c) => !alreadyChosen(c.id) && isSameCandidTypeByNeeds(c.constant.result),
    ),
);
const propValues = computed(() =>
    props.values.props.filter(
        (c) => !alreadyChosen(c.id) && isSameCandidTypeByNeeds(c.prop.result),
    ),
);
const inputs = computed(() =>
    props.values.inputs.filter(
        (i) => !alreadyChosen(i.id) && isSameCandidTypeByNeeds(i.input.result),
    ),
);
const actionValues = computed<ActionValue[]>(() => {
    const values: ActionValue[] = [];

    const actions = props.values.actions;

    for (let i = 0; i < actions.length; i++) {
        const index = i + 1;

        const action = actions[i];

        let count = 0;
        let order = 0;

        if (action.type === 'canister') {
            const checkResult = (result: CanisterActionResult) => {
                if (result.exported?.id && result.exported.name) {
                    if (
                        !alreadyChosen(result.exported.id) &&
                        isSameCandidTypeByNeeds(
                            findTransformToCandidType(result.exported.transform) ?? result.type,
                        )
                    ) {
                        count++;
                        order = count;
                        values.push({
                            index,
                            id: result.exported.id,
                            name: result.exported.name,
                            type:
                                findTransformToCandidType(result.exported.transform) ?? result.type,
                            order,
                            count: () => count,
                        });
                    }
                }
                if (result.subitems !== undefined) {
                    for (const r of result.subitems) checkResult(r);
                }
            };
            checkResult(action.result);
        } else if (action.type === 'combined') {
            const checkResult = (result: CombinedActionResult) => {
                if (result.exported?.id && result.exported.name) {
                    if (
                        !alreadyChosen(result.exported.id) &&
                        isSameCandidTypeByNeeds(
                            findTransformToCandidType(result.exported.transform) ?? result.type,
                        )
                    ) {
                        count++;
                        order = count;
                        values.push({
                            index,
                            id: result.exported.id,
                            name: result.exported.name,
                            type:
                                findTransformToCandidType(result.exported.transform) ?? result.type,
                            order,
                            count: () => count,
                        });
                    }
                }
                if (result.subitems !== undefined) {
                    for (const r of result.subitems) checkResult(r);
                }
            };
            checkResult(action.result);
        }
    }

    return values;
});

const current = ref<SupportedType>(
    ((): SupportedType => {
        if (constants.value.length) return 'constant';
        if (propValues.value.length) return 'prop';
        if (inputs.value.length) return 'form';
        if (actionValues.value.length) return 'action';
        return 'constant';
    })(),
);
const onTab = (tab: SupportedType) => {
    if (current.value === tab) return;
    current.value = tab;
};

const emit = defineEmits(['complete']);

const onComplete = (id: string, type: CandidType, name: string) => {
    emit('complete', { id, type, name });
};
</script>

<template>
    <div class="choose-value-content">
        <div class="tab">
            <span
                :class="{ current: current === 'constant' }"
                v-if="constants.length"
                @click="onTab('constant')"
            >
                {{ $t('plugin.selectVariable.constant') }}
            </span>
            <span
                :class="{ current: current === 'prop' }"
                v-if="constants.length"
                @click="onTab('prop')"
            >
                {{ $t('plugin.selectVariable.prop') }}
            </span>
            <span
                :class="{ current: current === 'form' }"
                v-if="inputs.length"
                @click="onTab('form')"
            >
                {{ $t('plugin.selectVariable.form') }}
            </span>
            <span
                :class="{ current: current === 'action' }"
                v-if="actionValues.length"
                @click="onTab('action')"
            >
                {{ $t('plugin.selectVariable.action') }}
            </span>
        </div>
        <div class="items">
            <template v-if="current === 'constant' && constants.length">
                <template v-if="constants.length">
                    <div class="item" v-for="(constant, i) in constants" :key="constant.id">
                        <span class="idx">{{ i + 1 }}</span>
                        <span class="name">{{ constant.name }}</span>
                        <span class="type">{{ constant.constant.result.type }}</span>
                        <span
                            class="btn"
                            @click="
                                onComplete(constant.id, constant.constant.result, constant.name)
                            "
                        >
                            {{ $t('plugin.selectVariable.choose') }}
                        </span>
                    </div>
                </template>
                <template v-else>
                    <span>{{ $t('plugin.selectVariable.noData') }}</span>
                </template>
            </template>
            <template v-if="current === 'prop' && propValues.length">
                <template v-if="propValues.length">
                    <div class="item" v-for="(prop, i) in propValues" :key="prop.id">
                        <span class="idx">{{ i + 1 }}</span>
                        <span class="name">{{ prop.name }}</span>
                        <span class="type">{{ prop.prop.result.type }}</span>
                        <span class="btn" @click="onComplete(prop.id, prop.prop.result, prop.name)">
                            {{ $t('plugin.selectVariable.choose') }}
                        </span>
                    </div>
                </template>
                <template v-else>
                    <span>{{ $t('plugin.selectVariable.noData') }}</span>
                </template>
            </template>
            <template v-else-if="current === 'form' && inputs.length">
                <template v-if="inputs.length">
                    <div class="item" v-for="(input, i) in inputs" :key="input.id">
                        <span class="idx">{{ i + 1 }}</span>
                        <span class="name">{{ input.name }}</span>
                        <span class="type">{{ input.input.result.type }}</span>
                        <span
                            class="btn"
                            @click="onComplete(input.id, input.input.result, input.name)"
                        >
                            {{ $t('plugin.selectVariable.choose') }}
                        </span>
                    </div>
                </template>
                <template v-else>
                    <span>{{ $t('plugin.selectVariable.noData') }}</span>
                </template>
            </template>
            <template v-else-if="current === 'action' && actionValues.length">
                <template v-if="actionValues.length">
                    <div class="item" v-for="(value, i) in actionValues" :key="value.id">
                        <span class="idxVal">
                            {{ value.index }}
                            {{ value.count() === 1 ? '' : `.${value.order}` }}
                        </span>
                        <!-- <span class="type">{{ value.index }}</span> -->
                        <span class="name">{{ value.name }}</span>
                        <span class="type">{{ value.type.type }}</span>
                        <span class="btn" @click="onComplete(value.id, value.type, value.name)">
                            {{ $t('plugin.selectVariable.choose') }}
                        </span>
                    </div>
                </template>
                <template v-else>
                    <span>{{ $t('plugin.selectVariable.noData') }}</span>
                </template>
            </template>
            <template
                v-if="constants.length === 0 && inputs.length === 0 && actionValues.length === 0"
            >
                <div class="no-data">
                    <i class="iconfont icon-no"></i>
                    <p>{{ $t('plugin.selectVariable.noDataTip') }}</p>
                </div>
            </template>
        </div>
    </div>
</template>

<style lang="less" scoped>
.choose-value-content {
    width: 100%;
    padding: 18px 21px;
    border-radius: 8px;

    > .tab {
        display: flex;
        justify-content: flex-start;
        border-radius: 8px;

        > span {
            cursor: pointer;
            .center();
            margin-right: 15px;
            margin-bottom: 10px;
            border-radius: 100%;
            padding: 4px 12px;
        }

        > .current {
            border-radius: 30px;
            background-color: #4c4f6b;
            color: white;
            font-size: 18px;
            @apply dark:(text-light-900);
        }
    }

    .items {
        display: flex;
        flex-direction: column;
        width: 100%;

        .item {
            background: #f3f3f3;
            border-radius: 6px;
            margin-top: 13px;
            height: 32px;
            display: flex;
            align-items: center;
            @apply dark:(bg-dark-300);

            .idx {
                .center();
                width: 16px;
                height: 16px;
                background: #4c4f6b;
                font-size: 12px;
                font-weight: 500;
                color: #ffffff;
                margin-left: 12px;
                border-radius: 50%;
            }

            .idxVal {
                .center();
                min-width: 16px;
                height: 16px;
                background: #4c4f6b;
                font-size: 12px;
                font-weight: 500;
                color: #ffffff;
                margin-left: 17px;
                border-radius: 20px;
                padding: 0 5px;
            }

            .name {
                font-weight: 400;
                font-size: 14px;
                color: #000000;
                margin-left: 10px;
                @apply dark:(text-light-900/80);
            }

            .type {
                font-weight: 400;
                font-size: 12px;
                color: #999999;
                margin-left: 6px;
            }

            .btn {
                background: linear-gradient(90deg, #34d399 2.69%, #7cee83 96.86%);
                border-radius: 5px;
                width: 60px;
                height: 26px;
                font-weight: 400;
                font-size: 14px;
                color: #000000;
                margin-right: 3px;
                margin-left: auto;
                cursor: pointer;
            }
        }
    }

    .no-data {
        width: 100%;
        height: 100%;
        .padding(10, 0, 20, 0);
        text-align: center;
        .center();
        flex-direction: column;

        i {
            .font-size(70);
            .line-height(70);
            color: #dddddd;
        }

        p {
            width: 100%;
            display: block;
            .font-size(16);
            .padding(10, 0, 0, 0);
            color: @text-color-grey;
        }
    }
}
</style>
