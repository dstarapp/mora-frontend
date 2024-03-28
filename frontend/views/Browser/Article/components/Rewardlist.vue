<template>
    <el-dialog
        :title="$t('Reward.record')"
        v-model="dialogVisible"
        :before-close="handleClose"
        @closed="afterClose"
    >
        <div class="listbox">
            <div class="list" v-for="item in (listData as any)" :key="item.id">
                <div class="userbox">
                    <div class="avatar">
                        <img v-if="!item.avatar" src="@/assets/svg/defaultAvatar.svg" />
                        <img v-else :src="item.avatar" />
                    </div>
                    <strong>{{
                        item.icnaming ? item.icnaming : dealPid(item.from.toString())
                    }}</strong>
                    <span v-if="item.icnaming">{{ dealPid(item.from.toString()) }}</span>
                </div>
                <div class="tbox">
                    <div class="amount">{{ Number(item.amount) / 100000000 }} {{ item.token }}</div>
                    <div class="date">
                        {{ moment(Number(item.created)).format('llll') }}
                    </div>
                </div>
            </div>
        </div>
        <div class="listbottom">
            <span>{{ listData.length }} {{ $t('Reward.counts') }}</span>
        </div>
    </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { dealPid, format_date } from '@/utils/functions';
import moment from 'moment';

export default defineComponent({
    emits: ['close'],
    props: {
        listData: { type: Array },
    },
    setup(props, context) {
        const dialogVisible = ref(true);
        const handleClose = () => {
            context.emit('close');
        };

        const afterClose = () => {
            context.emit('close');
        };

        return {
            dialogVisible,
            handleClose,
            afterClose,
            dealPid,
            format_date,
            moment,
        };
    },
});
</script>

<style lang="less" scoped>
.listbox {
    @apply max-h-125 overflow-y-auto pr-2;
    .scrollbar();
    .list {
        @apply w-full mb-3 flex justify-between items-center;
        .userbox {
            @apply flex items-center;
            .avatar {
                @apply w-8 h-8;
                img {
                    @apply w-full h-full rounded-full;
                }
            }
            strong {
                @apply text-lg pl-3 text-black font-medium dark:(text-light-900/80) <sm:(text-base pl-2);
            }
            span {
                @apply px-2 py-2px ml-3 bg-gray-200 text-sm rounded-full dark:(bg-dark-300 text-light-900/60) <sm:(text-xs);
            }
        }
        .tbox {
            @apply flex flex-col;
            .amount {
                @apply text-black text-right font-medium dark:(text-light-900);
            }
            .date {
                @apply text-xs text-gray-400 text-right dark:(text-gray-400/60);
            }
        }
    }
}
.listbottom {
    @apply w-full flex justify-between items-center pt-3;
    span {
        &.reward {
            @apply pr-2 text-purple-500 font-medium transition duration-300 hover:(transition duration-300 text-purple-400 cursor-pointer);
        }
    }
}
</style>
