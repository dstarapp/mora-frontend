<template>
    <el-dialog v-model="dialogVisible" :title="$t('home.setLang.title')" :before-close="handleClose"
        @closed="afterClose">
        <div class="setLangBox">
            <el-checkbox-group :min="1" v-model="checkedLangs" @change="handleCheckedLangChange">
                <el-checkbox v-for="item in allLanguages" :key="item.id" :label="item.mark">
                    {{ item.localName }}
                </el-checkbox>
            </el-checkbox-group>
            <el-checkbox v-model="checkAll" :indeterminate="isIndeterminate" @change="handleCheckAllChange"
                class="mt-5">
                {{ $t('home.setLang.checkAll') }}
            </el-checkbox>
        </div>
        <div class="mora-button">
            <div class="cancel" @click="cancel">
                {{ $t('home.setLang.cancel') }}
            </div>
            <div class="confirm" @click="confirm">
                {{ $t('home.setLang.confirm') }}
            </div>
        </div>
    </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { Languages } from '@/assets/config/language';
import store from '@/store';

export default defineComponent({
    name: 'SetLang',
    emits: ['componentClose', 'listInit'],
    props: {
        insertCallback: { type: Function },
    },
    components: {},
    setup(props, context) {
        const dialogVisible = ref(true);
        const allLanguages = ref(Languages());
        const checkAll = ref(false);
        const isIndeterminate = ref(true);
        const checkedLangs = ref<string[]>([]);

        const handleClose = () => {
            dialogVisible.value = false;
        };

        const afterClose = () => {
            context.emit('componentClose');
        };

        const handleCheckAllChange = (val: boolean) => {
            let arr: string[] = [];
            if (val) {
                arr = allLanguages.value.map((item) => item.mark);
            }
            checkedLangs.value = arr;
            isIndeterminate.value = false;
        };

        const handleCheckedLangChange = (value: string[]) => {
            const checkedCount = value.length;
            checkAll.value = checkedCount === allLanguages.value.length;
            isIndeterminate.value = checkedCount > 0 && checkedCount < allLanguages.value.length;
        };

        const cancel = () => {
            dialogVisible.value = false;
        };

        const confirm = () => {
            let str = checkedLangs.value.toString();
            store.commit('SET_LOCAL_LANG', str);
            context.emit('listInit');
            dialogVisible.value = false;
        };

        onMounted(() => {
            let local_lang: any = store.state.local_lang;
            if (local_lang) {
                local_lang = local_lang.split(',');
            } else {
                local_lang = ['en'];
            }
            if (local_lang.length === allLanguages.value.length) {
                checkAll.value = true;
            }
            checkedLangs.value = local_lang;
        });

        return {
            dialogVisible,
            allLanguages,
            checkAll,
            isIndeterminate,
            checkedLangs,
            Languages,
            handleClose,
            afterClose,
            handleCheckAllChange,
            handleCheckedLangChange,
            cancel,
            confirm,
        };
    },
});
</script>

<style scoped lang="less">
.setLangBox {
    @apply flex flex-col px-5 <sm:(px-3);
    display: flex;
    flex-direction: column;

    :deep(.el-checkbox-group) {
        @apply grid grid-cols-2;

        .el-checkbox__label {
            @apply !text-dark-50/80 dark:( !text-light-900/60) font-normal;
        }

        .el-checkbox {
            width: auto;
            float: left;
            margin-top: 15px;

            &.is-checked {
                .el-checkbox__label {
                    @apply !text-black dark:( !text-light-900);
                }

                .el-checkbox__input {
                    .el-checkbox__inner {
                        @apply dark:(bg-purple-500 border-purple-500);

                        &::after {
                            @apply !border-white;
                        }
                    }
                }
            }

            &.is-disabled {
                .el-checkbox__input {
                    .el-checkbox__inner {
                        &::after {
                            @apply border-light-50/50;
                        }
                    }
                }
            }

            .el-checkbox__input {
                .el-checkbox__inner {
                    @apply dark:(bg-dark-100 border-dark-100);

                    &::after {
                        @apply dark:(border-light-50/50);
                    }
                }
            }
        }
    }

    :deep(.el-checkbox) {
        .el-checkbox__input {
            &.is-indeterminate {
                .el-checkbox__inner {
                    &::before {
                        top: 7px;
                    }
                }
            }

            .el-checkbox__inner {
                @apply dark:(bg-dark-100 border-dark-100);

                &::after {
                    @apply dark:(border-light-50/50);
                }
            }
        }

        &.is-checked {
            .el-checkbox__label {
                @apply text-purple-500 dark:(text-purple-500);
            }

            .el-checkbox__input {
                .el-checkbox__inner {
                    @apply dark:(bg-purple-500 border-purple-500);

                    &::after {
                        @apply !border-white;
                    }
                }
            }
        }

        .el-checkbox__label {
            @apply text-purple-500;
        }
    }
}

.mora-button {
    @apply px-5;
}
</style>
