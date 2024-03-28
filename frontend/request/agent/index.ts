import { Actor, hash, HttpAgent } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { idlFactory as eth_ic_did } from '@/request/canister/eth_ic.did';
import { idlFactory as ethLoginFactory } from '@/request/canister/ethLogin.did';
import sha3 from 'js-sha3';
import store, { IDENTITY } from '@/store';
import { SET_LOADING } from '@/store/modules/identity';
import { uint8Array, fromHexString } from '@/utils/functions';
import CONFIG from '@/assets/config';
import { utils as ethersUtils } from 'ethers';

export const handleIdentityAgent = (identity) => {
    return new HttpAgent({ identity, host: 'https://icp0.io' });
};

export const createActor = (
    canisterId,
    idlFactory,
    agent = new HttpAgent({ host: 'https://icp0.io/' }),
) => {
    if (!agent) {
        agent = new HttpAgent({ host: 'https://icp0.io/' });
    }
    return Actor.createActor(idlFactory, {
        agent,
        canisterId,
    });
};

export const restoreMetamaskAgent = async (hex) => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const array_32 = fromHexString(hex);
    const identity = Ed25519KeyIdentity.generate(array_32);
    const agent = new HttpAgent({ identity, host: 'https://icp0.io' });
    store.commit('SET_CURRENT_IDENTITY', identity);
    const actor = createActor('3scra-gyaaa-aaaah-abqxq-cai', eth_ic_did, agent);
    const binded = await actor.getPrincipalByEthAddress(accounts[0]);
    if (binded.length === 0) {
        actor.bindPrincipalWithEthAddress(accounts[0]);
        return agent;
    } else if (binded[0].toString() !== identity.getPrincipal().toString()) {
        store.dispatch(`${IDENTITY}/${SET_LOADING}`, false);
        return false;
    } else {
        return agent;
    }
};

export const getMetamaskByEth = async () => {
    store.dispatch(`${IDENTITY}/${SET_LOADING}`, true);
    const ethLogin = await createActor(CONFIG.ethLoginCanister, ethLoginFactory);
    try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const binded = await ethLogin.getPrincipalByEth(accounts[0]);
        store.dispatch(`${IDENTITY}/${SET_LOADING}`, false);
        return {
            binded: binded[0],
            accounts: accounts[0],
        };
    } catch (err) {
        store.dispatch(`${IDENTITY}/${SET_LOADING}`, false);
        return false;
    }
};

export const handleMetamaskAgent = async (secret) => {
    store.dispatch(`${IDENTITY}/${SET_LOADING}`, true);
    const message =
        'SIGN THIS MESSAGE TO LOGIN TO MORA ON THE INTERNET COMPUTER.\n\n' +
        `HASH SECRET:\n
  0x${sha3.sha3_512(secret)}`;
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    let signature;
    try {
        signature = await window.ethereum.request({
            method: 'personal_sign',
            params: [message, accounts[0]],
        });
    } catch (err) {
        store.dispatch(`${IDENTITY}/${SET_LOADING}`, false);
        return false;
    }
    const hashed = sha3.keccak_256(
        Uint8Array.from(Buffer.from(signature.replace('0x', ''), 'hex')),
    );
    const array_32 = Uint8Array.from(Buffer.from(hashed, 'hex'));
    const identity = Ed25519KeyIdentity.generate(array_32);
    store.commit('SET_CURRENT_IDENTITY', identity);
    const loginMessageHash = ethersUtils.hashMessage(message);

    const agent = new HttpAgent({ identity, host: 'https://icp0.io' });
    const ethLogin = await createActor(CONFIG.ethLoginCanister, ethLoginFactory, agent);
    try {
        const binded = await ethLogin.getPrincipalByEth(accounts[0]);
        if (!binded.length) {
            const res = await ethLogin.linkAddress(loginMessageHash, signature);
            if (res) {
                localStorage.setItem('metamaskAgent', uint8Array(array_32));
                store.commit('SET_METAMASK_AGENT_HEX', uint8Array(array_32));
                store.dispatch(`${IDENTITY}/${SET_LOADING}`, false);
                return agent;
            } else {
                return false;
            }
        } else if (binded[0].toString() !== identity.getPrincipal().toString()) {
            store.dispatch(`${IDENTITY}/${SET_LOADING}`, false);
            return false;
        } else {
            localStorage.setItem('metamaskAgent', uint8Array(array_32));
            store.commit('SET_METAMASK_AGENT_HEX', uint8Array(array_32));
            store.dispatch(`${IDENTITY}/${SET_LOADING}`, false);
            return agent;
        }
    } catch {
        store.dispatch(`${IDENTITY}/${SET_LOADING}`, false);
        return false;
    }
};
