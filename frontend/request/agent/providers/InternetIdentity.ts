import { AuthClient } from '@dfinity/auth-client';
import { IdbStorage, KEY_STORAGE_DELEGATION } from '@dfinity/auth-client';
import { DelegationChain, isDelegationValid } from '@dfinity/identity';
import { Actor, ActorSubclass, HttpAgent } from '@dfinity/agent';
import type { Identity } from '@dfinity/agent';
import CONFIG from '@/assets/config';
import { ok, err } from 'neverthrow';

// const isDev = process.env['DFX_NETWORK'] !== 'ic';

class InternetIdentity {
    public meta = {
        features: [],
        id: 'ii',
        name: 'Internet Identity',
    };

    #config: {
        whitelist: Array<string>;
        host: string;
        providerUrl: string;
        dev: boolean;
    };
    #identity?: Identity;
    #principal?: string;
    #client?: AuthClient;

    get principal() {
        return this.#principal;
    }

    get identity() {
        return this.#identity;
    }

    get client() {
        return this.#client;
    }

    constructor(userConfig = {}) {
        this.#config = {
            whitelist: [],
            host: window.location.origin,
            providerUrl: 'https://identity.ic0.app',
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
                idleOptions: { disableIdle: true },
            });
        }
    }

    async init() {
        try {
            await this.init_auth();
            const isConnected = await this.isConnected();
            if (isConnected) {
                this.#identity = this.#client?.getIdentity();
                this.#principal = this.#identity?.getPrincipal().toString();
            }
            return ok({ isConnected });
        } catch (e) {
            console.error(e);
            return err({ kind: 'InitFailed' });
        }
    }

    async isConnected(): Promise<boolean> {
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

    async createActor<Service>(canisterId, idlFactory) {
        try {
            // TODO: pass identity?
            const agent = new HttpAgent({
                ...this.#config,
                identity: this.#identity,
            });

            if (this.#config.dev) {
                // Fetch root key for certificate validation during development
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
                const str: any = {
                    // TODO: local
                    identityProvider: this.#config.providerUrl,
                    maxTimeToLive: BigInt(168 * 3600000000000),
                    onSuccess: resolve,
                    onError: reject,
                };
                // getParams('debug') !== 'true' &&
                if (
                    location.hostname !== '127.0.0.1' &&
                    location.hostname !== 'localhost' &&
                    !window?.__PRIVATE_CONFIG__?.planet
                ) {
                    str.derivationOrigin = CONFIG.netlifyLink;
                }
                this.#client?.login(str);
            });
            const identity = this.#client?.getIdentity();
            const principal = identity?.getPrincipal().toString();
            this.#identity = identity;
            this.#principal = principal;
            return ok(true);
        } catch (e) {
            return err({ kind: 'ConnectFailed' });
        }
    }

    async disconnect() {
        try {
            console.log('II', 'disconnect');
            await this.#client?.logout();
            this.#client = undefined;
            return ok(true);
        } catch (e) {
            return err({ kind: 'DisconnectFailed' });
        }
    }

    async get_delegation() {
        const idbStorage: IdbStorage = new IdbStorage();
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

export { InternetIdentity };
