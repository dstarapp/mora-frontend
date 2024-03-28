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
  const TransferUser = IDL.Variant({
    'principal' : IDL.Principal,
    'address' : IDL.Text,
  });
  const Price = IDL.Record({ 'e8s' : IDL.Nat64 });
  const LightExperienceDonePrice = IDL.Variant({
    'Free' : IDL.Null,
    'Price' : IDL.Record({ 'address' : TransferUser, 'price' : Price }),
  });
  const MotokoResult = IDL.Variant({ 'ok' : IDL.Principal, 'err' : IDL.Text });
  const LightCoreContent = IDL.Record({
    'id' : IDL.Text,
    'info_json' : IDL.Text,
    'core_json' : IDL.Text,
    'experience_json' : IDL.Text,
  });
  const LightExperienceRunnablePlanet = IDL.Variant({
    'All' : IDL.Null,
    'None' : IDL.Null,
    'Includes' : IDL.Vec(IDL.Text),
    'Excludes' : IDL.Vec(IDL.Text),
  });
  const LightExperienceInfo = IDL.Record({
    'categories' : IDL.Vec(IDL.Text),
    'thumbnail' : IDL.Text,
    'runnable_planet' : LightExperienceRunnablePlanet,
    'name' : IDL.Text,
    'cover' : IDL.Text,
    'tags' : IDL.Vec(IDL.Text),
    'instruction' : IDL.Text,
  });
  const LightExperienceContent = IDL.Record({
    'core_json' : IDL.Text,
    'experience_json' : IDL.Text,
  });
  const LightExperienceDoneInfo = IDL.Record({
    'hash' : IDL.Text,
    'canister_id' : IDL.Principal,
    'timestamp' : IDL.Nat64,
    'price' : LightExperienceDonePrice,
  });
  const LightExperienceStatusDone = IDL.Record({
    'hash' : IDL.Text,
    'canister_id' : IDL.Principal,
    'history' : IDL.Vec(LightExperienceDoneInfo),
    'timestamp' : IDL.Nat64,
    'price' : LightExperienceDonePrice,
  });
  const LightExperienceStatusAuditing = IDL.Record({
    'reasons' : IDL.Vec(IDL.Nat32),
    'code' : IDL.Text,
    'hash' : IDL.Text,
    'timestamp' : IDL.Nat64,
    'price' : LightExperienceDonePrice,
  });
  const LightExperienceStatusDoneAuditing = IDL.Record({
    'reasons' : IDL.Vec(IDL.Nat32),
    'code' : IDL.Text,
    'done' : LightExperienceStatusDone,
    'hash' : IDL.Text,
    'timestamp' : IDL.Nat64,
    'price' : LightExperienceDonePrice,
  });
  const LightExperienceStatusRejected = IDL.Record({
    'reasons' : IDL.Vec(IDL.Nat32),
    'timestamp' : IDL.Nat64,
    'reason' : IDL.Text,
  });
  const LightExperienceStatusDoneRejected = IDL.Record({
    'reasons' : IDL.Vec(IDL.Nat32),
    'done' : LightExperienceStatusDone,
    'timestamp' : IDL.Nat64,
    'reason' : IDL.Text,
  });
  const LightExperienceStatusEditing = IDL.Record({
    'reasons' : IDL.Vec(IDL.Nat32),
    'timestamp' : IDL.Nat64,
  });
  const LightExperienceStatusRemoved = IDL.Record({
    'editing' : IDL.Opt(LightExperienceStatusEditing),
    'timestamp' : IDL.Nat64,
    'rejected' : IDL.Opt(LightExperienceStatusRejected),
  });
  const LightExperienceStatusDoneEditing = IDL.Record({
    'reasons' : IDL.Vec(IDL.Nat32),
    'done' : LightExperienceStatusDone,
    'timestamp' : IDL.Nat64,
  });
  const LightExperienceStatusFrozen = IDL.Record({
    'done' : IDL.Opt(LightExperienceStatusDone),
    'timestamp' : IDL.Nat64,
    'done_auditing' : IDL.Opt(LightExperienceStatusDoneAuditing),
    'done_editing' : IDL.Opt(LightExperienceStatusDoneEditing),
    'done_rejected' : IDL.Opt(LightExperienceStatusDoneRejected),
    'reason' : IDL.Text,
  });
  const LightExperienceStatus = IDL.Variant({
    'Done' : LightExperienceStatusDone,
    'Auditing' : LightExperienceStatusAuditing,
    'DoneAuditing' : LightExperienceStatusDoneAuditing,
    'Rejected' : LightExperienceStatusRejected,
    'DoneRejected' : LightExperienceStatusDoneRejected,
    'Removed' : LightExperienceStatusRemoved,
    'DoneEditing' : LightExperienceStatusDoneEditing,
    'Frozen' : LightExperienceStatusFrozen,
    'Editing' : LightExperienceStatusEditing,
  });
  const LightExperienceWorker = IDL.Record({
    'id' : IDL.Text,
    'status' : LightExperienceStatus,
    'created' : IDL.Nat64,
    'editing_info' : LightExperienceInfo,
    'done_info' : LightExperienceInfo,
    'updated' : IDL.Nat64,
    'done_content' : LightExperienceContent,
    'editing_content' : LightExperienceContent,
  });
  const ExperienceQueryStatus = IDL.Variant({
    'Done' : IDL.Null,
    'Auditing' : IDL.Null,
    'DoneAuditing' : IDL.Null,
    'Rejected' : IDL.Null,
    'DoneRejected' : IDL.Null,
    'Removed' : IDL.Null,
    'DoneEditing' : IDL.Null,
    'Frozen' : IDL.Null,
    'Editing' : IDL.Null,
  });
  const Page = IDL.Record({ 'page' : IDL.Nat32, 'size' : IDL.Nat32 });
  const LightExperienceManager = IDL.Record({
    'id' : IDL.Text,
    'status' : LightExperienceStatus,
    'created' : IDL.Nat64,
    'editing_info' : LightExperienceInfo,
    'user' : IDL.Principal,
    'done_info' : IDL.Opt(LightExperienceInfo),
    'updated' : IDL.Nat64,
  });
  const PageData = IDL.Record({
    'all' : IDL.Nat32,
    'data' : IDL.Vec(LightExperienceManager),
    'page' : IDL.Nat32,
    'size' : IDL.Nat32,
  });
  const ExperienceUserCollection = IDL.Record({
    'id' : IDL.Text,
    'user' : IDL.Principal,
    'canister_id' : IDL.Principal,
    'timestamp' : IDL.Nat64,
  });
  const PageData_1 = IDL.Record({
    'all' : IDL.Nat32,
    'data' : IDL.Vec(ExperienceUserCollection),
    'page' : IDL.Nat32,
    'size' : IDL.Nat32,
  });
  const PageData_2 = IDL.Record({
    'all' : IDL.Nat32,
    'data' : IDL.Vec(LightExperienceWorker),
    'page' : IDL.Nat32,
    'size' : IDL.Nat32,
  });
  const LightExperienceReceipt = IDL.Record({
    'id' : IDL.Text,
    'created' : IDL.Nat64,
    'hash' : IDL.Text,
    'canister_id' : IDL.Principal,
    'seller' : IDL.Principal,
    'done_info' : LightExperienceInfo,
  });
  const PageData_3 = IDL.Record({
    'all' : IDL.Nat32,
    'data' : IDL.Vec(LightExperienceReceipt),
    'page' : IDL.Nat32,
    'size' : IDL.Nat32,
  });
  const ExperienceInsertResult = IDL.Record({
    'id' : IDL.Text,
    'canister_id' : IDL.Principal,
  });
  const MotokoResult_1 = IDL.Variant({
    'ok' : ExperienceInsertResult,
    'err' : IDL.Text,
  });
  const MotokoResult_2 = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
  const DoneLightExperienceWorker = IDL.Record({
    'id' : IDL.Text,
    'status' : LightExperienceStatus,
    'created' : IDL.Nat64,
    'done_info' : LightExperienceInfo,
    'updated' : IDL.Nat64,
    'done_content' : LightExperienceContent,
    'frozen_reason' : IDL.Opt(IDL.Text),
  });
  const ExperienceQueryWrappedStatus = IDL.Variant({
    'All' : IDL.Null,
    'Online' : IDL.Null,
    'Review' : IDL.Null,
    'Draft' : IDL.Null,
    'Offline' : IDL.Null,
    'Trash' : IDL.Null,
  });
  const DoneLightExperienceManager = IDL.Record({
    'id' : IDL.Text,
    'status' : LightExperienceStatus,
    'created' : IDL.Nat64,
    'user' : IDL.Principal,
    'canister_id' : IDL.Principal,
    'done_info' : LightExperienceInfo,
    'updated' : IDL.Nat64,
  });
  const PageData_4 = IDL.Record({
    'all' : IDL.Nat32,
    'data' : IDL.Vec(DoneLightExperienceManager),
    'page' : IDL.Nat32,
    'size' : IDL.Nat32,
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
  const PageData_5 = IDL.Record({
    'all' : IDL.Nat32,
    'data' : IDL.Vec(Log),
    'page' : IDL.Nat32,
    'size' : IDL.Nat32,
  });
  const ExperiencePermission = IDL.Variant({
    'ManagerPermission' : IDL.Null,
    'ManagerConfig' : IDL.Null,
    'WorkerPurchase' : IDL.Null,
    'WorkerConfig' : IDL.Null,
    'ManagerQuery' : IDL.Null,
    'WorkerLog' : IDL.Null,
    'ManagerUpgrade' : IDL.Null,
    'WorkerStatus' : IDL.Null,
    'WorkerCollect' : IDL.Null,
    'WorkerPermission' : IDL.Null,
    'ManagerSettings' : IDL.Null,
    'ManagerLog' : IDL.Null,
    'ManagerRefresh' : IDL.Null,
    'WorkerFind' : IDL.Null,
    'ManagerFind' : IDL.Null,
    'ManagerInsert' : IDL.Null,
    'ManagerWasm' : IDL.Null,
    'WorkerInsert' : IDL.Null,
    'WorkerQuery' : IDL.Null,
  });
  const PageData_6 = IDL.Record({
    'all' : IDL.Nat32,
    'data' : IDL.Vec(IDL.Principal),
    'page' : IDL.Nat32,
    'size' : IDL.Nat32,
  });
  const WalletReceiveResult = IDL.Record({ 'accepted' : IDL.Nat64 });
  const MotokoResult_3 = IDL.Variant({ 'ok' : IDL.Bool, 'err' : IDL.Text });
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
    'config_audit_canister_id_find' : IDL.Func(
        [],
        [IDL.Opt(IDL.Principal)],
        ['query'],
      ),
    'config_audit_canister_id_set' : IDL.Func(
        [IDL.Opt(IDL.Principal)],
        [IDL.Bool],
        [],
      ),
    'config_core_manager_canister_id_find' : IDL.Func(
        [],
        [IDL.Opt(IDL.Principal)],
        ['query'],
      ),
    'config_core_manager_canister_id_set' : IDL.Func(
        [IDL.Opt(IDL.Principal)],
        [IDL.Bool],
        [],
      ),
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
    'config_purchase_canister_id_find' : IDL.Func(
        [],
        [IDL.Opt(IDL.Principal)],
        ['query'],
      ),
    'config_purchase_canister_id_set' : IDL.Func(
        [IDL.Opt(IDL.Principal)],
        [IDL.Bool],
        [],
      ),
    'config_timer_data_find' : IDL.Func([], [TimerData], ['query']),
    'config_timer_data_manual' : IDL.Func([], [ManagerWorkerRefreshResult], []),
    'config_timer_data_set' : IDL.Func([TimerData], [IDL.Bool], []),
    'experience_auditing' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text, LightExperienceDonePrice],
        [MotokoResult],
        [],
      ),
    'experience_collect' : IDL.Func([IDL.Text], [MotokoResult], []),
    'experience_collect_delete' : IDL.Func([IDL.Text], [MotokoResult], []),
    'experience_done' : IDL.Func(
        [IDL.Text, IDL.Text, LightCoreContent, IDL.Vec(IDL.Text)],
        [MotokoResult],
        [],
      ),
    'experience_done_price' : IDL.Func(
        [IDL.Text, LightExperienceDonePrice],
        [MotokoResult],
        [],
      ),
    'experience_editing' : IDL.Func(
        [
          IDL.Text,
          IDL.Opt(IDL.Tuple(LightExperienceInfo, LightExperienceContent)),
        ],
        [MotokoResult],
        [],
      ),
    'experience_find_experience' : IDL.Func(
        [IDL.Principal, IDL.Text],
        [IDL.Opt(LightExperienceWorker)],
        [],
      ),
    'experience_find_experiences' : IDL.Func(
        [IDL.Vec(ExperienceQueryStatus), Page],
        [PageData],
        ['query'],
      ),
    'experience_find_user_collections' : IDL.Func(
        [IDL.Principal, Page],
        [PageData_1],
        [],
      ),
    'experience_find_user_experiences' : IDL.Func(
        [IDL.Principal, Page],
        [PageData_2],
        [],
      ),
    'experience_find_user_receipts' : IDL.Func(
        [IDL.Principal, Page],
        [PageData_3],
        [],
      ),
    'experience_frozen' : IDL.Func([IDL.Text, IDL.Text], [MotokoResult], []),
    'experience_frozen_by_user' : IDL.Func(
        [IDL.Text, IDL.Text],
        [MotokoResult],
        [],
      ),
    'experience_insert' : IDL.Func(
        [LightExperienceInfo, LightExperienceContent],
        [MotokoResult_1],
        [],
      ),
    'experience_insert_experience' : IDL.Func(
        [IDL.Principal, LightExperienceWorker, IDL.Principal],
        [MotokoResult_2],
        [],
      ),
    'experience_query_experience_done' : IDL.Func(
        [IDL.Text],
        [IDL.Opt(DoneLightExperienceWorker)],
        [],
      ),
    'experience_rejected' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text],
        [MotokoResult],
        [],
      ),
    'experience_removed' : IDL.Func([IDL.Text], [MotokoResult], []),
    'experiences_find_experiences_by_wrapped_status' : IDL.Func(
        [ExperienceQueryWrappedStatus, Page],
        [PageData],
        ['query'],
      ),
    'experiences_query_experiences' : IDL.Func([Page], [PageData_4], ['query']),
    'experiences_query_experiences_by_conditions' : IDL.Func(
        [
          IDL.Opt(IDL.Text),
          IDL.Opt(IDL.Vec(IDL.Text)),
          IDL.Opt(IDL.Vec(IDL.Text)),
          IDL.Opt(IDL.Principal),
          Page,
        ],
        [PageData_4],
        ['query'],
      ),
    'logs_delete' : IDL.Func([IDL.Nat32], [IDL.Bool], []),
    'logs_find_by_page' : IDL.Func([Page], [PageData_5], ['query']),
    'permissions_find' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Vec(ExperiencePermission)))],
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
        [
          IDL.Principal,
          IDL.Vec(ExperiencePermission),
          IDL.Vec(ExperiencePermission),
        ],
        [],
        [],
      ),
    'permissions_revoke_all_permissions' : IDL.Func(
        [IDL.Principal],
        [IDL.Bool],
        [],
      ),
    'user_find' : IDL.Func(
        [IDL.Principal],
        [IDL.Opt(IDL.Principal)],
        ['query'],
      ),
    'users_find_by_page' : IDL.Func([Page], [PageData_6], ['query']),
    'wallet_balance' : IDL.Func([], [IDL.Nat], ['query']),
    'wallet_receive' : IDL.Func([], [WalletReceiveResult], []),
    'worker_add_controller' : IDL.Func(
        [IDL.Principal, IDL.Principal],
        [MotokoResult_2],
        [],
      ),
    'worker_insert' : IDL.Func([IDL.Principal], [MotokoResult_2], []),
    'worker_permissions_grant_all_permissions' : IDL.Func(
        [IDL.Principal, IDL.Principal],
        [MotokoResult_3],
        [],
      ),
    'worker_reinstall' : IDL.Func([IDL.Principal], [MotokoResult_2], []),
    'worker_states_find' : IDL.Func([], [IDL.Vec(CanisterInfoShow)], ['query']),
    'worker_states_refresh' : IDL.Func([], [ManagerWorkerRefreshResult], []),
    'worker_update_settings' : IDL.Func(
        [UpdateSettingsArgument],
        [MotokoResult_2],
        [],
      ),
    'worker_upgrade' : IDL.Func([IDL.Principal], [MotokoResult_2], []),
    'worker_wasm_find' : IDL.Func([], [IDL.Opt(IDL.Vec(IDL.Nat8))], ['query']),
    'worker_wasm_set' : IDL.Func([IDL.Opt(IDL.Vec(IDL.Nat8))], [IDL.Bool], []),
    'workers' : IDL.Func([], [IDL.Vec(IDL.Principal)], ['query']),
  });
};
export const init = ({ IDL }: any) => { return []; };
