const websiteName = window?.__PRIVATE_CONFIG__?.websiteName
    ? window?.__PRIVATE_CONFIG__?.websiteName
    : 'Mora';

const Other = {
    router: {
        title: {
            roverPlanet: `roverPlanet - ${websiteName}`,
            roverNft: `roverNft - ${websiteName}`,
            roverPlanetSubscriptions: `roverPlanetSubscriptions - ${websiteName}`,
            roverPlanetDetail: `roverPlanetDetail - ${websiteName}`,
            roverSubscriptions: `roverSubscriptions - ${websiteName}`,
            roverComments: `roverComments - ${websiteName}`,
            roverSetting: `roverSetting - ${websiteName}`,
            roverClaim: `roverClaim - ${websiteName}`,
            roverCollection: `roverCollection - ${websiteName}`,
            roverWallet: `roverWallet - ${websiteName}`,
            roverCandy: `roverCandy - ${websiteName}`,
            roverInscriptions: `roverInscriptions - ${websiteName}`,
            planetDashboard: `planetDashboard - ${websiteName}`,
            planetContent: `planetContent - ${websiteName}`,
            planetSubscription: `planetSubscription - ${websiteName}`,
            planetPlanetSettings: `planetPlanetSettings - ${websiteName}`,
            planetEditor: `planetEditor - ${websiteName}`,
            planetComment: `planet Article Comment - ${websiteName}`,
            browser: `Planet Loading - ${websiteName}`,
            browserArticle: `Article Loading - ${websiteName}`,
            home: `${websiteName} - Eternal Fellowship`,
            homeSearch: `Search - ${websiteName}`,
            404: `404 - ${websiteName}`,
            activity: `Invite - ${websiteName}`,
        },
    },

    utils: {
        development: 'Functional development',
        imagesCompression: {
            error: 'img maximum.',
        },
        copyText: {
            success: 'copy success',
            error: 'copy error',
        },
        pagination: {
            noMore: 'There are no more!',
        },
        avatar: {
            notImages: 'Avatar picture must be JPG format!',
            updateSuccess: 'Image uploaded successfully',
            errorImages: 'Image uploading error!',
            btns: {
                cancel: 'Cancel',
                confirm: 'Confirm',
            },
            title: 'Edit Avatar',
            adjust: 'Adjust avatar size and position',
        },
        planetError: 'The planet ID was not obtained',
        month: {
            1: 'Jan',
            2: 'Feb',
            3: 'Mar',
            4: 'Apr',
            5: 'May',
            6: 'Jun',
            7: 'Jul',
            8: 'Aug',
            9: 'Sep',
            10: 'Oct',
            11: 'Nov',
            12: 'Dec',
        },
        noAccess: 'No Access To This Planet',
        indexSuccess: 'Index setting succeeded',
        saveDraftError: 'Save draft error',
        indexedDBError: 'indexedDB init error',
        directory: 'Directory',
    },
    found: {
        tip: 'Page not found…',
        go: 'Go Home',
    },
    login: {
        title: 'Connect Web3 Identity',
        txt: 'You need to connect an Identity',
        used: 'Last used',
        cancelLogin: 'Cancel Login',
        list: {
            astrox: 'Me Wallet',
            plug: 'Plug',
            MetaMask: 'MetaMask',
            ii: 'Internet Identity',
            nfid: 'NFID',
            more: 'More',
            web3auth: 'web3auth',
            web3authTip: 'Email / Twitter / Github / Apple / Discord / ...',
        },
    },
    Authenticate: {
        title: 'Authenticate',
        subscribe: 'You subscribed to <strong>{num}</strong> planets',
        planet: 'canisters need authorization!',
        tips: 'Only after authorization can use your Principal ID to access these planets.',
        btns: {
            authenticate: 'Authenticate',
            reject: 'Reject',
        },
    },
    menu: {
        home: 'Dashboard',
        planet: 'My Planet',
        nft: 'My NFTS',
        subscribe: 'My Subscriptions',
        record: 'Subscription record',
        collection: 'My Collections',
        logout: 'Logout',
    },
    user: {
        balance: 'ICP Balance',
        t1: 'History',
        t2: 'Quick entry',
    },
    Indexing: {
        txt: 'Creating a web3 space on the blockchain that belongs to you only...',
    },

    notice: {
        title: 'Notice',
        clear: 'Clear All',
        noData: 'No Notice',
        cyclesDeficiency: ' cycles balance is insufficient.',
    },
};

export { Other };
