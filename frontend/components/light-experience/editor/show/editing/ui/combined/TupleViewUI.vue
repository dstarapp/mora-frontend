<script lang="ts" setup>
import { PropType, ref, computed, watch } from 'vue';
import {
    TrimmedUnionTransmitShowView,
    findShowNameByView,
    getInitialShowView,
} from '../../../../../types/parts/shows';
import { TrimmedCombinedShowViewSubitem } from '../../../../../types/parts/shows/combined';
import { v4 as uuid } from 'uuid';
import ShowViewNameVue from '../ShowViewName.vue';
import ViewUIDialogVue from '../ViewUIDialog.vue';

const props = defineProps({
    subitems: {
        type: Array as PropType<TrimmedCombinedShowViewSubitem[]>,
        required: true,
    },
    ui: {
        type: Object as PropType<Record<string, any>>,
        required: true,
    },
});

const subitemDialog = ref(false);
const currentIndex = ref<number>(0);
const current = ref<TrimmedCombinedShowViewSubitem>();

const subitems = ref<TrimmedCombinedShowViewSubitem[]>(props.subitems);
const showSubitems = computed(() =>
    subitems.value.map((subitem) => ({
        id: uuid(),
        key: subitem.key,
        name: findShowNameByView(subitem.view),
    })),
);
const checkSubitems = computed(() => {
    const keys = {};
    for (const subitem of subitems.value) {
        if (keys[subitem.key] !== undefined) return 'key name can not repeat';
        keys[subitem.key] = null;
    }
    return '';
});

// tuple ui
const flexDirection = ref<'row' | 'column'>(props.ui.flexDirection ?? 'column');

const onDeleteSubitem = (i: number) => {
    if (i < subitems.value.length) {
        subitems.value.splice(i, 1);
        subitems.value = [...subitems.value];
    }
};
const emit = defineEmits(['subitemsChanged', 'uiChanged']);

watch(
    () => subitems.value,
    () => {
        // console.error('subitems.value', subitems.value, checkSubitems.value);
        if (!checkSubitems.value) onSubitemsChanged();
    },
);
const onSubitemsChanged = () => {
    emit('subitemsChanged', subitems.value);
};

watch(
    () => [flexDirection.value],
    () => {
        onUIChanged();
    },
);
const onUIChanged = () => {
    emit('uiChanged', {
        ...props.ui,
        flexDirection: flexDirection.value,
    });
};

const onAddSubitem = () => {
    subitems.value.push({
        key: `_${subitems.value.length}_`,
        view: getInitialShowView('TextView'),
    });
    subitems.value = [...subitems.value];
    onEditSubitem(subitems.value.length - 1);
};
const onEditSubitem = (i: number) => {
    currentIndex.value = i;
    current.value = subitems.value[i];
    subitemDialog.value = true;
};
const receiveSubitem = (item: { key: string; view: TrimmedUnionTransmitShowView } | undefined) => {
    subitemDialog.value = false;
    current.value = undefined;
    if (item === undefined) return;
    subitems.value[currentIndex.value] = item;
    subitems.value = [...subitems.value];
};
</script>

<template>
    <div class="tuple-view-ui">
        <div class="item">
            <div class="label">{{ $t('plugin.formPreview.form.subitems') }}</div>
            <div class="subitems">
                <div class="subitem" v-for="(subitem, i) in showSubitems" :key="subitem.id">
                    <ShowViewNameVue :keyName="''" :name="subitem.name" />
                    <i class="iconfont icon-failed" @click="onDeleteSubitem(i)"></i>
                    <i class="iconfont icon-plugin-edit" @click="onEditSubitem(i)"></i>
                </div>
                <i @click="onAddSubitem" class="iconfont icon-plugin-add"></i>
            </div>
        </div>
        <div class="item">
            <div class="label"> {{ $t('plugin.formPreview.form.display') }}</div>
            <div class="tab-switch">
                <span @click="flexDirection = 'row'" :class="{ current: flexDirection === 'row' }">
                    {{ $t('plugin.formPreview.form.row') }}
                </span>
                <span @click="flexDirection = 'column'" :class="{ current: flexDirection === 'column' }">
                    {{ $t('plugin.formPreview.form.column') }}
                </span>
            </div>
        </div>
        <template v-if="subitemDialog">
            <ViewUIDialogVue :show="subitemDialog" :hasKey="false" :keyName="current!.key" :view="current!.view"
                :excludes="[
                'TableView',
                'VecView',
                'OptView',
                'RecordView',
                'VariantView',
                'TupleView',
            ]" @complete="receiveSubitem" />
        </template>
    </div>
</template>

<style lang="less" scoped>
.tuple-view-ui {
    width: 100%;
    display: flex;
    flex-direction: column;

    .item {
        display: flex;
        margin-bottom: 30px;
        position: relative;
        align-items: center;

        .label {
            font-size: 14px;
            color: #666666;
            width: 105px;
            text-align: left;
            margin-right: 20px;
            line-height: 38px;
            flex-shrink: 0;
            @apply dark:(text-light-900/60);
        }

        .choose {
            display: flex;
            justify-content: space-between;
            flex: 1;

            .changeType {
                background: linear-gradient(90deg, #34d399 2.69%, #7cee83 96.86%);
                border-radius: 5px;
                padding: 0 8px;
                height: 26px;
                font-weight: 400;
                font-size: 14px;
                color: #000000;
                margin-right: 3px;
                margin-left: auto;
                cursor: pointer;
                margin-right: 32px;
            }
        }

        .textInput {
            width: 100%;
            flex: 1;
            display: flex;
        }

        .state {
            height: 32px;
            width: 32px;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            flex-shrink: 0;

            .icon-failed {
                color: #e47470;
                font-size: 18px;
            }

            .icon-chose {
                color: #35d49a;
                font-size: 18px;
            }
        }

        .error-text {
            position: absolute;
            right: 32px;
            bottom: -22px;
            color: #e47470;
            font-size: 12px;
            height: 22px;
            line-height: 22px;
        }

        .subitems {
            display: flex;
            flex-wrap: wrap;
            align-items: center;

            .subitem {
                display: flex;
                background: #ffffff;
                border: 1px solid #dddddd;
                border-radius: 8px;
                font-weight: 400;
                font-size: 14px;
                line-height: 30px;
                color: #000000;
                padding: 0 10px;
                margin-right: 15px;
                margin-top: 5px;
                margin-bottom: 5px;
                @apply dark:(border-dark-100 bg-dark-300);

                .icon-failed,
                .icon-plugin-edit {
                    color: #999999;
                    margin-left: 8px;
                    font-size: 14px;
                    cursor: pointer;
                }
            }

            .icon-plugin-add {
                line-height: 25px;
                cursor: pointer;
                @apply dark: (text-indigo-300/60);
            }
        }
    }

    .tab-switch {
        width: 100%;
        flex: 1;
        display: flex;
        position: relative;
        height: 38px;

        span {
            .center();
            cursor: pointer;
            flex: 1;
            border-top: 1px solid #dddddd;
            border-bottom: 1px solid #dddddd;
            box-sizing: border-box;
            font-weight: 400;
            font-size: 14px;
            color: #000000;
            @apply dark:(border-dark-100 text-light-900/80);

            &:first-child {
                border-radius: 8px 0 0 8px;
                border-left: 1px solid #dddddd;
                @apply dark:(border-dark-100);
            }

            &:last-child {
                border-radius: 0 8px 8px 0;
                border-right: 1px solid #dddddd;
                @apply dark:(border-dark-100);
            }

            &.current {
                border: none;
                background: #5ae28e;
                color: #000000;
            }
        }
    }
}
</style>
