import { IButtonMenu, IDomEditor, DomEditor } from '@wangeditor/core';
import { t } from '@/i18n';
import bus from 'vue3-eventbus';

export default class PreviewButtonMenu implements IButtonMenu {
    title: string;
    tag: string;
    iconSvg: string;
    currentEditor: IDomEditor | null;

    constructor() {
        this.title = t('editor.localHistory.title');
        this.tag = 'button';
        this.iconSvg = '<svg></svg>';
        this.currentEditor = null;
    }

    /**
     * node.url
     * @param editor editor
     */
    getValue(editor: IDomEditor): string | boolean {
        return '';
    }

    isActive(editor: IDomEditor): boolean {
        return false;
    }

    isDisabled(editor: IDomEditor): boolean {
        return false;
    }

    /**
     * @param editor editor
     * @param value node.type
     */
    exec(editor: IDomEditor, value: string | boolean) {
        bus.emit('localHistoryEmit', {});
    }
}
