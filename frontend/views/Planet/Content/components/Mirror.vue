<template>
    <el-dialog class="w800" v-model="dialogVisible" :title="$t('planetContent.mirror.title')" @closed="afterClose">
        <div class="box" v-if="step === 1">
            <div class="metamask" v-loading="authorizeLoading" @click="authorize">
                <img src="@/assets/svg/logo-metamask.svg" alt="" />
                <span>MetaMask</span>
            </div>
            <p><i class="iconfont icon-attention"></i>{{ $t('planetContent.mirror.txt') }}</p>
        </div>
        <div class="box" v-else>
            <div class="article">
                <div class="listbox" v-loading="articlesListLoading" :class="{ disabled: status == 2 }">
                    <div class="noData" v-if="!articles.length">
                        <i class="iconfont icon-no"></i>
                        <span>{{ $t('planetContent.mirror.noData') }}</span>
                    </div>
                    <template v-else-if="articles.length">
                        <div class="list" v-for="(item, index) in articles" :key="index"
                            :class="{ active: selectArticles.indexOf(item) !== -1 }" @click="handleClick(item)">
                            <i class="iconfont icon-ok" v-if="status === 2 && ~pushArticlesSuccess.indexOf(item)" />
                            <i class="iconfont icon-close"
                                v-else-if="status === 2 && ~pushArticlesError.indexOf(item)" />
                            <img src="@/assets/svg/loading2.svg"
                                v-else-if="status === 2 && ~selectArticles.indexOf(item)" />
                            <i class="iconfont icon-radio" v-else-if="istate === 0" />
                            <p>{{ item.title }}</p>
                            <strong>
                                {{ moment(item.timestamp * 1000).format('MMM Do YYYY, HH:mm:ss') }}
                            </strong>
                        </div>
                    </template>
                </div>
            </div>

            <div class="selectbox" v-if="articles.length">
                <div class="all" @click="selectAll" :class="{ active: isAll }">
                    <i class="iconfont icon-radio"></i>
                    <span>All</span>
                </div>
                <div class="progress" v-if="status === 2">
                    <el-progress :percentage="(pushArticlesSuccess.length / selectArticles.length) * 100
        ? Math.round(
            (pushArticlesSuccess.length / selectArticles.length) * 100,
        )
        : 0
        " />
                </div>
                <p>Total:{{ articles.length }}, Selected:{{ selectArticles.length }}, Imported:{{
        pushArticlesSuccess.length
    }}</p>
            </div>

            <div class="mirrorBottom">
                <div class="permissions">
                    <el-dropdown :teleported="false" @command="permissionsChange">
                        <div>
                            <span class="el-dropdown-link">
                                {{ permissionsFilter }}
                                <i class="iconfont icon-arrow-up"></i>
                            </span>
                        </div>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item command="Draft">
                                    {{ $t('editor.tools.permissions.Draft') }}
                                </el-dropdown-item>
                                <el-dropdown-item command="Public">
                                    {{ $t('editor.tools.permissions.Public') }}
                                </el-dropdown-item>
                                <el-dropdown-item command="Private">
                                    {{ $t('editor.tools.permissions.Private') }}
                                </el-dropdown-item>
                                <el-dropdown-item command="Subcribe">
                                    {{ $t('editor.tools.permissions.Subcribe') }}
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </div>
                <div class="mora-button">
                    <div class="confirm" :class="{ disabled: status === 2 || selectArticles.length == 0 }"
                        @click="confirm">
                        <img src="@/assets/svg/loading.svg" v-if="status === 2" />
                        {{ $t('planetContent.mirror.btn') }}
                    </div>
                </div>
            </div>
        </div>
    </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, inject, computed } from 'vue';
import { ethers } from 'ethers';
import Arweave from 'arweave';
import moment from 'moment';
import { marked } from 'marked';
import { ElMessage } from 'element-plus';
import { t } from '@/i18n';
import store from '@/store';
import debug from '@/utils/debug';
import { compression } from '@/request/axios/bv';

export default defineComponent({
    emits: ['close', 'refresh'],
    setup(props, context) {
        const dialogVisible = ref(true);
        const arweave: any = ref<Arweave>();
        const articlesListLoading = ref(false);
        const authorizeLoading = ref(false);
        const articles: any = ref([]);
        const step = ref(1);
        const status = ref(1);
        const istate = ref(0);
        const selectArticles: any = ref([]);
        const planetCanister: any = inject('planetCanister', null);
        const pushArticlesSuccess: any = ref([]);
        const pushArticlesError: any = ref([]);
        const thumbUrl = ref('');
        const permissions = ref('Draft');
        const isAll = ref(false);

        const permissionsFilter = computed(() => {
            let txt = permissions.value;
            if (!txt) {
                return t('editor.tools.permissions.Public');
            }
            return t(`editor.tools.permissions.${txt}`);
        });

        const verifySignature = (signature, address, message) => {
            const recoveredAddress = ethers.utils.verifyMessage(message, signature);
            return ethers.utils.getAddress(recoveredAddress) === ethers.utils.getAddress(address);
        };

        const permissionsChange = (type) => {
            permissions.value = type;
        };

        const authorize = async () => {
            authorizeLoading.value = true;
            try {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                const address = await signer.getAddress();
                debug('Address:', address, false);
                const message = 'Request arweave data';
                const signature = await signer.signMessage(message);
                if (verifySignature(signature, address, message)) {
                    step.value = 2;
                    articlesListLoading.value = true;
                    // fetchArticles('0x9651B2a7Aa9ed9635cE896a1Af1a7d6294d5e902');
                    fetchArticles(address);
                }
            } catch (err) {
                ElMessage.error(t('planetContent.mirror.authorizationFailure'));
                articlesListLoading.value = false;
                authorizeLoading.value = false;
            }
        };

        const uniqueJsonData = (data) => {
            const map = new Map();
            const result = [];

            data.forEach(({ node }) => {
                const originalContentDigest = node.tags.find(
                    (tag) => tag.name === 'Original-Content-Digest',
                )?.value;

                if (!originalContentDigest) {
                    return;
                }

                if (!map.has(originalContentDigest)) {
                    map.set(originalContentDigest, true);
                    result.push(node);
                }
            });

            return result;
        };

        const images2Ipfs = async (html) => {
            const regex = /<img[^>]+src="([^">]+)"/g;
            const imgSrcs = [];
            let match;
            while ((match = regex.exec(html))) {
                imgSrcs.push(match[1]);
            }
            if (!imgSrcs.length) {
                return html;
            }
            let promiseArr = imgSrcs.map((item) => {
                return new Promise(async (r) => {
                    let res = await compression({
                        url: item,
                        scale: 1,
                    });
                    r({
                        source: item,
                        imgUrl: res.imgUrl,
                    });
                });
            });

            return Promise.all(promiseArr).then((res) => {
                let replacedHtml = html;
                res.forEach((item) => {
                    if (!thumbUrl.value) {
                        thumbUrl.value = item.imgUrl;
                    }
                    replacedHtml = replacedHtml.replace(item.source, item.imgUrl);
                });
                return replacedHtml;
            });
        };

        const markdown2html = (markdown) => {
            const renderer = new marked.Renderer();
            renderer.listitem = (text) => {
                return `<li>${text}</li>\n`;
            };

            renderer.blockquote = (quote) => {
                return `<blockquote>${quote}</blockquote>\n`;
            };

            renderer.code = (code) => {
                return `<pre><code class="language-javascript">${code}</code></pre>`;
            };

            renderer.image = (href, title, text) => {
                if (!title) {
                    return `<img src="${href}" alt="${text}" />`;
                }
                return `<img src="${href}" title="${title}" alt="${text}" />`;
            };

            renderer.paragraph = (text) => {
                if (text.startsWith('<li>') || text.startsWith('<img')) {
                    return `${text}\n`;
                }
                return `<p>${text}</p>\n`;
            };
            return marked(markdown, { renderer });
        };

        const fetchArticles = async ($contributor: string) => {
            if (!arweave.value) {
                return;
            }

            const endpoint = '/graphql';

            const query = `
                query {
                    transactions(tags: [
                        {name: "App-Name", values: ["MirrorXYZ"]},
                        {name: "Contributor", values: ["${$contributor}"]}
                    ], first: 100) {
                        edges {
                            node {
                                id
                                tags {
                                    name
                                    value
                                }
                            }
                        }
                    }
                }
            `;

            const res = await arweave.value.api.post(endpoint, { query });
            if (
                !res.data ||
                !res.data.data.transactions ||
                !res.data.data.transactions.edges.length
            ) {
                articlesListLoading.value = false;
                return;
            }

            let list = res.data.data.transactions.edges;
            let txIdsArr: any[] = uniqueJsonData(list);
            let txIds = txIdsArr.map((edge: any) => edge?.id);
            const batchSize = 5;
            const maxRetry = 3;

            function getTransactions(ids) {
                const failedIds = [];
                const results = [];
                return new Promise((resolve, reject) => {
                    const processBatch = async (batch) => {
                        let retryCount = 0;
                        while (retryCount < maxRetry) {
                            const promises = batch.map(async (id) => {
                                try {
                                    const transaction = await arweave.value.api.get(`/${id}`);
                                    let contentData = transaction.data.content;
                                    return {
                                        id,
                                        body: markdown2html(contentData.body),
                                        timestamp: contentData.timestamp,
                                        title: contentData.title,
                                    };
                                } catch (error) {
                                    return null;
                                }
                            });
                            const batchResults = await Promise.all(promises);
                            batchResults.forEach((result) => {
                                if (result !== null) {
                                    results.push(result);
                                } else {
                                    failedIds.push(id);
                                }
                            });
                            if (failedIds.length === 0) {
                                break;
                            }
                            batch = failedIds.slice(0, batchSize);
                            failedIds.splice(0, batch.length);
                            retryCount++;
                        }
                        if (retryCount === maxRetry && failedIds.length > 0) {
                        }
                        if (results.length === ids.length) {
                            resolve(results);
                        }
                    };
                    let start = 0;
                    while (start < ids.length) {
                        const end = Math.min(start + batchSize, ids.length);
                        const batch = ids.slice(start, end);
                        processBatch(batch);
                        start = end;
                    }
                });
            }

            getTransactions(txIds)
                .then((results) => {
                    articles.value = results;
                    articlesListLoading.value = false;
                })
                .catch((error) => {
                    step.value = 1;
                    ElMessage.error(t('planetContent.mirror.getListError'));
                });
        };

        const handleClick = (item: any) => {
            if (selectArticles.value.indexOf(item) !== -1) {
                selectArticles.value.splice(selectArticles.value.indexOf(item), 1);
            } else {
                selectArticles.value.push(item);
            }
        };

        const extractSummary = (htmlString, maxLength = 200) => {
            let text = htmlString.replace(/<[^>]*>/g, '');
            text = text.replace(/\s+/g, ' ').trim();
            const summary = text.substring(0, maxLength);
            return summary;
        };

        const pushArticles = (list) => {
            let num = 0;

            const _pushData = async (data) => {
                if (num >= list.length) {
                    debug('ok', '', false);
                    context.emit('refresh');
                    setTimeout(() => {
                        dialogVisible.value = false;
                    }, 1000);
                    return;
                }
                thumbUrl.value = '';
                data.body = await images2Ipfs(data.body);
                let obj: any = {
                    id: '',
                    title: data.title,
                    content: data.body,
                    atype: { Article: null },
                    author: store.state.agent,
                    tags: [],
                    cate: 0,
                    subcate: 0,
                    thumb: thumbUrl.value,
                    allowComment: false,
                    abstract: extractSummary(data.body),
                    original: true,
                    fromurl: '',
                };

                if (!permissions.value) {
                    obj.status = {
                        Draft: null,
                    };
                } else {
                    obj.status = {
                        [permissions.value]: null,
                    };
                }

                try {
                    let res = await planetCanister.value.addArticle(obj);
                    if (res.Ok) {
                        debug('success', res, false);
                        pushArticlesSuccess.value.push(data);
                        num += 1;
                        _pushData(list[num]);
                    } else {
                        debug('error', res);
                        pushArticlesError.value.push(data);
                        num += 1;
                        _pushData(list[num]);
                    }
                } catch (err) {
                    debug('error', err);
                    pushArticlesError.value.push(data);
                    num += 1;
                    _pushData(list[num]);
                }
            };
            _pushData(list[num]);
        };

        const confirm = () => {
            if (!selectArticles.value.length) {
                return;
            }
            status.value = 2;
            pushArticles(selectArticles.value);
        };

        const selectAll = () => {
            if (isAll.value) {
                selectArticles.value = [];
                isAll.value = false;
            } else {
                selectArticles.value = articles.value;
                isAll.value = true;
            }
        };

        const afterClose = () => {
            context.emit('close');
        };

        onMounted(async () => {
            arweave.value = Arweave.init({
                host: 'arweave.net',
                port: 443,
                protocol: 'https',
                timeout: 20000,
                logging: false,
            });
        });

        return {
            permissionsFilter,
            dialogVisible,
            articlesListLoading,
            step,
            articles,
            selectArticles,
            istate,
            status,
            moment,
            pushArticlesSuccess,
            pushArticlesError,
            permissions,
            isAll,
            authorizeLoading,
            afterClose,
            authorize,
            handleClick,
            confirm,
            selectAll,
            permissionsChange,
        };
    },
});
</script>

<style lang="less" scoped>
.box {
    @apply w-full;

    .metamask {
        @apply w-50 my-5 border border-light-900 rounded-xl mx-auto p-5 transition duration-300 dark:(border-dark-100) hover:(transition duration-300 bg-light-500 cursor-pointer border-transparent dark:(bg-dark-900));
        overflow: hidden;

        img {
            @apply mx-auto;
        }

        span {
            @apply block pt-2 text-center text-black font-medium dark:(text-light-900);
        }

        :deep(.el-loading-mask) {
            .circular {
                .path {
                    stroke: @text-active;
                }
            }
        }
    }

    p {
        @apply py-2 w-full text-gray-500 dark:(text-light-900/80);

        i {
            @apply text-gray-400 mr-2;
        }
    }

    .article {
        @apply w-full flex flex-col justify-between;

        :deep(.el-loading-mask) {
            .circular {
                .path {
                    stroke: @text-active;
                }
            }
        }

        .listbox {
            @apply w-full h-110 overflow-y-auto px-2;
            .scrollbar();

            &.disabled {
                @apply cursor-not-allowed;

                .list {
                    @apply pointer-events-none;
                }
            }

            .list {
                @apply w-full flex justify-between items-center p-4 mb-4 border border-light-700 rounded-xl transition duration-300 dark:(border-dark-100) hover:(transition duration-300 cursor-pointer bg-light-300 dark:(bg-dark-900));

                i {
                    @apply text-gray-300 dark:(text-light-300/40);
                }

                p {
                    @apply text-gray-400 py-0 flex-1 text-left pl-3 truncate;
                }

                strong {
                    @apply text-gray-400 py-0 text-left pl-3 truncate;
                    margin-left: auto;
                    font-size: 12px;
                    font-weight: normal;
                }

                &.active {
                    @apply bg-light-300 dark:(bg-dark-900);

                    i {
                        @apply text-purple-500;
                    }

                    p {
                        @apply text-dark-50 dark:(text-light-900);
                    }
                }
            }

            :deep(.el-loading-mask) {
                @apply dark:( !bg-dark-600);
            }
        }

        .noData {
            @apply w-full flex items-center justify-center flex-col;
            height: 100%;

            i {
                @apply text-7xl text-gray-300 dark:(text-light-900/30);
            }

            span {
                @apply py-3 text-gray-400 dark:(text-light-900/50);
            }
        }
    }

    .selectbox {
        @apply w-full p-2 flex items-center justify-between;

        .all {
            @apply flex items-center cursor-pointer;

            &.active {

                i,
                span {
                    @apply text-purple-500 dark:(text-purple-500);
                }
            }

            i {
                @apply mr-2 text-gray-300 dark:(text-light-300/40);
            }

            span {
                @apply whitespace-nowrap dark:(text-light-900);
            }
        }

        .progress {
            @apply flex-1 px-20 <sm:(hidden);
        }

        p {
            @apply w-auto text-sm;
        }
    }

    .mirrorBottom {
        @apply mt-5 px-2;
        display: flex;
        width: 100%;

        >span {
            @apply mr-10 text-purple-500 cursor-pointer;
            .center();
        }

        .permissions {
            @apply mr-10;
            display: flex;
            cursor: pointer;
            justify-content: center;
            align-items: center;

            :deep(.el-dropdown) {
                height: 100%;
                width: auto;
                display: flex;
                justify-content: center;
                align-items: center;

                .icon-radio {
                    padding-right: 13px;
                    color: @bg-color-body-active;
                }

                div {
                    // height: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }

                .el-dropdown-link {
                    display: flex;
                    @apply dark: (text-light-900/80);

                    .icon-arrow-up {
                        transition: @transition;
                        margin-left: 5px;
                    }
                }

                .el-dropdown-menu__item {
                    @apply hover:(text-purple-500);
                }
            }

            &:hover {
                .el-dropdown {
                    .el-dropdown-link {
                        .icon-arrow-up {
                            transform: rotate(180deg);
                        }
                    }
                }
            }
        }

        .mora-button {
            @apply px-0 flex items-center mt-0;
            flex: 1;
        }
    }
}
</style>
