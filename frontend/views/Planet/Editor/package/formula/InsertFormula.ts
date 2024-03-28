import { IButtonMenu } from '@wangeditor/editor';
import { DomEditor, IDomEditor, SlateRange } from '@wangeditor/editor';
import { FormulaElement } from './custom-types';
import bus from 'vue3-eventbus';
import { t } from '@/i18n';

class InsertFormulaMenu implements IButtonMenu {
    title: string;
    tag: string;
    iconSvg: string;
    currentEditor: any;

    constructor() {
        this.title = t('editor.formula.title');
        this.tag = 'button';
        this.iconSvg = '<svg></svg>';
        this.currentEditor = '';
    }

    getValue(editor: IDomEditor): string | boolean {
        return '';
    }

    isActive(editor: IDomEditor): boolean {
        return false;
    }

    isDisabled(editor: IDomEditor): boolean {
        const { selection } = editor;
        if (selection == null) return true;
        if (SlateRange.isExpanded(selection)) return true;

        const selectedElems = DomEditor.getSelectedElems(editor);

        const hasVoidElem = selectedElems.some((elem) => editor.isVoid(elem));
        if (hasVoidElem) return true;

        const hasPreElem = selectedElems.some((elem) => DomEditor.getNodeType(elem) === 'pre');
        if (hasPreElem) return true;

        return false;
    }

    formulaEmitCallback = (info) => {
        this.currentEditor.restoreSelection();
        if (this.isDisabled(this.currentEditor)) return;
        const formulaElem: FormulaElement = {
            type: 'formula',
            value: info.formula,
            children: [{ text: '' }],
        };
        const p2 = {
            type: 'paragraph',
            children: [{ text: '' }],
        };
        this.currentEditor.insertNode(formulaElem);
        this.currentEditor.insertNode(p2);
        // SlateTransforms.insertNodes(this.currentEditor, [newPreNode, p2], {
        //     at: currentPath,
        // });
    };

    exec(editor: IDomEditor, value: string | boolean) {
        this.currentEditor = editor;
        bus.emit('formulaEmit', {
            callback: this.formulaEmitCallback,
            text: '',
        });
    }
}

export default InsertFormulaMenu;
