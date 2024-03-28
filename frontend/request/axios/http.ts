import axios from 'axios';
import { ElMessage } from 'element-plus';
import CONFIG from '@/assets/config';
import { encrypt, decrypt } from '@/utils/crypto';
import Api from './api';
import { UpLoadReq } from '.d';

const editorBaseUrl = CONFIG.editorBaseUrl;
const rateBaseUrl = CONFIG.rateBaseUrl;
const homeBaseUrl = CONFIG.homeBaseUrl;
const twitterBaseUrl = CONFIG.twitterBaseUrl;
const timeOut = CONFIG.timeOut;

const http = axios.create({
    timeout: timeOut,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
    },
    baseURL: editorBaseUrl,
});

const http2 = axios.create({
    timeout: timeOut,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
    },
    baseURL: rateBaseUrl,
});

const http3 = axios.create({
    timeout: timeOut,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
    },
    baseURL: homeBaseUrl,
});

const http4 = axios.create({
    timeout: timeOut,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
    },
    baseURL: twitterBaseUrl,
});

http.interceptors.request.use(
    (config) => {
        config.data = encrypt(JSON.stringify(config.data));
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

http.interceptors.response.use(
    (res) => {
        if (!res.data.success) {
            return Promise.reject();
        }
        let str = decrypt(res.data.data);
        return JSON.parse(str);
    },
    (error) => {
        return Promise.reject(error);
    },
);

http3.interceptors.response.use(
    (res) => {
        if (res.status !== 200) {
            return Promise.reject();
        }
        let str = res.data;
        return str;
    },
    (error) => {
        return Promise.reject(error);
    },
);

const editorPost = (url, param = {}, config) => {
    return new Promise((resolve, reject) => {
        http.post(url, param, config)
            .then((resp) => {
                resolve && resolve(resp);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

const editorGet = (url, param = {}) => {
    return new Promise((resolve, reject) => {
        http.get(url, {
            params: param,
        })
            .then((resp) => {
                resolve && resolve(resp.data);
            })
            .catch((err) => {
                reject && reject(err);
            });
    });
};

const rateGet = (url, param = {}) => {
    return new Promise((resolve, reject) => {
        http2
            .get(url, {
                params: param,
            })
            .then((resp) => {
                resolve && resolve(resp.data);
            })
            .catch((err) => {
                reject && reject(err);
            });
    });
};

const homePost = (url, param = {}, config) => {
    return new Promise((resolve, reject) => {
        http3
            .post(url, param, config)
            .then((resp) => {
                resolve && resolve(resp);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

const homeGet = (url, param = {}) => {
    return new Promise((resolve, reject) => {
        http3
            .get(url, {
                params: param,
            })
            .then((resp) => {
                resolve && resolve(resp.data);
            })
            .catch((err) => {
                reject && reject(err);
            });
    });
};

const twitterGet = (url, param = {}) => {
    return new Promise((resolve, reject) => {
        http4
            .get(url, {
                params: param,
            })
            .then((resp) => {
                resolve && resolve(resp.data);
            })
            .catch((err) => {
                reject && reject(err);
            });
    });
};

const Upload = (file, params) => {
    let forms = new FormData();
    forms.append('fileStream', file);

    forms.append('content', encrypt(JSON.stringify(params)));
    const axiosUpload = axios.create({
        baseURL: editorBaseUrl,
        headers: {
            'Content-Type': 'multipart/form-data',
            'X-Requested-With': 'XMLHttpRequest',
        },
    });

    axiosUpload.interceptors.response.use(function (response) {
        return Promise.resolve(response.data);
    });

    return new Promise((resolve, reject) => {
        axiosUpload
            .post(Api.upload, forms)
            .then((res: UpLoadReq) => {
                if (!res.success) {
                    ElMessage.error(res.message);
                    reject();
                } else {
                    let data: any = JSON.parse(decrypt(res.data));
                    if (data.imgUrl) {
                        resolve(data.imgUrl);
                    } else {
                        reject();
                    }
                }
            })
            .catch((err) => {
                reject();
            });
    });
};

export { editorGet, editorPost, rateGet, homePost, homeGet, Upload, twitterGet };
