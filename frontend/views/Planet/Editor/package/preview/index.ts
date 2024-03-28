import PreviewButtonMenu from './preview';

export const previewMenuConf = {
    key: 'preview',
    factory() {
        return new PreviewButtonMenu();
    },
};
