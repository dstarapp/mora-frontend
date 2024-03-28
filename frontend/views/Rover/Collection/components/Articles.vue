<template>
    <el-skeleton class="skeleton" animated v-if="isloading">
        <template #template>
            <div>
                <div class="title">
                    <el-skeleton-item variant="caption" style="height: 26px"></el-skeleton-item>
                </div>
                <div class="items">
                    <div class="item">
                        <el-skeleton-item style="width: 50px" variant="text" />
                    </div>
                    <div class="item">
                        <el-skeleton-item style="width: 50px" variant="text" />
                    </div>
                    <div class="item">
                        <el-skeleton-item style="width: 50px" variant="text" />
                    </div>
                    <div class="item">
                        <el-skeleton-item style="width: 20px" variant="text" />
                    </div>
                </div>
            </div>
        </template>
    </el-skeleton>

    <template v-else>
        <div class="list" :class="{
        del: !articleData,
    }">
            <template v-if="articleData">
                <div class="title" @click="openArticle">{{ articleData.title }}</div>
                <div class="items">
                    <div class="item">
                        <i class="iconfont icon-zan"></i>
                        {{ articleData.like }}
                    </div>
                    <div class="item" @click="unCollection()">
                        <i class="iconfont icon-collection"></i>
                    </div>
                </div>
            </template>
            <template v-else>
                <div class="title">{{ $t('roverCollection.articleDataNone') }}</div>
                <div class="items">
                    <div class="item">
                        <i class="iconfont icon-zan"></i>
                        0
                    </div>
                    <div class="item" @click="unCollection()">
                        <i class="iconfont icon-collection"></i>
                    </div>
                </div>
            </template>
            <img v-if="isUnCollectionLoading" src="@/assets/svg/loading2.svg" alt="" />
        </div>
    </template>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, inject } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { createActor } from '@/request/agent';
import { idlFactory as planetFactory } from '@/request/canister/planet.did';
import { useRoute, useRouter } from 'vue-router';
import { t } from '@/i18n';
import debug from '@/utils/debug';
import store from '@/store';

export default defineComponent({
    props: {
        listData: {
            type: Object,
            default: {},
        },
    },
    setup(props) {
        const route = useRoute();
        const router = useRouter();
        const isloading = ref(true);
        const planetCanister = ref();
        const isShowCancel = ref(false);
        const canisterId = ref();
        const articleId = ref();
        const articleData = ref();
        const isUnCollectionLoading = ref(false);
        const usersCanister: any = inject('usersCanister', null);
        const get_collections_canister: any = inject('get_collections_canister', null);

        const getData = async () => {
            isloading.value = true;
            try {
                planetCanister.value = await createActor(canisterId.value, planetFactory);
                let str = {
                    status: [],
                    subcate: 0,
                    cate: 0,
                    atype: [
                        {
                            Article: null,
                        },
                    ],
                    page: 1,
                    size: 9999,
                    sort: {
                        TimeDesc: null,
                    },
                    search: '',
                };
                let res = await planetCanister.value.queryArticles(str);
                if (res && res.data.length) {
                    res.data.map((item) => {
                        if (item.id === articleId.value) {
                            articleData.value = item;
                        }
                    });
                }
                isloading.value = false;
            } catch (err) {
                debug('failed', err);
            }
        };

        const openArticle = () => {
            router.push({
                name: 'browserArticle',
                params: {
                    id: canisterId.value,
                    articleId: articleId.value,
                },
            });
        };

        const unCollection = async () => {
            ElMessageBox.confirm(
                t('roverCollection.txt'),
                t('roverCollection.unCollectionTitle'),
                {
                    confirmButtonText: t('roverCollection.btns.confirmTxt'),
                    cancelButtonText: t('roverCollection.btns.cancelTxt'),
                    type: 'warning',
                },
            )
                .then(async () => {
                    isUnCollectionLoading.value = true;
                    let res = await usersCanister.value.remove_collection(
                        props.listData.canister_id,
                        articleId.value,
                    );
                    if (!res) {
                        ElMessage.error(t('planet.unCollectError'));
                    } else {
                        isUnCollectionLoading.value = false;
                        get_collections_canister();
                    }
                })
                .catch((err) => {
                    debug('failed', err);
                });
        };

        onMounted(() => {
            if (!props.listData) {
                return;
            }
            canisterId.value = props.listData.canister_id.toString();
            articleId.value = props.listData.article_id;
            getData();
        });

        return {
            openArticle,
            isloading,
            isShowCancel,
            articleData,
            isUnCollectionLoading,
            unCollection,
        };
    },
});
</script>

<style lang="less" scoped>
.title {
    width: 100%;

    color: @text-color;
    .font-size(18);
    transition: @transition;
    @apply dark:(text-light-900/80);

    &:hover {
        color: @text-active;
        transition: @transition;
        cursor: pointer;
    }
}

.list {
    position: relative;

    img {
        position: absolute;
        right: 0;
        top: 0;
        .width(20);
        .height(20);
    }

    &.del {
        &:hover {
            cursor: not-allowed;
            color: @text-fcolor;
        }

        .title {
            opacity: 0.2;
            text-decoration: line-through;

            &:hover {
                cursor: not-allowed;
                color: @text-fcolor;
            }
        }

        .items {
            .item {
                opacity: 0.3;
            }
        }
    }
}

.items {
    width: 100%;
    .margin(10, 0, 0, 0);
    display: flex;
    align-items: center;

    .item {
        display: flex;
        align-items: center;
        .margin(0, 30, 0, 0);
        color: @text-fcolor;
        .font-size(14);
        position: relative;

        i {
            color: @text-color-grey;
            margin-right: 8px;
        }

        .icon-collection {
            color: @text-active;
            cursor: pointer;

            &:hover {
                opacity: 0.85;
                color: @text-fcolor;
                transition: @transition;
            }
        }
    }
}

.skeleton {
    .margin(30, 0, 0, 0);
}

@media screen and (min-width: 0) and (max-width: 750px) {
    .items {
        .item:nth-child(2) {
            display: none;
        }
    }
}
</style>
