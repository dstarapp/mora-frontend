<template>
    <div class="box">
        <div class="planet-header">
            <div class="back" @click="goBack">
                <Back />
            </div>
            <img src="@/assets/svg/planet-header-bg.svg" />

            <el-skeleton animated v-if="Object.keys(planetData).length === 0">
                <template #template>
                    <el-skeleton-item variant="image" class="avatar" />
                </template>
            </el-skeleton>

            <div class="avatar" v-else>
                <img v-if="planetData.avatar" :src="getImagesUrl(planetData.avatar)" />
            </div>
        </div>
        <div class="planet-info">
            <div class="title" v-if="Object.keys(planetData).length === 0">
                <el-skeleton animated>
                    <template #template>
                        <el-skeleton-item variant="text" style="width: 120px; height: 20px" />
                    </template>
                </el-skeleton>
            </div>
            <div class="title" v-else>{{ planetData.name }}</div>
            <div class="cansier">
                <i class="iconfont icon-point"></i>
                <span v-if="Object.keys(planetData).length === 0">
                    <el-skeleton animated>
                        <template #template>
                            <el-skeleton-item variant="text" style="width: 220px; height: 18px" />
                        </template>
                    </el-skeleton>
                </span>
                <span v-else>{{ planetData.canister ? planetData.canister.toString() : '' }}</span>
                <i class="iconfont icon-copy" @click="copy"></i>
            </div>
            <p v-if="Object.keys(planetData).length === 0">
                <el-skeleton animated>
                    <template #template>
                        <el-skeleton-item variant="text" style="width: 80%; height: 18px" />
                        <el-skeleton-item variant="text" style="width: 60%; height: 18px" />
                    </template>
                </el-skeleton>
            </p>
            <p v-else>
                {{ planetData.desc }}
            </p>
            <div class="link" @click="jumpPlanet()">
                <i class="iconfont icon-link"></i>
                <span>{{ $t('roverPlanetSubscriptions.planet.visitTxt') }}</span>
            </div>
            <div class="items">
                <div class="item expired">
                    <span>{{ $t('roverPlanetSubscriptions.planet.Expired') }}</span>
                    <template v-if="!subType && !subType">
                        <el-skeleton animated>
                            <template #template>
                                <el-skeleton-item variant="text" style="width: 120px" />
                            </template>
                        </el-skeleton>
                    </template>
                    <template v-else>
                        {{ subType === 'Free' || subType === 'Permanent' ? subType : expireTime }}
                    </template>
                </div>
                <div class="item" @click="handClick('Unsubscribe')">
                    <i class="iconfont icon-unsubscribe"></i>
                    <span>{{ $t('roverPlanetSubscriptions.planet.Unsubscribe') }}</span>
                </div>
                <div class="item" @click="handClick('Order')">
                    <i class="iconfont icon-order"></i>
                    <span>{{ $t('roverPlanetSubscriptions.planet.order') }}</span>
                </div>
                <div class="item" :class="{ disabled: subType === 'Free' }" @click="handClick('Transfer')">
                    <i class="iconfont icon-transfer"></i>
                    <span>{{ $t('roverPlanetSubscriptions.planet.Transfer') }}</span>
                </div>
            </div>
        </div>
        <div class="comments">
            <div class="head">
                <span class="title">{{ $t('roverPlanetSubscriptions.planet.Comments') }}</span>
            </div>
            <Comments :commentsData="commentsData" :commentsLoading="commentsLoading" />
        </div>
    </div>
    <component :is="isComponent" :componentData="planetData" :planetID="planetData.canister"
        @componentClose="componentClose" />
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, nextTick, provide } from 'vue';
import { Back } from '@element-plus/icons-vue';
import Comments from './Comments/Comments.vue';
import Unsubscribe from './components/Unsubscribe.vue';
import Transfer from './components/Transfer.vue';
import { useRoute, useRouter } from 'vue-router';
import { copyText, getImagesUrl } from '@/utils/functions';
import debug from '@/utils/debug';
import store from '@/store';
import moment from 'moment';
import { ElMessage } from 'element-plus';
import { t } from '@/i18n';
import Order from '@/components/Order.vue';
import { createActor } from '@/request/agent';
import { idlFactory as planetFactory } from '@/request/canister/planet.did';

export default defineComponent({
    components: {
        Comments,
        Unsubscribe,
        Transfer,
        Back,
        Order,
    },
    setup() {
        const route = useRoute();
        const router = useRouter();
        const isComponent = ref();
        const pid = ref();
        const planetData: any = ref({});
        const subType = ref();
        const expireTime = ref();
        const commentsData = ref([]);
        const commentsLoading = ref(true);
        const planetCanister = ref();

        const handClick = (key: string) => {
            if (subType.value === 'Free' && key === 'Transfer') {
                return;
            }
            isComponent.value = key;
        };

        const componentClose = () => {
            isComponent.value = undefined;
        };

        const jumpPlanet = () => {
            router.push({
                name: 'browserHome',
                params: {
                    id: pid.value,
                },
            });
        };

        const goBack = () => {
            router.back();
        };

        const copy = () => {
            if (planetData.value?.canister) {
                copyText(planetData.value.canister.toString());
            }
        };

        const getComments = async () => {
            commentsLoading.value = true;
            try {
                let res = await planetCanister.value.adminComments({
                    aid: '',
                    pid: [],
                    page: 1,
                    size: 9999,
                    sort: { TimeDesc: null },
                });
                if (res) {
                    if (res.data.length) {
                        commentsData.value = res.data;
                    }
                }
                commentsLoading.value = false;
            } catch (err) {
                debug('failed', err);
                ElMessage.error(t('utils.noAccess'));
                router.push({
                    name: 'roverPlanetSubscriptions',
                });
            }
        };

        const getExpirationTime = async () => {
            try {
                let res = await planetCanister.value.getSelfSubcriber();
                if (res && res.data[0]) {
                    subType.value = Object.keys(res.data[0].subType)[0];
                    expireTime.value = moment(Number(res.data[0].expireTime)).format(
                        'h:mm MMM Do YYYY',
                    );
                }
            } catch (err) {
                debug('failed', err);
                ElMessage.error(t('utils.noAccess'));
                router.push({
                    name: 'roverPlanetSubscriptions',
                });
            }
        };

        const getPlanetData = async () => {
            try {
                let res = await planetCanister.value.getPlanetBase();
                if (res) {
                    planetData.value = res;
                }
            } catch (err) {
                debug('failed', err);
                ElMessage.error(t('utils.noAccess'));
                router.push({
                    name: 'roverPlanetSubscriptions',
                });
            }
        };

        onMounted(async () => {
            pid.value = route.params.id;
            if (!pid.value) {
                return;
            }

            planetCanister.value = await createActor(pid.value, planetFactory, store.state.agent);
            nextTick(async () => {
                getComments();
                getPlanetData();
                getExpirationTime();
            });
        });

        provide('planetCanister', planetCanister);

        return {
            isComponent,
            subType,
            expireTime,
            planetData,
            commentsLoading,
            commentsData,
            getImagesUrl,
            handClick,
            componentClose,
            goBack,
            copy,
            jumpPlanet,
            Back,
        };
    },
});
</script>

<style lang="less" scoped>
.box {
    width: 100%;
    // position: relative;

    .planet-header {
        .height(130);
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        border-radius: 25px 25px 0 0;

        img {
            width: 100%;
            object-fit: fill;
        }

        .back {
            position: absolute;
            .left(30);
            .top(30);
            z-index: 10;

            svg {
                color: #fff;
                .width(35);
                cursor: pointer;
            }
        }

        .setEmail {
            position: absolute;
            .right(30);
            .top(20);
            z-index: 10;
            text-align: right;

            span {
                display: block;
                .font-size(14);
                color: #fff;
            }
        }

        .avatar {
            .width(90);
            .height(90);
            border: 1px solid @bg-color-hover;
            padding: 2px;
            border-radius: 100%;
            overflow: hidden;
            position: absolute;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: @bg-color;

            img {
                // transform: scale(1.2);
                width: 100%;
                height: 100%;
                border-radius: 50%;
            }
        }
    }
}

.planet-info {
    width: 100%;
    .padding(150, 0, 0, 0);

    .title {
        width: 100%;
        text-align: center;
        .font-size(18);
        .padding(8, 0, 0, 0);
    }

    .cansier {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        .padding(15, 0, 15, 0);
        .font-size(16);

        .icon-point {
            color: @text-active;
            .font-size(20);
        }

        span {
            .padding(0, 8, 0, 8);
            @apply dark:(text-light-900/80);
        }

        .icon-copy {
            color: @text-color-grey;
            border: 2px solid @border-color;
            .font-size(14);
            .border-radius(10);
            cursor: pointer;
            .padding(4, 6, 4, 6);
            transition: @transition;
            @apply dark:(text-light-900/60 border-dark-50);

            &:hover {
                transition: @transition;
                border-color: @bg-color-body-active;
                color: @text-active;
            }
        }
    }

    p {
        width: 100%;
        text-align: center;
        .font-size(16);
        .line-height(22);
        .padding(5, 60, 25, 60);
        color: @text-fcolor;
        @apply dark:(text-light-900/60);
    }

    .link {
        margin: 0 auto;
        .font-size(16);
        .width(200);
        .height(45);
        min-width: 190px;
        min-height: 45px;
        display: flex;
        justify-content: center;
        align-items: center;
        border: 1px solid @border-color;
        .border-radius(50);
        transition: @transition;
        @apply dark:(border-dark-50);

        &:hover {
            cursor: pointer;
            border: 1px solid @border-color-active;
            transition: @transition;
        }

        i {
            color: @text-active;
            margin-right: 12px;
        }

        span {
            color: @text-active;
            font-weight: 500;
        }
    }

    .items {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .padding(40, 0, 30, 0);
        border-bottom: 1px solid @border-color;
        @apply dark:(border-dark-50);

        .item {
            flex: 1;
            border: 1px solid @border-color;
            .border-radius(12);
            .center();
            .padding(15, 0, 15, 0);
            .margin(0, 15, 0, 0);
            color: @text-color-grey;
            transition: @transition;
            text-align: center;
            @apply dark:(border-dark-50);

            &:last-child {
                margin-right: 0;
            }

            i {
                margin-right: 12px;
                .font-size(18);
            }

            span {
                color: @text-color;
                .font-size(16);
                transition: @transition;
                @apply dark:(text-light-900);
            }

            &.disabled {
                background: #eee;
                border-color: #eee;
                @apply dark:(bg-dark-400 border-dark-100);

                span {
                    color: #999;
                    @apply dark:(text-light-900/30);
                }

                i {
                    color: #999;
                    @apply dark:(text-light-900/30);
                }

                &:hover {
                    border-color: #eee;
                    cursor: not-allowed;
                    @apply dark:(border-dark-100);

                    span {
                        color: #999;
                        @apply dark:(text-light-900/30);
                    }

                    i {
                        color: #999;
                        @apply dark:(text-light-900/30);
                    }
                }
            }

            &.expired {
                display: block;
                .font-size(14);
                text-align: center;
                .padding(8, 0, 8, 0);

                span {
                    display: block;
                    @apply dark:(text-light-900);
                }

                &:hover {
                    border: 1px solid @border-color;
                    @apply cursor-default dark:(border-dark-50);

                    span {
                        color: @text-color;
                        @apply dark:(text-light-900);
                    }
                }
            }

            &:hover {
                border: 1px solid @border-color-active;
                transition: @transition;
                cursor: pointer;

                span,
                i {
                    color: @border-color-active;
                    transition: @transition;
                }
            }
        }
    }
}

.comments {
    width: 100%;
    .padding(30, 0, 0, 0);

    .head {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .title {
            .font-size(22);

            @apply dark:(text-light-900);
        }

        .more {
            .font-size(14);
            font-weight: 500;
            color: @text-active;
        }
    }
}

@media screen and (min-width: 0) and (max-width: 750px) {
    .box {
        .planet-header {
            .back {
                .left(40);
                .top(40);
            }
        }
    }

    .planet-info {
        .padding(90, 0, 0, 0);

        .link {
            min-width: 60%;
            .height(90);
        }

        p {
            .padding(5, 0, 25, 0);
        }

        .items {
            flex-wrap: wrap;

            .item {
                flex: auto;
                width: 48%;
                margin-bottom: 15px;

                &.expired {
                    .padding(4, 0, 4, 0);
                }

                &:nth-child(2) {
                    margin-right: 0;
                }
            }
        }
    }
}

@media screen and (min-width: 750px) and (max-width: 1240px) {
    .planet-info {
        .items {
            flex-wrap: wrap;

            .item {
                width: 48%;
                margin-bottom: 15px;

                &.expired {
                    .padding(8, 0, 8, 0);
                }
            }
        }
    }
}
</style>
