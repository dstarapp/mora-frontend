<script lang="ts" setup>
import { PropType } from 'vue';

const props = defineProps({
    ui: {
        type: Object as PropType<Record<string, any>>,
        required: true,
    },
});
</script>

<template>
    <div class="bool-view-render-content">
        <div class="label" v-if="props.ui.customLabel">
            <span>{{ props.ui.customLabel }}</span>
        </div>
        <div class="bool-content">
            <el-result
                icon="success"
                :title="props.ui.customTrueText ? props.ui.customTrueText : 'true'"
            >
            </el-result>
        </div>
    </div>
</template>

<style lang="less" scoped>
.bool-view-render-content {
    display: flex;
    width: 100%;
    flex-direction: column;
    padding: 0 26px;

    .label {
        font-size: 18px;
        color: #000;
        text-align: center;
        line-height: 33px;
        flex-shrink: 0;
        padding: 20px 0 15px 0;
        @apply dark:(text-light-900/80);
    }

    .bool-content {
        .center();
        flex: 1;

        :deep(.el-result) {
            .el-result__title {
                margin-top: 15px;
                p {
                    font-style: normal;
                    font-weight: 400;
                    font-size: 16px;
                    text-align: center;
                    @apply dark:(text-light-900);
                }
            }
            .el-result__icon {
                > svg {
                    width: 80px;
                    height: 80px;
                }
            }
        }
    }
}
</style>
