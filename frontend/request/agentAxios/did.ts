import { idlFactory as userAllotFactory } from '@/request/canister/user_allot.did';
import { idlFactory as usersFactory } from '@/request/canister/users.did';

const didCollection = {
    usersFactory,
    userAllotFactory,
};

export { didCollection };
