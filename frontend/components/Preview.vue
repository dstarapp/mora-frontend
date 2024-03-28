<template>
    <div class="container" translate="yes">
        <div v-if="title" class="title">{{ title }}</div>
        <div ref="contentDom" class="content" id="preview" v-html="contentData" @click="showImg($event)"></div>

        <AtPlanet v-if="offsetTop || offsetLeft" :offsetTop="offsetTop" :offsetLeft="offsetLeft"
            :principalID="principalID" />
    </div>

    <transition name="el-fade-in-linear">
        <div class="mymodal" v-if="data.imgPreview.imgUrl">
            <div class="myImg" @click="hideImg">
                <img :src="data.imgPreview.imgUrl" />
            </div>
        </div>
    </transition>
</template>

<script lang="ts">
import {
    defineComponent,
    reactive,
    onMounted,
    nextTick,
    ref,
    h,
    render,
    createApp,
    computed,
} from 'vue';
import katex from 'katex';
import { cardInfo } from '@/request/axios/bv';
import { exportFile, pushDataFilterText } from '@/utils/functions';
import Prism from 'prismjs';
import { getImagesUrl } from '@/utils/functions';
import AtPlanet from './AtPlanet.vue';
import { useRouter } from 'vue-router';
import { queryExecutingExperience } from '@/components/light-experience/canisters/core_worker/apis';
import { LightExecutingQueryResult } from '@/components/light-experience/canisters/core_worker/core_worker.did.d';
import { WrappedMoraLight as WrappedMoraLightVue } from '@mora-light/vue';
import store from '@/store';
import { Agent } from '@dfinity/agent';

export default defineComponent({
    components: { AtPlanet },
    props: {
        title: { type: String },
        content: { type: String },
    },
    setup(props, context) {
        const router = useRouter();
        const data = reactive({
            imgPreview: {
                imgUrl: '',
                isShowImg: false,
            },
        });
        const contentDom = ref();
        const contentData = ref(props.content);
        const offsetTop = ref();
        const offsetLeft = ref();
        const principalID = ref();

        const agent = computed<Agent>(() => store.state.agent);
        const showImg = (e: any) => {
            if (e.target.tagName == 'IMG') {
                data.imgPreview.imgUrl = e.target.src;
                document.documentElement.style.overflow = 'hidden';
            }
        };

        const hideImg = () => {
            data.imgPreview.imgUrl = '';
            document.documentElement.style.overflow = 'auto';
        };

        const parsingDom = () => {
            const dom = contentDom.value;

            for (const item of dom.childNodes) {

                if (item.nodeName === 'DIV' && item.getAttribute('data-w-e-type') === 'link-card') {
                    item.classList.add('loading');
                    const url = item.getAttribute('data-url');
                    const title = item.getAttribute('data-linktext');
                    const str = {
                        url,
                        reqTime: Date.now(),
                    };
                    cardInfo(str)
                        .then((res: any) => {
                            if (res.html) {
                                item.removeChild(item.lastElementChild);
                                const range = document.createRange();
                                range.selectNode(document.body);
                                const documentFragment = range.createContextualFragment(res.html);
                                item.appendChild(documentFragment);
                                item.classList.remove('loading');
                                setTimeout(() => {
                                    addEmbed();
                                }, 1000);
                            } else {
                                const html = `<a target="_blank" href="${res.url}"><span><p>${res.title
                                    }</p><p>${res.description ? res.description : ''}</p><p><i></i>${res.url
                                    }</p></span></a>`;
                                item.innerHTML = html;
                            }
                        })
                        .catch(() => { });
                }

                if (item.nodeName === 'SPAN' && item.getAttribute('data-w-e-type') === 'formula') {
                    const formula = item.getAttribute('data-value');
                    let str = formula;
                    str = str.replace(/^[\s$]*|\s*$/g, '').replace(/\$+/g, '');
                    str = str.trim();
                    katex.render(str, item, {
                        displayMode: true,
                        globalGroup: true,
                        // macros,
                        throwOnError: false,
                        strict: false,
                    });
                }

                if (item.querySelector && item.querySelector('[data-w-e-type="formula"]')) {
                    const dom = item.querySelectorAll('[data-w-e-type="formula"]');
                    if (!dom.length) {
                        return;
                    }
                    for (const list of dom) {
                        const formula = list.getAttribute('data-value');
                        let str = formula;
                        str = str.replace(/^[\s$]*|\s*$/g, '').replace(/\$+/g, '');
                        str = str.trim();
                        katex.render(str, list, {
                            displayMode: true,
                            globalGroup: true,
                            // macros,
                            throwOnError: false,
                            strict: false,
                        });
                    }
                }

                if (item.nodeName === 'IMG') {
                    item.classList.add('imgLoading');
                    item.src = getImagesUrl(item.src, 1920);
                    item.onload = () => {
                        item.classList.remove('imgLoading');
                    };

                    const alt = item.alt;
                    const p = document.createElement('figcaption');
                    p.classList.add('imgCaption');
                    if (alt) {
                        try {
                            p.innerHTML = decodeURIComponent(alt);
                        } catch {
                            p.innerHTML = alt;
                        }
                    }
                    item.parentNode.insertBefore(p, item.nextSibling);
                }

                if (
                    item.nodeName === 'DIV' &&
                    item.getAttribute('data-w-e-type') === 'upload-file'
                ) {
                    const downloadUrl = item.getAttribute('data-url');
                    const fileName = item.querySelectorAll('p')[0].innerText;
                    item.onclick = () => {
                        exportFile(downloadUrl, fileName);
                    };
                }

                // @
                if (item.querySelector && item.querySelector('[data-w-e-type="mention"]')) {
                    const dom = item.querySelectorAll('[data-w-e-type="mention"]');
                    const ph = document.querySelector('#preview');
                    if (!ph) {
                        return;
                    }
                    const divOffset = ph.getBoundingClientRect().top + window.scrollY;

                    for (let i = 0; i < dom.length; i++) {
                        const pid = dom[i].getAttribute('data-info');
                        dom[i].onclick = () => {
                            if (pid) {
                                router.push({
                                    name: 'browserHome',
                                    params: {
                                        id: pid,
                                    },
                                });
                            }
                        };
                        dom[i].onmouseenter = () => {
                            const rect = dom[i].getBoundingClientRect();
                            offsetLeft.value = rect.x - (rect.width / 2 + 20);
                            if (rect.y > 260) {
                                offsetTop.value = rect.y - 243;
                            } else {
                                offsetTop.value = rect.y + rect.height + 5;
                            }
                            principalID.value = pid;
                        };

                        dom[i].onmouseleave = () => {
                            offsetTop.value = 0;
                            offsetLeft.value = 0;
                            principalID.value = '';
                        };
                    }
                }

                if (item.nodeName === 'DIV' && item.getAttribute('data-w-e-type') === 'plugin') {
                    item.classList.add('loading');
                    const canister_id =
                        item.children[0].attributes['data-plugin-canister'].nodeValue;
                    const hash = item.children[0].attributes['data-plugin-hash'].nodeValue;
                    let prop = item.children[0].attributes['data-plugin-prop'].nodeValue;
                    prop = prop ? decodeURIComponent(prop) : '';
                    item.innerHTML = '';
                    const son = document.createElement('div');
                    item.insertBefore(son, item.firstChild);
                    render(
                        h(WrappedMoraLightVue, {
                            hostAgent: agent.value,
                            anchor: { canister_id, hash },
                            status: 'running',
                            prop: prop ? prop : '{}',
                        }),
                        son,
                    );
                    item.classList.remove('loading');
                }

                // table
                if (item.nodeName === 'TABLE') {
                    const newDiv = document.createElement('div');
                    newDiv.classList.add('table-container');
                    item.replaceWith(newDiv);
                    newDiv.appendChild(item);
                }
            }
        };

        const addEmbed = () => {
            const existingScript = document.getElementById('embedJS');
            if (existingScript && existingScript.parentNode) {
                existingScript.parentNode.removeChild(existingScript);
            }
            const script = document.createElement('script');
            script.async = true;
            script.src = '//cdn.iframe.ly/embed.js';
            script.id = 'embedJS';
            script.charset = 'utf-8';
            document.head.appendChild(script);
        };

        onMounted(() => {
            contentData.value = pushDataFilterText(contentData.value);
            nextTick(() => {
                parsingDom();
                setTimeout(() => {
                    Prism.highlightAll();
                }, 0);
            });
        });

        return {
            data,
            contentDom,
            contentData,
            offsetTop,
            offsetLeft,
            principalID,
            hideImg,
            showImg,
        };
    },
});
</script>

<style lang="less" scoped>
.mymodal {
    @apply fixed top-0 left-0 w-screen h-screen z-999 overflow-y-auto flex items-center justify-center;
    background: rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(8px) saturate(100%);
    -webkit-backdrop-filter: blur(8px) saturate(100%);

    .myImg {
        @apply m-auto;

        img {
            @apply max-w-full mx-auto;

            &:hover {
                cursor: zoom-out;
            }
        }
    }
}

.container {
    @apply mx-auto relative text-left;
    // <md: (w-full) md:(w-full) lg:(w-192) 2xl:(w-200)

    .title {
        @apply w-full my-8 text-black text-5xl leading-14 font-bold block break-words dark:(text-light-900);
    }

    :deep(> .content) {
        @apply pb-5 text-lg text-gray-800 break-words dark:(text-light-900/80);

        .Image-caption {
            @apply w-full text-center text-base text-gray-400 pt-1 <sm:(text-sm pt-0);
        }

        .thing-page-image {
            text-align: center !important;

            p {
                @apply w-full text-center text-base text-gray-400 pt-1 <sm:(text-sm pt-0);
            }
        }

        p {
            @apply !text-gray-800 dark:( !text-light-900/80);
        }

        div[data-mode='full'] {
            img {
                width: 100%;
            }
        }

        div[data-mode='middle'] {
            img {
                width: auto;
                max-width: 40%;
            }
        }

        div[data-w-e-type='link-card'] {
            @apply flex w-4/5 mx-auto my-4 overflow-hidden min-h-28 border border-light-700 bg-light-300 rounded-xl <sm: (min-h-15 w-full) dark:(border-dark-100 bg-dark-300);

            &.loading {
                @apply w-4/5 min-h-28 border border-light-700 <sm: (w-full) dark:(border-dark-100);
                background: url('@/assets/svg/editor-loading.svg') no-repeat center center;
                background-size: 32px;
                font-size: 0;
            }

            >div {
                width: 100%;
            }

            p {
                padding: 0;
            }

            a {
                @apply bg-light-300 <sm: (max-w-full) dark:(bg-dark-600);
                text-decoration: none;

                span {
                    border-bottom: none;

                    p {
                        text-align: left;
                    }
                }
            }

            span {
                @apply flex flex-1 flex-col px-8 py-3 <sm: (p-3);
                text-decoration: none;

                p {
                    margin: 0;

                    &:nth-child(1) {
                        @apply font-bold text-xl text-black pt-2 pb-3 <sm: (text-lg) dark:(text-light-900);
                    }

                    &:nth-child(2) {
                        @apply text-sm text-gray-900/80 <sm: (max-h-15 overflow-hidden) dark:(text-light-900/60);
                    }

                    &:nth-child(3) {
                        @apply text-sm mt-2 text-gray-400 <sm:(text-xs) dark:(text-light-900/50);

                        i {
                            font-family: 'iconfont' !important;
                            font-size: 14px;
                            font-style: normal;
                            margin-right: 7px;

                            &:before {
                                content: '\e0c5';
                            }
                        }
                    }
                }
            }
        }

        div[data-w-e-type='upload-file'] {
            @apply w-112 mx-auto rounded-xl p-4 my-3 bg-light-300 border-2 border-light-300 flex items-center relative transition duration-300 dark:(bg-dark-600 border-dark-600) <sm:(w-full);

            i {
                @apply block w-20 h-14 rounded-xl overflow-hidden mr-4 <sm: (w-16 h-11 rounded-lg);

                &[data-class='application'] {
                    background: url(@/assets/svg/archive.svg) no-repeat center center;
                    background-size: 100% 100%;
                }

                &[data-class='default'] {
                    background: url('@/assets/svg/file.svg') no-repeat center center;
                    background-size: 100% 100%;
                }

                &[data-class='image'] {
                    background: url('@/assets/svg/defaultPic.svg') no-repeat center center;
                    background-size: 100% 100%;
                }

                &[data-class='video'] {
                    background: url('@/assets/svg/video.svg') no-repeat center center;
                    background-size: 100% 100%;
                }

                &[data-class='pdf'] {
                    background: url('@/assets/svg/pdf.svg') no-repeat center center;
                    background-size: 100% 100%;
                }
            }

            span {
                @apply flex flex-1 flex-col;

                p {
                    @apply p-0;
                }

                p:first-child {
                    @apply max-w-60 truncate text-black text-base font-semibold dark: (text-light-800/80) <sm:(text-sm max-w-35);
                }

                p:last-child {
                    @apply w-full text-sm text-gray-400 dark: (text-light-900/40) <sm:(text-xs);
                }
            }

            &::before {
                @apply flex text-gray-400 text-3xl top-5 right-4 absolute transition duration-300 dark:(text-gray-500) <sm: (text-2xl top-4);
                font-family: 'iconfont' !important;
                font-style: normal;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
                content: '\e149';
                background-size: 100% 100%;
            }

            &::after {
                @apply text-xs text-gray-400/80 absolute right-4 bottom-6px;
                content: 'Powered by Metabox';
                background: url(@/assets/svg/metabox.svg) no-repeat left center;
                background-size: 14px 14px;
                display: flex;
                align-items: center;
                text-indent: 20px;
            }

            &:hover {
                @apply transition duration-300 border-light-700 cursor-pointer dark:(border-dark-100);

                &::before {
                    @apply text-purple-500 transition duration-300;
                }
            }
        }

        div[data-w-e-type='video'] {
            margin: 10px auto 0;
            padding: 10px 0;

            iframe {
                overflow: hidden;
                border-radius: 8px;
            }

            video {
                @apply max-w-full <sm:(w-full);
            }
        }

        div[data-w-e-type='plugin'] {
            margin: 10px auto 0;
            padding: 10px 0;

            &.loading {
                width: 100%;
                min-height: 250px;
                border-radius: 14px;
                position: relative;
                border: 2px solid #34d399;
                background: url('@/assets/svg/loading3.svg') no-repeat center center;
            }
        }

        span {
            &[data-w-e-type='formula'] {
                .katex-display {
                    .katex-html {
                        @apply my-4 mx-0 text-left text-xl;

                        .base {
                            @apply text-xl;
                        }
                    }
                }
            }

            &[data-w-e-type='mention'] {
                @apply px-1 font-bold-500 !text-blue-500 underline-offset-4 break-normal transition duration-300 hover:(underline underline-blue-500 transition duration-300 cursor-pointer);
            }
        }

        >p {
            @apply py-3 text-lg break-words <sm: (text-base);
            white-space: pre-wrap;

            img {
                @apply m-auto max-w-full my-5 rounded-lg;

                &:hover {
                    cursor: zoom-in;
                }
            }
        }

        a {
            @apply underline underline-blue-500 font-bold-500 text-blue-500 underline-offset-4 break-words dark:(text-blue-500);

            &>strong {
                @apply text-blue-500 dark:(text-blue-500);
            }
        }

        img {
            @apply m-auto max-w-full rounded-lg my-2 !h-auto;

            &.imgLoading {
                .center();
                position: relative;
                min-height: 300px;
                min-width: 100%;
                margin: 0 auto;
                border: 1px solid #e8e8e8;
                background: url('@/assets/svg/loading2.svg') no-repeat center center rgba(247, 247, 247, 1);
                background-size: 25px auto;
            }

            &:hover {
                cursor: zoom-in;
            }
        }

        strong,
        h1,
        h2,
        h3,
        h4,
        h5 {
            @apply font-bold dark:(text-light-900);
        }

        h1,
        h2,
        h3,
        h4,
        h5 {
            @apply pt-5 pb-2 m-0;
        }

        h1 {
            @apply text-3xl <sm: (text-2xl);
        }

        h2 {
            @apply text-2xl <sm: (text-xl);
        }

        h3 {
            @apply text-xl <sm: (text-lg);
        }

        h4 {
            @apply text-lg <sm: (text-base);
        }

        h5 {
            @apply text-base;
        }

        hr {
            @apply w-1/2 my-10 mx-auto border-none h-1px bg-gray-200 <sm: (my-8) dark:(bg-dark-300);
        }

        blockquote {
            @apply mx-0 border-l-3 border-purple-400 pl-4 bg-light-200 py-2 text-gray-500 pr-2 my-5 leading-normal break-words dark: (bg-dark-400 text-gray-300);
        }

        iframe {
            @apply max-w-full mx-auto;
        }

        ul,
        ol {
            @apply w-full px-0 my-2;

            li {
                @apply list-none py-2 pl-6 relative text-lg <sm:(pl-5 py-1 text-base);

                &::before {
                    @apply absolute left-0 text-true-gray-400 dark:(text-true-gray-500);
                }

                p {
                    padding: 0;
                }
            }
        }

        ol {
            counter-reset: ol;

            li {
                counter-increment: ol 1;

                &::before {
                    content: counter(ol) '. ';
                    white-space: pre;
                }
            }

            &>ol {
                @apply table-row;

                &::before {
                    @apply table-cell pl-6 <sm:(pl-5);
                    content: ' ';
                }
            }
        }

        ul {
            li {
                &::before {
                    content: '• ';
                    white-space: pre;
                    font-size: 24px;
                    @apply top-6px <sm:(top-3px);
                }
            }

            &>ul {
                @apply table-row;

                &::before {
                    @apply table-cell pl-6 <sm:(pl-5);
                    content: ' ';
                }
            }
        }

        .table-container {
            @apply max-w-full overflow-x-scroll;
        }

        table {
            @apply w-auto min-w-full max-w-full my-2 border border-collapse table-fixed;

            th {
                @apply bg-gray-100 border py-2 px-3 text-base text-gray-900 font-bold text-left <sm: (py-1 px-2 text-sm) <lg:( !w-auto) dark:(bg-dark-600 text-light-900/80 border-dark-200);
            }

            td {
                @apply border py-2 px-3 text-base leading-tight break-words <sm: (py-1 px-2 text-sm leading-tight) dark:(border-dark-200);
                // word-break: break-word;
            }
        }

        pre {
            @apply w-full py-3 px-4 bg-gray-100 rounded-lg overflow-x-auto dark: (bg-dark-600);
            .scrollbar();

            &.line-numbers {
                line-height: 1rem;
            }

            code {
                @apply px-0 text-sm;

                .token {
                    &.operator {
                        @apply !bg-transparent;
                    }
                }
            }
        }

        .imgCaption {
            @apply w-full text-center text-base text-gray-400 pt-1 <sm:(text-sm pt-0);
        }

        .code-toolbar {
            div {
                @apply my-0;
            }

            &>.toolbar {
                @apply top-2 right-2;

                &>.toolbar-item {
                    &>button {
                        @apply bg-gray-600 text-white py-1;
                        box-shadow: none;
                    }
                }
            }
        }
    }
}

:deep(.katex-display) {
    @apply !my-0 py-1 overflow-x-auto overflow-y-hidden;

    .katex-html {
        text-align: center !important;
    }

    &>.katex {
        @apply text-center;

        .base {
            @apply !text-xl <sm: (text-base);
        }

        .tag {
            .mord {
                @apply !text-xl <sm: (text-base);
            }
        }

        .eqn-num {
            &::before {
                @apply !text-xl <sm: (hidden);
            }
        }
    }
}

.dark {
    .container {
        :deep(> .content) {
            img {
                &.imgLoading {
                    @apply border-dark-100;
                    background: url('@/assets/svg/loading2.svg') #1f1f1f no-repeat center center;
                }
            }
        }
    }
}

.fadeimg-enter-active {
    -webkit-animation: fade-out-fwd 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
    animation: fade-out-fwd 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}

.fadeimg-leave-active {
    -webkit-animation: fade-out-bck 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
    animation: fade-out-bck 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}

@-webkit-keyframes fade-out-fwd {
    0% {
        -webkit-transform: translateZ(0);
        transform: translateZ(0);
        opacity: 0;
    }

    100% {
        -webkit-transform: translateZ(80px);
        transform: translateZ(80px);
        opacity: 1;
    }
}

@keyframes fade-out-fwd {
    0% {
        -webkit-transform: translateZ(0);
        transform: translateZ(0);
        opacity: 0;
    }

    100% {
        -webkit-transform: translateZ(80px);
        transform: translateZ(80px);
        opacity: 1;
    }
}

@-webkit-keyframes fade-out-bck {
    0% {
        -webkit-transform: translateZ(0);
        transform: translateZ(0);
        opacity: 1;
    }

    100% {
        -webkit-transform: translateZ(-80px);
        transform: translateZ(-80px);
        opacity: 0;
    }
}

@keyframes fade-out-bck {
    0% {
        -webkit-transform: translateZ(0);
        transform: translateZ(0);
        opacity: 1;
    }

    100% {
        -webkit-transform: translateZ(-80px);
        transform: translateZ(-80px);
        opacity: 0;
    }
}
</style>
<style lang="less">
.container {
    >.content {
        .el-popper {
            span {
                @apply text-white dark:(text-gray-800) !important;
            }
        }
    }
}
</style>
