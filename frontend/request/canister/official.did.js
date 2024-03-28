export const idlFactory = ({ IDL }) => {
    const Result = IDL.Variant({ 'Ok': IDL.Bool, 'Err': IDL.Text });
    const OfficialInfo = IDL.Record({
        'canister_id': IDL.Principal,
        'is_official': IDL.Bool,
        'official_digest': IDL.Text,
    });
    const Official = IDL.Record({
        'is_official': IDL.Bool,
        'official_digest': IDL.Text,
    });
    const Result_1 = IDL.Variant({ 'Ok': Official, 'Err': IDL.Text });
    return IDL.Service({
        'add_administrator': IDL.Func([IDL.Principal], [], []),
        'cancel_official': IDL.Func([IDL.Principal], [Result], []),
        'del_administrator': IDL.Func([IDL.Principal], [], []),
        'get_administrators': IDL.Func([], [IDL.Vec(IDL.Principal)], ['query']),
        'get_batch_official': IDL.Func(
            [IDL.Vec(IDL.Principal)],
            [IDL.Vec(OfficialInfo)],
            ['query'],
        ),
        'get_official': IDL.Func([IDL.Principal], [Result_1], ['query']),
        'get_official_list': IDL.Func([], [IDL.Vec(OfficialInfo)], ['query']),
        'set_official': IDL.Func([IDL.Principal, IDL.Text], [Result], []),
        'set_owner': IDL.Func([IDL.Principal], [], []),
        'wallet_balance': IDL.Func([], [IDL.Nat64], ['query']),
        'wallet_receive': IDL.Func([], [], []),
    });
};
export const init = ({ IDL }) => { return []; };