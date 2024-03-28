import katexStyleContent from 'katex/dist/katex.css';
import katex from 'katex';
import './native-shim';

class WangEditorFormulaCard extends HTMLElement {
    private span: HTMLElement;

    static get observedAttributes() {
        return ['data-value'];
    }

    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        const document = shadow.ownerDocument;

        const style = document.createElement('style');
        style.innerHTML = katexStyleContent;
        shadow.appendChild(style);

        const style2 = document.createElement('style');
        style2.innerHTML = `

      .katex-display {
          margin: 0 0;
      }
    `;
        shadow.appendChild(style2);

        const span = document.createElement('div');
        span.style.width = '100%';
        shadow.appendChild(span);
        this.span = span;
    }

    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
        if (name === 'data-value') {
            if (oldValue == newValue) return;
            this.render(newValue || '');
        }
    }

    private render(value: string) {
        let str = value;
        if (
            str[0] === '$' &&
            str[1] === '$' &&
            str[str.length - 1] === '$' &&
            str[str.length - 2] === '$'
        ) {
            str = str.replace(/^\$\$|\$\$+$/g, '');
        }
        const macros = {
            '\\RR': '\\mathbb{R}',
        };
        katex.render(str, this.span, {
            displayMode: true,
            globalGroup: true,
            macros,
            throwOnError: false,
        });
    }
}

if (!window.customElements.get('w-e-formula-card')) {
    window.customElements.define('w-e-formula-card', WangEditorFormulaCard);
}
