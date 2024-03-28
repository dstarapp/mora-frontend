import { Principal } from '@dfinity/principal';
import { ab2str, to32bits, extImageUrl } from '@/utils/functions';
import CONFIG from '@/assets/config';
import store from '@/store';
import { createActor } from '@/request/agent';
import { idlFactory as moraNFTFactory } from '@/request/canister/moraNFT.did';

export interface NFTDetails {
    index: bigint;
    canister: string;
    id?: string;
    name?: string;
    url: string;
    metadata: any;
    standard: string;
    collection?: string;
    owner?: string;
}

export const TransferNFT = async (
    to: string,
    tokenIndex: number,
    canisterId: string,
): Promise<Boolean> => {
    let agent = store.state.agent;
    if (!agent) {
        return false;
    }
    const tokenIdentifier = getTokenIdentifier(canisterId, tokenIndex);
    const from = await agent.getPrincipal();
    const dummyMemmo = new Array(32).fill(0);
    let actor = await createActor(canisterId, moraNFTFactory, store.state.agent);
    const transferResult: any = await actor.transfer({
        to: { principal: Principal.fromText(to) },
        from: { principal: from },
        token: tokenIdentifier,
        amount: BigInt(1),
        memo: dummyMemmo,
        notify: false,
        subaccount: [],
    });
    if ('err' in transferResult) {
        console.log(
            `${Object.keys(transferResult.err)[0]}: ${Object.values(transferResult.err)[0]}`,
        );
        return false;
    }
    return true;
};

export const serializeTokenData = (
    metadata: any,
    tokenIdentifier: string,
    tokenIndex: number,
    canisterId: string,
): NFTDetails => {
    let data: any = metadata.length ? metadata[0] : undefined;
    if (data) {
        data = JSON.parse(ab2str(Uint8Array.from(data)));
    }
    return {
        id: tokenIdentifier,
        index: BigInt(tokenIndex),
        canister: canisterId,
        metadata: data,
        url: extImageUrl(canisterId, tokenIndex, tokenIdentifier),
        standard: 'EXT',
    };
};

export const getTokenIdentifier = (canister: string, index: number): string => {
    const padding = Buffer.from('\x0Atid');
    const array = new Uint8Array([
        ...padding,
        ...Principal.fromText(canister).toUint8Array(),
        ...to32bits(index),
    ]);
    return Principal.fromUint8Array(array).toText();
};
