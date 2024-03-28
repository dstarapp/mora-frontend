export const idlFactory = ({ IDL }) => {
    return IDL.Service({
        'hdel': IDL.Func([IDL.Text, IDL.Text], [IDL.Bool], []),
        'hexist': IDL.Func([IDL.Text, IDL.Text], [IDL.Bool], ['query']),
        'hget': IDL.Func(
            [IDL.Text, IDL.Text],
            [IDL.Opt(IDL.Vec(IDL.Nat8))],
            ['query'],
        ),
        'hset': IDL.Func([IDL.Text, IDL.Text, IDL.Vec(IDL.Nat8)], [IDL.Bool], []),
        'wallet_balance': IDL.Func([], [IDL.Nat64], ['query']),
        'wallet_receive': IDL.Func([], [], []),
    });
};
export const init = ({ IDL }) => { return []; };