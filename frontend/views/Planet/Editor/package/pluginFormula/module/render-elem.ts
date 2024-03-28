import { h, VNode } from 'snabbdom';
import { SlateElement } from '@wangeditor/editor';
import { FormulaElement } from './custom-types';
import { DomEditor, IDomEditor, SlateTransforms, SlateRange } from '@wangeditor/editor';
import bus from 'vue3-eventbus';

function renderFormula(elem: SlateElement, children: VNode[] | null, editor: IDomEditor): VNode {
    const selected = DomEditor.isNodeSelected(editor, elem);
    const { value = '' } = elem as FormulaElement;
    const formulaVnode = h(
        'w-e-formula-card',
        {
            dataset: { value },
        },
        null,
    );

    const containerVnode = h(
        'div',
        {
            props: {
                contentEditable: false,
            },
            style: {
                display: 'inline-block',
                marginLeft: '3px',
                marginRight: '3px',
                border: selected
                    ? '1px dotted transparent'
                    : '1px dotted transparent',
                borderRadius: '3px',
                padding: '3px 6px',
                width: '100%',
                cursor: 'pointer',
            },
        },
        [formulaVnode],
    );

    const getSelectedElem = (editor: IDomEditor): FormulaElement | null => {
        const node = DomEditor.getSelectedNodeByType(editor, 'formula');
        if (node == null) return null;
        return node as FormulaElement;
    };

    const isDisabled = (editor: IDomEditor): boolean => {
        const { selection } = editor;
        if (selection == null) return true;
        if (SlateRange.isExpanded(selection)) return true;

        const formulaElem = getSelectedElem(editor);
        if (formulaElem == null) return true;
        return false;
    };

    const updateFormula = (editor: IDomEditor, value: string) => {
        if (!value) return;

        editor.restoreSelection();

        if (isDisabled(editor)) return;

        const selectedElem = getSelectedElem(editor);
        if (selectedElem == null) return;

        const path = DomEditor.findPath(editor, selectedElem);
        const props: Partial<FormulaElement> = { value };
        SlateTransforms.setNodes(editor, props, { at: path });

        editor.blur();
    };

    const formulaEmitCallback = (info) => {
        updateFormula(editor, info.formula);
    };

    if (selected) {
        bus.emit('formulaEmit', {
            callback: formulaEmitCallback,
            text: value,
        });
    }

    return containerVnode;
}

const conf = {
    type: 'formula',
    renderElem: renderFormula,
};

export default conf;
