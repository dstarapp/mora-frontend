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
    <div class="table-view-render-content">
        <div class="label" v-if="props.ui.customLabel">
            <span>{{ props.ui.customLabel }}</span>
        </div>
        <div class="table-content">
            <el-table style="width: 100%" :border="props.ui.customBorder">
                <el-table-column :fixed="props.ui.customFixedHeader" prop="Title1" label="Title1" />
                <el-table-column prop="Title2" label="Title2" />
                <el-table-column prop="Title3" label="Title3" />
            </el-table>
        </div>
    </div>
</template>

<style lang="less" scoped>
.table-view-render-content {
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

    .table-content {
        .center();
        margin-top: 10px;
    }
}
</style>
