<template>
    <div class="claimBox">
        <div class="left" :class="{ hidden: isEditor }">
            <div class="prev" @click="goBack">
                <Back />
            </div>
            <transition name="el-zoom-in-top">
                <canvas v-show="isScene" ref="scene" class="planetCanvas"></canvas>
            </transition>
            <transition name="el-zoom-in-bottom">
                <p v-show="isLoadingText" class="loadingText">
                    {{ $t('roverClaim.loadingText') }}
                </p>
            </transition>
            <div class="bottombg"></div>
        </div>

        <transition name="el-zoom-in-center">
            <div v-if="isEditor" class="right">
                <div class="avatarBox">
                    <Avatar ref="avatarDom" :src="avatarUrl" type="claim" />
                </div>
                <div class="avatarName"> {{ $t('roverClaim.from.avatar') }} <i>*</i> </div>
                <div class="item">
                    <p>{{ $t('roverClaim.from.name') }}</p>
                    <el-input show-word-limit v-model="fromData.name" maxlength="20"
                        :placeholder="$t('roverClaim.from.namePlaceholder')" :class="{ active: formState.name }"
                        @focus="formState.name = true" @blur="formState.name = false" />
                </div>
                <div class="item">
                    <p>{{ $t('roverClaim.from.profile') }}</p>
                    <el-input v-model="fromData.profile" max-length="20" type="textarea" resize="none" show-word-limit
                        maxlength="160" :placeholder="$t('roverClaim.from.profilePlaceholder')"
                        :class="{ active: formState.profile }" @focus="formState.profile = true"
                        @blur="formState.profile = false" />
                </div>
                <div class="item">
                    <p>
                        {{ $t('roverClaim.from.invite') }}
                    <div class="getcode" @click="showShareTwitter">
                        How to get<i class="iconfont icon-arrow-right"></i>
                    </div>
                    </p>
                    <el-input v-model="fromData.invitecode" maxlength="100"
                        :placeholder="$t('roverClaim.from.invitePlaceholder') + '，' + $t('roverClaim.available') + invitecodeNum"
                        :class="{ active: formState.invitecode }" @focus="formState.invitecode = true"
                        @blur="formState.invitecode = false" />
                </div>
                <p class="tip" @click="agree" :class="{ active: isAgree }">
                    <i class="iconfont icon-chose"></i>
                    {{ $t('roverClaim.tips') }}
                    <span @click.stop="showAffirm">{{ $t('roverClaim.disclaimer.title') }}</span>
                </p>
                <div class="mora-button" @click="claim">
                    <div :class="{
            disable:
                isLoading ||
                !isAgree ||
                !fromData.name ||
                !fromData.profile ||
                !fromData.invitecode ||
                !avatarDom.getAvatar(),
        }">
                        <img src="@/assets/svg/loading.svg" v-if="isLoading" />
                        {{ $t('roverClaim.claimBtn') }}
                    </div>
                </div>
            </div>
        </transition>
        <Disclaimer v-if="isShowAffirm" @close="showAffirm" />
        <GetInviteCode v-if="isShowShare" @close="showShareTwitter" @setInvitationCode="setInvitationCode" />
    </div>
</template>

<script lang="ts">
import { useRouter } from 'vue-router';
import { defineComponent, onMounted, nextTick, ref, inject, shallowRef, provide } from 'vue';
import myCanvas from './components/canvas';
import Avatar from '@/components/Avatar.vue';
import { Back, Right, InfoFilled } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { t } from '@/i18n';
import debug from '@/utils/debug';
import store from '@/store';
import Disclaimer from './components/Disclaimer.vue';
import { createActor } from '@/request/agent';
import { idlFactory as invitationCodeFactory } from '@/request/canister/invitationCode.did';
import CONFIG from '@/assets/config';
import GetInviteCode from './components/GetInviteCode.vue';

export default defineComponent({
    name: 'Claim',
    components: {
        Back,
        Right,
        InfoFilled,
        Avatar,
        Disclaimer,
        GetInviteCode
    },
    setup() {
        const router = useRouter();
        const scene = ref();
        const isScene = ref(true);
        const isLoadingText = ref(false);
        const isEditor = ref(true);
        const avatarUrl = ref();
        const isLoading = ref(false);
        const invitationCodeCanister = ref();
        const invitecodeNum = ref(0);
        const avatarDom = shallowRef();
        const fromData = ref({
            name: '',
            profile: '',
            invitecode: '',
        });
        const formState = ref({
            name: false,
            profile: false,
            invitecode: false,
        });
        const isAgree = ref(false);
        const usersCanister: any = inject('usersCanister', null);

        const agree = () => {
            isAgree.value = !isAgree.value;
        };

        const goBack = () => {
            router.go(-1);
        };

        const isShowAffirm = ref(false);
        const showAffirm = () => {
            isShowAffirm.value = !isShowAffirm.value;
        };

        const claim = async () => {
            isLoading.value = true;
            const { name, profile, invitecode } = fromData.value;
            if (!name) {
                ElMessage.error(t('roverClaim.from.namePlaceholder'));
                isLoading.value = false;
                return false;
            }
            if (!profile) {
                ElMessage.error(t('roverClaim.from.profilePlaceholder'));
                isLoading.value = false;
                return false;
            }
            const avatarHEX = avatarDom.value.getAvatar();
            if (!avatarHEX) {
                ElMessage.error(t('roverClaim.from.avatarError'));
                isLoading.value = false;
                return false;
            }
            if (!invitecode) {
                ElMessage.error(t('roverClaim.from.invitePlaceholder'));
                isLoading.value = false;
                return false;
            }

            isEditor.value = false;
            setTimeout(() => {
                isLoadingText.value = true;
            }, 1000);

            try {
                const res = await usersCanister.value.create_planet({
                    code: invitecode,
                    desc: profile,
                    name: name,
                    avatar: avatarHEX,
                });
                debug('create', res);
                if (JSON.stringify(res) === '[]') {
                    ElMessage.warning(t('roverClaim.claimNullTxt'));
                    router.push({
                        name: 'rover',
                    });
                } else if (res.Err && ~res.Err.indexOf('invite code is invalid')) {
                    ElMessage.error(t('roverClaim.inviteCodeError'));
                    router.push({
                        name: 'rover',
                    });
                } else {
                    ElMessage({
                        message: t('roverClaim.claimSuccessTxt'),
                        type: 'success',
                    });
                    setTimeout(() => {
                        router.push({
                            name: 'rover',
                        });
                    }, 1000);
                }
            } catch (err) {
                debug('failed', err);
                ElMessage.error(t('roverClaim.claimErrorTxt'));
                router.push({
                    name: 'rover',
                });
            }
        };

        const getInvitationCode = async () => {
            try {
                const res = await invitationCodeCanister.value.query_codelist();
                invitecodeNum.value = res.length;
                if (res.length) {
                    fromData.value.invitecode = res[0].code;
                }
            } catch (err) {
                debug('failed', err);
            }
        };

        const init = async () => {
            invitationCodeCanister.value = await createActor(
                CONFIG.invitationCodeCanister,
                invitationCodeFactory,
                store.state.agent,
            );
            getInvitationCode();
        };

        const setInvitationCode = (str) => {
            fromData.value.invitecode = str;
            isShowShare.value = false
        }

        onMounted(() => {
            init();
            nextTick(() => {
                myCanvas(scene.value);
            });
        });

        const isShowShare = ref(false);
        const showShareTwitter = () => {
            isShowShare.value = !isShowShare.value;
        }

        return {
            scene,
            isScene,
            isLoadingText,
            isEditor,
            avatarUrl,
            fromData,
            isLoading,
            avatarDom,
            formState,
            isAgree,
            invitecodeNum,
            isShowAffirm,
            isShowShare,
            setInvitationCode,
            goBack,
            claim,
            agree,
            showAffirm,
            showShareTwitter
        };
    },
});
</script>

<style scoped lang="less">
.claimBox {
    .center();
    width: 100%;
    position: relative;

    .prev {
        .center();
        .border-radius(15);
        background: @text-color-inverse;
        .width(50);
        .height(50);
        position: absolute;
        .top(20);
        .left(20);
        color: @text-color-grey;
        transition: @transition;
        cursor: pointer;

        svg {
            .width(25);
        }

        &:hover {
            background: @text-color;
            color: @text-color-inverse;
            transition: @transition;
        }

        @media screen and (min-width: 0) and (max-width: 750px) {
            &:hover {
                background: @text-color-inverse;
                color: @text-color-grey;
                transition: @transition;
            }
        }

        @media screen and (min-width: 750px) and (max-width: 1240px) {
            .border-radius(10);

            &:hover {
                background: @text-color-inverse;
                color: @text-color-grey;
                transition: @transition;
            }
        }
    }

    .left {
        .center();
        height: 100%;
        background: linear-gradient(180deg,
                #4550b9 0.32%,
                #cd8eba 39.73%,
                #ffbcac 69.74%,
                #937ed8 100%);
        .border-radius(30);
        position: relative;
        flex-direction: column;
        flex: 1;

        .separate {
            display: flex;
            flex-direction: column;
            position: relative;
            cursor: pointer;

            img {
                .width(300);
                .height(300);
                .border-radius(30);
            }

            i {
                position: absolute;
                .width(300);
                .height(68);
                left: 0;
                .bottom(-68);
                .border-radius(30);
                background: linear-gradient(180deg,
                        rgba(255, 255, 255, 0) 58.27%,
                        rgba(255, 255, 255, 0.25) 100%);
                transform: matrix(1, 0, 0, -1, 0, 0);
            }

            span {
                display: none;
                .width(300);
                .height(300);
                position: absolute;
                left: 0;
                top: 0;
                background: rgba(255, 255, 255, 0.7);
                .border-radius(30);

                em {
                    position: absolute;
                    .right(11);
                    .top(11);
                    .border-radius(10);
                    font-style: normal;
                    font-weight: 700;
                    .font-size(14);
                    text-align: center;
                    color: @text-color;
                    .padding(4, 7, 4, 7);
                    background: @text-color-inverse;

                    @media screen and (min-width: 750px) and (max-width: 1240px) {
                        .right(15);
                        .top(15);
                    }
                }
            }

            &.disable {
                span {
                    display: flex;
                    cursor: not-allowed;
                }
            }
        }

        .swiperBox {
            width: 70%;
            max-width: 900px;
            margin: 0 auto;

            .swiper {
                width: 100%;
            }

            &.disable {
                span {
                    display: flex;
                    cursor: not-allowed;
                }
            }

            :deep(.swiper-wrapper) {
                align-items: center;
            }

            div,
            :deep(.swiper-slide-active) {
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;

                i {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    padding: 2px 5px;
                    border-radius: 8px;
                    background-color: #ffffff;
                    color: #000;
                    font-style: normal;
                    font-size: 14px;
                    z-index: 99;
                }
            }

            div {
                img {
                    width: 70%;
                    max-width: 220px;
                    display: block;
                    .border-radius(25);
                    transition: all 0.5s;
                    -webkit-transition: all 0.5s;
                }
            }

            :deep(.swiper-slide) {
                position: relative;
                .border-radius(25);
                overflow: hidden;

                img {
                    margin: auto;
                }

                &::after {
                    content: '';
                    left: 0;
                    top: 0;
                    width: 220px;
                    height: 100%;
                    z-index: 11;
                    position: absolute;
                }
            }

            :deep(.swiper-slide-active) {
                position: relative;
                height: 300px;
                overflow: visible;
                display: flex;
                align-items: center;

                div {
                    img {
                        width: 100%;
                        max-width: 300px;
                        transform-origin: center !important;
                        -webkit-transform-origin: center !important;
                        position: absolute;
                        left: 0;
                        box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.3);
                    }
                }

                z-index: 111;

                &::after {
                    display: none;
                }
            }

            :deep(.swiper-button-prev) {
                width: 32px;
                height: 32px;
                background: url(@/assets/svg/planet-arrow-left.svg);
                left: 0;

                &::after {
                    content: '';
                }
            }

            :deep(.swiper-button-next) {
                width: 32px;
                height: 32px;
                background: url(@/assets/svg/planet-arrow-right.svg);
                right: 0;

                &::after {
                    content: '';
                }
            }

            @media screen and (min-width: 0) and (max-width: 750px) {
                .left {
                    display: none;
                }

                width: 92%;

                .swiper {
                    width: 100%;
                    padding: 0;
                }

                img {
                    width: 70%;
                    max-width: 80px;
                }

                :deep(.swiper-slide) {
                    img {
                        width: 80px;
                    }
                }

                :deep(.swiper-slide-active) {
                    width: 100px !important;
                    height: 120px !important;

                    img {
                        width: 100%;
                    }
                }

                :deep(.swiper-button-prev),
                :deep(.swiper-button-next) {
                    display: none;
                }
            }

            @media screen and (min-width: 751px) and (max-width: 1024px) {
                width: 90%;
                padding-top: 150px;

                .swiper {
                    width: 100%;
                    padding: 0 28px;
                }
            }
        }

        .planetCanvas {
            .width(300);
            .height(300);
        }

        .tip {
            font-style: normal;
            font-weight: 400;
            .font-size(20);
            .line-height(26);
            text-align: center;
            color: @text-color-inverse;
            .margin(52, 0, 0, 0);
            width: 56%;
            position: relative;
            z-index: 2;

            em {
                font-style: normal;
                .padding(2, 6, 2, 6);
                color: @text-color;
                background: @text-color-inverse;
                .border-radius(8);
            }

            @media screen and (min-width: 0) and (max-width: 750px) {
                width: 90%;
                .font-size(16);
            }

            @media screen and (min-width: 751px) and (max-width: 1240px) {
                width: 75%;
                .margin(10, 0, 0, 0);
            }
        }

        .now {
            .center();
            font-style: normal;
            font-weight: 400;
            .font-size(20);
            .line-height(26);
            text-align: center;
            color: @text-color;
            .margin(45, 0, 0, 0);
            cursor: pointer;
            position: relative;
            z-index: 2;

            @media screen and (min-width: 0) and (max-width: 750px) {
                .margin(25, 0, 0, 0);
            }

            svg {
                .width(25);
                .margin(0, 0, 0, 10);
            }
        }

        .loadingText {
            .margin(44, 0, 0, 0);
            font-style: normal;
            font-weight: 700;
            .font-size(26);
            color: @text-color-inverse;

            @media screen and (min-width: 0) and (max-width: 750px) {
                width: 90%;
                .font-size(16);
                text-align: center;
                .margin(20, 0, 0, 0);
            }
        }

        .bottombg {
            position: absolute;
            width: calc(100% - 10px);
            .height(197);
            display: flex;
            border-radius: 30px;
            background: url(@/assets/svg/bottombg.svg) no-repeat center bottom;
            background-size: 100% auto;
            bottom: 5px;
            left: 5px;

            @media screen and (min-width: 0) and (max-width: 750px) {
                display: none;
            }
        }
    }

    .right {
        display: flex;
        align-items: center;
        flex: 1;
        .margin(0, 0, 0, 100);
        flex-direction: column;

        .avatarBox {
            .center();
            border: 1px solid @border-color;
            border-radius: 50%;
            position: relative;
            cursor: pointer;
            .height(100);
            .width(100);
            flex-shrink: 0;
            overflow: hidden;
            @apply dark:(border-dark-100);
        }

        .avatarName {
            font-style: normal;
            font-weight: 400;
            .font-size(16);
            text-align: center;
            color: @text-color;
            .margin(13, 0, 0, 0);
            .center();
            @apply dark:(text-light-900/80);

            i {
                font-style: normal;
                color: red;
                padding-left: 5px;
                height: 10px;
            }
        }

        .item {
            display: flex;
            width: 100%;
            flex-direction: column;
            .margin(33, 0, 0, 0);
            position: relative;

            p {
                font-style: normal;
                font-weight: 400;
                .font-size(16);
                color: @text-color;
                @apply dark:(text-light-900/80);
                position: relative;

                &::after {
                    content: '*';
                    font-style: normal;
                    .font-size(16);
                    color: @color-error;
                    .margin(0, 0, 0, 10);
                }

                .getcode {
                    @apply absolute right-0 top-0 flex items-center text-purple-500 text-sm font-medium transition duration-300 hover:(transition duration-300 text-purple-400 cursor-pointer);

                    i {
                        @apply text-xs ml-1;
                    }
                }

            }

            .el-input {
                background: @bg-color-grey;
                border: 2px solid @bg-color-grey;
                .height(45);
                .margin(14, 0, 0, 0);
                @apply dark:(bg-dark-300 border-dark-100);

                &.active {
                    background-color: @bg-color;
                    border: 2px solid @text-active;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    transition: @transition;
                    @apply dark:(bg-dark-400 border-purple-500);
                }
            }

            .el-textarea {
                border: 2px solid @bg-color-grey;
                @apply dark:(bg-dark-300 border-dark-100);

                &.active {
                    background-color: @bg-color;
                    border: 2px solid @text-active;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    transition: @transition;
                    @apply dark:(bg-dark-400 border-purple-500);
                }
            }

            span {
                display: flex;
                .margin(14, 0, 0, 0);
                position: relative;

                .el-input {
                    .width(210);
                    margin-top: 0;
                }

                em {
                    font-style: normal;
                    font-weight: 400;
                    .font-size(16);
                    color: @text-active;
                    height: 100%;
                    .center();
                    .height(45);
                    .margin(0, 0, 0, 10);
                    position: relative;

                    i {
                        background: url('@/assets/svg/seal.svg') no-repeat center center;
                        background-size: 100% 100%;
                        position: absolute;
                        .top(-15);
                        .right(-115);
                        .width(76);
                        .height(76);
                    }

                    @media screen and (min-width: 0) and (max-width: 750px) {
                        .height(90);
                    }

                    @media screen and (min-width: 750px) and (max-width: 1240px) {
                        .height(60);
                    }
                }
            }

            :deep(.el-textarea) {
                .font-size(14);
                .margin(12, 0, 0, 0);
                background: @bg-color-grey;
                .height(120);
            }

            @media screen and (min-width: 0) and (max-width: 750px) {
                .el-input {
                    .height(90);
                    .margin(20, 0, 0, 0);
                }
            }

            @media screen and (min-width: 750px) and (max-width: 1240px) {
                .el-input {
                    .height(60);
                }
            }
        }

        .tip {
            display: flex;
            .margin(30, 0, 0, 0);
            .font-size(14);
            .line-height(18);
            color: @text-color-grey;
            cursor: pointer;
            width: 100%;

            &.active {
                i {
                    color: @text-active;
                    opacity: 1;
                }
            }

            i {
                margin-right: 10px;
                color: @text-color-grey;
                opacity: 0.5;
            }

            span {
                color: #3b82f6;
                padding-left: 6px;
                font-weight: 500;

                &:hover {
                    text-decoration: underline;
                    text-underline-offset: 2px;
                }
            }
        }

        .mora-button {
            display: flex;
            width: 100%;
            .margin(50, 0, 12, 0);
            .padding(0, 0, 0, 0);

            div {
                .border-radius(10);
                .center();
                .height(60);
                min-height: 45px;
                flex: 1;
                font-style: normal;
                font-weight: 350;
                .font-size(16);
                .line-height(19);
                cursor: pointer;
                transition: @transition;
                background: @bg-color-body-active;
                color: @text-color-inverse;
                flex-shrink: 0;

                &.disable {
                    background: @bg-color-body-disable;
                    color: @bg-color;
                    cursor: not-allowed;
                }

                &.loading {
                    transition: @transition;
                    background: @bg-color-body-loading;
                }

                img {
                    .margin(0, 5, 0, 0);
                }

                @media screen and (min-width: 0) and (max-width: 750px) {
                    .height(90);
                }
            }
        }
    }

    @media screen and (min-width: 751px) and (max-width: 1240px) {
        .left {
            max-height: 600px;
        }
    }

    @media screen and (min-width: 0) and (max-width: 750px) {
        flex-direction: column;

        .hidden {
            display: none;
        }

        .left {
            flex: auto;
            .margin(0, 0, 30, 0);
            .padding(70, 0, 50, 0);
            min-height: calc(100vh - 100px);
            width: 100%;

            // &.isEditor {
            //   width: 100%;
            //   // display: none
            // }
        }

        .right {
            .margin(0, 0, 0, 0);
            width: 100%;
            overflow-y: initial;

            .goback {
                .height(50);
                max-width: 100%;
                color: @text-color-grey;
                transition: @transition;
                cursor: pointer;
                width: 100%;
                position: relative;

                svg {
                    .width(45);
                    position: absolute;
                    left: 0 !important;
                    top: 0 !important;
                }
            }
        }
    }
}
</style>
