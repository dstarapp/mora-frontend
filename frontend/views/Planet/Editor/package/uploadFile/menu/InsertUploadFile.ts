import {
    IDomEditor,
    SlateTransforms,
    SlateEditor,
    SlateNode,
    SlateElement,
} from '@wangeditor/editor';
import { t } from '@/i18n';
import bus from 'vue3-eventbus';

// implements IModalMenu
class InsertUploadFileMenu {
    readonly title = t('editor.uploadFile.title');
    readonly iconSvg = '<svg></svg>';
    readonly tag = 'button';
    readonly modalWidth = 300;
    readonly showModal = true;
    currentEditor: IDomEditor | null = null;

    getValue(editor: IDomEditor): string | boolean {
        return '';
    }

    isActive(editor: IDomEditor): boolean {
        return false;
    }

    isDisabled(editor: IDomEditor): boolean {
        return false;
    }

    emitCallback = async (fileData) => {
        if (!this.currentEditor) {
            return;
        }

        await this.currentEditor.restoreSelection();
        const uploadFileElem = {
            type: 'uploadFile',
            value: fileData,
            children: [{ text: '' }],
        };
        // this.currentEditor.insertNode(uploadFileElem)

        let currentPath;
        const nodeEntries = SlateEditor.nodes(this.currentEditor, {
            match: (node: SlateNode) => {
                // TS syntax
                if (SlateElement.isElement(node)) {
                    if (node.type === 'paragraph') {
                        return true;
                    }
                }
                return false;
            },
            universal: true,
        });
        for (let nodeEntry of nodeEntries) {
            const [node, path] = nodeEntry;
            currentPath = path;
            break;
        }

        SlateTransforms.insertNodes(this.currentEditor, [uploadFileElem], {
            at: currentPath,
        });
    };

    exec(editor: IDomEditor, value: string | boolean) {
        this.currentEditor = editor;

        bus.emit('uploadFileEmit', {
            insertFn: this.emitCallback,
        });
    }
}

export default InsertUploadFileMenu;
