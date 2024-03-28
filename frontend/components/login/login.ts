import { AbstractedClientStorage } from '@astrox/sdk-core';
import { Client, createClient } from '@connect2ic/core';
import { AstroX, ICX, PlugWallet, InternetIdentity } from '@connect2ic/core/providers';
import { LocalStorage as IILocalStorage } from '@dfinity/auth-client/lib/cjs/storage';
import CONFIG from '@/assets/config';
import store from '@/store';
import { HttpAgent } from '@dfinity/agent';

let client: Client | undefined = undefined;

const init = (): Client => {
    client = ({
        // canisters: {},
        providers: [
            new InternetIdentity({
                storage: new IILocalStorage('internet-identity:'),
            }),
            new PlugWallet(),
            (window as any).icx
                ? new ICX({
                    // providerUrl: "https://ccmhe-vqaaa-aaaai-acmoq-cai.raw.ic0.app/",
                    // providerUrl: "http://localhost:8080/",
                    storage: new LocalStorage('astrox-icx:'),
                })
                : new AstroX({
                    // providerUrl: "https://ccmhe-vqaaa-aaaai-acmoq-cai.raw.ic0.app",
                    // providerUrl: "https://mqwfp-3aaaa-aaaai-qflia-cai.ic0.app",
                    delegationModes: ['domain'],
                    storage: new LocalStorage('astrox:'),
                }),
        ],
        globalProviderConfig: {
            appName: 'MoraApp',
            whitelist: CONFIG.whitelistCanister,
            dev: false,
        },
    });

    return client;
};

export const getClient = (): Client => {
    if (client === undefined) client = init();
    return client;
};

class LocalStorage implements AbstractedClientStorage {
    private prefix: string;
    constructor(prefix: string) {
        this.prefix = prefix;
    }
    get(key: string): Promise<string | null> {
        return new Promise((resolve) => {
            resolve(localStorage.getItem(this.prefix + key));
        });
    }
    set(key: string, value: string): Promise<void> {
        return new Promise((resolve) => {
            localStorage.setItem(this.prefix + key, value);
            resolve();
        });
    }
    remove(key: string): Promise<void> {
        return new Promise((resolve) => {
            localStorage.removeItem(this.prefix + key);
            resolve();
        });
    }
}
