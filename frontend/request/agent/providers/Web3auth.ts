import type { IConnector, IWalletConnector, CreateActorResult } from '@connect2ic/core';
// @ts-ignore
import maskLogoLight from '@/assets/svg/logo-metamask.svg';
// @ts-ignore
import maskLogoDark from '@/assets/svg/logo-metamask.svg';

import { IDL } from '@dfinity/candid';
import { Actor, HttpAgent } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { ok, err } from 'neverthrow';
import { ConnectError, CreateActorError, DisconnectError, InitError } from '@connect2ic/core';
import { Web3AuthNoModal } from '@web3auth/no-modal';
import { CommonPrivateKeyProvider } from '@web3auth/base-provider';
import { WALLET_ADAPTERS, CHAIN_NAMESPACES, ADAPTER_STATUS } from '@web3auth/base';
import { OpenloginAdapter } from '@web3auth/openlogin-adapter';
import sha3 from 'js-sha3';
import store, { IDENTITY } from '@/store';
import { SET_LOADING } from '@/store/modules/identity';

class Web3AuthIC implements IConnector {
    public meta = {
        features: ['wallet'],
        icon: {
            light: maskLogoLight,
            dark: maskLogoDark,
        },
        id: 'web3auth',
        name: 'Web3auth IC',
    };

    #config: {
        whitelist: Array<string>;
        host: string;
        dev: boolean;
        clientId: string;
        loginInfo: any;
        onConnectionUpdate: () => void;
    };
    #identity?: any;
    #principal?: string;
    #web3?: Web3AuthNoModal;
    // #provider?: SafeEventEmitterProvider;

    get identity() {
        return this.#identity;
    }

    get principal() {
        return this.#principal;
    }

    get web3() {
        return this.#web3;
    }

    constructor(userConfig = {}) {
        this.#config = {
            whitelist: [],
            host: window.location.origin,
            dev: true,
            clientId: '',
            loginInfo: {},
            onConnectionUpdate: () => { },
            ...userConfig,
        };
    }

    set config(config) {
        this.#config = { ...this.#config, ...config };
    }

    get config() {
        return this.#config;
    }

    setLogin(data: any) {
        this.#config.loginInfo = data;
    }

    async init() {
        // TODO: handle account switching
        try {
            const chainConfig = {
                chainId: '0x01',
                rpcTarget: 'https://dashboard.internetcomputer.org',
                chainNamespace: CHAIN_NAMESPACES.OTHER,
                displayName: 'Internet Computer Mainnet',
                blockExplorer: 'https://dashboard.internetcomputer.org',
                ticker: 'ICP',
                tickerName: 'Internet Computer',
            };
            const privateKeyProvider = new CommonPrivateKeyProvider({
                config: {
                    chainConfig: chainConfig,
                },
            });

            this.#web3 = new Web3AuthNoModal({
                clientId: this.#config.clientId, // Get your Client ID from Web3Auth Dashboard
                chainConfig: chainConfig,
                web3AuthNetwork: 'mainnet',
            });

            const openloginAdapter = new OpenloginAdapter({
                privateKeyProvider,
            });
            this.#web3.configureAdapter(openloginAdapter);

            // await this.#web3.init();
            // let isConnected = false;
            // await Promise.race([
            //     this.#web3.init(),
            //     new Promise((resolve, reject) => {
            //         setTimeout(() => {
            //             if (!isConnected) {
            //                 store.commit('SET_IS_WEB3AUTH', false);
            //                 reject(new Error('web3Auth Connection timeout'));
            //             }
            //         }, 5000);
            //     }),
            // ]);
            // isConnected = true;

            if (this.#web3.provider) {
                await this.init_identity();
                return ok({ isConnected: true });
            }

            return ok({ isConnected: false });
        } catch (e) {
            console.log(e);
            return err({ kind: InitError.InitFailed });
        }
    }

    async isConnected() {
        try {
            if (this.#web3 && this.#web3.provider) {
                return true;
            }
        } catch (e) {
            return false;
        }
        return false;
    }

    async createActor<Service>(canisterId: string, idlFactory: IDL.InterfaceFactory, config?: {}) {
        try {
            // TODO: pass identity?
            const agent = new HttpAgent({
                ...this.#config,
                identity: this.#identity,
            });
            if (this.#config.dev) {
                // Fetch root key for certificate validation during development
                const res = await agent
                    .fetchRootKey()
                    .then(() => ok(true))
                    .catch((e) => err({ kind: CreateActorError.FetchRootKeyFailed }));
                if (res.isErr()) {
                    return res;
                }
            }
            // TODO: add actorOptions?
            const actor = Actor.createActor<Service>(idlFactory, {
                agent,
                canisterId,
            });
            return ok(actor);
        } catch (e) {
            return err({ kind: CreateActorError.CreateActorFailed });
        }
    }

    async connect() {
        try {
            if (!this.#web3) {
                return err({ kind: ConnectError.NotInitialized });
            }
            await this.disconnect();

            // await this.#web3.initModal()
            if (this.#web3.status == ADAPTER_STATUS.NOT_READY) {
                await this.#web3.init();
            }
            await this.#web3.connectTo(WALLET_ADAPTERS.OPENLOGIN, this.#config.loginInfo);
            //this.#principal = (await this.#ic.getPrincipal()).toString()
            // if (this.#principal) {
            //   return ok(true)
            // }
            if (!this.#web3.provider) {
                return err({ kind: ConnectError.ConnectFailed });
            }

            await this.init_identity();
            return ok(true);
        } catch (e) {
            console.log(e);
            store.dispatch(`${IDENTITY}/${SET_LOADING}`, false);
            return err({ kind: ConnectError.ConnectFailed });
        }
    }

    async disconnect() {
        try {
            if (!this.#web3) {
                return err({ kind: DisconnectError.NotInitialized });
            }
            // TODO: should be awaited but never finishes, tell Plug to fix
            // this.#eth.disconnect()
            await this.#web3.logout();
            return ok(true);
        } catch (e) {
            return err({ kind: DisconnectError.DisconnectFailed });
        }
    }

    async init_identity() {
        if (!this.#web3 || !this.#web3.provider) {
            return;
        }
        const privateKey = await this.#web3.provider.request({
            method: 'private_key',
        });
        const hashed = sha3.keccak_256(Uint8Array.from(Buffer.from(privateKey as string, 'hex')));
        const array_32 = Uint8Array.from(Buffer.from(hashed, 'hex'));
        this.#identity = Ed25519KeyIdentity.generate(array_32);
        this.#principal = this.#identity.getPrincipal();
    }

    async restore() {
        try {
            if (!this.#web3) {
                return false;
            }
            await this.#web3.init();

            if (this.#web3.provider) {
                await this.init_identity();
                if (this.#identity && this.#principal) {
                    const agent = await new HttpAgent({
                        identity: this.#identity,
                        host: 'https://icp0.io',
                    });
                    store.commit('SET_AGENT', agent);
                    return ok({ isConnected: true });
                } else {
                    return ok({ isConnected: false });
                }
            }
            return ok({ isConnected: false });
        } catch (e) {
            return err({ kind: InitError.InitFailed });
        }
    }
}

export { Web3AuthIC };
