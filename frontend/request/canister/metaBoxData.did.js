export const idlFactory = ({ IDL }) => {
    const DataErr = IDL.Variant({
        'FileKeyErr': IDL.Null,
        'FilePublic': IDL.Null,
        'BlobSizeError': IDL.Null,
        'PermissionDenied': IDL.Null,
        'SharedRepeat': IDL.Null,
        'FlagErr': IDL.Null,
        'SharedNotSet': IDL.Null,
        'MemoryInsufficient': IDL.Null,
        'FileAesPubKeyNotExist': IDL.Null,
        'UserAccessErr': IDL.Null,
        'FileRepeat': IDL.Null,
        'ShareRepeat': IDL.Null,
    });
    const Result_1 = IDL.Variant({ 'ok': IDL.Text, 'err': DataErr });
    const Result_12 = IDL.Variant({ 'ok': IDL.Nat64, 'err': DataErr });
    const State = IDL.Record({
        'balance': IDL.Nat,
        'memory_size': IDL.Nat,
        'stable_memory_size': IDL.Nat64,
    });
    const Result_11 = IDL.Variant({ 'ok': State, 'err': DataErr });
    const Result_10 = IDL.Variant({ 'ok': IDL.Nat, 'err': DataErr });
    const FileLocation__1 = IDL.Variant({
        'ICEnCrypt': IDL.Null,
        'IPFS': IDL.Null,
        'Arweave': IDL.Null,
        'ICPlain': IDL.Null,
    });
    const AssetExt = IDL.Record({
        'file_extension': IDL.Text,
        'share_other': IDL.Vec(IDL.Principal),
        'upload_status': IDL.Bool,
        'bucket_id': IDL.Principal,
        'owner': IDL.Principal,
        'aes_pub_key': IDL.Opt(IDL.Text),
        'is_private': IDL.Bool,
        'file_name': IDL.Text,
        'file_key': IDL.Text,
        'total_size': IDL.Nat64,
        'need_query_times': IDL.Nat,
    });
    const FileExt = IDL.Variant({
        'EncryptFileExt': AssetExt,
        'SharedFileExt': IDL.Record({
            'file_extension': IDL.Text,
            'other': IDL.Principal,
            'description': IDL.Text,
            'file_name': IDL.Text,
            'file_key': IDL.Text,
            'isPublic': IDL.Bool,
            'receiver': IDL.Principal,
        }),
        'PlainFileExt': AssetExt,
    });
    const Result_3 = IDL.Variant({ 'ok': FileExt, 'err': DataErr });
    const FileLocation = IDL.Variant({
        'ICEnCrypt': IDL.Null,
        'IPFS': IDL.Null,
        'Arweave': IDL.Null,
        'ICPlain': IDL.Null,
    });
    const OtherFile = IDL.Record({
        'file_extension': IDL.Text,
        'file_location': FileLocation,
        'file_name': IDL.Text,
        'file_key': IDL.Text,
        'file_url': IDL.Text,
    });
    const Result_9 = IDL.Variant({
        'ok': IDL.Tuple(
            IDL.Vec(FileExt),
            IDL.Vec(FileExt),
            IDL.Vec(FileExt),
            IDL.Vec(OtherFile),
            IDL.Vec(OtherFile),
        ),
        'err': DataErr,
    });
    const GET = IDL.Record({ 'flag': IDL.Nat, 'file_key': IDL.Text });
    const Result_8 = IDL.Variant({
        'ok': IDL.Vec(IDL.Vec(IDL.Nat8)),
        'err': DataErr,
    });
    const Result_7 = IDL.Variant({
        'ok': IDL.Vec(IDL.Principal),
        'err': DataErr,
    });
    const Result_6 = IDL.Variant({ 'ok': OtherFile, 'err': DataErr });
    const Result_5 = IDL.Variant({ 'ok': IDL.Vec(IDL.Nat8), 'err': DataErr });
    const Result_4 = IDL.Variant({
        'ok': IDL.Tuple(IDL.Vec(FileExt), IDL.Vec(FileExt)),
        'err': DataErr,
    });
    const HeaderField = IDL.Tuple(IDL.Text, IDL.Text);
    const HttpRequest = IDL.Record({
        'url': IDL.Text,
        'method': IDL.Text,
        'body': IDL.Vec(IDL.Nat8),
        'headers': IDL.Vec(HeaderField),
    });
    const StreamingToken__1 = IDL.Record({ 'key': IDL.Text, 'index': IDL.Nat });
    const StreamingCallbackHttpResponse__1 = IDL.Record({
        'token': IDL.Opt(StreamingToken__1),
        'body': IDL.Vec(IDL.Nat8),
    });
    const StreamingStrategy = IDL.Variant({
        'Callback': IDL.Record({
            'token': StreamingToken__1,
            'callback': IDL.Func(
                [StreamingToken__1],
                [StreamingCallbackHttpResponse__1],
                ['query'],
            ),
        }),
    });
    const HttpResponse = IDL.Record({
        'body': IDL.Vec(IDL.Nat8),
        'headers': IDL.Vec(HeaderField),
        'streaming_strategy': IDL.Opt(StreamingStrategy),
        'status_code': IDL.Nat16,
    });
    const Chunk = IDL.Record({ 'data': IDL.Vec(IDL.Nat8) });
    const PUT = IDL.Record({
        'file_extension': IDL.Text,
        'order': IDL.Nat,
        'chunk_number': IDL.Nat,
        'chunk': Chunk,
        'aes_pub_key': IDL.Opt(IDL.Text),
        'is_private': IDL.Bool,
        'file_name': IDL.Text,
        'file_key': IDL.Text,
        'total_size': IDL.Nat64,
    });
    const FilePut = IDL.Variant({
        'EncryptFilePut': PUT,
        'SharedFilePut': IDL.Record({
            'file_extension': IDL.Text,
            'other': IDL.Principal,
            'aes_pub_key': IDL.Opt(IDL.Text),
            'description': IDL.Text,
            'file_name': IDL.Text,
            'file_key': IDL.Text,
            'isPublic': IDL.Bool,
        }),
        'PlainFilePut': PUT,
    });
    const Result_2 = IDL.Variant({ 'ok': IDL.Bool, 'err': DataErr });
    const StreamingToken = IDL.Record({ 'key': IDL.Text, 'index': IDL.Nat });
    const StreamingCallbackHttpResponse = IDL.Record({
        'token': IDL.Opt(StreamingToken__1),
        'body': IDL.Vec(IDL.Nat8),
    });
    const Avatar = IDL.Record({
        'data': IDL.Vec(IDL.Nat8),
        'data_type': IDL.Text,
    });
    const Result = IDL.Variant({ 'ok': IDL.Null, 'err': DataErr });
    return IDL.Service({
        'addCon': IDL.Func([IDL.Principal], [Result_1], []),
        'addPrivatePlainShare': IDL.Func(
            [IDL.Text, IDL.Principal],
            [Result_1],
            [],
        ),
        'avlSM': IDL.Func([], [Result_12], ['query']),
        'canisterState': IDL.Func([], [Result_11], ['query']),
        'clearall': IDL.Func([], [Result_1], []),
        'curControl': IDL.Func(
            [],
            [IDL.Principal, IDL.Vec(IDL.Principal)],
            ['query'],
        ),
        'cycleBalance': IDL.Func([], [Result_10], ['query']),
        'deleteCon': IDL.Func([IDL.Principal], [Result_1], []),
        'deleteFileFromKey': IDL.Func([IDL.Text, FileLocation__1], [Result_1], []),
        'deleteShareFile': IDL.Func([IDL.Text, IDL.Principal], [Result_1], []),
        'deleteSharedFile': IDL.Func([IDL.Text], [Result_1], []),
        'getAssetextkey': IDL.Func([IDL.Text], [Result_3], ['query']),
        'getAssetexts': IDL.Func([], [Result_9], ['query']),
        'getCipher': IDL.Func([GET], [Result_8], ['query']),
        'getDefaultDeviceShareDap': IDL.Func([IDL.Text], [Result_1], ['query']),
        'getFileShareOther': IDL.Func([IDL.Text], [Result_7], ['query']),
        'getOtherkey': IDL.Func(
            [IDL.Text, FileLocation__1],
            [Result_6],
            ['query'],
        ),
        'getOwner': IDL.Func([], [IDL.Principal], ['query']),
        'getPlain': IDL.Func([GET], [Result_5], ['query']),
        'getShareFiles': IDL.Func([], [Result_4], ['query']),
        'getSharedAesPublic': IDL.Func([IDL.Text], [Result_1], ['query']),
        'getVersion': IDL.Func([], [IDL.Nat], ['query']),
        'http_request': IDL.Func([HttpRequest], [HttpResponse], ['query']),
        'put': IDL.Func([FilePut], [Result_3], []),
        'records': IDL.Func([OtherFile], [Result_2], []),
        'removePrivatePlainShare': IDL.Func(
            [IDL.Text, IDL.Principal],
            [Result_1],
            [],
        ),
        'setPlainFilePubOrPri': IDL.Func([IDL.Text, IDL.Bool], [Result_1], []),
        'setShareFile': IDL.Func(
            [IDL.Text, IDL.Principal, IDL.Text],
            [Result_1],
            [],
        ),
        'streamingCallback': IDL.Func(
            [StreamingToken],
            [StreamingCallbackHttpResponse],
            ['query'],
        ),
        'transferOwner': IDL.Func([IDL.Principal], [Result_1], []),
        'upload': IDL.Func([Avatar], [Result], []),
        'wallet_receive': IDL.Func([], [IDL.Nat], []),
    });
};
export const init = ({ IDL }) => { return []; };