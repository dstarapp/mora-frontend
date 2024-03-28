import { IDomEditor } from '@wangeditor/editor';
import { t } from '@/i18n';

// implements IModalMenu
class InsertPluginMenu {
    readonly title = t('editor.plugin.title');
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

    exec(editor: IDomEditor, value: string | boolean) {
        this.currentEditor = editor;
    }
}

export default InsertPluginMenu;
