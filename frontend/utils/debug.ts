import CONFIG from '@/assets/config';
import { saveLog } from '@/request/axios/bv';
import store from '@/store';

const debug = (title: string = 'debug', message: any = '', isBug = true): void => {
    if (CONFIG.isDebug) {
        console.log(`%c${title}`, 'color: #4e6ef2', message);
    }

    if (isBug && CONFIG.isDebugReport) {
        if (~window.location.href.indexOf('127.0.0.1')) {
            return;
        }

        saveLog({
            type: title,
            content:
                typeof message === 'object'
                    ? `${JSON.stringify(message)} #### ${message.toString()}`
                    : message,
            pid: store?.state?.user_principal,
            router: window.location.href,
        });
    }
};

export default debug;
