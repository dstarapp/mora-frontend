<template>
    <div class="notice-box" v-if="!noticeData">
        <el-skeleton animated :count="7" class="notice-list">
            <template #template>
                <div class="item">
                    <div class="left flex-1">
                        <span class="flex items-center">
                            <el-skeleton-item variant="text" class="w-4 h-4 rounded-full mr-2" />
                            <el-skeleton-item variant="h3" class="w-30 h-5" />
                        </span>
                        <p>
                            <el-skeleton-item variant="text" class="w-4/5 h-4" />
                        </p>
                    </div>
                    <div class="right">
                        <el-skeleton-item variant="text" class="w-26" />
                    </div>
                </div>
            </template>
        </el-skeleton>
    </div>

    <div class="notice-box" v-else-if="noticeData && noticeData?.data && noticeData.data.length">
        <div class="info">
            <span @click="onReadAll">{{ $t('plugin.notice.readAll') }}</span>
        </div>
        <div class="notice-list">
            <div class="item" :class="{ isRead: item.read }" v-for="item in noticeData.data" :key="item.index"
                @click="onRead(item)">
                <template v-if="messageData(item.message)">
                    <div class="left">
                        <span>
                            <i v-if="messageData(item.message).reason.toString() === ''"
                                class="iconfont icon-chose"></i>
                            <i v-else class="iconfont icon-attention"></i>
                            <strong>
                                {{
        messageData(item.message).reason.toString() === ''
            ? $t('plugin.notice.approved')
            : $t('plugin.notice.rejected')
    }}
                            </strong>
                        </span>
                        <p>
                            {{
            messageData(item.message).reason.toString() === ''
                ? `Congratulations, plugin ID:${messageData(item.message).id
                } has passed the review.`
                : messageData(item.message).reason[0]
        }}
                        </p>
                    </div>
                    <div class="right" v-if="messageData(item.message).timestamp">
                        {{
        moment(
                        Math.trunc(Number(messageData(item.message).timestamp) / 1000000),
                        ).format('MMMM Do YYYY, h:mm:ss a')
                        }}
                    </div>
                </template>
            </div>
        </div>
    </div>

    <div class="noData" v-else>
        <i class="iconfont icon-no"></i>
        <span>{{ $t('plugin.notice.noData') }}</span>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, inject, PropType } from 'vue';
import { readMessage } from '@/components/light-experience/canisters/experience_worker/apis';
import { GET_USER_EXPERIENCE_CANISTER } from '@/store/modules/light';
import {
    LightExperienceAuditingResult,
    LightExperienceFrozenByAuditor,
    LightExperienceStatusFrozenArg,
} from '@/components/light-experience/canisters/experience_worker/experience_worker.did.d';
import { Agent } from '@dfinity/agent';
import store, { LIGHT } from '@/store';
import moment from 'moment';
import { PageData } from '@/components/light-experience/canisters/common';
import { LightExperienceMessage } from '@/components/light-experience/canisters/experience_worker/experience_worker.did.d';

const agent = computed<Agent>(() => store.state.agent);
const currentUser = async (): Promise<string> => (await agent.value.getPrincipal()).toText();
const userCanisters = computed<Record<string, string>>(
    () => store.getters[`${LIGHT}/${GET_USER_EXPERIENCE_CANISTER}`],
);
const userCanister = async (): Promise<string> => {
    const current_user = await currentUser();
    return userCanisters.value[current_user] ?? '';
};

const noticeData = inject<PropType<PageData<LightExperienceMessage>> | false>('noticeData');

const messageData = (
    item,
):
    | undefined
    | LightExperienceAuditingResult
    | LightExperienceFrozenByAuditor
    | LightExperienceStatusFrozenArg => {
    if (item['AuditingResult']) {
        return item['AuditingResult'] as LightExperienceAuditingResult;
    } else if (item['FrozenByAuditor']) {
        return item['FrozenByAuditor'] as LightExperienceFrozenByAuditor;
    } else if (item['FrozenByUserSelf']) {
        return item['FrozenByUserSelf'] as LightExperienceStatusFrozenArg;
    } else {
        return undefined;
    }
};

const onRead = async (item) => {
    if (item.read) {
        return;
    }

    item.read = true;

    const user_canister = await userCanister();
    userCanister()
        .then((user_canister) => { })
        .then(() => {
            readMessage(user_canister, agent.value, item.index)
                .then(() => { })
                .catch((err) => {
                    item.read = false;
                });
        })
        .catch((e) => { });
};

const onReadAll = () => {
    if (noticeData && noticeData?.value && noticeData?.value?.data) {
        noticeData.value.data.map((item) => {
            if (!item.read) {
                onRead(item);
            }
        });
    }
};
</script>

<style scoped lang="less">
.notice-box {
    display: flex;
    flex: 1;
    flex-direction: column;
    padding: 14px 35px;

    .info {
        display: flex;
        justify-content: flex-end;

        p {
            font-weight: 400;
            font-size: 18px;
            line-height: 33px;
            color: #666666;

            em {
                font-style: normal;
                font-weight: 500;
                font-size: 18px;
                line-height: 33px;
                color: #34d399;
                margin-right: 3px;
            }
        }

        span {
            font-weight: 400;
            font-size: 16px;
            line-height: 33px;
            color: #34d399;
            cursor: pointer;
        }
    }

    .notice-list {
        display: flex;
        flex: 1;
        flex-direction: column;
        overflow-y: scroll;
        .noScrollbar();

        .item {
            display: flex;
            align-items: center;
            width: 100%;
            border-bottom: 1px solid #e8e8e8;
            justify-content: space-between;
            cursor: pointer;
            opacity: 1;
            transition: @transition;
            @apply dark:(border-dark-100);

            &.isRead {
                opacity: 0.5;
                transition: @transition;
            }

            .left {
                padding: 22px 0 13px 0;
                display: flex;
                flex-direction: column;
                justify-content: flex-start;

                span {
                    height: 33px;
                    font-weight: 500;

                    i {
                        font-size: 18px;
                        margin-right: 8px;

                        &.icon-chose {
                            color: #35d49a;
                        }

                        &.icon-attention {
                            color: #f19e38;
                        }
                    }

                    strong {
                        font-size: 18px;
                        line-height: 33px;
                        color: #000000;
                        font-weight: 500;
                        @apply dark:(text-light-900);
                    }
                }

                p {
                    font-weight: 400;
                    font-size: 16px;
                    line-height: 29px;
                    color: #666666;
                }
            }

            .right {
                .center();
                height: 100%;
                font-weight: 400;
                font-size: 16px;
                color: #666666;
            }
        }
    }
}

.noData {
    @apply w-full py-20 flex items-center justify-center flex-col;

    i {
        @apply text-7xl text-gray-300 dark:(text-light-900/30);
    }

    span {
        @apply py-3 text-gray-400 dark:(text-light-900/50);
    }
}
</style>
