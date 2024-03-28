export const idlFactory = ({ IDL }) => {
    const CanisterStatus = IDL.Variant({
        'stopped': IDL.Null,
        'stopping': IDL.Null,
        'running': IDL.Null,
    });
    const DefiniteCAnisterSettings = IDL.Record({
        'freezing_threshold': IDL.Nat,
        'controllers': IDL.Vec(IDL.Principal),
        'memory_allocation': IDL.Nat,
        'compute_allocation': IDL.Nat,
    });
    const CanisterStatusResult = IDL.Record({
        'status': CanisterStatus,
        'memory_size': IDL.Nat,
        'cycles': IDL.Nat,
        'settings': DefiniteCAnisterSettings,
        'idle_cycles_burned_per_day': IDL.Nat,
        'module_hash': IDL.Opt(IDL.Vec(IDL.Nat8)),
    });
    const Page = IDL.Record({ 'page': IDL.Nat32, 'size': IDL.Nat32 });
    const LogLevel = IDL.Variant({
        'Error': IDL.Null,
        'Info': IDL.Null,
        'Warn': IDL.Null,
        'Debug': IDL.Null,
        'Trace': IDL.Null,
    });
    const InvitationLog = IDL.Record({
        'content': IDL.Text,
        'time': IDL.Nat64,
        'level': LogLevel,
    });
    const PageData = IDL.Record({
        'all': IDL.Nat32,
        'data': IDL.Vec(InvitationLog),
        'page': IDL.Nat32,
        'size': IDL.Nat32,
    });
    const WalletReceiveResult = IDL.Record({ 'accepted': IDL.Nat64 });
    return IDL.Service({
        'canister_status': IDL.Func([], [CanisterStatusResult], []),
        'generateInvitationCodes': IDL.Func(
            [IDL.Vec(IDL.Text), IDL.Principal],
            [IDL.Vec(IDL.Text)],
            [],
        ),
        'generateInvitationCodesById': IDL.Func(
            [IDL.Vec(IDL.Nat32), IDL.Principal],
            [IDL.Vec(IDL.Text)],
            [],
        ),
        'isInvitationAvailable': IDL.Func([IDL.Text], [IDL.Bool], ['query']),
        'isInvitationAvailableById': IDL.Func([IDL.Nat32], [IDL.Bool], ['query']),
        'logs_find_by_page': IDL.Func([Page], [PageData], ['query']),
        'wallet_balance': IDL.Func([], [IDL.Nat], ['query']),
        'wallet_receive': IDL.Func([], [WalletReceiveResult], []),
    });
};
export const init = ({ IDL }) => { return []; };