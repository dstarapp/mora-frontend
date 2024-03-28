import { CanisterStatus, HttpAgent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";

export type CanisterInfo = {
    time: Date;
    subnet: null | any;
    candid: null | any; 
    module_hash: string;
    controllers: Principal[];
};

export const canister_status = (canister_id: Principal): Promise<CanisterInfo> => {
    return new Promise<CanisterInfo>((resolve, reject) => {
        CanisterStatus.request({
            canisterId: canister_id,
            agent: new HttpAgent({
                host: "https://icp0.io/",
            }),
            paths: ["time", "controllers", "subnet", "module_hash", "candid"],
        })
            .then((r) => {
                resolve({
                    time: r.get("time") as Date,
                    subnet: r.get("subnet"),
                    candid: r.get("candid"),
                    module_hash: r.get("module_hash") as string,
                    controllers: r.get("controllers") as Principal[],
                });
            })
            .catch((e) => {
                reject(e);
            });
    });
};

export const canister_module_hash_and_time = (
    canister_id: Principal,
): Promise<{
    time: Date;
    module_hash: string;
}> => {
    return new Promise<{
        time: Date;
        module_hash: string;
    }>((resolve, reject) => {
        CanisterStatus.request({
            canisterId: canister_id,
            agent: new HttpAgent({
                host: "https://icp0.io/", 
            }),
            paths: ["time", "module_hash"],
        })
            .then((r) => {
                // console.error("CanisterStatus", r);
                resolve({
                    time: r.get("time") as Date,
                    module_hash: r.get("module_hash") as string,
                });
            })
            .catch((e) => {
                // console.error("CanisterStatus error", e);
                reject(e);
            });
    });
};
