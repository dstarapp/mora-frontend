import { InsertFnType } from '.d';
import { t } from '@/i18n';
import {
    IDomEditor,
    IEditorConfig,
    Boot,
    SlateNode,
    DomEditor,
    SlateTransforms,
    SlateEditor,
    SlateElement,
} from '@wangeditor/editor';
import { ElMessage } from 'element-plus';
import { codeLangs } from './codeLangs';
import bus from 'vue3-eventbus';
import store from '@/store';
import { compression } from '@/request/axios/bv';
import CONFIG from '@/assets/config';
import debug from '@/utils/debug';

import markdownModule from '@wangeditor/plugin-md';
import formulaModule from '../package/pluginFormula';
import { editFormulaMenuConf, formulaMenuConf } from '../package/formula';
import { codeMenuConf } from '../package/codeBlock';
import { linkMenuConf } from '../package/insertLink';
import linkCardModule from '../package/linkCard';
import { previewMenuConf } from '../package/preview';
import uploadModule from '../package/uploadFile';
import { LocalHistoryMenuConf } from '../package/localHistory';
import mentionModule from '../package/mention';
import { showModalElem, hideModalElem } from './init-dom';
import thingImageModule from '../package/thingImage';
import pluginModule from '../package/plugin';

Boot.registerModule(markdownModule);
Boot.registerMenu(editFormulaMenuConf);
Boot.registerModule(formulaModule);
Boot.registerMenu(formulaMenuConf);
Boot.registerModule(linkCardModule);
Boot.registerMenu(codeMenuConf);
Boot.registerMenu(linkMenuConf);
Boot.registerModule(uploadModule);
Boot.registerMenu(previewMenuConf);
Boot.registerMenu(LocalHistoryMenuConf);
Boot.registerModule(mentionModule);
Boot.registerModule(thingImageModule);
Boot.registerModule(pluginModule);

const editorConfig: IEditorConfig = {
    placeholder: t('editor.editorPlaceholder'),
    scroll: false,
    hoverbarKeys: {
        link: {
            menuKeys: ['editLink2', 'unLink', 'viewLink', 'convertToLinkCard'],
        },
        image: {
            menuKeys: [],
        },
        video: {
            menuKeys: [],
        },
        pre: {
            menuKeys: [],
        },
        text: {
            menuKeys: [],
        },
        table: {
            menuKeys: [
                'tableHeader',
                'insertTableRow',
                'deleteTableRow',
                'insertTableCol',
                'deleteTableCol',
                'deleteTable',
            ],
        },
        divider: {},
    },
    MENU_CONF: {
        codeSelectLang: {
            codeLangs,
        },
        insertImage: {
            parseImageSrc(src: string): string {
                return src;
            },
        },
        onBeforeUpload(file) {
            return file;
        },
        uploadImage: {
            customBrowseAndUpload(insertFn: InsertFnType) {
                const selectedNode = DomEditor.getSelectedNodeByType(
                    store.state.editor_ref,
                    'thingImage',
                );
                if (!selectedNode) {
                    bus.emit('uploadImagesEmit', {
                        insertFn,
                        file: '',
                    });
                }
            },
            async customUpload(file: File, insertFn: InsertFnType) {
                if (!file.type.includes('image/')) {
                    ElMessage.error(t('editor.settings.notImages'));
                    return false;
                }
                bus.emit('uploadImagesEmit', {
                    insertFn,
                    file,
                });
                return false;
            },
        },
        uploadVideo: {
            customBrowseAndUpload(insertFn: InsertFnType) {
                bus.emit('uploadVideoEmit', {
                    insertFn,
                });
            },
            customInsert(res: any, insertFn: InsertFnType) {
                return false;
            },
        },
    },
    customAlert: function (info: string, type: string): void {
        switch (type) {
            case 'success':
                ElMessage.success(info);
                break;
            case 'info':
                ElMessage.info(info);
                break;
            case 'warning':
                ElMessage.warning(info);
                break;
            case 'error':
                ElMessage.error(info);
                break;
            default:
                ElMessage.info(info);
                break;
        }
    },
    readOnly: false,
    autoFocus: true,
    EXTEND_CONF: {
        mentionConfig: {
            showModal: showModalElem,
            hideModal: hideModalElem,
        },
    },
};

const imagesUploadIpfs = (editor) => {
    if (store.state.images_upload_ipfs) {
        return;
    }
    let imgList: any = [];
    editor.children.map(async (item) => {
        if (
            item.type === 'thingImage' &&
            item.src &&
            !~item.src.indexOf(CONFIG.imgBaseUrl) &&
            (~item.src.indexOf('https://') || ~item.src.indexOf('http://'))
        ) {
            imgList.push(item);
        }
    });
    if (imgList.length) {
        store.commit('SET_IMAGES_UPLOAD_IPFS', true);
        setTimeout(() => {
            let map = imgList.map((item) => {
                const dom = DomEditor.toDOMNode(editor, item);
                if (dom.classList.contains('imagesUploadIpfsError')) {
                    return new Promise((resolve) => {
                        resolve(false);
                    });
                } else {
                    dom.classList.add('imagesUploadIpfsLoading');
                    return new Promise(async (resolve, reject) => {
                        try {
                            let res: any = await compression({
                                url: item.src,
                                scale: CONFIG.compressionRatio,
                            });
                            if (res && res.imgUrl) {
                                debug('success', '', false);
                                const path = DomEditor.findPath(editor, item);
                                const nodeProps = JSON.parse(JSON.stringify(item));
                                let imgUrl = `${CONFIG.imgBaseUrl}${res.imgUrl}`;
                                nodeProps.src = imgUrl;
                                nodeProps.alt = '';
                                SlateTransforms.setNodes(editor, nodeProps, { at: path });
                                const dom = DomEditor.toDOMNode(editor, item);
                                dom.classList.remove('imagesUploadIpfsLoading');
                                bus.emit('addPictureHistory', imgUrl);
                                resolve(true);
                            } else {
                                debug('failed', res, false);
                                setTimeout(() => {
                                    const dom = DomEditor.toDOMNode(editor, item);
                                    dom.classList.remove('imagesUploadIpfsLoading');
                                    dom.classList.add('imagesUploadIpfsError');
                                }, 0);
                                reject();
                            }
                        } catch (err) {
                            debug('failed', err, false);
                            setTimeout(() => {
                                const dom = DomEditor.toDOMNode(editor, item);
                                dom.classList.remove('imagesUploadIpfsLoading');
                                dom.classList.add('imagesUploadIpfsError');
                            }, 0);
                            reject();
                        }
                    });
                }
            });
            Promise.all(map)
                .then((res) => {
                    store.commit('SET_IMAGES_UPLOAD_IPFS', false);
                    store.commit('SET_IMAGES_UPLOAD_IPFS_ERROR', false);
                })
                .catch((err) => {
                    store.commit('SET_IMAGES_UPLOAD_IPFS', false);
                    store.commit('SET_IMAGES_UPLOAD_IPFS_ERROR', true);
                });
        }, 0);
    } else {
        store.commit('SET_IMAGES_UPLOAD_IPFS', false);
        store.commit('SET_IMAGES_UPLOAD_IPFS_ERROR', true);
    }
};

const onChange = (editor: IDomEditor) => {
    const headers = editor.getElemsByTypePrefix('header');
    let directoryData = headers.map((header) => {
        const { id, type } = header;
        if (type === 'header1' || type === 'header2') {
            const text = SlateNode.string(header);
            return {
                id: id,
                type: type,
                text: text,
            };
        }
    });
    directoryData = directoryData.filter((item) => {
        if (item) {
            return item;
        }
    });
    store.commit('SET_DIRECTORY_DATA', directoryData);

    imagesUploadIpfs(editor);
};

const onDestroyeds = (editor: IDomEditor) => { };

const onFocus = (editor: IDomEditor) => {
    let editorMainDom = document.getElementById('wangeditor');
    if (editorMainDom) {
        editorMainDom.classList.add('focus');
    }
};

const onBlur = (editor: IDomEditor) => {
    let editorMainDom = document.getElementById('wangeditor');
    if (editorMainDom) {
        editorMainDom.classList.remove('focus');
    }
};

const customPaste = (editor: IDomEditor, event: ClipboardEvent) => {
    bus.emit('customPasteEmit', {
        editor: editor,
    });
};

export { editorConfig, onChange, onDestroyeds, onBlur, onFocus, customPaste };
