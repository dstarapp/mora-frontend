<template>
    <el-dialog v-model="dialogVisible"
        :show-close="store.state.current_planet_data && store.state.current_planet_data.lang !== ''"
        :before-close="handleClose" @closed="afterClose" class="w700" :title="$t('planetSettings.language.title')">
        <div class="tips" v-if="!localLang">
            <i class="iconfont icon-attention"></i>
            {{ $t('planetSettings.language.tip') }}
        </div>
        <div class="languagebox" :class="{
        noTop: localLang,
    }">
            <div class="lang" v-for="item in allLanguages" :key="item.id"
                :class="{ active: item.mark == currentChangeLanguage }" @click="changeLanguages(item)">
                {{ item.enName }}<span>({{ item.localName }})</span>
            </div>
        </div>
        <div class="mora-button">
            <div class="confirm" :class="{ loading: isLoading }" @click="setLanguages">
                <img src="@/assets/svg/loading.svg" v-if="isLoading" />
                {{ $t('planetSettings.language.confirm') }}
            </div>
        </div>
    </el-dialog>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, inject } from 'vue';
import { Languages } from '@/assets/config/language';
import { ElMessage } from 'element-plus';
import store from '@/store';
import { t } from '@/i18n';
import { detectLanguage } from '@/utils/functions';

export default defineComponent({
    name: 'Language',
    emits: ['componentClose'],
    props: {
        localLang: {
            type: String,
        },
    },
    setup(props, context) {
        const dialogVisible = ref(true);
        const allLanguages = ref(Languages());
        const browserLanguages = ref();
        const currentChangeLanguage = ref();
        const isLoading = ref(false);
        const planetCanister: any = inject('planetCanister', null);

        const handleClose = () => {
            if (store.state.current_planet_data && !store.state.current_planet_data.lang) {
                return;
            }
            dialogVisible.value = false;
        };

        const afterClose = () => {
            context.emit('componentClose');
        };

        const changeLanguages = (item) => {
            currentChangeLanguage.value = item.mark;
        };

        const setLanguages = async () => {
            if (isLoading.value) {
                return;
            }

            if (props.localLang) {
                localStorage.setItem('localLang', JSON.stringify(currentChangeLanguage.value));
                isLoading.value = false;
                store.commit('SET_LOCAL_LANG', currentChangeLanguage.value);
                handleClose();
                return;
            }
            isLoading.value = true;
            let languagesShorthand = currentChangeLanguage.value;
            let res = await planetCanister.value.setLang(languagesShorthand);
            if (res) {
                store.commit('SET_PLANET_LANGUAGES', languagesShorthand);
                isLoading.value = false;
                handleClose();
                ElMessage.success(t('planetSettings.language.setSuccess'));
            }
        };

        onMounted(() => {
            if (props.localLang) {
                for (let item of allLanguages.value) {
                    if (item.mark === props.localLang) {
                        browserLanguages.value = item.mark;
                        currentChangeLanguage.value = item.mark;
                        break;
                    }
                }
            } else if (store.state.current_planet_data && store.state.current_planet_data.lang) {
                for (let item of allLanguages.value) {
                    if (item.mark === store.state.current_planet_data.lang) {
                        browserLanguages.value = item.mark;
                        currentChangeLanguage.value = item.mark;
                        break;
                    }
                }
                return;
            } else {
                browserLanguages.value = detectLanguage();
                currentChangeLanguage.value = detectLanguage();
            }
        });

        return {
            store,
            dialogVisible,
            isLoading,
            allLanguages,
            currentChangeLanguage,
            browserLanguages,
            handleClose,
            afterClose,
            setLanguages,
            changeLanguages,
        };
    },
});
</script>

<style lang="less" scoped>
.tips {
    width: 100%;
    .font-size(14);
    .padding(10, 20, 10, 20);
    word-break: keep-all;
    word-wrap: break-word;
    text-align: left;
    background-color: @bg-color-body;
    color: @text-color-placeholder;
    @apply dark: (bg-dark-300);

    .border-radius(15);

    i {
        color: @text-color-placeholder;
        .margin(0, 8, 0, 0);
        @apply dark: (bg-dark-100);
    }

    .line-height(20);
}

.languagebox {
    width: 100%;
    .margin(20, 0, 0, 0);
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    max-height: 380px;
    overflow-y: auto;

    &.noTop {
        margin-top: 0;
    }

    .lang {
        width: 33.3%;
        .font-size(14);
        text-align: left;
        .border-radius(10);
        .padding(15, 15, 15, 15);
        .line-height(14);
        transition: @transition;
        color: @text-color;
        @apply dark: (text-light-900/80);

        &:hover {
            background-color: @bg-color-hover;
            @apply dark: (bg-dark-300);
            transition: @transition;
            cursor: pointer;
        }

        span {
            color: @text-fcolor;
            padding-left: 4px;
            .font-size(12);
        }

        &:last-child:nth-child(3n + 2) {
            margin-right: calc((100% - $width) / 2);
        }

        &.active {
            color: @text-active;
            font-weight: 500;

            span {
                color: @text-active;
            }
        }
    }
}

.mora-button {
    .margin(15, 0, 0, 0);
}

@media screen and (min-width: 0) and (max-width: 750px) {
    .tips {
        .padding(10, 20, 10, 20);
    }

    .languagebox {
        max-height: calc(100vh - 450px);

        .lang {
            width: 50%;

            span {
                display: block;
                padding-top: 4px;
                padding-left: 0;
            }
        }
    }
}
</style>
