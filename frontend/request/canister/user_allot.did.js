export const idlFactory = ({ IDL }) => {
    const NFT = IDL.Record({
        'token_index': IDL.Text,
        'canister_id': IDL.Principal,
        'standard': IDL.Text,
    });
    const UserInfo = IDL.Record({
        'nft': IDL.Opt(NFT),
        'pid': IDL.Principal,
        'created': IDL.Int,
        'email': IDL.Text,
        'avatar': IDL.Text,
    });
    const UserLoginResp = IDL.Record({
        'userinfo': UserInfo,
        'canister_id': IDL.Principal,
    });
    const Result = IDL.Variant({ 'Ok': UserLoginResp, 'Err': IDL.Text });
    const PlanetMsgType = IDL.Variant({
        'add': IDL.Null,
        'remove': IDL.Null,
        'subscribe': IDL.Null,
        'unsubscribe': IDL.Null,
    });
    const PlanetMsg = IDL.Record({
        'msg_type': PlanetMsgType,
        'data': IDL.Opt(IDL.Vec(IDL.Nat8)),
        'user': IDL.Principal,
    });
    return IDL.Service({
        'get_canister': IDL.Func([], [IDL.Opt(IDL.Principal)], ['query']),
        'login': IDL.Func([], [Result], []),
        'notify_planet_msg': IDL.Func([PlanetMsg], [IDL.Bool], []),
        'search_canister': IDL.Func(
            [IDL.Principal],
            [IDL.Opt(IDL.Principal)],
            ['query'],
        ),
        'verify_canister': IDL.Func([IDL.Principal], [IDL.Bool], ['query']),
    });
};
export const init = ({ IDL }) => { return []; };