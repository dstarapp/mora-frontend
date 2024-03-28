<template>
    <el-dialog v-model="dialogVisible" :title="title + ' ' + $t('roverSetting.web3.title')" :before-close="handleClose"
        @closed="afterClose">
        <i v-if="nameList.length !== 0" class="iconfont icon-refresh posi" :class="{ refresh: isRefresh }"
            @click="refresh"></i>

        <div class="box" v-if="nameList.length === 0">
            <span>{{ $t('roverSetting.identity.send') }}</span>
            <span class="pid">{{ userData ? userData.pid : '' }}</span>
            <div class="icnaming">
                <span>
                    {{ $t('roverSetting.identity.icnaming') }}<br />
                    <a href="https://app.icnaming.com/" target="_blank">{{ CONFIG.icnamingUrl }}</a>
                </span>
                <i class="iconfont icon-refresh" :class="{ refresh: isRefresh }" @click="refresh"></i>
            </div>
        </div>
        <div class="box" translate="no" v-else>
            <div class="item" v-for="(item, index) in nameList" :key="index"
                :class="{ active: currentIndentity == index }" @click="choseIndentity(index)">
                <div class="chose">
                    <i class="iconfont icon-chose"></i>
                    <p>{{ item.name }}</p>
                </div>
                <button @click.stop="transferIndentity(item)">
                    {{ $t('roverSetting.identity.transfer') }}
                </button>
            </div>
        </div>

        <div class="mora-button" v-if="nameList.length !== 0">
            <div class="cancel" @click="cancel">
                {{ $t('planetTips.updates.cancel') }}
            </div>
            <div class="confirm" :class="{ loading: isLoading }" @click="confirm">
                <img src="@/assets/svg/loading.svg" v-if="isLoading" />
                {{ $t('roverSetting.confirm') }}
            </div>
        </div>
    </el-dialog>

    <Transfer v-if="isTransfer" @componentClose="closeTransfer" @transferSubmit="transferSubmit" />
</template>

<script lang="ts">
import { defineComponent, inject, ref, onMounted, onBeforeUnmount } from 'vue';
import { t } from '@/i18n';
import { ElMessage } from 'element-plus';
import CONFIG from '@/assets/config';
import { Principal } from '@dfinity/principal';
import Transfer from './Transfer.vue';
import bus from 'vue3-eventbus';

export default defineComponent({
    components: { Transfer },
    name: 'Indentity',
    emits: ['componentClose', 'setName'],
    props: {
        title: {
            type: String,
            default: '',
        },
        userData: {
            type: Object,
            default: {},
        },
        nameList: {
            type: Array,
            default: [],
        },
    },
    setup(props, context) {
        const dialogVisible = ref(true);
        const isLoading = ref(false);
        const currentIndentity = ref(-1);
        const isRefresh = ref(false);
        const indentityData = ref([]);
        const isTransfer = ref(false);
        const currentTransferName = ref();
        const icnamingNameCanister: any = inject('icnamingNameCanister', null);
        const getData: any = inject('getData', null);

        const handleClose = () => {
            if (isLoading.value) {
                ElMessage.error(t('planetTips.updates.isLoadingClose'));
                return false;
            }
            dialogVisible.value = false;
        };

        const afterClose = () => {
            context.emit('componentClose');
        };

        const confirm = () => {
            if (
                !props.userData.identity &&
                !currentIndentity.value &&
                currentIndentity.value !== 0
            ) {
                return;
            }

            isLoading.value = true;
            if (currentIndentity.value === -1) {
                context.emit('setName', false);
                return;
            }
            if (props.nameList[currentIndentity.value]?.name === props.userData.identity) {
                context.emit('componentClose');
                return;
            }
            context.emit('setName', props.nameList[currentIndentity.value]);
        };

        const cancel = () => {
            dialogVisible.value = false;
        };

        const choseIndentity = (id: number) => {
            if (currentIndentity.value !== id) {
                currentIndentity.value = id;
            } else {
                currentIndentity.value = -1;
            }
        };

        const refresh = () => {
            isRefresh.value = true;
            getData();
        };

        const refreshEnd = () => {
            isRefresh.value = false;
        };

        onMounted(() => {
            bus.on('refreshEnd', refreshEnd);

            props.nameList.forEach((item, idx) => {
                if (item.name === props.userData.identity) {
                    currentIndentity.value = idx;
                }
            });
        });

        onBeforeUnmount(() => {
            bus.off('refreshEnd', refreshEnd);
        });

        const transferIndentity = (item) => {
            isTransfer.value = true;
            currentTransferName.value = item;
        };

        const transferSubmit = async (pid) => {
            let res = await icnamingNameCanister.value.transfer(
                currentTransferName.value.name,
                Principal.fromText(pid),
            );
            if (res) {
                getData();
                ElMessage.success(t('roverSetting.transfer.success'));
                currentTransferName.value = '';
                isTransfer.value = false;
                context.emit('componentClose');
            }
        };

        const closeTransfer = () => {
            isTransfer.value = false;
            currentTransferName.value = '';
        };

        return {
            dialogVisible,
            isLoading,
            currentIndentity,
            isRefresh,
            CONFIG,
            indentityData,
            isTransfer,
            handleClose,
            afterClose,
            confirm,
            cancel,
            choseIndentity,
            refresh,
            transferIndentity,
            closeTransfer,
            transferSubmit,
        };
    },
});
</script>

<style lang="less" scoped>
.posi {
    position: absolute;
    right: 70px;
    top: 40px;
    z-index: 3;
    cursor: pointer;

    &.refresh {
        -webkit-animation: refresh 1s linear infinite;
        animation: refresh 1s linear infinite;
    }
}

.box {
    width: 100%;
    .padding(0, 35, 0, 35);
    max-height: 500px;
    overflow-y: auto;
    position: relative;
    @apply dark:(text-light-900/80);

    span {
        width: 100%;
        display: block;
        .font-size(16);
        text-align: left;
        margin-bottom: 8px;

        &.pid {
            background-color: @bg-color-hover;
            .font-size(16);
            .padding(10, 20, 10, 20);
            .border-radius(12);
            @apply dark:(bg-dark-300 text-light-900/60);
        }
    }

    .icnaming {
        display: flex;
        justify-content: space-between;
        align-items: center;
        .padding(20, 0, 0, 0);

        a {
            color: rgb(53, 94, 243);
        }

        i {
            cursor: pointer;

            &.refresh {
                -webkit-animation: refresh 1s linear infinite;
                animation: refresh 1s linear infinite;
            }
        }
    }

    .item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        .font-size(16);
        .margin(3, 0, 3, 0);
        .padding(15, 20, 15, 20);
        .border-radius(12);
        transition: @transition;

        &.active {
            background-color: @bg-color-hover;
            @apply dark:(bg-dark-300);

            .chose {
                p {
                    color: @text-color;
                    font-weight: 500;
                    @apply dark:(text-light-900/80);
                }

                i {
                    color: @text-active;
                    @apply dark:(text-purple-500);
                    transition: @transition;
                }
            }
        }

        &:hover {
            background-color: @bg-color-hover;
            @apply dark:(bg-dark-300);
            transition: @transition;

            .chose {
                cursor: pointer;
            }
        }

        .chose {
            flex: 1;
            display: flex;
            align-items: center;

            p {
                text-align: left;
            }

            i {
                color: @text-color-disable;
                @apply dark:(text-light-900/30);
                transition: @transition;
                .margin(0, 15, 0, 0);
            }
        }

        button {
            .font-size(14);
            border: none;
            color: @text-active;
            transition: @transition;
            background: none;
            .margin(0, 0, 0, 15);

            &:hover {
                cursor: pointer;
                font-weight: 500;
                transition: @transition;
            }
        }
    }
}

@media screen and (min-width: 0) and (max-width: 750px) {
    .posi {
        right: 20px;
        top: 30px;
    }
}
</style>
