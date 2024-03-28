
const CONFIG = {
    env: 'test',
    isDebug: true,
    // isDebug: false,
    // meta
    isDebugReport: true,
    meta: {
        'twitter:url': '',
        'twitter:type': '',
        'twitter:title': '',
        'twitter:description': '',
    },
    compressionRatio: 0.8,
    imgMaximum: 1,
    autosavedInterval: 15,
    // autosavedInterval: 10,
    autosaveLocalHistory: 50,
    autosavedDoneInterval: 3,
    imgBaseUrl: 'https://infura-ipfs.mora.host/ipfs/',
    aes: 'B00A996A3D672E81',
    timeOut: 10000,
    editorBaseUrl: 'https://api.mora.services',
    rateBaseUrl: 'https://api.mora.services',
    homeBaseUrl: 'https://api.mora.services',
    twitterBaseUrl: 'https://apis.mora.services',
    roverMenu: [
        'roverPlanet',
        'roverPlanetSubscriptions',
        'roverCollection',
        'roverWallet',
        'roverNft',
        'roverCandy',
        'roverSetting',
    ],
    privateRoverMenu: [
        'roverPlanetSubscriptions',
        'roverCollection',
        'roverWallet',
        'roverNft',
        'roverCandy',
        'roverSetting',
    ],

    planeMenu: ['planetDashboard', 'planetContent', 'planetSubscription', 'planetPlanetSettings'],

    subscriptionWay: ['Free', 'Day30', 'Day90', 'Day180', 'Day360', 'Day1000', 'Permanent'],

    articlesPageSize: 10,

    icnamingUrl: 'https://app.icnaming.com/',

    userCanister: 'uqmfy-dqaaa-aaaai-qnkuq-cai',

    keyplanId: 'w3qlm-giaaa-aaaai-qo5pa-cai',

    icnamingId: 'fi3lu-jyaaa-aaaam-aafoa-cai',

    getIcnamingName: 'ft6xr-taaaa-aaaam-aafmq-cai',

    ledgerId: 'ryjl3-tyaaa-aaaaa-aaaba-cai',

    moraTokenLedger: 'hbjjz-kaaaa-aaaan-qiocq-cai',
    moraTokenIndex: '3kq54-gyaaa-aaaan-qiyxa-cai',

    candidUI: 'a4gq6-oaaaa-aaaab-qaa4q-cai',

    ethLoginCanister: 'r5qfe-2qaaa-aaaai-qnsqq-cai',

    metaBoxCanister: 'zbzr7-xyaaa-aaaan-qadeq-cai',

    thumbsupCanister: '2raad-niaaa-aaaai-qntma-cai',

    officialCanister: 'ljhn5-7yaaa-aaaag-qavlq-cai',

    invitationCodeCanister: 'aqww2-fiaaa-aaaai-qo6va-cai',

    nftInvitationCode: 'afrhx-eaaaa-aaaai-qo6wq-cai',

    auditCanister: 'b2zua-hyaaa-aaaai-qo6sa-cai',

    airdropCanister: 'zr4vj-aaaaa-aaaan-ql4ga-cai',

    moraNFTCanister: 'slzze-ciaaa-aaaah-aa7ra-cai',

    infinityNftCanister: 'n5yqx-uqaaa-aaaap-aatja-cai',

    nyannyanNftCanister: 'qv3zw-kqaaa-aaaap-aa27q-cai',

    '86KEYNftCanister': '2x763-hqaaa-aaaah-acupq-cai',

    magicShoujoNftCanister: 'ntmj5-jaaaa-aaaap-aamnq-cai',

    cyclesCanister: 'rkp4c-7iaaa-aaaaa-aaaca-cai',

    ckbtcCanister: 'k622s-6aaaa-aaaai-qn3ra-cai',
    ckbtcRecordsCanister: 'n5wcd-faaaa-aaaar-qaaea-cai',
    ckbtcBalance: 'mxzaz-hqaaa-aaaar-qaada-cai',

    bannerCanisterCanister: 'jatya-cyaaa-aaaan-qii7q-cai',

    addCyclesLink: 'https://k25co-pqaaa-aaaab-aaakq-cai.ic0.app/',

    metaBoxVersion: 7,

    explorerLink: 'https://icscan.io/transaction/',

    icscanLink: 'https://icscan.io/canister/',
    metaBoxLink: 'https://o6fpj-2yaaa-aaaao-aafnq-cai.ic0.app/',
    metaBoxBaseUrl: '.raw.ic0.app/file/',

    commentWordMax: 1000,
    commentWordMin: 1,

    dontWaitInit: [
        'browser',
        'browserHome',
        'browserArticle',
        'home',
        'homeTransfer',
        'homeIndex',
        'homeSearch',
        'lightHome',
        'lightDetails',
        'homeActivity',
        '404',
    ],

    orderBalanceInterval: 2000,

    indexPageLink: '',

    footerContent: '© 2023 Mora All Rights Reserved.',

    footerLink: {
        twitter: 'https://twitter.com/Mora_App',
        github: 'https://github.com/',
    },

    productionLink: ['rae74-vyaaa-aaaai-qowmq-cai.ic0.app', 'mqwfp-3aaaa-aaaai-qflia-cai.ic0.app'],
    netlifyLink: 'https://rae74-vyaaa-aaaai-qowmq-cai.ic0.app',

    noticeTimeout: 5000,

    rssLinkBaseUrl: 'https://mora.run/rss/',
    noticeCyclesDeficiency: 0.08,

    twitterShareUrl: 'https://mora.app/',

    arTxLink: 'https://viewblock.io/arweave/tx/',

    arTxSubmitLink: 'https://mora.run/ar/submit',

    payCountdownTime: 900000,

    Web3AuthICClientId:
        'BPzLWiWkd52lsQlJ2qEs7cVykYZRiKcSML_9Z2kHtFPeW7m15v6qAIMOjBH5jJsLmcGnDnv1M10CfZvSsLeWy-I',

    lightCoreManagerCanisterId: 'pwwrt-miaaa-aaaai-qo7ta-cai',
    lightAuditCanisterId: 'prxxh-bqaaa-aaaai-qo7tq-cai',
    lightExperienceManagerCanisterId: 'o4ztj-oyaaa-aaaai-qo7ua-cai',

    partnerToolCanisterId: '6s6o2-kiaaa-aaaan-qdmyq-cai',
};

export default CONFIG;
