<template>
    <el-dialog v-model="dialogVisible" :title="$t('articleCategory.title')" :before-close="handleClose"
        @closed="afterClose">
        <div class="articleCategory">
            <div class="listBox">
                <el-collapse accordion>
                    <el-collapse-item :disabled="isEdit || isAdd || isChildEdit || isAddCategory"
                        v-for="(item, index) in categoryList" :key="item.name" :name="item.name">
                        <template #title>
                            <div class="editing" v-if="isEdit && editName === item.name">
                                <el-input v-model="editInput" @keydown.enter="editConfirm"
                                    :placeholder="$t('articleCategory.editorPlaceholder')" />
                                <span class="editBtn">
                                    <em @click.stop="editConfirm">
                                        {{ $t('articleCategory.confirm') }}
                                    </em>
                                    <em @click.stop="editCancel">
                                        {{ $t('articleCategory.cancel') }}
                                    </em>
                                </span>
                            </div>
                            <div :id="item.name" class="title" v-else>
                                <p>{{ item.name }}</p>
                                <span class="btn">
                                    <i @click.stop="sort('up', categoryList, index, index === 0)"
                                        :class="{ disabled: index === 0 }" class="iconfont icon-category-arrow-up" />
                                    <i @click.stop="
        sort(
            'down',
            categoryList,
            index,
            index === categoryList.length - 1,
        )
        " :class="{ disabled: index === categoryList.length - 1 }"
                                        class="iconfont icon-category-arrow-down" />
                                    <em @click.stop="add(item)">
                                        {{ $t('articleCategory.itemBtn.add') }}
                                    </em>
                                    <em @click.stop="edit(item)">
                                        {{ $t('articleCategory.itemBtn.edit') }}
                                    </em>
                                    <em @click.stop="deletes(item)">
                                        {{ $t('articleCategory.itemBtn.delete') }}
                                    </em>
                                </span>
                            </div>
                        </template>
                        <div class="childBox">
                            <div class="child" v-for="(child, index) in item.children" :key="index">
                                <div class="editing" v-if="isChildEdit &&
        item.name === editName &&
        child.name === editChildName
        ">
                                    <el-input v-model="editInput" @keydown.enter="editChildConfirm"
                                        :placeholder="$t('articleCategory.editorPlaceholder')" />
                                    <span class="editBtn">
                                        <em @click.stop="editChildConfirm(item, child)">
                                            {{ $t('articleCategory.confirm') }}
                                        </em>
                                        <em @click.stop="editChildCancel">{{
        $t('articleCategory.cancel')
    }}</em>
                                    </span>
                                </div>
                                <div class="render" v-else>
                                    <p>- {{ child.name }}</p>
                                    <span class="btn">
                                        <i @click.stop="
        sort('up', item.children, index, index === 0)
        " :class="{ disabled: index === 0 }"
                                            class="iconfont icon-category-arrow-up" />
                                        <i @click.stop="
        sort(
            'down',
            item.children,
            index,
            index === item.children.length - 1,
        )
        " :class="{
        disabled: index === item.children.length - 1,
    }" class="iconfont icon-category-arrow-down" />
                                        <em @click.stop="editChild(item, child)">
                                            {{ $t('articleCategory.itemBtn.edit') }}
                                        </em>
                                        <em @click.stop="deletesChild(item, child)">
                                            {{ $t('articleCategory.itemBtn.delete') }}
                                        </em>
                                    </span>
                                </div>
                            </div>
                            <div class="editing" v-if="isAdd">
                                <el-input v-model="addInput" @keydown.enter="addChildConfirm"
                                    :placeholder="$t('articleCategory.addPlaceholder')" />
                                <span class="editBtn">
                                    <em @click.stop="addChildConfirm">
                                        {{ $t('articleCategory.confirm') }}
                                    </em>
                                    <em @click.stop="addChildCancel">
                                        {{ $t('articleCategory.cancel') }}
                                    </em>
                                </span>
                            </div>
                        </div>
                    </el-collapse-item>
                </el-collapse>
            </div>

            <div class="editing" v-if="isAddCategory">
                <el-input v-model="addInput" @keydown.enter="addCategoryConfirm"
                    :placeholder="$t('articleCategory.editorPlaceholder')" />
                <span class="editBtn">
                    <em @click.stop="addCategoryConfirm">{{ $t('articleCategory.confirm') }}</em>
                    <em @click.stop="addCategoryCancel">{{ $t('articleCategory.cancel') }}</em>
                </span>
            </div>
            <div class="addBtn" @click="addCategory"> + {{ $t('articleCategory.addBtn') }} </div>

            <div class="mora-button" @click="saveCategory">
                <div class="confirm" :class="{
        loading: isLoading,
    }">
                    <img src="@/assets/svg/loading.svg" v-if="isLoading" />
                    {{ $t('articleCategory.saveBtn') }}
                </div>
            </div>
        </div>
    </el-dialog>
</template>

<script lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus';
import { t } from '@/i18n';
import { defineComponent, onMounted, ref, inject } from 'vue';
import store from '@/store';
import { deepCopy } from '@/utils/functions';

export default defineComponent({
    name: 'ArticleCategory',
    emits: ['articleCategoryClose'],
    setup(props, context) {
        const dialogVisible = ref(true);
        const categoryList: any = ref([]);
        const categoryListOld: any = ref([]);
        const openChild = ref();
        const editLabel = ref();
        const editChildLabel = ref();
        const isEdit = ref(false);
        const editName = ref();
        const isAdd = ref(false);
        const addName = ref();
        const isChildEdit = ref(false);
        const editChildName = ref();
        const isAddCategory = ref(false);
        const editInput = ref();
        const addInput = ref();
        const isEditGlobal = ref(false);
        const isLoading = ref();

        const planetCanister: any = inject('planetCanister', null);
        const getPlanetInfo: any = inject('getPlanetInfo', null);

        const handleClose = () => {
            if (isLoading.value) {
                ElMessage.warning(t('articleCategory.await'));
                return;
            }
            if (isEditGlobal.value) {
                ElMessageBox.confirm(
                    t('articleCategory.closeMessage.content'),
                    t('articleCategory.closeMessage.title'),
                    {
                        confirmButtonText: t('articleCategory.closeMessage.confirm'),
                        cancelButtonText: t('articleCategory.closeMessage.cancel'),
                        type: 'warning',
                    },
                )
                    .then(() => {
                        dialogVisible.value = false;
                        store.commit('SET_PLANET_CATEGORYS', categoryListOld.value);
                    })
                    .catch(() => { });
            } else {
                dialogVisible.value = false;
            }
        };
        const afterClose = () => {
            context.emit('articleCategoryClose');
        };

        const add = (item) => {
            if (isEdit.value || isAdd.value || isChildEdit.value || isAddCategory.value) {
                ElMessage.error(t('articleCategory.editorIng'));
                return false;
            }
            addInput.value = '';
            isAdd.value = true;
            addName.value = item.name;
            let dom = document?.getElementById(item.name);
            let classList: HTMLElement = dom?.parentNode?.className;
            if (!~classList?.indexOf('is-active')) {
                dom?.click();
            }
        };

        const addChildConfirm = () => {
            if (!addInput.value) {
                ElMessage.error(t('articleCategory.addPlaceholder'));
                return false;
            }
            categoryList.value.map((item) => {
                if (item.name === addName.value) {
                    if (!item.children) {
                        item.children = [];
                    }
                    let isThere = false;
                    for (let l of item.children) {
                        if (l.name === addInput.value) {
                            isThere = true;
                        }
                    }
                    if (isThere) {
                        ElMessage.error(t('articleCategory.isThere'));
                        return;
                    }
                    isEditGlobal.value = true;
                    isAdd.value = false;
                    item.children.push({
                        id: 0,
                        name: addInput.value,
                        children: [],
                    });
                    addName.value = '';
                }
            });
        };

        const addChildCancel = () => {
            isAdd.value = false;
            addName.value = '';
        };
        const edit = (item) => {
            if (isEdit.value || isAdd.value || isChildEdit.value || isAddCategory.value) {
                ElMessage.error(t('articleCategory.editorIng'));
                return false;
            }
            editName.value = item.name;
            editInput.value = item.name;
            isEdit.value = true;
        };

        const editConfirm = () => {
            if (!editInput.value) {
                ElMessage.error(t('articleCategory.editorPlaceholder'));
                return false;
            }
            let isThere = false;
            categoryList.value.map((i) => {
                if (i.name === editInput.value) {
                    isThere = true;
                }
            });
            if (isThere) {
                ElMessage.error(t('articleCategory.isThere'));
                return;
            }

            isEditGlobal.value = true;
            let oldVal = editName.value;
            editName.value = '';
            isEdit.value = false;
            let val = editInput.value;
            editInput.value = '';
            categoryList.value.map((item, idx) => {
                if (item.name === oldVal) {
                    categoryList.value[idx].name = val;
                }
            });
        };

        const editCancel = () => {
            editName.value = '';
            editInput.value = '';
            isEdit.value = false;
        };

        const deletes = (str) => {
            ElMessageBox.confirm(
                t('articleCategory.deleteMessage.content'),
                t('articleCategory.deleteMessage.title'),
                {
                    confirmButtonText: t('articleCategory.deleteMessage.confirm'),
                    cancelButtonText: t('articleCategory.deleteMessage.cancel'),
                    type: 'warning',
                },
            )
                .then(() => {
                    if (isEdit.value || isAdd.value || isChildEdit.value || isAddCategory.value) {
                        ElMessage.error(t('articleCategory.editorPlaceholder'));
                        return false;
                    }
                    isEditGlobal.value = true;
                    categoryList.value.map((item, idx) => {
                        if (item.name === str.name) {
                            categoryList.value.splice(idx, 1);
                        }
                    });
                })
                .catch(() => { });
        };

        const editChild = (item, child) => {
            if (isEdit.value || isAdd.value || isChildEdit.value || isAddCategory.value) {
                ElMessage.error(t('articleCategory.editorPlaceholder'));
                return false;
            }

            isChildEdit.value = true;
            editName.value = item.name;
            editChildName.value = child.name;
            editInput.value = child.name;
        };

        const editChildConfirm = (item, child) => {
            if (!editInput.value) {
                ElMessage.error(t('articleCategory.editorPlaceholder'));
                return false;
            }
            isEditGlobal.value = true;
            let isThere = false;
            categoryList.value.map((i) => {
                if (i.name === item.name) {
                    for (let l of item.children) {
                        if (l.name === editInput.value) {
                            isThere = true;
                        }
                    }
                    if (isThere) {
                        return;
                    }
                    i.children.map((i2, idx) => {
                        if (i2.name === child.name) {
                            i.children[idx].name = editInput.value;
                        }
                    });
                }
            });
            if (isThere) {
                ElMessage.error(t('articleCategory.isThere'));
                return;
            }
            isChildEdit.value = false;
            editName.value = '';
            editChildName.value = '';
            editInput.value = '';
        };

        const editChildCancel = () => {
            isChildEdit.value = false;
            editName.value = '';
            editChildName.value = '';
            editInput.value = '';
        };

        const deletesChild = (item, child) => {
            ElMessageBox.confirm(
                t('articleCategory.deleteMessage.content'),
                t('articleCategory.deleteMessage.title'),
                {
                    confirmButtonText: t('articleCategory.deleteMessage.confirm'),
                    cancelButtonText: t('articleCategory.deleteMessage.cancel'),
                    type: 'warning',
                },
            )
                .then(() => {
                    if (isEdit.value || isAdd.value || isChildEdit.value || isAddCategory.value) {
                        ElMessage.error(t('articleCategory.editorPlaceholder'));
                        return false;
                    }
                    isEditGlobal.value = true;
                    categoryList.value.map((i) => {
                        if (i.name === item.name) {
                            i.children.map((i2, idx) => {
                                if (i2.name === child.name) {
                                    i.children.splice(idx, 1);
                                }
                            });
                        }
                    });
                })
                .catch(() => { });
        };

        const saveCategory = async () => {
            if (!planetCanister || !planetCanister.value) {
                return;
            }
            if (isEdit.value || isAdd.value || isChildEdit.value || isAddCategory.value) {
                ElMessage.error(t('articleCategory.editorPlaceholder'));
                return false;
            }
            isLoading.value = true;
            let res = await planetCanister.value.setCategorys(categoryList.value);
            if (res) {
                ElMessage.success(t('articleCategory.saveSuccess'));
                isEditGlobal.value = false;
                await getPlanetInfo();
                isLoading.value = false;
                handleClose();
            }
        };

        const addCategory = () => {
            if (isAdd.value) {
                ElMessage.error(t('articleCategory.editorIng'));
                return;
            }
            addInput.value = '';
            isAddCategory.value = true;
        };

        const addCategoryConfirm = () => {
            if (!addInput.value) {
                ElMessage.error(t('articleCategory.addPlaceholder'));
                return false;
            }
            let isThere = false;
            categoryList.value.map((i) => {
                if (i.name === addInput.value) {
                    isThere = true;
                }
            });
            if (isThere) {
                ElMessage.error(t('articleCategory.isThere'));
                return;
            }

            isEditGlobal.value = true;
            categoryList.value.push({
                id: 0,
                name: addInput.value,
                children: [],
            });
            isAddCategory.value = false;
            addInput.value = '';
        };

        const addCategoryCancel = () => {
            isAddCategory.value = false;
            addInput.value = '';
        };

        const swap = (array, first, second) => {
            let tmp = array[second];
            array[second] = array[first];
            array[first] = tmp;
            return array;
        };

        const sort = (type, item, idx, idDisabled) => {
            if (idDisabled) {
                return;
            }

            if (type === 'up') {
                swap(item, idx, idx - 1);
            }

            if (type === 'down') {
                swap(item, idx, idx + 1);
            }
        };

        onMounted(() => {

            let categorysList: any = store.state.current_planet_data;
            if (categorysList && categorysList.categorys.length) {
                categoryList.value = categorysList.categorys;
                categoryListOld.value = deepCopy(categorysList.categorys);
            }
        });

        return {
            dialogVisible,
            categoryList,
            editLabel,
            editChildLabel,
            openChild,
            editInput,
            addInput,
            isEdit,
            isAdd,
            addName,
            editName,
            isChildEdit,
            editChildName,
            isLoading,
            isAddCategory,
            sort,
            addCategoryConfirm,
            addCategoryCancel,
            handleClose,
            afterClose,
            add,
            edit,
            deletes,
            editChild,
            deletesChild,
            editCancel,
            editConfirm,
            saveCategory,
            addChildConfirm,
            addChildCancel,
            editChildConfirm,
            editChildCancel,
            addCategory,
        };
    },
});
</script>

<style lang="less" scoped>
.articleCategory {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    padding: 0 20px;

    .listBox {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        width: 100%;

        :deep(.el-collapse) {
            width: 100%;
            border-top: none;

            .el-collapse-item {
                .el-collapse-item__wrap {
                    border-bottom: 1px solid @border-color;
                    @apply dark:(border-dark-100);

                    .el-collapse-item__content {
                        padding-bottom: 0;
                    }
                }

                .el-collapse-item__arrow {
                    display: none;
                }

                .el-collapse-item__header.focusing:focus {
                    color: @text-active;
                }

                .el-collapse-item__header {
                    height: 53px;
                }

                &:first-child {
                    border-top: none;

                    .el-collapse-item__header {
                        border-top: none;
                    }
                }

                &.is-disabled {
                    .el-collapse-item__header.focusing:focus {
                        color: #c0c4cc;
                    }

                    .childBox {
                        .child {
                            p {
                                color: #c0c4cc !important;
                            }
                        }
                    }
                }
            }

            .title {
                display: flex;
                justify-content: space-between;
                width: 100%;
                align-items: center;

                p {
                    display: flex;
                    flex: 1;
                    line-height: 52px;
                    cursor: pointer;
                    font-size: 14px;
                }

                .el-input {
                    display: flex;
                    flex: 1;
                    line-height: 52px;
                    cursor: pointer;
                }
            }

            .childBox {
                display: flex;
                flex-direction: column;
                max-height: 30vh;
                overflow-y: scroll;

                .child {
                    display: flex;
                    height: 53px;
                    border-bottom: 1px solid @border-color;
                    align-items: center;
                    margin-left: 22px;

                    .render {
                        display: flex;
                        width: 100%;
                        height: 53px;
                        align-items: center;

                        p {
                            display: flex;
                            font-style: normal;
                            font-weight: 400;
                            font-size: 14px;
                            flex: 1;
                        }
                    }

                    .editing {
                        width: 100%;
                    }

                    &:last-child {
                        border-bottom: none;
                    }
                }

                .editing {
                    flex: none;
                }
            }

            .btn {
                display: flex;
                height: 53px;
                justify-content: center;
                align-items: center;

                i {
                    font-size: 12px;
                    color: #806ef2;
                    margin-left: 10px;
                    cursor: pointer;

                    &.disabled {
                        color: #cccccc;
                    }
                }

                em {
                    cursor: pointer;
                    line-height: 52px;
                    font-style: normal;
                    font-weight: 400;
                    font-size: 14px;
                    line-height: 17px;
                    color: #806ef2;
                    padding-left: 10px;
                }
            }
        }
    }

    .editing {
        display: flex;
        flex: 1;
        background: @bg-color-grey;
        border-radius: 10px;
        height: 45px;
        margin: 4px 0;
        @apply dark:(bg-dark-300);

        .el-input {
            display: flex;
            flex: 1;
        }

        .editBtn {
            display: flex;
            margin-right: 12px;

            em {
                cursor: pointer;
                line-height: 52px;
                font-style: normal;
                font-weight: 400;
                font-size: 14px;
                line-height: 17px;
                color: @text-active;
                display: flex;
                justify-content: center;
                align-items: center;

                &:last-child {
                    margin-left: 10px;
                    color: @text-color-grey;

                    &::before {
                        content: '';
                        width: 1px;
                        height: 13px;
                        margin: 0 10px;
                        background: #ddd;
                    }
                }
            }
        }
    }

    >.editing {
        width: 100%;
        flex: none;
    }

    .addBtn {
        font-weight: 400;
        font-size: 16px;
        line-height: 19px;
        margin-top: 25px;
        color: #806ef2;
        cursor: pointer;
    }

    .mora-button {
        justify-content: center;
        display: flex;
        width: 100%;
        .padding(0, 50, 0, 50);
        .margin(25, 0, 0, 0);

        div {
            .border-radius(10);
            .center();
            .height(45);
            min-height: 45px;
            flex: 1;
            font-style: normal;
            font-weight: 350;
            .font-size(16);
            .line-height(19);
            cursor: pointer;
            transition: @transition;
            background: @bg-color-body-active;
            color: @text-color-inverse;

            &.disable {
                background: @bg-color-body-disable;
                color: @bg-color;
                cursor: not-allowed;
            }

            &.loading {
                transition: @transition;
                background: @bg-color-body-loading;
            }

            img {
                .margin(0, 5, 0, 0);
            }
        }
    }
}

@media screen and (min-width: 0) and (max-width: 750px) {
    .articleCategory {
        .mora-button {
            .padding(0, 0, 0, 0);

            div {
                .height(90);
            }
        }
    }
}
</style>
