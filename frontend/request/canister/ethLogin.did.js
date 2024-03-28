export const idlFactory = ({ IDL }) => {
    const Profile = IDL.Record({ 'created': IDL.Nat64, 'address': IDL.Text });
    return IDL.Service({
        'getByEth': IDL.Func([IDL.Text], [IDL.Opt(Profile)], ['query']),
        'getPrincipalByEth': IDL.Func(
            [IDL.Text],
            [IDL.Opt(IDL.Principal)],
            ['query'],
        ),
        'getProfileByPrincipal': IDL.Func(
            [IDL.Principal],
            [IDL.Opt(Profile)],
            ['query'],
        ),
        'linkAddress': IDL.Func([IDL.Text, IDL.Text], [IDL.Bool], []),
        'whoami': IDL.Func([], [IDL.Principal], ['query']),
    });
};
export const init = ({ IDL }) => { return []; };