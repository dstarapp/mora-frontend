import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

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
export interface DoneLightExperienceWorker {
  'id' : string,
  'status' : LightExperienceStatus,
  'created' : bigint,
  'done_info' : LightExperienceInfo,
  'updated' : bigint,
  'done_content' : LightExperienceContent,
  'frozen_reason' : [] | [string],
}
export type ExperiencePermission = { 'ManagerPermission' : null } |
  { 'ManagerConfig' : null } |
  { 'WorkerPurchase' : null } |
  { 'WorkerConfig' : null } |
  { 'ManagerQuery' : null } |
  { 'WorkerLog' : null } |
  { 'ManagerUpgrade' : null } |
  { 'WorkerStatus' : null } |
  { 'WorkerCollect' : null } |
  { 'WorkerPermission' : null } |
  { 'ManagerSettings' : null } |
  { 'ManagerLog' : null } |
  { 'ManagerRefresh' : null } |
  { 'WorkerFind' : null } |
  { 'ManagerFind' : null } |
  { 'ManagerInsert' : null } |
  { 'ManagerWasm' : null } |
  { 'WorkerInsert' : null } |
  { 'WorkerQuery' : null };
export type ExperienceQueryStatus = { 'Done' : null } |
  { 'Auditing' : null } |
  { 'DoneAuditing' : null } |
  { 'Rejected' : null } |
  { 'DoneRejected' : null } |
  { 'Removed' : null } |
  { 'DoneEditing' : null } |
  { 'Frozen' : null } |
  { 'Editing' : null };
export type ExperienceQueryWrappedStatus = { 'All' : null } |
  { 'Online' : null } |
  { 'Review' : null } |
  { 'Draft' : null } |
  { 'Offline' : null } |
  { 'Trash' : null };
export interface ExperienceUserCollection {
  'id' : string,
  'user' : Principal,
  'canister_id' : Principal,
  'timestamp' : bigint,
}
export interface LightExperienceAuditingResult {
  'id' : string,
  'code' : string,
  'hash' : string,
  'timestamp' : bigint,
  'price' : LightExperienceDonePrice,
  'reason' : [] | [string],
}
export interface LightExperienceContent {
  'core_json' : string,
  'experience_json' : string,
}
export interface LightExperienceDoneInfo {
  'hash' : string,
  'canister_id' : Principal,
  'timestamp' : bigint,
  'price' : LightExperienceDonePrice,
}
export type LightExperienceDonePrice = { 'Free' : null } |
  { 'Price' : { 'address' : TransferUser, 'price' : Price } };
export interface LightExperienceDonePriceArg {
  'timestamp' : bigint,
  'price' : LightExperienceDonePrice,
}
export interface LightExperienceFrozenByAuditor {
  'auditor' : Principal,
  'timestamp' : bigint,
  'reason' : string,
}
export interface LightExperienceInfo {
  'categories' : Array<string>,
  'thumbnail' : string,
  'runnable_planet' : LightExperienceRunnablePlanet,
  'name' : string,
  'cover' : string,
  'tags' : Array<string>,
  'instruction' : string,
}
export interface LightExperienceMessage {
  'read' : boolean,
  'message' : LightExperienceMessageContent,
  'index' : number,
}
export type LightExperienceMessageContent = {
    'AuditingResult' : LightExperienceAuditingResult
  } |
  { 'FrozenByAuditor' : LightExperienceFrozenByAuditor } |
  { 'FrozenByUserSelf' : LightExperienceStatusFrozenArg };
export interface LightExperienceReceipt {
  'id' : string,
  'created' : bigint,
  'hash' : string,
  'canister_id' : Principal,
  'seller' : Principal,
  'done_info' : LightExperienceInfo,
}
export type LightExperienceRunnablePlanet = { 'All' : null } |
  { 'None' : null } |
  { 'Includes' : Array<string> } |
  { 'Excludes' : Array<string> };
export type LightExperienceStatus = { 'Done' : LightExperienceStatusDone } |
  { 'Auditing' : LightExperienceStatusAuditing } |
  { 'DoneAuditing' : LightExperienceStatusDoneAuditing } |
  { 'Rejected' : LightExperienceStatusRejected } |
  { 'DoneRejected' : LightExperienceStatusDoneRejected } |
  { 'Removed' : LightExperienceStatusRemoved } |
  { 'DoneEditing' : LightExperienceStatusDoneEditing } |
  { 'Frozen' : LightExperienceStatusFrozen } |
  { 'Editing' : LightExperienceStatusEditing };
export interface LightExperienceStatusAuditing {
  'reasons' : Uint32Array | number[],
  'code' : string,
  'hash' : string,
  'timestamp' : bigint,
  'price' : LightExperienceDonePrice,
}
export interface LightExperienceStatusAuditingArg {
  'code' : string,
  'hash' : string,
  'timestamp' : bigint,
  'price' : LightExperienceDonePrice,
}
export interface LightExperienceStatusDone {
  'hash' : string,
  'canister_id' : Principal,
  'history' : Array<LightExperienceDoneInfo>,
  'timestamp' : bigint,
  'price' : LightExperienceDonePrice,
}
export interface LightExperienceStatusDoneArg {
  'id' : string,
  'hash' : string,
  'canister_id' : Principal,
  'timestamp' : bigint,
}
export interface LightExperienceStatusDoneAuditing {
  'reasons' : Uint32Array | number[],
  'code' : string,
  'done' : LightExperienceStatusDone,
  'hash' : string,
  'timestamp' : bigint,
  'price' : LightExperienceDonePrice,
}
export interface LightExperienceStatusDoneEditing {
  'reasons' : Uint32Array | number[],
  'done' : LightExperienceStatusDone,
  'timestamp' : bigint,
}
export interface LightExperienceStatusDoneRejected {
  'reasons' : Uint32Array | number[],
  'done' : LightExperienceStatusDone,
  'timestamp' : bigint,
  'reason' : string,
}
export interface LightExperienceStatusDoneRestoreArg { 'timestamp' : bigint }
export interface LightExperienceStatusEditing {
  'reasons' : Uint32Array | number[],
  'timestamp' : bigint,
}
export interface LightExperienceStatusEditingArg { 'timestamp' : bigint }
export interface LightExperienceStatusFrozen {
  'done' : [] | [LightExperienceStatusDone],
  'timestamp' : bigint,
  'done_auditing' : [] | [LightExperienceStatusDoneAuditing],
  'done_editing' : [] | [LightExperienceStatusDoneEditing],
  'done_rejected' : [] | [LightExperienceStatusDoneRejected],
  'reason' : string,
}
export interface LightExperienceStatusFrozenArg {
  'timestamp' : bigint,
  'reason' : string,
}
export interface LightExperienceStatusRejected {
  'reasons' : Uint32Array | number[],
  'timestamp' : bigint,
  'reason' : string,
}
export interface LightExperienceStatusRejectedArg {
  'id' : string,
  'timestamp' : bigint,
  'reason' : string,
}
export interface LightExperienceStatusRemoved {
  'editing' : [] | [LightExperienceStatusEditing],
  'timestamp' : bigint,
  'rejected' : [] | [LightExperienceStatusRejected],
}
export interface LightExperienceWorker {
  'id' : string,
  'status' : LightExperienceStatus,
  'created' : bigint,
  'editing_info' : LightExperienceInfo,
  'done_info' : LightExperienceInfo,
  'updated' : bigint,
  'done_content' : LightExperienceContent,
  'editing_content' : LightExperienceContent,
}
export interface Log { 'content' : string, 'time' : bigint, 'level' : LogLevel }
export type LogLevel = { 'Error' : null } |
  { 'Info' : null } |
  { 'Warn' : null } |
  { 'Debug' : null } |
  { 'Trace' : null };
export type MotokoResult = { 'ok' : null } |
  { 'err' : string };
export type MotokoResult_1 = { 'ok' : number } |
  { 'err' : string };
export interface Page { 'page' : number, 'size' : number }
export interface PageData {
  'all' : number,
  'data' : Array<ExperienceUserCollection>,
  'page' : number,
  'size' : number,
}
export interface PageData_1 {
  'all' : number,
  'data' : Array<LightExperienceWorker>,
  'page' : number,
  'size' : number,
}
export interface PageData_2 {
  'all' : number,
  'data' : Array<LightExperienceReceipt>,
  'page' : number,
  'size' : number,
}
export interface PageData_3 {
  'all' : number,
  'data' : Array<TrimmedLightExperienceWorker>,
  'page' : number,
  'size' : number,
}
export interface PageData_4 {
  'all' : number,
  'data' : Array<LightExperienceMessage>,
  'page' : number,
  'size' : number,
}
export interface PageData_5 {
  'all' : number,
  'data' : Array<Log>,
  'page' : number,
  'size' : number,
}
export interface Price { 'e8s' : bigint }
export type TransferUser = { 'principal' : Principal } |
  { 'address' : string };
export interface TrimmedLightExperienceWorker {
  'id' : string,
  'status' : LightExperienceStatus,
  'created' : bigint,
  'editing_info' : LightExperienceInfo,
  'done_info' : LightExperienceInfo,
  'updated' : bigint,
}
export interface WalletReceiveResult { 'accepted' : bigint }
export interface _SERVICE {
  'canister_status' : ActorMethod<[], CanisterStatusResult>,
  'config_maintaining_find' : ActorMethod<[], boolean>,
  'config_maintaining_set' : ActorMethod<[boolean], boolean>,
  'experience_auditing' : ActorMethod<
    [Principal, string, LightExperienceStatusAuditingArg],
    MotokoResult
  >,
  'experience_collect' : ActorMethod<
    [Principal, ExperienceUserCollection],
    MotokoResult
  >,
  'experience_collect_delete' : ActorMethod<[Principal, string], MotokoResult>,
  'experience_done' : ActorMethod<
    [Principal, string, LightExperienceStatusDoneArg],
    MotokoResult_1
  >,
  'experience_done_price' : ActorMethod<
    [Principal, string, LightExperienceDonePriceArg],
    MotokoResult
  >,
  'experience_done_restore' : ActorMethod<
    [Principal, string, LightExperienceStatusDoneRestoreArg],
    MotokoResult
  >,
  'experience_edit' : ActorMethod<
    [string, LightExperienceInfo, LightExperienceContent],
    MotokoResult
  >,
  'experience_editing' : ActorMethod<
    [
      Principal,
      string,
      LightExperienceStatusEditingArg,
      [] | [[LightExperienceInfo, LightExperienceContent]],
    ],
    MotokoResult
  >,
  'experience_find_experience' : ActorMethod<
    [Principal, string],
    [] | [LightExperienceWorker]
  >,
  'experience_find_experience_editing_info' : ActorMethod<
    [Principal, string],
    [] | [LightExperienceInfo]
  >,
  'experience_find_user_collections' : ActorMethod<[Principal, Page], PageData>,
  'experience_find_user_experiences' : ActorMethod<
    [Principal, Page],
    PageData_1
  >,
  'experience_find_user_receipts' : ActorMethod<[Principal, Page], PageData_2>,
  'experience_find_users' : ActorMethod<[], Array<string>>,
  'experience_frozen' : ActorMethod<
    [Principal, string, LightExperienceStatusFrozenArg, [] | [Principal]],
    MotokoResult_1
  >,
  'experience_insert' : ActorMethod<
    [Principal, string, LightExperienceInfo, LightExperienceContent],
    MotokoResult
  >,
  'experience_insert_experience' : ActorMethod<
    [Principal, LightExperienceWorker],
    MotokoResult
  >,
  'experience_insert_user' : ActorMethod<[Principal], MotokoResult>,
  'experience_purchase' : ActorMethod<
    [Principal, LightExperienceReceipt],
    MotokoResult
  >,
  'experience_purchase_delete' : ActorMethod<[Principal, string], MotokoResult>,
  'experience_query_all_experiences' : ActorMethod<[Page], PageData_3>,
  'experience_query_collected' : ActorMethod<[string], boolean>,
  'experience_query_collections' : ActorMethod<[Page], PageData>,
  'experience_query_experience' : ActorMethod<
    [string],
    [] | [LightExperienceWorker]
  >,
  'experience_query_experience_done' : ActorMethod<
    [Principal, string],
    [] | [DoneLightExperienceWorker]
  >,
  'experience_query_experience_done_by_id' : ActorMethod<
    [string],
    [] | [DoneLightExperienceWorker]
  >,
  'experience_query_experiences' : ActorMethod<
    [Array<ExperienceQueryStatus>, Page],
    PageData_3
  >,
  'experience_query_experiences_by_wrapped_status' : ActorMethod<
    [ExperienceQueryWrappedStatus, Page],
    PageData_3
  >,
  'experience_query_messages' : ActorMethod<[Page], PageData_4>,
  'experience_query_receipts' : ActorMethod<[Page], PageData_2>,
  'experience_read_message' : ActorMethod<[number], MotokoResult>,
  'experience_rejected' : ActorMethod<
    [Principal, string, LightExperienceStatusRejectedArg],
    MotokoResult_1
  >,
  'experience_removed' : ActorMethod<
    [Principal, string, LightExperienceStatusEditingArg],
    MotokoResult
  >,
  'logs_delete' : ActorMethod<[number], boolean>,
  'logs_find_by_page' : ActorMethod<[Page], PageData_5>,
  'permissions_find' : ActorMethod<
    [],
    Array<[string, Array<ExperiencePermission>]>
  >,
  'permissions_grant_all_permissions' : ActorMethod<[Principal], boolean>,
  'permissions_has_all_permissions' : ActorMethod<[Principal], boolean>,
  'permissions_modify' : ActorMethod<
    [Principal, Array<ExperiencePermission>, Array<ExperiencePermission>],
    undefined
  >,
  'permissions_revoke_all_permissions' : ActorMethod<[Principal], boolean>,
  'wallet_balance' : ActorMethod<[], bigint>,
  'wallet_receive' : ActorMethod<[], WalletReceiveResult>,
}
