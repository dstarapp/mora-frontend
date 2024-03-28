<template>
    <el-dialog class="noHeader login" :class="{ 'astrox-me-login-directly': isAstroxMe }" v-model="dialogVisible"
        :close-on-click-modal="isCloseBtn" :close-on-press-escape="isCloseBtn" :show-close="isCloseBtn"
        :before-close="handleClose" @closed="afterClose">
        <div class="Login">
            <div class="login-header">
                {{ $t('login.title') }}
                <span>{{ $t('login.txt') }}</span>
            </div>
            <div class="loginbox" v-loading="store.state.identity.loading" v-if="!isShowSetPwd">
                <Transition name="el-zoom-in-top">
                    <div class="emailBox" v-if="isShowEmail">
                        <i class="iconfont icon-back-left" @click="showEmail"></i>
                        <div class="title">Continue with email</div>
                        <input type="text" v-model="email" placeholder="input your email" />
                        <button :class="{ disabled: !validateEmail(email) }" @click="
        showWeb3Auth('web3auth', {
            loginProvider: 'email_passwordless',
            extraLoginOptions: {
                login_hint: email,
            },
        })
        ">
                            Continue
                        </button>
                        <div class="web3">
                            <img src="@/assets/svg/logo-web3auth.svg" />
                            <span>{{ $t('login.list.web3auth') }}</span>
                        </div>
                    </div>
                </Transition>
                <div class="chainLogin">
                    <div class="item ic" @click="openLogin('ii')">
                        <img src="@/assets/svg/logo-ic.svg" />
                        <span>{{ $t('login.list.ii') }}</span>
                        <i v-if="lastLogin === 'ii'" class="used">{{ $t('login.used') }}</i>
                    </div>
                    <div class="item" @click="handleClick">
                        <img src="@/assets/svg/logo-metamask.svg" />
                        <span>{{ $t('login.list.MetaMask') }}</span>
                        <i v-if="lastLogin === 'metamask'" class="used">{{ $t('login.used') }}</i>
                    </div>
                    <!--  disabled -->
                    <div class="item" @click="openLogin('astrox')">
                        <img :src="logoMe" class="w-13" />
                        <span>{{ $t('login.list.astrox') }}</span>
                        <i v-if="lastLogin === 'astrox' || lastLogin === 'icx'" class="used">{{
        $t('login.used')
    }}</i>
                        <div class="recommond"><i class="iconfont icon-thumbsup"></i></div>
                    </div>
                    <!-- NFID -->
                    <div class="item" @click="openLogin('nfid')">
                        <img :src="logoNfid" />
                        <span>{{ $t('login.list.nfid') }}</span>
                        <i v-if="lastLogin === 'nfid'" class="used">{{ $t('login.used') }}</i>
                    </div>
                </div>
                <div class="web3auth" v-if="store.state.is_web3auth && isShowMoreLogin">
                    <div class="ibox">
                        <div class="login-item email" @click="showEmail">
                            <i class="iconfont icon-email"></i>
                            <div class="recent" v-if="store.state.current_login_way === 'web3auth' &&
        web3AuthLoginWay === 'email_passwordless'
        ">
                                <span></span>
                                <span class="dot"></span>
                            </div>
                        </div>
                        <div class="login-item google" @click="showWeb3Auth('web3auth', { loginProvider: 'google' })">
                            <img src="@/assets/svg/login-google.svg" />
                            <div class="recent" v-if="store.state.current_login_way === 'web3auth' &&
        web3AuthLoginWay === 'google'
        ">
                                <span></span>
                                <span class="dot"></span>
                            </div>
                        </div>
                        <div class="login-item twitter" @click="showWeb3Auth('web3auth', { loginProvider: 'twitter' })">
                            <i class="iconfont icon-twitter"></i>
                            <div class="recent" v-if="store.state.current_login_way === 'web3auth' &&
        web3AuthLoginWay === 'twitter'
        ">
                                <span></span>
                                <span class="dot"></span>
                            </div>
                        </div>
                        <div class="login-item wechat" @click="showWeb3Auth('web3auth', { loginProvider: 'wechat' })">
                            <i class="iconfont icon-wechat"></i>
                            <div class="recent" v-if="store.state.current_login_way === 'web3auth' &&
        web3AuthLoginWay === 'wechat'
        ">
                                <span></span>
                                <span class="dot"></span>
                            </div>
                        </div>
                        <div class="login-item line" @click="showWeb3Auth('web3auth', { loginProvider: 'line' })">
                            <i class="iconfont icon-line"></i>
                            <div class="recent" v-if="store.state.current_login_way === 'web3auth' &&
        web3AuthLoginWay === 'line'
        ">
                                <span></span>
                                <span class="dot"></span>
                            </div>
                        </div>
                    </div>
                    <div class="ibox" v-if="isMore">
                        <div class="login-item discord" @click="showWeb3Auth('web3auth', { loginProvider: 'discord' })">
                            <i class="iconfont icon-discord"></i>
                            <div class="recent" v-if="store.state.current_login_way === 'web3auth' &&
        web3AuthLoginWay === 'discord'
        ">
                                <span></span>
                                <span class="dot"></span>
                            </div>
                        </div>
                        <div class="login-item apple" @click="showWeb3Auth('web3auth', { loginProvider: 'apple' })">
                            <i class="iconfont icon-apple"></i>
                            <div class="recent" v-if="store.state.current_login_way === 'web3auth' &&
        web3AuthLoginWay === 'apple'
        ">
                                <span></span>
                                <span class="dot"></span>
                            </div>
                        </div>
                        <div class="login-item github" @click="showWeb3Auth('web3auth', { loginProvider: 'github' })">
                            <i class="iconfont icon-github"></i>
                            <div class="recent" v-if="store.state.current_login_way === 'web3auth' &&
        web3AuthLoginWay === 'github'
        ">
                                <span></span>
                                <span class="dot"></span>
                            </div>
                        </div>
                        <div class="login-item facebook"
                            @click="showWeb3Auth('web3auth', { loginProvider: 'facebook' })">
                            <i class="iconfont icon-facebook"></i>
                            <div class="recent" v-if="store.state.current_login_way === 'web3auth' &&
        web3AuthLoginWay === 'facebook'
        ">
                                <span></span>
                                <span class="dot"></span>
                            </div>
                        </div>
                        <div class="login-item linkedin"
                            @click="showWeb3Auth('web3auth', { loginProvider: 'linkedin' })">
                            <i class="iconfont icon-linkedin"></i>
                            <div class="recent" v-if="store.state.current_login_way === 'web3auth' &&
        web3AuthLoginWay === 'linkedin'
        ">
                                <span></span>
                                <span class="dot"></span>
                            </div>
                        </div>
                    </div>
                    <div class="more" @click="moreLoginMethod">
                        <i class="iconfont" :class="isMore ? 'icon-arrow-up' : 'icon-arrow-down'"></i>
                    </div>
                    <div class="web3">
                        <img src="@/assets/svg/logo-web3auth.svg" />
                        <span>{{ $t('login.list.web3auth') }}</span>
                    </div>
                </div>
                <div @click="web3authCancelLogin" v-if="store.state.identity.loading && isWeb3auth" class="loading">
                    Cancel
                </div>
            </div>
            <div class="showMoreLogin" @click="showMoreLogin">
                <span>
                    Web2 login
                    <i class="iconfont" :class="isShowMoreLogin ? 'icon-arrow-up' : 'icon-arrow-down'"></i>
                </span>
            </div>
            <div class="setpwd" v-if="isShowSetPwd && !mskLogin">
                <i class="iconfont icon-close" @click="closeSet"></i>
                <p>{{ $t('metamask.t1') }}</p>
                <p class="warning">
                    <i class="iconfont icon-warning"></i> {{ $t('metamask.t2') }}
                </p>
                <div class="setbox">
                    <div class="group">
                        <input type="password" v-model="password1" :placeholder="$t('metamask.placeholder1')" />
                        <input type="password" v-model="password2" :placeholder="$t('metamask.placeholder2')"
                            @keydown.enter="Submit" />
                    </div>
                    <div class="group">
                        <div class="verify">
                            <div class="checkbox">
                                <div class="level">
                                    <span :class="{ low: pwdlevel >= 1 }"></span>
                                    <span :class="{ middle: pwdlevel >= 2 }"></span>
                                    <span :class="{ high: pwdlevel == 3 }"></span>
                                </div>
                                <span>{{
        pwdlevel == 1
            ? $t('metamask.level1')
            : pwdlevel == 2
                ? $t('metamask.level2')
                : pwdlevel == 3
                    ? $t('metamask.level2')
                    : ''
    }}</span>
                            </div>
                            <p v-show="isError">
                                <i class="iconfont icon-attention"></i>{{
        isError == 1
            ? $t('metamask.errorTxt1')
            : $t('metamask.errorTxt2')
    }}
                            </p>
                        </div>
                        <button :class="state == 1 ? 'loading' : ''" @click="Submit">
                            {{ $t('metamask.btn') }}
                        </button>
                    </div>
                </div>
            </div>
            <div class="setpwd" v-if="isShowSetPwd && mskLogin">
                <i class="iconfont icon-close" @click="closeSet"></i>
                <div class="verifyPwd">
                    <p>{{ $t('metamask.check.title') }}</p>
                    <input :disabled="store.state.identity.loading" type="password" v-model="password1"
                        @keydown.enter="openLogin('metamask')" :placeholder="$t('metamask.placeholder1')" />
                    <p class="error" v-show="isError">
                        <i class="iconfont icon-attention"></i>{{ $t('metamask.check.error') }}
                    </p>
                    <button :class="store.state.identity.loading
            ? 'loading'
            : password1.length >= 6
                ? 'active'
                : ''
        " @click="openLogin('metamask')">
                        {{ $t('metamask.btn') }}
                    </button>
                </div>
            </div>
        </div>
    </el-dialog>
</template>

<script lang="ts">
import { defineComponent, inject, ref, watch, onMounted, computed, nextTick } from 'vue';
import store, { IDENTITY } from '@/store';
import { SET_LOADING } from '@/store/modules/identity';
import { handleMetamaskAgent, getMetamaskByEth } from '@/request/agent';
import { useRoute } from 'vue-router';
import bus from 'vue3-eventbus';
import logo_nfid_dark from '@/assets/svg/logo-nfid-dark.png';
import logo_nfid from '@/assets/svg/logo-nfid.png';
import logo_me from '@/assets/svg/logo-me.svg';
import logo_me_dark from '@/assets/svg/logo-me-dark.svg';

export default defineComponent({
    components: {},
    setup() {
        const isAstroxMe = ref<boolean>(
            !!(window as any).icx && /[Mm][Ee]\/\d+\.\d+\.\d+$/.test(window.navigator.userAgent),
        );
        const setIsOpenLogin = inject<(s: boolean) => void>('setIsOpenLogin')!;

        const route = useRoute();
        const isShowSetPwd = ref(false);
        const state = ref(0);
        const password1 = ref('');
        const password2 = ref('');
        const isError = ref(0);
        const pwdlevel = ref(0);
        const mskLogin = ref(false);
        const dialogVisible = ref(true);
        const logoNfid = computed(() => {
            return store.state.theme === 'dark' ? logo_nfid_dark : logo_nfid;
        });
        const logoMe = computed(() => {
            return store.state.theme === 'dark' ? logo_me_dark : logo_me;
        });

        const isCloseBtn = ref(false);

        const lastLogin = ref();
        const metamaskAddress = ref('');

        const isWeb3auth = ref(false);
        const web3AuthLoginWay = ref<string>(localStorage.getItem('web3AuthLoginWay') ?? '');

        const connectClient: any = inject('connectClient', null);

        const globalOutLogin = inject('globalOutLogin', null);
        const afterLogin: any = inject('afterLogin', null);

        const outLogin = () => globalOutLogin;

        const openLogin = async (type) => {
            isWeb3auth.value = false;
            store.dispatch(`${IDENTITY}/${SET_LOADING}`, false);
            if (store.state.identity.loading) {
                return;
            }
            let agent;
            if (type === 'metamask') {
                if (password1.value.length < 6) {
                    return;
                }
                isError.value = 0;
                agent = await handleMetamaskAgent(password1.value);
                if (!agent) {
                    isError.value = 2;
                } else {
                    afterLogin(agent, 'metamask');
                }
            } else {
                if (type === 'astrox' && !!window.icx) {
                    connectClient.connect('icx');
                } else {
                    connectClient.connect(type);
                }
            }
        };

        const showWeb3Auth = (type: any, data: any) => {
            isWeb3auth.value = true;
            store.dispatch(`${IDENTITY}/${SET_LOADING}`, true);
            const getProvider = () => {
                const providers = connectClient.providers;
                for (let i = 0; i < providers.length; i++) {
                    const provider = providers[i];
                    if (provider.meta.id == 'web3auth') {
                        return provider;
                    }
                }
                return null;
            };
            const web3auth = getProvider();
            web3auth.setLogin(data);
            connectClient.connect(type);
            localStorage.setItem('web3AuthLoginWay', data.loginProvider);
        };

        const handleClick = async () => {
            const res: any = await getMetamaskByEth();
            if (!res) {
                return;
            }
            if (res.accounts) {
                metamaskAddress.value = res.accounts.toString();
            }
            mskLogin.value = res.binded ? true : false;
            isShowSetPwd.value = true;
        };

        const closeSet = () => {
            isShowSetPwd.value = false;
        };

        const handleClose = () => {
            dialogVisible.value = false;
        };

        const afterClose = () => {
            dialogVisible.value = true;
            bus.emit('loginClose');
        };

        watch(
            () => password1.value,
            (newVal, oldVal) => {
                if (newVal !== oldVal) {
                    isError.value = 0;
                }
                const newlevel = checkPwdLevel(newVal);
                if (newlevel == 2) {
                    pwdlevel.value = 1;
                } else if (newlevel == 3) {
                    pwdlevel.value = 2;
                } else if (newlevel == 4) {
                    pwdlevel.value = 3;
                } else {
                    pwdlevel.value = 0;
                }
            },
            { deep: true },
        );

        watch(
            () => password2.value,
            (newVal, oldVal) => {
                if (newVal !== oldVal) {
                    isError.value = 0;
                }
            },
        );

        const Submit = () => {
            state.value = 1;
            if (password1.value !== password2.value) {
                isError.value = 2;
                state.value = 0;
            } else {
                if (pwdlevel.value <= 1) {
                    isError.value = 1;
                    state.value = 0;
                } else {
                    isError.value = 0;
                    localStorage.setItem('ismsklogin', 'true');
                    openLogin('metamask');
                }
            }
        };

        const checkPwdLevel = (sValue: string) => {
            let level = 0;
            if (sValue.length < 6) return level;
            if (/\d/.test(sValue)) level++;
            if (/[a-z]/.test(sValue)) level++;
            if (/[A-Z]/.test(sValue)) level++;
            if (/\W/.test(sValue)) level++;

            switch (level) {
                case 1:
                    return 1;
                case 2:
                    return 2;
                case 3:
                    return 3;
                case 4:
                    return 4;
            }
            return level;
        };

        const cancelLogin = () => {
            store.dispatch(`${IDENTITY}/${SET_LOADING}`, false);
            outLogin();
        };

        watch(
            () => route?.meta?.type,
            () => {
                if (
                    route?.meta?.type !== 'browser' &&
                    route?.meta?.type !== 'home' &&
                    route?.meta?.type !== 'light'
                ) {
                    isCloseBtn.value = false;
                }
            },
            { immediate: true, deep: true },
        );

        onMounted(() => {
            lastLogin.value = store.state.current_login_way;
            if (
                route?.meta?.type === 'browser' ||
                route?.meta?.type === 'home' ||
                route?.meta?.type === 'light'
            ) {
                isCloseBtn.value = true;
            }

            nextTick(() => {
                if (isAstroxMe.value) {
                    openLogin('astrox');
                    setIsOpenLogin(false);
                }
            });
        });

        const web3authCancelLogin = () => {
            isWeb3auth.value = false;
            store.dispatch(`${IDENTITY}/${SET_LOADING}`, false);
        };

        // web3auth
        const isMore = ref(false);
        const moreLoginMethod = () => {
            isMore.value = !isMore.value;
        };

        const email = ref('');
        const validateEmail = (str: string) => {
            if (str.length < 4) {
                return false;
            } else {
                const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
                return emailRegex.test(str);
            }
        };
        const isShowEmail = ref(false);
        const showEmail = () => {
            isShowEmail.value = !isShowEmail.value;
        };

        // show more login method
        const isShowMoreLogin = ref(false);
        const showMoreLogin = () => {
            isShowMoreLogin.value = !isShowMoreLogin.value;
        };

        return {
            isAstroxMe,
            isShowSetPwd,
            store,
            state,
            password1,
            password2,
            isError,
            pwdlevel,
            mskLogin,
            dialogVisible,
            connectClient,
            lastLogin,
            isCloseBtn,
            metamaskAddress,
            logoNfid,
            isMore,
            email,
            isShowEmail,
            isWeb3auth,
            web3AuthLoginWay,
            web3authCancelLogin,
            cancelLogin,
            handleClose,
            afterClose,
            outLogin,
            openLogin,
            handleClick,
            closeSet,
            Submit,
            showWeb3Auth,
            moreLoginMethod,
            validateEmail,
            showEmail,
            logoMe,
            isShowMoreLogin,
            showMoreLogin,
        };
    },
});
</script>

<style lang="less" scoped>
.Login {
    .padding(0, 20, 0, 20);
    position: relative;
    .center();
    flex-direction: column;

    .login-header {
        width: 100%;
        line-height: 40px;
        .font-size(26);
        text-align: left;
        color: @text-color;
        @apply dark:(text-light-900);
        font-weight: bold;

        span {
            width: 100%;
            color: @text-color-grey;
            .font-size(16);
            display: block;
            .line-height(24);
            font-weight: normal;
            @apply dark:(text-light-900/60);
        }
    }

    .loginbox {
        width: 100%;
        .margin(20, 0, 10, 0);
        border-radius: @border-radius-sm;
        border: 1px solid @border-color;
        // display: grid;
        // grid-template-columns: repeat(2, minmax(0, 1fr));
        display: flex;
        flex-direction: column;
        overflow: hidden;
        @apply dark:(border-dark-100);
        position: relative;

        .chainLogin {
            display: grid;
            width: 100%;
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .web3auth {
            @apply col-span-full py-4 relative <sm:(py-4) hover:( !bg-transparent !cursor-auto) dark:(border-dark-100);
            border-top: 1px solid @border-color;

            .ibox {
                @apply w-full block flex justify-center items-center;

                &:nth-child(2) {
                    @apply mt-4;
                }

                .login-item {
                    @apply relative w-10 h-10 mx-3 flex justify-center items-center border border-gray-200 rounded-full bg-white transition duration-300 hover:(transition duration-300 cursor-pointer border-transparent) dark:(bg-dark-300 border-dark-50) <sm:(w-9 h-9 mx-2);

                    img {
                        @apply w-3/5;
                    }

                    .recent {
                        span {
                            @apply absolute right-0 top-2px w-2 h-2 rounded-full bg-red-500;

                            &.dot {
                                animation: Dot 1.2s ease-in-out infinite;
                                -webkit-animation: Dot 1.2s ease-in-out infinite;
                            }
                        }
                    }

                    &.email {
                        &:hover {
                            @apply bg-gray-200 dark:(bg-dark-100);

                            i {
                                @apply text-gray-500 dark:(text-white);
                            }
                        }

                        i {
                            @apply transition duration-300 text-gray-400 text-xl;
                        }
                    }

                    &.google {
                        &:hover {
                            @apply bg-yellow-300/30;
                        }
                    }

                    &.twitter {
                        &:hover {
                            @apply bg-blue-400;

                            i {
                                @apply text-white;
                            }
                        }

                        i {
                            @apply transition duration-300 text-blue-400;
                        }
                    }

                    &.wechat {
                        &:hover {
                            @apply bg-green-500;

                            i {
                                @apply text-white;
                            }
                        }

                        i {
                            @apply transition duration-300 text-green-500 text-lg;
                        }
                    }

                    &.line {
                        &:hover {
                            background-color: #5cc048;

                            i {
                                @apply text-white;
                            }
                        }

                        i {
                            @apply transition duration-300 text-lg;
                            color: #5cc048;
                        }
                    }

                    &.discord {
                        &:hover {
                            @apply bg-indigo-600;

                            i {
                                @apply text-white;
                            }
                        }

                        i {
                            @apply transition duration-300 text-indigo-600 text-xl;
                        }
                    }

                    &.apple {
                        &:hover {
                            @apply bg-black;

                            i {
                                @apply text-white dark:(text-white);
                            }
                        }

                        i {
                            @apply transition duration-300 text-black text-xl dark:(text-light-900/80);
                        }
                    }

                    &.github {
                        &:hover {
                            @apply bg-green-500;

                            i {
                                @apply text-white;
                            }
                        }

                        i {
                            @apply transition duration-300 text-green-500 text-xl;
                        }
                    }

                    &.facebook {
                        &:hover {
                            @apply bg-blue-900 dark:(bg-blue-900);

                            i {
                                @apply text-white dark:(text-white);
                            }
                        }

                        i {
                            @apply transition duration-300 text-blue-900;
                        }
                    }

                    &.linkedin {
                        &:hover {
                            @apply bg-sky-700;

                            i {
                                @apply text-white;
                            }
                        }

                        i {
                            @apply transition duration-300 text-sky-700 text-lg;
                        }
                    }
                }
            }

            .web3 {
                @apply flex items-center absolute right-1 bottom-1 transform scale-90 <sm:(scale-75 right-0 bottom-2px);

                img {
                    @apply w-3 mr-1;
                }

                span {
                    @apply text-xs text-gray-400 dark:(text-light-900/60);
                }
            }

            .more {
                @apply p-1 absolute right-1 top-1 rounded-full bg-gray-200/80 w-5 h-5 flex items-center justify-center transition duration-300 hover:(bg-gray-300 cursor-pointer) dark:(bg-dark-100);

                i {
                    @apply text-gray-400 text-xs;
                }
            }
        }

        .loading {
            position: absolute;
            right: 0;
            top: 0;
            padding: 0 10px;
            height: 20px;
            z-index: 99999;
            border: 1px solid #e8e8e8;
            border-right: 0;
            border-top: 0;
            font-size: 12px;
            border-radius: 0 0 0 8px;
            cursor: pointer;
            .center();
        }

        .emailBox {
            @apply w-full absolute flex flex-col justify-center px-15 left-0 top-0 bottom-0 bg-white z-50 dark:(bg-dark-500) <sm:(px-5);

            .title {
                @apply block w-full font-medium text-black text-xl text-left dark:(text-light-900) <sm:(text-lg text-center);
            }

            input {
                @apply w-full h-12 border-gray-300 border rounded-xl mb-5 mt-4 px-3 focus:(ring-1 ring-purple-500) dark:(border-dark-50 bg-transparent text-light-900) <sm:(mt-3 text-center);
            }

            button {
                @apply w-full h-12 rounded-xl bg-purple-500 text-white text-center transition duration-300 hover:(transition duration-300 bg-purple-400);

                &.disabled {
                    @apply bg-purple-300 pointer-events-none;
                }
            }

            .web3 {
                @apply flex items-center absolute right-2 bottom-1 transform scale-90 <sm:(scale-75 right-0 bottom-2px);

                img {
                    @apply w-3 mr-1;
                }

                span {
                    @apply text-xs text-gray-400 dark:(text-light-900/60);
                }
            }
        }

        .icon-back-left {
            @apply absolute left-4 top-3 text-sm text-black z-60 cursor-pointer dark:(text-light-900) <sm:(top-2);
        }

        .item {
            .padding(10, 8, 10, 8);
            transition: @transition;
            position: relative;
            .center();
            flex-direction: column;
            border-top: 1px solid @border-color;
            @apply dark:(border-dark-100);

            &.disabled {
                position: relative;

                &:hover {
                    background: none;
                    cursor: not-allowed;
                }

                &::after {
                    position: absolute;
                    background: rgba(255, 255, 255, 0.6);
                    backdrop-filter: blur(1px) saturate(100%);
                    content: '';
                    .center();
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    line-height: 200%;
                    @apply dark:(bg-dark-300/50);
                }

                .tips {
                    width: 100%;
                    position: absolute;
                    bottom: 0;
                    z-index: 10;
                    text-align: center;
                    padding-bottom: 3px;
                    .font-size(14);
                }
            }

            &:hover {
                background-color: @bg-color-hover;
                transition: @transition;
                cursor: pointer;
                @apply dark:(bg-dark-300);
            }

            i.used {
                position: absolute;
                right: 0;
                top: 0;
                .font-size(12);
                .line-height(16);
                font-style: normal;
                color: @text-color-grey;
                background-color: @bg-color-grey;
                .padding(0, 4, 0, 4);
                border-bottom-left-radius: 4px;
                @apply dark:(bg-dark-200);
            }

            .recommond {
                position: absolute;
                left: 8px;
                top: 8px;
                width: 24px;
                height: 24px;
                line-height: 18px;
                border-radius: 100%;
                text-align: center;
                background-color: #f9863f;

                // .center();
                i {
                    color: white;
                    .font-size(12);
                }
            }

            &:nth-child(1),
            &:nth-child(3) {
                border-right: 1px solid @border-color;
                @apply dark:(border-dark-100);
            }

            &:nth-child(1),
            &:nth-child(2) {
                border-top: none;
            }

            img {
                display: block;
                margin: 0 auto;
                height: 24px;
            }

            span {
                display: block;
                text-align: center;
                .padding(2, 0, 0, 0);
                .font-size(14);
                font-weight: 500;
                color: @text-color;
                @apply dark:(text-light-900/80);

                &.more {
                    padding-top: 0;
                    .font-size(16);
                }
            }

            &.ic {
                img {
                    height: 20px;
                    margin: 4px auto;
                }
            }
        }

        .cancel {
            @apply absolute z-9999 right-0 top-0 flex items-center px-3 py-1 rounded-bl-xl cursor-pointer text-gray-400 text-sm border-l border-b bg-white transition duration-300 hover:(cursor-pointer transition duration-300 text-gray-600 bg-gray-50 dark:(text-light-900/80 bg-dark-500)) dark:(bg-dark-300 border-dark-50);
            border-color: @border-color;

            i {
                @apply text-xs mr-2;
            }
        }
    }

    .showMoreLogin {
        @apply w-full pt-2 flex justify-center;

        span {
            @apply px-2 text-sm cursor-pointer text-gray-400 rounded-full transition duration-300 dark:(text-gray-400) hover:(transition duration-300 bg-gray-100 dark:(bg-dark-100 text-gray-300));
        }
    }

    .setpwd {
        width: 100%;
        background-color: @text-color-inverse;
        .margin(20, 0, 10, 0);
        border-radius: @border-radius-sm;
        .padding(20, 20, 20, 20);
        border: 1px solid @border-color;
        position: relative;
        -webkit-animation: fade-in-bottom 0.3s cubic-bezier(0.39, 0.575, 0.565, 1) both;
        animation: fade-in-bottom 0.3s cubic-bezier(0.39, 0.575, 0.565, 1) both;
        text-align: left;
        @apply dark:(bg-dark-800 border-dark-300);

        i {
            &.icon-close {
                background-color: #ada0ff;
                width: 22px;
                height: 22px;
                line-height: 22px;
                text-align: center;
                border-radius: 100%;
                position: absolute;
                top: -8px;
                right: -8px;
                .font-size(12);
                color: white;
                transition: @transition;

                &:hover {
                    cursor: pointer;
                    background-color: @text-active;
                    transition: @transition;
                }
            }
        }

        p {
            display: block;
            .line-height(20);
            word-break: break-word;
            color: #999;
            @apply dark:(text-light-900/80);

            &.warning {
                display: flex;
                align-items: center;
                .line-height(16);
                .font-size(14);
                .padding(8, 12, 8, 12);
                border: 1px solid rgba(245, 158, 11, 0.5);
                border-radius: 8px;
                .margin(12, 0, 0, 0);
                background-color: rgba(245, 158, 11, 0.05);
                color: @text-fcolor;
                @apply dark:(text-yellow-400/60);

                i {
                    .margin(0, 12, 0, 0);
                    color: rgba(245, 158, 11, 0.6);
                }
            }
        }

        .setbox {
            width: 100%;
            .margin(16, 0, 0, 0);

            .group {
                width: 100%;
                display: flex;
                justify-content: space-between;
                .margin(20, 0, 0, 0);

                input {
                    width: 48%;
                    .height(44);
                    .line-height(44);
                    .padding(0, 12, 0, 12);
                    border: 1px solid @border-color;
                    border-radius: 8px;
                    box-sizing: border-box;
                    @apply dark:(border-dark-100);

                    &::placeholder {
                        .font-size(14);
                    }
                }

                .verify {
                    flex: 1;

                    .checkbox {
                        width: 100%;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;

                        .level {
                            flex: 1;
                            display: flex;
                            align-items: center;
                            .height(20);

                            span {
                                .height(10);
                                width: 33.3%;
                                margin-right: 1px;
                                background-color: @bg-color-grey;
                                border-radius: @border-radius-sm;
                                transition: @transition;

                                &.low {
                                    background-color: rgb(239, 68, 68);
                                    transition: @transition;
                                }

                                &.middle {
                                    transition: @transition;
                                    background-color: rgb(245, 158, 11);
                                }

                                &.high {
                                    transition: @transition;
                                    background-color: rgb(16, 185, 129);
                                }
                            }
                        }

                        span {
                            .width(80);
                            .padding(0, 0, 0, 8);
                            .font-size(14);
                        }
                    }

                    p {
                        width: 100%;
                        display: block;
                        .margin(4, 0, 0, 0);
                        color: rgb(248, 113, 113);
                        .font-size(14);

                        i {
                            margin-right: 4px;
                        }
                    }
                }

                button {
                    .width(160);
                    .height(44);
                    .line-height(44);
                    .center();
                    text-align: center;
                    border-radius: 10px;
                    border: none;
                    background-color: @bg-color-body-active;
                    color: @text-color-inverse;
                    .margin(0, 0, 0, 20);
                    transition: @transition;

                    &:hover {
                        cursor: pointer;
                        opacity: 0.8;
                        transition: @transition;
                    }

                    &.loading {
                        cursor: wait;
                        transition: @transition;
                        background-color: rgba(139, 92, 246, 0.6);

                        &::before {
                            border: 3px solid currentColor;
                            .margin(0, 8, 0, 0);
                            .width(16);
                            .height(16);
                            border-radius: 100%;
                            opacity: 0.8;
                            border-right-color: transparent;
                            content: '';
                            -webkit-animation: spinner 0.75s linear infinite;
                            animation: spinner 0.75s linear infinite;
                        }
                    }
                }
            }
        }

        .verifyPwd {
            width: 100%;

            p {
                width: 100%;
                .padding(10, 0, 30, 0);
                .font-size(20);
                text-align: center;
                font-weight: 500;
                color: @text-color;
                @apply dark:(text-light-900/80);

                &.accounts {
                    width: 100%;
                    display: block;
                    margin-top: 4px;
                    .padding(8, 0, 8, 0);
                    text-align: left;
                    color: #999;
                    .font-size(12);
                    font-style: normal;
                }

                &.error {
                    width: 100%;
                    display: block;
                    margin-top: 4px;
                    .padding(8, 0, 8, 0);
                    text-align: left;
                    color: rgb(248, 113, 113);
                    .font-size(14);
                    font-style: normal;

                    i {
                        margin-right: 4px;
                    }
                }
            }

            input {
                width: 100%;
                .height(52);
                .line-height(52);
                .padding(0, 12, 0, 12);
                border: 1px solid @border-color;
                border-radius: @border-radius-xs;
                box-sizing: border-box;
                @apply dark:(border-dark-100);

                &::placeholder {
                    .font-size(14);
                }
            }

            button {
                width: 60%;
                .height(52);
                .line-height(52);
                margin: 32px auto 8px;
                .center();
                border: none;
                text-align: center;
                border-radius: @border-radius-xs;
                background-color: @bg-color-body-active;
                opacity: 0.6;
                cursor: not-allowed;
                color: @text-color-inverse;
                transition: @transition;

                &.active {
                    opacity: 1;
                    cursor: auto;
                    transition: @transition;

                    &:hover {
                        cursor: pointer;
                        opacity: 0.8;
                        transition: @transition;
                    }
                }

                &.loading {
                    cursor: wait;
                    transition: @transition;
                    background-color: @bg-color-body-disable;

                    &::before {
                        border: 3px solid currentColor;
                        margin-right: 8px;
                        width: 16px;
                        height: 16px;
                        border-radius: 100%;
                        border-right-color: transparent;
                        opacity: 0.8;
                        content: '';
                        -webkit-animation: spinner 0.75s linear infinite;
                        animation: spinner 0.75s linear infinite;
                    }
                }
            }
        }
    }
}

@media screen and (min-width: 0) and (max-width: 750px) {
    .Login {
        .login-header {
            .padding(10, 0, 10, 0);
        }

        .loginbox {
            .item {
                i.used {
                    .padding(2, 5, 2, 5);
                }
            }
        }

        .setpwd {
            .setbox {
                .group {
                    flex-wrap: wrap;
                    margin-top: 0;

                    input {
                        width: 100%;
                        .margin(0, 0, 16, 0);
                    }

                    button {
                        width: 100%;
                        .margin(20, 0, 0, 0);
                    }
                }
            }
        }

        .verifyPwd {
            input {
                width: 100%;
                margin-top: 10px;
            }

            button {
                width: 100%;
            }
        }
    }
}

@-webkit-keyframes fade-in-bottom {
    0% {
        -webkit-transform: translateY(70px);
        transform: translateY(70px);
        opacity: 0;
    }

    100% {
        -webkit-transform: translateY(0);
        transform: translateY(0);
        opacity: 1;
    }
}

@keyframes fade-in-bottom {
    0% {
        -webkit-transform: translateY(70px);
        transform: translateY(70px);
        opacity: 0;
    }

    100% {
        -webkit-transform: translateY(0);
        transform: translateY(0);
        opacity: 1;
    }
}

@-webkit-keyframes Dot {
    0% {
        opacity: 0.8;
        transform: scale(0.1);
    }

    to {
        opacity: 0;
        transform: scale(2.4);
    }
}

@keyframes Dot {
    0% {
        opacity: 0.8;
        transform: scale(0.1);
    }

    to {
        opacity: 0;
        transform: scale(2.4);
    }
}
</style>
<style lang="less">
.astrox-me-login-directly {
    display: none;
}
</style>
