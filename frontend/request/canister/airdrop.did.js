export const idlFactory = ({ IDL }) => {
    const AirdropType = IDL.Variant({
        Nft: IDL.Null,
        Mainnet: IDL.Null,
        Insc: IDL.Null,
        Note: IDL.Null,
        Testnet: IDL.Null,
    });
    const AirdropData = IDL.Record({
        pid: IDL.Principal,
        atype: AirdropType,
        claimed_count: IDL.Int,
        claimed: IDL.Nat64,
        isregister: IDL.Bool,
        account: IDL.Text,
        point: IDL.Nat64,
    });
    return IDL.Service({
        checkAirdrop: IDL.Func([], [IDL.Vec(AirdropData)], ['query']),
        importInsc: IDL.Func([IDL.Principal, IDL.Nat64], [IDL.Bool], []),
        importMaintest: IDL.Func([IDL.Principal, IDL.Nat64], [IDL.Bool], []),
        importNft: IDL.Func([IDL.Text, IDL.Nat64], [IDL.Bool], []),
        importNote: IDL.Func([IDL.Principal, IDL.Nat64], [IDL.Bool], []),
        importTestnet: IDL.Func([IDL.Principal, IDL.Nat64], [IDL.Bool], []),
        register: IDL.Func([AirdropType], [IDL.Bool], []),
        setOwner: IDL.Func([IDL.Principal], [], ['oneway']),
    });
};
export const init = ({ IDL }) => {
    return [];
};
