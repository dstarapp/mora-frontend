export const idlFactory = ({ IDL }) => {
    const CreateInviteCodeArgs = IDL.Record({
        'code': IDL.Text,
        'user': IDL.Principal,
    });
    const QueryInviteCode = IDL.Record({
        'created': IDL.Int,
        'code': IDL.Text,
    });
    const StatsResp = IDL.Record({
        'used_count': IDL.Int,
        'total_count': IDL.Int,
    });
    return IDL.Service({
        'add_adminer': IDL.Func([IDL.Principal], [IDL.Bool], []),
        'add_code': IDL.Func([IDL.Vec(CreateInviteCodeArgs)], [IDL.Int], []),
        'add_code_verify': IDL.Func([CreateInviteCodeArgs], [IDL.Bool], []),
        'canister_memory': IDL.Func([], [IDL.Nat], ['query']),
        'query_code': IDL.Func([IDL.Text], [IDL.Bool], []),
        'query_codelist': IDL.Func([], [IDL.Vec(QueryInviteCode)], ['query']),
        'set_daoer': IDL.Func([IDL.Principal], [IDL.Bool], []),
        'stats': IDL.Func([], [StatsResp], ['query']),
        'verify_code': IDL.Func([IDL.Text, IDL.Principal], [IDL.Bool], []),
        'wallet_balance': IDL.Func([], [IDL.Nat], ['query']),
        'wallet_receive': IDL.Func(
            [],
            [IDL.Record({ 'accepted': IDL.Nat64 })],
            [],
        ),
    });
};
export const init = ({ IDL }) => { return []; };