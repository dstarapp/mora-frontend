export const idlFactory = ({ IDL }) => {
    const Subaccount = IDL.Vec(IDL.Nat8);
    const Account = IDL.Record({
        owner: IDL.Principal,
        subaccount: IDL.Opt(Subaccount),
    });
    const Mint = IDL.Record({
        to: Account,
        data: IDL.Opt(IDL.Vec(IDL.Nat8)),
        created_at: IDL.Opt(IDL.Nat64),
    });
    const MintPayload = IDL.Record({
        p: IDL.Text,
        op: IDL.Text,
        amt: IDL.Nat,
        tick: IDL.Text,
    });
    const MoraBatchMintArgs = IDL.Record({
        mints: IDL.Vec(Mint),
        payload: MintPayload,
    });
    const TxIndex = IDL.Nat;
    const Balance = IDL.Nat;
    const Timestamp = IDL.Nat64;
    const TransferError = IDL.Variant({
        GenericError: IDL.Record({
            message: IDL.Text,
            error_code: IDL.Nat,
        }),
        TemporarilyUnavailable: IDL.Null,
        BadBurn: IDL.Record({ min_burn_amount: Balance }),
        Duplicate: IDL.Record({ duplicate_of: TxIndex }),
        BadFee: IDL.Record({ expected_fee: Balance }),
        CreatedInFuture: IDL.Record({ ledger_time: Timestamp }),
        TooOld: IDL.Null,
        InsufficientFunds: IDL.Record({ balance: Balance }),
    });
    const TransferResult = IDL.Variant({ Ok: TxIndex, Err: TransferError });
    const DeployPayload = IDL.Record({
        p: IDL.Text,
        op: IDL.Text,
        lim: IDL.Nat,
        max: IDL.Nat,
        tick: IDL.Text,
    });
    const MoraDeployArgs = IDL.Record({
        uri: IDL.Text,
        deployer: IDL.Principal,
        created_at: IDL.Opt(IDL.Nat),
        payload: DeployPayload,
    });
    const MoraMintArgs = IDL.Record({ mint: Mint, payload: MintPayload });
    const QueryTokenInfo = IDL.Record({
        lim: IDL.Nat,
        max: IDL.Nat,
        uri: IDL.Text,
        deployer: IDL.Principal,
        tick: IDL.Text,
        created_at: IDL.Nat,
        ledger: IDL.Principal,
        index: IDL.Opt(IDL.Principal),
    });
    return IDL.Service({
        add_adminer: IDL.Func([IDL.Principal], [IDL.Bool], []),
        batch_mint: IDL.Func([MoraBatchMintArgs], [IDL.Vec(TransferResult)], []),
        deploy: IDL.Func([MoraDeployArgs], [IDL.Opt(IDL.Principal)], []),
        deploy_index: IDL.Func([IDL.Text], [IDL.Opt(IDL.Principal)], []),
        get_index_wasmhash: IDL.Func([], [IDL.Text], ['query']),
        get_init_cycles: IDL.Func([], [IDL.Nat], []),
        get_ledger_wasmhash: IDL.Func([], [IDL.Text], ['query']),
        mint: IDL.Func([MoraMintArgs], [TransferResult], []),
        query_token_list: IDL.Func([], [IDL.Vec(QueryTokenInfo)], ['query']),
        set_cycles: IDL.Func([IDL.Nat], [IDL.Bool], []),
        set_index_wasm: IDL.Func([IDL.Vec(IDL.Nat8)], [IDL.Bool], []),
        set_ledger_wasm: IDL.Func([IDL.Vec(IDL.Nat8)], [IDL.Bool], []),
        upgrade_ledger: IDL.Func([IDL.Text], [IDL.Bool], []),
        wallet_balance: IDL.Func([], [IDL.Nat], ['query']),
        wallet_receive: IDL.Func([], [IDL.Record({ accepted: IDL.Nat64 })], []),
    });
};
export const init = ({ IDL }) => {
    return [];
};
