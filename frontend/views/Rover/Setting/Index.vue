<template>
    <div class="setting">
        <h2>
            {{ $t('roverSetting.title') }}
        </h2>
        <div class="settingBox" translate="no">
            <div class="avatarBox">
                <Avatar :src="userData ? userData.avatar : ''" type="setting" />
            </div>
            <div class="createTime">
                {{ $t('roverSetting.create') }}
                {{
                userData.created
                    ? moment(userData.created).format('MMM Do YYYY, h:mm:ss a')
                    : ''
            }}
            </div>
            <div class="address">
                <p class="title">{{ $t('roverSetting.address') }}</p>
                <span>
                    <p>{{ userData ? userData.pid : '' }}</p>
                    <i @click="copy" class="iconfont icon-copy"></i>
                </span>
            </div>
            <div class="identity">
                <div>
                    <p class="title">{{ $t('roverSetting.web3.title') }}</p>
                    <el-skeleton class="remove" animated v-if="skeletonloading">
                        <template #template>
                            <el-skeleton-item variant="p" style="width: 25%; height: 70%" />
                        </template>
                    </el-skeleton>
                    <div class="remove" v-else>
                        <p>
                            {{
                userData.identity
                    ? userData.identity
                    : $t('roverSetting.web3.noIdentity')
            }}
                        </p>
                        <em @click="handleClick">{{
                userData.identity
                    ? $t('roverSetting.web3.change')
                    : $t('roverSetting.web3.add')
            }}</em>
                    </div>
                </div>
            </div>
            <div class="identity">
                <div>
                    <p class="title">{{ $t('roverSetting.theme.title') }}</p>

                    <div class="remove">
                        <p class="flex">
                            <el-switch v-model="siteMode" inline-prompt :active-text="$t('roverSetting.theme.t2')"
                                :inactive-text="$t('roverSetting.theme.t1')" @change="selectMode"
                                active-color="#806EF2" />
                        </p>
                    </div>
                </div>
            </div>
            <div class="clear">
                <p class="title">{{ $t('clear.title') }}</p>
                <div>
                    <el-button size="small" @click="clearCache">
                        <i class="iconfont icon-clear" />
                        {{ $t('roverSetting.clearCache') }}
                    </el-button>
                </div>
            </div>
        </div>
    </div>

    <Indentity v-if="isShowIndentity"
        :title="userData.identity ? $t('roverSetting.web3.change') : $t('roverSetting.web3.add')" :userData="userData"
        :nameList="nameList" @componentClose="componentClose" @setName="setName" />
    <ChooseLanguage v-if="isSetLang" :localLang="localLang" @componentClose="componentClose" />
    <Clear v-if="isClear" @close="clearCache" />
</template>

<script lang="ts">
import { defineComponent, onMounted, provide, ref, watch } from 'vue';
import { copyText } from '@/utils/functions';
import { Principal } from '@dfinity/principal';
import { Select } from '@element-plus/icons-vue';
import Avatar from '@/components/Avatar.vue';
import { ElMessage } from 'element-plus';
import Indentity from './component/Indentity.vue';
import store from '@/store';
import CONFIG from '@/assets/config';
import bus from 'vue3-eventbus';
import moment from 'moment';
import ChooseLanguage from '@/components/ChooseLanguage.vue';
import { createActor } from '@/request/agent';
import { idlFactory as icnamingFactory } from '@/request/canister/icnaming.did';
import { idlFactory as icnamingNameFactory } from '@/request/canister/icnamingName.did';
import Clear from './component/Clear.vue';

export default defineComponent({
    components: { Select, Avatar, Indentity, ChooseLanguage, Clear },
    name: 'Setting',
    setup() {
        const isEditor = ref(false);
        const userData: any = ref({});
        const steps = ref(0);
        const domainVal = ref();
        const domainError = ref(false);
        const updatesVal = ref();
        const isLoading = ref(false);
        const isFocus = ref(false);
        const isShowIndentity = ref(false);
        const skeletonloading = ref(true);
        const icnamingCanister = ref();
        const icnamingCanisterAnonymous = ref();
        const icnamingNameCanister = ref();
        const icnamingNameCanisterAnonymous = ref();
        const nameList = ref();
        const isSetLang = ref(false);
        const localLang = ref();
        const currentChangeLanguage = ref();
        const siteMode = ref(false);
        const isClear = ref(false);
        const selectMode = () => {
            store.dispatch('SWITCH_THEME');
        };

        const copy = () => {
            copyText(userData.value.pid.toString());
        };

        const handleClick = () => {
            isShowIndentity.value = true;
        };

        const componentClose = () => {
            isShowIndentity.value = false;
            if (isSetLang.value) {
                lang();
                isSetLang.value = false;
            }
        };

        const getData = () => {
            let getReverse = icnamingCanisterAnonymous.value.reverse_resolve_principal(
                Principal.fromText(store.state.user_principal),
            );
            let getName = icnamingNameCanisterAnonymous.value.get_names(
                Principal.fromText(store.state.user_principal),
                { offset: 0, limit: 1000 },
            );

            Promise.all([getReverse, getName]).then((res) => {
                let reverse = res[0].Ok[0];
                let list = res[1].Ok.items;
                userData.value.identity = reverse;
                nameList.value = list;
                skeletonloading.value = false;
                bus.emit('refreshEnd');
            });
        };

        const setName = async (item) => {
            if (!item && !userData.value.identity) {
                componentClose();
                return;
            }
            skeletonloading.value = true;
            let res = await icnamingCanister.value.set_record_value(
                item ? item.name : userData.value.identity,
                [
                    [
                        'settings.reverse_resolution.principal',
                        item ? userData.value.pid.toString() : '',
                    ],
                ],
            );
            if (res.Ok) {
                ElMessage({
                    message: 'Successfully',
                    type: 'success',
                });
                componentClose();
                getData();
            }
        };

        const lang = () => {
            localLang.value = store.state.local_lang;
            currentChangeLanguage.value = store.state.local_lang;
        };

        const clearCache = () => {
            isClear.value = !isClear.value;
        };

        // init
        const init = async () => {
            skeletonloading.value = true;
            icnamingCanisterAnonymous.value = createActor(CONFIG.icnamingId, icnamingFactory);
            icnamingNameCanisterAnonymous.value = createActor(
                CONFIG.getIcnamingName,
                icnamingNameFactory,
            );
            getData();
            icnamingCanister.value = await createActor(
                CONFIG.icnamingId,
                icnamingFactory,
                store.state.agent,
            );
            icnamingNameCanister.value = await createActor(
                CONFIG.getIcnamingName,
                icnamingNameFactory,
                store.state.agent,
            );

            lang();
        };

        watch(
            () => store.state.user_data,
            (val: any) => {
                if (val) {
                    userData.value = val;
                    init();
                }
            },
        );

        onMounted(() => {
            let data: any = store.state.user_data;
            if (data) {
                userData.value = data;
            }

            if (store.state.agent) {
                init();
            }

            if (store.state.theme == 'dark') {
                siteMode.value = true;
            } else {
                siteMode.value = false;
            }
        });

        provide('icnamingNameCanister', icnamingNameCanister);
        provide('getData', getData);
        provide('planetCanister', false);

        return {
            userData,
            isEditor,
            steps,
            domainVal,
            updatesVal,
            isLoading,
            isFocus,
            domainError,
            store,
            isShowIndentity,
            skeletonloading,
            isClear,
            nameList,
            moment,
            isSetLang,
            localLang,
            currentChangeLanguage,
            siteMode,
            copy,
            handleClick,
            componentClose,
            setName,
            selectMode,
            clearCache,
        };
    },
});
</script>

<style scoped lang="less">
.setting {
    display: flex;
    flex-direction: column;
    width: 100%;

    h2 {
        display: flex;
        align-items: center;
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
            margin-left: auto;
            cursor: pointer;

            &.refresh {
                transition: @transition;
                transform: rotate(180deg);
            }
        }
    }

    .settingBox {
        .center();
        flex-direction: column;
        width: 100%;

        .createTime {
            width: 100%;
            .padding(20, 0, 10, 0);
            text-align: center;
            .font-size(16);
            color: @text-fcolor;
            @apply dark:(text-light-900/60);
        }

        .avatarBox {
            .center();
            border: 1px solid @border-color;
            border-radius: 50%;
            position: relative;
            cursor: pointer;
            .height(100);
            .width(100);
            .margin(24, 0, 0, 0);
            @apply dark:(border-dark-100);
        }
    }

    .address {
        .center();
        width: 100%;
        .margin(57, 0, 0, 0);

        .title {
            display: flex;
            font-style: normal;
            font-weight: 400;
            .font-size(16);
            color: @text-color;
            .width(180);
            @apply dark:(text-light-900/80);
        }

        span {
            display: flex;
            flex: 1;

            p {
                display: flex;
                flex: 1;
                word-break: break-work;
                .font-size(14);
                color: @text-fcolor;
                .margin(0, 10, 0, 0);
                align-items: center;
                @apply dark:(text-light-900/60);
            }

            i {
                .center();
                width: 32px;
                height: 32px;
                color: @text-color-grey;
                border: 2px solid @border-color;
                .font-size(16);
                .border-radius(8);
                cursor: pointer;
                transition: @transition;
                @apply dark:(border-dark-100);

                &:hover {
                    transition: @transition;
                    border-color: @bg-color-body-active;
                    color: @text-active;
                }

                @media screen and (min-width: 751px) and (max-width: 1240px) {
                    .border-radius(8);
                }
            }
        }

        @media screen and (min-width: 0) and (max-width: 750px) {
            flex-direction: column;
            align-items: flex-start;

            span {
                .margin(10, 0, 0, 0);
            }
        }
    }

    .clear {
        .center();
        width: 100%;
        .margin(57, 0, 0, 0);

        .title {
            display: flex;
            font-style: normal;
            font-weight: 400;
            .font-size(16);
            color: @text-color;
            .width(180);
            @apply dark:(text-light-900/80);
        }

        div {
            display: flex;
            flex: 1;

            :deep(.el-button) {
                height: 35px !important;
                border-color: @text-active;
                color: @text-active;
                border-radius: 8px;

                span {
                    color: @text-active;
                }

                i {
                    font-size: 18px;
                    color: @text-active;
                    margin-right: 5px;
                }

                &:hover {
                    background: none;
                    opacity: 0.8;

                    i {
                        color: @text-active;
                    }
                }
            }
        }

        @media screen and (min-width: 0) and (max-width: 750px) {
            flex-direction: column;
            align-items: flex-start;

            div {
                .margin(10, 0, 0, 0);
            }
        }
    }

    .identity {
        // display: flex;
        width: 100%;
        .margin(57, 0, 0, 0);
        position: relative;

        div {
            width: 100%;
            display: flex;
            justify-content: space-between;

            .title {
                font-style: normal;
                font-weight: 400;
                .font-size(16);
                color: @text-color;
                .width(180);
                @apply dark:(text-light-900/80);
            }

            .remove,
            .editor {
                .center();
                flex: 1;
                justify-content: space-between;
                position: relative;

                p {
                    font-style: normal;
                    font-weight: 400;
                    .font-size(16);
                    .line-height(19);
                    color: @text-fcolor;
                    @apply dark:(text-light-900/60);

                    span {
                        display: block;
                        .font-size(14);
                        color: @text-color-grey;
                        opacity: 0.6;
                        .padding(5, 20, 0, 0);
                        @apply dark:(text-light-900/60);
                    }
                }

                em {
                    font-style: normal;
                    font-weight: 400;
                    .line-height(19);
                    .font-size(16);
                    color: @text-active;
                    cursor: pointer;
                }

                &.editor {
                    justify-content: flex-end;
                }
            }

            :deep(.remove) {
                .el-switch {
                    width: auto;
                    height: auto;

                    .el-switch__core {
                        .el-switch__inner {
                            .is-text {
                                @apply px-1 text-gray-500 dark:(text-white);
                            }
                        }
                    }
                }
            }
        }

        @media screen and (min-width: 0) and (max-width: 750px) {
            div {
                flex-wrap: wrap;
                flex-direction: column;

                .title {
                    width: 100%;
                }

                .remove {
                    width: 100%;
                    display: flex;
                    flex-direction: row;
                    .margin(10, 0, 0, 0);

                    p {
                        flex: 1;

                        span {
                            .padding(10, 0, 0, 0);
                        }
                    }
                }
            }
        }
    }

    .bindingBox {
        .center();
        width: 100%;

        >p {
            .width(180);
        }

        .binding {
            .center();
            flex: 1;
            justify-content: flex-start;
            .margin(20, 0, 0, 30);
            flex-direction: column;

            .steps {
                display: flex;
                width: 100%;
                align-items: center;

                em {
                    .center();
                    width: 32px;
                    height: 32px;
                    border: 2px solid @border-color;
                    border-radius: 50%;
                    font-style: normal;
                    font-weight: 400;
                    color: @text-fcolor;
                    overflow: hidden;

                    i {
                        display: flex;
                        width: 100%;
                        height: 100%;
                        background: #fff;
                        .center();
                        font-style: normal;
                        .font-size(16);
                        color: @text-fcolor;
                    }

                    svg {
                        width: 20px;
                        height: 20px;
                    }

                    &.current {
                        color: @text-active;
                        border-color: @border-color-active;

                        i {
                            color: @text-active;
                        }
                    }

                    &.complete {
                        color: @text-complete;
                        border-color: @bg-color-body-complete;

                        i {
                            color: @text-complete;
                        }
                    }
                }

                i {
                    display: flex;
                    flex: 1;
                    height: 2px;
                    background: @border-color;
                }
            }

            .link {
                display: flex;
                width: 100%;
                flex-direction: column;

                a {
                    font-style: normal;
                    font-weight: 400;
                    .line-height(23);
                    .font-size(14);
                    color: @text-fcolor;
                    .margin(25, 0, 0, 0);
                }

                span {
                    .center();
                    background: #f6f6f6;
                    .border-radius(15);
                    .padding(8, 18, 8, 18);
                    .margin(8, 0, 8, 0);

                    p {
                        display: flex;
                        flex: 1;
                        word-break: break-work;
                        .font-size(14);
                        .line-height(22);
                        color: @text-fcolor;
                        .margin(0, 10, 0, 0);
                        align-items: center;
                    }

                    i {
                        .center();
                        .height(30);
                        .width(30);
                        color: @text-color-grey;
                        border: 2px solid @border-color;
                        .font-size(16);
                        .border-radius(10);
                        cursor: pointer;
                        transition: @transition;

                        &:hover {
                            transition: @transition;
                            border-color: @bg-color-body-active;
                            color: @text-active;
                        }

                        @media screen and (min-width: 751px) and (max-width: 1240px) {
                            .border-radius(8);
                        }
                    }
                }
            }

            .domain {
                display: flex;
                width: 100%;
                flex-direction: column;
                .margin(25, 0, 0, 0);

                p {
                    font-style: normal;
                    font-weight: 400;
                    .font-size(14);
                    .line-height(23);
                    color: @text-fcolor;
                }

                .el-input {
                    .margin(10, 0, 0, 0);
                    .height(45);
                    background: @text-color-inverse;
                    border: 2px solid @bg-color-body-active;
                    box-shadow: 0px 0px 8px rgba(128, 110, 242, 0.4);
                    .border-radius(12);

                    @media screen and (min-width: 0) and (max-width: 750px) {
                        .height(90);
                        .margin(15, 0, 10, 0);
                    }

                    @media screen and (min-width: 751px) and (max-width: 1240px) {
                        .height(60);
                        .margin(15, 0, 10, 0);
                    }
                }
            }

            .save {
                display: flex;
                width: 100%;
                .margin(25, 0, 0, 0);

                p,
                em {
                    font-style: normal;
                    font-weight: 400;
                    .font-size(16);
                    .line-height(19);
                    color: @text-fcolor;
                }

                strong {
                    display: flex;
                    font-style: normal;
                    font-weight: 400;
                    .font-size(16);
                    color: @text-active;
                    cursor: pointer;
                    margin-left: auto;
                }

                p {
                    .margin(0, 5, 0, 0);
                }
            }

            .domainError {
                display: flex;
                width: 100%;
                .margin(25, 0, 0, 0);

                p,
                em {
                    font-style: normal;
                    font-weight: 400;
                    .font-size(16);
                    .line-height(19);
                    color: @color-error;
                }

                strong {
                    display: flex;
                    font-style: normal;
                    font-weight: 400;
                    .font-size(16);
                    color: @text-active;
                    cursor: pointer;
                    .margin(0, 0, 0, 20);
                }

                p {
                    .margin(0, 5, 0, 0);
                }
            }

            .tip {
                display: flex;
                width: 100%;
                .margin(10, 0, 0, 0);

                p {
                    display: flex;
                    flex: 1;
                }

                em {
                    display: flex;
                    font-style: normal;
                    font-weight: 400;
                    .font-size(16);
                    color: @text-active;
                    cursor: pointer;
                }
            }
        }

        @media screen and (min-width: 0) and (max-width: 750px) {
            flex-direction: column;

            .binding {
                width: 100%;
                .margin(20, 0, 0, 0);
            }
        }
    }

    .email {
        // .center();
        display: flex;

        width: 100%;
        .margin(57, 0, 0, 0);

        .title {
            display: flex;
            font-style: normal;
            font-weight: 400;
            .font-size(16);
            color: @text-color;
            .width(180);
            .height(45);
            align-items: center;

            @media screen and (min-width: 0) and (max-width: 750px) {
                height: auto;
                min-height: auto;
                max-height: none;
            }

            @media screen and (min-width: 751px) and (max-width: 1240px) {
                .height(60);
            }
        }

        >div {
            display: flex;
            flex-direction: column;
            flex: 1;

            @media screen and (min-width: 0) and (max-width: 750px) {
                width: 100%;
            }

            .el-input {
                display: flex;
                width: 100%;
                background: @bg-color-grey;
                border: 2px solid @bg-color-grey;
                .height(45);
                .border-radius(12);
                transition: @transition;

                &.active {
                    background-color: @bg-color;
                    border: 2px solid @text-active;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    transition: @transition;
                }

                @media screen and (min-width: 0) and (max-width: 750px) {
                    .height(90);
                }

                @media screen and (min-width: 751px) and (max-width: 1240px) {
                    .height(60);
                }
            }

            span {
                display: flex;
                width: 100%;
                .margin(20, 0, 0, 0);

                .el-switch {
                    margin-top: 0;
                }

                i {
                    .center();
                    font-style: normal;
                    font-weight: 400;
                    .font-size(14);
                    .line-height(17);
                    color: @text-fcolor;
                    .margin(0, 16, 0, 8);
                }

                em {
                    display: flex;
                    align-items: center;
                    flex: 1;
                    font-style: normal;
                    font-weight: 400;
                    .font-size(14);
                    .line-height(17);
                    color: @text-color-placeholder;
                }
            }
        }

        @media screen and (min-width: 0) and (max-width: 750px) {
            flex-direction: column;
            align-items: flex-start;

            div {
                .margin(10, 0, 0, 0);
            }
        }
    }

    .saveBtn {
        .center();
        .width(300);
        .height(60);
        background: @bg-color-body-active;
        .border-radius(15);
        font-style: normal;
        font-weight: 400;
        .font-size(18);
        text-align: center;
        color: @bg-color;
        cursor: pointer;
        .margin(70, 0, 0, 0);
        transition: @transition;

        &:hover {
            opacity: 0.8;
            transition: @transition;
        }

        &.loading {
            opacity: 0.6;
            color: @text-color-inverse;
            cursor: not-allowed;
            transition: @transition;

            img {
                .margin(0, 10, 0, 0);
                .height(24);
            }
        }

        @media screen and (min-width: 0) and (max-width: 750px) {
            width: 100%;
            max-width: 100%;
            .height(100);
        }
    }

    .mora-button {
        display: flex;
        .padding(0, 50, 0, 50);
        .margin(30, 0, 0, 0);

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
        }

        .cancel {
            .margin(0, 30, 0, 0);
            border: 1px solid @border-color;
            color: @text-fcolor;
        }

        .confirm {
            background: @bg-color-body-active;
            color: @text-color-inverse;

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
</style>
