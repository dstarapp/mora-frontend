<script lang="ts" setup>
import { computed, PropType, onMounted, ref, inject, Ref } from 'vue';
import { ActionValues, findExportedValueByActionValues } from '../../types/common/value';
import { CombinedAction } from '../../types/parts/combined';
import { SupportedAction } from '../../types/core';
import CombinedActionEditingVue from './CombinedActionEditing.vue';
import { CandidType } from '@mora-light/core/types/candid';
import { deepClone } from '@mora-light/core/types/common';

type ArgType =
    | { index: number; id: string; name: string; type: CandidType }
    | { index: number; id: string; name: string; type?: undefined };
type ResultType = { index: number; id: string; name: string; type: CandidType };

const props = defineProps({
    values: {
        type: Object as PropType<ActionValues>,
        required: true,
    },
    action: {
        type: Object as PropType<CombinedAction>,
        required: true,
    },
});

const actions = inject<Ref<SupportedAction[]>>('ACTIONS')!;
const replaceActions = inject<(index: number, action: SupportedAction) => void>('ACTIONS_REPLACE')!;

const editing = ref<CombinedAction>();
const editingShow = ref(false);

const args = computed<ArgType[]>(() => {
    const args: ArgType[] = [];
    for (let i = 0; i < props.action.arg.subitems.length; i++) {
        const force = props.action.arg.subitems[i];
        const found = findExportedValueByActionValues(props.values, force.id);
        if (found === undefined) {
            args[i] = {
                index: i + 1,
                id: force.id,
                name: force.name,
            };
        } else {
            args[i] = {
                index: i + 1,
                id: force.id,
                name: found.name,
                type: found.type,
            };
        }
    }
    return args;
});
const results = computed<ResultType[]>(() => {
    const results: ResultType[] = [];
    for (let i = 0; i < props.action.result.subitems!.length; i++) {
        const force = props.action.result.subitems![i];
        results[i] = {
            index: i + 1,
            id: force.exported?.id ?? '',
            name: force.exported?.name ?? '',
            type: force.type,
        };
    }
    return results;
});

onMounted(() => {
    if (props.action.result.subitems![0].exported?.id === '') onEdit();
});

const onEdit = () => {
    editing.value = deepClone(props.action);
    editingShow.value = true;
};
const onComplete = (r: CombinedAction | undefined) => {
    editingShow.value = false;
    editing.value = undefined;
    if (r === undefined) return;
    if (JSON.stringify(props.action) === JSON.stringify(r)) return;

    replaceActions(
        actions.value.findIndex((a) => a.id === r.id),
        r,
    );
};
</script>

<template>
    <div class="combined-action-content">
        <div class="args">
            <div class="title">
                <em></em>
                <p>{{ $t('plugin.combinedAction.variables') }}</p>
                <i>{{ args.length }}</i>
            </div>
            <div class="arg" v-for="(arg, i) in args" :key="arg.id">
                <span>{{ `${i + 1}.` }}</span>
                <span class="name" :class="{ error: arg.type === undefined }">
                    {{ arg.type === undefined ? `Parameter: ${arg.name} is missing.` : arg.name }}
                </span>
                <span class="type">
                    <template v-if="arg.type">
                        {{ arg.type.type }}
                    </template>
                </span>
            </div>
        </div>
        <div class="results">
            <div class="title">
                <em></em>
                <p>{{ $t('plugin.combinedAction.result') }}</p>
            </div>
            <div class="result" v-for="result in results" :key="result.id">
                <span class="name">
                    {{ result.name ? result.name : 'Export name is missing' }}
                </span>
                <span class="type">
                    {{ result.type.type }}
                </span>
            </div>
        </div>
        <div class="button" @click="onEdit">
            <div>
                <i class="iconfont icon-plugin-edit"></i>
                <p>Edit Action</p>
            </div>
        </div>
    </div>
    <template v-if="editing !== undefined">
        <CombinedActionEditingVue :show="editingShow" :values="props.values" :action="editing" @complete="onComplete" />
    </template>
</template>

<style lang="less" scoped>
.combined-action-content {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;

    .args,
    .results {
        display: flex;
        flex-direction: column;

        .title {
            display: flex;
            position: relative;
            align-items: center;
            margin-top: 8px;
            height: 25px;

            em {
                display: inline-flex;
                width: 5px;
                height: 14px;
                background: linear-gradient(180deg, #35d49a 0%, #7def84 100%);
            }

            p {
                font-weight: 400;
                font-size: 12px;
                color: #000000;
                margin-left: 11px;
                @apply dark:(text-light-900/80);
            }

            i {
                .center();
                width: 16px;
                height: 16px;
                border: 1px solid #999999;
                border-radius: 50%;
                font-weight: 400;
                font-size: 12px;
                color: #666666;
                font-style: normal;
                margin-left: 7px;
            }
        }

        .arg,
        .result {
            display: flex;
            margin-left: 16px;
            height: 25px;
            align-items: center;
            margin-top: 6px;

            .name {
                font-weight: 400;
                font-size: 14px;
                color: #000000;
                @apply dark:(text-light-900);
            }

            .type {
                font-weight: 400;
                font-size: 12px;
                color: #999999;
                margin-left: 8px;
            }
        }
    }

    .button {
        background: linear-gradient(90deg, #34d399 2.69%, #7cee83 96.86%);
        border-radius: 8px;
        margin: 25px 16px 0 16px;
        height: 40px;
        .center();
        cursor: pointer;
        transition: @transition;

        &:hover {
            box-shadow: 0 0 15px rgba(52, 211, 153, 0.5);
            opacity: 0.85;
            transition: @transition;
        }

        div {
            display: flex;

            i {
                color: #000000;
                font-size: 14px;
                margin-right: 14px;
            }

            p {
                font-weight: 400;
                font-size: 14px;
                text-align: center;
                color: #000000;
            }
        }
    }
}
</style>
