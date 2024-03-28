import { Actor, HttpAgent } from '@dfinity/agent';
import bus from 'vue3-eventbus';
import CONFIG from '@/assets/config';
import debug from '@/utils/debug';
import store from '@/store';
import { didCollection } from './did';

const STATE_CODE = {
    403: {
        success: false,
        code: 403,
        message: 'Permission Denied',
    },
    400: {
        success: false,
        code: 403,
        message: 'Not find actor',
    },
    500: {
        success: false,
        code: 500,
    },
    200: {
        success: true,
        code: 200,
        message: 'Request success',
    },
};

class AgentAxios {
    private realActor: {};
    private anonyActor: {};

    constructor() {
        this.realActor = {};
        this.anonyActor = {};
    }

    get _realActor() {
        return this.realActor;
    }

    get _anonyActor() {
        return this.anonyActor;
    }

    clearActor() {
        this.realActor = {};
    }

    async getActor(canisterId: string, canisterName: string, agent) {
        const _axios = agent ? this.realActor : this.anonyActor;
        if (_axios[canisterId]) {
            return _axios[canisterId];
        }
        const isAgent = agent;
        let idlFactory;
        if (!agent) {
            agent = new HttpAgent({ host: 'https://icp0.io/' });
        }
        switch (typeof canisterName) {
            case 'string':
                idlFactory = didCollection[canisterName];
                break;
            case 'object':
                idlFactory = canisterName;
                break;
        }
        try {
            const actor = await Actor.createActor(idlFactory, {
                agent,
                canisterId,
            });
            if (isAgent) {
                this.realActor[canisterId] = actor;
            } else {
                this.anonyActor[canisterId] = actor;
            }
            return actor;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    async callFunc(canisterId: string, methodName: string, paramet: any, isAgent = false) {
        if (isAgent && !store.state.agent) {
            debug('AgentAxios', STATE_CODE[403]);
            return STATE_CODE[403];
        }
        const _axios = isAgent ? this.realActor : this.anonyActor;
        if (!_axios[canisterId]) {
            debug('AgentAxios', STATE_CODE[400]);
            return STATE_CODE[400];
        }
        try {
            let res;
            if (!paramet) {
                res = await _axios[canisterId][methodName]();
            } else {
                res = await _axios[canisterId][methodName](paramet);
            }
            return {
                ...STATE_CODE[200],
                data: res,
            };
        } catch (err) {
            debug('AgentAxios', {
                ...STATE_CODE[500],
                message: err,
            });
            return {
                ...STATE_CODE[500],
                message: err,
            };
        }
    }

    init() {}
}

export default AgentAxios;
