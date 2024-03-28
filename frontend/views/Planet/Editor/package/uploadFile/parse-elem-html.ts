import { DOMElement } from './utils/dom';

const parseHtml = (elem: DOMElement) => {
    return {
        type: 'uploadFile',
        value: {
            total_size: elem.querySelectorAll('p')[1].innerText,
            file_name: elem.querySelectorAll('p')[0].innerText,
            link: elem.getAttribute('data-url'),
            file_extension: elem.querySelectorAll('i')[0].getAttribute('data-class'),
        },
        children: [{ text: '' }],
    };
};

const parseHtmlConf = {
    selector: 'div[data-w-e-type="upload-file"]',
    parseElemHtml: parseHtml,
};

export default parseHtmlConf;
