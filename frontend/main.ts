import { createApp } from 'vue';
import { getParams } from '@/utils/functions';
import App from './App.vue';
import router from './router';
import store from './store';
// ElementPlus
import ElementPlus from 'element-plus';
// meta
import { createMetaManager } from 'vue-meta';
// i18n
import i18n from './i18n';
// bus
import bus from 'vue3-eventbus';
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
// windi
import 'virtual:windi.css';
import 'normalize.css/normalize.css';
import '@/assets/less/public.less';
import '@/assets/less/theme.less';
import '@/assets/less/element.less';
import '@/assets/iconfont/iconfont.css';
// import 'default-passive-events';
import DOMPurify from 'dompurify';
import VueDOMPurifyHTML from 'vue-dompurify-html';
import '@/assets/less/prismjs.less';
import 'katex/dist/katex.css';
import Prism from 'prismjs';
Prism.highlightAll();

import '@mora-light/vue/index.css';
import '@mora-light/vue/iconfont.css';

// vconsole
import Vconsole from 'vconsole';

if (getParams('debug') === 'true') {
    new Vconsole();
}

const app = createApp(App);
app.directive('focus', {
    mounted(el) {
        if (el?.querySelectorAll('input').length) {
            el.querySelectorAll('input')[0].focus();
        }
        if (el?.querySelectorAll('textarea').length) {
            el.querySelectorAll('textarea')[0].focus();
        }
    },
});
app.use(
    createMetaManager(false, {
        meta: { tag: 'meta', nameless: true },
    }),
);
app.use(store);
app.use(router);
app.use(i18n);
app.use(bus);
app.use(ElementPlus);
app.use(VueDOMPurifyHTML, {
    default: {
        sanitizer: DOMPurify.sanitize,
        allowedTags: ['b', 'i', 'u', 'em', 'strong', 'a', 'p'],
    },
});
app.mount('#root');
