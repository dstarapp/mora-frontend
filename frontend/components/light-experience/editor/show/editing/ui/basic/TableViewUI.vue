<script lang="ts" setup>
import { PropType, ref, watch } from 'vue';

const props = defineProps({
    ui: {
        type: Object as PropType<Record<string, any>>,
        required: true,
    },
});

const customBorder = ref<boolean>(props.ui.customBorder ?? true);
const customFixedHeader = ref<boolean>(props.ui.customFixedHeader ?? true);

watch(
    () => [customBorder.value, customFixedHeader.value],
    () => onUIChanged(),
);

const emit = defineEmits(['uiChanged']);

const onUIChanged = () => {
    emit('uiChanged', {
        ...props.ui,
        customBorder: customBorder.value,
        customFixedHeader: customFixedHeader.value,
    });
};
</script>

<template>
    <div class="table-view-ui">
        <div class="item">
            <div class="label">
                <div> {{ $t('plugin.formPreview.form.border') }}</div>
            </div>
            <el-switch v-model="customBorder" active-color="#35D49A" />
        </div>
        <div class="item">
            <div class="label">
                <div> {{ $t('plugin.formPreview.form.fixedHeader') }}</div>
            </div>
            <el-switch v-model="customFixedHeader" active-color="#35D49A" />
        </div>
    </div>
</template>

<style lang="less" scoped>
.table-view-ui {
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
    }
}
</style>
