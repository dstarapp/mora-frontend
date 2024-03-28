import { SlateElement } from '@wangeditor/editor';
import { FormulaElement } from './custom-types';

function formulaToHtml(elem: SlateElement, childrenHtml: string): string {
    const { value = '' } = elem as FormulaElement;
    return `<span data-w-e-type="formula" data-w-e-is-void data-w-e-is-inline data-value="${value}"></span>`;
}

const conf = {
    type: 'formula',
    elemToHtml: formulaToHtml,
};

export default conf;
