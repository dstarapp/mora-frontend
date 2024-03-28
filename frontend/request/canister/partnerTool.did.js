export const idlFactory = ({ IDL }) => {
    const Attribute = IDL.Record({ 'key': IDL.Text, 'value': IDL.Text });
    const QueryUserListReq = IDL.Record({
        'from': IDL.Opt(IDL.Text),
        'page': IDL.Nat,
        'size': IDL.Nat,
    });
    const UserInfo__1 = IDL.Record({
        'pid': IDL.Principal,
        'created': IDL.Int,
        'from': IDL.Text,
    });
    const QueryUserListResp = IDL.Record({
        'total': IDL.Int,
        'hasmore': IDL.Bool,
        'data': IDL.Vec(UserInfo__1),
        'page': IDL.Nat,
    });
    const UserInfo = IDL.Record({
        'pid': IDL.Principal,
        'created': IDL.Int,
        'from': IDL.Text,
    });
    return IDL.Service({
        'add_adminer': IDL.Func([IDL.Principal], [IDL.Bool], []),
        'add_attribute': IDL.Func([Attribute], [IDL.Bool], []),
        'canister_memory': IDL.Func([], [IDL.Nat], ['query']),
        'get_attibute_by_key': IDL.Func(
            [IDL.Text],
            [IDL.Opt(Attribute)],
            ['query'],
        ),
        'get_attibutes': IDL.Func([], [IDL.Opt(IDL.Vec(Attribute))], ['query']),
        'get_userlists': IDL.Func(
            [QueryUserListReq],
            [QueryUserListResp],
            ['query'],
        ),
        'record': IDL.Func([IDL.Text], [UserInfo], []),
        'wallet_balance': IDL.Func([], [IDL.Nat], ['query']),
        'wallet_receive': IDL.Func(
            [],
            [IDL.Record({ 'accepted': IDL.Nat64 })],
            [],
        ),
        'whoami': IDL.Func([], [IDL.Principal], ['query']),
    });
};
export const init = ({ IDL }) => { return []; };