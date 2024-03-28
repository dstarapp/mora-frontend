<template>
    <el-dialog class="bodyPT0" style="width: 980px" v-model="dialogVisible" :title="$t('editor.plugin.dialogTitle')"
        :before-close="handleClose" @closed="afterClose">
        <div class="pluginBox">
            <div class="screen">
                <div class="left">
                    <el-select v-model="category" :placeholder="$t('plugin.home.categoryPlaceholder')" size="large"
                        @change="categoryChange">
                        <el-option key="All" label="All" value="All" />
                        <el-option v-for="item in categoryList" :key="item.label" :label="item.label"
                            :value="item.label" />
                    </el-select>
                </div>
                <div class="right">
                    <el-input v-model="keyword" :placeholder="$t('editor.plugin.searchPlaceholder')"
                        @keydown.enter="getList" />
                    <div class="btn" @click="getList">
                        {{ $t('editor.plugin.search') }}
                    </div>
                </div>
            </div>

            <el-skeleton animated class="list" v-if="isLoading">
                <template #template>
                    <div class="item" v-for="i in 6">
                        <div class="header">
                            <el-skeleton-item variant="image" class="w-11 h-11 rounded-xl" />
                            <span>
                                <p><el-skeleton-item variant="h3" class="w-40" /></p>
                                <strong><el-skeleton-item variant="text" class="w-20" /></strong>
                            </span>
                        </div>
                        <div class="desc flex flex-col">
                            <el-skeleton-item variant="text" class="w-full h-4" />
                            <el-skeleton-item variant="text" class="w-full h-4 my-1" />
                        </div>
                        <div class="flex items-center justify-between">
                            <el-skeleton-item variant="text" class="w-15 h-4" />
                            <el-skeleton-item variant="button" class="w-22 h-6" />
                        </div>
                    </div>
                </template>
            </el-skeleton>

            <div class="noData" v-else-if="pageData.data.length < 1">
                <i class="iconfont icon-no"></i>
                <span> {{ $t('plugin.home.noData') }} </span>
            </div>

            <template v-else>
                <div class="list">
                    <div v-for="item in pageData.data" class="item">
                        <div class="header">
                            <img :src="getImagesUrl(item.done_info.thumbnail)" alt="" />
                            <span>
                                <p>{{ item.done_info.name }}</p>
                                <strong>{{ item.id }}</strong>
                            </span>
                        </div>
                        <div class="desc">
                            {{ item.done_info.instruction }}
                        </div>
                        <div class="bottom">
                            <div class="author" v-if="item.user">
                                <i class="iconfont icon-user"></i>
                                {{
        typeof item.user === 'string'
            ? item.user
            : dealPid(item.user.toString())
    }}
                            </div>
                            <div class="btn" :class="{ disabled: addLoading === item.id }" @click="onUse(item)">
                                <img v-if="addLoading === item.id" src="@/assets/svg/loading.svg" alt="" />
                                {{ $t('editor.plugin.use') }}
                            </div>
                        </div>
                    </div>
                </div>
                <Pagination :total="pageData.all" :currentPage="pageData.page" :pageSize="pageData.size" @next="next"
                    @prev="prev" @goPage="goPage" />
            </template>
        </div>

        <el-dialog v-model="isPropDialog" title="Variable" width="30%" :before-close="handleClose2">
            <div class="variableBox">
                <div class="item" v-for="(source, i) in propSources" :key="source.prop.name">
                    <div class="label">
                        {{ propSources.length > 1 ? `${i + 1}. ` : '' }}
                        {{ `${source.prop.label ? source.prop.label : source.prop.name}` }}
                    </div>
                    <div class="input">
                        <ConstantInputVue :initial="{
        type: source.prop.result,
        value: getInitialCandidTypeValue(source.prop.result, [], []),
    }" :disabled="false" @changed="(r: DataResult<CandidValue>) => (onValueChanged(i, r))" />
                    </div>
                </div>
                <div class="mora-button">
                    <div class="confirm" :class="{ disabled: !checked }" @click="addVariable">
                        {{ 'Add' }}
                    </div>
                </div>
            </div>
        </el-dialog>
    </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, shallowRef, reactive, onMounted, computed } from 'vue';
import Pagination from '@/components/Pagination.vue';
import { PageData } from '@/components/light-experience/canisters/common';
import { DoneLightExperienceManager } from '@/components/light-experience/canisters/experience_manager/experience_manager.did.d';
import { experiencesQueryExperiencesByConditions } from '@/components/light-experience/canisters/experience_manager/apis';
import { queryExecutingExperience } from '@/components/light-experience/canisters/core_worker/apis';
import { LightExecutingQueryResult } from '@/components/light-experience/canisters/core_worker/core_worker.did.d';
import { getImagesUrl, dealPid } from '@/utils/functions';
import store from '@/store';
import { getIcnaming } from '@/utils/icnaming';
import debug from '@/utils/debug';
import { findPropDataSources } from '@mora-light/core/types';
import { DataSourceProp } from '@mora-light/core/types/source';
import { CandidValue, getInitialCandidTypeValue } from '@mora-light/core/types/candid';
import { DataResult, deepClone } from '@mora-light/core/types/common';
import { ConstantInput as ConstantInputVue } from '@mora-light/vue';

export default defineComponent({
    name: 'MetaBox',
    emits: ['componentClose'],
    props: {
        insertCallback: { type: Function },
    },
    components: { Pagination, ConstantInputVue },
    setup(props, context) {
        const dialogVisible = ref(true);
        const MetaListDom = shallowRef();
        const keyword = ref();
        const categoryList = ref<{ label: string }[]>([{ label: 'Tools' }, { label: 'Other' }]);
        const category = ref<string>('All');

        const isPropDialog = ref(false);
        const propDialogClose = () => (isPropDialog.value = false);
        const propSources = ref<DataSourceProp[]>([]);
        const propValues = ref<DataResult<CandidValue>[]>([]);
        const onValueChanged = (i: number, value: DataResult<CandidValue>) => {
            propValues.value[i] = value;
        };
        const checked = computed(() => {
            for (let i = 0; i < propSources.value.length; i++) {
                if (!propValues.value[i] || propValues.value[i].err) return false;
            }
            return true;
        });
        const propValue = computed(() => {
            const value: Record<string, CandidValue> = {};
            for (let i = 0; i < propSources.value.length; i++) {
                if (propValues.value[i]) {
                    const ok = propValues.value[i].ok;
                    if (ok) value[propSources.value[i].prop.name] = deepClone(ok);
                }
            }
            console.error('value', value);
            return value;
        });

        const isLoading = ref(true);
        const addLoading = ref();
        const pageData = reactive<PageData<DoneLightExperienceManager>>({
            page: 1,
            size: 6,
            data: [],
            all: 0,
        });

        const prev = () => {
            pageData.page = pageData.page - 1;
            getList();
        };

        const next = () => {
            pageData.page = pageData.page + 1;
            getList();
        };

        const goPage = (num) => {
            pageData.page = parseInt(num);
            getList();
        };

        const handleClose = () => {
            dialogVisible.value = false;
        };

        const handleClose2 = () => {
            isPropDialog.value = false;
            addLoading.value = '';
        };

        const afterClose = () => {
            context.emit('componentClose');
        };

        const categoryChange = () => {
            getList();
        };

        const getList = () => {
            isLoading.value = true;
            experiencesQueryExperiencesByConditions(
                keyword.value ? [keyword.value] : [],
                category.value === 'All' ? [] : [[category.value]],
                [],
                [],
                {
                    page: pageData.page,
                    size: pageData.size,
                },
            )
                .then((res: PageData<DoneLightExperienceManager>) => {
                    pageData.page = res.page;
                    pageData.size = res.size;
                    pageData.data = res.data;
                    pageData.all = res.all;
                    pageData.data.map(async (item) => {
                        let res: any = await getIcnaming(item.user.toString());
                        if (res) {
                            item.user = res;
                        }
                    });
                })
                .catch((err) => {
                    debug('failed', err);
                    console.error(err);
                })
                .finally(() => {
                    isLoading.value = false;
                });
        };

        let useData: any = {};
        const onUse = async (item) => {
            if (addLoading.value) {
                return;
            }
            let editor = store.state.editor_ref;
            if (editor) {
                addLoading.value = item.id;
                let icnaming =
                    typeof item.user === 'string'
                        ? item.user
                        : await getIcnaming(item.user.toString());

                queryExecutingExperience(
                    item.status.Done.canister_id.toString(),
                    item.status.Done.hash,
                )
                    .then(async (res: LightExecutingQueryResult) => {
                        if (res['none'] === null) {
                            addLoading.value = '';
                        } else if (res['frozen'] === null) {
                            addLoading.value = '';
                        } else if (res['value']) {
                            let core = JSON.parse(res['value'].core_json);
                            propSources.value = findPropDataSources(core.data);
                            propValues.value = [];
                            if (propSources.value.length) {
                                isPropDialog.value = true;
                                useData = item;
                                useData.icnaming = icnaming;
                            } else {
                                await editor.restoreSelection();
                                await editor.focus();
                                const pluginElem = {
                                    type: 'plugin',
                                    value: {
                                        id: item.id,
                                        thumbnail: item.done_info.thumbnail,
                                        name: item.done_info.name,
                                        desc: item.done_info.instruction,
                                        user: item.user.toString(),
                                        userDeal: icnaming
                                            ? icnaming
                                            : dealPid(item.user.toString()),
                                        hash: item.status.Done.hash,
                                        canister: item.status.Done.canister_id.toString(),
                                        propValue: '',
                                    },
                                    children: [{ text: '' }],
                                };
                                handleClose();
                                editor.insertNode(pluginElem);
                            }
                        }
                    })
                    .finally(() => {
                        isLoading.value = false;
                    });
            } else {
                debug('insert failed', 'no Editor');
                handleClose();
            }
        };

        const addVariable = async () => {
            if (!checked) {
                return;
            }
            let editor = store.state.editor_ref;
            await editor.restoreSelection();
            await editor.focus();
            const pluginElem = {
                type: 'plugin',
                value: {
                    id: useData.id,
                    thumbnail: useData.done_info.thumbnail,
                    name: useData.done_info.name,
                    desc: useData.done_info.instruction,
                    user: useData.user.toString(),
                    userDeal: useData.icnaming
                        ? useData.icnaming
                        : dealPid(useData.user.toString()),
                    hash: useData.status.Done.hash,
                    canister: useData.status.Done.canister_id.toString(),
                    propValue: JSON.stringify(propValue.value),
                },
                children: [{ text: '' }],
            };
            handleClose();
            editor.insertNode(pluginElem);
        };

        onMounted(() => {
            getList();
        });

        return {
            dialogVisible,
            MetaListDom,
            keyword,
            categoryList,
            category,
            pageData,
            isLoading,
            addLoading,
            propSources,
            checked,
            isPropDialog,
            propValues,
            propValue,
            handleClose2,
            propDialogClose,
            getList,
            dealPid,
            getImagesUrl,
            prev,
            next,
            goPage,
            handleClose,
            afterClose,
            categoryChange,
            onUse,
            addVariable,
            getInitialCandidTypeValue,
            onValueChanged,
        };
    },
});
</script>

<style scoped lang="less">
.pluginBox {
    display: flex;
    flex-direction: column;
    margin-top: 24px;

    .screen {
        display: flex;

        .left {
            display: flex;
            flex: 1;
            margin-right: 25px;

            :deep(.el-select) {
                width: 100%;

                .el-input {
                    .el-input__wrapper {
                        border: 1px solid #e8e8e8;
                        border-radius: 10px;
                        @apply dark:(border-dark-100);

                        .el-input__inner {
                            height: 44px;
                            font-weight: 400;
                            font-size: 16px;
                            line-height: 44px;
                            color: #333;
                            @apply dark:(text-light-900);
                        }
                    }
                }
            }
        }

        .right {
            width: 580px;
            display: flex;

            :deep(.el-input) {
                margin-right: 15px;

                .el-input__wrapper {
                    background: #ececec !important;
                    border-radius: 10px;
                    @apply dark:( !bg-dark-300);

                    .el-input__inner {
                        height: 44px;
                        font-weight: 400;
                        font-size: 16px;
                        line-height: 44px;
                        color: #999999;
                        @apply dark:(text-light-900);
                    }
                }
            }

            .btn {
                background: #806ef2;
                border-radius: 10px;
                font-style: normal;
                font-weight: 400;
                font-size: 16px;
                .center();
                color: #ffffff;
                width: 140px;
                height: 44px;
                cursor: pointer;
            }
        }
    }

    .noData {
        @apply w-full py-20 flex items-center justify-center flex-col;

        i {
            @apply text-7xl text-gray-300 dark:(text-light-900/30);
        }

        span {
            @apply py-3 text-gray-400 dark:(text-light-900/50);
        }
    }

    .list {
        display: grid;
        width: 100%;
        grid-template-columns: repeat(3, 1fr);
        align-items: start;
        grid-gap: 25px;
        grid-auto-rows: minmax(0, max-content);
        margin-top: 28px;
        margin-bottom: 29px;
        height: 350px;

        .item {
            border: 1px solid #e8e8e8;
            border-radius: 12px;
            display: flex;
            flex-direction: column;
            padding: 16px;
            @apply dark:(border-dark-100);

            .header {
                width: 100%;
                height: 44px;
                display: flex;

                img {
                    width: 44px;
                    height: 44px;
                    border-radius: 10px;
                    border: 2px solid #ffffff;
                    @apply dark:(border-dark-100);
                }

                span {
                    display: flex;
                    flex-direction: column;
                    height: 44px;
                    margin-left: 16px;
                    flex: 1;

                    p {
                        text-align: left;
                        font-weight: 500;
                        font-size: 18px;
                        color: #000000;
                        .ellipsisMore(1);
                        @apply dark:(text-light-900);
                    }

                    strong {
                        font-style: normal;
                        font-weight: 400;
                        font-size: 12px;
                        line-height: 140%;
                        color: #999999;
                        margin-top: 3px;
                        text-align: left;
                    }
                }
            }

            .desc {
                font-style: normal;
                font-weight: 400;
                font-size: 12px;
                line-height: 17px;
                color: #666666;
                display: flex;
                text-align: left;
                margin-top: 15px;
                margin-bottom: 15px;
                height: 34px;
                .ellipsisMore(2);
            }

            .bottom {
                display: flex;
                align-items: center;
                justify-content: space-between;

                .author {
                    display: flex;
                    flex: 1;
                    font-style: normal;
                    font-weight: 400;
                    font-size: 12px;
                    color: #666666;

                    .icon-user {
                        font-size: 14px;
                        margin-right: 8px;
                    }
                }

                .btn {
                    .center();
                    width: 90px;
                    height: 32px;
                    background: linear-gradient(90deg, #34d399 2.69%, #7cee83 96.86%);
                    border-radius: 8px;
                    font-style: normal;
                    font-weight: 400;
                    font-size: 14px;
                    color: #000000;
                    cursor: pointer;

                    img {
                        width: 14px;
                        height: 14px;
                        margin-right: 5px;
                    }

                    &.disabled {
                        opacity: 0.5;
                        cursor: not-allowed;
                    }
                }
            }
        }
    }
}

.variableBox {
    display: flex;
    flex-direction: column;
    height: 100%;
    margin-top: 15px;

    .item {
        display: flex;
        width: 100%;
        position: relative;
        margin-bottom: 30px;
        height: 44px;
        padding: 0px 35px 0px 35px;

        .label {
            display: flex;
            font-weight: 400;
            font-size: 16px;
            align-items: center;
            justify-content: center;
            width: 140px;
            flex-shrink: 0;
            text-align: left;
            height: 44px;
            align-items: center;
            justify-content: flex-start;
        }

        .input {
            display: flex;
            flex: 1;
        }

        .tip {
            display: flex;
            position: absolute;
            bottom: -22px;
            right: 35px;
            font-size: 12px;
            color: @color-error;
        }
    }

    .mora-button {
        margin-top: 10px;

        .confirm {
            background: linear-gradient(90deg, #34d399 2.69%, #7cee83 96.86%);
        }
    }
}
</style>
