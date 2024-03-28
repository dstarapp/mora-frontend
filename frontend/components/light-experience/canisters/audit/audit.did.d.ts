import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface AuditCode {
  'status' : AuditCodeStatus,
  'created' : bigint,
  'creator' : Principal,
  'source' : AuditCodeSource,
  'owner' : Principal,
  'code' : string,
  'index' : number,
}
export type AuditCodeSource = { 'Nft' : number } |
  { 'Gift' : Principal } |
  { 'Paid' : bigint };
export type AuditCodeStatus = { 'Movable' : bigint } |
  { 'Used' : [bigint, string] } |
  { 'Using' : [bigint, string] } |
  { 'Owned' : bigint };
export type AuditPermission = { 'AuditReclaim' : null } |
  { 'AuditGenerateCodeByPaid' : null } |
  { 'AuditUsingCode' : null } |
  { 'AuditLog' : null } |
  { 'AuditConfig' : null } |
  { 'AuditGenerateCodeByNft' : null } |
  { 'AuditUsedCode' : null } |
  { 'AuditPermission' : null } |
  { 'AuditGenerateCode' : null } |
  { 'AuditFind' : null } |
  { 'AuditGive' : null } |
  { 'AuditQuery' : null };
export interface Balance { 'e8s' : bigint }
export type CanisterStatus = { 'stopped' : null } |
  { 'stopping' : null } |
  { 'running' : null };
export interface CanisterStatusResult {
  'status' : CanisterStatus,
  'memory_size' : bigint,
  'cycles' : bigint,
  'settings' : DefiniteCAnisterSettings,
  'idle_cycles_burned_per_day' : bigint,
  'module_hash' : [] | [Uint8Array | number[]],
}
export interface DefiniteCAnisterSettings {
  'freezing_threshold' : bigint,
  'controllers' : Array<Principal>,
  'memory_allocation' : bigint,
  'compute_allocation' : bigint,
}
export interface Log { 'content' : string, 'time' : bigint, 'level' : LogLevel }
export type LogLevel = { 'Error' : null } |
  { 'Info' : null } |
  { 'Warn' : null } |
  { 'Debug' : null } |
  { 'Trace' : null };
export type MotokoResult = { 'ok' : null } |
  { 'err' : string };
export type MotokoResult_1 = { 'ok' : string } |
  { 'err' : string };
export type MotokoResult_2 = { 'ok' : Array<string> } |
  { 'err' : string };
export interface NftConfig {
  'got' : number,
  'interval' : bigint,
  'initial' : number,
}
export interface Page { 'page' : number, 'size' : number }
export interface PageData {
  'all' : number,
  'data' : Array<AuditCode>,
  'page' : number,
  'size' : number,
}
export interface PageData_1 {
  'all' : number,
  'data' : Array<Log>,
  'page' : number,
  'size' : number,
}
export interface PayConfig {
  'transfer_fee' : Price,
  'next_subaccount' : bigint,
  'ledger' : Principal,
  'price' : Price,
  'collect' : Principal,
}
export interface Price { 'e8s' : bigint }
export type Result = { 'Ok' : bigint } |
  { 'Err' : TransferError };
export type TransferError = {
    'TxTooOld' : { 'allowed_window_nanos' : bigint }
  } |
  { 'BadFee' : { 'expected_fee' : Price } } |
  { 'TxDuplicate' : { 'duplicate_of' : bigint } } |
  { 'TxCreatedInFuture' : null } |
  { 'InsufficientFunds' : { 'balance' : Price } };
export type TransferUser = { 'principal' : Principal } |
  { 'address' : string };
export interface TransformedAuditCodeWithStatus {
  'status' : AuditCodeStatus,
  'code' : string,
  'time' : bigint,
}
export interface UserDataResult {
  'moved' : Array<TransformedAuditCodeWithStatus>,
  'owned' : Array<TransformedAuditCodeWithStatus>,
  'used' : Array<TransformedAuditCodeWithStatus>,
  'using' : Array<TransformedAuditCodeWithStatus>,
}
export interface WalletReceiveResult { 'accepted' : bigint }
export interface _SERVICE {
  'canister_status' : ActorMethod<[], CanisterStatusResult>,
  'code_used' : ActorMethod<[Principal, string, string], MotokoResult>,
  'code_using' : ActorMethod<[Principal, string, string], MotokoResult_1>,
  'codes_find_by_page' : ActorMethod<[Page], PageData>,
  'codes_generate_by_nft' : ActorMethod<
    [number, number, Principal],
    Array<string>
  >,
  'codes_generate_by_nft_max_size' : ActorMethod<[number], number>,
  'codes_generate_by_pay' : ActorMethod<[Principal], Array<string>>,
  'codes_generate_by_pay_address' : ActorMethod<[], string>,
  'codes_generate_by_pay_balance' : ActorMethod<[], Balance>,
  'codes_generate_by_pay_price' : ActorMethod<[], Price>,
  'codes_generate_by_pay_retrieve' : ActorMethod<[Price, TransferUser], Result>,
  'codes_generate_by_permission' : ActorMethod<
    [number, Principal],
    Array<string>
  >,
  'codes_give' : ActorMethod<[Array<string>], MotokoResult>,
  'codes_query_by_user' : ActorMethod<[], UserDataResult>,
  'codes_reclaim' : ActorMethod<[Array<string>, Principal], MotokoResult_2>,
  'config_nft_find' : ActorMethod<[], NftConfig>,
  'config_nft_set' : ActorMethod<[NftConfig], boolean>,
  'config_pay_find' : ActorMethod<[], PayConfig>,
  'config_pay_set' : ActorMethod<[PayConfig], boolean>,
  'logs_delete' : ActorMethod<[number], boolean>,
  'logs_find_by_page' : ActorMethod<[Page], PageData_1>,
  'permissions_find' : ActorMethod<[], Array<[string, Array<AuditPermission>]>>,
  'permissions_grant_all_permissions' : ActorMethod<[Principal], boolean>,
  'permissions_has_all_permissions' : ActorMethod<[Principal], boolean>,
  'permissions_modify' : ActorMethod<
    [Principal, Array<AuditPermission>, Array<AuditPermission>],
    undefined
  >,
  'permissions_revoke_all_permissions' : ActorMethod<[Principal], boolean>,
  'wallet_balance' : ActorMethod<[], bigint>,
  'wallet_receive' : ActorMethod<[], WalletReceiveResult>,
}
