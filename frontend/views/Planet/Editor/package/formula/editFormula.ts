import { IButtonMenu } from '@wangeditor/editor';
import { DomEditor, IDomEditor, SlateTransforms, SlateRange } from '@wangeditor/editor';
import { FormulaElement } from './custom-types';
import bus from 'vue3-eventbus';
import { t } from '@/i18n';

class EditFormulaMenu implements IButtonMenu {
    title: string;
    tag: string;
    iconSvg: string;
    currentEditor: any;

    constructor() {
        this.title = t('editor.formula.editor');
        this.tag = 'button';
        this.iconSvg = '<svg></svg>';
        this.currentEditor = '';
    }

    private getSelectedElem(editor: IDomEditor): FormulaElement | null {
        const node = DomEditor.getSelectedNodeByType(editor, 'formula');
        if (node == null) return null;
        return node as FormulaElement;
    }

    /**
     * @param editor editor
     */
    getValue(editor: IDomEditor): string | boolean {
        const formulaElem = this.getSelectedElem(editor);
        if (formulaElem) {
            return formulaElem.value || '';
        }
        return '';
    }

    isActive(editor: IDomEditor): boolean {
        return false;
    }

    formulaEmitCallback = (info) => {
        this.updateFormula(this.currentEditor, info.formula);
    };

    exec(editor: IDomEditor, value: string | boolean) {
        this.currentEditor = editor;
        bus.emit('formulaEmit', {
            callback: this.formulaEmitCallback,
            text: value,
        });
    }

    isDisabled(editor: IDomEditor): boolean {
        const { selection } = editor;
        if (selection == null) return true;
        if (SlateRange.isExpanded(selection)) return true;

        const formulaElem = this.getSelectedElem(editor);
        if (formulaElem == null) return true;
        return false;
    }

    private updateFormula(editor: IDomEditor, value: string) {
        if (!value) return;

        editor.restoreSelection();

        if (this.isDisabled(editor)) return;

        const selectedElem = this.getSelectedElem(editor);
        if (selectedElem == null) return;

        const path = DomEditor.findPath(editor, selectedElem);
        const props: Partial<FormulaElement> = { value };
        SlateTransforms.setNodes(editor, props, { at: path });
    }
}

export default EditFormulaMenu;
