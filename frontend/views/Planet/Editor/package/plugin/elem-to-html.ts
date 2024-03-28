function pluginToHtml(elem, childrenHtml: string): string {
    let value = elem.value;
    let prop = value.propValue ? encodeURI(value.propValue) : '';
    const html = `<div data-w-e-type="plugin"><div data-plugin-id="${value.id}" data-plugin-hash="${value.hash}" data-plugin-canister="${value.canister}" data-plugin-prop="${prop}"></div></div>`;
    return html;
}

const conf = {
    type: 'plugin',
    elemToHtml: pluginToHtml,
};

export default conf;
