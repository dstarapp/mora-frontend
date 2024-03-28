<template>
    <el-dialog v-model="dialogVisible" class="invitesize" :title="$t('invite.title')" @closed="afterClose">
        <div class="invite" v-if="browserPlanetUserData">
            <div class="tab">
                <span @click="handClick(1)" :class="{ active: tab === 1 }">
                    {{ $t('invite.horizontal') }}
                </span>
                <span @click="handClick(2)" :class="{ active: tab === 2 }">
                    {{ $t('invite.vertically') }}
                </span>
            </div>

            <div class="inviteBox h" v-show="tab === 1">
                <div class="item">
                    <div id="h1" class="relative">
                        <img @load="imgLoad('h1')" class="bgImg" src="@/assets/poster/invite-h-1.png" alt="" />
                        <img :style="{ minHeight: `${h1h}px` }" src="@/assets/svg/space.svg" alt="" />
                        <div class="planetInfo h bg-1" v-show="h1Show">
                            <div class="header">
                                <div class="avatar">
                                    <img :src="getImagesUrl(browserPlanetUserData.avatar)" alt="" />
                                </div>
                                <div class="flex-1 overflow-hidden">
                                    <div class="name">
                                        <span>{{ browserPlanetUserData.name }}</span>
                                    </div>
                                    <div class="info">
                                        <span>
                                            <i>{{ Number(browserPlanetUserData.subcriber) }}</i>
                                            {{ $t('invite.subscribers') }}
                                        </span>
                                        <span>
                                            <i>{{ Number(browserPlanetUserData.article) }}</i>
                                            {{ $t('invite.articles') }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div class="conbox">
                                <p class="des">
                                    {{ browserPlanetUserData.desc }}
                                </p>
                                <div class="qrcode">
                                    <img :src="qrcodeUrl" alt="" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <button :class="{ disabled: h1DownloadLoading }" @click="download('h1')">
                        <img v-show="h1DownloadLoading" src="@/assets/svg/loading.svg" alt="" />
                        <p>{{ $t('invite.download') }}</p>
                    </button>
                </div>

                <div class="item">
                    <div id="h2" class="relative">
                        <img @load="imgLoad('h2')" class="bgImg" src="@/assets/poster/invite-h-2.png" alt="" />
                        <img :style="{ minHeight: `${h1h}px` }" src="@/assets/svg/space.svg" alt="" />
                        <div class="planetInfo h bg-2" v-show="h2Show">
                            <div class="header">
                                <div class="avatar">
                                    <img :src="getImagesUrl(browserPlanetUserData.avatar)" alt="" />
                                </div>
                                <div class="flex-1 overflow-hidden">
                                    <div class="name">
                                        <span>{{ browserPlanetUserData.name }}</span>
                                    </div>
                                    <div class="info">
                                        <span>
                                            <i>{{ Number(browserPlanetUserData.subcriber) }}</i>
                                            {{ $t('invite.subscribers') }}
                                        </span>
                                        <span>
                                            <i>{{ Number(browserPlanetUserData.article) }}</i>
                                            {{ $t('invite.articles') }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div class="conbox">
                                <p class="des">
                                    {{ browserPlanetUserData.desc }}
                                </p>
                                <div class="qrcode">
                                    <img :src="qrcodeUrl" alt="" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <button :class="{ disabled: h2DownloadLoading }" @click="download('h2')">
                        <img v-show="h2DownloadLoading" src="@/assets/svg/loading.svg" alt="" />
                        <p>{{ $t('invite.download') }}</p>
                    </button>
                </div>

                <div class="item">
                    <div id="h3" class="relative">
                        <img @load="imgLoad('h3')" class="bgImg" src="@/assets/poster/invite-h-3.png" alt="" />
                        <img :style="{ minHeight: `${h1h}px` }" src="@/assets/svg/space.svg" alt="" />
                        <div class="planetInfo h bg-3" v-show="h3Show">
                            <div class="header">
                                <div class="avatar">
                                    <img :src="getImagesUrl(browserPlanetUserData.avatar)" alt="" />
                                </div>
                                <div class="flex-1 overflow-hidden">
                                    <div class="name">
                                        <span>{{ browserPlanetUserData.name }}</span>
                                    </div>
                                    <div class="info">
                                        <span>
                                            <i>{{ Number(browserPlanetUserData.subcriber) }}</i>
                                            {{ $t('invite.subscribers') }}
                                        </span>
                                        <span>
                                            <i>{{ Number(browserPlanetUserData.article) }}</i>
                                            {{ $t('invite.articles') }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div class="conbox">
                                <p class="des">
                                    {{ browserPlanetUserData.desc }}
                                </p>
                                <div class="qrcode">
                                    <img :src="qrcodeUrl" alt="" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <button :class="{ disabled: h3DownloadLoading }" @click="download('h3')">
                        <img v-show="h3DownloadLoading" src="@/assets/svg/loading.svg" alt="" />
                        <p>{{ $t('invite.download') }}</p>
                    </button>
                </div>
            </div>

            <div class="inviteBox" v-show="tab === 2">
                <div class="item-2">
                    <div id="v1" class="relative">
                        <img @load="imgLoad('v1')" class="bgImg" src="@/assets/poster/invite-s-1.jpg" alt="" />
                        <img :style="{ minHeight: `${v1h}px` }" src="@/assets/svg/spaceH.svg" alt="" />
                        <div class="planetInfo-2 bg-1" v-show="v1Show">
                            <div class="header">
                                <div class="avatar">
                                    <img :src="getImagesUrl(browserPlanetUserData.avatar)" alt="" />
                                </div>
                                <div class="flex-1 overflow-hidden">
                                    <div class="name">
                                        <span>{{ browserPlanetUserData.name }}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="conbox">
                                <p class="des">
                                    {{ browserPlanetUserData.desc }}
                                </p>
                            </div>
                            <div class="data">
                                <span>
                                    {{ Number(browserPlanetUserData.subcriber) }}
                                    <i>{{ $t('invite.subscribers') }}</i>
                                </span>
                                <span>
                                    {{ Number(browserPlanetUserData.article) }}
                                    <i>{{ $t('invite.articles') }}</i>
                                </span>
                                <span>
                                    {{ getRuntime(Number(browserPlanetUserData.created)).day
                                    }}<em>Days</em>
                                    <i>{{ $t('invite.runtime') }}</i>
                                </span>
                            </div>
                        </div>
                        <div class="qrcode">
                            <img :src="qrcodeUrl" alt="" />
                        </div>
                    </div>

                    <button :class="{ disabled: v1DownloadLoading }" @click="download('v1')">
                        <img v-show="v1DownloadLoading" src="@/assets/svg/loading.svg" alt="" />
                        <p>{{ $t('invite.download') }}</p>
                    </button>
                </div>

                <div class="item-2">
                    <div id="v2" class="relative">
                        <img @load="imgLoad('h2')" class="bgImg" src="@/assets/poster/invite-s-2.png" alt="" />
                        <img :style="{ minHeight: `${v1h}px` }" src="@/assets/svg/spaceH.svg" alt="" />
                        <div class="planetInfo-2 bg-2" v-show="v1Show">
                            <div class="header">
                                <div class="avatar">
                                    <img :src="getImagesUrl(browserPlanetUserData.avatar)" alt="" />
                                </div>
                                <div class="flex-1 overflow-hidden">
                                    <div class="name">
                                        <span>{{ browserPlanetUserData.name }}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="conbox">
                                <p class="des">
                                    {{ browserPlanetUserData.desc }}
                                </p>
                            </div>
                            <div class="data">
                                <span>
                                    {{ Number(browserPlanetUserData.subcriber) }}
                                    <i>{{ $t('invite.subscribers') }}</i>
                                </span>
                                <span>
                                    {{ Number(browserPlanetUserData.article) }}
                                    <i>{{ $t('invite.articles') }}</i>
                                </span>
                                <span>
                                    {{ getRuntime(Number(browserPlanetUserData.created)).day
                                    }}<em>Days</em>
                                    <i>{{ $t('invite.runtime') }}</i>
                                </span>
                            </div>
                        </div>
                        <div class="qrcode">
                            <img :src="qrcodeUrl" alt="" />
                        </div>
                    </div>
                    <button :class="{ disabled: v2DownloadLoading }" @click="download('v2')">
                        <img v-show="v2DownloadLoading" src="@/assets/svg/loading.svg" alt="" />
                        <p>{{ $t('invite.download') }}</p>
                    </button>
                </div>

                <div class="item-2">
                    <div id="v3" class="relative">
                        <img @load="imgLoad('h3')" class="bgImg" src="@/assets/poster/invite-s-3.png" alt="" />
                        <img :style="{ minHeight: `${v1h}px` }" src="@/assets/svg/spaceH.svg" alt="" />
                        <div class="planetInfo-2 bg-3" v-show="v1Show">
                            <div class="header">
                                <div class="avatar">
                                    <img :src="getImagesUrl(browserPlanetUserData.avatar)" alt="" />
                                </div>
                                <div class="flex-1 overflow-hidden">
                                    <div class="name">
                                        <span>{{ browserPlanetUserData.name }}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="conbox">
                                <p class="des">
                                    {{ browserPlanetUserData.desc }}
                                </p>
                            </div>
                            <div class="data">
                                <span>
                                    {{ Number(browserPlanetUserData.subcriber) }}
                                    <i>{{ $t('invite.subscribers') }}</i>
                                </span>
                                <span>
                                    {{ Number(browserPlanetUserData.article) }}
                                    <i>{{ $t('invite.articles') }}</i>
                                </span>
                                <span>
                                    {{ getRuntime(Number(browserPlanetUserData.created)).day
                                    }}<em>Days</em>
                                    <i>{{ $t('invite.runtime') }}</i>
                                </span>
                            </div>
                        </div>
                        <div class="qrcode">
                            <img :src="qrcodeUrl" alt="" />
                        </div>
                    </div>
                    <button :class="{ disabled: v3DownloadLoading }" @click="download('v3')">
                        <img v-show="v3DownloadLoading" src="@/assets/svg/loading.svg" alt="" />
                        <p>{{ $t('invite.download') }}</p>
                    </button>
                </div>
            </div>
        </div>
    </el-dialog>
</template>

<script lang="ts">
import { defineComponent, onMounted, inject, ref, nextTick } from 'vue';
import { getImagesUrl, getRuntime } from '@/utils/functions';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';

export default defineComponent({
    components: {},
    name: 'Setting',
    setup(props, context) {
        const dialogVisible = ref(true);
        const tab = ref(1);
        const browserPlanetUserData: any = inject('browserPlanetUserData');
        const qrcodeUrl = ref('');
        const h1h = ref(0);
        const v1h = ref(0);
        const h1Show = ref(false);
        const h2Show = ref(false);
        const h3Show = ref(false);
        const v1Show = ref(false);
        const v2Show = ref(false);
        const v3Show = ref(false);
        const h1DownloadLoading = ref(false);
        const h2DownloadLoading = ref(false);
        const h3DownloadLoading = ref(false);
        const v1DownloadLoading = ref(false);
        const v2DownloadLoading = ref(false);
        const v3DownloadLoading = ref(false);

        const afterClose = () => {
            context.emit('close');
        };

        const handClick = (num: number) => {
            tab.value = num;
        };

        const imgLoad = (id) => {
            switch (id) {
                case 'h1': {
                    h1Show.value = true;
                }
                case 'h2': {
                    h2Show.value = true;
                }
                case 'h3': {
                    h3Show.value = true;
                }
                case 'v1': {
                    v1Show.value = true;
                }
                case 'v2': {
                    v2Show.value = true;
                }
                case 'v3': {
                    v3Show.value = true;
                }
            }
        };

        const download = (id) => {
            switch (id) {
                case 'h1': {
                    h1DownloadLoading.value = true;
                    break;
                }
                case 'h2': {
                    h2DownloadLoading.value = true;
                    break;
                }
                case 'h3': {
                    h3DownloadLoading.value = true;
                    break;
                }
                case 'v1': {
                    v1DownloadLoading.value = true;
                    break;
                }
                case 'v2': {
                    v2DownloadLoading.value = true;
                    break;
                }
                case 'v3': {
                    v3DownloadLoading.value = true;
                    break;
                }
            }
            nextTick(() => {
                let dom = document.getElementById(id);
                if (!dom) {
                    return;
                }
                let width = dom.offsetWidth;
                let height = dom.offsetHeight - 1;
                html2canvas(dom, {
                    backgroundColor: 'transparent',
                    useCORS: true,
                    allowTaint: true,
                    logging: false,
                    scale: window.devicePixelRatio,
                    width: width,
                    height: height,
                }).then(async (canvas) => {
                    const filename = 'share card.png';
                    canvas.toBlob((blob) => {
                        const link = document.createElement('a');
                        link.download = filename;
                        link.href = URL.createObjectURL(blob);
                        link.click();
                        h1DownloadLoading.value = false;
                        h2DownloadLoading.value = false;
                        h3DownloadLoading.value = false;
                        v1DownloadLoading.value = false;
                        v2DownloadLoading.value = false;
                        v3DownloadLoading.value = false;
                    }, 'image/png');
                });
            });
        };

        const generateCanvas = () => { };
        onMounted(async () => {
            qrcodeUrl.value = await QRCode.toDataURL(location.href);

            let dom = document.getElementById('h1');
            if (dom) {
                h1h.value = dom.offsetWidth * 0.5555;
            }
            let dom2 = document.getElementById('v1');
            if (dom2) {
                v1h.value = dom2.offsetWidth * 1.7777;
            }

            generateCanvas();
        });

        return {
            dialogVisible,
            tab,
            browserPlanetUserData,
            qrcodeUrl,
            h1h,
            v1h,
            h1Show,
            h2Show,
            h3Show,
            v1Show,
            v2Show,
            v3Show,
            h1DownloadLoading,
            h2DownloadLoading,
            h3DownloadLoading,
            v1DownloadLoading,
            v2DownloadLoading,
            v3DownloadLoading,
            imgLoad,
            download,
            getImagesUrl,
            afterClose,
            handClick,
            getRuntime,
        };
    },
});
</script>

<style scoped lang="less">
.invite {
    @apply w-full flex flex-col justify-between;

    .tab {
        @apply my-5 mx-auto flex items-center justify-center;

        span {
            @apply py-1 px-5 text-dark-50/80 border border-gray-200 transition duration-300 hover:(transition duration-300 cursor-pointer dark:(text-light-900/80)) dark:(border-dark-50 text-light-900/60);

            &.active {
                @apply text-white bg-purple-500 border-purple-500;
                background: @bg-color-body-active;
            }

            &:first-child {
                @apply rounded-tl rounded-bl border-r-transparent;
            }

            &:last-child {
                @apply rounded-tr rounded-br border-l-transparent;
            }
        }
    }

    .inviteBox {
        @apply flex-1 w-full overflow-y-auto grid grid-cols-3 gap-6 <sm:(grid-cols-1 w-96/100 mx-auto);
        max-height: calc(100vh - 300px);
        .scrollbar();

        &.h {
            @apply overflow-y-auto grid-cols-1 gap-8 px-15 <sm:(px-0);
            max-height: calc(100vh - 300px);
            .scrollbar();
        }

        .item,
        .item-2 {
            @apply w-full;
            position: relative;

            >div {
                overflow: hidden;
            }

            div {
                img {
                    @apply rounded-2xl <sm:(rounded-xl);
                    background: url('@/assets/svg/loading2.svg') no-repeat center center;
                    background-size: 25px 25px;
                }
            }

            .bgImg {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                z-index: 2;
            }

            .planetInfo {
                @apply block rounded-xl bg-white p-3 absolute left-3 right-3 bottom-3;
                z-index: 3;

                &.h {
                    @apply left-20 right-20 bottom-0 rounded-bl-none rounded-br-none p-6 <sm:(p-3 pb-2 left-5 right-5);

                    &.bg-1 {
                        background: linear-gradient(to bottom,
                                rgba(43, 50, 161, 0.4) 10%,
                                rgba(255, 255, 255, 0) 100%);
                    }

                    &.bg-2 {
                        background: linear-gradient(to bottom,
                                rgba(3, 38, 88, 1) 10%,
                                rgba(1, 3, 33, 0.42) 100%);
                    }

                    &.bg-3 {
                        background: linear-gradient(to bottom,
                                rgba(11, 10, 62, 1) 10%,
                                rgba(37, 45, 154, 0.58) 100%);
                    }

                    .header {
                        .avatar {
                            @apply w-15 h-15 <sm:(h-8 w-8);
                        }

                        .name {
                            span {
                                @apply max-w-max text-lg text-white <sm:(text-sm max-w-max);
                            }
                        }

                        .info {
                            display: flex;
                            align-items: center;

                            span {
                                display: flex;
                                align-items: center;
                                margin-right: 2px;

                                i {
                                    font-size: 14px;
                                    color: #fff;
                                    font-style: normal;
                                    margin-right: 3px;
                                }

                                @apply text-sm <sm:(text-xs);
                            }
                        }
                    }

                    .conbox {
                        @apply mt-4 <sm:(mt-1);

                        .des {
                            @apply text-sm text-light-100 <sm:(text-xs h-12 overflow-hidden);
                        }

                        .qrcode {
                            @apply ml-2;

                            img {
                                @apply w-20 h-20 <sm:(w-11 h-11);
                            }
                        }
                    }
                }

                .header {
                    @apply w-full flex items-center;

                    .avatar {
                        @apply block w-10 h-10 mr-3 rounded-full;

                        img {
                            @apply w-full h-full rounded-full;
                        }
                    }

                    .name {
                        @apply w-full flex;
                        text-align: left;

                        span {
                            @apply text-sm font-medium flex-1 max-w-26 truncate;
                        }
                    }

                    .info {
                        @apply text-left max-w-full block truncate;

                        span {
                            @apply text-gray-400;
                            font-size: 12px;
                            line-height: 12px;
                            padding: 3px 0;
                            display: flex;
                            align-items: center;

                            &:first-child {
                                @apply pr-2;
                            }

                            i {
                                color: #000;
                                font-style: normal;
                                position: relative;
                                top: -1px;
                                margin-right: 3px;
                            }
                        }
                    }
                }

                .conbox {
                    @apply w-full flex justify-between mt-2;

                    .des {
                        @apply text-left flex-1 text-xs text-gray-800 overflow-hidden overflow-ellipsis;
                        -webkit-line-clamp: 4;
                        display: -webkit-box;
                        -webkit-box-orient: vertical;
                    }

                    .qrcode {
                        @apply ml-1;

                        img {
                            @apply w-15 h-15 rounded-none;
                        }
                    }
                }
            }

            button {
                @apply w-full rounded-xl py-3 text-sm text-center border border-purple-500 text-purple-500 mt-5 transition duration-300 hover:(transition duration-300 bg-purple-500 border-purple-500 text-white) <sm:(py-2);
                .center();

                img {
                    width: 15px;
                    height: 15px;
                    margin-right: 5px;
                }

                &.disabled {
                    @apply transition duration-300 bg-purple-500 border-purple-500 text-white;
                    cursor: not-allowed;
                    opacity: 0.3;
                }
            }
        }

        .item-2 {
            .planetInfo-2 {
                @apply block rounded-xl p-3 absolute left-4 right-4 top-1/2 transform -translate-y-1/2 z-3;

                &.bg-1 {
                    background: linear-gradient(to bottom,
                            rgba(13, 122, 169, 0.79) 10%,
                            rgba(78, 49, 151, 0.81) 100%);
                }

                &.bg-2 {
                    background: linear-gradient(to bottom,
                            rgba(5, 86, 57, 0.92) 10%,
                            rgba(0, 103, 91, 0.3) 100%);
                }

                &.bg-3 {
                    background: linear-gradient(to bottom,
                            rgba(5, 15, 176, 0.78) 10%,
                            rgba(105, 85, 231, 0.96) 100%);
                }

                .header {
                    @apply flex items-center;

                    .avatar {
                        @apply w-9 h-9 <sm:(h-8 w-8);

                        img {
                            @apply w-full h-full rounded-full;
                        }
                    }

                    .name {
                        @apply pl-3 text-left;

                        span {
                            @apply max-w-max text-sm text-white <sm:(text-sm max-w-max);
                        }
                    }
                }

                .conbox {
                    @apply w-full flex items-center my-2 h-35 overflow-hidden;

                    .des {
                        @apply w-full h-auto text-center px-1 text-xs text-white;
                    }
                }

                .data {
                    @apply w-full border-t border-light-500/10 pt-2 flex justify-between;

                    span {
                        @apply text-white text-base text-left font-medium;

                        em {
                            @apply text-xs not-italic ml-2px;
                            zoom: 0.8;
                        }

                        i {
                            @apply block text-light-50/50 text-xs not-italic font-normal;
                        }
                    }
                }
            }

            .qrcode {
                @apply absolute right-4 bottom-4 z-4;

                img {
                    @apply w-14 h-14 rounded;
                }
            }
        }
    }
}

@media screen and (min-width: 0) and (max-width: 750px) {
    .invite {
        .inviteBox {
            .item {
                .planetInfo {
                    padding: 3px 8px !important;

                    .header {
                        .name {
                            position: relative;
                            top: 0px;

                            span {
                                font-size: 12px !important;
                                line-height: 24px !important;
                            }
                        }

                        .info {
                            position: relative;
                            top: -4px;

                            span {
                                padding: 0;
                                font-size: 12px !important;
                                line-height: 24px !important;
                            }
                        }
                    }

                    .conbox {
                        .des {
                            font-size: 12px;
                        }
                    }
                }
            }
        }
    }
}
</style>
