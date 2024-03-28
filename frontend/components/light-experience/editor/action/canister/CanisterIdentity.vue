<script lang="ts" setup>
import { PropType, ref, watch, inject, computed } from 'vue';
import { ActionValues } from '../../../types/common/value';
import { CanisterAction } from '../../../types/parts/canisters';
import { v4 as uuid } from 'uuid';
import { checkIdentity } from '../../../types/common/checks';
import ExportIdentityDialogVue from './identity/ExportIdentityDialog.vue';
import ImportIdentityDialogVue from './identity/ImportIdentityDialog.vue';
import { t } from '@/i18n';

const props = defineProps({
    values: {
        type: Object as PropType<ActionValues>,
        required: true,
    },
    action: {
        type: Object as PropType<CanisterAction>,
        required: true,
    },
});

const refreshActions = inject<() => void>('ACTIONS_REFRESH')!;

const findExportedValue = inject<(name: string, id: string) => any>('FIND_EXPORTED_VALUE')!;

const collapse = ref(false);

const identityList = [
    {
        label: 'Anonymous',
        value: 'anonymous',
    },
    {
        label: 'Mora or Login',
        value: 'host-login',
    },
    {
        label: 'Import',
        value: 'inner',
    },
];
const identity = ref<'anonymous' | 'host-login' | 'inner'>(props.action.identity.from);
const exportedId = ref<string>(props.action.identity.id ? props.action.identity.id : uuid());
const exportedName = ref<string>(props.action.identity.name ?? '');
const importedId = ref<string>(props.action.identity.id ?? '');

const importedName = computed(() => checkIdentity(importedId.value, props.values));

const onComplete = () => {
    switch (identity.value) {
        case 'anonymous':
            props.action.identity = { from: 'anonymous' };
            break;
        case 'host-login':
            if (
                exportedName.value &&
                findExportedValue(exportedName.value, exportedId.value) === undefined
            ) {
                props.action.identity = {
                    from: 'host-login',
                    id: exportedId.value,
                    name: exportedName.value,
                };
            } else {
                props.action.identity = { from: 'host-login', id: '', name: '' };
            }
            break;
        case 'inner':
            if (importedId.value && importedName.value) {
                props.action.identity = { from: 'inner', id: importedId.value };
            } else {
                props.action.identity = { from: 'inner', id: '' };
            }
    }

    refreshActions();
};

watch(
    () => [identity.value, exportedId.value, exportedName.value, importedId.value],
    () => onComplete(),
    { immediate: true },
);

watch(
    () => identity.value,
    () => {
        switch (identity.value) {
            case 'host-login':
                // if (!exportedName.value) onExportIdentity();
                break;
            case 'inner':
                if (!importedName.value) onImportIdentity();
                break;
        }
    },
);

const exportedDialogShow = ref(false);
const onExportIdentity = () => (exportedDialogShow.value = true);
const onExportComplete = (name: string | undefined) => {
    exportedDialogShow.value = false;
    if (name !== undefined) {
        exportedName.value = name;
    }
};

const importedDialogShow = ref(false);
const onImportIdentity = () => (importedDialogShow.value = true);
const onImportComplete = (id: string | undefined) => {
    importedDialogShow.value = false;
    if (id !== undefined) {
        importedId.value = id;
    }
};
</script>

<template>
    <div class="title2">
        <div class="left">
            {{ t('plugin.actionEditor.identity') }}
        </div>
        <div class="right">
            <i
                @click="collapse = !collapse"
                class="iconfont"
                :class="{
                    'icon-plugin-aup': !collapse,
                    'icon-plugin-adown': collapse,
                }"
            ></i>
        </div>
    </div>
    <div class="box" :class="{ hide: collapse }">
        <div class="item">
            <el-select v-model="identity" :placeholder="t('plugin.actionEditor.chooseMethod')">
                <el-option
                    v-for="item in identityList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                />
            </el-select>
            <template v-if="identity === 'host-login'">
                <div class="exported">
                    <!-- <span v-if="exportedName">{{ exportedName }}</span> -->
                    <span class="exported-button" @click="onExportIdentity">
                        <i class="iconfont icon-plugin-export"></i>
                    </span>
                </div>
            </template>
            <template v-else-if="identity === 'inner'">
                <div class="exported">
                    <span class="import-button" @click="onImportIdentity">
                        <i class="iconfont icon-plugin-add"></i>
                    </span>
                </div>
            </template>
        </div>
        <div class="exported-name" v-if="exportedName && identity === 'host-login'">
            {{ 'Export Identity' }}: {{ exportedName }}
        </div>
        <div class="imported-name" v-if="importedName && identity === 'inner'">
            {{ t('plugin.actionEditor.selectIdentity') }}: {{ importedName }}
        </div>
    </div>
    <template v-if="exportedDialogShow">
        <ExportIdentityDialogVue
            :show="exportedDialogShow"
            :id="exportedId"
            :name="exportedName"
            @complete="onExportComplete"
        />
    </template>
    <template v-if="importedDialogShow">
        <ImportIdentityDialogVue
            :show="importedDialogShow"
            :values="props.values"
            :id="exportedId"
            @complete="onImportComplete"
        />
    </template>
</template>

<style lang="less" scoped>
.box {
    display: flex;
    flex-direction: column;
    width: 100%;
    overflow: hidden;
    height: 70px;
    transition: @transition;

    .item {
        margin: 0 16px;
        display: flex;
        position: relative;
        align-items: center;

        :deep(.el-select) {
            flex: 1;

            .el-input {
                .el-input__wrapper {
                    padding: 0 11px;
                    border-width: 1px;
                    border-radius: 8px;

                    &:hover {
                        border-color: #34d399;
                        background-color: #fff;
                    }

                    .el-input__inner {
                        text-align: left;
                        height: 34px !important;
                        font-size: 14px;
                        color: #000000;
                        @apply dark: (text-light-900/80);
                    }
                }

                &.is-focus {
                    .el-input__wrapper {
                        border-color: #34d399;
                    }
                }
            }
        }

        .icon-plugin-export,
        .icon-plugin-add {
            font-size: 16px;
            color: #4c4f6b;
            margin-left: 16px;
            cursor: pointer;
            @apply dark: (text-light-900/60);
        }
    }

    .exported-name {
        font-size: 12px;
        color: #999999;
        margin-left: 16px;
        margin-top: 5px;
        padding-bottom: 10px;
    }

    .imported-name {
        font-size: 12px;
        color: #999999;
        margin-left: 16px;
        margin-top: 5px;
    }

    &.hide {
        height: 0px;
        transition: @transition;
    }
}
</style>
