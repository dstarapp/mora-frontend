
const CONFIG = {
    env: 'ic',
    // isDebug: true,
    isDebug: false,
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
    autosaveLocalHistory: 50,
    autosavedDoneInterval: 3,
    imgBaseUrl: 'https://infura-ipfs.mora.host/ipfs/',
    aes: 'B00A996A3D672E81',
    timeOut: 10000,
    editorBaseUrl: 'https://apis.mora.services',
    rateBaseUrl: 'https://apis.mora.services',
    homeBaseUrl: 'https://apis.mora.services',
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

    keyplanId: '5jok2-jqaaa-aaaan-qda5a-cai',

    icnamingId: 'fi3lu-jyaaa-aaaam-aafoa-cai',

    getIcnamingName: 'ft6xr-taaaa-aaaam-aafmq-cai',

    ledgerId: 'ryjl3-tyaaa-aaaaa-aaaba-cai',
    // mora token
    moraTokenLedger: 'hbjjz-kaaaa-aaaan-qiocq-cai',
    moraTokenIndex: '3kq54-gyaaa-aaaan-qiyxa-cai',
    // candid ui 
    candidUI: 'a4gq6-oaaaa-aaaab-qaa4q-cai',
    // eth login
    ethLoginCanister: 'r5qfe-2qaaa-aaaai-qnsqq-cai',
    // metaBox
    metaBoxCanister: 'zbzr7-xyaaa-aaaan-qadeq-cai',
    // like
    thumbsupCanister: '5vkql-6qaaa-aaaan-qda7a-cai',
    // verify
    officialCanister: 'ljhn5-7yaaa-aaaag-qavlq-cai',
    // invite
    invitationCodeCanister: '54j3x-iyaaa-aaaan-qda6q-cai',
    // nft invite
    nftInvitationCode: 'r75hv-4qaaa-aaaan-qdbta-cai',
    // check
    auditCanister: 'ry4bb-riaaa-aaaan-qdbtq-cai',
    // airdrop
    airdropCanister: 'zr4vj-aaaaa-aaaan-ql4ga-cai',
    // mora nft
    moraNFTCanister: 'slzze-ciaaa-aaaah-aa7ra-cai',
    // infinity nft
    infinityNftCanister: 'n5yqx-uqaaa-aaaap-aatja-cai',
    // nyannyan nft
    nyannyanNftCanister: 'qv3zw-kqaaa-aaaap-aa27q-cai',
    // 86DAO nft
    '86KEYNftCanister': '2x763-hqaaa-aaaah-acupq-cai',
    // magicShoujo nft
    magicShoujoNftCanister: 'ntmj5-jaaaa-aaaap-aamnq-cai',
    // cycles 
    cyclesCanister: 'rkp4c-7iaaa-aaaaa-aaaca-cai',
    // ckbtc 
    ckbtcCanister: 'k622s-6aaaa-aaaai-qn3ra-cai',
    ckbtcRecordsCanister: 'n5wcd-faaaa-aaaar-qaaea-cai',
    ckbtcBalance: 'mxzaz-hqaaa-aaaar-qaada-cai',
    // get wallet list
    bannerCanisterCanister: 'jatya-cyaaa-aaaan-qii7q-cai',
    // addCycles
    addCyclesLink: 'https://k25co-pqaaa-aaaab-aaakq-cai.ic0.app/',
    // metaBox version
    metaBoxVersion: 7,
    // trade
    explorerLink: 'https://icscan.io/transaction/',
    // icscan
    icscanLink: 'https://icscan.io/canister/',
    metaBoxLink: 'https://o6fpj-2yaaa-aaaao-aafnq-cai.ic0.app/',
    metaBoxBaseUrl: '.raw.ic0.app/file/',
    // comment
    commentWordMax: 1000,
    commentWordMin: 1,
    // do not need pop router
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
    productionLink: ['rr7k5-haaaa-aaaan-qdbsa-cai.ic0.app'],
    netlifyLink: 'https://rr7k5-haaaa-aaaan-qdbsa-cai.ic0.app',
    noticeTimeout: 5000,
    rssLinkBaseUrl: 'https://mora.news/rss/',
    noticeCyclesDeficiency: 0.08,
    twitterShareUrl: 'https://mora.app/',
    // arTx link
    arTxLink: 'https://viewblock.io/arweave/tx/',
    // ar
    arTxSubmitLink: 'https://mora.news/ar/submit',
    payCountdownTime: 900000,
    // web3 login
    Web3AuthICClientId:
        'BPzLWiWkd52lsQlJ2qEs7cVykYZRiKcSML_9Z2kHtFPeW7m15v6qAIMOjBH5jJsLmcGnDnv1M10CfZvSsLeWy-I',
    lightCoreManagerCanisterId: 'pwwrt-miaaa-aaaai-qo7ta-cai',
    lightAuditCanisterId: 'prxxh-bqaaa-aaaai-qo7tq-cai',
    lightExperienceManagerCanisterId: 'o4ztj-oyaaa-aaaai-qo7ua-cai',
    partnerToolCanisterId: '6s6o2-kiaaa-aaaan-qdmyq-cai',
};

export default CONFIG;
