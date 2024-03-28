import { AuthClient } from '@dfinity/auth-client';
import { KEY_STORAGE_DELEGATION } from '@dfinity/auth-client';
import { DelegationChain, isDelegationValid } from '@dfinity/identity';
import { Actor, ActorSubclass, HttpAgent } from '@dfinity/agent';
import { IDL } from '@dfinity/candid';
import { ok, err } from 'neverthrow';
import { NfIdDbStorage } from './db';

class NFID {
    public meta = {
        features: [],
        id: 'nfid',
        name: 'NFID',
    };

    #config: {
        whitelist: Array<string>;
        appName: string;
        host: string;
        providerUrl: string;
        dev: boolean;
    };
    #identity?: any;
    #principal?: string;
    #client?: AuthClient;

    get identity() {
        return this.#identity;
    }

    get principal() {
        return this.#principal;
    }

    get client() {
        return this.#client;
    }

    constructor(userConfig = {}) {
        this.#config = {
            whitelist: [],
            host: window.location.origin,
            providerUrl: 'https://nfid.one',
            appName: 'my-ic-app',
            dev: true,
            ...userConfig,
        };
    }

    set config(config) {
        this.#config = { ...this.#config, ...config };
    }

    get config() {
        return this.#config;
    }

    async init_auth() {
        if (this.#client == null) {
            this.#client = await AuthClient.create({
                storage: new NfIdDbStorage(),
                idleOptions: { disableIdle: true },
            });
        }
    }

    async init() {
        try {
            // TODO: pass in config or not?
            await this.init_auth();
            const isConnected = await this.isConnected();
            if (isConnected) {
                this.#identity = this.#client?.getIdentity();
                this.#principal = this.#identity.getPrincipal().toString();
            }
            return ok({ isConnected });
        } catch (e) {
            console.error(e);
            return err({ kind: 'InitFailed' });
        }
    }

    async isConnected() {
        try {
            if (!this.#client) {
                return false;
            }
            const isauth = await this.#client.isAuthenticated();
            if (!isauth) {
                return false;
            }
            const chain = await this.checkDelegationChain();
            console.log('isConnected', chain.valid && chain.delegation !== null);
            return chain.valid && chain.delegation !== null;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    async createActor<Service>(canisterId: string, idlFactory: IDL.InterfaceFactory) {
        try {
            // TODO: allow passing identity?
            const agent = new HttpAgent({
                ...this.#config,
                identity: this.#identity,
            });

            if (this.#config.dev) {
                // Fetch root key for certificate validation during development
                const res = await agent
                    .fetchRootKey()
                    .then(() => ok(true))
                    .catch((e) => err({ kind: 'FetchRootKeyFailed' }));
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
            console.error(e);
            return err({ kind: 'CreateActorFailed' });
        }
    }

    async connect() {
        try {
            await this.init_auth();
            await new Promise<void>((resolve, reject) => {
                this.#client?.login({
                    // TODO: local
                    maxTimeToLive: BigInt(168 * 3600000000000),
                    identityProvider:
                        this.#config.providerUrl +
                        `/authenticate/?applicationName=${this.#config.appName}`,
                    onSuccess: resolve,
                    onError: reject,
                });
            });
            const identity = this.#client?.getIdentity();
            const principal = identity?.getPrincipal().toString();
            // TODO: why is this check here?
            if (identity) {
                this.#identity = identity;
                this.#principal = principal;
                return ok(true);
            }
            return ok(true);
        } catch (e) {
            console.error(e);
            return err({ kind: 'ConnectFailed' });
        }
    }

    async disconnect() {
        try {
            console.log('nfid', 'disconnect');
            await this.#client?.logout();
            this.#client == undefined;
            return ok(true);
        } catch (e) {
            console.error(e);
            return err({ kind: 'DisconnectFailed' });
        }
    }

    async get_delegation() {
        const idbStorage: NfIdDbStorage = new NfIdDbStorage();
        const delegationChain: string | null = await idbStorage.get(KEY_STORAGE_DELEGATION);

        if (delegationChain === null) {
            return null;
        }
        return DelegationChain.fromJSON(delegationChain);
    }

    async checkDelegationChain() {
        const delegationChain = await this.get_delegation();
        return {
            valid: delegationChain !== null && isDelegationValid(delegationChain),
            delegation: delegationChain,
        };
    }
}

export { NFID };
