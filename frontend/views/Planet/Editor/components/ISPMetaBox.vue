<template>
    <el-dialog class="bodyPT0" v-model="dialogVisible" :title="$t('metabox.title')" :before-close="handleClose"
        @closed="afterClose">
        <div class="loading" v-if="isLoading">
            <img src="@/assets/svg/loading3.svg" />
        </div>
        <template v-else>
            <MetaList ref="MetaListDom" :boxList="boxList" :metaboxLatestVer="metaboxLatestVer" @refresh="refreshList"
                @openFileList="openFileList" @metaBoxUpgrade="metaBoxUpgrade" v-if="isMetaBox" />
            <MetaFile v-else :dataBoxApi="dataBoxApi" :fileList="fileList" @refresh="refreshFileList" @back="back"
                @insert="insert" @uploadFile="uploadFile" />
        </template>
        <div class="powerby">
            <img src="@/assets/svg/metabox.svg" alt="" />
            <a target="_blank" :href="CONFIG.metaBoxLink">{{ $t('metabox.tag') }}</a>
        </div>
    </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, shallowRef, inject, onMounted, provide } from 'vue';
import { t } from '@/i18n';
import { Principal } from '@dfinity/principal';
import store from '@/store';
import { ElMessage, ElMessageBox } from 'element-plus';
import MetaList from './MetaList.vue';
import MetaFile from './MetaFile.vue';
import CONFIG from '@/assets/config';
import debug from '@/utils/debug';
import { DataBox } from 'js-databox/esm/databox';
import { byteToOther } from '@/utils/functions';
import { createActor } from '@/request/agent';
import { idlFactory as metaBoxDataFactory } from '@/request/canister/metaBoxData.did';
import _ from 'lodash';

export default defineComponent({
    name: 'MetaBox',
    emits: ['componentClose'],
    props: {
        insertCallback: { type: Function },
    },
    components: { MetaList, MetaFile },
    setup(props, context) {
        const dialogVisible = ref(true);
        const MetaListDom = shallowRef();
        const isLoading = ref(true);
        const boxList = ref<any[]>([]);
        const fileList = ref<any[]>([]);
        const isMetaBox = ref(true);
        const dataBoxApi = ref();
        const currentOpenFileList = ref();
        const metaboxLatestVer = ref();
        const metaboxApi: any = inject('metaboxApi', null);

        const handleClose = () => {
            dialogVisible.value = false;
        };

        const afterClose = () => {
            context.emit('componentClose');
        };

        const refreshList = () => {
            init();
        };

        const refreshFileList = () => {
            if (!currentOpenFileList.value) {
                return;
            }
            openFileList(currentOpenFileList.value);
        };

        const metaBoxUpgrade = async (item) => {
            MetaListDom.value.metaBoxUpgradeLoading = item.canister_id.toString();
            let str = {
                info: {
                    status: item.status,
                    canister_id: item.canister_id,
                    box_name: item.box_name,
                    box_type: item.box_type,
                    is_private: item.is_private,
                },
            };
            try {
                await metaboxApi.value.upgradeBox(str);
                refreshList();
            } catch (err) {
                debug('metabox upgrade failed', err);
                if (err) {
                    if (~err.toString().indexOf('is out of cycles')) {
                        ElMessage.error(t('metabox.upgradeCanisterError'));
                    }
                }
                MetaListDom.value.metaBoxUpgradeLoading = false;
            }
        };

        const openFileList = async (item) => {
            if (!item.ver && metaboxLatestVer.value) {
                ElMessage.warning(t('metabox.initLoading'));
                return;
            }
            if (item.ver !== metaboxLatestVer.value) {
                ElMessageBox.confirm(t('metabox.update.content'), t('metabox.update.title'), {
                    confirmButtonText: t('metabox.update.btn.confirm'),
                    cancelButtonText: t('metabox.update.btn.cancel'),
                    type: 'warning',
                })
                    .then(() => {
                        metaBoxUpgrade(item);
                    })
                    .catch(() => { });
                return;
            }
            isLoading.value = true;
            currentOpenFileList.value = item;
            try {
                dataBoxApi.value = new DataBox(item.canister_id, store.state.agent);
                let res = await dataBoxApi.value.get_all_files_info();
                fileList.value = _.reverse(res.ok[0]);
                isLoading.value = false;
                isMetaBox.value = false;
            } catch (err) {
                debug('failed', err);
                fileList.value = [];
            }
        };

        const back = () => {
            isMetaBox.value = true;
        };

        const uploadFile = async (item) => { };

        const insert = (item) => {
            let link = `https://${currentOpenFileList.value.canister_id.toString()}${CONFIG.metaBoxBaseUrl
                }${item.PlainFileExt.file_key}`;
            props.insertCallback &&
                props.insertCallback({
                    total_size: byteToOther(item.PlainFileExt.total_size),
                    file_name: item.PlainFileExt.file_name,
                    file_extension: item.PlainFileExt.file_extension,
                    link: link,
                });

            dialogVisible.value = false;
        };

        const init = async () => {
            isLoading.value = true;
            try {
                boxList.value = await metaboxApi.value.getBoxes(
                    Principal.fromText(store.state.user_principal as string),
                );
                let latestVer = await metaboxApi.value.getDataBoxVersion();
                metaboxLatestVer.value = Number(latestVer);
                boxList.value.map(async (item) => {
                    item.cycleBalance = 'loading';
                    let metaBoxData = await createActor(
                        item.canister_id.toString(),
                        metaBoxDataFactory,
                    );
                    let ver = await metaBoxData.getVersion();
                    item.ver = Number(ver);
                    metaBoxData
                        .cycleBalance()
                        .then((res) => {
                            if (res.err) {
                                item.cycleBalance = 'error';
                            } else {
                                item.cycleBalance = `${(Number(res.ok) / 1000000000000).toFixed(
                                    2,
                                )} T`;
                            }
                        })
                        .catch((err) => {
                            debug('metabox upgrade failed', err);
                        });
                });
                isLoading.value = false;
            } catch (err) {
                debug('failed', err);
                handleClose();
                isLoading.value = false;
                ElMessage.error(JSON.stringify(err));
            }
        };

        provide('metaboxLatestVer', metaboxLatestVer);

        onMounted(() => {
            init();
        });

        return {
            CONFIG,
            boxList,
            fileList,
            dialogVisible,
            isMetaBox,
            MetaListDom,
            isLoading,
            dataBoxApi,
            metaboxLatestVer,
            handleClose,
            afterClose,
            refreshList,
            refreshFileList,
            openFileList,
            back,
            insert,
            uploadFile,
            metaBoxUpgrade,
        };
    },
});
</script>

<style scoped lang="less">
.powerby {
    width: 100%;
    display: flex;
    .font-size(14);
    .margin(20, 0, 0, 0);
    justify-content: flex-end;

    img {
        .width(18);
        margin-right: 8px;
    }

    a {
        color: #066edc;
    }
}

.loading {
    @apply w-full py-4;

    img {
        @apply w-15 block mx-auto;
    }
}
</style>
