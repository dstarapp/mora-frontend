<template>
    <el-dialog :title="title" v-model="dialogVisible" :before-close="handleClose" @closed="afterClose">
        <i @click="prev" v-if="progress >= 1" class="iconfont icon-back-left"></i>

        <div class="progress">
            <em :class="progress === 0 ? 'current' : progress > 0 ? 'complete' : ''">
                <i v-if="progress > 0">
                    <Select />
                </i>
                <i v-else>1</i>
            </em>
            <i></i>
            <em :class="progress === 1 ? 'current' : progress > 1 ? 'complete' : ''">
                <i v-if="progress > 1">
                    <Select />
                </i>
                <i v-else>2</i>
            </em>
            <i></i>
            <em :class="progress === 2 ? 'current' : progress > 2 ? 'complete' : ''">
                <i v-if="progress > 2">
                    <Select />
                </i>
                <i v-else>3</i>
            </em>
            <i></i>
            <em :class="progress >= 3 ? 'complete' : ''">
                <i v-if="progress >= 3">
                    <Select />
                </i>
                <i v-else>4</i>
            </em>
        </div>
        <div v-if="progress === 0 || progress === 2" class="validation">
            <p class="title">
                {{ $t('planetTips.validation.validation.useWallet') }}
            </p>
            <div>
                <strong>{{ walletData.useWallet }}</strong>
            </div>
            <p class="title mt20">
                {{ $t('planetTips.validation.validation.sendWalletL') }}
                <em>{{ walletData.sendCanister }}icp</em>
                {{ $t('planetTips.validation.validation.sendWalletR') }}
            </p>
            <div>
                <strong>{{ walletData.sendWallet }}</strong>
                <i @click="copy(walletData.sendWallet)" class="iconfont icon-copy"></i>
            </div>
            <p class="title tip">
                {{ $t('planetTips.validation.validation.prove') }}
            </p>
        </div>

        <div v-if="validationType === 'address' && progress === 1" class="address">
            <el-input v-model="newAddress" :placeholder="$t('planetTips.validation.address.placeholder')" />
        </div>

        <div v-if="validationType === 'owner' && progress === 1" class="owner">
            <el-input v-model="newAddress" :placeholder="$t('planetTips.validation.owner.placeholder')" />
            <div class="tips">
                <i class="iconfont icon-attention"></i>
                <p>{{ $t('planetTips.validation.owner.tips') }}</p>
            </div>
        </div>

        <div v-if="progress === 3" class="success">
            <img src="@/assets/svg/cheers.svg" alt="" />
            <p class="title" v-html="successText"></p>
            <strong>{{ successAddress }}</strong>
        </div>

        <div class="validate-button" v-if="progress < 3">
            <div class="verify" :class="{ loading: isLoading, disable: progress === 1 && !newAddress }" @click="next">
                <img src="@/assets/svg/loading.svg" v-if="isLoading" />
                <template v-if="progress === 0">
                    {{ $t('planetTips.validation.verify') }}
                </template>
                <template v-if="progress === 1">
                    {{
        validationType === 'owner'
            ? $t('planetTips.validation.change')
            : $t('planetTips.validation.next')
    }}
                </template>
                <template v-if="progress === 2">
                    {{ $t('planetTips.validation.verifyChange') }}
                </template>
            </div>
        </div>
    </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { Select } from '@element-plus/icons-vue';
import { t } from '@/i18n';
import { copyText } from '@/utils/functions';
import { ElMessage } from 'element-plus';

export default defineComponent({
    name: 'Updates',
    emits: ['componentClose'],
    props: ['componentData'],
    components: { Select },
    setup(props, context) {
        const dialogVisible = ref(true);
        const isLoading = ref();
        const validationType = ref();
        const title = ref();
        const walletData = ref();
        const newAddress = ref();
        const progress = ref(0);
        const successText = ref();
        const successAddress = ref();

        const handleClose = () => {
            dialogVisible.value = false;
        };

        const afterClose = () => {
            context.emit('componentClose');
        };

        const next = () => {
            if (progress.value === 0) {
                isLoading.value = true;

                setTimeout(() => {
                    isLoading.value = false;
                    let success = true;
                    if (!success) {
                        ElMessage.error(t('planetTips.validation.validationFails'));
                        return;
                    }
                    progress.value = 1;
                    return;
                }, 1000);
                return;
            }

            if (progress.value === 1) {
                if (!newAddress.value) {
                    return;
                }
                progress.value = 2;
                return;
            }

            if (progress.value === 2) {
                isLoading.value = true;

                setTimeout(() => {
                    isLoading.value = false;
                    let success = true;
                    if (!success) {
                        ElMessage.error(t('planetTips.validation.validationFails'));
                        return;
                    }
                    progress.value = 3;
                    successText.value = t('planetTips.validation.success');
                    successAddress.value =
                        'b209c76145594d7b2e65LO57230769d822270e84c7a7924feffde9dc';
                    return;
                }, 1000);
                return;
            }
        };

        const copy = (id) => {
            copyText(id);
        };

        const prev = () => {
            progress.value = progress.value - 1;
        };

        onMounted(() => {
            validationType.value = props.componentData;
            if (!validationType.value) {
                handleClose();
                return;
            }
            if (validationType.value === 'owner') {
                title.value = t('planetTips.validation.title1');
            }

            if (validationType.value === 'address') {
                title.value = t('planetTips.validation.title2');
            }

            walletData.value = {
                useWallet: 'b209c76145594d7b2e6539b7595467239d769d822270e84c7a7924feffer9dc',
                sendWallet: 'b209c76145594d7b2e6539b7595467239d769d822270e84c7a7924feffer9dc2',
                sendCanister: '0.00015',
            };
        });

        return {
            successText,
            successAddress,
            dialogVisible,
            isLoading,
            validationType,
            title,
            walletData,
            progress,
            newAddress,
            next,
            prev,
            handleClose,
            afterClose,
            copy,
        };
    },
});
</script>

<style scoped lang="less">
.icon-back-left {
    display: flex;
    color: @text-color-grey;
    .font-size(16);
    position: absolute;
    .left(25);
    .top(18);
    cursor: pointer;
}

.progress {
    display: flex;
    .margin(0, 58, 0, 58);
    align-items: center;

    em {
        .center();
        .width(32);
        .height(32);
        border: 2px solid @border-color;
        border-radius: 50%;

        font-style: normal;
        font-weight: 400;
        color: @text-fcolor;
        overflow: hidden;

        i {
            display: flex;
            width: 100%;
            height: 100%;
            background: #fff;
            .center();
            font-style: normal;
            .font-size(16);
            color: @text-fcolor;
        }

        svg {
            .width(20);
            .height(20);
        }

        &.current {
            color: @text-active;
            border-color: @border-color-active;

            i {
                color: @text-active;
            }
        }

        &.complete {
            color: @text-complete;
            border-color: @bg-color-body-complete;

            i {
                color: @text-complete;
            }
        }
    }

    i {
        display: flex;
        flex: 1;
        height: 2px;
        background: @border-color;
    }
}

.validation {
    display: flex;
    flex-direction: column;
    .margin(30, 28, 0, 28);

    .title {
        font-style: normal;

        .font-size(16);
        color: @text-color-icon;
        width: 100%;
        text-align: left;

        em {
            .font-size(16);
            color: @text-active;
            font-style: normal;
        }

        &.mt20 {
            .margin(22);
        }

        &.tip {
            .margin(10);
        }
    }

    div {
        display: flex;
        .padding(9, 19, 6, 18);
        .margin(10, 0, 0, 0);
        background: @bg-color-hover;
        .border-radius(10);
        text-align: left;
        font-style: normal;
        font-weight: 400;
        .font-size(14);
        color: @text-fcolor;

        strong {
            display: flex;
            flex: 1;
        }

        .icon-copy {
            .center();
            .height(30);
            .width(30);
            color: @text-color-grey;
            border: 2px solid @border-color;
            .font-size(16);
            .border-radius(10);
            cursor: pointer;
            transition: @transition;
            flex-shrink: 0;
            .margin(0, 0, 0, 10);

            &:hover {
                transition: @transition;
                border-color: @bg-color-body-active;
                color: @text-active;
            }
        }
    }
}

.address {
    display: flex;
    flex-direction: column;
    .margin(37, 28, 200, 28);

    :deep(.el-input) {
        .height(55);
        background: @bg-color-grey;
        .border-radius(10);

        .el-input__wrapper {
            .padding(0, 18, 0, 18);
        }

        .el-input__inner {
            font-style: normal;

            .font-size(14);
            color: @text-color-grey;
            height: 100%;
        }
    }
}

.owner {
    display: flex;
    flex-direction: column;
    .margin(37, 28, 100, 28);

    :deep(.el-input) {
        .height(55);
        background: @bg-color-grey;
        .border-radius(10);

        .el-input__wrapper {
            .padding(0, 18, 0, 18);
        }

        .el-input__inner {
            font-style: normal;

            .font-size(14);
            color: @text-color-grey;
            height: 100%;
        }
    }

    .tips {
        .margin(20, 0, 0, 0);
        display: flex;

        .icon-attention {
            .font-size(16);
            color: #cccccc;
        }

        p {
            text-align: left;
            .margin(3, 0, 10, 8);
            font-style: normal;

            .font-size(14);
            .line-height(19);
            color: @text-color-grey;
        }
    }
}

.success {
    display: flex;
    flex-direction: column;
    align-items: center;

    img {
        .width(100);
        .margin(50, 0, 10, 0);
    }

    p {
        font-style: normal;
        font-weight: 350;
        .font-size(18);
        .line-height(28);
        text-align: center;
        color: @text-color;
    }

    strong {
        .margin(30, 0, 20, 0);
        background: @bg-color-grey;
        .border-radius(10);
        .padding(18, 18, 18, 18);
        font-style: normal;
        font-weight: 400;
        .font-size(14);
        color: @text-fcolor;
    }
}

.validate-button {
    display: flex;
    .margin(20, 0, 10, 0);
    width: 50%;
    margin-left: auto;
    margin-right: auto;

    div {
        .border-radius(10);
        .center();
        .height(45);
        min-height: 45px;
        flex: 1;
        font-style: normal;
        font-weight: 350;
        .font-size(16);
        .line-height(19);
        cursor: pointer;
        transition: @transition;
    }

    .verify {
        background: @bg-color-body-active;
        color: @text-color-inverse;

        &:hover {
            opacity: 0.85;
        }

        &.disable {
            background: @bg-color-body-disable;
            color: @bg-color;
            cursor: not-allowed;
        }

        &.loading {
            background: @bg-color-body-loading;
            transition: @transition;
        }

        img {
            .margin(0, 5, 0, 0);
        }
    }
}

@media screen and (min-width: 0) and (max-width: 750px) {
    .progress {
        .margin-media(20, 70, 0, 70);
    }

    .validation {
        .margin(15, 15, 0, 15);

        .title {
            word-break: break-word;
        }
    }

    .mora-button {
        margin-left: auto;
        margin-right: auto;
    }

    .validate-button {
        width: 70%;
        margin: 20px auto 0 auto;

        div {
            .height(80);
        }
    }
}
</style>
