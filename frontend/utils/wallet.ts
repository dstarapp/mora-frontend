import { Principal } from '@dfinity/principal';
import { getCrc32 } from '@dfinity/principal/lib/cjs/utils/getCrc';
import { sha224 } from '@dfinity/principal/lib/cjs/utils/sha224';
import RosettaApi from '@/request/axios/rosetta';
import store from '@/store';
import CONFIG from '@/assets/config';
import { isPrincipalString } from '@/utils/functions';
import _ from 'lodash';
import { idlFactory as ledgerFactory } from '@/request/canister/ledger.did';
import { SendArgs, NotifyCanisterArgs } from '@/request/canister/ledger.int';
import { createActor } from '@/request/agent';
import debug from '@/utils/debug';
import { idlFactory as ckbtcBalanceFactory } from '@/request/canister/ckbtcBalance.did';
import { idlFactory as moraTokenLedger } from '@/request/canister/moraTokenLedger.did';

import { GetCycleActor } from './cycle';
import { AccountIdentifier, SubAccount } from './account';

const rosettaApi = new RosettaApi();
export const PRINCIPAL_REGEX = /(\w{5}-){10}\w{3}/;
export const ALPHANUM_REGEX = /^[a-zA-Z0-9]+$/;
let _balance = 0.0;
let _icp2sdr = 1.0;

export const to32bits = (num: number) => {
    const b = new ArrayBuffer(4);
    new DataView(b).setUint32(0, num);
    return Array.from(new Uint8Array(b));
};

export const get_sub_account_array = (index) => {
    return new Uint8Array(Array(28).fill(0).concat(to32bits(index)));
};

export const fromHexString = (hexString) => {
    return Uint8Array.from(hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
};

export const addCrc32 = (buf) => {
    const crc32Buf = Buffer.alloc(4);
    crc32Buf.writeUInt32BE(getCrc32(buf), 0);
    return Buffer.concat([crc32Buf, buf]);
};

export const get_account_id = (principal: string, id = 0): string => {
    const subaccount = Buffer.from(get_sub_account_array(id));
    const acc_buf = Buffer.from('\x0Aaccount-id');
    const pri_buf = Buffer.from(Principal.fromText(principal).toUint8Array());

    const buff = Buffer.concat([acc_buf, pri_buf, subaccount]);

    const sha = sha224(buff);
    const aId = Buffer.from(sha);

    return addCrc32(aId).toString('hex');
};

export const toHexString = (bytes: Uint8Array) => {
    return bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
};

export const InitWallet = async (principal) => {
    return await LoadBalance(principal);
};

export const InitWalletCkBtc = async (principal, subaccount: Uint8Array[] | [] = []) => {
    store.commit('SET_CKBTC_WALLET_ADDRESS', 0);
    const ledgerActor = await createActor(CONFIG.ckbtcBalance, ckbtcBalanceFactory);
    const balance = await ledgerActor.icrc1_balance_of({
        owner: Principal.fromText(principal),
        subaccount: subaccount,
    });
    const _balance = Number(balance) / 10 ** 8;
    store.commit('SET_CKBTC_WALLET_ADDRESS', _balance);
    return _balance;
};

export const InitWalletMora = async (principal, subaccount: Uint8Array[] | [] = []) => {
    store.commit('SET_MORA_WALLET_ADDRESS', 0);
    const ledgerActor = await createActor(CONFIG.moraTokenLedger, moraTokenLedger);
    const balance = await ledgerActor.icrc1_balance_of({
        owner: Principal.fromText(principal),
        subaccount: subaccount,
    });
    const _balance = Number(balance) / 10 ** 8;
    store.commit('SET_MORA_WALLET_ADDRESS', _balance);
    return _balance;
};

export const LoadBalance = async (principal): Promise<number | boolean> => {
    store.commit('SET_WALLET_BALANCE', 0);
    const address = get_account_id(principal);
    store.commit('SET_WALLET_ADDRESS', address);
    // const balance = await rosettaApi.getAccountBalance(address);
    const ledgerActor = await createActor(CONFIG.ledgerId, ledgerFactory, store.state.agent);
    const balance = await ledgerActor.account_balance({
        account: fromHexString(address),
    });
    _balance = Number(balance.e8s) / 10 ** 8;
    store.commit('SET_WALLET_BALANCE', _balance);
    return _balance;
};

export const getBalance = async (address = store.state.wallet_address, isMain = true) => {
    const ledgerActor = await createActor(CONFIG.ledgerId, ledgerFactory, store.state.agent);
    const _balance: any = await ledgerActor.account_balance({
        account: fromHexString(address),
    });
    const num = Number(_balance.e8s) / 10 ** 8;
    if (isMain) {
        store.commit('SET_WALLET_BALANCE', num);
    } else {
        store.commit('SET_CURRENT_PLANET_WALLET_BALANCE', num);
    }
    return num;
};

export const getAccountBalance = async (address) => {
    const ledgerActor = await createActor(CONFIG.ledgerId, ledgerFactory, store.state.agent);
    const _balance: any = await ledgerActor.account_balance({
        account: address,
    });
    return Number(_balance.e8s) / 10 ** 8;
};

export const LoadTransaction = async (address = store.state.user_principal) => {
    if (!address) {
        return;
    }
    let paramet;
    if (isPrincipalString(address)) {
        paramet = get_account_id(address);
    } else {
        paramet = address;
    }
    const transactions = await rosettaApi.getTransactionsByAccount(paramet);
    if (!transactions) {
        return [];
    }
    transactions.sort((a, b) => {
        return b.timestamp.getTime() - a.timestamp.getTime();
    });
    return transactions;
};

export const GetAddress = (): string => {
    const pid = store.state.user_principal;
    if (!pid) {
        return '';
    }
    return get_account_id(pid);
};

export const isValidPrincipal = (text: string): boolean => {
    return Principal.fromText(text).toText() === text;
};

export const validatePrincipalId = (text: string): boolean => {
    try {
        return Boolean(PRINCIPAL_REGEX.test(text) && isValidPrincipal(text));
    } catch (e) {
        return false;
    }
};

export const validateAccountId = (text): boolean => {
    return text.length === 64 && ALPHANUM_REGEX.test(text);
};

export interface SendOpts {
    fee?: bigint;
    memo?: bigint;
    from_subaccount?: number;
}

export const TransferICP = async (
    addr: string,
    amount: bigint,
    opts: SendOpts,
    methodPayment = store.state.current_login_way,
): Promise<bigint | boolean> => {
    const defaultArgs = {
        fee: BigInt(10_000),
        memo: BigInt(0),
    };
    let ledgerActor;
    if (methodPayment === 'plug') {
        ledgerActor = await window.ic.plug.createActor({
            canisterId: CONFIG.ledgerId,
            interfaceFactory: ledgerFactory,
        });
    } else {
        ledgerActor = await createActor(CONFIG.ledgerId, ledgerFactory, store.state.agent);
    }
    if (ledgerActor == null) {
        throw new Error('ledgerActor is null');
    }

    if (!validatePrincipalId(addr)) {
        if (!validateAccountId(addr)) {
            throw new Error('Invalid principal id or address id');
        }
    } else {
        addr = get_account_id(addr);
    }
    const args: SendArgs = {
        to: addr,
        amount: { e8s: amount },
        fee: { e8s: opts?.fee || defaultArgs.fee },
        memo: opts?.memo ? opts.memo : defaultArgs.memo,
        from_subaccount: [],
        created_at_time: [],
    };
    const height = await ledgerActor.send_dfx(args);
    if (methodPayment === 'plug') {
        return height;
    } else {
        try {
            const res = BigInt(height);
            return res;
        } catch (err) {
            debug('TransferICP error', err);
            return false;
        }
    }
};

export const TransferMora = async (
    amount: bigint,
    principal: Principal,
    subaccount: Uint8Array | [],
    canister: string = CONFIG.moraTokenLedger,
) => {
    const ledgerActor = await createActor(canister, moraTokenLedger, store.state.agent);
    try {
        const res = await ledgerActor.icrc1_transfer({
            to: {
                owner: principal,
                subaccount: subaccount.length ? [subaccount] : [],
            },
            fee: [],
            from_subaccount: [],
            memo: [],
            created_at_time: [],
            amount: amount,
        });
        return res;
    } catch (err) {
        debug('TransferICP ckbtc ', err);
        return false;
    }
};

export const TransferCKBTC = async (
    amount: bigint,
    principal: Principal,
    subaccount: Uint8Array | [],
    canister: string = CONFIG.ckbtcBalance,
) => {
    const ledgerActor = await createActor(canister, ckbtcBalanceFactory, store.state.agent);
    try {
        const res = await ledgerActor.icrc1_transfer({
            to: {
                owner: principal,
                subaccount: subaccount.length ? [subaccount] : [],
            },
            fee: [],
            from_subaccount: [],
            memo: [],
            created_at_time: [],
            amount: amount,
        });
        return res;
    } catch (err) {
        debug('TransferICP ckbtc', err);
        return false;
    }
};

export const LoadIcpCycleRate = async (): Promise<number> => {
    const actor = GetCycleActor();
    const fee = await actor.get_icp_xdr_conversion_rate();
    const b = Number(fee.data.xdr_permyriad_per_icp) / 10 ** 4;
    _icp2sdr = b;
    return b;
};

const MEMO_TOP_UP_CANISTER = BigInt(1347768404);
const CYCLE_MINTER_CANISTER_ID: string = CONFIG.cyclesCanister;
export const DepositCycles = async (
    canisterId: Principal,
    icpAmount: bigint,
    methodPayment,
): Promise<boolean> => {
    const cycle_canister_id = Principal.fromText(CYCLE_MINTER_CANISTER_ID);
    const sub = SubAccount.fromPrincipal(canisterId);
    const to = AccountIdentifier.fromPrincipal(cycle_canister_id, sub);
    let ledgerActor;
    if (methodPayment === 'plug') {
        ledgerActor = await window.ic.plug.createActor({
            canisterId: CONFIG.ledgerId,
            interfaceFactory: ledgerFactory,
        });
    } else {
        ledgerActor = await createActor(CONFIG.ledgerId, ledgerFactory, store.state.agent);
    }
    const height = await TransferICP(
        to.toHex(),
        icpAmount,
        {
            memo: MEMO_TOP_UP_CANISTER,
        },
        methodPayment,
    );

    const args: NotifyCanisterArgs = {
        max_fee: { e8s: BigInt(10_000) },
        to_canister: cycle_canister_id,
        from_subaccount: [],
        to_subaccount: [Array.from(sub.toUint8Array())],
        block_height: height,
    };
    await ledgerActor?.notify_dfx(args);
    return true;
};

export const getAmountMax = (val = null) => {
    const num = _.floor(Number(val) - 0.0001, 4);
    return num <= 0 ? 0 : num;
};

export const getAmountMaxCKBTC = (val = null) => {
    if (!val) {
        return 0;
    }
    const num = _.floor((val * 100000000 - 20) / 100000000, 8);
    return num <= 0 ? 0 : num;
};

export const GetBalance = (): number => {
    return _balance;
};
