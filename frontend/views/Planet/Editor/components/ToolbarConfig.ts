import { IToolbarConfig } from '@wangeditor/editor';
const toolbarConfig: Partial<IToolbarConfig> = {
    toolbarKeys: [
        'undo',
        'redo',
        {
            key: 'group-more-style',
            title: 'H',
            iconSvg: '',
            menuKeys: ['header1', 'header2', 'header3', 'header4', 'header5'],
        },
        'clearStyle',
        'bold',
        'italic',
        'justifyLeft',
        'justifyCenter',
        'justifyRight',
        'bulletedList',
        'numberedList',
        'blockquote',
        'divider',
        'codeBlock2',
        'insertLink2',
        'uploadImage',
        'uploadVideo',
        'insertTable',
        'insertFormula2',
        'uploadFile',
        'preview',
        'localHistory',
        'plugin',
    ],
};

export default toolbarConfig;
