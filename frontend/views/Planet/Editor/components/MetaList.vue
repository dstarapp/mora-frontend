<template>
    <template v-if="step === 0">
        <div class="noData" v-if="boxList.length === 0">
            <i class="iconfont icon-no"></i>
            <p>{{ $t('roverDashboard.noData') }}</p>
        </div>

        <div class="listBox" v-else>
            <div class="list" @click="context.emit('openFileList', item)" v-for="(item, idx) in boxList" :key="idx"
                v-loading="metaBoxUpgradeLoading === item.canister_id.toString()">
                <dl>
                    <dt>{{ $t('metabox.mbox.name') }}</dt>
                    <dd class="name">{{ item.box_name }}</dd>
                </dl>
                <dl>
                    <dt>{{ $t('metabox.mbox.cid') }}</dt>
                    <dd>
                        <el-tooltip :teleported="false" :content="item.canister_id.toString()" placement="top">
                            {{ item.canister_id }}
                        </el-tooltip>
                    </dd>
                </dl>
                <dl>
                    <dt>{{ $t('metabox.mbox.status') }}</dt>
                    <dd class="ver">
                        <img v-if="!item.ver" src="@/assets/svg/loading2.svg" alt="" />
                        <strong v-else-if="item.ver !== metaboxLatestVer" class="iconfont icon-back-top"
                            @click.stop="update(item)" />
                        <template v-else>
                            <i class="iconfont" :class="{
        'icon-start': Object.keys(item.status)[0] === 'running',
        'icon-pause': Object.keys(item.status)[0] === 'stopped',
    }" />
                        </template>
                    </dd>
                </dl>
                <dl>
                    <dt>{{ $t('metabox.mbox.cycles') }}</dt>

                    <dd class="loading" v-if="item.cycleBalance === 'loading'">
                        <img src="@/assets/svg/loading2.svg" alt="" />
                    </dd>
                    <dd class="cycle" v-else>
                        {{ item.cycleBalance !== 'error' ? item.cycleBalance : '' }}
                        <el-tooltip :teleported="false" :content="$t('metabox.mbox.addcycles')" placement="top">
                            <i class="iconfont icon-failed" @click.stop="addCycles(item)"></i>
                        </el-tooltip>
                    </dd>
                </dl>
                <dl>
                    <dt>{{ $t('metabox.mbox.cz') }}</dt>
                    <dd class="transfer" @click.stop="transferMetaBox(item)">
                        {{ $t('metabox.mbox.transfer') }}
                    </dd>
                </dl>
            </div>
        </div>

        <div class="mora-button create">
            <div class="confirm" @click="createMetaBox()">
                {{ $t('metabox.btns.b1') }}
            </div>
        </div>

        <div class="bottomRefresh" @click="context.emit('refresh')">
            <i class="iconfont icon-refresh"></i>
        </div>
    </template>

    <div class="form" v-else-if="step === 1">
        <div class="inputbox">
            <el-input v-model="MetaBoxName" :placeholder="$t('metabox.placeholder.p1')" />
        </div>
        <div class="mora-button">
            <div class="cancel" @click="cancel">
                {{ $t('editor.insertLink.cancel') }}
            </div>
            <div class="confirm" :class="{ disabled: !MetaBoxName.length || isLoading }" @click="addMetabox">
                <img src="@/assets/svg/loading.svg" v-if="isLoading" />
                {{ isLoading ? $t('metabox.btns.b4') : $t('metabox.btns.b2') }}
            </div>
        </div>
    </div>

    <div class="form" v-else-if="step === 2">
        <div class="inputbox">
            <el-input v-model="MetaBoxName" :placeholder="$t('metabox.placeholder.p2')" />
        </div>
        <div class="mora-button">
            <div class="cancel" @click="cancel">
                {{ $t('editor.insertLink.cancel') }}
            </div>
            <div class="confirm" :class="{ disabled: !isPrincipalString(MetaBoxName) || isLoading }"
                @click.stop="transfer">
                <img src="@/assets/svg/loading.svg" v-if="isLoading" />
                {{ $t('metabox.btns.b3') }}
            </div>
        </div>
    </div>
    <AddCycles v-if="showAddCycles" :principalID="metaBoxID" @refreshCycles="context.emit('refresh')"
        @componentClose="componentClose" />
</template>

<script lang="ts">
import { defineComponent, ref, inject } from 'vue';
import { t } from '@/i18n';
import { ElMessage } from 'element-plus';
import AddCycles from '@/components/AddCycles.vue';
import { isPrincipalString } from '@/utils/functions';
import { DataBox } from 'js-databox/esm/databox';
import { Principal } from '@dfinity/principal';
import debug from '@/utils/debug';
import store from '@/store';
import CONFIG from '@/assets/config';

export default defineComponent({
    name: 'MetaList',
    components: { AddCycles },
    props: {
        boxList: {
            type: Array as any,
            default: [],
        },
        metaboxLatestVer: {
            type: Number,
        },
    },
    emits: ['refresh', 'openFileList', 'metaBoxUpgrade'],
    setup(props, context) {
        const isLoading = ref(false);
        const step = ref(0);
        // MetaBox Name
        const MetaBoxName = ref('');
        const metaBoxID = ref();
        const showAddCycles = ref(false);
        const currentTransfer = ref();
        const metaBoxUpgradeLoading = ref(false);
        const metaboxApi: any = inject('metaboxApi', null);

        // add cycles
        const addCycles = (item) => {
            metaBoxID.value = item.canister_id.toString();
            showAddCycles.value = true;
        };

        const componentClose = () => {
            showAddCycles.value = false;
        };

        const createMetaBox = () => {
            MetaBoxName.value = '';
            step.value = 1;
        };

        const transferMetaBox = (item) => {
            MetaBoxName.value = '';
            currentTransfer.value = item;
            step.value = 2;
        };

        const addMetabox = async () => {
            if (isLoading.value) {
                return;
            }

            if (!MetaBoxName.value) {
                ElMessage.warning(t('metabox.nameEmpty'));
                return;
            }

            const isNotFirstDataBox = await metaboxApi.value.isNotFirstDataBox();
            if (isNotFirstDataBox) {
                ElMessage.error(t('metabox.isNotFirstDataBox'));
                return;
            }
            isLoading.value = true;
            try {
                const res = await metaboxApi.value.createBoxFree({
                    is_private: true,
                    box_name: MetaBoxName.value,
                    box_type: { data_box: null },
                });
                if (res.err) {
                    ElMessage.error(t('metabox.error'));
                    return;
                }
                isLoading.value = false;
                step.value = 0;
                context.emit('refresh');
            } catch (err) {
                debug('create failed', err);
                ElMessage.error(t('metabox.error'));
            }
        };

        const update = async (item) => {
            if (metaBoxUpgradeLoading.value) {
                return;
            }
            metaBoxUpgradeLoading.value = item.canister_id.toString();
            context.emit('metaBoxUpgrade', item);
        };

        const transfer = async () => {
            if (isLoading.value) {
                return;
            }
            isLoading.value = true;

            const { MetaBoxActor } = await metaboxApi.value;
            const { DataBoxActor } = new DataBox(
                currentTransfer.value.canister_id,
                store.state.agent,
            );
            const mba = new Promise(async (resolve, reject) => {
                try {
                    const res = await MetaBoxActor.transferDataboxOwner(
                        currentTransfer.value.canister_id,
                        Principal.fromText(MetaBoxName.value),
                    );
                    if (res) {
                        resolve(true);
                    } else {
                        reject(false);
                    }
                } catch (err) {
                    debug('failed transferDataboxOwner', err);
                    reject(false);
                }
            });
            const dba = new Promise(async (resolve, reject) => {
                try {
                    const res = await DataBoxActor.transferOwner(
                        Principal.fromText(MetaBoxName.value),
                    );
                    if (res) {
                        resolve(true);
                    } else {
                        reject(false);
                    }
                } catch (err) {
                    debug('failed transferOwner', err);
                    reject(false);
                }
            });

            Promise.all([mba, dba])
                .then((res) => {
                    isLoading.value = false;
                    step.value = 0;
                    context.emit('refresh');
                })
                .catch(() => {
                    isLoading.value = false;
                });
        };

        const cancel = () => {
            step.value = 0;
        };

        return {
            addMetabox,
            cancel,
            transfer,
            createMetaBox,
            addCycles,
            transferMetaBox,
            componentClose,
            update,
            isPrincipalString,
            MetaBoxName,
            isLoading,
            step,
            context,
            showAddCycles,
            metaBoxID,
            currentTransfer,
            CONFIG,
            metaBoxUpgradeLoading,
        };
    },
});
</script>

<style scoped lang="less">
.noData {
    width: 100%;
    .padding(20, 0, 40, 0);
    text-align: center;

    i {
        .font-size(70);
        .line-height(70);
        color: #dddddd;
    }

    p {
        width: 100%;
        display: block;
        .font-size(16);
        .padding(10, 0, 0, 0);
        color: @text-color-grey;
    }
}

.mora-button {
    &.create {
        width: 60%;
        margin: 0 auto;
    }
}

.listBox {
    width: 100%;
    max-height: 450px;
    overflow-y: auto;
    .padding(20, 0, 15, 0);
    position: relative;

    .list {
        width: 100%;
        border: 1px solid @border-color;
        .padding(10, 15, 10, 15);
        .margin(0, 0, 20, 0);
        .border-radius(15);
        display: flex;
        background-color: #fff;
        transition: @transition;
        position: relative;
        // overflow: hidden;
        @apply dark: (bg-dark-600 border-dark-100);

        .icon-back-top {
            font-size: 12px;
            cursor: pointer;
            color: #96e026;
        }

        dl {
            margin: 0;

            dt {
                .font-size(12);
                text-align: left;
                color: @text-color-grey;
            }

            dd {
                width: 100%;
                display: block;
                .font-size(14);
                text-align: left;
                .ellipsis();
                margin: 0;

                &.ver {
                    .center();
                    flex: 1;

                    img {
                        margin-top: 4px;
                        .width(20);
                        .height(20);
                    }
                }

                &.name {}

                &.transfer {
                    color: @text-active;
                }

                &.loading,
                &.error,
                &.cycle {
                    .center();
                    flex: 1;
                }

                &.loading {
                    img {
                        .width(20);
                        .height(20);
                    }
                }

                &.error {
                    font-size: 14px;
                    color: #ff0000;

                    i {
                        margin-left: 0;
                    }
                }

                &.cycle {
                    .font-size(14);
                }

                i {
                    .font-size(12);

                    // margin-left: 15px;
                    &.icon-start {
                        color: #28af57;
                    }
                }
            }

            &:first-child {
                width: 90px;
                margin-right: 15px;
            }

            &:nth-child(2) {
                flex: 1;

                dd {
                    max-width: 160px;
                }
            }

            &:nth-child(3) {
                width: 50px;
            }

            &:nth-child(4) {
                width: 110px;
                display: flex;
                justify-content: center;
                align-items: center;
                flex-direction: column;

                i {
                    display: block;
                    color: @text-active;
                    margin-left: 5px;
                    transform: rotate(45deg);
                }
            }

            &:nth-child(5) {
                width: 65px;
            }
        }

        &:hover {
            transition: @transition;
            cursor: pointer;
            box-shadow: 0 6px 6px rgba(0, 0, 0, 0.06);
            @apply dark: (shadow-lg shadow-dark-900);
        }
    }
}

.form {
    width: 100%;
    .padding(15, 0, 0, 0);

    .inputbox {
        background: @bg-color-grey;
        .border-radius(10);
        height: 45px;
        @apply dark: (bg-transparent);

        :deep(.el-input) {
            .el-input__wrapper {
                .padding(0, 14, 0, 14);
                height: 45px;

                .el-input__inner {
                    height: 100%;
                }
            }
        }
    }

    .mora-button {
        padding: 0;
    }
}

.bottomRefresh {
    position: absolute;
    bottom: 30px;
    cursor: pointer;
    color: @text-active;
}
</style>
