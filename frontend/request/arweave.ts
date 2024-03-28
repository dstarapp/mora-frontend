import CONFIG from '@/assets/config';
import {
    DelegationIdentity,
    Ed25519KeyIdentity,
    Ed25519PublicKey,
    Secp256k1KeyIdentity,
} from '@dfinity/identity';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import secp256k1 from 'secp256k1';
import Arweave from 'arweave';
import moment from 'moment';
import store from '@/store';

const http = axios.create({
    timeout: CONFIG.timeOut * 3,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
    },
});

export type ArweaveData = {
    planet: string;
    id: string;
    created: string;
    content: {
        body: string;
        timestamp: string;
        title: string;
    };
    digest: string;
    authorship: {
        contributor: string;
        identity: {
            publicKey?: string;
            delegation?: string;
        };
        algorithm: {
            hash: 'SHA-256';
            name: 'ECDSA';
            curve: 'secp256k1';
        };
        authorshipPublicKey: string;
        authorshipMessage: string;
        authorshipSignature: string;
        signature: string;
    };
};

export const submitArticleToArweave = async (
    identity: Ed25519KeyIdentity | DelegationIdentity,
    planet: string,
    id: string,
    created: string,
    content: {
        body: string;
        timestamp: string;
        title: string;
    },
    // secp256k1Key = Secp256k1KeyIdentity.generate();
    // { publicKey: secp256k1Key.toJSON()[0], secretKey: secp256k1Key.toJSON()[1]}
    secp256k1Key: {
        publicKey: string;
        secretKey: string;
    },
    message: string, // `I authorize publishing on Mora from this device using: ${publicKey}`;
): Promise<
    | {
        code: 0;
        data: string; // tx id
        message?: string;
    }
    | { code: number; data?: undefined; message: string }
> => {

    const contributor = identity.getPrincipal().toText();
    const contentJson = JSON.stringify({
        body: content.body,
        timestamp: content.timestamp,
        title: content.title,
    });
    const digest = CryptoJS.SHA256(contentJson).toString();

    const publicKey = secp256k1Key.publicKey;
    const secretKey = secp256k1Key.secretKey;
    const authorshipSignature = Buffer.from(
        await identity.sign(Buffer.from(message, 'utf-8')),
    ).toString('hex');
    const signature = Buffer.from(
        secp256k1.ecdsaSign(Buffer.from(digest, 'hex'), Buffer.from(secretKey, 'hex')).signature,
    ).toString('hex');

    const data: ArweaveData = {
        planet,
        id,
        created,
        content: {
            body: content.body,
            timestamp: content.timestamp,
            title: content.title,
        },
        digest,
        authorship: {
            contributor,
            identity: !identity['getDelegation']
                ? {
                    publicKey: Buffer.from(
                        Ed25519PublicKey.fromDer(identity.getPublicKey().toDer()).toRaw(),
                    ).toString('hex'),
                }
                : {
                    delegation: JSON.stringify(
                        (identity as DelegationIdentity).getDelegation().toJSON(),
                    ),
                },
            algorithm: {
                hash: 'SHA-256',
                name: 'ECDSA',
                curve: 'secp256k1',
            },
            authorshipPublicKey: publicKey,
            authorshipMessage: message,
            authorshipSignature,
            signature,
        },
    };

    let r = await http.post(CONFIG.arTxSubmitLink, {
        contributor,
        planet,
        id,
        data,
    });

    if (r.status === 200) {
        return r.data;
    }

    return {
        code: 1,
        message: r.statusText,
    };
};

export const getArweaveByArticleId = async (aid: string, pid: string) => {
    let arweave = Arweave.init({
        host: 'ar-io.dev',
        port: 443,
        protocol: 'https',
        timeout: 20000,
        logging: false,
    });

    if (!arweave) {
        return;
    }

    const endpoint = '/graphql';

    const query = `
            query {
                transactions(tags: [
                    {name: "Id", values: ["${aid}"]},
                    {name: "App", values: ["Mora"]},
                    {name: "Planet", values: ["${pid}"]}
                ]){
                    edges {
                    node {
                        id
                        block {
                        timestamp
                        }
                    }
                    }
                }
            }
        `;

    const res = await arweave.api.post(endpoint, { query });
    if (!res.data || !res.data.data.transactions) {
        return [];
    }

    let list = res.data.data.transactions.edges;
    if (!list.length) {
        return [];
    }
    let arr = list.map((item) => {
        let i = item.node;
        if (i?.block?.timestamp) {
            i.timestamp = moment(i.block.timestamp * 1000).format('MMMM Do YYYY, h:mm:ss a');
        }
        return item.node;
    });
    return arr;
};

export const openArTx = (txid: string) => {
    if (!txid) {
        return;
    }

    window.open(`${CONFIG.arTxLink}${txid}`);
};
