<script lang="ts" setup>
import { PropType, ref, watch, computed } from 'vue';
import ShowViewNameVue from '../ShowViewName.vue';
import ViewUIDialogVue from '../ViewUIDialog.vue';
import { TrimmedUnionTransmitShowView, findShowNameByView } from '../../../../../types/parts/shows';

const props = defineProps({
    subtype: {
        type: Object as PropType<TrimmedUnionTransmitShowView>,
        required: true,
    },
    ui: {
        type: Object as PropType<Record<string, any>>,
        required: true,
    },
});

const subtypeDialog = ref(false);

const subtype = ref<TrimmedUnionTransmitShowView>(props.subtype);
const showName = computed(() => findShowNameByView(subtype.value));

// vec ui
const flexDirection = ref<'row' | 'column'>(props.ui.flexDirection ?? 'column');

const emit = defineEmits(['subtypeChanged', 'uiChanged']);

watch(
    () => subtype.value,
    () => {
        onSubtypeChanged();
    },
);
const onSubtypeChanged = () => {
    emit('subtypeChanged', subtype.value);
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

const onChooseSubType = () => {
    subtypeDialog.value = true;
};
const receiveSubtype = (item: { key: string; view: TrimmedUnionTransmitShowView } | undefined) => {
    subtypeDialog.value = false;
    if (item === undefined) return;
    subtype.value = item.view;
};
</script>

<template>
    <div class="vec-view-ui">
        <div class="item">
            <div class="label">{{ $t('plugin.formPreview.form.subtype') }}</div>
            <div class="choose">
                <ShowViewNameVue :keyName="''" :name="showName" />
                <div class="changeType" @click="onChooseSubType">
                    {{ $t('plugin.formPreview.form.changeType') }}
                </div>
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
        <template v-if="subtypeDialog">
            <ViewUIDialogVue :show="subtypeDialog" :hasKey="false" :keyName="''" :view="subtype" :excludes="[
                'BoolView',
                'TableView',
                'VecView',
                'OptView',
                'VariantView',
                'TupleView',
            ]" @complete="receiveSubtype" />
        </template>
    </div>
</template>

<style lang="less" scoped>
.vec-view-ui {
    width: 100%;
    display: flex;
    flex-direction: column;

    :deep(.el-input) {
        border: 1px solid #dddddd;
        border-radius: 6px;
        @apply dark:(border-dark-100);

        &.is-disabled {
            .el-input__wrapper {
                box-shadow: none;
            }
        }

        .el-input__wrapper {
            padding: 0 10px;
            height: 36px;
            line-height: 36px;
            border-radius: 6px;

            .el-input__inner {
                color: #666;
                text-align: left;
                font-size: 14px;
                @apply dark:(text-light-900/80);
            }
        }
    }

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
                transition: @transition;

                &:hover {
                    box-shadow: 0 0 15px rgba(52, 211, 153, 0.5);
                    opacity: 0.85;
                    transition: @transition;
                }
            }
        }

        .textInput {
            width: 100%;
            flex: 1;
            display: flex;
        }

        .state {
            margin-left: 10px;
            margin-right: 10px;
            flex-shrink: 0;
            font-size: 16px;

            .icon-failed {
                color: #e47470;
            }

            .icon-chose {
                color: #35d49a;
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
            @apply dark:(border-dark-100 text-light-900/80 bg-dark-300);

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
