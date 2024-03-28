const Rover = {
    roverComponents: {
        header: {
            btn: 'Claim a planet!',
            loginOut: 'Logout',
        },
        menu: {
            roverPlanetSubscriptions: {
                icon: 'dy',
                name: 'My Subscriptions',
            },
            roverPlanet: {
                icon: 'planet',
                name: 'My Planet',
            },
            roverNft: {
                icon: 'nft',
                name: 'My NFTS',
            },
            roverSetting: {
                icon: 'setting',
                name: 'Setting',
            },
            roverCollection: {
                icon: 'collection',
                name: 'My Collections',
            },
            roverWallet: {
                icon: 'wallet',
                name: 'My Wallet',
            },
            roverInvite: {
                icon: 'author',
                name: 'Invite friends',
            },
            roverCandy: {
                icon: 'candy',
                name: 'Candy Box',
            },
            roverInscriptions: {
                icon: 'inscriptions',
                name: 'Inscriptions',
            },
        },
        subscriptions: {
            planetComponent: {
                article: 'Articles',
                subscribers: 'Subscribers',
                income: 'Income',
            },
        },
        record: {
            header: {
                planet: 'Planet',
                price: 'Price',
                duration: 'Duration',
                time: 'Time',
            },
        },
        owner: 'owner',
        writer: 'writer',
    },
    roverDashboard: {
        title1: 'Planet Subscriptions',
        title2: 'Subscription Record',
        title3: 'My Planet',
        noData: 'No records',
        btn: 'go to subscribe',
        transfer: 'Subscription benefits will belong to the other party after the transfer.',
        subscriptions: {
            expired: 'Expired',
            remove: 'Remove',
            renewal: 'Renewal',
            removeComponent: {
                title: 'UnSubscribe',
                text: 'After removing the subscription, your fee cannot be refunded. Please be careful!',
                confirm: 'Confirm',
                cancel: 'Cancel',
                closeLoading: 'Deleting, please wait a moment',
                closeSuccess: 'Delete the success',
            },
            record: {
                header: {
                    planet: 'Planet',
                    price: 'Price',
                    duration: 'Duration',
                    time: 'Time',
                },
            },
            transfer: {
                title: 'Transfer',
                transferSuccess: 'Transfer success',
            },
        },
        unsubplaceholder: 'Enter Planet canister ID to unsubscribe',
    },
    roverPlanet: {
        title: 'My Planet',
        norecord: 'No record',
        tips: 'Create Now！ Let your thoughts not be forgotten by the world.',
        btn: 'Claim',
        planetBtns: {
            manage: 'Manage',
            create: 'Write',
        },
    },
    roverNft: {
        title: 'My NFT',
        loading: 'Pull NFT from Canister',
        placeholder: 'NFT ID',
        address: {
            title: 'Transfer',
            address: 'Address',
            placeholder: 'Principal ID',
            aemptyValue: 'Please input the Principal ID',
            isLoadingClose: 'Please wait while it is being processed',
            pidError: 'Please enter the correct Principal ID',
            transferError: 'Transfer error',
        },
        search: {
            title: 'Please provide the ID of the Mora NFT to verify if it has been redeemed.',
            been: 'NFT has been redeemed',
            not: 'NFT is not redeemed',
        },
        btn: {
            t1: 'Claim',
            t2: 'Invitation codes',
            success: 'Successful exchange!',
            failure: 'Claim failure!',
        },
    },
    roverPlanetSubscriptions: {
        title: 'My Subscriptions',
        planet: {
            unsubTxt: 'Email notification is closed',
            unsubscribeError: 'unsubscribe Error',
            subTxt: 'Email notifications are turned on',
            emailsub: 'Email notification',
            visitTxt: 'Visit the planet',
            Expired: 'Expires',
            Unsubscribe: 'Unsubscribe',
            Renewal: 'Renewal',
            Transfer: 'Transfer',
            Comments: 'Comments',
            setEmail: 'Set up Email',
            setEmailPlaceholder: 'your email',
            setEmailSuccess: 'Email setting is successful',
            setEmailError: 'Email setup failed',
            isblack: 'You have been blocked, Please contact the planet owner.',
            order: 'Order',
        },
        comments: {
            authorReply: "Author's Reply:",
        },
    },
    roverSubscriptions: {
        title: 'Subscription Record',
        unsubscribeError: 'Please input correct canister ID!',
    },
    roverComments: {
        title: 'Comments',
        reply: 'Reply',
    },
    roverSetting: {
        title: 'Setting',
        create: 'Created at',
        address: 'Principal ID',
        email: 'Email',
        emailPlaceholder: 'Please enter a Email',
        confirm: 'Confirm',
        updates: 'After opening, the mailbox can receive subscription updates',
        web3: {
            title: 'WEB3 identity',
            add: 'Add',
            change: 'Change',
            noIdentity: 'No Identity',
        },
        identity: {
            send: 'Send the web3 identity to :',
            icnaming: 'To icnaming :',
            transfer: 'Transfer',
        },
        transfer: {
            placeholder: 'Principal ID',
            emptyError: "Please enter the other party's Principal ID",
            principalError: 'Please enter the correct one Principal ID',
            success: 'transfer success!',
        },
        language: {
            title: 'Language',
            tips: 'Select additional languages for the content you want to see on Mora.',
            btn: 'Select',
        },
        menulang: {
            title: 'Menu language',
            tips: 'Allows you to select the language in which the menu items are displayed.',
            btn: 'Select',
        },
        theme: {
            title: 'Mode',
            t1: 'light',
            t2: 'dark',
        },
        clearCache: 'Clear cache',
    },
    roverClaim: {
        title: 'Claim',
        loadingText: 'Initializing your planet, please be patient for 2-3 minutes…',
        tipLeft: 'Congratulations! you have',
        tipRight:
            'planet NFT, your planet can be set up with a Mora second Second-level domain name of 3 or more digits.',
        nowText: 'Now! Claim a planet',
        used: 'Used',
        available: 'Available: ',
        from: {
            avatar: 'Avatar',
            name: 'Planet Name',
            namePlaceholder: 'Please enter the name',
            profile: 'Planet Profile',
            profilePlaceholder: 'Please enter the profile',
            domain: 'Domain',
            domainPlaceholder: '3 digits or more',
            domainEmpty: 'Please enter the domain',
            domainError: 'Please enter the correct domain',
            address: 'Wallet Address',
            addressPlaceholder: 'Please enter the address',
            avatarError: 'Please upload your avatar.',
            invite: 'Invite Code',
            invitePlaceholder: 'Please enter the invite code',
        },
        tip: 'Please set it to the address of your usual wallet to ensure that you have control of this wallet.',
        claimBtn: 'Claim',
        claimSuccessTxt: 'Claim success',
        claimNullTxt: "You can't create more planets",
        claimErrorTxt: 'Claim Error, Cycles not enough',
        inviteCodeError: 'Invite code is invalid',
        tips: 'Read and agree to the ',
        disclaimer: {
            title: 'disclaimer',
            txt: "<p>Mora platform provides users with services for creating and interacting with smart contracts, but users are responsible for the legal liabilities of smart contract contents unrelated to Mora platform. All data, relationships, and financial information contained in the Mora Planet smart contract created by the user are fully owned and controlled by the user. Mora platform only provides technical support and services, and is not responsible for the authenticity, legality, and accuracy of user smart contract contents, and does not assume any legal liability.</p><p>Mora platform does not guarantee the legality, reliability, accuracy, completeness, and validity of the smart contract contents created by users through the platform. Users should bear full responsibility for their smart contract contents, and ensure the authenticity, legality, and accuracy of their smart contract contents. When using the Mora platform service, users should comply with all relevant laws, regulations, and provisions regarding smart contracts. If the user's smart contract contents violate any relevant laws, regulations, or provisions, the user shall bear the corresponding legal liabilities, and Mora platform will not assume any legal liability.</p><p>The smart contract contents created by users shall not contain any false, misleading, infringing, or illegal information. If any third party makes a claim against Mora platform because of the user's smart contract contents violating any laws, regulations, or provisions, the user shall bear all legal liabilities. Mora platform will not assume any responsibility for any losses or damages incurred by any third party due to user smart contract contents.</p><p>Mora platform is not responsible for any direct, indirect, incidental, or special losses or damages that users may suffer from using the platform services, including but not limited to any economic losses, property losses, business reputation losses, or data losses. Under any circumstances, Mora platform will not assume any compensation responsibility for any losses or damages suffered by users due to breach of contract, tort, negligence, etc.</p><p>Please note that this disclaimer is an agreement between Mora platform and users. If the user chooses to use the Mora platform service, it is deemed that the user has fully understood and accepted all the contents of this disclaimer.</p>",
        },
    },
    roverCollection: {
        title: 'My Collection',
        cancelTitle: 'Cancel Collection',
        txt: 'Are you sure you want to cancel your favorites?',
        btns: {
            cancelTxt: 'Cancel',
            confirmTxt: 'Confirm',
        },
        articleDataNone: 'Article has been deleted',
        unCollectionTitle: 'Warning',
    },
    roverWallet: {
        t1: 'My Wallet',
        balance: 'ICP Balance',
        ckbtcbalance: 'CKBTC Balance',
        address: 'Wallet Address',
        withdraw: 'WithDraw',
        deposit: 'Deposit',
        receive: 'Account ID / Principal ID / .IC',
        ckbtcreceive: 'Principal ID',
        quantity: 'Quantity',
        max: 'Max',
        icp: 'ICP',
        depositTxt: 'Send ICP to this address',
        ckbtcdepositTxt: 'Send CKBTC to this address',
        btns: {
            confirm: 'Confirm',
            copy: 'Copy Address',
        },
        t2: 'Transactions',
        list: {
            Type: 'Type',
            From: 'From',
            To: 'To',
            Amount: 'Amount',
            Date: 'Date',
            Detail: 'Detail',
            Explorer: 'Explorer',
        },
        manage: 'Manage',
        create: 'Create Article',
        success: 'Withdrawal success',
        error: 'Withdrawal error',
        addressError: 'Invalid principal id or address id',
        principalExist: 'principal ID no exist',
        deposits: {
            t1: 'Send ICP to this address',
            t2: 'Send ICP to this address',
            t3: 'Deposit record',
        },
        withdraws: {
            t1: 'Currency withdrawn',
            t2: 'Withdrawal quantity',
            t3: 'Withdrawals record',
        }
    },
    roverCandy: {
        title: 'Candy Box',
        used: 'used',
        invite: 'Invite Code',
        nodata: 'No invitation code',
    },
    roverInscriptions: {
        title: 'Inscriptions',
        nodata: 'No Inscriptions',
        button: {
            t1: 'Approve',
            t2: 'Cancel Transfer',
            t3: 'Transfer',
            t4: 'Split'
        },
        tab: {
            t1: 'My inscriptions',
            t2: 'History'
        },
        placeholder: {
            transfer: 'Please fill in the price'
        },
        split: {
            title: 'Amount Split'
        },
        history: {
            inscription: 'Inscription',
            coin: 'Coin',
            amount: 'Amount',
            from: 'From',
            to: 'To',
            time: 'Time'
        }
    },
    subOrder: {
        title: 'Order list',
        header: {
            h1: 'Order ID',
            h2: 'Create Time',
            h3: 'Order amount(icp)',
            h4: 'Paid(icp)',
            h5: 'Types',
            h6: 'Operations',
        },
        orderStatus: {
            success: 'Success',
            void: 'Invalid',
            refund: 'Refund',
            refunded: 'Refunded',
        },
        refundFailure: 'Refund failure',
        btn: {
            b1: 'refund',
            b2: 'success',
        },
    },
    subrefund: {
        title: 'Refund',
    },
    clear: {
        title: 'Clear cache',
        txt: 'Are you sure to clear the site cache?',
        btn: {
            cancel: 'Cancel',
            confirm: 'Confirm',
        },
    },
    getcode: {
        title: 'Get invitation code',
        attention: 'An account can only be obtained once',
        btn: 'Get Code',
        stxt: 'You have obtained 1 invitation code',
    },
};

export { Rover };
