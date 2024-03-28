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
export type CorePermission = { 'WorkerFrozen' : null } |
  { 'ManagerPermission' : null } |
  { 'ManagerConfig' : null } |
  { 'ManagerQuery' : null } |
  { 'WorkerLog' : null } |
  { 'ManagerUpgrade' : null } |
  { 'WorkerPermission' : null } |
  { 'ManagerSettings' : null } |
  { 'ManagerLog' : null } |
  { 'WorkerUpdate' : null } |
  { 'ManagerRefresh' : null } |
  { 'WorkerFind' : null } |
  { 'ManagerFind' : null } |
  { 'ManagerInsert' : null } |
  { 'ManagerWasm' : null } |
  { 'WorkerUnfrozen' : null } |
  { 'WorkerInsert' : null } |
  { 'WorkerQuery' : null };
export interface DefiniteCAnisterSettings {
  'freezing_threshold' : bigint,
  'controllers' : Array<Principal>,
  'memory_allocation' : bigint,
  'compute_allocation' : bigint,
}
export interface LightCore {
  'status' : LightCoreStatus,
  'created' : bigint,
  'content' : LightCoreContent,
  'hash' : string,
  'read' : bigint,
  'used' : bigint,
  'user' : Principal,
  'updated' : bigint,
}
export interface LightCoreContent {
  'id' : string,
  'info_json' : string,
  'core_json' : string,
  'experience_json' : string,
}
export type LightCoreStatus = {
    'FrozenByAuditor' : {
      'auditor' : Principal,
      'timestamp' : bigint,
      'reason' : string,
    }
  } |
  { 'Alive' : { 'auditor' : Principal, 'timestamp' : bigint } } |
  { 'FrozenByAuthor' : { 'timestamp' : bigint, 'reason' : string } };
export type LightExecutingQueryResult = { 'value' : LightExecutingQueryValue } |
  { 'none' : null } |
  { 'frozen' : string };
export interface LightExecutingQueryValue {
  'id' : string,
  'info_json' : string,
  'created' : bigint,
  'creator' : Principal,
  'core_json' : string,
  'hash' : string,
  'audited' : bigint,
  'auditor' : Principal,
  'updated' : bigint,
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
export type MotokoResult = { 'ok' : null } |
  { 'err' : string };
export type MotokoResult_1 = { 'ok' : Principal } |
  { 'err' : string };
export type MotokoResult_2 = { 'ok' : boolean } |
  { 'err' : string };
export interface Page { 'page' : number, 'size' : number }
export interface PageData {
  'all' : number,
  'data' : Array<string>,
  'page' : number,
  'size' : number,
}
export interface PageData_1 {
  'all' : number,
  'data' : Array<Log>,
  'page' : number,
  'size' : number,
}
export interface TimerData { 'interval' : bigint, 'enabled' : boolean }
export interface UpdateSettingsArgument {
  'canister_id' : Principal,
  'settings' : CanisterSettings,
}
export interface WalletReceiveResult { 'accepted' : bigint }
export interface _SERVICE {
  'canister_status' : ActorMethod<[], CanisterStatusResult>,
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
  'config_timer_data_find' : ActorMethod<[], TimerData>,
  'config_timer_data_manual' : ActorMethod<[], ManagerWorkerRefreshResult>,
  'config_timer_data_set' : ActorMethod<[TimerData], boolean>,
  'executing_query' : ActorMethod<[string], LightExecutingQueryResult>,
  'hash_find' : ActorMethod<[string], Principal>,
  'hashes_find_by_page' : ActorMethod<[Page], PageData>,
  'light_find' : ActorMethod<[string], [] | [LightCore]>,
  'light_frozen' : ActorMethod<[string, string, Principal], MotokoResult>,
  'light_insert' : ActorMethod<
    [string, LightCoreContent, Principal, Principal, Array<string>],
    MotokoResult_1
  >,
  'light_insert_core' : ActorMethod<[LightCore, Principal], MotokoResult>,
  'light_read' : ActorMethod<[string], bigint>,
  'light_unfrozen' : ActorMethod<[string, Principal], MotokoResult>,
  'logs_delete' : ActorMethod<[number], boolean>,
  'logs_find_by_page' : ActorMethod<[Page], PageData_1>,
  'permissions_find' : ActorMethod<[], Array<[string, Array<CorePermission>]>>,
  'permissions_grant_all_permissions' : ActorMethod<[Principal], boolean>,
  'permissions_has_all_permissions' : ActorMethod<[Principal], boolean>,
  'permissions_modify' : ActorMethod<
    [Principal, Array<CorePermission>, Array<CorePermission>],
    undefined
  >,
  'permissions_revoke_all_permissions' : ActorMethod<[Principal], boolean>,
  'wallet_balance' : ActorMethod<[], bigint>,
  'wallet_receive' : ActorMethod<[], WalletReceiveResult>,
  'worker_add_controller' : ActorMethod<[Principal, Principal], MotokoResult>,
  'worker_insert' : ActorMethod<[Principal], MotokoResult>,
  'worker_permissions_grant_all_permissions' : ActorMethod<
    [Principal, Principal],
    MotokoResult_2
  >,
  'worker_reinstall' : ActorMethod<[Principal], MotokoResult>,
  'worker_states_find' : ActorMethod<[], Array<CanisterInfoShow>>,
  'worker_states_refresh' : ActorMethod<[], ManagerWorkerRefreshResult>,
  'worker_update_settings' : ActorMethod<
    [UpdateSettingsArgument],
    MotokoResult
  >,
  'worker_upgrade' : ActorMethod<[Principal], MotokoResult>,
  'worker_wasm_find' : ActorMethod<[], [] | [Uint8Array | number[]]>,
  'worker_wasm_set' : ActorMethod<[[] | [Uint8Array | number[]]], boolean>,
  'workers' : ActorMethod<[], Array<Principal>>,
}
