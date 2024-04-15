<template>
    <Connect2ICProvider :client="client">
        <router-view v-slot="{ Component }">
            <keep-alive ref="keepAlive" :include="keepAliveInclude" :exclude="keepAliveExclude">
                <component :is="Component" :key="$route.name" v-if="$route.meta.keepAlive" />
            </keep-alive>
            <component :is="Component" :key="$route.name" v-if="!$route.meta.keepAlive" />
        </router-view>
    </Connect2ICProvider>
    <Login v-if="isOpenLogin" @close="isOpenLogin = false" />
    <Indexing v-if="store.state.global_loading" />
    <Privacy v-if="isPrivacy" :privacyCallback="privacyCallback" />
    <PublicSale v-if="isShowSnsSale" @close="closeSns" />
</template>

<script lang="ts">
import CheckCode from './components/CheckCode.vue';

import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { defineComponent, nextTick, onMounted, provide, ref, onUnmounted, watch } from 'vue';
import CONFIG from '@/assets/config';
import debug from '@/utils/debug';
import store, { IDENTITY } from '@/store';
import { SET_LOADING } from '@/store/modules/identity';
import _ from 'lodash';
import { useRoute, useRouter } from 'vue-router';

import Login from '@/components/Login.vue';
import bus from 'vue3-eventbus';
import { removeCache, setMatchMedia, setTDK, detectLanguage, getParams } from '@/utils/functions';

import Indexing from '@/components/Indexing.vue';

import Privacy from '@/components/Privacy.vue';

import { restoreMetamaskAgent } from '@/request/agent/index';

import { createClient } from '@connect2ic/core';
import { AstroX, ICX } from '@connect2ic/core/providers';
import { Connect2ICProvider } from '@connect2ic/vue';

import { InternetIdentity, NFID, Web3AuthIC } from '@/request/agent/providers';
import '@connect2ic/core/style.css';

import { idlFactory as userAllotFactory } from '@/request/canister/user_allot.did';
import { idlFactory as usersFactory } from '@/request/canister/users.did';
import { idlFactory as planetFactory } from '@/request/canister/planet.did';
import { idlFactory as partnerToolFactory } from '@/request/canister/partnerTool.did';

import { InitWallet, InitWalletCkBtc, InitWalletMora } from '@/utils/wallet';

import { createActor, handleIdentityAgent } from '@/request/agent';
import { Usergeek } from 'usergeek-ic-js';

import PublicSale from '@/components/PublicSale.vue';

export default defineComponent({
    components: {
        NProgress,
        Connect2ICProvider,
        Login,
        Indexing,
        CheckCode,
        Privacy,
        PublicSale
    },
    name: 'App',
    setup() {
        const route = useRoute();
        const router = useRouter();
        const currentLoginWay = ref('unhandled');

        const isOpenLogin = ref(false);

        const netlifyLink = getParams('host')
            ? getParams('host')
            : window?.__PRIVATE_CONFIG__?.planet
                ? location.origin
                : CONFIG.netlifyLink;

        const client = createClient({
            canisters: {},
            providers: [
                (window as any).icx
                    ? new ICX({
                        delegationModes: ['domain'],
                        host: netlifyLink,
                        customDomain: netlifyLink,
                    })
                    : new AstroX({
                        delegationModes: ['domain'],
                        host: netlifyLink,
                        customDomain: netlifyLink,
                    }),
                new InternetIdentity(),
                new NFID(),
                new Web3AuthIC({
                    clientId: CONFIG.Web3AuthICClientId,
                }),
            ],
            globalProviderConfig: {
                appName: 'MoraApp',
                dev: false,
                host: netlifyLink,
                autoConnect: true,
                customDomain: netlifyLink,
            },
        });


        const loginPrincipal = ref();

        const usersCanister = ref();

        const keyplanCanister = ref();

        const collectionsList = ref([]);

        const keepAliveInclude = ref('Home');
        const keepAliveExclude = ref(['Browser', 'Planet', 'Rover', 'LightProfile', 'Plugin']);

        const isPrivacy = ref(false);

        const privacyCallback = ref();

        const commentNoticeInitEnd = ref(false);

        const isWeb3authLoginRestore = ref(false);

        setMatchMedia();

        client.on('init', async (e) => {
            store.commit('SET_CONNECT2IC_INIT_STATE', true);
            if (!client.activeProvider && currentLoginWay.value) {

                removeCache();
                router.isReady().then(() => {
                    if (!~CONFIG.dontWaitInit.indexOf(route.name)) {
                        if (
                            localStorage.getItem('currentLoginWay') !== 'metamask' ||
                            !localStorage.getItem('metamaskAgent')
                        ) {
                            isOpenLogin.value = true;
                        }
                    } else {
                        isOpenLogin.value = false;
                    }
                    store.commit('SET_GLOBAL_LOADING', false);
                });
            }

            if (isWeb3authLoginRestore.value) {
                const providers = client.providers;
                let connect2icWeb3AuthObj: any;
                for (let i = 0; i < providers.length; i++) {
                    const provider = providers[i];
                    if (provider.meta.id == 'web3auth') {
                        connect2icWeb3AuthObj = provider;
                    }
                }
                if (connect2icWeb3AuthObj) {
                    const isConnected = await connect2icWeb3AuthObj.restore();
                    if (isConnected.value.isConnected) {
                        afterLogin(store.state.agent, 'web3auth');
                    } else {
                        if (!~CONFIG.dontWaitInit.indexOf(route.name)) {
                            isOpenLogin.value = true;
                        } else {
                            isOpenLogin.value = false;
                        }
                    }
                }
            }
        });

        client.on('connecting', () => { });

        client.on('connect', async (e) => {
            let identity;
            if (e.activeProvider.meta.id === 'astrox') {
                identity = window.ic.astrox.identity;
            } else if (e.activeProvider.meta.id === 'icx') {
                identity = window.icx._identity;
            } else {
                identity = e.activeProvider.identity;
            }
            store.commit('SET_CURRENT_IDENTITY', identity);
            isOpenLogin.value = false;
            if (identity._delegation) {
                setTimeout(() => {
                    outLogin();
                }, Number(identity._delegation.delegations[0].delegation.expiration) / 1e6 - new Date().getTime());
            }
            const agent = handleIdentityAgent(identity);

            afterLogin(agent, e.activeProvider.meta.id);
        });

        client.on('disconnecting', (e) => { });

        const afterLogin = async (agent, loginWay) => {
            currentLoginWay.value = loginWay;
            localStorage.setItem('currentLoginWay', currentLoginWay.value);
            store.commit('SET_CURRENT_LOGIN_WAY', currentLoginWay.value);

            store.dispatch(`${IDENTITY}/${SET_LOADING}`, false);
            const principal = (await agent.getPrincipal()).toString();
            loginPrincipal.value = principal;
            store.commit('SET_AGENT', agent);
            store.commit('SET_USER_PRINCIPAL', principal);
            isOpenLogin.value = false;

            Usergeek.setPrincipal(principal);
            Usergeek.trackSession();

            await InitWallet(principal);
            await InitWalletCkBtc(principal);
            await InitWalletMora(principal);
            store.commit('SET_IS_WALLET', true);

            let localData: string | null = '';
            let localUserData: string | null = '';
            localData = localStorage.getItem('keyplan');
            localUserData = localStorage.getItem('userData');
            // uqmfy-dqaaa-aaaai-qnkuq-cai
            if (localData && localUserData) {
                if (~localData.indexOf(CONFIG.userCanister)) {
                    localStorage.removeItem('keyplan');
                    localStorage.removeItem('userData');
                    init();
                } else {
                    const keyplanData = JSON.parse(localData);
                    const userData = JSON.parse(localUserData);
                    const keyplan = keyplanData[principal];
                    const user = userData[principal];
                    if (keyplan && user) {
                        init(keyplan, user);
                    } else {
                        init();
                    }
                }
            } else {
                init();
            }
        };

        const outLogin = async (isOpen = true) => {
            localStorage.removeItem('metamaskAgent');
            store.commit('SET_METAMASK_AGENT_HEX', '');
            if (client?.status?.idle === 'connected') {
                client.disconnect();
                Usergeek.setPrincipal(undefined);
            }

            removeCache();
            if (isOpen) {
                isOpenLogin.value = true;
            }
        };

        const setStore = (keyplan: string, user: {}) => {
            if (!loginPrincipal.value) {
                return;
            }
            user.pid = user.pid.toString();
            user.created = parseInt(user.created);
            const localData = localStorage.getItem('keyplan');
            const localUserData = localStorage.getItem('userData');

            if (localData) {
                const data = JSON.parse(localData);
                data[loginPrincipal.value] = keyplan;
                localStorage.setItem('keyplan', JSON.stringify(data));
            } else {
                const arr: {}[] = [];
                const str: any = {};
                str[loginPrincipal.value] = keyplan;
                arr.push(str);
                localStorage.setItem('keyplan', JSON.stringify(str));
            }

            if (localUserData) {
                const data = JSON.parse(localUserData);
                data[loginPrincipal.value] = user;
                localStorage.setItem('userData', JSON.stringify(data));
            } else {
                const arr: {}[] = [];
                const str: any = {};
                str[loginPrincipal.value] = user;
                arr.push(str);
                localStorage.setItem('userData', JSON.stringify(str));
            }
        };

        const getCyclesQuantity = (arr) => {
            arr.map(async (id) => {
                try {
                    const planetCanister = await createActor(id, planetFactory);
                    const cycles = await planetCanister.wallet_balance();
                    const balance = Number((Number(cycles) / 1000000000000).toFixed(4));
                    if (balance < CONFIG.noticeCyclesDeficiency) {
                        const planetBaseData: any = await planetCanister.getPlanetBase();
                        const name = planetBaseData.name;
                        const str = {
                            type: 'cyclesDeficiency',
                            id,
                            balance,
                            name,
                        };
                        store.commit('ADD_NOTICE_LIST', str);
                    }
                } catch (err) { }
            });
        };
        const refreshCyclesQuantity = () => {
            noticeInit();
        };

        const get_planets_canister = async () => {
            store.commit('SET_PLANETS_LOADING', true);
            if (!usersCanister.value) {
                store.commit('SET_PLANETS_LOADING', false);
                return;
            }
            try {
                const planetsData = await usersCanister.value.get_planets();
                if (!planetsData.length) {
                    localStorage.setItem('planetsData', '[]');
                    store.commit('SET_PLANETS_DATA', []);
                    store.commit('SET_PLANETS_LOADING', false);
                    return;
                }
                const arr = planetsData[0].map((item) => {
                    const id = item.toString();
                    return id;
                });
                _.reverse(arr);
                localStorage.setItem('planetsData', arr.toString());
                store.commit('SET_PLANETS_DATA', []);

                nextTick(() => {
                    store.commit('SET_PLANETS_DATA', arr);
                    store.commit('SET_PLANETS_LOADING', false);
                });
            } catch (err) {
                debug('error', err);
            }
        };

        const get_subscribes_canister = async () => {

            store.commit('SET_SUBSCRIBES_LOADING', true);
            if (!usersCanister.value) {
                store.commit('SET_SUBSCRIBES_LOADING', false);
                return;
            }
            try {
                const subscribesData = await usersCanister.value.get_subscribes();
                if (!subscribesData.length) {
                    localStorage.setItem('subscribesData', '[]');
                    store.commit('', []);
                    store.commit('SET_SUBSCRIBES_LOADING', false);
                    return;
                }
                const arr = subscribesData[0].map((item) => {
                    const id = item.toString();
                    return id;
                });
                _.reverse(arr);
                localStorage.setItem('subscribesData', arr);
                nextTick(() => {
                    store.commit('SET_SUBSCRIBES_DATA', arr);
                    store.commit('SET_SUBSCRIBES_LOADING', false);
                });
            } catch (err) {
                debug('error', err);
            }
        };

        const get_collections_canister = async () => {
            collectionsList.value = [];
            store.commit('SET_COLLECTIONS_LOADING', true);
            try {
                const res = await usersCanister.value.get_collections({
                    page: 1,
                    size: 9999,
                });
                if (res && res.data) {
                    collectionsList.value = res.data;
                }
            } catch (err) {
                debug('error', err);
            }
            store.commit('SET_COLLECTIONS_LOADING', false);
        };

        const get_comment_state = async () => {
            const list = store.state.comment_notice;
            const set = new Set();
            list.map((item) => {
                set.add(item.pid);
            });

            const map = Array.from(set).map((item) => {
                return new Promise(async (result) => {
                    const planetCanister = await createActor(
                        item,
                        planetFactory,
                        store.state.agent,
                    );
                    const res: any = await planetCanister.adminComments({
                        aid: '',
                        pid: [],
                        page: 1,
                        size: 9999,
                        sort: { TimeDesc: null },
                    });
                    if (res.data.length) {
                        const arr = res.data.reduce((acc, item) => {
                            if (!acc[item.aid]) {
                                acc[item.aid] = [];
                            }
                            acc[item.aid].push({
                                id: Number(item.id),
                                content: item.content,
                                isShow: Object.keys(item.status)[0] === 'Visible',
                            });
                            return acc;
                        }, []);
                        result(arr);
                    } else {
                        result([]);
                    }
                });
            });

            Promise.all(map)
                .then(async (res) => {
                    const commentList: any[] = [];
                    res.map((item) => {
                        for (const item2 in item) {
                            commentList[item2] = item[item2];
                        }
                    });
                    list.map((item) => {
                        if (commentList[item.aid] && commentList[item.aid].length) {
                            commentList[item.aid].map((item2) => {
                                if (item.cid == item2.id) {
                                    if (item2.isShow === true) {
                                        const str = {
                                            type: 'comment',
                                            ...item,
                                        };
                                        store.commit('ADD_NOTICE_LIST', str);
                                    }
                                }
                            });
                        }
                    });
                })
                .catch((err) => {
                    debug('error', err);
                });
        };

        const get_comment_notice = async () => {
            try {
                const res = await usersCanister.value.get_attibute_by_key('_commentNotice');
                if (!res.length) {
                    await usersCanister.value.add_attribute({
                        key: '_commentNotice',
                        value: '[]',
                    });
                    store.commit('SET_COMMENT_NOTICE', []);
                    nextTick(() => {
                        commentNoticeInitEnd.value = true;
                    });
                } else {
                    const noticeList = JSON.parse(res[0].value);
                    store.commit('SET_COMMENT_NOTICE', noticeList);
                    nextTick(() => {
                        commentNoticeInitEnd.value = true;
                        get_comment_state();
                    });
                }
            } catch (err) {
                debug('error', err);
                commentNoticeInitEnd.value = false;
            }
        };

        const preloadData = async () => {
            if (!loginPrincipal.value || !store?.state?.agent) {
                return;
            }
            get_subscribes_canister();
            get_planets_canister();
            get_collections_canister();
            get_comment_notice();
        };

        const closeLogin = () => {
            isOpenLogin.value = false;
        };

        const openLogin = () => {
            if (!store.state.connect2ic_init_state) {
                return;
            }
            isOpenLogin.value = true;
        };

        const permissionVerify = (to) => {
            setTimeout(() => {
                if (to.matched) {
                    const matched = to.matched[0];
                    if (matched?.name === 'rover' || matched?.name === 'rmplanetover') {
                        setTimeout(() => {
                            if (
                                !store.state.agent &&
                                !isOpenLogin.value &&
                                store.state.connect2ic_init_state &&
                                !isWeb3authLoginRestore.value
                            ) {
                                nextTick(() => {
                                    isOpenLogin.value = true;
                                });
                            }
                        }, 150);
                    }
                }
            }, 50);
        };

        const clearKeepAliveCache = () => {
            keepAliveExclude.value = [
                'Browser',
                'Planet',
                'Rover',
                'LightProfile',
                'Plugin',
                'Home',
            ];
            keepAliveInclude.value = '';
            setTimeout(() => {
                keepAliveExclude.value = ['Browser', 'Planet', 'Rover', 'LightProfile', 'Plugin'];
                keepAliveInclude.value = 'Home';
            }, 0);
        };

        const lang = () => {
            let localLang: any;
            if (localStorage.getItem('lang')) {
                localLang = localStorage.getItem('lang');
            } else {
                localLang = detectLanguage();
            }
            store.commit('SET_LOCAL_LANG', localLang);
        };

        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
            if (event.matches) {
                if (store.state.theme === 'light') {
                    store.dispatch('SWITCH_THEME');
                }
            } else {
                if (store.state.theme === 'dark') {
                    store.dispatch('SWITCH_THEME');
                }
            }
        });

        let noticeTimeout;
        const noticeClearAll = async () => {
            const list = store.state.notice_list;
            if (!list.length) return;

            const _clearAll = () => {
                clearTimeout(noticeTimeout);
                store.commit('SET_NOTICE_LIST', []);
                const commentNoticeList = [];

                const clearAllArr = list.map(async (item) => {
                    return new Promise<any>(async (resolve) => {
                        const planetCanister = await createActor(
                            item.pid ? item.pid : item.id,
                            planetFactory,
                            store.state.agent,
                        );
                        if (item.type === 'subcriber') {
                            planetCanister.resetSubscriberNew().then((res) => {
                                resolve(res);
                            });
                        }
                        if (item.type === 'articles') {
                            planetCanister.resetArticleCommentNew(item.id).then((res) => {
                                resolve(res);
                            });
                        }
                        if (item.type === 'comment') {
                            commentNoticeList.push(item);
                            resolve(true);
                        }
                    });
                });

                Promise.all(clearAllArr).then((res) => {
                    store.commit('REMOVE_COMMENT_NOTICE', commentNoticeList);
                    debug('error', '', false);
                    noticeInit();
                });
            };

            _clearAll();
        };

        const noticeInit = () => {
            if (store.state.notice_state === 'ON') {
                debug('error', '', false);
                noticeTimeout = setTimeout(() => {
                    noticeInit();
                }, CONFIG.noticeTimeout);
                return;
            }
            clearTimeout(noticeTimeout);
            store.commit('SET_NOTICE_LOADING', true);
            store.commit('SET_NOTICE_LIST', []);

            getCyclesQuantity(store.state.planets_data);

            if (commentNoticeInitEnd.value) {
                get_comment_state();
            }

            const planets_data = store.state.planets_data;
            const subcriberArr = planets_data.map((item) => {
                return new Promise<void>(async (resolve) => {
                    const planetCanister = await createActor(
                        item,
                        planetFactory,
                        store.state.agent,
                    );
                    const planetInfoPromise = new Promise<void>((planetInfoResolve) => {
                        planetCanister
                            .getPlanetInfo()
                            .then((planetInfo: any) => {
                                if (
                                    Number(planetInfo.subcriber_new) > 0 &&
                                    planetInfo.owner.toString() === store.state?.user_data?.pid
                                ) {
                                    const str = {
                                        type: 'subcriber',
                                        id: item,
                                        avatar: planetInfo.avatar,
                                        name: planetInfo.name,
                                        value: Number(planetInfo.subcriber_new),
                                    };
                                    store.commit('ADD_NOTICE_LIST', str);
                                }
                                planetInfoResolve();
                            })
                            .catch(() => {
                                planetInfoResolve();
                            });
                    });

                    const articlesPromise = new Promise<void>((articlesResolve) => {
                        const str = {
                            status: [],
                            subcate: 0,
                            cate: 0,
                            atype: [
                                {
                                    Article: null,
                                },
                            ],
                            page: 1,
                            size: 9999,
                            sort: {
                                TimeDesc: null,
                            },
                            search: '',
                        };
                        planetCanister
                            .queryArticles(str)
                            .then((articles: any) => {
                                articles.data.map((articlesItem) => {
                                    if (Number(articlesItem.commentNew) > 0) {
                                        const str = {
                                            type: 'articles',
                                            id: articlesItem.id,
                                            pid: item,
                                            name: articlesItem.title,
                                            value: Number(articlesItem.commentNew),
                                        };
                                        store.commit('ADD_NOTICE_LIST', str);
                                    }
                                });
                                articlesResolve();
                            })
                            .catch(() => {
                                articlesResolve();
                            });
                    });

                    Promise.all([planetInfoPromise, articlesPromise]).then(() => {
                        resolve();
                    });
                });
            });

            Promise.all(subcriberArr).then(() => {
                store.commit('SET_NOTICE_LOADING', false);
                noticeTimeout = setTimeout(() => {
                    noticeInit();
                }, CONFIG.noticeTimeout);
            });
        };
        const recordPartner = async (key) => {
            const partnerToolCanister = await createActor(
                CONFIG.partnerToolCanisterId,
                partnerToolFactory,
                store.state.agent,
            );
            await partnerToolCanister.record(key);
        };

        const init = async (keyplan = '', user = '') => {
            const isCache = false;
            const keyplanActor = await createActor(
                CONFIG.keyplanId,
                userAllotFactory,
                store.state.agent,
            );
            keyplanCanister.value = keyplanActor;

            const _loginSuccess = async (userData, pid) => {
                store.commit('SET_USER_CANISTER', pid);
                usersCanister.value = await createActor(pid, usersFactory, store.state.agent);
                store.commit('SET_USER_DATA', userData);
                store.commit('SET_GLOBAL_LOADING', false);

                setStore(pid, userData);
                nextTick(() => {
                    preloadData();
                });
            };

            const _loginCanister = async () => {
                store.commit('SET_GLOBAL_LOADING', true);
                const userinfo: any = await keyplanActor.login();
                if (userinfo.Ok) {
                    _loginSuccess(userinfo.Ok.userinfo, userinfo.Ok.canister_id.toString());
                    store.commit('SET_GLOBAL_LOADING', false);

                    const isPartnerTool = localStorage.getItem('source');
                    if (isPartnerTool) {
                        recordPartner(isPartnerTool);
                    }
                } else {
                    store.commit('SET_GLOBAL_LOADING', false);
                    outLogin();
                }
            };

            const _register = async (isAgree) => {
                isPrivacy.value = false;
                if (!isAgree) {
                    outLogin();
                    return;
                }
                _loginCanister();
            };

            const _ifPrivate = () => {
                if (window?.__PRIVATE_CONFIG__?.planet) {
                    _loginCanister();
                } else {
                    isPrivacy.value = true;
                    privacyCallback.value = _register;
                }
            };

            try {
                const user_canister: any = await keyplanActor.get_canister();
                if (!user_canister || !user_canister.length) {
                    _ifPrivate();
                } else {
                    usersCanister.value = await createActor(
                        user_canister.toString(),
                        usersFactory,
                        store.state.agent,
                    );
                    const userinfo: any = await usersCanister.value.profile();
                    if (!userinfo.length) {
                        store.commit('SET_GLOBAL_LOADING', true);
                        _ifPrivate();
                    } else if (!isCache) {
                        _loginSuccess(userinfo[0], user_canister.toString());
                    }
                }
            } catch (err) {
                debug('error', err);
            }
        };

        watch(
            () => store.state.comment_notice,
            async (val) => {
                if (commentNoticeInitEnd.value) {
                    await usersCanister.value.add_attribute({
                        key: '_commentNotice',
                        value: JSON.stringify(val),
                    });
                }
            },
            { deep: true },
        );

        watch(
            () => store.state.meta,
            (val: any) => {
                if (val) {
                    setTDK();
                }
            },
            {
                deep: true,
            },
        );

        watch(
            () => store.state.agent,
            (val) => {
                if (!val) {
                    clearTimeout(noticeTimeout);
                    store.commit('SET_NOTICE_LIST', []);
                }
            },
            { immediate: true, deep: true },
        );

        watch(
            () => store.state.planets_data,
            (val, val2) => {
                if (val.toString() === val2?.toString()) {
                    return;
                }
                if (val.length) {
                    clearTimeout(noticeTimeout);
                    store.commit('SET_NOTICE_LIST', []);
                    noticeInit();
                }
            },
            { immediate: true, deep: true },
        );

        onUnmounted(() => {
            bus.off('permissionVerify', permissionVerify);
            bus.off('noticeClearAll', noticeClearAll);
            bus.off('clearKeepAliveCache', clearKeepAliveCache);
        });

        onMounted(async () => {
            lang();

            store.commit('SET_GLOBAL_LOADING', false);
            const lastLogin = localStorage.getItem('currentLoginWay');
            if (lastLogin) {
                store.commit('SET_CURRENT_LOGIN_WAY', lastLogin);
            }

            if (lastLogin === 'metamask' && localStorage.getItem('metamaskAgent')) {
                store.commit('SET_METAMASK_AGENT_HEX', localStorage.getItem('metamaskAgent') ?? '');
                isOpenLogin.value = false;
                const agent = await restoreMetamaskAgent(localStorage.getItem('metamaskAgent'));
                if (agent) {
                    afterLogin(agent, 'metamask');
                    isOpenLogin.value = false;
                } else {
                    isOpenLogin.value = true;
                    localStorage.removeItem('metamaskAgent');
                    store.commit('SET_METAMASK_AGENT_HEX', '');
                }
            }
            else if (lastLogin === 'web3auth') {
                isWeb3authLoginRestore.value = true;
            } else {
                localStorage.removeItem('metamaskAgent');
                store.commit('SET_METAMASK_AGENT_HEX', '');
            }

            const planetsLocalData = localStorage.getItem('planetsData');
            const subscribesLocalData = localStorage.getItem('subscribesData');
            if (planetsLocalData) {
                store.commit('SET_PLANETS_DATA', planetsLocalData.split(','));
            }
            if (subscribesLocalData) {
                store.commit('SET_SUBSCRIBES_DATA', subscribesLocalData.split(','));
            }
            bus.on('permissionVerify', permissionVerify);
            bus.on('noticeClearAll', noticeClearAll);
            bus.on('clearKeepAliveCache', clearKeepAliveCache);

            Usergeek.init({
                apiKey: '01C20201132F8B56670E8FA6176ABFB2',
                host: 'https://mora.app',
            });
        });

        provide('connectClient', client);
        provide('usersCanister', usersCanister);
        provide('keyplanCanister', keyplanCanister);
        provide('globalOutLogin', outLogin);
        provide('preloadData', preloadData);
        provide('afterLogin', afterLogin);
        provide('get_subscribes_canister', get_subscribes_canister);
        provide('get_planets_canister', get_planets_canister);
        provide('get_collections_canister', get_collections_canister);
        provide('collectionsList', collectionsList);
        provide('openLogin', openLogin);
        provide('closeLogin', closeLogin);
        provide('isOpenLogin', isOpenLogin);
        provide('setIsOpenLogin', (s: boolean) => (isOpenLogin.value = s));
        provide('refreshCyclesQuantity', refreshCyclesQuantity);

        const isShowSnsSale = ref(true)
        const closeSns = () => {
            isShowSnsSale.value = false;
        }
        return {
            currentLoginWay,
            isOpenLogin,
            client,
            route,
            store,
            keepAliveInclude,
            keepAliveExclude,
            isPrivacy,
            privacyCallback,
            isShowSnsSale,
            closeSns
        };
    },
});
</script>

<style scoped lang="less"></style>
