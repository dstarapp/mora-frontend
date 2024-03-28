<template>
    <el-dialog
        style="width: 596px"
        class="headerMargin"
        :title="$t('plugin.submitAudit.title')"
        v-model="props.show"
        :before-close="onBeforeClose"
        @closed="onDialogClose"
    >
        <div class="submit-audit-box">
            <div class="submit-audit-content">
                <div class="item">
                    <div class="label">
                        {{ $t('plugin.submitAudit.label.name') }}
                    </div>
                    <div class="input">
                        <p>{{ info.name }}</p>
                    </div>
                </div>
                <div class="item">
                    <div class="label">
                        {{ $t('plugin.submitAudit.label.category') }}
                    </div>
                    <div class="input">
                        <p>{{ info.categories.toString() }}</p>
                    </div>
                </div>
                <div class="item">
                    <div class="label">
                        {{ $t('plugin.submitAudit.label.instruction') }}
                    </div>
                    <div class="input">
                        <p>
                            {{ info.instruction }}
                        </p>
                    </div>
                </div>
                <div class="item">
                    <div class="label lh36">
                        {{ $t('plugin.submitAudit.label.auditCode') }}
                    </div>
                    <div class="input">
                        <span>
                            <el-input v-model="auditCode" />
                            <i v-if="!auditCode" class="iconfont icon-failed"></i>
                            <i v-if="auditCode" class="iconfont icon-chose"></i>
                        </span>

                        <div class="tip">
                            <i class="iconfont icon-attention"></i>
                            <p>{{ $t('plugin.submitAudit.tip') }}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="button-box">
                <div>
                    <div class="cancel" @click="onDialogClose">
                        {{ $t('plugin.generic.cancel') }}
                    </div>
                    <div class="btn" :class="{ disabled: submitLoading }" @click="onComplete">
                        <img v-if="submitLoading" src="@/assets/svg/loading.svg" alt="" />
                        {{ $t('plugin.generic.confirm') }}
                    </div>
                </div>
            </div>
        </div>
    </el-dialog>
</template>

<script lang="ts" setup>
import { ref, PropType, onMounted } from 'vue';
import { LightBasicInfo } from '@/components/light-experience/types/core';
import { codesQueryByUser } from '@/components/light-experience/canisters/audit/apis';
import { lightExperienceAuditing } from '@/components/light-experience/canisters/experience_manager/apis';
import store from '@/store';
import { ElMessage } from 'element-plus';
import { t } from '@/i18n';
import { useRouter, useRoute } from 'vue-router';
import { StringResult } from '@mora-light/core/types/common';
import { LightCoreContent } from '@/components/light-experience/canisters/experience_manager/experience_manager.did.d';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const props = defineProps({
    show: {
        type: Boolean,
        required: true,
    },
    info: {
        type: Object as PropType<LightBasicInfo>,
        required: true,
    },
    lightID: {
        type: String,
        required: true,
    },
    content: {
        type: Object as PropType<{
            experience_json: string;
            core_json_result: StringResult<string>;
        }>,
        required: true,
    },
});

const onDialogClose = () => {
    if (submitLoading.value) {
        return;
    } else {
        emit('complete');
    }
};

const onBeforeClose = () => {
    if (submitLoading.value) {
        return;
    } else {
        emit('complete');
    }
};

const auditCode = ref();

const emit = defineEmits(['complete']);

const submitLoading = ref(false);
const onComplete = () => {
    if (props.content?.core_json_result?.err) {
        ElMessage.error(t('plugin.submitAudit.ParameterError'));
        return;
    }
    if (!auditCode.value) {
        ElMessage.error(t('plugin.submitAudit.auditCodeError'));
        return;
    }
    submitLoading.value = true;
    const str: LightCoreContent = {
        id: props.lightID,
        info_json: JSON.stringify(props.info),
        core_json: props.content.core_json_result.ok as string,
        experience_json: props.content.experience_json,
    };
    lightExperienceAuditing(store.state.agent, props.lightID, str, auditCode.value)
        .then((res) => {
            ElMessage.success(t('plugin.submitAudit.submitSuccess'));
            emit('complete');
            router.push({ name: 'lightProfileUser' });
        })
        .catch((err) => {
            console.error(err);
        })
        .finally(() => {
            submitLoading.value = false;
            axios
                .create({
                    timeout: 5000,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                })
                .post(
                    'https://mora-light-audit-notice.moraipfs.workers.dev/',
                    {
                        msg_type: 'text',
                        content: {
                            text: `New plugins need to be reviewed: ${props.lightID}`,
                        },
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    },
                );
        });
};

onMounted(() => {
    codesQueryByUser(store.state.agent)
        .then((res) => {
            if (res.length) {
                const code = res[0].code;
                auditCode.value = code;
            }
        })
        .catch((err) => {
            console.error(err);
        })
        .finally(() => {});
});
</script>

<style lang="less" scoped>
.submit-audit-box {
    display: flex;
    flex-direction: column;

    .submit-audit-content {
        display: flex;
        flex-direction: column;

        .item {
            display: flex;
            margin-top: 27px;

            .label {
                display: flex;
                width: 120px;
                font-weight: 400;
                font-size: 14px;
                line-height: 25px;
                text-align: right;
                color: #666666;
                @apply dark:(text-light-900/60);

                &.lh36 {
                    line-height: 36px;
                }
            }

            .input {
                display: flex;
                flex: 1;
                position: relative;
                justify-content: center;
                flex-direction: column;

                > p {
                    font-weight: 400;
                    font-size: 14px;
                    line-height: 180.9%;
                    color: #000000;
                    text-align: left;
                    @apply dark:(text-light-900);
                }

                span {
                    :deep(.el-input) {
                        border: 1px solid #dddddd;
                        border-radius: 8px;
                        display: flex;
                        flex: 1;
                        height: 36px;
                        @apply dark: (border-dark-100);
                        transition: @transition;

                        &:hover {
                            border-color: #34d399;
                            transition: @transition;
                        }

                        .el-input__wrapper {
                            padding: 0 10px;
                            border-radius: 6px;

                            .el-input__inner {
                                font-size: 14px;
                                height: 100%;
                            }
                        }
                    }

                    > i {
                        font-size: 16px;
                        position: absolute;
                        right: 11px;
                        top: 0;
                        height: 36px;
                        .center();
                    }
                }

                .icon-chose {
                    color: #35d49a;
                }

                .icon-failed {
                    color: @color-error;
                }
            }

            .tip {
                display: flex;
                margin-top: 11px;

                i {
                    color: #cccccc;
                    font-size: 14px;
                    line-height: 17px;
                    @apply dark:(text-light-900/40);
                }

                p {
                    font-style: normal;
                    font-weight: 400;
                    font-size: 14px;
                    line-height: 17px;
                    color: #666666;
                    text-align: left;
                    margin-left: 8px;
                    @apply dark:(text-light-900/60);
                }
            }
        }
    }

    .button-box {
        width: 100%;
        margin-top: 26px;

        div {
            display: flex;
            flex: 1;

            .cancel {
                height: 40px;
                background: #eee;
                border-radius: 8px;
                margin: 0;
                .center();
                cursor: pointer;
                flex-shrink: 1;
                @apply dark: (bg-dark-100);
                transition: @transition;

                &:hover {
                    box-shadow: 0 0 15px rgba(238, 238, 238, 0.5);
                    opacity: 0.85;
                    transition: @transition;
                }
            }

            .btn {
                .center();
                width: 155px;
                height: 40px;
                background: linear-gradient(90deg, #34d399, #7cee83);
                border-radius: 8px;
                color: black;
                margin: 0;
                margin-left: 28px;
                cursor: pointer;
                flex-shrink: 1;
                opacity: 1;
                transition: @transition;

                &:hover {
                    box-shadow: 0 0 15px rgba(52, 211, 153, 0.5);
                    opacity: 0.85;
                    transition: @transition;
                }

                &.disabled {
                    opacity: 0.5;
                    transition: @transition;
                }

                img {
                    width: 16px;
                    height: 16px;
                    margin-right: 5px;
                }
            }
        }
    }
}
</style>
