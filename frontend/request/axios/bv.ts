import { editorPost, rateGet, homePost, homeGet, twitterGet } from './http';
import Api from './api';

const cardInfo = (param = {}) => editorPost(Api.getCardInfo, { ...param }, {});

const getRate = (param = {}) => rateGet(Api.getRate, { ...param });

const getHomeList = (param = {}) => homePost(Api.top, { ...param }, {});

const getHomeSearch = (param = {}) => homeGet(Api.search, { ...param });

const getFeedList = (param = {}) => homePost(Api.feed, { ...param }, {});

const getPlanetIdFromPid = (param = {}) => homePost(Api.income, { ...param }, {});

const saveLog = (param = {}) => homePost(Api.log, { ...param }, {});

const article = (param = {}) => homePost(Api.article, { ...param }, {});

const statistical = (param = {}) => homePost(Api.statistical, { ...param }, {});

const compression = (param = {}) => editorPost(Api.compression, { ...param }, {});

const getCanister = (param = {}) => homePost(Api.canister, { ...param }, {});

const uniquecode = (param = {}) => twitterGet(Api.uniquecode, { ...param });

const verification = (param = {}) => twitterGet(Api.verification, { ...param });

const getInvitationCode = (param = {}) => twitterGet(Api.getCode, { ...param });

export {
    cardInfo,
    getRate,
    getHomeList,
    getHomeSearch,
    getFeedList,
    saveLog,
    article,
    statistical,
    compression,
    getCanister,
    uniquecode,
    verification,
    getPlanetIdFromPid,
    getInvitationCode,
};
