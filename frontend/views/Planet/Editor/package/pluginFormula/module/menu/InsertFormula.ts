import { IModalMenu } from '@wangeditor/editor';
import {
    DomEditor,
    IDomEditor,
    SlateNode,
    SlateRange,
    t,
    genModalTextareaElems,
    genModalButtonElems,
} from '@wangeditor/editor';
import { SIGMA_SVG } from '../../constants/icon-svg';
import $, { DOMElement } from '../../utils/dom';
import { genRandomStr } from '../../utils/util';
import { FormulaElement } from '../custom-types';

function genDomID(): string {
    return genRandomStr('w-e-insert-formula');
}

class InsertFormulaMenu implements IModalMenu {
    readonly title = t('formula.insert');
    readonly iconSvg = SIGMA_SVG;
    readonly tag = 'button';
    readonly showModal = true;
    readonly modalWidth = 300;
    private $content: any = null;
    private readonly textareaId = genDomID();
    private readonly buttonId = genDomID();

    getValue(editor: IDomEditor): string | boolean {
        return '';
    }

    isActive(editor: IDomEditor): boolean {
        return false;
    }

    exec(editor: IDomEditor, value: string | boolean) {}

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

    getModalPositionNode(editor: IDomEditor): SlateNode | null {
        return null;
    }

    getModalContentElem(editor: IDomEditor): DOMElement {
        const { textareaId, buttonId } = this;

        const [textareaContainerElem, textareaElem] = genModalTextareaElems(
            t('formula.formula'),
            textareaId,
            t('formula.placeholder'),
        );
        const $textarea = $(textareaElem);
        const [buttonContainerElem] = genModalButtonElems(buttonId, t('formula.ok'));

        if (this.$content == null) {
            const $content = $('<div></div>');
            $content.on('click', `#${buttonId}`, (e) => {
                e.preventDefault();
                const value = $content.find(`#${textareaId}`).val().trim();
                this.insertFormula(editor, value);
                editor.hidePanelOrModal();
            });

            this.$content = $content;
        }

        const $content = this.$content;
        $content.html('');

        $content.append(textareaContainerElem);
        $content.append(buttonContainerElem);

        $textarea.val('');

        setTimeout(() => {
            $textarea.focus();
        });

        return $content[0];
    }

    private insertFormula(editor: IDomEditor, value: string) {
        if (!value) return;

        editor.restoreSelection();

        if (this.isDisabled(editor)) return;

        const formulaElem: FormulaElement = {
            type: 'formula',
            value,
            children: [{ text: '' }],
        };
        editor.insertNode(formulaElem);
    }
}

export default InsertFormulaMenu;
