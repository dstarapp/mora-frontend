import { IModalMenu } from '@wangeditor/editor';
import {
    DomEditor,
    IDomEditor,
    SlateNode,
    SlateTransforms,
    SlateRange,
    t,
    genModalTextareaElems,
    genModalButtonElems,
} from '@wangeditor/editor';
import { PENCIL_SVG } from '../../constants/icon-svg';
import $, { DOMElement } from '../../utils/dom';
import { genRandomStr } from '../../utils/util';
import { FormulaElement } from '../custom-types';

/**
 * DOM ID
 */
function genDomID(): string {
    return genRandomStr('w-e-insert-formula');
}

class EditFormulaMenu implements IModalMenu {
    readonly title = t('formula.edit');
    readonly iconSvg = PENCIL_SVG;
    readonly tag = 'button';
    readonly showModal = true;
    readonly modalWidth = 300;
    private $content: any = null;
    private readonly textareaId = genDomID();
    private readonly buttonId = genDomID();

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

    exec(editor: IDomEditor, value: string | boolean) {
    }

    isDisabled(editor: IDomEditor): boolean {
        const { selection } = editor;
        if (selection == null) return true;
        if (SlateRange.isExpanded(selection)) return true;

        const formulaElem = this.getSelectedElem(editor);
        if (formulaElem == null) return true;

        return false;
    }

    getModalPositionNode(editor: IDomEditor): SlateNode | null {
        return this.getSelectedElem(editor);
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
                this.updateFormula(editor, value);
                editor.hidePanelOrModal();
            });

            this.$content = $content;
        }

        const $content = this.$content;
        $content.html('');

        // append textarea and button
        $content.append(textareaContainerElem);
        $content.append(buttonContainerElem);

        // input val
        const value = this.getValue(editor);
        $textarea.val(value);

        // focus 
        setTimeout(() => {
            $textarea.focus();
        });

        return $content[0];
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
