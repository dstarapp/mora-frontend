const placeholderText = 'Write a caption';

function mentionToHtml(elem, childrenHtml: string): string {
    const { src = '', mode = 'middle', uploadFail } = elem;

    let html =
        childrenHtml.trim() && childrenHtml !== placeholderText
            ? `<div data-mode="${mode}" class="thing-page-image"><img src="${src}"/><p class="Image-caption">${childrenHtml}</p></div>`
            : `<div data-mode="${mode}" class="thing-page-image"><img src="${src}"/><p class="Image-caption"></p></div>`;

    return uploadFail ? '<p></p>' : html;
}

const conf = {
    type: 'thingImage',
    elemToHtml: mentionToHtml,
};

export default conf;
