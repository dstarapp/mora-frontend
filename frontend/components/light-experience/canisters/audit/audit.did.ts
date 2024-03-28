export const idlFactory = ({ IDL }: any) => {
  const CanisterStatus = IDL.Variant({
    'stopped' : IDL.Null,
    'stopping' : IDL.Null,
    'running' : IDL.Null,
  });
  const DefiniteCAnisterSettings = IDL.Record({
    'freezing_threshold' : IDL.Nat,
    'controllers' : IDL.Vec(IDL.Principal),
    'memory_allocation' : IDL.Nat,
    'compute_allocation' : IDL.Nat,
  });
  const CanisterStatusResult = IDL.Record({
    'status' : CanisterStatus,
    'memory_size' : IDL.Nat,
    'cycles' : IDL.Nat,
    'settings' : DefiniteCAnisterSettings,
    'idle_cycles_burned_per_day' : IDL.Nat,
    'module_hash' : IDL.Opt(IDL.Vec(IDL.Nat8)),
  });
  const MotokoResult = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
  const MotokoResult_1 = IDL.Variant({ 'ok' : IDL.Text, 'err' : IDL.Text });
  const Page = IDL.Record({ 'page' : IDL.Nat32, 'size' : IDL.Nat32 });
  const AuditCodeStatus = IDL.Variant({
    'Movable' : IDL.Nat64,
    'Used' : IDL.Tuple(IDL.Nat64, IDL.Text),
    'Using' : IDL.Tuple(IDL.Nat64, IDL.Text),
    'Owned' : IDL.Nat64,
  });
  const AuditCodeSource = IDL.Variant({
    'Nft' : IDL.Nat32,
    'Gift' : IDL.Principal,
    'Paid' : IDL.Nat64,
  });
  const AuditCode = IDL.Record({
    'status' : AuditCodeStatus,
    'created' : IDL.Nat64,
    'creator' : IDL.Principal,
    'source' : AuditCodeSource,
    'owner' : IDL.Principal,
    'code' : IDL.Text,
    'index' : IDL.Nat32,
  });
  const PageData = IDL.Record({
    'all' : IDL.Nat32,
    'data' : IDL.Vec(AuditCode),
    'page' : IDL.Nat32,
    'size' : IDL.Nat32,
  });
  const Balance = IDL.Record({ 'e8s' : IDL.Nat64 });
  const Price = IDL.Record({ 'e8s' : IDL.Nat64 });
  const TransferUser = IDL.Variant({
    'principal' : IDL.Principal,
    'address' : IDL.Text,
  });
  const TransferError = IDL.Variant({
    'TxTooOld' : IDL.Record({ 'allowed_window_nanos' : IDL.Nat64 }),
    'BadFee' : IDL.Record({ 'expected_fee' : Price }),
    'TxDuplicate' : IDL.Record({ 'duplicate_of' : IDL.Nat64 }),
    'TxCreatedInFuture' : IDL.Null,
    'InsufficientFunds' : IDL.Record({ 'balance' : Price }),
  });
  const Result = IDL.Variant({ 'Ok' : IDL.Nat64, 'Err' : TransferError });
  const TransformedAuditCodeWithStatus = IDL.Record({
    'status' : AuditCodeStatus,
    'code' : IDL.Text,
    'time' : IDL.Nat64,
  });
  const UserDataResult = IDL.Record({
    'moved' : IDL.Vec(TransformedAuditCodeWithStatus),
    'owned' : IDL.Vec(TransformedAuditCodeWithStatus),
    'used' : IDL.Vec(TransformedAuditCodeWithStatus),
    'using' : IDL.Vec(TransformedAuditCodeWithStatus),
  });
  const MotokoResult_2 = IDL.Variant({
    'ok' : IDL.Vec(IDL.Text),
    'err' : IDL.Text,
  });
  const NftConfig = IDL.Record({
    'got' : IDL.Nat8,
    'interval' : IDL.Nat64,
    'initial' : IDL.Nat8,
  });
  const PayConfig = IDL.Record({
    'transfer_fee' : Price,
    'next_subaccount' : IDL.Nat64,
    'ledger' : IDL.Principal,
    'price' : Price,
    'collect' : IDL.Principal,
  });
  const LogLevel = IDL.Variant({
    'Error' : IDL.Null,
    'Info' : IDL.Null,
    'Warn' : IDL.Null,
    'Debug' : IDL.Null,
    'Trace' : IDL.Null,
  });
  const Log = IDL.Record({
    'content' : IDL.Text,
    'time' : IDL.Nat64,
    'level' : LogLevel,
  });
  const PageData_1 = IDL.Record({
    'all' : IDL.Nat32,
    'data' : IDL.Vec(Log),
    'page' : IDL.Nat32,
    'size' : IDL.Nat32,
  });
  const AuditPermission = IDL.Variant({
    'AuditReclaim' : IDL.Null,
    'AuditGenerateCodeByPaid' : IDL.Null,
    'AuditUsingCode' : IDL.Null,
    'AuditLog' : IDL.Null,
    'AuditConfig' : IDL.Null,
    'AuditGenerateCodeByNft' : IDL.Null,
    'AuditUsedCode' : IDL.Null,
    'AuditPermission' : IDL.Null,
    'AuditGenerateCode' : IDL.Null,
    'AuditFind' : IDL.Null,
    'AuditGive' : IDL.Null,
    'AuditQuery' : IDL.Null,
  });
  const WalletReceiveResult = IDL.Record({ 'accepted' : IDL.Nat64 });
  return IDL.Service({
    'canister_status' : IDL.Func([], [CanisterStatusResult], []),
    'code_used' : IDL.Func(
        [IDL.Principal, IDL.Text, IDL.Text],
        [MotokoResult],
        [],
      ),
    'code_using' : IDL.Func(
        [IDL.Principal, IDL.Text, IDL.Text],
        [MotokoResult_1],
        [],
      ),
    'codes_find_by_page' : IDL.Func([Page], [PageData], ['query']),
    'codes_generate_by_nft' : IDL.Func(
        [IDL.Nat32, IDL.Nat8, IDL.Principal],
        [IDL.Vec(IDL.Text)],
        [],
      ),
    'codes_generate_by_nft_max_size' : IDL.Func([IDL.Nat32], [IDL.Nat8], []),
    'codes_generate_by_pay' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(IDL.Text)],
        [],
      ),
    'codes_generate_by_pay_address' : IDL.Func([], [IDL.Text], []),
    'codes_generate_by_pay_balance' : IDL.Func([], [Balance], []),
    'codes_generate_by_pay_price' : IDL.Func([], [Price], ['query']),
    'codes_generate_by_pay_retrieve' : IDL.Func(
        [Price, TransferUser],
        [Result],
        [],
      ),
    'codes_generate_by_permission' : IDL.Func(
        [IDL.Nat8, IDL.Principal],
        [IDL.Vec(IDL.Text)],
        [],
      ),
    'codes_give' : IDL.Func([IDL.Vec(IDL.Text)], [MotokoResult], []),
    'codes_query_by_user' : IDL.Func([], [UserDataResult], ['query']),
    'codes_reclaim' : IDL.Func(
        [IDL.Vec(IDL.Text), IDL.Principal],
        [MotokoResult_2],
        [],
      ),
    'config_nft_find' : IDL.Func([], [NftConfig], ['query']),
    'config_nft_set' : IDL.Func([NftConfig], [IDL.Bool], []),
    'config_pay_find' : IDL.Func([], [PayConfig], ['query']),
    'config_pay_set' : IDL.Func([PayConfig], [IDL.Bool], []),
    'logs_delete' : IDL.Func([IDL.Nat32], [IDL.Bool], []),
    'logs_find_by_page' : IDL.Func([Page], [PageData_1], ['query']),
    'permissions_find' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Vec(AuditPermission)))],
        ['query'],
      ),
    'permissions_grant_all_permissions' : IDL.Func(
        [IDL.Principal],
        [IDL.Bool],
        [],
      ),
    'permissions_has_all_permissions' : IDL.Func(
        [IDL.Principal],
        [IDL.Bool],
        ['query'],
      ),
    'permissions_modify' : IDL.Func(
        [IDL.Principal, IDL.Vec(AuditPermission), IDL.Vec(AuditPermission)],
        [],
        [],
      ),
    'permissions_revoke_all_permissions' : IDL.Func(
        [IDL.Principal],
        [IDL.Bool],
        [],
      ),
    'wallet_balance' : IDL.Func([], [IDL.Nat], ['query']),
    'wallet_receive' : IDL.Func([], [WalletReceiveResult], []),
  });
};
export const init = ({ IDL }: any) => { return []; };
