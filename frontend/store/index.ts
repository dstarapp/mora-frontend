import { createStore } from 'vuex';
import { StateType } from './StoreTypes';
import CONFIG from '@/assets/config';
import identity, { IdentityState } from './modules/identity';
import light, { LightState } from './modules/light';
import _ from 'lodash';

export const IDENTITY = 'identity';
export const LIGHT = 'light';

const state: StateType = {
    notice_list: [],

    notice_loading: false,

    notice_state: 'OFF',

    current_plugin_editor: '',

    current_plugin_editor_args: '',

    current_plugin_editor_args_is_record: false,

    current_plugin_editor_args_idx: null,

    method_list: [],

    meta: CONFIG.meta,

    isHeader: true,

    user_principal: undefined,

    user_data: undefined,

    user_canister: '',

    current_login_way: undefined,

    planets_data: [],

    planets_loading: false,

    global_loading: false,

    wallet_address: undefined,

    wallet_balance: 0,

    ckbtc_wallet_balance: 0,

    mora_wallet_balance: 0,

    is_wallet: true,

    current_open_planet: '',

    current_planet_data: '',

    current_planet_wallet_balance: null,

    current_planet_wallet_balance_ckbtc: null,

    current_planet_wallet_address: '',

    current_planet_cycles_balance: null,

    agent: undefined,

    subscribes_loading: false,

    subscribes_data: [],

    collections_loading: true,

    theme: localStorage.getItem('theme'),

    metamask_agent_hex: '',

    local_lang: undefined,

    directory_data: [],

    images_upload_ipfs: false,

    images_upload_ipfs_error: false,

    current_identity: undefined,

    editor_ref: undefined,

    subscriptions_cache: {},

    planet_cache: {},

    comment_notice: [],

    avatar_cache: {},

    connect2ic_init_state: false,

    is_web3auth: true,

    is_light_profile_audit: -1,

    light_collect_cache: {},
    light_save_timeout: 0,
    light_save_tip: '',
    light_read_num: false,
};

const mutations = {
    SET_META(state, val) {
        state.meta = val;
    },
    SET_IS_HEADER(state, val) {
        state.isHeader = val;
    },
    SET_USER_PRINCIPAL(state, val) {
        state.user_principal = val;
    },
    SET_USER_DATA(state, val) {
        if (!val) {
            state.user_data = val;
            return;
        }
        if (typeof val.created === 'bigint') {
            val.created = Number(val.created);
        }
        if (typeof val.pid !== 'string') {
            val.pid = val.pid.toString();
        }
        state.user_data = val;
    },
    SET_USER_CANISTER(state, val) {
        state.user_canister = val;
    },
    SET_CURRENT_LOGIN_WAY(state, val) {
        state.current_login_way = val;
    },
    SET_PLANETS_DATA(state, val) {
        state.planets_data = val;
    },
    SET_PLANETS_LOADING(state, val) {
        state.planets_loading = val;
    },
    SET_WALLET_ADDRESS(state, val) {
        state.wallet_address = val;
    },
    SET_CKBTC_WALLET_ADDRESS(state, val) {
        state.ckbtc_wallet_balance = val;
    },
    SET_MORA_WALLET_ADDRESS(state, val) {
        state.mora_wallet_balance = val;
    },
    SET_WALLET_BALANCE(state, val) {
        state.wallet_balance = val;
    },
    SET_IS_WALLET(state, val) {
        state.is_wallet = val;
    },

    SET_AVATAR(state, val) {
        state.user_data.avatar = val;

        let userData = localStorage.getItem(`userData`);
        if (userData) {
            userData = JSON.parse(userData);
            if (userData) {
                const currentData = userData[`${state.user_principal}`];
                currentData.avatar = val;
            }
        }
        if (typeof userData === 'object') {
            localStorage.setItem('userData', JSON.stringify(userData));
        }
    },

    SET_CURRENT_PLANET_DATA(state, val) {
        state.current_planet_data = val;
    },

    SET_CURRENT_PLANET_WALLET_BALANCE(state, val) {
        state.current_planet_wallet_balance = val;
    },

    SET_CURRENT_PLANET_WALLET_BALANCE_CKBTC(state, val) {
        state.current_planet_wallet_balance_ckbtc = val;
    },

    SET_CURRENT_PLANET_WALLET_ADDRESS(state, val) {
        state.current_planet_wallet_address = val;
    },

    SET_CURRENT_PLANET_CYCLES_BALANCE(state, val) {
        state.current_planet_cycles_balance = val;
    },

    SET_PLANET_NAME(state, val) {
        state.current_planet_data.name = val;
    },

    SET_PLANET_DOMAIN(state, val) {
        state.current_planet_data.url = val;
    },

    SET_PLANET_AVATAR(state, val) {
        state.current_planet_data.avatar = val;
    },

    SET_PLANET_DESC(state, val) {
        state.current_planet_data.desc = val;
    },

    SET_PLANET_COVER(state, val) {
        state.current_planet_data.cover = val;
    },

    SET_PLANET_CATEGORYS(state, val) {
        state.current_planet_data.categorys = val;
    },

    SET_PLANET_TWITTER(state, val) {
        state.current_planet_data.twitter = val;
    },

    SET_PLANET_WRITERS(state, val) {
        state.current_planet_data.writers = val;
    },

    SET_PLANET_LANGUAGES(state, val) {
        state.current_planet_data.lang = val;
    },

    SET_CURRENT_OPEN_PLANET(state, val) {
        state.current_open_planet = val;
    },

    SET_AGENT(state, val) {
        state.agent = val;
    },

    DEL_PLANET_COVER(state) {
        state.current_planet_data.cover = '';
    },

    SET_SUBSCRIBES_LOADING(state, val) {
        state.subscribes_loading = val;
    },

    SET_SUBSCRIBES_DATA(state, val) {
        state.subscribes_data = val;
    },

    SET_GLOBAL_LOADING(state, val) {
        state.global_loading = val;
    },

    SET_THEME(state, val) {
        document.documentElement.className = val;
        document.querySelectorAll('#root')[0].className = val;
        localStorage.setItem('theme', val);
        state.theme = val;
    },
    SET_COLLECTIONS_LOADING(state, val) {
        state.collections_loading = val;
    },
    SET_METAMASK_AGENT_HEX(state, val) {
        state.metamask_agent_hex = val;
    },
    SET_LOCAL_LANG(state, val) {
        state.local_lang = val;
        localStorage.setItem('lang', val);
    },
    SET_DIRECTORY_DATA(state, val) {
        const arr = val.filter((item) => {
            if (item.text) {
                return item;
            }
        });
        state.directory_data = arr;
    },
    SET_IMAGES_UPLOAD_IPFS(state, val) {
        state.images_upload_ipfs = val;
    },
    SET_IMAGES_UPLOAD_IPFS_ERROR(state, val) {
        state.images_upload_ipfs_error = val;
    },

    SET_CURRENT_PLUGIN_EDITOR(state, val) {
        state.current_plugin_editor = val;
    },

    SET_CURRENT_PLUGIN_EDITOR_ARGS(state, val) {
        state.current_plugin_editor_args = val;
    },

    SET_CURRENT_PLUGIN_EDITOR_ARGS_IDX(state, val) {
        state.current_plugin_editor_args_idx = val;
    },

    SET_CURRENT_PLUGIN_EDITOR_ARGS_IS_RECORD(state, val) {
        state.current_plugin_editor_args_is_record = val;
    },

    ADD_METHOD_LIST(state, val) {
        state.method_list = val;
    },

    SORT_FORM_DATA(state, { dragIndex, newIdx }) {
        const str = state.form_data[dragIndex];
        const str2 = state.form_data[newIdx];
        state.form_data[dragIndex] = str2;
        state.form_data[newIdx] = str;
    },

    ADD_FORM_DATA(state, val) {
        if (!val && !val.id) {
            return;
        }
        state.form_data.push(val);
    },

    REMOVE_FORM_DATA(state, id) {
        state.form_data.map((item, index) => {
            if (item.id === id) {
                state.form_data.splice(index, 1);
            }
        });
    },

    EDIT_FORM_DATA(state, { formDataEditIndex, data }) {
        state.form_data[formDataEditIndex] = data;
    },

    SET_NOTICE_LIST(state, val) {
        state.notice_list = val;
    },

    ADD_NOTICE_LIST(state, val) {
        const hasTargetObj = state.notice_list.some((o) => _.isEqual(o, val));
        if (!hasTargetObj) {
            state.notice_list.push(val);
        }
    },

    SET_NOTICE_LOADING(state, val) {
        state.notice_loading = val;
    },

    SET_NOTICE_STATE(state, val) {
        state.notice_state = val;
    },

    SET_CURRENT_IDENTITY(state, val) {
        state.current_identity = val;
    },
    SET_EDITOR_REF(state, val) {
        state.editor_ref = val;
    },
    SET_SUBSCRIPTIONS_CACHE(state, val) {
        const key = Object.keys(val)[0];
        const value = Object.values(val)[0];
        if (key && value) {
            state.subscriptions_cache[key] = value;
        }
    },
    CLEAR_SUBSCRIPTIONS_CACHE(state, val) {
        state.subscriptions_cache = val;
    },
    SET_PLANET_CACHE(state, val) {
        const key = Object.keys(val)[0];
        const value = Object.values(val)[0];
        if (key && value) {
            state.planet_cache[key] = value;
        }
    },
    CLEAR_PLANET_CACHE(state, val) {
        state.planet_cache = val;
    },
    SET_COMMENT_NOTICE(state, val) {
        state.comment_notice = val;
    },
    ADD_COMMENT_NOTICE(state, val) {
        state.comment_notice.push(val);
    },
    REMOVE_COMMENT_NOTICE(state, arr) {
        const _subtractArray = (arr1, arr2) => {
            return _.differenceWith(arr1, arr2, (obj1: any, obj2: any) => {
                return obj1.aid === obj2.aid && obj1.cid === obj2.cid;
            });
        };
        const result = _subtractArray(state.comment_notice, arr);
        state.comment_notice = result;
    },
    // GET_AVATAR_CACHE(state, arr) {

    // },
    ADD_AVATAR_CACHE(state, val) {
        if (!state.avatar_cache[val.pid]) {
            state.avatar_cache[val.pid] = val.avatar;
        }
    },
    SET_CONNECT2IC_INIT_STATE(state, val) {
        state.connect2ic_init_state = val;
    },
    SET_IS_WEB3AUTH(state, val) {
        state.is_web3auth = val;
    },
    SET_IS_LIGHT_PROFILE_AUDIT(state, val) {
        state.is_light_profile_audit = val;
    },
    SET_LIGHT_COLLECT_CACHE(state, val) {
        state.light_collect_cache[val.key] = val.detailsData;
    },
    SET_LIGHT_SAVE_TIMEOUT(state, val) {
        state.light_save_timeout = val;
    },
    SET_LIGHT_SAVE_TIP(state, val) {
        state.light_save_tip = val;
    },
    SET_LIGHT_READ_NUM(state, val) {
        state.light_read_num = val;
    },
};

const actions = {

    SWITCH_THEME({ state, commit }) {
        if (state.theme === 'light') {
            commit('SET_THEME', 'dark');
        } else if (state.theme === 'dark') {
            commit('SET_THEME', 'light');
        }
    },
};

export default createStore({
    state,
    mutations,
    actions,
    modules: {

        identity,

        light: light as any,
    },
});
