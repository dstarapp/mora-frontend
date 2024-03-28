<template>
    <div class="planetSubscriptionsBox">
        <h2>
            {{ $t('roverPlanetSubscriptions.title') }}
            <div v-if="store.state.subscribes_data && store.state.subscribes_data.length" @click="generateOPML"
                class="export">
                <i class="iconfont icon-dy"></i>{{ $t('rss.exportAll') }}
            </div>
            <i class="iconfont icon-refresh" :class="{ refresh: isRefresh }" @click="refresh"></i>
        </h2>
        <div class="content">
            <div class="subscriptions" v-if="store.state.subscribes_loading">
                <Skeleton v-for="i in 9" :key="i" />
            </div>

            <div v-if="store.state.subscribes_data && store.state.subscribes_data.length" class="subscriptions">
                <SubscriptionsList v-for="item in store.state.subscribes_data" :key="item" :pid="item" />
            </div>

            <div class="noData" v-if="!store.state.subscribes_loading &&
                store.state.subscribes_data &&
                !store.state.subscribes_data.length
                ">
                <i class="iconfont icon-no"></i>
                <p>{{ $t('roverDashboard.noData') }}</p>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, inject, watch, nextTick } from 'vue';
import SubscriptionsList from './components/SubscriptionsList.vue';
import Skeleton from './components/Skeleton.vue';
import store from '@/store';
import { ElMessage } from 'element-plus';
import { t } from '@/i18n';
import CONFIG from '@/assets/config';
import { arraysEqual } from '@/utils/functions';
import debug from '@/utils/debug';

export default defineComponent({
    name: 'PlanetSubscriptions',
    components: {
        SubscriptionsList,
        Skeleton,
    },
    setup() {
        const isRefresh = ref(false);
        const isLoading = ref(true);
        const get_subscribes_canister: any = inject('get_subscribes_canister', null);
        const usersCanister: any = inject('usersCanister');

        const refresh = () => {
            store.commit('SET_SUBSCRIBES_DATA', []);
            store.commit('CLEAR_SUBSCRIPTIONS_CACHE', {});
            nextTick(() => {
                isRefresh.value = true;
                get_subscribes_canister();
                setTimeout(() => {
                    isRefresh.value = false;
                }, 300);
            });
        };

        const generateOPML = () => {
            let links = store.state.subscribes_data;
            if (!links || !links.length) {
                ElMessage.error(t('rss.exportNoData'));
            }

            let xml = document.implementation.createDocument(null, 'opml');

            let head = xml.createElement('head');
            xml.documentElement.appendChild(head);

            let title = xml.createElement('title');
            title.appendChild(xml.createTextNode('My Feeds'));
            head.appendChild(title);

            let body = xml.createElement('body');
            xml.documentElement.appendChild(body);

            links.forEach(function (link) {
                let outline = xml.createElement('outline');
                outline.setAttribute('type', 'rss');
                outline.setAttribute('text', 'Mora - Feed');
                outline.setAttribute('xmlUrl', `${CONFIG.rssLinkBaseUrl}${link}`);
                body.appendChild(outline);
            });

            let xmlFile = new XMLSerializer().serializeToString(xml);

            let downloadLink = document.createElement('a');
            downloadLink.href = 'data:text/xml;charset=utf-8,' + encodeURIComponent(xmlFile);
            downloadLink.download = 'myfeeds.opml';
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        };

        const listenSubscriptions = async () => {
            try {
                let subscribesData = await usersCanister.value.get_subscribes();
                let arr = subscribesData[0].map((item) => {
                    let id = item.toString();
                    return id;
                });
                if (!arraysEqual(arr, [...store.state.subscribes_data])) {
                    refresh();
                }
            } catch (err) {
                debug('failed', err);
            }
        };

        watch(
            () => usersCanister.value,
            (val) => {
                if (val) {
                    listenSubscriptions();
                }
            },
            { immediate: true, deep: true },
        );

        return {
            store,
            isLoading,
            isRefresh,
            refresh,
            generateOPML,
        };
    },
});
</script>

<style scoped lang="less">
.planetSubscriptionsBox {
    display: flex;
    width: 100%;
    flex-direction: column;

    h2 {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-style: normal;
        font-weight: 500;
        .font-size(24);
        .line-height(29);
        color: @text-color;
        margin: 0;

        @apply dark:(text-light-900);

        i {
            .font-size(20);
            color: @text-color-grey;
            cursor: pointer;

            &.refresh {
                transition: @transition;
                transform: rotate(180deg);
            }
        }

        .export {
            @apply ml-auto mr-5 flex items-center bg-yellow-500 text-white py-1 px-3 text-sm rounded-lg transition duration-300 <sm:(text-sm px-2 mr-3 whitespace-nowrap) cursor-pointer;

            i {
                @apply text-xs mr-2 text-white <sm:(hidden);
            }

            &:hover {
                @apply bg-yellow-600 transition duration-300;
            }
        }
    }

    .content {
        width: 100%;

        .subscriptions {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            .margin(30, 0, 0, 0);
            width: 100%;
        }

        .noData {
            .center();
            .font-size(70);
            .padding(200, 0, 50, 0);
            flex-direction: column;
            width: 100%;

            i {
                .font-size(70);
                color: #dddddd;
            }

            p {
                font-style: normal;
                font-weight: 400;
                .font-size(16);
                .line-height(19);
                .margin(10, 0, 0, 0);
                color: @text-color-grey;
            }
        }
    }
}

@media screen and (min-width: 0) and (max-width: 750px) {
    .planetSubscriptionsBox {
        h2 {
            font-size: 20px;
        }

        .content {
            .subscriptions {
                grid-template-columns: repeat(1, 1fr);
            }
        }
    }
}

@media screen and (min-width: 750px) and (max-width: 1040px) {
    .planetSubscriptionsBox {
        .content {
            .subscriptions {
                grid-template-columns: repeat(2, 1fr);
            }
        }
    }
}
</style>
