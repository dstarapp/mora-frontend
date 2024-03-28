<template>
    <div class="profile-audit-box">
        <div class="audit-total">
            <p>
                {{ $t('plugin.profileUser.total1') }}
                {{ auditData.length }}
                {{ $t('plugin.profileUser.total2') }}
            </p>
            <span>
                <div class="refresh" @click="refresh">
                    <i class="iconfont icon-refresh"></i>
                </div>
            </span>
        </div>
        <div class="audit-box" v-if="isLoading">
            <el-skeleton class="audit-list" animated :count="24">
                <template #template>
                    <div class="item !bg-light-200 dark:(!bg-dark-300)">
                        <strong>{{ $t('plugin.audit.sTitle') }}</strong>
                        <span>
                            <el-skeleton-item variant="h1" class="w-42 h-8" />
                            <el-skeleton-item variant="button" class="w-9 h-9" />
                        </span>
                    </div>
                </template>
            </el-skeleton>
        </div>
        <div class="audit-box" v-if="auditData && auditData.length && !isLoading">
            <div class="audit-list">
                <div class="item" v-for="(item, index) in auditData" :key="index">
                    <strong>{{ $t('plugin.audit.sTitle') }}</strong>
                    <span>
                        <p>{{ item.code }}</p>
                        <i class="iconfont icon-copy" @click="copyText(item.code)"></i>
                    </span>
                </div>
            </div>
        </div>
        <div class="noData" v-else>
            <i class="iconfont icon-no"></i>
            <span>{{ $t('plugin.audit.noData') }}</span>
        </div>

    </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { codesQueryByUser } from '@/components/light-experience/canisters/audit/apis';
import store from '@/store';
import { copyText } from '@/utils/functions';
import { TransformedAuditCodeWithStatus } from '@/components/light-experience/canisters/audit/audit.did.d';

export default defineComponent({
    setup() {
        const auditData = ref<TransformedAuditCodeWithStatus[]>([]);
        const isLoading = ref<boolean>(true);

        const getAuditList = () => {
            isLoading.value = true;
            auditData.value = [];

            codesQueryByUser(store.state.agent)
                .then((res) => {
                    auditData.value = res;
                })
                .catch((err) => {
                    console.error(err);
                })
                .finally(() => {
                    isLoading.value = false;
                });
        };

        const refresh = () => {
            getAuditList();
        };

        onMounted(() => {
            getAuditList();
        });

        return {
            auditData,
            isLoading,
            copyText,
            refresh,
        };
    },
});
</script>

<style scoped lang="less">
.skeleton {
}

.profile-audit-box {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 30px 35px;
}

.audit-total {
    display: flex;
    justify-content: space-between;
    height: 40px;
    margin-bottom: 10px;

    p {
        display: flex;
        align-items: center;
        font-weight: 400;
        font-size: 16px;
        height: 40px;
        color: #000000;
        @apply dark:(text-light-900);
    }

    span {
        display: flex;

        .refresh {
            .center();
            height: 40px;
            width: 40px;
            border: 1px solid #dddddd;
            border-radius: 10px;
            margin-left: 18px;
            color: #999999;
            font-size: 18px;
            cursor: pointer;
            @apply dark:(border-dark-100);
        }
    }
}

.audit-box {
    display: flex;
    flex: 1;
    flex-direction: column;

    .audit-list {
        display: grid;
        width: 100%;
        grid-template-columns: repeat(4, 1fr);
        align-items: start;
        grid-gap: 26px;
        grid-auto-rows: minmax(0, max-content);
        flex: 1;

        .item {
            background: #f6f6f6;
            border-radius: 12px;
            padding: 19px 19px 19px 22px;
            @apply dark:(bg-dark-300);

            strong {
                font-weight: 400;
                font-size: 14px;
                line-height: 16px;
                color: #666666;
                @apply dark:(text-light-900/80);
            }

            span {
                display: flex;
                height: 36px;
                align-items: center;
                margin-top: 14px;
                justify-content: space-between;

                p {
                    font-weight: 700;
                    font-size: 30px;
                    color: #000000;
                    @apply dark:(text-white);
                }

                i {
                    .center();
                    width: 36px;
                    height: 36px;
                    background: #ffffff;
                    border: 2px solid #dddddd;
                    border-radius: 10px;
                    font-size: 16px;
                    color: #999999;
                    cursor: pointer;
                    transition: @transition;
                    @apply dark:(bg-dark-100 border-dark-100);

                    &:hover {
                        border: 2px solid #aaa;
                        transition: @transition;
                        cursor: pointer;
                    }
                }
            }
        }
    }
}
.noData {
    @apply w-full h-full flex items-center justify-center flex-col;
    i {
        @apply text-7xl text-gray-300 dark:(text-light-900/30);
    }
    span {
        @apply py-3 text-gray-400 dark:(text-light-900/50);
    }
}
</style>
