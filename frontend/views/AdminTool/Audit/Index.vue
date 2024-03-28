<template>
    <div class="auditBox" translate="yes">
        <div class="permission">
            <p>Administrator: {{ isAdministrator }}</p>
            <p>auditor: {{ isAuditor }}</p>
            <strong @click="init" v-if="store.state.current_login_way === 'plug'">
                authorization
            </strong>
        </div>

        <div class="auditContent">
            <div class="article" v-if="isAuditor || isAdministrator" v-loading="articleLoading">
                <h3>Actions for articles</h3>
                <el-input v-model="aid" placeholder="aid" />
                <el-select
                    v-model="aidReason"
                    multiple
                    filterable
                    allow-create
                    default-first-option
                    :reserve-keyword="false"
                    placeholder="reason"
                >
                    <el-option v-for="item in options" :key="item" :label="item" :value="item" />
                </el-select>
                <span>
                    <el-button @click="articleBan" type="danger">ban</el-button>
                    <el-button @click="articlePullout" type="primary">pullout</el-button>
                </span>
            </div>

            <div class="planet" v-if="isAdministrator" v-loading="planetLoading">
                <h3>Actions for planet</h3>
                <el-input v-model="pid" placeholder="pid" />
                <el-select
                    v-model="pidReason"
                    multiple
                    filterable
                    allow-create
                    default-first-option
                    :reserve-keyword="false"
                    placeholder="reason"
                >
                    <el-option v-for="item in options" :key="item" :label="item" :value="item" />
                </el-select>
                <span>
                    <el-button @click="planetBan" type="danger">ban</el-button>
                    <el-button @click="planetPullout" type="primary">pullout</el-button>
                </span>
            </div>

            <div class="search" v-if="isAdministrator" v-loading="searchLoading">
                <h3>Actions for search</h3>
                <el-input v-model="sid" placeholder="sid" />
                <el-select
                    v-model="sidReason"
                    multiple
                    filterable
                    allow-create
                    default-first-option
                    :reserve-keyword="false"
                    placeholder="reason"
                >
                    <el-option v-for="item in options" :key="item" :label="item" :value="item" />
                </el-select>
                <span>
                    <el-button @click="searchBan" type="danger">ban</el-button>
                    <el-button @click="searchPullout" type="primary">pullout</el-button>
                </span>
            </div>
        </div>

        <div class="list">
            <el-tabs v-model="activeName" type="card" class="demo-tabs">
                <el-tab-pane label="articleBlackList" name="articleBlackList">
                    <el-table
                        class="table"
                        :data="articleBlackList"
                        style="width: 100%"
                        height="1000"
                    >
                        <el-table-column label="planet">
                            <template #default="{ row }">
                                <p @click="jumpPlanet(row.planet)">{{ row.planet }}</p>
                            </template>
                        </el-table-column>
                        <el-table-column label="article">
                            <template #default="{ row }">
                                <p @click="jumpArticle(row.planet, row.article)">{{
                                    row.article
                                }}</p>
                            </template>
                        </el-table-column>
                        <!-- <el-table-column prop="article" label="article" /> -->
                        <el-table-column prop="auditor" label="auditor" />
                        <el-table-column prop="reason" label="reason" />
                        <el-table-column prop="updated" label="updated" />
                    </el-table>
                </el-tab-pane>
                <el-tab-pane label="planetBlackList" name="planetBlackList">
                    <el-table
                        class="table"
                        :data="planetBlackList"
                        style="width: 100%"
                        height="1000"
                    >
                        <el-table-column label="planet">
                            <template #default="{ row }">
                                <p @click="jumpPlanet(row.planet)">{{ row.planet }}</p>
                            </template>
                        </el-table-column>
                        <el-table-column prop="auditor" label="auditor" />
                        <el-table-column prop="reason" label="reason" />
                        <el-table-column prop="updated" label="updated" />
                    </el-table>
                </el-tab-pane>
                <el-tab-pane label="searchBlackList" name="searchBlackList">
                    <el-table
                        class="table"
                        :data="searchBlackList"
                        style="width: 100%"
                        height="1000"
                    >
                        <el-table-column label="planet">
                            <template #default="{ row }">
                                <p @click="jumpPlanet(row.planet)">{{ row.planet }}</p>
                            </template>
                        </el-table-column>
                        <el-table-column prop="auditor" label="auditor" />
                        <el-table-column prop="reason" label="reason" />
                        <el-table-column prop="updated" label="updated" />
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import store from '@/store';
import { createActor } from '@/request/agent';
import { ElMessage } from 'element-plus';
import { t } from '@/i18n';
import CONFIG from '@/assets/config';
import { Principal } from '@dfinity/principal';
import { idlFactory as auditFactory } from '@/request/canister/audit.did';
import { isPrincipalString } from '@/utils/functions';
import moment from 'moment';
import _ from 'lodash';
import { getCanister } from '@/request/axios/bv';

export default defineComponent({
    components: {},
    props: {},
    setup() {
        const auditCanister: any = ref();
        const isAdministrator = ref(false);
        const isAuditor = ref(false);
        const aid = ref();
        const aidReason = ref();
        const articleLoading = ref(false);
        const pid = ref();
        const pidReason = ref();
        const planetLoading = ref(false);
        const sid = ref();
        const sidReason = ref();
        const searchLoading = ref(false);
        const articleBlackList = ref([]);
        const planetBlackList = ref([]);
        const searchBlackList = ref([]);
        const activeName = ref('articleBlackList');
        const options = ref([
            'Low-Quality, Meaningless Content',
            'Pornographic Content',
            'Violent Content',
            'Hate Speech',
            'Advertising Harassment',
            'Illegal and Criminal Content',
            'Violation of Local Policies and Laws',
            'False Information',
            'Plagiarized Content',
            'Disclosure of Privacy',
        ]);

        const validateArticleId = (str) => {
            const pattern = /^[A-Z0-9]{20,30}$/;
            return pattern.test(str);
        };

        const getPermission = async () => {
            const pid = store.state?.user_data?.pid;
            if (!pid) {
                return;
            }
            isAdministrator.value = await auditCanister.value.permission_is_administrator(
                Principal.fromText(pid),
            );

            isAuditor.value = await auditCanister.value.permission_is_auditor(
                Principal.fromText(pid),
            );
        };

        const articleBan = async () => {
            if (!aidReason.value || !aid.value || !validateArticleId(aid.value)) {
                return;
            }
            articleLoading.value = true;
            try {
                const res = await auditCanister.value.updateOrInsertBannedRecommendedArticle(
                    aid.value.trim(),
                    aidReason.value.toString().trim(),
                );
                articleLoading.value = false;
                if (res) {
                    ElMessage.success(`Article recommendation mask`);
                    getArticleList();
                }
            } catch (err) {
                console.log(err);
                articleLoading.value = false;
            }
        };

        const articlePullout = async () => {
            if (!aid.value || !validateArticleId(aid.value)) {
                return;
            }
            articleLoading.value = true;
            try {
                const res = await auditCanister.value.deleteBannedRecommendedArticle(
                    aid.value.trim(),
                );
                articleLoading.value = false;
                if (res) {
                    ElMessage.success(`Article pull out mask`);
                    getArticleList();
                }
            } catch (err) {
                console.log(err);
                articleLoading.value = false;
            }
        };

        const planetBan = async () => {
            if (!pidReason.value || !pid.value || !isPrincipalString(pid.value)) {
                return;
            }
            planetLoading.value = true;
            try {
                const res = await auditCanister.value.updateOrInsertBannedRecommendedAllArticles(
                    Principal.fromText(pid.value),
                    pidReason.value.toString().trim(),
                );
                planetLoading.value = false;
                if (res) {
                    ElMessage.success(`Planet recommendation mask`);
                    getPlanetList();
                }
            } catch (err) {
                console.log(err);
                planetLoading.value = false;
            }
        };

        const planetPullout = async () => {
            if (!pid.value || !isPrincipalString(pid.value)) {
                return;
            }
            planetLoading.value = true;
            try {
                const res = await auditCanister.value.deleteBannedRecommendedAllArticles(
                    Principal.fromText(pid.value),
                );
                planetLoading.value = false;
                if (res) {
                    ElMessage.success(`Planet pull out mask`);
                    getPlanetList();
                }
            } catch (err) {
                console.log(err);
                planetLoading.value = false;
            }
        };

        const searchBan = async () => {
            if (!sidReason.value || !sid.value || !isPrincipalString(sid.value)) {
                return;
            }
            searchLoading.value = true;
            try {
                const res = await auditCanister.value.updateOrInsertBannedSearchedAllArticles(
                    Principal.fromText(sid.value),
                    sidReason.value.toString().trim(),
                );
                searchLoading.value = false;
                if (res) {
                    ElMessage.success(`Planet recommendation mask`);
                    getSearchList();
                }
            } catch (err) {
                console.log(err);
                searchLoading.value = false;
            }
        };

        const searchPullout = async () => {
            if (!sid.value || !isPrincipalString(sid.value)) {
                return;
            }
            searchLoading.value = true;
            try {
                const res = await auditCanister.value.deleteBannedSearchedAllArticles(
                    Principal.fromText(sid.value),
                );
                searchLoading.value = false;
                if (res) {
                    ElMessage.success(`Planet pull out mask`);
                    getSearchList();
                }
            } catch (err) {
                console.log(err);
                searchLoading.value = false;
            }
        };

        const getArticleList = async () => {
            const res = await auditCanister.value.findBannedRecommendedArticlesByPage({
                page: 1,
                size: 9999,
            });
            if (!res.data.length) {
                articleBlackList.value = [];
            } else {
                const arr = res.data.map((item) => {
                    item.auditor = item.auditor.toString();
                    item.updated = moment(Math.floor(Number(item.updated) / 1000 / 1000)).format(
                        'MMMM Do YYYY, h:mm:ss a',
                    );
                    return item;
                });

                const aidArr = res.data.map((item) => {
                    return item.article;
                });
                const cres = await getCanister({
                    articleIds: aidArr,
                });

                arr.map((item) => {
                    if (cres.data[item.article]) {
                        item.planet = cres.data[item.article];
                    }
                });

                articleBlackList.value = _.reverse(arr);
            }
        };

        const getPlanetList = async () => {
            const res2 = await auditCanister.value.findBannedRecommendedAllArticlesByPage({
                page: 1,
                size: 9999,
            });
            if (!res2.data.length) {
                planetBlackList.value = [];
            } else {
                const arr = res2.data.map((item) => {
                    item.auditor = item.auditor.toString();
                    item.planet = item.planet.toString();
                    item.updated = moment(Math.floor(Number(item.updated) / 1000 / 1000)).format(
                        'MMMM Do YYYY, h:mm:ss a',
                    );
                    return item;
                });
                planetBlackList.value = _.reverse(arr);
            }
        };

        const getSearchList = async () => {
            const res3 = await auditCanister.value.findBannedSearchedAllArticlesByPage({
                page: 1,
                size: 9999,
            });
            if (!res3.data.length) {
                searchBlackList.value = [];
            } else {
                const arr = res3.data.map((item) => {
                    item.auditor = item.auditor.toString();
                    item.planet = item.planet.toString();
                    item.updated = moment(Math.floor(Number(item.updated) / 1000 / 1000)).format(
                        'MMMM Do YYYY, h:mm:ss a',
                    );
                    return item;
                });
                searchBlackList.value = _.reverse(arr);
            }
        };

        const getList = async () => {
            getArticleList();
            getPlanetList();
            getSearchList();
        };

        const jumpPlanet = (pid) => {
            const url = `${location.origin}/planet/${pid}`;
            window.open(url);
        };

        const jumpArticle = (pid, aid) => {
            const url = `${location.origin}/planet/${pid}/${aid}`;
            window.open(url);
        };

        const init = async () => {
            auditCanister.value = await createActor(
                CONFIG.auditCanister,
                auditFactory,
                store.state.agent,
            );
            getPermission();
            getList();
        };

        watch(
            () => store.state?.user_data,
            (val) => {
                if (val) {
                    init();
                }
            },
            { immediate: true, deep: true },
        );

        return {
            store,
            isAdministrator,
            isAuditor,
            aid,
            aidReason,
            articleLoading,
            planetLoading,
            searchLoading,
            sid,
            sidReason,
            pid,
            pidReason,
            articleBlackList,
            planetBlackList,
            searchBlackList,
            moment,
            activeName,
            options,
            jumpPlanet,
            jumpArticle,
            articleBan,
            articlePullout,
            planetBan,
            planetPullout,
            searchBan,
            searchPullout,
            init,
        };
    },
});
</script>

<style scoped lang="less">
.auditBox {
    display: flex;
    flex-direction: column;

    .permission {
        display: flex;
        padding: 10px;
        border-bottom: 1px solid #e8e8e8;

        p {
            margin-right: 15px;
        }

        strong {
            margin-left: auto;
            cursor: pointer;
            font-weight: normal;
        }
    }

    :deep(.el-input) {
        border: 1px solid #dddddd;
        border-radius: 6px;
        @apply dark:(border-dark-100);
        margin-top: 15px;

        .el-input__wrapper {
            padding: 0;
        }

        .el-input__inner,
        .el-textarea__inner {
            color: #666;
            text-align: left;
            font-size: 14px;
            padding: 10px;
            @apply dark:(text-light-900/80);
        }
    }

    :deep(.el-select) {
        margin-top: 15px;

        .el-input {
            height: auto;
            margin-top: 0;

            .el-input__wrapper {
                border: none;

                .el-input__inner {
                    text-align: center;
                }

                .el-select__input {
                    text-align: left;
                }

                & > span {
                    i {
                        width: auto;

                        &:hover {
                            background: none;
                            color: #999;
                        }
                    }
                }
            }
        }
    }

    :deep(.el-button) {
        margin-top: 15px;
    }

    .auditContent {
        margin: 50px 50px 0 50px;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        grid-gap: 10px;
    }

    .article,
    .planet,
    .search {
        display: flex;
        flex-direction: column;
        border: 1px solid #000;
        padding: 15px;
        border-radius: 10px;
        overflow: hidden;

        h3 {
            font-weight: normal;
        }

        span {
            display: flex;
            margin-top: 15px;
            margin-bottom: 15px;

            :deep(.el-button) {
                flex: 1;
            }
        }

        .btnBox {
            display: flex;
        }

        .info {
        }
    }
}

.list {
    margin-top: 10px;

    p {
        margin: 10px;
    }
}

:deep(.el-tabs__header) {
    margin-bottom: 0;
}
</style>
