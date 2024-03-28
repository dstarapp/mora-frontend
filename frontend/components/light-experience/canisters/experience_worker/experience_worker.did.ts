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
  const TransferUser = IDL.Variant({
    'principal' : IDL.Principal,
    'address' : IDL.Text,
  });
  const Price = IDL.Record({ 'e8s' : IDL.Nat64 });
  const LightExperienceDonePrice = IDL.Variant({
    'Free' : IDL.Null,
    'Price' : IDL.Record({ 'address' : TransferUser, 'price' : Price }),
  });
  const LightExperienceStatusAuditingArg = IDL.Record({
    'code' : IDL.Text,
    'hash' : IDL.Text,
    'timestamp' : IDL.Nat64,
    'price' : LightExperienceDonePrice,
  });
  const MotokoResult = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
  const ExperienceUserCollection = IDL.Record({
    'id' : IDL.Text,
    'user' : IDL.Principal,
    'canister_id' : IDL.Principal,
    'timestamp' : IDL.Nat64,
  });
  const LightExperienceStatusDoneArg = IDL.Record({
    'id' : IDL.Text,
    'hash' : IDL.Text,
    'canister_id' : IDL.Principal,
    'timestamp' : IDL.Nat64,
  });
  const MotokoResult_1 = IDL.Variant({ 'ok' : IDL.Nat32, 'err' : IDL.Text });
  const LightExperienceDonePriceArg = IDL.Record({
    'timestamp' : IDL.Nat64,
    'price' : LightExperienceDonePrice,
  });
  const LightExperienceStatusDoneRestoreArg = IDL.Record({
    'timestamp' : IDL.Nat64,
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
  const LightExperienceStatusEditingArg = IDL.Record({
    'timestamp' : IDL.Nat64,
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
  const Page = IDL.Record({ 'page' : IDL.Nat32, 'size' : IDL.Nat32 });
  const PageData = IDL.Record({
    'all' : IDL.Nat32,
    'data' : IDL.Vec(ExperienceUserCollection),
    'page' : IDL.Nat32,
    'size' : IDL.Nat32,
  });
  const PageData_1 = IDL.Record({
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
  const PageData_2 = IDL.Record({
    'all' : IDL.Nat32,
    'data' : IDL.Vec(LightExperienceReceipt),
    'page' : IDL.Nat32,
    'size' : IDL.Nat32,
  });
  const LightExperienceStatusFrozenArg = IDL.Record({
    'timestamp' : IDL.Nat64,
    'reason' : IDL.Text,
  });
  const TrimmedLightExperienceWorker = IDL.Record({
    'id' : IDL.Text,
    'status' : LightExperienceStatus,
    'created' : IDL.Nat64,
    'editing_info' : LightExperienceInfo,
    'done_info' : LightExperienceInfo,
    'updated' : IDL.Nat64,
  });
  const PageData_3 = IDL.Record({
    'all' : IDL.Nat32,
    'data' : IDL.Vec(TrimmedLightExperienceWorker),
    'page' : IDL.Nat32,
    'size' : IDL.Nat32,
  });
  const DoneLightExperienceWorker = IDL.Record({
    'id' : IDL.Text,
    'status' : LightExperienceStatus,
    'created' : IDL.Nat64,
    'done_info' : LightExperienceInfo,
    'updated' : IDL.Nat64,
    'done_content' : LightExperienceContent,
    'frozen_reason' : IDL.Opt(IDL.Text),
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
  const ExperienceQueryWrappedStatus = IDL.Variant({
    'All' : IDL.Null,
    'Online' : IDL.Null,
    'Review' : IDL.Null,
    'Draft' : IDL.Null,
    'Offline' : IDL.Null,
    'Trash' : IDL.Null,
  });
  const LightExperienceAuditingResult = IDL.Record({
    'id' : IDL.Text,
    'code' : IDL.Text,
    'hash' : IDL.Text,
    'timestamp' : IDL.Nat64,
    'price' : LightExperienceDonePrice,
    'reason' : IDL.Opt(IDL.Text),
  });
  const LightExperienceFrozenByAuditor = IDL.Record({
    'auditor' : IDL.Principal,
    'timestamp' : IDL.Nat64,
    'reason' : IDL.Text,
  });
  const LightExperienceMessageContent = IDL.Variant({
    'AuditingResult' : LightExperienceAuditingResult,
    'FrozenByAuditor' : LightExperienceFrozenByAuditor,
    'FrozenByUserSelf' : LightExperienceStatusFrozenArg,
  });
  const LightExperienceMessage = IDL.Record({
    'read' : IDL.Bool,
    'message' : LightExperienceMessageContent,
    'index' : IDL.Nat32,
  });
  const PageData_4 = IDL.Record({
    'all' : IDL.Nat32,
    'data' : IDL.Vec(LightExperienceMessage),
    'page' : IDL.Nat32,
    'size' : IDL.Nat32,
  });
  const LightExperienceStatusRejectedArg = IDL.Record({
    'id' : IDL.Text,
    'timestamp' : IDL.Nat64,
    'reason' : IDL.Text,
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
  const WalletReceiveResult = IDL.Record({ 'accepted' : IDL.Nat64 });
  return IDL.Service({
    'canister_status' : IDL.Func([], [CanisterStatusResult], []),
    'config_maintaining_find' : IDL.Func([], [IDL.Bool], ['query']),
    'config_maintaining_set' : IDL.Func([IDL.Bool], [IDL.Bool], []),
    'experience_auditing' : IDL.Func(
        [IDL.Principal, IDL.Text, LightExperienceStatusAuditingArg],
        [MotokoResult],
        [],
      ),
    'experience_collect' : IDL.Func(
        [IDL.Principal, ExperienceUserCollection],
        [MotokoResult],
        [],
      ),
    'experience_collect_delete' : IDL.Func(
        [IDL.Principal, IDL.Text],
        [MotokoResult],
        [],
      ),
    'experience_done' : IDL.Func(
        [IDL.Principal, IDL.Text, LightExperienceStatusDoneArg],
        [MotokoResult_1],
        [],
      ),
    'experience_done_price' : IDL.Func(
        [IDL.Principal, IDL.Text, LightExperienceDonePriceArg],
        [MotokoResult],
        [],
      ),
    'experience_done_restore' : IDL.Func(
        [IDL.Principal, IDL.Text, LightExperienceStatusDoneRestoreArg],
        [MotokoResult],
        [],
      ),
    'experience_edit' : IDL.Func(
        [IDL.Text, LightExperienceInfo, LightExperienceContent],
        [MotokoResult],
        [],
      ),
    'experience_editing' : IDL.Func(
        [
          IDL.Principal,
          IDL.Text,
          LightExperienceStatusEditingArg,
          IDL.Opt(IDL.Tuple(LightExperienceInfo, LightExperienceContent)),
        ],
        [MotokoResult],
        [],
      ),
    'experience_find_experience' : IDL.Func(
        [IDL.Principal, IDL.Text],
        [IDL.Opt(LightExperienceWorker)],
        ['query'],
      ),
    'experience_find_experience_editing_info' : IDL.Func(
        [IDL.Principal, IDL.Text],
        [IDL.Opt(LightExperienceInfo)],
        ['query'],
      ),
    'experience_find_user_collections' : IDL.Func(
        [IDL.Principal, Page],
        [PageData],
        ['query'],
      ),
    'experience_find_user_experiences' : IDL.Func(
        [IDL.Principal, Page],
        [PageData_1],
        ['query'],
      ),
    'experience_find_user_receipts' : IDL.Func(
        [IDL.Principal, Page],
        [PageData_2],
        ['query'],
      ),
    'experience_find_users' : IDL.Func([], [IDL.Vec(IDL.Text)], ['query']),
    'experience_frozen' : IDL.Func(
        [
          IDL.Principal,
          IDL.Text,
          LightExperienceStatusFrozenArg,
          IDL.Opt(IDL.Principal),
        ],
        [MotokoResult_1],
        [],
      ),
    'experience_insert' : IDL.Func(
        [IDL.Principal, IDL.Text, LightExperienceInfo, LightExperienceContent],
        [MotokoResult],
        [],
      ),
    'experience_insert_experience' : IDL.Func(
        [IDL.Principal, LightExperienceWorker],
        [MotokoResult],
        [],
      ),
    'experience_insert_user' : IDL.Func([IDL.Principal], [MotokoResult], []),
    'experience_purchase' : IDL.Func(
        [IDL.Principal, LightExperienceReceipt],
        [MotokoResult],
        [],
      ),
    'experience_purchase_delete' : IDL.Func(
        [IDL.Principal, IDL.Text],
        [MotokoResult],
        [],
      ),
    'experience_query_all_experiences' : IDL.Func(
        [Page],
        [PageData_3],
        ['query'],
      ),
    'experience_query_collected' : IDL.Func([IDL.Text], [IDL.Bool], ['query']),
    'experience_query_collections' : IDL.Func([Page], [PageData], ['query']),
    'experience_query_experience' : IDL.Func(
        [IDL.Text],
        [IDL.Opt(LightExperienceWorker)],
        ['query'],
      ),
    'experience_query_experience_done' : IDL.Func(
        [IDL.Principal, IDL.Text],
        [IDL.Opt(DoneLightExperienceWorker)],
        ['query'],
      ),
    'experience_query_experience_done_by_id' : IDL.Func(
        [IDL.Text],
        [IDL.Opt(DoneLightExperienceWorker)],
        ['query'],
      ),
    'experience_query_experiences' : IDL.Func(
        [IDL.Vec(ExperienceQueryStatus), Page],
        [PageData_3],
        ['query'],
      ),
    'experience_query_experiences_by_wrapped_status' : IDL.Func(
        [ExperienceQueryWrappedStatus, Page],
        [PageData_3],
        ['query'],
      ),
    'experience_query_messages' : IDL.Func([Page], [PageData_4], ['query']),
    'experience_query_receipts' : IDL.Func([Page], [PageData_2], ['query']),
    'experience_read_message' : IDL.Func([IDL.Nat32], [MotokoResult], []),
    'experience_rejected' : IDL.Func(
        [IDL.Principal, IDL.Text, LightExperienceStatusRejectedArg],
        [MotokoResult_1],
        [],
      ),
    'experience_removed' : IDL.Func(
        [IDL.Principal, IDL.Text, LightExperienceStatusEditingArg],
        [MotokoResult],
        [],
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
    'wallet_balance' : IDL.Func([], [IDL.Nat], ['query']),
    'wallet_receive' : IDL.Func([], [WalletReceiveResult], []),
  });
};
export const init = ({ IDL }: any) => { return []; };
