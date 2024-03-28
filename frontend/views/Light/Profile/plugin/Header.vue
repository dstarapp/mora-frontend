<template>
    <div class="header">
        <div class="left">
            <div class="auto-save" v-if="route.name === 'lightProfileEdit'">
                <div class="autosaved">
                    <el-progress v-if="store.state.light_save_timeout !== null" type="circle" :percentage="(store.state.light_save_timeout / CONFIG.autosavedInterval) * 100
                " :stroke-width="3" :width="18" color="#35D49A" :show-text="false" />
                    <i v-else class="iconfont icon-passed"></i>
                    <p v-if="store.state.light_save_timeout === null">
                        {{ $t('plugin.nav.saveing') }}
                    </p>
                    <p v-else> {{ $t('plugin.nav.autoSave') }}</p>
                </div>
            </div>
        </div>
        <div class="header-box">
            <transition name="el-fade-in">
                <div v-show="!isTool">
                    <el-skeleton animated v-if="!store.state.user_data && store.state.agent">
                        <template #template>
                            <div class="">
                                <div class="user" @click="showMenu">
                                    <el-skeleton-item variant="image"
                                        class="w-full w-8 h-8 rounded-lg mr-3 <sm:(w-8 h-8) 2xl:(w-11 h-11 rounded-xl)" />
                                    <el-skeleton-item variant="text" style="width: 80px" />
                                </div>
                            </div>
                        </template>
                    </el-skeleton>
                    <div class="user" v-if="store.state.user_data" ref="rootPoint" @click="showMenu">
                        <div class="flex items-center">
                            <div class="avatar">
                                <img v-if="store.state.user_data && store.state.user_data.avatar"
                                    :src="getImagesUrl(store.state.user_data.avatar)" />
                                <img v-else src="@/assets/svg/defaultAvatar.svg" alt="avatar" />
                            </div>
                        </div>
                    </div>
                </div>
            </transition>
            <transition name="el-fade-in">
                <div v-show="isTool" class="toolBtn">
                    <div v-if="route.name === 'lightProfileAudit'" class="passed" @click="bus.emit('plugin-pass')">
                        <i class="iconfont icon-passed"></i>
                        {{ $t('plugin.tool.pass') }}
                    </div>
                    <div v-if="route.name === 'lightProfileAudit'" class="reject" @click="bus.emit('plugin-reject')">
                        <i class="iconfont icon-reject"></i>
                        {{ $t('plugin.tool.reject') }}
                    </div>
                    <div v-if="route.name === 'lightProfileAudit'" class="preview" @click="bus.emit('plugin-back')">
                        <i class="iconfont icon-editor-back"></i>
                        {{ $t('plugin.tool.back') }}
                    </div>

                    <div class="preview" @click="bus.emit('plugin-basic-info')">
                        <i class="iconfont icon-plugin-edit"></i>
                        {{ $t('plugin.tool.basicInfo') }}
                    </div>
                    <div class="preview" @click="bus.emit('plugin-preview')">
                        <i class="iconfont icon-plugin-preview"></i>
                        {{ $t('plugin.tool.preview') }}
                    </div>
                    <div v-if="route.name === 'lightProfileEdit'" class="submitPlugin"
                        @click="bus.emit('plugin-submit')">
                        <i class="iconfont icon-plugin-submit"></i>
                        {{ $t('plugin.tool.submit') }}
                    </div>
                    <div v-if="route.name === 'lightProfileEdit'" class="saveDraft" @click="bus.emit('plugin-save')">
                        <i class="iconfont icon-plugin-draft"></i>
                        {{ $t('plugin.tool.save') }}
                    </div>
                </div>
            </transition>
            <div class="mode" @click="selectMode">
                <i class="iconfont" :class="store.state.theme == 'dark' ? 'icon-light' : 'icon-dark'"></i>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import store from '@/store';
import { getImagesUrl, isMobile } from '@/utils/functions';
import { getIcnaming } from '@/utils/icnaming';
import bus from 'vue3-eventbus';
import CONFIG from '@/assets/config';

const route = useRoute();
const router = useRouter();
const userData: any = ref({});
const address = ref();
const isShowMenu = ref(false);
const rootPoint = ref();
const isTool = ref(false);

const selectMode = () => {
    store.dispatch('SWITCH_THEME');
};

const handleClick = (e: { target: any }) => {
    if (!rootPoint?.value?.contains(e.target)) {
        isShowMenu.value = false;
    }
};

const init = async () => {
    if (userData.value.pid) {
        let addressRes = await getIcnaming(userData.value.pid);
        if (addressRes) {
            address.value = addressRes;
        }
    }
};

const headerSwitch = () => {
    isTool.value = true;
};
const headerSwitchClose = () => {
    isTool.value = false;
};

const onScroll = () => {
    if (!isMobile()) {
        isShowMenu.value = false;
    }
};

watch(
    () => store.state.user_data,
    (val: any) => {
        if (val && !address.value) {
            address.value = '';
            userData.value = val;
            init();
        }
    },
);

watch(
    () => route.name,
    (val: any) => {
        isTool.value = false;
    },
);

const showMenu = () => {
    if (isMobile() && !isShowMenu.value) {
        document.getElementsByTagName('body')[0].style.overflow = 'hidden';
    } else {
        document.getElementsByTagName('body')[0].style.overflow = 'inherit';
    }
    isShowMenu.value = !isShowMenu.value;
};

onUnmounted(() => {
    document.removeEventListener('click', handleClick, false);
    window.removeEventListener('scroll', onScroll);
    bus.off('plugin-header-switch', headerSwitch);
    bus.off('plugin-header-switch-close', headerSwitchClose);
});

onMounted(() => {
    document.addEventListener('click', handleClick, false);
    window.addEventListener('scroll', onScroll);
    bus.on('plugin-header-switch', headerSwitch);
    bus.on('plugin-header-switch-close', headerSwitchClose);

    let data: any = store.state.user_data;
    if (data) {
        userData.value = data;
        init();
    }
});
</script>

<style lang="less" scoped>
.header {
    margin: 10px 0;
    display: flex;

    .left {
        display: flex;
        flex: 1;

        .historyPlugin {
            .center();
            padding: 0 11px;
            height: 33px;
            border: 1px solid #4c4f6b;
            border-radius: 8px;
            font-size: 14px;
            cursor: pointer;

            i {
                font-size: 16px;
                margin-right: 6px;
            }
        }

        .autosaved {
            display: flex;
            align-items: center;
            margin-right: 55px;
            opacity: 1;
            transition: @transition;

            &.show {
                opacity: 0;
                transition: @transition;
            }

            :deep(.el-progress) {
                width: 18px;
                height: 18px;
                display: flex;
                justify-content: center;
                align-items: center;

                .el-progress-circle__track {
                    stroke: rgba(176, 176, 176, 0.4);
                }
            }

            .icon-passed {
                font-size: 18px;
                color: #34d399;
                width: 25px;
                height: 25px;
                display: flex;
                justify-content: center;
                align-items: center;
            }

            .icon-attention {
                color: #999999;
            }

            p {
                line-height: 32px;
                font-style: normal;
                font-weight: 400;
                font-size: 14px;
                color: #666666;
                margin-left: 8px;
                @apply dark:(text-light-900/80);
            }
        }
    }

    .header-box {
        display: flex;

        :deep(.el-skeleton) {
            display: block;
            width: auto;
            @apply h-8;
        }

        .toolBtn {
            display: flex;

            .preview,
            .submitPlugin,
            .saveDraft,
            .passed,
            .reject {
                .center();
                padding: 0 11px;
                height: 33px;
                border-radius: 8px;
                font-size: 14px;
                cursor: pointer;
                margin-left: 13px;
                font-weight: 400;
                font-size: 14px;
                color: #000000;
                @apply border border-dark-600 transition duration-300 hover:(transition duration-300 bg-dark-700 text-white dark:(bg-light-900/20 text-white)) dark:(border-light-900/50 text-light-900);

                i {
                    font-size: 16px;
                    margin-right: 6px;
                }

                &:hover {}
            }

            .passed {
                border-color: #35d49a;
                color: #35d49a;

                i {
                    color: #35d49a;
                }
            }

            .reject {
                border-color: #f96161;
                color: #f96161;

                i {
                    color: #f96161;
                }
            }
        }

        .user {
            @apply w-auto flex items-center relative h-8;

            .avatar {
                @apply overflow-hidden w-8 h-8 rounded-lg;

                img {
                    @apply w-full object-fill rounded-lg;
                }
            }

            .name {
                @apply max-w-25 ml-2 truncate <lg:(hidden) dark:(text-light-900/80);
            }

            i {
                @apply text-gray-500 ml-1 dark:(text-gray-300);
            }

            .userMenu {
                @apply absolute hidden z-50 <sm:(top-12 w-screen fixed right-0 max-h-[calc(100vh-3rem)] overflow-y-auto) sm: (top-12) md:(w-80 top-12 -right-13) lg:(top-12 -right-13) xl:(top-14) 2xl:(-right-15);

                &.show {
                    @apply block;
                }
            }

            &:hover {
                @apply cursor-pointer;
            }
        }

        .mode {
            @apply text-center overflow-hidden transition duration-300 text-dark-600 border border-dark-600 dark:(text-white border-light-900/50) hover:(text-white bg-dark-700 transition duration-300 cursor-pointer dark:(bg-light-900/20 text-white)) w-8 h-8 leading-8 rounded-lg text-sm px-6px;
            margin-left: 13px;
            .center();

            .icon-dark,
            .icon-light {
                @apply text-lg;
            }

            .icon-dark {
                @apply ml-1;
            }
        }
    }
}
</style>
