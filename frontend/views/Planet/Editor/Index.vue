<template>
    <div class="wangeditor" id="wangeditor" translate="no">
        <Toolbar :class="{ isHeader: !isHeader }" class="toolbar" :editor="editorRef" :defaultConfig="toolbarConfig"
            :mode="mode" @click="toolbarChange" />
        <div class="editorMain">
            <div class="title">
                <el-input class="title" ref="titleDom" :autosize="{ minRows: 1, maxRows: 2 }" resize="none"
                    type="textarea" v-model="titleData" show-word-limit :maxlength="100"
                    :placeholder="$t('editor.titlePlaceholder')" @input="titleChange"
                    @keydown.enter="textareaKeydown" />
            </div>
            <Editor class="editor" v-model="valueHtml" :defaultConfig="editorConfig" :config="baseConfig" :mode="mode"
                @onCreated="onCreated" @onChange="onChange" @onDestroyed="onDestroyeds" @onFocus="onFocus"
                @onBlur="onBlur" @keydown="onKeydown" @mousedown="editorDomClick" @customPaste="customPaste" />

            <div class="settingsBox">
                <Settings ref="settingsDom" :permissions="articleSetting.permissions"
                    @modifySettings="modifySettings" />
            </div>

            <transition name="el-fade-in-linear">
                <div class="directory" :class="{
            fixed: directoryTop === 2,
        }" v-show="isDirectory">
                    <Directory />
                </div>
            </transition>
        </div>

        <div class="addPlugin" @click="openInsertPlugin">
            <img src="@/assets/svg/editor-logo.svg" alt="" />
            <p>{{ $t('editor.tools.light') }}</p>
        </div>

        <div class="editorToolsBox">
            <div class="editorTools">
                <div class="autosaved">
                    <el-progress v-if="autosavedPercentage < 100" type="circle" :percentage="autosavedPercentage"
                        :stroke-width="4" :width="20" color="#806ef2" :show-text="false" />
                    <i v-else class="iconfont icon-chose"></i>
                    <p>
                        {{
            showDraftTime
                ? $t('editor.tools.autosaved')
                : $t('editor.tools.savedTime', {
                    time: `${Math.ceil(intervalDraftTime)
                        ? Math.ceil(intervalDraftTime) > 60
                            ? Math.ceil(intervalDraftTime / 60)
                            : Math.ceil(intervalDraftTime)
                        : 0
                        } ${intervalDraftTime <= 60 ? 'Seconds' : 'Minutes'}`,
                }) }} </p>
                </div>
                <div class="autosaved" v-show="!isAutoSaved">
                    <!-- <i class="iconfont icon-attention"></i> -->
                    <p>{{ $t('editor.tools.disable') }}</p>
                </div>

                <div class="settings" @click="openSettings" :class="{ open: !isBottom }">
                    <p>
                        {{ isBottom ? $t('editor.tools.backTop') : $t('editor.tools.settings') }}
                    </p>
                    <i class="iconfont icon-arrow-up"></i>
                </div>

                <div class="right">
                    <div class="permissions">
                        <el-dropdown size="large" :teleported="false" @command="permissionsChange">
                            <div>
                                <i class="iconfont icon-radio"></i>
                                <span class="el-dropdown-link">
                                    {{ permissionsFilter }}
                                    <i class="iconfont icon-arrow-up"></i>
                                </span>
                            </div>
                            <template #dropdown>
                                <el-dropdown-menu>
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
                    <div class="draft" v-if="isAutoSaved" @click="saveDraft">
                        {{ $t('editor.tools.draft') }}
                    </div>
                    <div class="publish" @click="publish" :class="{ loading: pushArticleLoading || saving }">
                        <img src="@/assets/svg/loading.svg" v-if="pushArticleLoading || saving" />
                        <div>
                            {{
            pushArticleLoading || saving
                ? savingType === 'publish'
                    ? $t('editor.tools.publish')
                    : $t('editor.tools.saving')
                : $t('editor.tools.publish')
        }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <component :is="isComponent" @componentClose="componentClose" :componentDefaultValue="componentDefaultValue"
        :insertCallback="insertCallback" />

    <GetAuthors id="mention-modal" :editor="editorRef" />
    <OnChain v-if="isShowAr" ref="onChainRef" :message="arMessage" @onChainClose="onChainClose"
        @onChainSubmit="onChainSubmit" />
</template>

<script lang="ts">
import '@wangeditor/editor/dist/css/style.css';
import {
    defineComponent,
    onBeforeUnmount,
    onUnmounted,
    onMounted,
    ref,
    shallowRef,
    nextTick,
    computed,
    inject,
    onBeforeMount,
    watch,
    provide,
} from 'vue';
import { Editor, Toolbar } from '@wangeditor/editor-for-vue';
import { editorConfig, onChange, onDestroyeds, onFocus, onBlur } from './components/EditorConfig';
import toolbarConfig from './components/ToolbarConfig';
import Settings from './components/Settings.vue';
import ImagesUpload from './components/ImagesUpload.vue';
import { genLinkNode } from './package/linkCard/menu/helper';
import VideoUpload from './components/VideoUpload.vue';
import CodeBlock from './components/CodeBlock.vue';
import InsertLink from './components/InsertLink.vue';
import Formula from './components/Formula.vue';
import ISPMetaBox from './components/ISPMetaBox.vue';
import ImagesEditorAlt from './components/ImagesEditorAlt.vue';
import Preview from './components/Preview.vue';
import LocalHistory from './components/LocalHistory.vue';
import Directory from '@/components/Directory.vue';
import Plugin from './components/Plugin.vue';
import { t } from '@/i18n';
import { ElMessage } from 'element-plus';
import CONFIG from '@/assets/config';
import bus from 'vue3-eventbus';
import { Transforms } from 'slate';
import { InsertFnType } from '.d';
import {
    IDomEditor,
    i18nChangeLanguage,
    SlateTransforms,
    DomEditor,
    SlateEditor,
    SlateElement,
    SlateNode,
    SlateText,
} from '@wangeditor/editor';
import store from '@/store';
import { scrollTop, scrollBottom, pushDataFilterText, dealPid } from '@/utils/functions';
import { cardInfo } from '@/request/axios/bv';
import { Principal } from '@dfinity/principal';
import debug from '@/utils/debug';
import { useRoute, useRouter } from 'vue-router';
import { ElLoading } from 'element-plus';
import { MetaBox } from 'js-databox/esm/metabox';
import _ from 'lodash';
import xss from 'xss';
import GetAuthors from '../components/getAuthors.vue';
import OnChain from './components/OnChain.vue';
import { submitArticleToArweave } from '@/request/arweave';
import { Secp256k1KeyIdentity } from '@dfinity/identity-secp256k1';

import { queryExecutingExperience } from '@/components/light-experience/canisters/core_worker/apis';
import {
    LightExecutingQueryResult,
    LightExecutingQueryValue,
} from '@/components/light-experience/canisters/core_worker/core_worker.did.d';
import { getIcnaming } from '@/utils/icnaming';

export default defineComponent({
    components: {
        Editor,
        Toolbar,
        Settings,
        ImagesUpload,
        VideoUpload,
        CodeBlock,
        InsertLink,
        Formula,
        Preview,
        LocalHistory,
        ISPMetaBox,
        Directory,
        ImagesEditorAlt,
        GetAuthors,
        OnChain,
        Plugin,
    },
    name: 'EditorModel',
    setup() {
        const route = useRoute();
        const router = useRouter();
        const editorRef = shallowRef();
        const titleData = ref();
        const titleHeight = ref();
        const titleDom = ref();
        const valueHtml = ref('');
        const articleSetting = ref({
            tags: [],
            cover: '',
            comments: true,
            permissions: 'Public',
        });
        const autosavedPercentage = ref(0);
        const isComponent = ref();
        const insertCallback = ref();
        const componentDefaultValue = ref();
        const isHeader = ref(true);
        const isBottom = ref(false);
        const isTop = ref(true);
        let autosavedTimeOut;
        const isNotNext = ref(true);
        const headerH = ref();
        const settingsDom = shallowRef();
        const planetCanister: any = inject('planetCanister', null);
        const articleId = ref();
        const pushArticleLoading = ref(false);
        const lastDraftData = ref();
        const lastDraftTime = ref();
        const intervalDraftTime = ref(0);
        const showDraftTime = ref(true);
        const isAutoSaveShow = ref(false);
        const saving = ref(false);
        const savingType = ref('');
        const editInitLoading = ref();
        const isAutoSaved = ref(true);
        const metaboxApi = ref();
        const isDraft = ref(false);
        const saveDraftRetry = ref(0);
        const isDirectory = ref(true);
        const directoryTop = ref(1);
        const DB_DAO = ref();
        const isIndexedDBSupport = ref(true);
        const baseConfig = ref({
            customConfig: 'img { display: block; }',
        });
        const articleAuthor = ref('');
        const isShowAr = ref(false);
        const arMessage = ref('');
        const onChainObj = ref();
        const onChainRef = shallowRef();
        const pictureHistoryList = ref<string[]>([]);

        const cardGenerate = (editor: IDomEditor) => {
            const { children } = editor;
            const _error = (item, idx) => {
                editorRef.value.focus();
                SlateTransforms.removeNodes(editor, {
                    at: [idx],
                });
                const link = genLinkNode(item.url, item.linkText);
                const p = {
                    type: 'paragraph',
                    children: [link],
                };
                SlateTransforms.insertNodes(editor, [p], {
                    at: [idx],
                });

                cardGenerate(editor);
            };

            const _success = (res, idx) => {
                editorRef.value.focus();
                const props: any = {
                    cardData: res,
                };
                SlateTransforms.setNodes(editor, props, {
                    at: [idx],
                });
                cardGenerate(editor);
            };

            isNotNext.value = true;
            for (const [idx, item] of children.entries()) {
                if (item.type === 'link-card' && item.cardData === undefined) {
                    isNotNext.value = false;
                    const { url } = item;
                    const str = {
                        url,
                        reqTime: Date.now(),
                    };
                    cardInfo(str)
                        .then((res: any) => {
                            if (!res.type) {
                                _error(item, idx);
                            } else if (res.type) {
                                _success(res, idx);
                            }
                        })
                        .catch(() => {
                            _error(item, idx);
                        });
                    break;
                }
            }
        };

        const pluginGenerate = (editor: IDomEditor) => {
            const { children } = editor;
            for (const [idx, item] of children.entries()) {
                if (item.type === 'plugin' && item.value.loading) {
                    const { hash, canister } = item.value;
                    queryExecutingExperience(canister, hash).then(
                        async (res: LightExecutingQueryResult) => {
                            const type = Object.keys(res)[0];
                            if (type === 'frozen') {
                                const props: any = {
                                    value: {
                                        frozen: true,
                                        hash: hash,
                                        canister: canister,
                                    },
                                };
                                SlateTransforms.setNodes(editor, props, {
                                    at: [idx],
                                });
                            }
                            if (type === 'value') {
                                const value: LightExecutingQueryValue = res['value'];
                                const data: any = { ...value };
                                const icnaming = await getIcnaming(data.creator.toString());
                                data.info_json = JSON.parse(value.info_json);
                                const props: any = {
                                    value: {
                                        id: data.id,
                                        thumbnail: data.info_json.thumbnail,
                                        name: data.info_json.name,
                                        desc: data.info_json.instruction,
                                        user: data.creator.toString(),
                                        userDeal: icnaming
                                            ? icnaming
                                            : dealPid(data.creator.toString()),
                                        hash: hash,
                                        canister: canister,
                                        propValue: item.value.propValue,
                                    },
                                };
                                SlateTransforms.setNodes(editor, props, {
                                    at: [idx],
                                });
                            }
                        },
                    );
                }
            }
        };

        const onCreated = (editor: IDomEditor) => {
            editorRef.value = editor;
            store.commit('SET_EDITOR_REF', editor);
            const card = editor.getElemsByType('link-card');
            if (card.length) {
                cardGenerate(editor);
            }
        };

        const textareaKeydown = () => {
            const e = window.event || arguments[0];
            if (e.key == 'Enter' || e.code == 'Enter' || e.keyCode == 13) {
                e.returnValue = false;
                return false;
            }
        };

        const titleChange = () => {
            setTimeout(() => {
                titleHeight.value = titleDom?.value?.$el?.clientHeight;
            });
        };

        const openSettings = () => {
            if (!isBottom.value) {
                scrollBottom(16);
            } else {
                scrollTop(16);
            }
        };

        const modifySettings = (data) => {
            articleSetting.value = {
                ...articleSetting.value,
                ...data,
            };
        };

        const pushDataReplace = (str) => {
            const regex = /<img[^>]+src="([^">]+)"[^>]*>/g;
            str = str.replace(regex, function (match, src) {
                const hash = src.match(/\/ipfs\/(\w+)/);
                if (hash) {
                    return `<img src="${hash[1]}">`;
                } else {
                    return match;
                }
            });

            str = str.replace(/<img[^>]*?\s(?:data-href|style)="[^"]*"[^>]*?>/g, (imgTag) => {
                return imgTag.replace(/\s(?:data-href|style)="[^"]*"/g, '');
            });

            str = str.replace(/(?:<p><br><\/p>)+$/g, '<p><br></p>');

            return str;
        };

        const getPushData = (type) => {
            if (!settingsDom.value) {
                return;
            }
            const settingsData = settingsDom.value.getSettingsData();
            const statusKey = articleSetting.value.permissions
                ? articleSetting.value.permissions
                : 'Public';
            const pushData = {
                id: articleId.value ? articleId.value : '',
                title: titleData.value ? titleData.value : '',
                content: pushDataReplace(editorRef.value.getHtml()),
                atype: {
                    Article: null,
                },
                author: Principal.fromText(store.state.user_principal as string),
                ...settingsData,
            };

            pushData.status = {
                [statusKey]: null,
            };
            if (type === 'publish' && !pushData.title) {
                ElMessage.error(t('editor.pushData.titleEmpty'));
                pushArticleLoading.value = false;
                return false;
            }

            if (
                type === 'publish' &&
                (!pushData.content ||
                    pushData.content === '<p><br></p>' ||
                    pushData.content === '<p></p>')
            ) {
                ElMessage.error(t('editor.pushData.contentEmpty'));
                pushArticleLoading.value = false;
                return false;
            }

            if (
                type === 'draft' &&
                (!pushData.content ||
                    pushData.content === '<p><br></p>' ||
                    pushData.content === '<p></p>')
            ) {
                return false;
            }

            if (type === 'draft') {
                pushData.status = {
                    Draft: null,
                };
            }

            if (type === 'publish' && !settingsData.abstract) {
                let text = editorRef.value.getText();
                if (text) {
                    text = text.slice(0, 100);
                    pushData.abstract = text;
                }
            }

            return pushData;
        };

        const pushArticle = async (obj, type) => {
            if (saving.value) {
                return true;
            }
            savingType.value = type;
            if (!obj.original && !obj.fromurl) {
                if (type === 'draft') {
                    obj.original = true;
                }
                else {
                    ElMessage.error(t('editor.settings.fromurlError'));
                    pushArticleLoading.value = false;
                    return false;
                }
            }

            if (!articleId.value) {
                saving.value = true;
                try {
                    const res = await planetCanister.value.addArticle(obj);
                    if (res.Ok) {
                        articleId.value = res.Ok.data;
                        saving.value = false;
                        router.push({
                            name: 'planetEditor',
                            params: {
                                id: route.params.id,
                            },
                            query: {
                                articlesId: articleId.value,
                            },
                        });
                        return res.Ok.data;
                    } else {
                        debug('error', res);
                    }
                } catch (err) {
                    debug('error', err);
                    saving.value = false;
                    ElMessage.error(t('utils.noAccess'));
                    router.push('/rover/planet');
                }
            } else {
                saving.value = true;
                try {
                    const res = await planetCanister.value.updateArticle(obj);
                    if (res.Ok) {
                        articleId.value = res.Ok.data;
                        saving.value = false;
                        saveDraftRetry.value = 0;
                        return res.Ok.data;
                    }
                } catch (err) {
                    debug('error', err);
                    saving.value = false;
                    if (isDraft.value) {
                        ElMessage.error(t('utils.saveDraftError'));
                        if (saveDraftRetry.value < 3) {
                            saveDraftRetry.value = saveDraftRetry.value + 1;
                            return;
                        }
                    }
                    saveDraftRetry.value = 0;
                    ElMessage.error(t('utils.noAccess'));
                    router.push('/rover/planet');
                }
            }
        };

        const publish = async () => {
            if (saving.value) {
                ElMessage.warning(t('editor.pushData.moment'));
                return;
            }
            if (store.state.images_upload_ipfs) {
                ElMessage.warning(t('editor.pushData.imagesUploadIpfsError'));
                return;
            }
            pushArticleLoading.value = true;
            const pushData = getPushData('publish');
            debug('data', pushData, false);
            if (!pushData) {
                return;
            }
            const res = await pushArticle(pushData, 'publish');
            if (res) {
                publishSuccess(res, pushData);
            }
        };

        const onChainClose = () => {
            pushArticleLoading.value = false;
            router.push({
                name: 'planetContent',
                params: {
                    id: route.params.id,
                },
            });
        };

        const onChainSubmit = async () => {
            const _onChainSubmitSuccess = () => {
                pushArticleLoading.value = false;
                router.push({
                    name: 'planetContent',
                    params: {
                        id: route.params.id,
                    },
                });
            };
            try {
                const res = await submitArticleToArweave(
                    onChainObj.value.identity,
                    onChainObj.value.planet,
                    onChainObj.value.id,
                    onChainObj.value.created,
                    {
                        ...onChainObj.value.content,
                    },
                    {
                        ...onChainObj.value.secp256k1Key,
                    },
                    onChainObj.value.message,
                );
                if (res.code === 0 && res.data) {
                    _onChainSubmitSuccess();
                } else {
                    _onChainSubmitSuccess();
                    debug('failed', res);
                }
            } catch (err) {
                debug('failed', err);
                if (
                    err instanceof Error &&
                    (err.message.includes('timeout') || err.message.includes('Time out'))
                ) {
                    _onChainSubmitSuccess();
                } else {
                    ElMessage.error(t('editor.pushData.onChainError'));
                    onChainRef.value.state = false;
                    pushArticleLoading.value = false;
                }
            }
        };

        const publishSuccess = async (aid: string, pushData: any) => {
            const identity = store.state.current_identity;
            clearTimeout(autosavedTimeOut);
            if (
                (!articleAuthor.value || store.state.user_data.pid === articleAuthor.value) &&
                Object.keys(pushData.status)[0] === 'Public' &&
                identity
            ) {
                const res = await planetCanister.value.adminArticle(aid);
                const contentText = res.Ok.content;
                const contentArticle = res.Ok.article;
                const secp256k1Key = Secp256k1KeyIdentity.generate();
                console.log(secp256k1Key);
                const publicKey = secp256k1Key.toJSON()[0];
                const secretKey = secp256k1Key.toJSON()[1];
                arMessage.value = publicKey;
                const message = `I authorize publishing on Mora from this device using: ${publicKey}`;
                isShowAr.value = true;

                const str = {
                    identity,
                    planet: store.state.current_open_planet,
                    id: articleId.value,
                    created: contentArticle.created.toString(),
                    content: {
                        body: contentText,
                        timestamp: contentArticle.updated
                            ? contentArticle.updated.toString()
                            : contentArticle.created.toString(),
                        title: contentArticle.title,
                    },
                    secp256k1Key: {
                        publicKey,
                        secretKey,
                    },
                    message,
                };

                onChainObj.value = str;
            } else {
                pushArticleLoading.value = false;
                router.push({
                    name: 'planetContent',
                    params: {
                        id: route.params.id,
                    },
                });
            }
        };

        const saveLocalHistory = (pushData) => {
            const customerObjectStore = DB_DAO.value
                .transaction('moraArticleData', 'readwrite')
                .objectStore('moraArticleData');
            const request = customerObjectStore.get(pushData.id);

            request.onerror = (event) => {
                debug('error', event, false);
            };
            // pushData.original = true;
            request.onsuccess = () => {
                if (!request.result) {
                    const dbRes = customerObjectStore.add({
                        id: pushData.id,
                        articleData: [
                            {
                                editorTime: new Date().getTime(),
                                article: pushData,
                            },
                        ],
                    });

                    dbRes.onsuccess = (event) => {
                        debug('failed', '', false);
                    };

                    dbRes.onerror = (event) => {
                        debug('failed', event);
                    };
                } else {
                    const nArr = [
                        {
                            editorTime: new Date().getTime(),
                            article: pushData,
                        },
                        ...request.result.articleData,
                    ].splice(0, CONFIG.autosaveLocalHistory);

                    const putData = customerObjectStore.put({
                        id: articleId.value,
                        articleData: nArr,
                    });
                    putData.onsuccess = (event) => {
                        debug('success', '', false);
                    };
                    putData.onerror = (event) => {
                        debug('failed', '', false);
                    };
                }
            };
        };

        const saveDraft = async () => {
            const pushData = getPushData('draft');
            if (!pushData) {
                isAutoSaveShow.value = false;
                return;
            }
            isAutoSaveShow.value = true;

            if (JSON.stringify(lastDraftData.value) === JSON.stringify(pushData)) {
                debug('error', '', false);
                intervalDraftTime.value = (Date.now() - lastDraftTime.value) / 1000;
                return;
            }

            showDraftTime.value = true;
            lastDraftData.value = pushData;
            lastDraftTime.value = Date.now();

            if (pushData.id && isIndexedDBSupport.value && DB_DAO.value) {
                saveLocalHistory(pushData);
            }

            if (isDraft.value) {
                const res = await pushArticle(pushData, 'draft');
                if (res) {
                    pushData.id = res;
                    lastDraftData.value = pushData;
                    debug('success', '', false);
                }
            }
        };

        const autosaved = () => {
            let num = 0;
            autosavedTimeOut = setInterval(() => {
                ++num;
                autosavedPercentage.value = (num * 500) / CONFIG.autosavedInterval / 10;
                if (autosavedPercentage.value >= 100) {
                    saveDraft();
                    clearTimeout(autosavedTimeOut);
                    setTimeout(() => {
                        autosavedPercentage.value = 0;
                        showDraftTime.value = false;
                        autosaved();
                    }, CONFIG.autosavedDoneInterval * 1000);
                }
            }, 500);
        };

        const permissionsChange = (type) => {
            articleSetting.value.permissions = type;
        };

        const permissionsFilter = computed(() => {
            const txt = articleSetting?.value?.permissions;
            if (!txt) {
                return t('editor.tools.permissions.Public');
            }
            return t(`editor.tools.permissions.${txt}`);
        });

        const insertImagesNode = (src, alt) => {
            editorRef.value.focus();
            editorRef.value.restoreSelection();
            const paragraph1 = { type: 'paragraph', children: [{ text: '' }] };
            const imagesNode = {
                alt,
                href: '',
                src,
                style: { width: '', height: '' },
                type: 'image',
                children: [{ text: '' }],
            };
            const paragraph2 = { type: 'paragraph', children: [{ text: '' }] };
            const nodeList = [paragraph1, imagesNode, paragraph2];
            SlateTransforms.insertNodes(editorRef.value, nodeList);
        };

        const componentClose = () => {
            isComponent.value = undefined;
        };

        const codeBlock = (info) => {
            insertCallback.value = info.callback;
            componentDefaultValue.value = info.text;
            isComponent.value = 'CodeBlock';
        };

        const openImagesUpload = (info: { insertFn: InsertFnType; file: File | '' }) => {
            insertCallback.value = info.insertFn;
            componentDefaultValue.value = info.file;
            isComponent.value = 'ImagesUpload';
        };

        const openVideoUpload = (info: { insertFn: InsertFnType; file: File | '' }) => {
            insertCallback.value = info.insertFn;
            isComponent.value = 'VideoUpload';
        };

        const openUploadFile = async (info) => {
            if (!metaboxApi.value) {
                metaboxApi.value = new MetaBox(store.state.agent);
            }
            insertCallback.value = info.insertFn;
            componentDefaultValue.value = '';
            isComponent.value = 'ISPMetaBox';
        };

        const openInsertLink = (info: { insertFn: InsertFnType; text: '' }) => {
            insertCallback.value = info.insertFn;
            componentDefaultValue.value = info.text;
            isComponent.value = 'InsertLink';
        };

        const replaceSymbols = (str: string) => {
            return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        };

        const embedVideo = async (info) => {
            editorRef.value.restoreSelection();
            const { parseVideoSrc } = editorRef.value.getMenuConfig('insertVideo');
            let parsedSrc = await parseVideoSrc(info.text);
            const video: {
                type: 'video';
                src: string;
                poster?: string;
                width?: string;
                height?: string;
                children: [
                    {
                        text: '';
                    },
                ];
            } = {
                type: 'video',
                src: parsedSrc,
                children: [{ text: '' }],
            };
            if (parsedSrc.trim().indexOf('<iframe ') !== 0) {
                parsedSrc = replaceSymbols(parsedSrc);
            } else {
                if (parsedSrc.includes('width="')) {
                    const videoWidth = parsedSrc.split('width="')[1];
                    if (videoWidth) {
                        video.width = videoWidth.split('"')[0];
                    }
                    const videoHeight = parsedSrc.split('height="')[1];
                    if (videoHeight) {
                        video.height = videoHeight.split('"')[0];
                    }
                }
            }

            Transforms.insertNodes(editorRef.value, video);
        };

        const openEditLink = (info) => {
            insertCallback.value = info.callback;
            componentDefaultValue.value = info.text;
            isComponent.value = 'InsertLink';
        };

        const openFormula = (info) => {
            insertCallback.value = info.callback;
            componentDefaultValue.value = info.text;
            isComponent.value = 'Formula';
        };

        const cardToLink = ({ data }) => {
            editorRef.value.focus();
            const idx = data.idx;
            const url = data.url;
            const linkText = data.linkText;
            SlateTransforms.removeNodes(editorRef.value, {
                at: [idx],
            });
            const link = genLinkNode(url, linkText);
            const p = {
                type: 'paragraph',
                children: [link],
            };
            SlateTransforms.insertNodes(editorRef.value, [p], {
                at: [idx],
            });
        };

        const toolbarChange = (event) => {
            const tip = event.target.getAttribute('data-tooltip');
            if (
                (tip === 'Preview' || tip === '预览') &&
                ~event.target.className.indexOf('disabled')
            ) {
                openPreview();
            }

            if (
                (tip === 'Local History' || tip === '本地历史') &&
                ~event.target.className.indexOf('disabled')
            ) {
                openLocalHistory();
            }
        };

        const headerRolling = () => {

            const nowTop = document.body.scrollTop + document.documentElement.scrollTop;
            headerH.value = document.getElementsByTagName('header')[0].offsetHeight;
            if (nowTop >= headerH.value) {
                store.commit('SET_IS_HEADER', false);
                isHeader.value = false;
            } else {
                store.commit('SET_IS_HEADER', true);
                isHeader.value = true;
            }

            if (document.body.offsetHeight - window.innerHeight <= nowTop + 1) {
                isBottom.value = true;
            } else {
                isBottom.value = false;
            }

            if (nowTop !== 0) {
                isTop.value = false;
            } else {
                isTop.value = true;
            }

            if (nowTop >= 380) {
                directoryTop.value = 2;
            } else {
                directoryTop.value = 1;
            }
        };

        const editorDomClick = (event) => {
            const current = editorRef.value.getFragment();
            const img = current[0]?.children[0];
            if (!img || !DomEditor.findPath) {
                return;
            }
            try {
                const linkPath = DomEditor?.findPath(editorRef.value, img);
                if (!linkPath) {
                    return;
                }
                if (
                    event.target &&
                    event.target.className.includes('w-e-selected-image-container')
                ) {
                    editorRef.value.focus();
                    SlateTransforms.removeNodes(editorRef.value, { at: [linkPath[0]] });
                }
                if (event.target && event.target.className.includes('left-top')) {
                    const linkPath = DomEditor.findPath(editorRef.value, img);
                    const str = JSON.parse(JSON.stringify(current))[0];
                    insertCallback.value = editorImageAlt;
                    componentDefaultValue.value = {
                        path: linkPath,
                        imageData: str,
                    };
                    isComponent.value = 'ImagesEditorAlt';
                }
            } catch (err) { }
        };

        const editorImageAlt = ({ path, imageData }) => {
            editorRef.value.focus();
            SlateTransforms.setNodes(editorRef.value, imageData, {
                at: [path[0]],
            });
        };

        const removeFormatDelete = (editor, event) => {
            const { selection } = editor;
            if (selection) {
                const [block, node] = SlateEditor.node(editor, selection);
                const markArr = SlateEditor.marks(editor);
                const lineIsEmpty = !block?.text;
                if (SlateText.isText(block) && markArr) {
                    if (lineIsEmpty) {
                        for (const item in markArr) {
                            editor.removeMark(item);
                        }
                        if (markArr && Object.keys(markArr).length) {
                            event.preventDefault();
                        }
                    }
                }

                const selectedElems: any = DomEditor.getSelectedElems(editor);
                const path = DomEditor.findPath(editor, selectedElems[0]);

                if (selectedElems.length === 1 && lineIsEmpty) {
                    if (
                        selectedElems[0].type === 'blockquote' ||
                        ~selectedElems[0].type.indexOf('header')
                    ) {
                        Transforms.setNodes(
                            editor,
                            { type: 'paragraph' },
                            { mode: 'highest', at: [node[0]] },
                        );
                        event.preventDefault();
                    }

                    let prevIndex: any = [path[0] - 1];
                    if (prevIndex && prevIndex[0] && prevIndex[0] > 0) {
                        prevIndex = prevIndex[0];
                        if (
                            editor.children[prevIndex] &&
                            editor.children[prevIndex].type === 'table'
                        ) {
                            const newSelection = {
                                anchor: { path: [prevIndex, 0, 0, 0], offset: 0 },
                                focus: { path: [prevIndex, 0, 0, 0], offset: 0 },
                            };
                            editor.select(newSelection);
                        }
                    }
                }
            }
        };

        const removeFormatEnter = (editor, event) => {
            const { selection } = editor;
            const [block, node] = SlateEditor.node(editor, selection);
            const lineIsEmpty = !block?.text;
            const selectedElems: any = DomEditor.getSelectedElems(editor);

            if (selectedElems.length === 1 && lineIsEmpty) {
                if (selectedElems[0].type === 'list-item') {
                    Transforms.setNodes(
                        editor,
                        { type: 'paragraph' },
                        { mode: 'highest', at: [node[0]] },
                    );
                }
            }
        };

        const onKeydown = (event) => {
            if (event.keyCode === 8) {
                removeFormatDelete(editorRef.value, event);
            }

            if (event.keyCode === 13) {
                removeFormatEnter(editorRef.value, event);
            }
        };

        const keydownChange = (event) => { };

        const openPreview = () => {
            const res = editorRef.value.getHtml();
            const reg = /\\/g;
            const res2 = res.replace(reg, '\\\\');

            insertCallback.value = '';
            componentDefaultValue.value = {
                title: titleData.value,
                content: res2,
            };
            isComponent.value = 'Preview';
        };

        const openInsertPlugin = () => {
            isComponent.value = 'Plugin';
        };

        const isContentFromWord = (pastedData) => {
            if (pastedData.match(/xmlns:w="urn:schemas-microsoft-com:office:word"/gi)) {
                return true;
            }

            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = pastedData;
            const wordStyles = ['MsoNormal', 'MsoListParagraph', 'MsoTable'];
            const elements: any = tempDiv.getElementsByTagName('*');
            for (const element of elements) {
                const className = element.className || '';
                const tagName = element.tagName.toLowerCase();
                if (wordStyles.includes(className) || wordStyles.includes(tagName)) {
                    return true;
                }
            }

            return false;
        };

        const customPaste = (editor: IDomEditor, event: ClipboardEvent | false) => {
            setTimeout(() => {
                if (isNotNext.value) {
                    cardGenerate(editor);
                }
            }, 0);
            if (event && event.clipboardData) {
                const html = event.clipboardData.getData('text/html');
                if (isContentFromWord(html)) {
                    return;
                }

                const output = xss(html, {
                    whiteList: {
                        a: ['href', 'title', 'target'],
                        b: [],
                        blockquote: ['cite'],
                        br: [],
                        code: [],
                        dd: [],
                        div: [],
                        em: [],
                        h1: [],
                        h2: [],
                        h3: [],
                        h4: [],
                        h5: [],
                        h6: [],
                        hr: [],
                        i: [],
                        img: ['src', 'title'],
                        li: [],
                        ol: [],
                        p: [],
                        pre: [],
                        span: [],
                        strong: [],
                        table: ['border', 'align', 'valign'],
                        td: ['rowspan', 'colspan', 'align', 'valign'],
                        th: ['rowspan', 'colspan', 'align', 'valign'],
                        tr: ['rowspan', 'align', 'valign'],
                        tt: [],
                        ul: [],
                        video: ['src', 'poster', 'preload', 'autoplay', 'controls', 'loop'],
                    },
                    stripIgnoreTag: true,
                });

                if (output) {
                    let replacedText = output
                        .replace(/<div\b[^>]*>/g, '<p>')
                        .replace(/<\/div>/g, '</p>');

                    const regex = /<img\s[^>]*?src="data:image[^"]*?"[^>]*>/g;
                    replacedText = replacedText.replace(regex, '');

                    replacedText = replacedText.replace(
                        /<img([^>]*)>/gi,
                        '<div class="thing-page-image" data-mode="full"><img$1/></div>',
                    );

                    replacedText = replacedText.replace(
                        /<p>\s*<p>\s*<p>\s*|\s*<\/p>\s*<\/p>\s*<\/p>/g,
                        '',
                    );

                    replacedText = replacedText.replace(/(<p>)+/g, '<p>');
                    replacedText = replacedText.replace(/(<\/p>)+/g, '</p>');

                    editor.dangerouslyInsertHtml(replacedText);
                    event.preventDefault();
                    return false;
                }
            }
        };

        const locateArticle = (item) => {
            const dom = document.getElementById(item.id);
            if (dom) {
                const top = dom.offsetTop;
                document.documentElement.scrollTop = top + 150;
            }
        };

        const recovery = ({ article }) => {
            editorRef.value.focus();
            editorRef.value.clear();
            setTimeout(() => {
                editorRef.value.setHtml(article.content);
                titleData.value = article.title;
                settingsDom.value.setSettingsData({
                    tags: article.tags,
                    cate: article.cate,
                    subcate: article.subcate,
                    thumb: article.thumb,
                    allowComment: article.allowComment,
                    abstract: article.abstract,
                    original: article.original,
                    fromurl: article.fromurl,
                });
                customPaste(editorRef.value, false);
            }, 0);
        };

        const openLocalHistory = () => {
            if (!articleId.value) {
                return;
            }
            if (DB_DAO.value) {
                componentDefaultValue.value = DB_DAO.value;
                insertCallback.value = recovery;
                isComponent.value = 'LocalHistory';
            } else {
                ElMessage.error(t('utils.indexedDBError'));
            }
        };

        const editorInit = () => {
            const editor = editorRef.value;
            i18nChangeLanguage('en');
            nextTick(() => {
                const addImageToolBtn = document.querySelector(
                    '.w-e-menu-tooltip-v5[data-tooltip="Upload Image"]',
                ) as HTMLDivElement | null;
                if (addImageToolBtn) {
                    addImageToolBtn.onclick = (event: any) => {
                        const isFocused = editorRef.value.isFocused();
                        if (!isFocused) {
                            return;
                        }
                        if (event.target.className.indexOf('disabled') !== -1) {
                            insertCallback.value = insertImagesNode;
                            componentDefaultValue.value = '';
                            isComponent.value = 'ImagesUpload';
                        }
                    };
                }

                const addQuoteToolBtn = document.querySelector(
                    '.w-e-menu-tooltip-v5[data-tooltip="Quote"]',
                ) as HTMLDivElement | null;
                if (addQuoteToolBtn) {
                    addQuoteToolBtn.onclick = (event: any) => {
                        if (event.target.className.indexOf('disabled') !== -1) {
                            const nodeEntries = SlateEditor.nodes(editor, {
                                match: (node: SlateNode) => {
                                    // TS syntax
                                    if (SlateElement.isElement(node)) {
                                        if (
                                            [
                                                'header1',
                                                'header2',
                                                'header3',
                                                'header4',
                                                'header5',
                                            ].includes(node.type)
                                        ) {
                                            return true;
                                        }
                                    }
                                    return false;
                                },
                                universal: true,
                            });

                            if (nodeEntries) {
                                for (const nodeEntry of nodeEntries) {
                                    const [node, path] = nodeEntry as any[];
                                    const text: string = node.children[0].text;
                                    SlateTransforms.removeNodes(editorRef.value, {
                                        at: [path],
                                    });

                                    const blockquoteNode = {
                                        type: 'blockquote',
                                        children: [{ text }],
                                    };

                                    SlateTransforms.insertNodes(editorRef.value, [blockquoteNode], {
                                        at: [path],
                                    });
                                }
                            }

                            const nodeEntriesImages = SlateEditor.nodes(editor, {
                                match: (node: SlateNode) => {
                                    // TS syntax
                                    if (SlateElement.isElement(node)) {
                                        if (node.type === 'image') {
                                            return true;
                                        }
                                    }
                                    return false;
                                },
                                universal: true,
                            });

                            if (nodeEntriesImages) {
                                for (const nodeEntry of nodeEntriesImages) {
                                    const [node, path] = nodeEntry as any[];
                                    const blockquoteNode = {
                                        type: 'blockquote',
                                        children: [{ text: '' }],
                                    };
                                    SlateTransforms.insertNodes(editorRef.value, [blockquoteNode], {
                                        at: [path[0] + 1],
                                    });
                                }
                            }
                        }
                    };
                }
            });
        };

        const pictureHistory = (editor) => {
            const { children } = editor;
            const list: string[] = [];
            children.map((item) => {
                if (item.type === 'thingImage' && item.src) {
                    list.push(item.src);
                }
            });
            pictureHistoryList.value = list;
        };

        const addPictureHistory = (url) => {
            pictureHistoryList.value.push(url);
        };

        const editInit = async () => {
            if (!planetCanister || !planetCanister.value) {
                return;
            }
            const aid = route?.query?.articlesId;
            if (aid) {
                articleId.value = aid;
                indexDBInit();

                try {
                    const res = await planetCanister.value.adminArticle(aid);
                    if (res.Ok) {
                        let contentText = res.Ok.content;
                        contentText = pushDataFilterText(contentText);
                        editInitLoading.value.close();
                        setTimeout(() => {
                            editorRef.value.focus();
                            editorRef.value.setHtml(contentText);
                        });
                        titleData.value = res.Ok.article.title;
                        settingsDom.value.setSettingsData(res.Ok.article);
                        customPaste(editorRef.value, false);
                        const key = Object.keys(res.Ok.article.status)[0];
                        autosaved();
                        articleAuthor.value = res.Ok.article.author.toString();
                        if (key === 'Draft') {
                            isDraft.value = true;
                        } else {
                            isAutoSaved.value = false;
                            articleSetting.value.permissions = key;
                            isDraft.value = false;
                        }
                        nextTick(() => {
                            cardGenerate(editorRef.value);
                            setTimeout(() => {
                                pictureHistory(editorRef.value);
                                pluginGenerate(editorRef.value);
                            });
                        });
                    }
                } catch (err) {
                    debug('failed', err);
                }
            } else {
                isDraft.value = true;
            }
        };

        const indexDBInit = () => {
            if (!articleId.value) {
                return;
            }
            const MORA_DB_DAO = window.indexedDB.open('MORA_DB', 1.0);

            MORA_DB_DAO.onerror = () => {
                isIndexedDBSupport.value = false;
            };

            MORA_DB_DAO.onsuccess = (event: any) => {
                const db = event.target.result;
                if (db.objectStoreNames.contains('moraArticleData')) {
                    DB_DAO.value = db;
                }
            };

            MORA_DB_DAO.onupgradeneeded = (event: any) => {
                const db = event.target.result;

                let objectStore;
                if (!db.objectStoreNames.contains('moraArticleData')) {
                    objectStore = db.createObjectStore('moraArticleData', { keyPath: 'id' });
                    objectStore.createIndex('id', 'id', { unique: true });
                    objectStore.createIndex('articleData', 'articleData', { unique: false });
                    DB_DAO.value = db;
                }
            };
        };

        onBeforeUnmount(() => {
            clearTimeout(autosavedTimeOut);
            const editor = editorRef.value;
            if (editor == null) return;
            bus.off('uploadImagesEmit', openImagesUpload);
            bus.off('codeBlockEmit', codeBlock);
            bus.off('uploadVideoEmit', openVideoUpload);
            bus.off('insertLinkEmit', openInsertLink);
            bus.off('embedVideo', openInsertLink);
            bus.off('editLinkEmit', openEditLink);
            bus.off('formulaEmit', openFormula);
            bus.off('cardToLinkEmit', cardToLink);
            bus.off('previewEmit', openPreview);
            bus.off('customPasteEmit', customPaste);
            bus.off('uploadFileEmit', openUploadFile);
            bus.off('locateArticle', locateArticle);
            bus.off('localHistoryEmit', openLocalHistory);
            bus.off('addPictureHistory', addPictureHistory);
            bus.off('pluginEmit', openInsertPlugin);

            document.removeEventListener('scroll', headerRolling);
            document.removeEventListener('keydown', keydownChange);
            editor.destroy();
        });

        bus.on('uploadImagesEmit', openImagesUpload);
        bus.on('codeBlockEmit', codeBlock);
        bus.on('uploadVideoEmit', openVideoUpload);
        bus.on('insertLinkEmit', openInsertLink);
        bus.on('embedVideo', embedVideo);
        bus.on('editLinkEmit', openEditLink);
        bus.on('formulaEmit', openFormula);
        bus.on('cardToLinkEmit', cardToLink);
        bus.on('uploadFileEmit', openUploadFile);
        bus.on('previewEmit', openPreview);
        bus.on('customPasteEmit', customPaste);
        bus.on('locateArticle', locateArticle);
        bus.on('localHistoryEmit', openLocalHistory);
        bus.on('addPictureHistory', addPictureHistory);
        bus.on('pluginEmit', openInsertPlugin);

        watch(
            () => store.state.current_planet_data,
            (val: any) => {
                if (!articleId.value) {
                    editInit();
                }
            },
        );

        watch(
            () => articleId.value,
            (val: any) => {
                if (articleId.value && !DB_DAO.value) {
                    indexDBInit();
                }
            },
        );

        onMounted(() => {
            store.commit('SET_IS_HEADER', true);
            nextTick(() => {
                editorInit();
                titleChange();

                document.addEventListener('scroll', headerRolling, false);
                document.addEventListener('keydown', keydownChange);
            });
        });

        onUnmounted(() => {
            clearTimeout(autosavedTimeOut);
        });

        onBeforeMount(() => {
            if (route?.query?.articlesId) {
                editInitLoading.value = ElLoading.service({ fullscreen: true });
            } else {
                autosaved();
            }
            if (planetCanister && planetCanister.value) {
                editInit();
            }
            if (!store.state.agent) {
                editInitLoading.value?.close();
            }
        });

        provide('metaboxApi', metaboxApi);
        provide('articleId', articleId);
        provide('pictureHistoryList', pictureHistoryList);

        return {
            mode: 'default',
            settingsDom,
            articleSetting,
            titleData,
            titleDom,
            titleHeight,
            editorRef,
            valueHtml,
            toolbarConfig,
            editorConfig,
            autosavedPercentage,
            permissionsFilter,
            isComponent,
            insertCallback,
            componentDefaultValue,
            isBottom,
            isTop,
            isHeader,
            isNotNext,
            headerH,
            DB_DAO,
            pushArticleLoading,
            showDraftTime,
            intervalDraftTime,
            isAutoSaveShow,
            saving,
            savingType,
            editInitLoading,
            isAutoSaved,
            metaboxApi,
            isDirectory,
            directoryTop,
            baseConfig,
            isShowAr,
            arMessage,
            onChainRef,
            onKeydown,
            saveDraft,
            openUploadFile,
            toolbarChange,
            editorDomClick,
            componentClose,
            textareaKeydown,
            titleChange,
            openSettings,
            modifySettings,
            publish,
            permissionsChange,
            onCreated,
            onChange,
            onDestroyeds,
            onBlur,
            onFocus,
            customPaste,
            onChainClose,
            onChainSubmit,
            openInsertPlugin,
        };
    },
});
</script>

<style scoped lang="less">
.thing-image-container {
    border: 1px dashed var(--w-e-textarea-border-color);
    border-radius: 5px;
    overflow-x: auto;
    padding: 20px 10px;
    width: 100%;
    box-shadow: #b4d5ff 0px 1px 5px;
    overflow: hidden;
}

.wangeditor {
    height: 100%;
    display: flex;
    flex: 1;
    width: 100%;
    margin: 0 auto;
    align-items: center;
    flex-direction: column;
    position: relative;

    :deep(.toolbar) {
        margin: 0 auto;
        width: 100%;
        z-index: 11;
        min-height: 65px;

        .w-e-toolbar {
            width: 100%;
        }

        &.isHeader {
            width: 100%;

            .w-e-bar {
                background: @bg-color;
                box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.05);
                position: fixed;
                top: 0;
                left: 0;
                margin: 0 auto;
                width: 100%;
                min-width: 1000px;
                .center();
                @apply dark: (bg-dark-600);

                .w-e-bar-item {
                    width: 55px;
                    flex: none;
                }
            }
        }

        .w-e-bar {
            background: none;
            min-height: 65px;
            display: flex;
            justify-content: center;
            padding: 0;
            align-items: center;

            .w-e-bar-item {
                width: 55px;
                height: 55px;
                padding: 0;
                position: relative;

                button {
                    .iconfont();
                    display: flex;
                    width: 100%;
                    height: 100%;
                    padding: 0;
                    margin: 0;
                    font-size: 22px;
                    color: @text-color-icon;
                    overflow: auto !important;

                    &.w-e-menu-tooltip-v5 {
                        svg {
                            display: none;
                        }

                        &.active {
                            @apply dark: ( !bg-dark-300);
                        }
                    }

                    &.disabled {
                        cursor: not-allowed;

                        &[data-tooltip='预览'],
                        &[data-tooltip='Preview'] {
                            cursor: pointer;
                        }

                        &[data-tooltip='本地历史'],
                        &[data-tooltip='Local History'] {
                            cursor: pointer;
                        }

                        &::before {
                            // opacity: 0.3;
                        }
                    }

                    &::before {
                        background: none;
                        border-radius: 5px;
                        opacity: 1;
                        padding: 0;
                        margin: 0;
                        position: absolute;
                        width: 100%;
                        height: 100%;
                        text-align: center;
                        top: 0;
                        left: 0;
                        transition: opacity 0.6s;
                        visibility: initial;
                        white-space: pre;
                        z-index: 10;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        color: @text-color-iconEditor;
                        font-size: 20px;
                        @apply dark: (text-light-900/60);
                    }

                    &[data-tooltip='撤销']::before,
                    &[data-tooltip='undo']::before {
                        content: '\e007';
                    }

                    &[data-tooltip='重做']::before,
                    &[data-tooltip='Redo']::before {
                        content: '\e00d';
                    }

                    &[data-tooltip='清除格式']::before,
                    &[data-tooltip='Clear styles']::before {
                        content: '\e05b';
                    }

                    &[data-tooltip*='粗体']::before,
                    &[data-tooltip*='Bold']::before {
                        content: '\e05a';
                    }

                    &[data-tooltip*='斜体']::before,
                    &[data-tooltip*='Italic']::before {
                        content: '\e013';
                    }

                    &[data-tooltip='左对齐']::before,
                    &[data-tooltip='Left']::before {
                        content: '\e012';
                    }

                    &[data-tooltip='居中对齐']::before,
                    &[data-tooltip='Center']::before {
                        content: '\e014';
                    }

                    &[data-tooltip='右对齐']::before,
                    &[data-tooltip='Right']::before {
                        content: '\e018';
                    }

                    &[data-tooltip='无序列表']::before,
                    &[data-tooltip='Unordered list']::before {
                        content: '\e00b';
                    }

                    &[data-tooltip='有序列表']::before,
                    &[data-tooltip='Ordered list']::before {
                        content: '\e016';
                    }

                    &[data-tooltip='引用']::before,
                    &[data-tooltip='Quote']::before {
                        content: '\e0cb';
                    }

                    &[data-tooltip='分割线']::before,
                    &[data-tooltip='Divider']::before {
                        content: '\e010';
                    }

                    &[data-tooltip='Insert Code']::before,
                    &[data-tooltip='代码块']::before {
                        content: '\e009';
                    }

                    &[data-tooltip='插入链接']::before,
                    &[data-tooltip='Insert Link']::before {
                        content: '\e015';
                    }

                    &[data-tooltip='上传图片']::before,
                    &[data-tooltip='Upload Image']::before {
                        content: '\e05e';
                    }

                    &[data-tooltip='上传视频']::before,
                    &[data-tooltip='Upload video']::before {
                        content: '\e019';
                    }

                    &[data-tooltip='插入表格']::before,
                    &[data-tooltip='Insert table']::before {
                        content: '\e05f';
                    }

                    &[data-tooltip='插入公式']::before,
                    &[data-tooltip='Insert formula']::before {
                        content: '\e0a8';
                    }

                    &[data-tooltip='文件上传']::before,
                    &[data-tooltip='Upload file']::before {
                        content: '\e0ef';
                    }

                    &[data-tooltip='预览']::before,
                    &[data-tooltip='Preview']::before {
                        content: '\e0ba';
                    }

                    &[data-tooltip='本地历史']::before,
                    &[data-tooltip='Local History']::before {
                        content: '\e13d';
                    }

                    &[data-tooltip='插件']::before,
                    &[data-tooltip='Plugin']::before {
                        content: '\e13d';
                    }

                    &::after {
                        content: attr(data-tooltip);
                        font-size: 12px;
                        border: 0;
                        top: 50px;
                        background: rgba(0, 0, 0, 0.9);
                        color: @text-color-inverse;
                        border-radius: 5px;
                        padding: 2px 8px;
                        white-space: nowrap;
                        z-index: 12;
                        @apply dark: (text-light-900/60);
                    }

                    &.active {
                        @apply dark:(bg-dark-900);

                        &:before {
                            color: @bg-color-body-active;
                        }
                    }

                    &:hover {
                        @apply dark:(bg-dark-900);

                        &.active {
                            @apply dark:(bg-dark-900);

                            &:before {
                                color: @bg-color-body-active;
                            }
                        }
                    }
                }

                &:hover {
                    background: none;
                }

                &.w-e-bar-item-group {
                    >button {
                        .iconfont();
                        position: relative;
                        font-size: 0;
                        .center();

                        svg {
                            display: none;
                        }

                        &.disabled {
                            cursor: not-allowed;
                        }

                        &::before {
                            content: '';
                            width: 0;
                            height: 0;
                            border-radius: 0;
                            position: absolute;
                            bottom: 6px;
                            top: auto;
                            left: auto;
                            border-left: 5px solid transparent;
                            border-right: 5px solid transparent;
                            border-bottom: 6px solid @text-color-iconEditor;
                            transition: @transition;
                        }

                        &::after {
                            background: none;
                            border-radius: 5px;
                            font-size: 25px;
                            opacity: 1;
                            padding: 0;
                            margin: 0;
                            position: relative;
                            width: 100%;
                            height: 100%;
                            text-align: center;
                            top: 0;
                            left: 0;
                            transition: opacity 0.6s;
                            visibility: initial;
                            white-space: pre;
                            z-index: 10;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            color: @text-color-iconEditor;
                            font-size: 20px;
                            content: '\e0b4';
                            @apply dark: (text-light-900/60);
                        }

                        &:hover {
                            &::before {
                                transform: rotate(180deg);
                                transition: @transition;
                            }
                        }
                    }

                    .w-e-bar-item-menus-container {
                        top: 15px;
                        left: -5px;
                        @apply dark: (bg-dark-600 border-dark-100);

                        .w-e-bar-item {
                            button {
                                width: 65px;
                                font-size: 0;
                                position: relative;

                                &:hover {
                                    background-color: #f1f1f1;
                                    @apply dark: (bg-dark-300);
                                }

                                &::before {
                                    width: auto;
                                    text-align: left;
                                    position: relative;
                                }

                                &::after {
                                    position: relative;
                                    top: auto;
                                    left: auto;
                                    background: none;
                                    color: #444;
                                    margin-left: 10px;
                                    font-size: 18px;
                                    display: none;
                                }
                            }

                            &:nth-child(1) {
                                button {
                                    &::after {
                                        content: 'Level 1 title';
                                    }

                                    &::before {
                                        content: '\e0ae';
                                    }
                                }
                            }

                            &:nth-child(2) {
                                button {
                                    &::after {
                                        content: 'Level 2 title';
                                    }

                                    &::before {
                                        content: '\e0af';
                                    }
                                }
                            }

                            &:nth-child(3) {
                                button {
                                    &::after {
                                        content: 'Level 3 title';
                                    }

                                    &::before {
                                        content: '\e0b0';
                                    }
                                }
                            }

                            &:nth-child(4) {
                                button {
                                    &::after {
                                        content: 'Level 4 title';
                                    }

                                    &::before {
                                        content: '\e0b1';
                                    }
                                }
                            }

                            &:nth-child(5) {
                                button {
                                    &::after {
                                        content: 'Level 5 title';
                                    }

                                    &::before {
                                        content: '\e0b2';
                                    }
                                }
                            }

                            &:nth-child(6) {
                                button {
                                    &::after {
                                        content: 'Level 6 title';
                                    }

                                    &::before {
                                        content: '\e0b3';
                                    }
                                }
                            }
                        }
                    }
                }

                .w-e-drop-panel {
                    @apply dark: (bg-dark-300 border-dark-100);

                    .w-e-panel-content-table {
                        @apply dark: (bg-dark-300);

                        td {
                            @apply dark: (border-dark-50);

                            &.active {
                                @apply dark: (bg-light-900/50);
                            }
                        }
                    }
                }

                &:last-child {
                    display: none;
                }
            }
        }
    }

    &.focus {
        :deep(.toolbar) {
            .w-e-bar {
                .w-e-bar-item {
                    button {
                        &.disabled {
                            &[data-tooltip='Upload Image'] {
                                cursor: pointer;

                                &::before {
                                    opacity: 1;
                                }
                            }

                            &[data-tooltip='Quote'] {
                                cursor: pointer;

                                &::before {
                                    opacity: 1;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    .addPlugin {
        position: fixed;
        background: #ffffff;
        border: 1px solid #ececec;
        border-right: none;
        box-shadow: -3px 0px 5px rgba(0, 0, 0, 0.06);
        border-radius: 12px 0px 0px 12px;
        width: 105px;
        height: 52px;
        top: 30%;
        left: calc(((100vw - 900px) / 2) - 105px);
        z-index: 10;
        display: flex;
        align-items: center;
        cursor: pointer;
        @apply dark:(bg-dark-800 border-transparent);

        img {
            width: 28px;
            height: 28px;
            margin-right: 8px;
            margin-left: 14px;
        }

        p {
            font-style: normal;
            font-weight: 500;
            font-size: 20px;
            color: #000000;
            @apply dark:(text-light-900);
        }
    }

    .editorMain {
        width: 900px;
        margin: 0 auto 80px auto;
        flex: 1;
        background: @bg-color;
        box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.05);
        border-radius: 15px;
        padding: 30px 30px 0 30px;
        margin-top: 10px;
        display: flex;
        flex-direction: column;
        position: relative;
        transition: @transition;
        font-size: 18px;
        position: relative;
        @apply dark: (bg-dark-800);

        :deep(.title) {
            display: flex;
            background: none;

            .el-textarea__inner {
                font-size: 36px;
                line-height: 44px;
                padding: 0;
                height: auto;

                font-weight: 700;
            }

            .el-textarea {
                .el-input__count {
                    bottom: -15px;
                    right: 0;
                }
            }
        }

        :deep(.editor) {
            width: 100%;
            border-top: 1px solid @border-color;
            margin-top: 20px;
            padding-top: 10px;
            padding-bottom: 30px;
            transition: @transition;
            height: auto !important;
            .noScrollbar();
            @apply dark: (border-dark-100);

            .thing-page-image {
                text-align: center !important;

                &.Image-captionContainer {
                    margin: 0;
                    line-height: 0;
                    text-align: center;
                    padding: 0 10px;
                    border: 1px solid transparent;
                    display: flex;
                    flex-direction: column;
                }

                .Image-resizerContainer {
                    position: relative;
                    line-height: 0;

                    .Image-resizerWrap {
                        position: absolute;
                        bottom: 8px;
                        left: 0;
                        width: 100%;
                        display: flex;
                        justify-content: center;
                    }
                }

                .Image-resizerWrap {
                    position: absolute;
                    bottom: 8px;
                    left: 0;
                    width: 100%;
                    display: flex;
                    justify-content: center;

                    .Image-buttonWrap {
                        display: inline-block;
                        cursor: pointer;
                        background: rgba(18, 18, 18, 0.5);
                        border-radius: 4px;
                        white-space: nowrap;
                        font-size: 13px;
                        // width: 89px;
                        width: 165px;
                        height: 33px;
                        line-height: 33px;
                        box-sizing: border-box;
                        color: #fff;

                        &.status-full {
                            &::before {
                                .iconfont();
                                content: '\e154';
                                margin-right: 5px;
                            }

                            &::after {
                                content: 'Switch to centered';
                            }
                        }

                        &.status-middle {
                            &::before {
                                .iconfont();
                                margin-right: 5px;
                                content: '\e155';
                            }

                            &::after {
                                content: 'Switch to widescreen';
                            }
                        }
                    }
                }

                .ImageDelete-Wrapper {
                    position: relative;
                    display: inline-block;
                    width: auto;

                    img {
                        // pointer-events: none;
                        max-width: 100%;
                        display: block;
                    }

                    .ImageDelete-Wrapper-icon {
                        position: absolute;
                        top: -10px;
                        right: -10px;
                        width: 20px;
                        height: 20px;
                        .center();
                        border-radius: 50%;
                        background-color: @bg-color-body-active;
                        color: rgb(255, 255, 255);
                        cursor: pointer;
                        .iconfont();
                        font-size: 12px;

                        &::before {
                            content: '\e04a';
                            font-size: 12px;
                            scale: 0.8;
                        }
                    }
                }

                .Image-caption {
                    color: #bfbfbf;
                    padding: 0 1em;
                    font-size: 0.9em;
                    line-height: 1.5;
                    text-align: center;
                    margin-top: 3px;
                    outline: none;
                    width: 100%;
                    display: flex;
                    .center();
                }

                .Image-loading {
                    .ImageDelete-Wrapper {
                        &::before {
                            content: 'img loading...';
                            position: absolute;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 24px;
                            color: #666;
                            width: 100%;
                            height: 100%;
                            top: 0;
                            left: 0;
                            background-color: rgba(255, 255, 255, 0.6);
                        }
                    }

                    .ImageDelete-Wrapper-icon,
                    .Image-resizerWrap {
                        display: none;
                    }

                    .Image-caption {
                        visibility: hidden;
                    }
                }

                .Image-loading-fail {
                    .ImageDelete-Wrapper::before {
                        content: 'img error...';
                    }

                    .ImageDelete-Wrapper-icon {
                        display: block;
                    }
                }
            }

            &.isNotNext {
                .w-e-text-container {
                    .w-e-bar {
                        display: none;
                    }
                }
            }

            .w-e-scroll {
                min-height: 700px;

                #w-e-textarea-1 {
                    min-height: 700px;

                    .imagesUploadIpfsLoading {
                        position: relative;
                        .center();

                        &>div {
                            height: 100%;
                            position: relative;
                            display: flex;
                            align-items: center;

                            &:first-child {
                                &::before {
                                    @apply w-12 h-12 border-5 border-purple-400 rounded-full border-r-transparent absolute left-1/2 -ml-6 z-50;
                                    content: '';
                                    vertical-align: text-bottom;
                                    vertical-align: -0.125em;
                                    -webkit-animation: spinner 0.75s linear infinite;
                                    animation: spinner 0.75s linear infinite;
                                }
                            }

                            &::after {
                                @apply w-full h-full absolute top-0 bottom-0 flex justify-center items-center bg-light-50/60 dark: (bg-dark-900/50);
                                backdrop-filter: blur(0) !important;
                            }
                        }
                    }

                    .imagesUploadIpfsError {
                        position: relative;

                        .center();

                        &>div {
                            :after {
                                bottom: 0 !important;
                            }
                        }
                    }
                }
            }

            .cardLoading {
                &::after {
                    content: '';
                    display: inline-flex;
                    background: url('@/assets/svg/loading2.svg') no-repeat center center;
                    background-size: 100% 100%;
                    width: 20px;
                    height: 20px;
                    margin-left: 15px;
                    position: relative;
                    top: 3px;
                }
            }

            .w-e-textarea-divider {
                padding: 0 !important;
                width: 100%;
            }

            .w-e-text-container {
                width: 100%;
                background: none;
                min-height: 700px;
                @apply dark: (text-light-900/80);
                transition: @transition;

                .w-e-progress-bar {
                    display: none;
                }

                div {
                    width: 100%;
                }

                strong,
                h1,
                h2,
                h3,
                h4,
                h5 {
                    font-weight: bold;
                    @apply dark:(text-light-900);
                }

                h1 {
                    font-size: 32px;
                }

                h2 {
                    font-size: 28px;
                }

                h3 {
                    font-size: 24px;
                }

                h4 {
                    font-size: 20px;
                }

                h5 {
                    font-size: 18px;
                }

                h1,
                h2,
                h3,
                h4,
                h5 {
                    @apply pt-5 pb-2 my-0;
                }

                p {
                    @apply py-3 my-0;
                    transition: @transition;
                }

                * {
                    box-shadow: none;
                }

                // div[contenteditable="false"] {
                //   border: none !important;
                // }

                hr {
                    width: 50%;
                    margin-left: auto;
                    margin-right: auto;
                    background-color: #ddd;
                    height: 1px;
                    border: none;
                    @apply dark: (bg-dark-100);
                }

                pre {
                    &>code {
                        background: #f6f6f6;
                        border: none;
                        text-shadow: none !important;
                        @apply dark: (bg-dark-300);
                    }
                }

                blockquote {
                    background: #f6f6f6;
                    border-color: @border-color-active;
                    @apply dark: (bg-dark-300);
                }

                .table-container {
                    border: 2px solid transparent;
                    padding: 0px;
                    border-radius: 0;

                    &[data-selected='true'] {
                        border: 2px solid @border-color-active;
                        transition: @transition;
                    }

                    &[data-selected='false'] {
                        border: 2px solid transparent;
                        transition: @transition;
                    }

                    table {
                        width: 100% !important;

                        td {
                            border-color: #d3d3d3;
                            border-right-width: 1px !important;
                            @apply dark: (border-dark-100);
                        }

                        th {
                            border-color: #d3d3d3;
                            background: #ebebeb;
                            border-right-width: 1px !important;
                            @apply dark: (bg-dark-300 border-dark-100 text-light-900);
                        }
                    }
                }

                .w-e-bar {
                    background: transparent;
                    // border: 1px solid #ECECEC;
                    border: none;
                    // box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.08);
                    border-radius: 0px;
                    padding: 0;
                    height: 40px;
                    width: auto;

                    &.content {
                        left: 50% !important;
                        transform: translateX(-50%);
                    }

                    .w-e-bar-item {
                        .center();
                        height: 100%;
                        position: relative;
                        padding: 0;
                        background: transparent;

                        button {
                            .iconfont();
                            display: flex;
                            width: 100%;
                            height: 100%;
                            padding: 0;
                            margin: 0;
                            position: relative;
                            font-size: 14px;
                            color: @text-color-iconEditor !important;
                            padding: 3px 8px;
                            border-top: 1px solid #ececec;
                            border-bottom: 1px solid #ececec;
                            background: #fff;
                            @apply dark: (bg-dark-300 border-dark-100 !text-light-900/60);

                            &[data-tooltip='删除图片'],
                            &[data-tooltip='Delete image'] {
                                left: 400px !important;
                            }

                            svg {
                                display: none;
                            }

                            &::before {
                                display: flex;
                                background: none;
                                border-radius: 5px;
                                font-size: 25px;
                                opacity: 1;
                                padding: 0;
                                margin: 0;
                                position: relative;
                                width: 100%;
                                height: 100%;
                                text-align: center;
                                top: 0;
                                left: 0;
                                transition: opacity 0.6s;
                                visibility: initial;
                                white-space: pre;
                                z-index: 10;
                                justify-content: center;
                                align-items: center;
                                color: @text-color-iconEditor;
                                font-size: 14px;
                                @apply dark: (text-light-900/80);
                            }

                            &::after {
                                display: flex;
                                opacity: 1;
                                visibility: inherit;
                                position: relative;

                                top: auto;
                                border: 0;
                                font-size: 14px;
                                line-height: 37px;
                                color: @text-color-iconEditor;
                                margin-left: 8px;
                                @apply dark: (text-light-900/80);
                            }

                            &[data-tooltip='表头']::before,
                            &[data-tooltip='Header']::before {
                                content: '\e093';
                            }

                            &[data-tooltip='插入行']::before,
                            &[data-tooltip='Insert row']::before {
                                content: '\e0a0';
                            }

                            &[data-tooltip='删除行']::before,
                            &[data-tooltip='Delete row']::before {
                                content: '\e0a3';
                            }

                            &[data-tooltip='插入列']::before,
                            &[data-tooltip='Insert column']::before {
                                content: '\e09f';
                            }

                            &[data-tooltip='删除列']::before,
                            &[data-tooltip='Delete column']::before {
                                content: '\e09d';
                            }

                            &[data-tooltip='删除表格']::before,
                            &[data-tooltip='Delete table']::before {
                                content: '\e0a4';
                            }

                            &[data-tooltip='表头']::after,
                            &[data-tooltip='Header']::after,
                            &[data-tooltip='插入行']::after,
                            &[data-tooltip='Insert row']::after,
                            &[data-tooltip='删除行']::after,
                            &[data-tooltip='Delete row']::after,
                            &[data-tooltip='插入列']::after,
                            &[data-tooltip='Insert column']::after,
                            &[data-tooltip='删除列']::after,
                            &[data-tooltip='Delete column']::after,
                            &[data-tooltip='删除表格']::after,
                            &[data-tooltip='Delete table']::after {
                                content: attr(data-tooltip);
                            }

                            &[data-tooltip='代码块']::before,
                            &[data-tooltip='Code block']::before {
                                content: '\e009';
                            }

                            &[data-tooltip='代码块'].active,
                            &[data-tooltip='Code block'].active {
                                background: transparent;
                            }

                            &[data-tooltip='删除图片']::before,
                            &[data-tooltip='Delete image']::before {
                                content: '\e02e';
                            }

                            &[data-tooltip='删除图片']::after,
                            &[data-tooltip='Delete image']::after {
                                content: attr(data-tooltip);
                            }

                            &.select-button {
                                font-style: normal;
                                font-weight: 400;
                                font-size: 14px;
                                color: #000000;
                                width: 100% !important;
                                padding: 0 10px !important;
                                margin: 0 !important;
                            }

                            &[data-tooltip='选择语言']::before,
                            &[data-tooltip='Language']::before {
                                display: none;
                            }

                            &[data-tooltip='选择语言']::after,
                            &[data-tooltip='Language']::after {
                                .iconfont();
                            }

                            &[data-tooltip='修改链接']::before,
                            &[data-tooltip='Edit link']::before {
                                content: '\e08d';
                                font-size: 20px;
                            }

                            &[data-tooltip='修改链接']::after,
                            &[data-tooltip='Edit link']::after {
                                content: attr(data-tooltip);
                            }

                            &[data-tooltip='取消链接']::before,
                            &[data-tooltip='Unlink']::before {
                                content: '\e092';
                                font-size: 20px;
                            }

                            &[data-tooltip='取消链接']::after,
                            &[data-tooltip='Unlink']::after {
                                content: attr(data-tooltip);
                            }

                            &[data-tooltip='查看链接']::before,
                            &[data-tooltip='View link']::before {
                                content: '\e091';
                                font-size: 18px;
                            }

                            &[data-tooltip='查看链接']::after,
                            &[data-tooltip='View link']::after {
                                content: attr(data-tooltip);
                            }

                            &[data-tooltip='To card']::before {
                                content: '\e08e';
                                font-size: 20px;
                            }

                            &[data-tooltip='To card']::after {
                                content: attr(data-tooltip);
                            }

                            &[data-tooltip='编辑公式']::before,
                            &[data-tooltip='Edit formula']::before {
                                content: '\e0a8';
                            }

                            &[data-tooltip='编辑公式']::after,
                            &[data-tooltip='Edit formula']::after {
                                content: attr(data-tooltip);
                            }

                            &[data-tooltip='文件上传']::after,
                            &[data-tooltip='Upload file']::after {
                                content: attr(data-tooltip);
                            }

                            &:hover {
                                background-color: #fff;
                                @apply dark: (bg-dark-600);
                            }
                        }

                        &:first-child {
                            button {
                                border-left: 1px solid #ececec;
                                border-top-left-radius: 4px;
                                border-bottom-left-radius: 4px;
                                @apply dark: (border-dark-100);
                            }
                        }

                        &:last-child {
                            button {
                                border-right: 1px solid #ececec;
                                border-top-right-radius: 4px;
                                border-bottom-right-radius: 4px;
                                @apply dark: (border-dark-100);
                            }
                        }

                        &:hover {
                            background: transparent;
                        }

                        &::after {
                            content: '';
                            position: absolute;
                            background: #ddd;
                            height: 14px;
                            width: 1px;
                            right: 0;
                        }

                        &:last-child {
                            &::after {
                                display: none;
                            }
                        }
                    }
                }

                .w-e-textarea-link-card-container {
                    margin: 15px 0;
                    position: relative;
                    .center();
                    transition: @transition;
                    width: 80%;
                    margin: 0 auto;

                    .iframely-embed {
                        // width: 550px;
                        // margin: 0 auto;
                        // border-radius: 10px;
                    }

                    >div {
                        position: relative;
                        width: 100%;

                        >div {
                            width: 100%;
                            height: 100% !important;
                        }

                        &::before {
                            .center();
                            right: 10px;
                            display: none;
                            content: 'to link';
                            width: 80px;
                            height: 30px;
                            background: rgba(0, 0, 0, 0.3);
                            position: absolute;
                            z-index: 1;
                            bottom: 10px;
                            border-radius: 4px;
                            color: #fff;
                            cursor: pointer;
                            transition: @transition;
                            font-size: 14px;
                        }

                        &:hover {
                            &::before {
                                display: flex;
                            }
                        }

                        iframe {
                            margin: 0 auto !important;
                        }
                    }

                    div[data-w-e-type='link-card'] {
                        display: flex;
                        width: 550px;
                        border-radius: 12px;
                        overflow: hidden;
                        margin: 0 auto;
                        min-height: 140px;
                        @apply dark: (border-dark-100);

                        div[data-w-e-type='link-card-loading'] {
                            height: 148px;
                            background: url('@/assets/svg/editor-loading.svg') no-repeat center center;
                            background-size: 60px;
                            font-size: 0;
                            width: 100%;
                        }

                        a {
                            text-decoration: none;
                            background-color: #f6f6f6;
                            @apply dark:(bg-dark-500);

                            span {
                                border-bottom: none;
                            }
                        }

                        span {
                            display: flex;
                            flex: 1;
                            flex-direction: column;
                            padding: 12px 30px;
                            text-decoration: none;

                            p {
                                margin: 0 !important;

                                &:nth-child(1) {
                                    font-style: normal;
                                    font-weight: 700;
                                    font-size: 18px;
                                    line-height: 1.4;
                                    color: @text-color;
                                    @apply dark:(text-light-900);
                                }

                                &:nth-child(2) {
                                    font-style: normal;
                                    font-weight: 400;
                                    font-size: 14px;
                                    line-height: 1.4;
                                    color: @text-color;
                                    padding: 0;
                                    @apply dark:(text-light-900/60);
                                }

                                &:nth-child(3) {
                                    font-style: normal;
                                    font-weight: 400;
                                    font-size: 14px;
                                    line-height: 1.4;
                                    color: @text-color-grey;
                                    padding-top: 0;
                                    @apply dark:(text-light-900/50);

                                    i {
                                        font-family: 'iconfont' !important;
                                        font-size: 12px;
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

                    .center {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }
                }

                .w-e-textarea-mention-container {
                    @apply px-1 font-bold-500 text-blue-500 underline-offset-4 break-normal transition duration-300 hover:(underline underline-blue-500 transition duration-300 cursor-pointer);
                }

                .w-e-textarea-upload-file-container {
                    @apply mx-auto;

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
                                @apply p-0 m-0;
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
                }

                .w-e-textarea-video-container {

                    // width: 100%;
                    iframe {
                        margin: 0 auto !important;
                        overflow: hidden;
                        border-radius: 8px;
                    }
                }

                .w-e-textarea-plugin-container {
                    @apply w-130;
                    background: linear-gradient(rgba(52, 211, 153, 1), rgba(125, 239, 132, 1));
                    border-radius: 16px;
                    margin: 0 auto;
                    position: relative;
                    cursor: pointer;
                    overflow: hidden;
                    border: 2px solid rgba(52, 211, 153, 1);

                    div[data-w-e-type='plugin'] {
                        background: rgba(255, 255, 255, 0.92);
                        backdrop-filter: blur(12.5px);
                        width: 100%;
                        border-radius: 16px;
                        flex-direction: column;
                        padding: 26px 30px 15px 30px;
                        .center();
                        @apply dark:(bg-dark-300);

                        div[data-class='loading'] {
                            height: 100px;

                            &::after {
                                content: '';
                                background: url('@/assets/svg/loading3.svg') no-repeat center center;
                                background-size: 60px auto;
                                display: flex;
                                height: 100px;
                                width: 100%;
                            }
                        }

                        div[data-class='frozen'] {
                            height: 100px;
                            .center();
                            flex-direction: column;

                            &::before {
                                .iconfont();
                                content: '\e055';
                                color: #ff8585;
                                font-size: 40px;
                                height: 40px;
                                line-height: 40px;
                                display: flex;
                                text-align: center;
                                margin-top: -6px;
                            }

                            &::after {
                                content: 'The light has been taken down!';
                                margin-top: 5px;
                                font-weight: 600;
                                font-size: 16px;
                                text-align: center;
                            }
                        }

                        div[data-class='header'] {
                            display: flex;
                            justify-content: space-between;

                            img {
                                width: 64px;
                                height: 64px;
                                border-radius: 12px;
                            }

                            p {
                                font-style: normal;
                                font-size: 14px;
                                line-height: 140%;
                                color: #000000;
                                padding: 0;
                                @apply dark:(text-light-900/80);

                                i {
                                    .iconfont();

                                    &:after {
                                        content: '\e16d';
                                        color: #34d399;
                                        font-size: 16px;
                                        margin-right: 8px;
                                    }
                                }
                            }
                        }

                        div[data-class='info'] {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            margin-top: 13px;

                            p {
                                font-style: normal;
                                font-weight: 500;
                                font-size: 20px;
                                color: #000000;
                                padding: 0;
                                font-weight: 500;
                                @apply dark:(text-light-900);
                            }

                            strong {
                                font-weight: 400;
                                font-size: 14px;
                                line-height: 140%;
                                color: #000000;
                                @apply dark:(text-light-900/60);

                                i {
                                    .iconfont();

                                    &:after {
                                        content: '\e03d';
                                        color: #000;
                                        font-size: 14px;
                                        margin-right: 8px;
                                        @apply dark:(text-light-900/60);
                                    }
                                }
                            }
                        }

                        div[data-class='desc'] {
                            margin-top: 10px;
                            font-style: normal;
                            font-weight: 400;
                            font-size: 14px;
                            line-height: 20px;
                            color: #666666;
                            .ellipsisMore(3);
                            @apply dark:(text-light-900/50);
                        }

                        &::after {
                            content: '';
                            display: flex;
                            width: 100%;
                            height: 100%;
                            background: rgba(255, 255, 255, 0.4);
                            backdrop-filter: blur(2px);
                            position: absolute;
                            left: 0;
                            top: 0;
                            cursor: pointer;
                            opacity: 0;
                            transition: @transition;
                            @apply dark:(bg-dark-100/60);
                        }

                        &::before {
                            .iconfont();
                            .center();
                            content: '\e125  Preview to run it';
                            position: absolute;
                            opacity: 0;
                            transition: @transition;
                            background: linear-gradient(90deg, #34d399 2.69%, #7cee83 96.86%);
                            border-radius: 28px;
                            width: 185px;
                            height: 40px;
                            z-index: 2;
                            font-style: normal;
                            font-weight: 400;
                            font-size: 16px;
                            color: #000000;
                        }
                    }

                    div[data-class='hover'] {
                        &:hover {
                            &::after {
                                opacity: 1;
                                transition: @transition;
                            }

                            &::before {
                                opacity: 1;
                                transition: @transition;
                            }
                        }
                    }
                }

                .center {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }

                .w-e-text-placeholder {
                    font-size: 18px;
                    line-height: 22px;
                    font-weight: 400;
                    color: #999999;
                    font-style: normal;
                }

                .w-e-image-container {
                    .center();
                    outline: none;
                    pointer-events: none;
                    width: auto !important;
                    height: auto !important;
                    max-width: 100% !important;
                    max-height: 100% !important;
                    cursor: pointer;
                    margin: 0 auto;

                    img {
                        outline: none;
                        border: 1px dotted transparent;
                        padding: 10px;
                        border-radius: 10px;
                        transition: @transition;
                        width: auto !important;
                        height: auto !important;
                        max-width: 100% !important;
                        max-height: 100% !important;
                    }

                    .w-e-image-dragger {
                        display: none;

                        &.left-top {
                            position: absolute;
                            bottom: 20px;
                            top: auto;
                            left: auto;
                            margin-left: -35px;
                            z-index: 1;
                            pointer-events: auto;
                            font-size: 14px;
                            cursor: pointer;
                            background-color: @bg-color-body-active;
                            backdrop-filter: blur(27.1828px);
                            color: #fff;
                            width: 28px;
                            height: 28px;
                            .center();
                            .border-radius(6);

                            &:after {
                                content: '\e04f';
                            }
                        }
                    }

                    &.w-e-selected-image-container {
                        position: relative;
                        .iconfont();

                        img {
                            border-radius: 10px;
                            border: 1px dotted @border-color-active;
                            padding: 10px;
                            transition: @transition;
                        }

                        &:after {
                            position: absolute;
                            margin-left: 35px;
                            bottom: 20px;
                            content: '\e0c0';
                            z-index: 1;
                            pointer-events: auto;
                            font-size: 18px;
                            cursor: pointer;
                            background-color: @bg-color-body-active;
                            backdrop-filter: blur(27.1828px);
                            color: #fff;
                            width: 28px;
                            height: 28px;
                            .center();
                            .border-radius(6);
                        }
                    }
                }

                .w-e-textarea-video-container {
                    background-image: none;
                    border: 0;

                    video {
                        width: 80%;
                    }
                }

                .token.selector {}

                .w-e-hover-bar {
                    .w-e-bar-item {
                        // background-color: #fff;
                    }

                    .w-e-select-list {
                        left: -5px !important;
                        @apply dark: (bg-dark-300 border-dark-100 text-light-900/60);

                        ul {
                            li {

                                &:hover,
                                &.selected {
                                    @apply dark: (bg-dark-700);
                                }
                            }
                        }
                    }
                }

                a {
                    span {
                        @apply text-blue-500 border-b border-blue-500;
                        // border-bottom: 1px solid @text-color;
                        // color: @text-color;
                        transition: @transition;
                        // @apply dark: (text-light-900/80);

                        &:hover {
                            @apply border-b border-blue-400;
                            transition: @transition;
                        }
                    }
                }

                div[data-slate-node='element'] {
                    @apply !my-3 flex;

                    span[data-w-e-reserve='true'] {
                        @apply text-true-gray-400 dark:(text-true-gray-500);
                    }
                }
            }
        }

        .settingsBox {
            width: 100%;
            padding-bottom: 50px;
            transition: @transition;
        }

        .directory {
            width: 210px;
            margin: 0 0 0 56rem;
            z-index: 1;
            position: absolute;
            top: 320px;

            &.fixed {
                position: fixed;
                top: 80px;
            }
        }
    }

    .editorToolsBox {
        width: 100%;
        height: 60px;
        background: @bg-color;
        box-shadow: 0px -2px 4px rgba(0, 0, 0, 0.05);
        z-index: 1998;
        position: fixed;
        bottom: 0;
        left: 0;
        @apply dark: (bg-dark-600);

        .editorTools {
            display: flex;
            width: 900px;
            height: 60px;
            margin: 0 auto;
            align-items: center;

            .autosaved {
                display: flex;
                align-items: center;
                margin-right: 55px;
                opacity: 1;
                transition: @transition;

                &.show {
                    opacity: 0;
                    transition: @transition;
                }

                :deep(.el-progress) {
                    width: 25px;
                    height: 25px;
                    display: flex;
                    justify-content: center;
                    align-items: center;

                    .el-progress-circle__track {
                        stroke: rgba(128, 110, 242, 0.4);
                    }
                }

                .icon-chose {
                    font-size: 20px;
                    color: @text-active;
                    width: 25px;
                    height: 25px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }

                .icon-attention {
                    color: #999999;
                }

                p {
                    font-style: normal;
                    font-weight: 400;
                    font-size: 14px;
                    line-height: 22px;
                    color: #999999;
                    margin-left: 8px;
                    // opacity: 0;
                    transition: @transition;

                    &.show {
                        opacity: 1;
                        transition: @transition;
                    }
                }
            }

            .settings {
                display: flex;
                height: 100%;
                align-items: center;
                cursor: pointer;

                p {
                    font-weight: 400;
                    font-size: 14px;
                    line-height: 19px;
                    color: @text-color;
                    @apply dark: (text-light-900/80);
                }

                i {
                    transition: @transition;
                    font-size: 10px;
                    margin-left: 8px;
                }

                &.open {
                    i {
                        transform: rotate(180deg);
                        font-size: 10px;
                    }
                }
            }

            .draft {
                .center();
                .padding(0, 15, 0, 15);
                height: 40px;
                color: @text-fcolor;
                border-radius: 10px;
                font-style: normal;
                font-weight: 400;
                .font-size(14);
                transition: @transition;
                background-color: @bg-color-grey;
                .margin(0, 15, 0, 0);
                @apply dark: (bg-dark-300 text-light-900/60);

                &:hover {
                    cursor: pointer;
                    color: @text-color;
                    background-color: @bg-color-hover;
                    transition: @transition;
                    @apply dark: (bg-dark-100 text-light-900/80);
                }
            }

            .right {
                margin-left: auto;
                display: flex;
                height: 100%;
                justify-content: center;
                align-items: center;
            }

            .permissions {
                display: flex;
                // height: 100%;
                cursor: pointer;
                justify-content: center;
                align-items: center;

                :deep(.el-dropdown) {
                    height: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding-right: 38px;

                    .el-tooltip__trigger {
                        &:focus {
                            outline: 0;
                        }
                    }

                    .icon-radio {
                        padding-right: 6px;
                        color: @bg-color-body-active;
                    }

                    div {
                        // height: 100%;
                        display: flex;
                        justify-content: center;
                        align-items: center;

                        &:focus {
                            outline: 0;
                        }
                    }

                    .el-dropdown-link {
                        display: flex;
                        @apply dark: (text-light-900/80);

                        .icon-arrow-up {
                            transition: @transition;
                            font-size: 10px;
                            margin-left: 8px;
                        }
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

            .publish {
                display: flex;
                justify-content: center;
                align-items: center;
                width: 120px;
                height: 40px;
                background: @bg-color-body-active;
                border-radius: 10px;
                font-style: normal;
                font-weight: 400;
                font-size: 16px;
                color: #ffffff;
                transition: @transition;

                &.loading {
                    transition: @transition;
                    background: @bg-color-body-loading;

                    img {
                        .margin(0, 5, 0, 0);
                    }
                }

                &:hover {
                    cursor: pointer;
                    opacity: 0.85;
                    transition: @transition;
                }
            }
        }
    }
}

@keyframes spinner {
    to {
        transform: rotate(360deg);
    }
}
</style>
