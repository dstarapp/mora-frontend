import { createActor } from '@/request/agent';
import { LoadTransaction } from '@/utils/wallet';
import {
    format_amount,
    format_date,
    largeNumberComponent,
    format_amount_mora,
} from '@/utils/functions';
import CONFIG from '@/assets/config';
import { idlFactory as ckbtcRecordFactory } from '@/request/canister/ckbtcRecord.did';
import { idlFactory as moraRecordFactory } from '@/request/canister/moraRecord.did';
import store from '@/store';
import { Principal } from '@dfinity/principal';

export const getTokenList = async () => { };

export const getCkbtcTransactionsList = async () => {
    const openExplorer = (id) => {
        return `https://dashboard.internetcomputer.org/bitcoin/transaction/${Number(id)}`;
    };

    const ckbtcRecordCanister = createActor(CONFIG.ckbtcRecordsCanister, ckbtcRecordFactory);
    try {
        const list: any = await ckbtcRecordCanister.get_account_transactions({
            max_results: 9999,
            start: [],
            account: {
                owner: Principal.fromText(store.state.user_principal as string),
                subaccount: [],
            },
        });
        const data = list.Ok.transactions.map((item) => {
            const str = {
                from: item.transaction.transfer[0].from.owner.toString(),
                amount: largeNumberComponent(item.transaction.transfer[0]),
                date: format_date(item.timestamp),
                explorer: openExplorer(Number(item.id)),
                unit: 'ckbtc',
            };
            return str;
        });
        return data;
    } catch (err) {
        return [];
    }
};

export const getMoraTransactionsList = async () => {
    const moraRecordCanister = createActor(CONFIG.moraTokenIndex, moraRecordFactory);
    try {
        const list: any = await moraRecordCanister.get_account_transactions({
            max_results: 9999,
            start: [],
            account: {
                owner: Principal.fromText(store.state.user_principal as string),
                subaccount: [],
            },
        });
        const data = list.Ok.transactions.map((item) => {
            const str = {
                from: item.transaction.transfer[0].from.owner.toString(),
                amount: format_amount_mora(item.transaction.transfer[0]),
                date: format_date(item.timestamp),
                explorer: '',
                unit: 'mora',
            };
            return str;
        });
        return data;
    } catch (err) {
        console.log(err);
        return [];
    }
};

export const getICPTransactionsList = async () => {
    const list = await LoadTransaction();

    const openExplorer = (hash) => {
        return `${CONFIG.explorerLink}${hash}`;
    };

    const data = list.map((item) => {
        const str = {
            from: item.account1Address,
            amount: format_amount(item),
            date: format_date(item.timestamp),
            explorer: openExplorer(item.hash),
            unit: 'icp',
        };
        return str;
    });
    return data;
};
