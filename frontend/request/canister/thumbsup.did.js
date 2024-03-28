export const idlFactory = ({ IDL }) => {
    const CanisterNodeMap = IDL.Record({
        'canister_id': IDL.Principal,
        'end_node': IDL.Nat32,
        'start_node': IDL.Nat32,
    });
    return IDL.Service({
        'allot_canister_list': IDL.Func([], [IDL.Vec(CanisterNodeMap)], ['query']),
        'batch_create_canisters': IDL.Func(
            [IDL.Nat32],
            [IDL.Vec(CanisterNodeMap)],
            [],
        ),
        'get_correlation_canister': IDL.Func(
            [IDL.Text],
            [IDL.Principal],
            ['query'],
        ),
        'hdel': IDL.Func([IDL.Text, IDL.Text], [], []),
        'hscan': IDL.Func([IDL.Text, IDL.Text], [IDL.Principal], ['query']),
        'hset': IDL.Func([IDL.Text, IDL.Text, IDL.Vec(IDL.Nat8)], [], []),
        'verify_canister': IDL.Func([IDL.Principal], [IDL.Bool], ['query']),
        'wallet_balance': IDL.Func([], [IDL.Nat64], ['query']),
        'wallet_receive': IDL.Func([], [], []),
    });
};
export const init = ({ IDL }) => { return []; };