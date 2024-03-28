import { IdentityState } from './modules/identity';
import { DelegationIdentity, Ed25519KeyIdentity } from '@dfinity/identity';
import { LightState } from './modules/light';

interface StateType {
    meta: {
        'twitter:url': string;
        'twitter:type': string;
        'twitter:title': string;
        'twitter:description': string;
    };
    isHeader: boolean;
    user_principal: string | undefined;
    user_data:
        | {
              avatar: string;
              pid: string;
          }
        | undefined;
    user_canister: string;
    current_login_way: string | undefined;
    planets_data: string[];
    planets_loading: boolean;
    wallet_address: string | undefined;
    wallet_balance: number;
    ckbtc_wallet_balance: number;
    mora_wallet_balance: number;
    is_wallet: boolean;
    current_open_planet: string;
    current_planet_wallet_balance: number | null;
    current_planet_wallet_address: string;
    current_planet_cycles_balance: number | null;
    current_planet_wallet_balance_ckbtc: number | null;
    current_planet_data: any;
    agent: any;
    subscribes_loading: boolean;
    collections_loading: boolean;
    subscribes_data: string[];
    global_loading: boolean;
    theme: any;
    metamask_agent_hex: string | undefined;
    local_lang: string | undefined;
    directory_data: {
        id: string;
        type: string;
        text: string;
    }[];
    images_upload_ipfs: boolean;
    images_upload_ipfs_error: boolean;
    current_plugin_editor: string;
    current_plugin_editor_args: any;
    current_plugin_editor_args_idx: number | null;
    current_plugin_editor_args_is_record: boolean;
    method_list: any[];
    notice_list: any[];
    notice_loading: boolean;
    notice_state: 'OFF' | 'ON';
    current_identity: Ed25519KeyIdentity | DelegationIdentity | undefined;
    editor_ref: any;
    subscriptions_cache: any;
    planet_cache: any;
    comment_notice: any[];
    avatar_cache: {};
    connect2ic_init_state: boolean;
    is_web3auth: boolean;
    is_light_profile_audit: -1 | 1 | 2;
    light_collect_cache: any;
    light_save_timeout: number;
    light_save_tip: string;
    light_read_num: number | false;
}

export { StateType };
