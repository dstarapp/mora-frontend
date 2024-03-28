import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface CanisterInfoShow {
  'status' : CanisterStatusResult,
  'canister_id' : string,
}
export interface CanisterSettings {
  'freezing_threshold' : [] | [bigint],
  'controllers' : [] | [Array<Principal>],
  'memory_allocation' : [] | [bigint],
  'compute_allocation' : [] | [bigint],
}
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
export interface DoneLightExperienceManager {
  'id' : string,
  'status' : LightExperienceStatus,
  'created' : bigint,
  'user' : Principal,
  'canister_id' : Principal,
  'done_info' : LightExperienceInfo,
  'updated' : bigint,
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
export interface ExperienceInsertResult {
  'id' : string,
  'canister_id' : Principal,
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
export interface LightCoreContent {
  'id' : string,
  'info_json' : string,
  'core_json' : string,
  'experience_json' : string,
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
export interface LightExperienceInfo {
  'categories' : Array<string>,
  'thumbnail' : string,
  'runnable_planet' : LightExperienceRunnablePlanet,
  'name' : string,
  'cover' : string,
  'tags' : Array<string>,
  'instruction' : string,
}
export interface LightExperienceManager {
  'id' : string,
  'status' : LightExperienceStatus,
  'created' : bigint,
  'editing_info' : LightExperienceInfo,
  'user' : Principal,
  'done_info' : [] | [LightExperienceInfo],
  'updated' : bigint,
}
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
export interface LightExperienceStatusDone {
  'hash' : string,
  'canister_id' : Principal,
  'history' : Array<LightExperienceDoneInfo>,
  'timestamp' : bigint,
  'price' : LightExperienceDonePrice,
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
export interface LightExperienceStatusEditing {
  'reasons' : Uint32Array | number[],
  'timestamp' : bigint,
}
export interface LightExperienceStatusFrozen {
  'done' : [] | [LightExperienceStatusDone],
  'timestamp' : bigint,
  'done_auditing' : [] | [LightExperienceStatusDoneAuditing],
  'done_editing' : [] | [LightExperienceStatusDoneEditing],
  'done_rejected' : [] | [LightExperienceStatusDoneRejected],
  'reason' : string,
}
export interface LightExperienceStatusRejected {
  'reasons' : Uint32Array | number[],
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
export interface ManagedCanisterChecking {
  'check_number' : number,
  'next' : number,
}
export interface ManagedCanisterConfig {
  'maintained' : ManagedCanisterMaintained,
  'checking' : ManagedCanisterChecking,
  'initial' : ManagedCanisterInitial,
}
export interface ManagedCanisterInitial {
  'max_canister_count' : number,
  'initial_worker_cycles' : bigint,
  'max_worker_memory_size' : bigint,
}
export interface ManagedCanisterMaintained {
  'min_days' : number,
  'recharge_cycles' : bigint,
  'min_cycles' : bigint,
}
export type ManagerWorkerRefreshResult = { 'NewWorker' : CanisterInfoShow } |
  { 'Refreshed' : Array<CanisterInfoShow> } |
  { 'DeployFailed' : string };
export type MotokoResult = { 'ok' : Principal } |
  { 'err' : string };
export type MotokoResult_1 = { 'ok' : ExperienceInsertResult } |
  { 'err' : string };
export type MotokoResult_2 = { 'ok' : null } |
  { 'err' : string };
export type MotokoResult_3 = { 'ok' : boolean } |
  { 'err' : string };
export interface Page { 'page' : number, 'size' : number }
export interface PageData {
  'all' : number,
  'data' : Array<LightExperienceManager>,
  'page' : number,
  'size' : number,
}
export interface PageData_1 {
  'all' : number,
  'data' : Array<ExperienceUserCollection>,
  'page' : number,
  'size' : number,
}
export interface PageData_2 {
  'all' : number,
  'data' : Array<LightExperienceWorker>,
  'page' : number,
  'size' : number,
}
export interface PageData_3 {
  'all' : number,
  'data' : Array<LightExperienceReceipt>,
  'page' : number,
  'size' : number,
}
export interface PageData_4 {
  'all' : number,
  'data' : Array<DoneLightExperienceManager>,
  'page' : number,
  'size' : number,
}
export interface PageData_5 {
  'all' : number,
  'data' : Array<Log>,
  'page' : number,
  'size' : number,
}
export interface PageData_6 {
  'all' : number,
  'data' : Array<Principal>,
  'page' : number,
  'size' : number,
}
export interface Price { 'e8s' : bigint }
export interface TimerData { 'interval' : bigint, 'enabled' : boolean }
export type TransferUser = { 'principal' : Principal } |
  { 'address' : string };
export interface UpdateSettingsArgument {
  'canister_id' : Principal,
  'settings' : CanisterSettings,
}
export interface WalletReceiveResult { 'accepted' : bigint }
export interface _SERVICE {
  'canister_status' : ActorMethod<[], CanisterStatusResult>,
  'config_audit_canister_id_find' : ActorMethod<[], [] | [Principal]>,
  'config_audit_canister_id_set' : ActorMethod<[[] | [Principal]], boolean>,
  'config_core_manager_canister_id_find' : ActorMethod<[], [] | [Principal]>,
  'config_core_manager_canister_id_set' : ActorMethod<
    [[] | [Principal]],
    boolean
  >,
  'config_maintaining_find' : ActorMethod<[], boolean>,
  'config_maintaining_set' : ActorMethod<[boolean], boolean>,
  'config_managed_canister_config_find' : ActorMethod<
    [],
    ManagedCanisterConfig
  >,
  'config_managed_canister_config_set' : ActorMethod<
    [ManagedCanisterConfig],
    boolean
  >,
  'config_purchase_canister_id_find' : ActorMethod<[], [] | [Principal]>,
  'config_purchase_canister_id_set' : ActorMethod<[[] | [Principal]], boolean>,
  'config_timer_data_find' : ActorMethod<[], TimerData>,
  'config_timer_data_manual' : ActorMethod<[], ManagerWorkerRefreshResult>,
  'config_timer_data_set' : ActorMethod<[TimerData], boolean>,
  'experience_auditing' : ActorMethod<
    [string, string, string, LightExperienceDonePrice],
    MotokoResult
  >,
  'experience_collect' : ActorMethod<[string], MotokoResult>,
  'experience_collect_delete' : ActorMethod<[string], MotokoResult>,
  'experience_done' : ActorMethod<
    [string, string, LightCoreContent, Array<string>],
    MotokoResult
  >,
  'experience_done_price' : ActorMethod<
    [string, LightExperienceDonePrice],
    MotokoResult
  >,
  'experience_editing' : ActorMethod<
    [string, [] | [[LightExperienceInfo, LightExperienceContent]]],
    MotokoResult
  >,
  'experience_find_experience' : ActorMethod<
    [Principal, string],
    [] | [LightExperienceWorker]
  >,
  'experience_find_experiences' : ActorMethod<
    [Array<ExperienceQueryStatus>, Page],
    PageData
  >,
  'experience_find_user_collections' : ActorMethod<
    [Principal, Page],
    PageData_1
  >,
  'experience_find_user_experiences' : ActorMethod<
    [Principal, Page],
    PageData_2
  >,
  'experience_find_user_receipts' : ActorMethod<[Principal, Page], PageData_3>,
  'experience_frozen' : ActorMethod<[string, string], MotokoResult>,
  'experience_frozen_by_user' : ActorMethod<[string, string], MotokoResult>,
  'experience_insert' : ActorMethod<
    [LightExperienceInfo, LightExperienceContent],
    MotokoResult_1
  >,
  'experience_insert_experience' : ActorMethod<
    [Principal, LightExperienceWorker, Principal],
    MotokoResult_2
  >,
  'experience_query_experience_done' : ActorMethod<
    [string],
    [] | [DoneLightExperienceWorker]
  >,
  'experience_rejected' : ActorMethod<[string, string, string], MotokoResult>,
  'experience_removed' : ActorMethod<[string], MotokoResult>,
  'experiences_find_experiences_by_wrapped_status' : ActorMethod<
    [ExperienceQueryWrappedStatus, Page],
    PageData
  >,
  'experiences_query_experiences' : ActorMethod<[Page], PageData_4>,
  'experiences_query_experiences_by_conditions' : ActorMethod<
    [
      [] | [string],
      [] | [Array<string>],
      [] | [Array<string>],
      [] | [Principal],
      Page,
    ],
    PageData_4
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
  'user_find' : ActorMethod<[Principal], [] | [Principal]>,
  'users_find_by_page' : ActorMethod<[Page], PageData_6>,
  'wallet_balance' : ActorMethod<[], bigint>,
  'wallet_receive' : ActorMethod<[], WalletReceiveResult>,
  'worker_add_controller' : ActorMethod<[Principal, Principal], MotokoResult_2>,
  'worker_insert' : ActorMethod<[Principal], MotokoResult_2>,
  'worker_permissions_grant_all_permissions' : ActorMethod<
    [Principal, Principal],
    MotokoResult_3
  >,
  'worker_reinstall' : ActorMethod<[Principal], MotokoResult_2>,
  'worker_states_find' : ActorMethod<[], Array<CanisterInfoShow>>,
  'worker_states_refresh' : ActorMethod<[], ManagerWorkerRefreshResult>,
  'worker_update_settings' : ActorMethod<
    [UpdateSettingsArgument],
    MotokoResult_2
  >,
  'worker_upgrade' : ActorMethod<[Principal], MotokoResult_2>,
  'worker_wasm_find' : ActorMethod<[], [] | [Uint8Array | number[]]>,
  'worker_wasm_set' : ActorMethod<[[] | [Uint8Array | number[]]], boolean>,
  'workers' : ActorMethod<[], Array<Principal>>,
}
