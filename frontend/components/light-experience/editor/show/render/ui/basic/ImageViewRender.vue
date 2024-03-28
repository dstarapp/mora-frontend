<script lang="ts" setup>
import { width } from 'dom7';
import { PropType } from 'vue';

const props = defineProps({
    ui: {
        type: Object as PropType<Record<string, any>>,
        required: true,
    },
});
</script>

<template>
    <div class="image-view-render-content">
        <div class="label" v-if="props.ui.customLabel">
            <span>{{ props.ui.customLabel }}</span>
        </div>
        <div class="image-content">
            <el-skeleton>
                <template #template>
                    <el-skeleton-item
                        variant="image"
                        :style="{
                            width: props.ui.width ? props.ui.width : '300px',
                            borderRadius: props.ui.customShape === 'round' ? '50%' : '12px',
                            height:
                                props.ui.customShape === 'round' || props.ui.width ? props.ui.width : '300px'
                        }"
                    />
                </template>
            </el-skeleton>
        </div>
    </div>
</template>

<style lang="less" scoped>
.image-view-render-content {
    display: flex;
    width: 100%;
    flex-direction: column;
    padding: 0 16px;

    .label {
        font-size: 18px;
        color: #000;
        text-align: center;
        line-height: 33px;
        flex-shrink: 0;
        padding: 20px 0 15px 0;
        @apply dark:(text-light-900/80);
    }

    .image-content {
        .center();

        :deep(.el-skeleton) {
            .center();
        }
    }
}
</style>
