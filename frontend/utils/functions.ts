import { Principal } from '@dfinity/principal';
import useClipboard from 'vue-clipboard3';
import { ElMessage } from 'element-plus';
import store from '@/store';
import { t } from '@/i18n';
import CONFIG from '@/assets/config';
import moment from 'moment';
import { GetAddress } from '@/utils/wallet';
import _ from 'lodash';
import bs58 from 'bs58';

const setMatchMedia = () => {
    const currentMedia = localStorage.getItem('theme');
    if (currentMedia) {
        store.commit('SET_THEME', currentMedia);
        return;
    }

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        store.commit('SET_THEME', 'dark');
    } else {
        store.commit('SET_THEME', 'light');
    }
};

const dealPid = (pid: string) => {
    if (!pid) {
        return '';
    }
    const arr = pid.split('-');
    return arr[0] + '...' + arr[arr.length - 1];
};

const copyText = async (text = '') => {
    const { toClipboard } = useClipboard();
    try {
        await toClipboard(text);
        ElMessage.success(t('utils.copyText.success'));
    } catch (e) {
        ElMessage.error(t('utils.copyText.error'));
    }
};

const getRandomArrayElements = (arr, count) => {
    if (!arr || !count) {
        return [];
    }
    let shuffled = arr.slice(0),
        i = arr.length,
        min = i - count,
        temp,
        index;
    while (i-- > min) {
        index = Math.floor((i + 1) * Math.random());
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled.slice(min);
};

const isUrl = (str) => {
    const v = new RegExp(
        '^(?!mailto:)(?:(?:http|https|ftp)://|//)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$',
        'i',
    );
    return v.test(str);
};

const scrollTop = (time) => {
    let scrollToptimer;
    scrollToptimer = setInterval(() => {
        const top = document.body.scrollTop || document.documentElement.scrollTop;
        window.scrollTo(0, top - 50);
        if (top == 0) {
            clearInterval(scrollToptimer);
        }
    }, time);
};

const scrollBottom = (time) => {
    let scrollBottomtimer;
    scrollBottomtimer = setInterval(() => {
        const top = document.body.scrollTop || document.documentElement.scrollTop;
        const nowTop = document.body.scrollTop + document.documentElement.scrollTop;
        window.scrollTo(0, top + 50);
        if (document.body.offsetHeight - window.innerHeight <= nowTop + 1) {
            clearInterval(scrollBottomtimer);
        }
    }, time);
};

const numFormat = (num = 0, digits = 1) => {
    if (!num || !digits) {
        return 0;
    }

    const si = [
        { value: 1, symbol: '' },
        { value: 1e3, symbol: 'k' },
        { value: 1e6, symbol: 'M' },
    ];
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    let i;
    for (i = si.length - 1; i > 0; i--) {
        if (num >= si[i].value) {
            break;
        }
    }
    return (num / si[i].value).toFixed(digits).replace(rx, '$1') + si[i].symbol;
};

const isPrincipalString = (maybeValid: unknown): boolean => {
    if (typeof maybeValid === 'string') {
        try {
            Principal.fromText(maybeValid);
            return true;
        } catch (_) {
            return false;
        }
    }
    return false;
};

const removeCache = () => {
    localStorage.removeItem('planetsData');
    store.commit('SET_PLANETS_DATA', []);
    store.commit('SET_USER_DATA', '');
    store.commit('SET_USER_PRINCIPAL', '');
    store.commit('SET_USER_CANISTER', '');
    store.commit('SET_WALLET_ADDRESS', '');
    store.commit('CLEAR_SUBSCRIPTIONS_CACHE', {});
    store.commit('CLEAR_PLANET_CACHE', {});
    store.commit('SET_CURRENT_IDENTITY', undefined);
    store.commit('SET_AGENT', undefined);
};

const removeCacheAll = () => {
    removeCache();
    localStorage.removeItem('theme');
    localStorage.removeItem('lang');
    localStorage.removeItem('currentLoginWay');
    localStorage.removeItem('keyplan');
    localStorage.removeItem('userData');
    localStorage.removeItem('subscribesData');
    location.reload();
};

const parseUrlParams = (url) => {
    const paramsObj = {};
    const paramsStr = url.split('?')[1];
    if (paramsStr) {
        const paramsArr = paramsStr.split('&');
        paramsArr.forEach((param) => {
            const [key, value] = param.split('=');
            paramsObj[key] = value;
        });
    }
    return paramsObj;
};

const isIPFSHashOrHttps = (str) => {
    if (str.length === 46) {
        if (str.slice(0, 2) === 'Qm') {
            try {
                const decoded = bs58.decode(str);
                if (decoded.length === 34) {
                    return true;
                }
            } catch (err) { }
        }
    }

    if (str.slice(0, 8) === 'https://' || str.slice(0, 7) === 'http://') {
        return true;
    }

    return false;
};

import defaultPlanet from '@/assets/svg/defaultPlanet.png';
const getImagesUrl = (
    link: string,
    width: undefined | number = undefined,
    height: undefined | number = undefined,
) => {
    if (!link) {
        return defaultPlanet;
    }
    let url = link.includes('https://') ? link : `${CONFIG.imgBaseUrl}${link}`;
    if (width || height) {
        url += `?`;
        if (width) {
            url += `width=${width}`;
        }
        if (height) {
            url += `${width ? '&' : ''}height=${height}`;
        }
    }
    return url;
};

const deepCopy = (data) => {
    if (data && typeof data === 'object') {
        if (typeof data === 'function') {
            const tempFunc = data.bind(null);
            tempFunc.prototype = deepCopy(data.prototype);
            return tempFunc;
        }

        switch (Object.prototype.toString.call(data)) {
            case '[object String]':
                return data.toString();
            case '[object Number]':
                return Number(data.toString());
            case '[object Boolean]':
                return new Boolean(data.toString());
            case '[object Date]':
                return new Date(data.getTime());
            case '[object Array]':
                var arr = [];
                for (let i = 0; i < data.length; i++) {
                    arr[i] = deepCopy(data[i]);
                }
                return arr;

            case '[object Object]':
                var obj = {};
                for (const key in data) {
                    obj[key] = deepCopy(data[key]);
                }
                return obj;
        }
    } else {
        return data;
    }
};

// Runtime
const getRuntime = (num) => {
    let time = Date.now() - num.toString();
    time = time / 1000 / (3600 * 24);
    const day = Number(time.toString().split('.')[0]);
    const hours = parseInt(`0.${time.toString().split('.')[1]}` * 24);
    return {
        day,
        hours,
    };
};

const goTop = () => {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    window.pageYOffset = 0;
};

const getTime = (time, type) => {
    const date = new Date(Number(time));

    if (type === 'day') {
        const day = date.getDate();
        return day;
    }

    if (type === 'month') {
        const month = date.getMonth() + 1;
        return t(`utils.month.${month}`);
    }

    if (type === 'year') {
        const year = date.getFullYear();
        return year;
    }
};

const getSetPid = (list, isPrincipal) => {
    const set = new Set();
    list.forEach((item) => {
        set.add(item.pid.toString());
        if (item.reply && item.reply.length) {
            item.reply.map((child) => {
                set.add(child.pid.toString());
            });
        }
    });
    if (isPrincipal) {
        return Array.from(set).map((item: string) => Principal.fromText(item));
    } else {
        return Array.from(set);
    }
};

const getAmount = (num, interception = 2) => {
    return _.ceil(Number(Number(num) / 10 ** 8), 4);
};

const getAmountICP = (num) => {
    const rounded = Number(num.toFixed(8));
    if (rounded === num) {
        return rounded;
    } else {
        return Number((rounded + 0.00000001).toFixed(8));
    }
};

const getExpired = (subType = '', expireTime) => {
    const time = moment(Number(expireTime)).format('MMM Do YYYY');
    if (subType === 'Free' || subType == 'Permanent') {
        return subType;
    } else {
        return time;
    }
};

const largeNumberComponent = (item): string => {
    const me = store.state.user_principal;
    try {
        const amount = Number(item.amount) / 100000000;
        if (item.to.owner.toString() === me) {
            return '+' + amount.toFixed(6);
        } else {
            if (amount === 0) {
                return '0';
            }
            return '-' + amount.toFixed(6);
        }
    } catch (err) {
        console.log(err);
        return '0';
    }
};

const format_amount = (item) => {
    const me = GetAddress();
    if (me == item.account2Address) {
        return '+' + item.amount.div(100_000_000);
    } else {
        if (item.amount.div(100_000_000).toString() === '0') {
            return 0;
        }
        return '-' + item.amount.div(100_000_000);
    }
};

const format_amount2 = (item) => {
    const me = GetAddress();
    if (me == item.account2Address) {
        return '-' + item.amount.div(100_000_000);
    } else {
        if (item.amount.div(100_000_000).toString() === '0') {
            return 0;
        }
        return '+' + item.amount.div(100_000_000);
    }
};

const format_amount_mora = (item) => {
    if (store.state.user_principal == item.from.owner.toString()) {
        return '-' + Number(item.amount) / 100_000_000;
    } else {
        if (Number(item.amount).toString() === '0') {
            return 0;
        }
        return '+' + Number(item.amount) / 100_000_000;
    }
};

const format_date = (t) => {
    return moment(t).format('HH:mm:ss DD/MM/YYYY');
};

const dataURLtoFile = (dataurl, filename) => {
    let arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
};

const isMobile = () => {
    const userAgentInfo = navigator.userAgent;

    const mobileAgents = ['Android', 'iPhone', 'SymbianOS', 'Windows Phone', 'iPad', 'iPod'];

    let mobile_flag = false;

    for (let v = 0; v < mobileAgents.length; v++) {
        if (userAgentInfo.indexOf(mobileAgents[v]) > 0) {
            mobile_flag = true;
            break;
        }
    }
    const screen_width = window.screen.width;
    const screen_height = window.screen.height;

    if (screen_width > 325 && screen_height < 750) {
        mobile_flag = true;
    }

    return mobile_flag;
};

const getPlatform = () => {
    const u = navigator.userAgent;
    return {
        isAndroid: u.indexOf('Android') > -1 || u.indexOf('Adr') > -1,
        isIos: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/),
    };
};

const imagesIsUpload = (file) => {
    if (!file.type.includes('image/') || (!!~file.type.indexOf('/heic') && !getPlatform().isIos)) {
        ElMessage.error(t('utils.avatar.notImages'));
        return false;
    } else {
        return true;
    }
};

const isPermissions = () => {
    return (
        store.state?.current_planet_data &&
        store.state?.user_data &&
        store.state?.current_planet_data?.owner.toString() === store.state?.user_data?.pid
    );
};

const uint8Array = (uint8Array) => {
    return Array.prototype.map.call(uint8Array, (x) => ('00' + x.toString(16)).slice(-2)).join('');
};

const fromHexString = (hexString) =>
    new Uint8Array(hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));

const strToHexCharCode = (str: string) => {
    if (str === '') return '';
    const hexCharCode: string[] = [];
    hexCharCode.push('0x');
    for (let i = 0; i < str.length; i++) {
        hexCharCode.push(str.charCodeAt(i).toString(16));
    }
    return hexCharCode.join('');
};

const setTDK = () => {
    for (const key in store.state.meta) {
        const value = store.state.meta[key];
        const head = document.getElementsByTagName('head');
        const dom = document.querySelector(`meta[name="${key}"]`);
        if (dom) {
            dom.remove();
        }
        const meta = document.createElement('meta');
        meta.setAttribute('name', key);
        meta.setAttribute('content', value);
        head[0].appendChild(meta);
    }
};

const byteToOther = (bytes) => {
    let n: number;
    if (typeof bytes === 'bigint') {
        n = Number(bytes);
    }

    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (n == 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(n) / Math.log(1024)));
    return Math.round(n / Math.pow(1024, i), 2) + ' ' + sizes[i];
};

const exportFile = (downloadUrl, fileName) => {
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = fileName;
    a.target = '_blank';
    a.click();
};

const ALPHANUM_REGEX = /^[a-zA-Z0-9]+$/;
const validateAccountId = (text): boolean => {
    return text.length === 64 && ALPHANUM_REGEX.test(text);
};

const getParams = (key: string) => {
    const search = window.location.search.replace(/^\?/, '');
    const pairs = search.split('&');
    const paramsMap = pairs
        .map((pair) => {
            const [key, value] = pair.split('=');
            return [decodeURIComponent(key), decodeURIComponent(value)];
        })
        .reduce((res, [key, value]) => Object.assign(res, { [key]: value }), {});
    return paramsMap[key] || '';
};

const pushDataFilterText = (str, imgBaseUrl = CONFIG.imgBaseUrl) => {

    str = str.replace(/<img[^>]*src=".*?"[^>]*>/g, (match) => {
        const srcReg = /src="(.+?)"/;
        const srcMatch = match.match(srcReg);
        if (srcMatch) {
            const src = srcMatch[1];
            if (/^Qm[a-zA-Z0-9]{44}$/.test(src)) {
                return match.replace(srcReg, `src="${imgBaseUrl}${src}"`);
            }
        }
        return match;
    });
    return str;
};

const detectLanguage = () => {
    let lang = navigator.language || navigator.userLanguage;
    lang = lang.toLowerCase();
    const languageTable = {
        en: 'en',
        'zh-cn': 'zh-cn',
        zh: 'zh-tw',
        'zh-hk': 'zh-tw',
        'zh-mo': 'zh-tw',
        'zh-sg': 'zh-tw',
        'zh-tw': 'zh-tw',
        es: 'es',
        fr: 'fr',
        de: 'de',
        ja: 'ja',
        ko: 'ko',
        ru: 'ru',
        pt: 'pt',
        it: 'it',
    };
    const languageCode = lang.split('-')[0];
    return languageTable[lang] || languageTable[languageCode] || 'en';
};

// ba2s
const ab2str = (buf: ArrayBuffer) => {
    let data = '';
    new Uint8Array(buf).forEach(function (byte: number) {
        data += String.fromCharCode(byte);
    });
    return data;
};

const to32bits = (num: number) => {
    const b = new ArrayBuffer(4);
    new DataView(b).setUint32(0, num);
    return Array.from(new Uint8Array(b));
};

const extImageUrl = (canisterId, index, tokenIdentifier) => {
    return `https://${canisterId}.raw.icp0.io/?type=thumbnail&tokenid=${tokenIdentifier}`;
};

const arraysEqual = (arr1, arr2) => {
    if (arr1.length !== arr2.length) {
        return false;
    }

    const sortedArr1 = arr1.sort();
    const sortedArr2 = arr2.sort();

    for (let i = 0; i < sortedArr1.length; i++) {
        if (sortedArr1[i] !== sortedArr2[i]) {
            return false;
        }
    }

    return true;
};

const getFileFromUrl = async (url) => {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const file = new File([blob], url.split('/').pop(), { type: blob.type });
        return file;
    } catch (error) {
        throw new Error('Unable to retrieve file from URL.');
    }
};

export {
    getFileFromUrl,
    arraysEqual,
    getParams,
    setMatchMedia,
    dealPid,
    copyText,
    getRandomArrayElements,
    isUrl,
    scrollTop,
    scrollBottom,
    numFormat,
    isPrincipalString,
    removeCache,
    getImagesUrl,
    deepCopy,
    getRuntime,
    getTime,
    getSetPid,
    getAmount,
    getAmountICP,
    getExpired,
    format_amount,
    format_date,
    dataURLtoFile,
    imagesIsUpload,
    isPermissions,
    isMobile,
    uint8Array,
    fromHexString,
    setTDK,
    goTop,
    byteToOther,
    exportFile,
    getPlatform,
    validateAccountId,
    strToHexCharCode,
    format_amount2,
    pushDataFilterText,
    detectLanguage,
    ab2str,
    to32bits,
    extImageUrl,
    removeCacheAll,
    isIPFSHashOrHttps,
    largeNumberComponent,
    format_amount_mora,
};
