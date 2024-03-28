import type { ActorMethod } from "@dfinity/agent";

export interface _SERVICE {
    // __get_candid_interface_tmp_hack: ActorMethod<[], string>;
    __get_candid_interface_tmp_hack: () => Promise<string>; 
}
