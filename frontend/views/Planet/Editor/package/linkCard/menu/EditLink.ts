import { IDomEditor, DomEditor } from '@wangeditor/editor';
import { t } from '@/i18n';
import { IButtonMenu } from '@wangeditor/editor';
import bus from 'vue3-eventbus';
import { LinkElement } from '../custom-types';
import { updateLink } from './helper';

let editorData: any = '';
class ConvertToLinkCard implements IButtonMenu {
    readonly title = t('editor.settings.editorLink');
    readonly iconSvg = '<svg></svg>';
    readonly tag = 'button';

    private getSelectedLinkElem(editor: IDomEditor): LinkElement | null {
        const node = DomEditor.getSelectedNodeByType(editor, 'link');
        if (node == null) return null;
        return node as LinkElement;
    }

    editorCallback(res) {
        editorData.restoreSelection();
        updateLink(editorData, res.text, res.link);
    }

    getValue(editor: IDomEditor): string | boolean {
        const linkElem = this.getSelectedLinkElem(editor);
        if (linkElem) {
            bus.emit('editLinkEmit', {
                callback: this.editorCallback,
                text: linkElem,
            });
            editorData = editor;
            return linkElem.url || '';
        }
        return '';
    }

    isActive(editor: IDomEditor): boolean {
        return false;
    }

    isDisabled(editor: IDomEditor): boolean {
        if (editor.selection == null) return true;

        const linkElem = this.getSelectedLinkElem(editor);
        if (linkElem == null) {
            return true;
        }
        return false;
    }

    async exec(editor: IDomEditor, value: string | boolean) { }
}

export default ConvertToLinkCard;
