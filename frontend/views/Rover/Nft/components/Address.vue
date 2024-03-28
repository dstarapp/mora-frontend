<template>
    <el-dialog v-model="dialogVisible" :title="$t('roverNft.address.title')" :before-close="handleClose"
        @closed="afterClose">
        <div class="addressBox">
            <div class="cover">
                <img :src="addressData.metadata && addressData.metadata.thumb
        ? addressData.metadata.thumb
        : addressData.url
        " alt="" />
            </div>
            <div class="name">
                <p>{{ addressData.name }}</p>
                <strong>#{{ addressData.id }}</strong>
            </div>
            <div class="address">
                <p>{{ $t('roverNft.address.address') }}</p>
                <el-input v-model="addressVal" @keydown.enter="confirm" :disabled="isLoading"
                    :placeholder="$t('roverNft.address.placeholder')"></el-input>
            </div>
            <div class="mora-button">
                <div class="cancel" @click="cancel">
                    {{ $t('roverDashboard.subscriptions.removeComponent.cancel') }}
                </div>
                <div class="confirm" :class="{
        loading: isLoading,
        disabled: !addressVal,
    }" @click="confirm">
                    <img src="@/assets/svg/loading.svg" v-if="isLoading" />
                    {{ $t('roverDashboard.subscriptions.removeComponent.confirm') }}
                </div>
            </div>
        </div>
    </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, inject } from 'vue';
import { ElMessage } from 'element-plus';
import { TransferNFT } from './nft';
import { isPrincipalString } from '@/utils/functions';
import { t } from '@/i18n';

export default defineComponent({
    name: 'Address',
    props: {
        addressData: { type: Object, default: {} },
    },
    emits: ['addressClose', 'refresh'],
    setup(props, context) {
        const dialogVisible = ref(true);
        const addressVal = ref();
        const isLoading = ref(false);
        const NFTCanisterId = inject('NFTCanisterId', null);

        const handleClose = () => {
            if (isLoading.value) {
                ElMessage.error(t('roverNft.address.isLoadingClose'));
                return false;
            }
            dialogVisible.value = false;
        };

        const afterClose = () => {
            context.emit('addressClose');
        };

        const confirm = async () => {
            if (!NFTCanisterId || !NFTCanisterId.value) {
                return;
            }
            if (isLoading.value) {
                ElMessage.error(t('roverNft.address.isLoadingClose'));
                return false;
            }
            if (!addressVal.value) {
                ElMessage.error(t('roverNft.address.aemptyValue'));
                return false;
            }
            if (!isPrincipalString(addressVal.value)) {
                ElMessage.error(t('roverNft.address.pidError'));
                return false;
            }
            isLoading.value = true;
            let res = await TransferNFT(
                addressVal.value,
                Number(props.addressData.index),
                NFTCanisterId.value,
            );
            if (res) {
                context.emit('refresh');
                dialogVisible.value = false;
            } else {
                ElMessage.error(t('roverNft.address.transferError'));
            }
            isLoading.value = false;
        };

        const cancel = () => {
            dialogVisible.value = false;
        };

        return {
            dialogVisible,
            addressVal,
            isLoading,
            handleClose,
            afterClose,
            cancel,
            confirm,
        };
    },
});
</script>

<style scoped lang="less">
.addressBox {
    display: flex;
    flex-direction: column;
    align-items: center;

    .cover {
        .center();
        .width(166);
        .height(166);
        .padding(8, 8, 8, 8);
        background: @bg-color;
        border: 1px solid @border-color;
        box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.12);
        .border-radius(15);
        @apply dark:(bg-dark-300 border-dark-100);

        img {
            .width(150);
            object-fit: cover;
            .border-radius(15);
        }
    }

    .name {
        display: flex;
        font-style: normal;
        font-weight: 400;
        .font-size(14);
        text-align: center;
        color: @text-fcolor;
        .margin(13, 0, 0, 0);
        @apply dark:(text-light-900);

        p {
            .margin(0, 10, 0, 0);
        }

        strong {}
    }

    .address {
        display: flex;
        flex-direction: column;
        .margin(24, 0, 0, 0);
        .padding(0, 50, 0, 50);
        width: 100%;
        align-items: flex-start;

        p {
            font-style: normal;
            font-weight: 400;
            .font-size(14);
            color: @text-color;
            .margin(0, 0, 5, 0);
            @apply dark:(text-light-900/80);
        }

        .el-input {
            .height(45);
            background: @bg-color-grey;
            .border-radius(10);
            @apply dark:(bg-transparent);

            @media screen and (min-width: 0) and (max-width: 750px) {
                .height(80);
            }

            @media screen and (min-width: 751px) and (max-width: 1240px) {
                .height(80);
            }
        }
    }

    .mora-button {
        display: flex;
        width: 100%;
        .padding(0, 50, 0, 50);
        .margin(30, 0, 12, 0);
    }
}

@media screen and (min-width: 0) and (max-width: 750px) {
    .addressBox {
        .mora-button {
            .padding(0, 20, 0, 20);

            div {
                .height(80);
                .line-height(80);
            }
        }
    }
}
</style>
