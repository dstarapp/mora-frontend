export const idlFactory = ({ IDL }) => {
    const ErrorInfo = IDL.Record({ 'code': IDL.Nat32, 'message': IDL.Text });
    const BatchGetReverseResolvePrincipalResponse = IDL.Variant({
        'Ok': IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Opt(IDL.Text))),
        'Err': ErrorInfo,
    });
    const BooleanActorResponse = IDL.Variant({
        'Ok': IDL.Bool,
        'Err': ErrorInfo,
    });
    const StateExportData = IDL.Record({ 'state_data': IDL.Vec(IDL.Nat8) });
    const StateExportResponse = IDL.Variant({
        'Ok': StateExportData,
        'Err': ErrorInfo,
    });
    const GetRecordValueResponse = IDL.Variant({
        'Ok': IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
        'Err': ErrorInfo,
    });
    const Stats = IDL.Record({
        'cycles_balance': IDL.Nat64,
        'resolver_count': IDL.Nat64,
    });
    const GetStatsResponse = IDL.Variant({ 'Ok': Stats, 'Err': ErrorInfo });
    const HttpRequest = IDL.Record({
        'url': IDL.Text,
        'method': IDL.Text,
        'body': IDL.Vec(IDL.Nat8),
        'headers': IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
    });
    const Token = IDL.Record({
        'key': IDL.Text,
        'sha256': IDL.Opt(IDL.Vec(IDL.Nat8)),
        'index': IDL.Nat,
        'content_encoding': IDL.Text,
    });
    const CallbackStrategy = IDL.Record({
        'token': Token,
        'callback': IDL.Func([], [], []),
    });
    const StreamingStrategy = IDL.Variant({ 'Callback': CallbackStrategy });
    const HttpResponse = IDL.Record({
        'body': IDL.Vec(IDL.Nat8),
        'headers': IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
        'streaming_strategy': IDL.Opt(StreamingStrategy),
        'status_code': IDL.Nat16,
    });
    const PatchValueOperation = IDL.Variant({
        'InsertOrIgnore': IDL.Text,
        'Remove': IDL.Null,
        'Upsert': IDL.Text,
    });
    const ResolverValueImportItem = IDL.Record({
        'key': IDL.Text,
        'name': IDL.Text,
        'value_and_operation': PatchValueOperation,
    });
    const ImportRecordValueRequest = IDL.Record({
        'items': IDL.Vec(ResolverValueImportItem),
    });
    const ReverseResolvePrincipalResponse = IDL.Variant({
        'Ok': IDL.Opt(IDL.Text),
        'Err': ErrorInfo,
    });
    return IDL.Service({
        'batch_get_reverse_resolve_principal': IDL.Func(
            [IDL.Vec(IDL.Principal)],
            [BatchGetReverseResolvePrincipalResponse],
            ['query'],
        ),
        'ensure_resolver_created': IDL.Func(
            [IDL.Text],
            [BooleanActorResponse],
            [],
        ),
        'export_state': IDL.Func([], [StateExportResponse], []),
        'get_record_value': IDL.Func(
            [IDL.Text],
            [GetRecordValueResponse],
            ['query'],
        ),
        'get_stats': IDL.Func([], [GetStatsResponse], ['query']),
        'get_wasm_info': IDL.Func(
            [],
            [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text))],
            ['query'],
        ),
        'http_request': IDL.Func([HttpRequest], [HttpResponse], ['query']),
        'import_record_value': IDL.Func(
            [ImportRecordValueRequest],
            [BooleanActorResponse],
            [],
        ),
        'load_state': IDL.Func([StateExportData], [BooleanActorResponse], []),
        'remove_resolvers': IDL.Func(
            [IDL.Vec(IDL.Text)],
            [BooleanActorResponse],
            [],
        ),
        'reverse_resolve_principal': IDL.Func(
            [IDL.Principal],
            [ReverseResolvePrincipalResponse],
            ['query'],
        ),
        'set_record_value': IDL.Func(
            [IDL.Text, IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text))],
            [BooleanActorResponse],
            [],
        ),
    });
};
export const init = ({ IDL }) => { return []; };