<template>
    <div class="item" v-loading="isLoading">
        <span class="isExpired" v-if="isExpired">expired</span>
        <div class="isBlack" v-show="isBlack === 2 || subscriptionData.isblack">
            <i @click="pullBlack(subscriptionData.isblack)" class="iconfont icon-blacklist"></i>
        </div>
        <div class="user">
            <div class="header">
                <img
                    v-if="
                        !avatarLink || (avatarLink.length < 32 && ~avatarLink.includes('https://'))
                    "
                    src="@/assets/svg/defaultAvatar.svg"
                    alt="avatar"
                />
                <img v-else :src="getImagesUrl(avatarLink, 50)" alt="avatar" />
            </div>
            <span>
                <strong translate="no">
                    <template v-if="address">
                        {{ address }}
                    </template>
                    <template v-else>
                        {{ dealPid(subscriptionData.pid.toString()) }}
                    </template>
                    <i v-if="isBlack === 1 && subType === 'Permanent'" />
                </strong>
            </span>
        </div>
        <div class="key" translate="no">
            <p>{{ subscriptionData.pid.toString() }}</p>
            <i @click="copy(subscriptionData.pid.toString())" class="iconfont icon-copy" />
        </div>
        <div class="permanent" translate="no" v-if="isBlack === 1">
            <p>{{ subType }}</p>
        </div>
        <div class="expired" :class="{ mt15: isBlack === 2 }">
            <div class="left">
                <em>{{
                    isBlack === 1
                        ? $t('planetSubscription.expired')
                        : $t('planetSubscription.operation')
                }}</em>
                <strong>{{ expired(subscriptionData) }}</strong>
            </div>
            <p @click="pullBlack(subscriptionData.isblack)">
                {{
                    isBlack === 2 || subscriptionData.isblack
                        ? $t('planetSubscription.white')
                        : $t('planetSubscription.black')
                }}
            </p>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, inject, ref, onMounted } from 'vue';
import { copyText, dealPid, getExpired, getImagesUrl } from '@/utils/functions';
import { ElMessage } from 'element-plus';
import { t } from '@/i18n';
import { getIcnaming } from '@/utils/icnaming';
import { useRouter } from 'vue-router';
import { getAvatar } from '@/utils/getAvatar';
import debug from '@/utils/debug';

export default defineComponent({
    name: 'subscriptionList',
    props: {
        subscriptionData: {
            type: Object,
            default: {},
        },
        isBlack: {
            type: Number,
            default: 1,
        },
    },
    setup(props) {
        const router = useRouter();
        const isLoading = ref(false);
        const address = ref();
        const planetCanister: any = inject('planetCanister', null);
        const getSubscriptionList: any = inject('getSubscriptionList', null);
        const getBlackList: any = inject('getBlackList', null);
        const avatarLink = ref('');
        const isExpired = ref(false);
        const subType = ref();

        const copy = (id) => {
            copyText(id);
        };

        const icnaming = async () => {
            let addressRes = await getIcnaming(props.subscriptionData.pid);
            if (addressRes) {
                address.value = addressRes;
            }
        };

        const pullBlack = async (isRemoveBlack) => {
            if (isLoading.value) {
                return;
            }

            isLoading.value = true;

            const _addBlack = async () => {
                try {
                    let res = await planetCanister.value.addBlackUser(props.subscriptionData.pid);
                    if (res) {
                        ElMessage.success(t('planetSubscription.blackListSuccess'));
                        isLoading.value = false;
                        return true;
                    }
                } catch (err) {
                    debug('failed', err);
                    ElMessage.error(t('utils.noAccess'));
                    router.push('/rover/planet');
                }
            };

            const _removeBlack = async () => {
                try {
                    let res = await planetCanister.value.removeBlackUser(
                        props.subscriptionData.pid,
                    );
                    if (res) {
                        ElMessage.success(t('planetSubscription.whiteListSuccess'));
                        isLoading.value = false;
                        return true;
                    }
                } catch (err) {
                    debug('failed', err);
                    ElMessage.error(t('utils.noAccess'));
                    router.push('/rover/planet');
                }
            };

            if (props.isBlack === 2) {
                await _removeBlack();
            } else if (props.isBlack === 1 && isRemoveBlack) {
                await _removeBlack();
            } else if (props.isBlack === 1 && !isRemoveBlack) {
                await _addBlack();
            }

            if (props.isBlack === 1) {
                getSubscriptionList();
            } else {
                getBlackList();
            }
        };

        const expired = (item) => {
            let subType = '';
            if (props.isBlack === 1) {
                subType = Object.keys(item.subType)[0];
            }
            return getExpired(subType, item.expireTime);
        };

        onMounted(async () => {
            icnaming();
            try {
                let avatar = await getAvatar(props.subscriptionData.pid);
                if (avatar) {
                    avatarLink.value = avatar;
                }
            } catch (err) {
                debug('failed', err);
            }

            subType.value = Object.keys(props?.subscriptionData?.subType)[0];
            if (
                subType.value !== 'Free' &&
                subType.value !== 'Permanent' &&
                Number(props.subscriptionData.expireTime) - new Date().getTime() < 0
            ) {
                isExpired.value = true;
            }
        });

        return {
            address,
            avatarLink,
            isLoading,
            isExpired,
            subType,
            copy,
            expired,
            dealPid,
            pullBlack,
            getImagesUrl,
        };
    },
});
</script>

<style scoped lang="less">
.item {
    background: @bg-color;
    .border-radius(25);
    .padding(26, 25, 23, 25);
    flex-direction: column;
    cursor: pointer;
    border: 2px solid transparent;
    transition: @transition;
    position: relative;
    overflow: hidden;
    @apply dark:(bg-dark-600);

    .isExpired {
        @apply absolute right-3 top-3 border border-gray-300 text-gray-400 text-xs rounded-full px-2 py-2px dark:(border-dark-50 text-gray-400/60);
    }

    .isBlack {
        position: absolute;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(1px);
        left: 0;
        top: 0;
        .border-radius(25);
        display: flex;
        justify-content: flex-end;
        @apply dark:(bg-dark-800/40);

        .icon-blacklist {
            color: @text-color-grey;
            .font-size(22);
            .margin(26, 25, 0, 0);
        }
    }

    .user {
        display: flex;

        .header {
            .center();
            .width(50);
            .height(50);
            border-radius: 50%;
            overflow: hidden;

            img {
                .width(50);
            }
        }

        span {
            display: flex;
            flex: 1;
            flex-direction: column;
            .height(50);
            justify-content: center;
            .margin(0, 0, 0, 20);

            strong {
                font-style: normal;
                font-weight: 400;
                .font-size(16);
                .line-height(19);
                color: @text-color;
                display: flex;
                .height(18);
                align-items: center;
                @apply dark:(text-light-900);

                i {
                    display: flex;
                    background: url(@/assets/svg/permanent.svg) no-repeat center center;
                    background-size: 100% 100%;
                    .width(22);
                    .height(18);
                    .margin(0, 0, 0, 6);
                }
            }

            em {
                font-style: normal;
                font-weight: 400;
                .font-size(14);
                .line-height(17);
                color: @text-fcolor;
                .margin(6);
            }
        }
    }

    .key {
        display: flex;
        .margin(30);

        p {
            flex: 1;
            font-style: normal;
            font-weight: 400;
            .font-size(14);
            .line-height(17);
            color: @text-fcolor;
            .margin(0, 5, 0, 0);
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;

            @apply dark:(text-light-900/60);
        }

        .icon-copy {
            .center();
            width: 32px;
            height: 32px;
            color: @text-color-grey;
            border: 2px solid @border-color;
            .font-size(16);
            .border-radius(10);
            cursor: pointer;
            transition: @transition;
            flex-shrink: 0;
            .margin(0, 0, 0, 10);
            @apply dark:(border-dark-100);

            &:hover {
                transition: @transition;
                border-color: @bg-color-body-active;
                color: @text-active;
            }
        }
    }

    .price {
        display: flex;
        width: 100%;
        justify-content: space-between;
        .padding(16, 0, 27, 0);

        p {
            font-style: normal;
            color: @text-color;
            .font-size(32);
            .line-height(39);

            i {
                .font-size(14);
                .line-height(16);
                font-style: normal;
                font-weight: 400;
                color: @text-color-grey;
                .margin(0, 0, 0, 5);
            }

            em {
                .font-size(24);
                .line-height(29);
                font-style: normal;
            }
        }
    }

    .permanent {
        font-style: normal;
        font-weight: 700;
        .font-size(24);
        .line-height(29);
        color: @text-color;
        .center();
        .padding(25, 0, 28, 0);
        @apply dark:(text-light-900);
    }

    .permanentPrice {
        display: flex;
        flex-direction: column;
        border-top: 1px solid @border-color;
        .padding(15, 0, 0, 0);
        align-items: center;
        position: relative;
        justify-content: center;

        p {
            font-style: normal;
            font-weight: 700;
            .font-size(32);
            color: @text-color;
            @apply dark:(text-light-900/60);

            em {
                font-style: normal;
                .font-size(24);
                color: @text-color;
            }
        }

        strong {
            position: absolute;
            right: 0;
            font-weight: 500;
            .font-size(14);
            .line-height(19);
            color: @text-active;
            display: none;
        }
    }

    .expired {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: 1px solid @border-color;
        .padding(15, 0, 0, 0);
        position: relative;
        @apply dark:(border-dark-100);

        &.mt15 {
            .margin(15);
        }

        .left {
            em {
                font-style: normal;
                font-weight: 400;
                .font-size(14);
                color: @text-color;
                @apply dark:(text-light-900/80);
            }

            strong {
                font-style: normal;
                font-weight: 400;
                .font-size(14);
                color: @text-color-grey;
                display: block;
            }
        }

        p {
            font-weight: 500;
            .font-size(14);
            .line-height(19);
            color: @text-active;
            display: none;
        }
    }

    &:hover {
        transition: @transition;
        border: 2px solid @border-color;
        .border-radius(25);
        @apply dark:(border-dark-100);

        .expired {
            p {
                display: flex;
            }
        }

        .permanentPrice {
            strong {
                display: flex;
            }
        }
    }
}

@media screen and (min-width: 1040px) and (max-width: 1240px) {
    .item {
        .expired {
            p {
                display: block;
            }
        }

        .permanentPrice {
            strong {
                display: block;
            }
        }
    }
}

@media screen and (min-width: 750px) and (max-width: 1040px) {
    .item {
        .key {
            .icon-copy {
                .width(50);
                .height(50);
            }
        }

        .expired {
            p {
                display: block;
            }
        }

        .permanentPrice {
            strong {
                display: block;
            }
        }
    }
}

@media screen and (min-width: 0) and (max-width: 750px) {
    .item {
        .user {
            .header {
                .width(90);
                .height(90);

                img {
                    width: 100%;
                    border-radius: 100%;
                }
            }

            span {
                strong {
                    .margin(10, 0, 0, 0);
                    .font-size(18);
                }

                em {
                    .margin(8, 0, 0, 0);
                }
            }
        }

        .key {
            .margin(10, 0, 0, 0);

            p {
                .font-size(14);
                .line-height(16);
            }

            .icon-copy {
                .width(50);
                .height(50);
            }
        }

        .price {
            .padding(20, 0, 20, 0);
        }

        .expired {
            p {
                display: block;
            }
        }

        .permanentPrice {
            strong {
                display: block;
            }
        }
    }
}
</style>
