export const idlFactory = ({ IDL }) => {
    const Attribute = IDL.Record({ 'key': IDL.Text, 'value': IDL.Text });
    const PlanetArgs = IDL.Record({
        'code': IDL.Text,
        'desc': IDL.Text,
        'name': IDL.Text,
        'avatar': IDL.Text,
    });
    const CreatePlanetResp = IDL.Variant({
        'Ok': IDL.Record({ 'id': IDL.Principal }),
        'Err': IDL.Text,
    });
    const QueryCommonReq = IDL.Record({ 'page': IDL.Nat, 'size': IDL.Nat });
    const Collection = IDL.Record({
        'canister_id': IDL.Principal,
        'article_id': IDL.Text,
    });
    const QueryCollectionResp = IDL.Record({
        'total': IDL.Int,
        'hasmore': IDL.Bool,
        'data': IDL.Vec(Collection),
        'page': IDL.Nat,
    });
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
        'add_attribute': IDL.Func([Attribute], [IDL.Bool], []),
        'add_collection': IDL.Func([IDL.Principal, IDL.Text], [IDL.Bool], []),
        'canister_memory': IDL.Func([], [IDL.Nat], ['query']),
        'create_planet': IDL.Func([PlanetArgs], [CreatePlanetResp], []),
        'get_attibute_by_key': IDL.Func(
            [IDL.Text],
            [IDL.Opt(Attribute)],
            ['query'],
        ),
        'get_attibutes': IDL.Func([], [IDL.Opt(IDL.Vec(Attribute))], ['query']),
        'get_avatar': IDL.Func([IDL.Opt(IDL.Principal)], [IDL.Text], ['query']),
        'get_collections': IDL.Func(
            [QueryCommonReq],
            [QueryCollectionResp],
            ['query'],
        ),
        'get_email': IDL.Func([], [IDL.Text], ['query']),
        'get_planets': IDL.Func([], [IDL.Opt(IDL.Vec(IDL.Principal))], ['query']),
        'get_subscribes': IDL.Func(
            [],
            [IDL.Opt(IDL.Vec(IDL.Principal))],
            ['query'],
        ),
        'login': IDL.Func([], [UserInfo], []),
        'login_proxy': IDL.Func([IDL.Principal], [UserInfo], []),
        'on_planet_msg': IDL.Func([IDL.Principal, PlanetMsg], [IDL.Bool], []),
        'profile': IDL.Func([], [IDL.Opt(UserInfo)], ['query']),
        'remove_collection': IDL.Func([IDL.Principal, IDL.Text], [IDL.Bool], []),
        'set_avatar': IDL.Func([IDL.Text], [IDL.Bool], []),
        'set_email': IDL.Func([IDL.Text], [IDL.Bool], []),
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