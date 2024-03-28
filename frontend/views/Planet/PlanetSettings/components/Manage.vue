<template>
    <el-dialog :title="$t('planetSettings.writer.title')" v-model="dialogVisible" :before-close="handleClose"
        @closed="afterClose">
        <div class="flex items-center justify-between mb-3 px-9 <sm:(px-4)">
            <div class="tip">
                {{ $t('planetSettings.writer.tip') }}
            </div>
            <div class="addbtn" v-if="!isAdd && writerList.length < 3" @click="openAdd()">
                + {{ $t('planetSettings.writer.add') }}
            </div>
        </div>

        <div class="list">
            <div class="item" v-for="(item, index) in writerList" :key="index">
                <el-input :disabled="isLoading" v-model="writerList[index].pid"
                    :placeholder="$t('planetSettings.writer.placeholder')" @blur="checkInput(item, index)"
                    type="text" />
                <div class="btn" @click="remove(item)">
                    <i class="iconfont icon-decrease"></i>
                </div>
                <strong>{{ item.message }}</strong>
            </div>
        </div>

        <div class="mora-button">
            <div class="cancel" @click="cancel">
                {{ $t('planetSettings.writer.cancel') }}
            </div>
            <div class="confirm" :class="{ loading: isLoading }" @click="confirm">
                <img src="@/assets/svg/loading.svg" v-if="isLoading" />
                {{ $t('planetSettings.writer.confirm') }}
            </div>
        </div>
    </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, inject } from 'vue';
import { t } from '@/i18n';
import { ElMessage } from 'element-plus';
import store from '@/store';
import { Principal } from '@dfinity/principal';
import { isPrincipalString } from '@/utils/functions';
import { useRouter } from 'vue-router';
import debug from '@/utils/debug';

export default defineComponent({
    name: 'Updates',
    emits: ['componentClose'],
    props: {
        componentData: {
            type: Object || Array,
            default: [],
        },
    },
    setup(props, context) {
        const router = useRouter();
        const dialogVisible = ref(true);
        const writerList: any = ref([]);
        const isLoading = ref();
        const addData = ref();
        const isAdd = ref(false);

        const planetCanister: any = inject('planetCanister', null);

        const handleClose = () => {
            if (isLoading.value) {
                ElMessage.warning(t('planetSettings.writer.loading'));
                return;
            }
            dialogVisible.value = false;
        };

        const afterClose = () => {
            context.emit('componentClose');
        };

        const remove = (item) => {
            let idx = writerList.value.indexOf(item);
            writerList.value.splice(idx, 1);
        };

        const openAdd = () => {
            writerList.value.push({});
        };

        const unAdd = () => {
            isAdd.value = false;
            addData.value = '';
        };

        const cancel = () => {
            dialogVisible.value = false;
        };

        const confirm = async () => {
            isLoading.value = true;

            let res = writerList.value
                .map((item, index) => {
                    return checkInput(item, index);
                })
                .includes(false);

            if (!res) {
                let pidList = writerList.value.map((item) => {
                    return Principal.fromText(item.pid);
                });
                console.log(pidList);
                try {
                    let res = await planetCanister.value.setWriters(pidList);
                    if (res) {
                        ElMessage.success(t('planetSettings.writer.addSuccess'));
                        isLoading.value = false;
                        store.commit('SET_PLANET_WRITERS', pidList);
                        handleClose();
                    }
                } catch (err) {
                    debug('failed', err);
                    ElMessage.error(t('utils.noAccess'));
                    router.push('/rover/planet');
                }
            } else {
                isLoading.value = false;
            }
        };

        const checkInput = (item, index) => {
            if (!item.pid) {
                item.message = 'pid empty';
                return false;
            }

            if (!isPrincipalString(item.pid)) {
                item.message = 'pid error';
                return false;
            }

            let pidList: any[] = [];
            writerList.value.filter((item, idx) => {
                if (idx !== index) {
                    pidList.push(item.pid);
                }
            });

            if (~pidList.indexOf(item.pid)) {
                item.message = 'pid exist';
                return false;
            }

            item.message = '';
            return true;
        };

        onMounted(() => {
            writerList.value = props.componentData.map((item) => {
                return {
                    pid: item.toString(),
                    message: '',
                };
            });
        });

        return {
            dialogVisible,
            writerList,
            isLoading,
            addData,
            isAdd,
            checkInput,
            handleClose,
            afterClose,
            remove,
            unAdd,
            openAdd,
            cancel,
            confirm,
        };
    },
});
</script>

<style scoped lang="less">
:deep(.el-dialog) {
    .el-dialog__header {
        .margin(35, 0, 0, 0);
    }
}

.list {
    display: flex;
    flex-direction: column;
    .padding(0, 35, 0, 35);
    align-items: center;

    .btn {
        .width(60);
        .height(45);
        background: @bg-color-body-active;
        .border-radius(10);
        .center();
        cursor: pointer;
        .margin(0, 0, 0, 20);

        p {
            .font-size(18);
            color: #fff;
            margin-left: 5px;
        }

        .icon-decrease {
            .font-size(22);
            color: @text-color-inverse;
        }

        .icon-add {
            .font-size(17);
            color: @text-color-inverse;
        }
    }

    >.btn {
        margin: 0 auto;
        width: auto;
        min-width: auto;
        max-width: none;
        padding: 0 15px;
        background: none;

        p {
            color: @text-active;
        }
    }

    .item {
        display: flex;
        width: 100%;
        .margin(0, 0, 25, 0);
        position: relative;

        strong {
            position: absolute;
            bottom: -15px;
            left: 0;
            color: @color-error;
            font-size: 12px;
            line-height: 12px;
        }

        p {
            display: flex;
            flex: 1;
            background: @bg-color-grey;
            .border-radius(10);
            align-items: center;
            .padding(0, 0, 0, 16);
            .ellipsis();
        }

        :deep(.el-input) {
            // display: flex;
            flex: 1;

            .el-input__wrapper {
                .padding(0, 0, 0, 16);
                background: @bg-color-grey;
                .border-radius(10);
            }
        }

        &:last-child {
            .margin(0, 0, 0, 0);
        }
    }
}

.tip {
    font-style: normal;
    .font-size(16);
    color: @text-fcolor;
    text-align: left;
    flex: 1;
}

.addbtn {
    @apply ml-10 text-purple-500 cursor-pointer transition duration-300 hover:(text-purple-400 transition duration-300);
}

@media screen and (min-width: 0) and (max-width: 750px) {
    .list {
        padding: 0 15px;

        .item {
            .margin(5, 0, 20, 0);

            .btn {
                .width(100);
                .height(80);
            }
        }
    }
}
</style>
