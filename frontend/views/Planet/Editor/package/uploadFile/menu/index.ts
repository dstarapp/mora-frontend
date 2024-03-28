import InsertUploadFileMenu from './InsertUploadFile';

export const insertUploadFileMenuConf = {
    key: 'uploadFile',
    factory() {
        return new InsertUploadFileMenu();
    },
};
