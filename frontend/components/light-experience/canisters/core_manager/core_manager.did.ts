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
  const ManagedCanisterMaintained = IDL.Record({
    'min_days' : IDL.Nat16,
    'recharge_cycles' : IDL.Nat64,
    'min_cycles' : IDL.Nat,
  });
  const ManagedCanisterChecking = IDL.Record({
    'check_number' : IDL.Nat32,
    'next' : IDL.Nat32,
  });
  const ManagedCanisterInitial = IDL.Record({
    'max_canister_count' : IDL.Nat32,
    'initial_worker_cycles' : IDL.Nat,
    'max_worker_memory_size' : IDL.Nat,
  });
  const ManagedCanisterConfig = IDL.Record({
    'maintained' : ManagedCanisterMaintained,
    'checking' : ManagedCanisterChecking,
    'initial' : ManagedCanisterInitial,
  });
  const TimerData = IDL.Record({
    'interval' : IDL.Nat64,
    'enabled' : IDL.Bool,
  });
  const CanisterInfoShow = IDL.Record({
    'status' : CanisterStatusResult,
    'canister_id' : IDL.Text,
  });
  const ManagerWorkerRefreshResult = IDL.Variant({
    'NewWorker' : CanisterInfoShow,
    'Refreshed' : IDL.Vec(CanisterInfoShow),
    'DeployFailed' : IDL.Text,
  });
  const LightExecutingQueryValue = IDL.Record({
    'id' : IDL.Text,
    'info_json' : IDL.Text,
    'created' : IDL.Nat64,
    'creator' : IDL.Principal,
    'core_json' : IDL.Text,
    'hash' : IDL.Text,
    'audited' : IDL.Nat64,
    'auditor' : IDL.Principal,
    'updated' : IDL.Nat64,
  });
  const LightExecutingQueryResult = IDL.Variant({
    'value' : LightExecutingQueryValue,
    'none' : IDL.Null,
    'frozen' : IDL.Text,
  });
  const Page = IDL.Record({ 'page' : IDL.Nat32, 'size' : IDL.Nat32 });
  const PageData = IDL.Record({
    'all' : IDL.Nat32,
    'data' : IDL.Vec(IDL.Text),
    'page' : IDL.Nat32,
    'size' : IDL.Nat32,
  });
  const LightCoreStatus = IDL.Variant({
    'FrozenByAuditor' : IDL.Record({
      'auditor' : IDL.Principal,
      'timestamp' : IDL.Nat64,
      'reason' : IDL.Text,
    }),
    'Alive' : IDL.Record({
      'auditor' : IDL.Principal,
      'timestamp' : IDL.Nat64,
    }),
    'FrozenByAuthor' : IDL.Record({
      'timestamp' : IDL.Nat64,
      'reason' : IDL.Text,
    }),
  });
  const LightCoreContent = IDL.Record({
    'id' : IDL.Text,
    'info_json' : IDL.Text,
    'core_json' : IDL.Text,
    'experience_json' : IDL.Text,
  });
  const LightCore = IDL.Record({
    'status' : LightCoreStatus,
    'created' : IDL.Nat64,
    'content' : LightCoreContent,
    'hash' : IDL.Text,
    'read' : IDL.Nat64,
    'used' : IDL.Nat64,
    'user' : IDL.Principal,
    'updated' : IDL.Nat64,
  });
  const MotokoResult = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
  const MotokoResult_1 = IDL.Variant({
    'ok' : IDL.Principal,
    'err' : IDL.Text,
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
  const CorePermission = IDL.Variant({
    'WorkerFrozen' : IDL.Null,
    'ManagerPermission' : IDL.Null,
    'ManagerConfig' : IDL.Null,
    'ManagerQuery' : IDL.Null,
    'WorkerLog' : IDL.Null,
    'ManagerUpgrade' : IDL.Null,
    'WorkerPermission' : IDL.Null,
    'ManagerSettings' : IDL.Null,
    'ManagerLog' : IDL.Null,
    'WorkerUpdate' : IDL.Null,
    'ManagerRefresh' : IDL.Null,
    'WorkerFind' : IDL.Null,
    'ManagerFind' : IDL.Null,
    'ManagerInsert' : IDL.Null,
    'ManagerWasm' : IDL.Null,
    'WorkerUnfrozen' : IDL.Null,
    'WorkerInsert' : IDL.Null,
    'WorkerQuery' : IDL.Null,
  });
  const WalletReceiveResult = IDL.Record({ 'accepted' : IDL.Nat64 });
  const MotokoResult_2 = IDL.Variant({ 'ok' : IDL.Bool, 'err' : IDL.Text });
  const CanisterSettings = IDL.Record({
    'freezing_threshold' : IDL.Opt(IDL.Nat),
    'controllers' : IDL.Opt(IDL.Vec(IDL.Principal)),
    'memory_allocation' : IDL.Opt(IDL.Nat),
    'compute_allocation' : IDL.Opt(IDL.Nat),
  });
  const UpdateSettingsArgument = IDL.Record({
    'canister_id' : IDL.Principal,
    'settings' : CanisterSettings,
  });
  return IDL.Service({
    'canister_status' : IDL.Func([], [CanisterStatusResult], []),
    'config_maintaining_find' : IDL.Func([], [IDL.Bool], ['query']),
    'config_maintaining_set' : IDL.Func([IDL.Bool], [IDL.Bool], []),
    'config_managed_canister_config_find' : IDL.Func(
        [],
        [ManagedCanisterConfig],
        ['query'],
      ),
    'config_managed_canister_config_set' : IDL.Func(
        [ManagedCanisterConfig],
        [IDL.Bool],
        [],
      ),
    'config_timer_data_find' : IDL.Func([], [TimerData], ['query']),
    'config_timer_data_manual' : IDL.Func([], [ManagerWorkerRefreshResult], []),
    'config_timer_data_set' : IDL.Func([TimerData], [IDL.Bool], []),
    'executing_query' : IDL.Func([IDL.Text], [LightExecutingQueryResult], []),
    'hash_find' : IDL.Func([IDL.Text], [IDL.Principal], ['query']),
    'hashes_find_by_page' : IDL.Func([Page], [PageData], ['query']),
    'light_find' : IDL.Func([IDL.Text], [IDL.Opt(LightCore)], []),
    'light_frozen' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Principal],
        [MotokoResult],
        [],
      ),
    'light_insert' : IDL.Func(
        [
          IDL.Text,
          LightCoreContent,
          IDL.Principal,
          IDL.Principal,
          IDL.Vec(IDL.Text),
        ],
        [MotokoResult_1],
        [],
      ),
    'light_insert_core' : IDL.Func(
        [LightCore, IDL.Principal],
        [MotokoResult],
        [],
      ),
    'light_read' : IDL.Func([IDL.Text], [IDL.Nat64], []),
    'light_unfrozen' : IDL.Func([IDL.Text, IDL.Principal], [MotokoResult], []),
    'logs_delete' : IDL.Func([IDL.Nat32], [IDL.Bool], []),
    'logs_find_by_page' : IDL.Func([Page], [PageData_1], ['query']),
    'permissions_find' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Vec(CorePermission)))],
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
        [IDL.Principal, IDL.Vec(CorePermission), IDL.Vec(CorePermission)],
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
    'worker_add_controller' : IDL.Func(
        [IDL.Principal, IDL.Principal],
        [MotokoResult],
        [],
      ),
    'worker_insert' : IDL.Func([IDL.Principal], [MotokoResult], []),
    'worker_permissions_grant_all_permissions' : IDL.Func(
        [IDL.Principal, IDL.Principal],
        [MotokoResult_2],
        [],
      ),
    'worker_reinstall' : IDL.Func([IDL.Principal], [MotokoResult], []),
    'worker_states_find' : IDL.Func([], [IDL.Vec(CanisterInfoShow)], ['query']),
    'worker_states_refresh' : IDL.Func([], [ManagerWorkerRefreshResult], []),
    'worker_update_settings' : IDL.Func(
        [UpdateSettingsArgument],
        [MotokoResult],
        [],
      ),
    'worker_upgrade' : IDL.Func([IDL.Principal], [MotokoResult], []),
    'worker_wasm_find' : IDL.Func([], [IDL.Opt(IDL.Vec(IDL.Nat8))], ['query']),
    'worker_wasm_set' : IDL.Func([IDL.Opt(IDL.Vec(IDL.Nat8))], [IDL.Bool], []),
    'workers' : IDL.Func([], [IDL.Vec(IDL.Principal)], ['query']),
  });
};
export const init = ({ IDL }: any) => { return []; };
