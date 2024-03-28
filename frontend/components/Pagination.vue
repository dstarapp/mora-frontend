<template>
    <div class="pagination">
        <i :class="{ disable: currentPage === 1 || total === 1 }" class="iconfont icon-arrow-left" @click="prev"></i>
        <span>{{ currentPage }} <i>/</i> {{ Math.ceil(total / pageSize) }}</span>
        <i :class="{ disable: currentPage >= Math.ceil(total / pageSize) }" class="iconfont icon-arrow-right"
            @click="next"></i>
        <el-input v-model="inputGo" type="number" :max="Math.ceil(total / pageSize)" :min="1" @keydown.enter="pageGo"
            :placeholder="currentPage.toString()" />
        <div class="go" @click="pageGo">GO</div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { t } from '@/i18n';

export default defineComponent({
    name: 'Pagination',
    emits: ['next', 'prev', 'goPage'],
    props: {
        total: { type: Number, default: 0 },
        currentPage: { type: Number, default: 0 },
        pageSize: { type: Number, default: 0 },
    },
    setup(props, context) {
        const inputGo = ref();

        const prev = () => {
            if (props.currentPage === 1 || props.total === 1) {
                return false;
            }
            context.emit('prev');
        };

        const next = () => {
            if (props.currentPage >= Math.ceil(props.total / props.pageSize)) {
                return false;
            }
            context.emit('next');
        };
        const pageGo = () => {
            if (inputGo.value > Math.ceil(props.total / props.pageSize)) {
                ElMessage.error(t('utils.pagination.noMore'));
                return false;
            }
            if (inputGo.value < 1) {
                inputGo.value = 1;
            }
            context.emit('goPage', inputGo.value);
        };

        return {
            inputGo,
            pageGo,
            prev,
            next,
        };
    },
});
</script>

<style scoped lang="less">
.pagination {
    display: flex;
    justify-content: flex-end;
    width: 100%;
    .height(40);
    align-items: center;
    margin-top: auto;

    i {
        cursor: pointer;
        .font-size(16);
        color: @text-color;
        @apply dark:(text-light-900/80);

        &.disable {
            color: @text-color-grey;
            cursor: not-allowed;
        }
    }

    span {
        font-style: normal;
        font-weight: 400;
        .font-size(16);
        color: @text-color;
        .margin(0, 20, 0, 20);
        @apply dark:(text-light-900/80);

        i {
            font-style: normal;
            .font-size(14);
            color: @text-color-grey;
        }
    }

    :deep(.el-input) {
        .width(80);
        background: #f7f7f7;
        .border-radius(10);
        .height(40);
        .font-size(14);
        border: 0;
        .margin(0, 0, 0, 20);
        box-sizing: border-box;
        @apply dark:(bg-dark-300);

        .el-input__inner {
            text-align: center !important;
        }
    }

    .go {
        .center();
        font-style: normal;
        font-weight: 400;
        .font-size(16);
        color: @text-color;
        border: 1px solid @border-color;
        .border-radius(10);
        .height(40);
        .padding(0, 15, 0, 15);
        .margin(0, 0, 0, 17);
        cursor: pointer;
        transition: @transition;
        @apply dark:(text-light-900/80 border-dark-100);

        &:hover {
            border-color: @border-color-active;
            color: @text-active;
            box-sizing: border-box;
            transition: @transition;
        }
    }
}
</style>
