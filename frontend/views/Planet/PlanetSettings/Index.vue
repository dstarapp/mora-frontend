<template>
    <div class="planetSettings">
        <Skeleton v-if="!userData" />

        <div class="left" v-else>
            <h2>{{ $t('planetSettings.title') }}</h2>
            <div class="avatarBox">
                <Avatar :src="userData.avatar" type="planetSettings" />
            </div>
            <div class="from">
                <div class="item">
                    <div class="label">
                        {{ $t('planetSettings.from.name') }}
                    </div>
                    <div class="m">
                        <div class="inputBox" translate="no">
                            <template v-if="currentEdit === 'name'">
                                <el-input
                                    v-focus
                                    v-model="currentEditData"
                                    autofocus
                                    maxlength="20"
                                    :placeholder="$t('planetSettings.fromPlaceholder.name')"
                                    show-word-limit
                                    type="text"
                                    @blur="inputBlur"
                                    @keydown.enter="save('name')"
                                />
                                <div class="save-button">
                                    <div
                                        class="save"
                                        :class="{ loading: isLoadingEdit }"
                                        @click.stop="save('name')"
                                    >
                                        <img src="@/assets/svg/loading.svg" v-if="isLoadingEdit" />
                                        {{ $t('planetSettings.save') }}
                                    </div>
                                </div>
                            </template>
                            <p class="name" v-else>{{ userData.name }}</p>
                        </div>
                        <div
                            class="edit"
                            @click="edit('name')"
                            v-if="!currentEdit || currentEdit !== 'name'"
                        >
                            {{ $t('planetSettings.edit') }}
                        </div>
                    </div>
                </div>
                <div class="item">
                    <div class="label">
                        {{ $t('planetSettings.from.profile') }}
                    </div>
                    <div class="m">
                        <div class="textareaBox" translate="no">
                            <template v-if="currentEdit === 'profile'">
                                <el-input
                                    v-focus
                                    v-model="currentEditData"
                                    @blur="inputBlur"
                                    autofocus
                                    maxlength="200"
                                    :placeholder="$t('planetSettings.fromPlaceholder.profile')"
                                    show-word-limit
                                    type="textarea"
                                    :autosize="{ minRows: 1, maxRows: 5 }"
                                    @keydown.enter="save('profile')"
                                />
                                <div class="save-button">
                                    <div
                                        class="save"
                                        :class="{ loading: isLoadingEdit }"
                                        @click="save('profile')"
                                    >
                                        <img src="@/assets/svg/loading.svg" v-if="isLoadingEdit" />
                                        {{ $t('planetSettings.save') }}
                                    </div>
                                </div>
                            </template>
                            <p v-else>{{ userData.desc }}</p>
                        </div>
                        <div
                            class="edit"
                            @click="edit('profile')"
                            v-if="!currentEdit || currentEdit !== 'profile'"
                        >
                            {{ $t('planetSettings.edit') }}
                        </div>
                    </div>
                </div>
                <div class="item">
                    <div class="label">
                        {{ $t('planetSettings.from.cover') }}
                    </div>
                    <div class="m">
                        <CoverPicture :src="userData.cover" />
                    </div>
                </div>
                <div class="item">
                    <div class="label">
                        {{ $t('planetSettings.from.twitter') }}
                    </div>
                    <div class="m">
                        <div class="inputBox blue" translate="no">
                            <template v-if="currentEdit === 'twitter'">
                                <el-input
                                    v-focus
                                    v-model="currentEditData"
                                    autofocus
                                    :placeholder="$t('planetSettings.fromPlaceholder.twitter')"
                                    show-word-limit
                                    type="text"
                                    @blur="inputBlur()"
                                    @keydown.enter="save('twitter')"
                                />
                                <div class="save-button">
                                    <div
                                        class="save"
                                        :class="{ loading: isLoadingEdit }"
                                        @click="save('twitter')"
                                    >
                                        <img src="@/assets/svg/loading.svg" v-if="isLoadingEdit" />
                                        {{ $t('planetSettings.save') }}
                                    </div>
                                </div>
                            </template>
                            <p v-else>{{ userData.twitter }}</p>
                        </div>
                        <div
                            class="edit"
                            @click="edit('twitter')"
                            v-if="!currentEdit || currentEdit !== 'twitter'"
                        >
                            {{ $t('planetSettings.edit') }}
                        </div>
                    </div>
                </div>
                <!-- domain -->
                <div class="item">
                    <div class="label">
                        {{ $t('planetSettings.from.domain') }}
                    </div>
                    <div class="m">
                        <div class="inputBox" translate="no">
                            <template v-if="currentEdit === 'url'">
                                <el-input
                                    v-focus
                                    v-model="currentEditData"
                                    autofocus
                                    :placeholder="$t('planetSettings.fromPlaceholder.domain')"
                                    show-word-limit
                                    type="text"
                                    @blur="inputBlur"
                                    @keydown.enter="save('url')"
                                />
                                <div class="save-button">
                                    <div
                                        class="save"
                                        :class="{ loading: isLoadingEdit }"
                                        @click="save('url')"
                                    >
                                        <img src="@/assets/svg/loading.svg" v-if="isLoadingEdit" />
                                        {{ $t('planetSettings.save') }}
                                    </div>
                                </div>
                            </template>
                            <p v-else>{{ userData.url }}</p>
                        </div>
                        <div
                            class="edit"
                            v-if="!currentEdit || currentEdit !== 'url'"
                            @click="edit('url')"
                        >
                            {{ $t('planetSettings.edit') }}
                        </div>
                    </div>
                </div>
                <div class="item">
                    <div class="label">
                        {{ $t('planetSettings.from.writer') }}
                    </div>
                    <div class="m t" translate="no">
                        <div class="writerBox">
                            <p>{{ !userData.writers ? 0 : userData.writers.length }}</p>
                        </div>
                        <div class="edit" @click="manage()">
                            {{ $t('planetSettings.manage') }}
                        </div>
                    </div>
                </div>

                <div class="item">
                    <div class="label">
                        {{ $t('planetSettings.from.owner') }}
                    </div>
                    <div class="m aifs" translate="no">
                        <div class="textBox">
                            <p>
                                {{ userData.owner ? userData.owner.toString() : '' }}
                            </p>
                        </div>
                        <div class="edit" @click="change('owner')">
                            {{ $t('planetSettings.change') }}
                        </div>
                    </div>
                </div>

                <div class="item">
                    <div class="label"> Recover </div>
                    <div class="m aifs" translate="no">
                        <div class="textBox">
                            <p>
                                {{ recover }}
                            </p>
                        </div>
                        <div class="edit" @click="setRecover">
                            {{ $t('planetSettings.change') }}
                        </div>
                    </div>
                </div>

                <div class="item">
                    <div class="label">
                        {{ $t('planetSettings.from.language') }}
                    </div>
                    <div class="m t" translate="no">
                        <div class="textBox">{{ getLang(userData.lang) }}</div>
                        <div class="edit" @click="selectLanguage()">
                            {{ $t('planetSettings.set') }}
                        </div>
                    </div>
                </div>
                <div class="item">
                    <div class="label">
                        {{ $t('planetSettings.from.index') }}
                    </div>
                    <div class="m t">
                        <div class="index">
                            <div class="switch">
                                <el-switch
                                    @change="isIndexChange"
                                    v-model="isIndex"
                                    active-color="#806EF2"
                                />
                            </div>
                            <p>{{ $t('planetSettings.indextips') }}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="subscription">
                <h3>{{ $t('planetSettings.subscription.title') }}</h3>
                <div class="list" translate="no">
                    <div class="item" v-for="(item, index) in userData.subprices" :key="index">
                        <div class="select">
                            <el-select
                                :teleported="false"
                                @visible-change="selectGenerate($event, item)"
                                @change="selectChange($event, item, index)"
                                v-model="Object.keys(item.subType)[0]"
                                placeholder="Select"
                            >
                                <el-option
                                    v-for="childItem in selectList"
                                    :key="childItem"
                                    :label="Object.keys(childItem.subType)[0]"
                                    :value="childItem"
                                />
                            </el-select>
                        </div>
                        <div class="priceBox">
                            <div
                                class="price"
                                :class="{
                                    disable: Object.keys(item.subType)[0] === 'Free',
                                    edit: editIndex === index,
                                }"
                                @click="subscriptionEdit(item, index)"
                            >
                                <template v-if="editIndex === index">
                                    <em>$</em>
                                    <el-input-number
                                        v-focus
                                        @blur="priceInputBlur(item)"
                                        @keydown.enter="priceInputBlur(item)"
                                        type="number"
                                        :max="100000"
                                        :controls="false"
                                        v-model="item.price"
                                    />
                                </template>
                                <template v-else>
                                    <em>$</em>
                                    <p>{{ item.price }}</p>
                                </template>
                            </div>
                        </div>
                        <div
                            v-if="
                                !(userData.subprices.length - 1 <= index) ||
                                userData.subprices.length === CONFIG.subscriptionWay.length - 1
                            "
                            class="btn"
                            @click="remove(index)"
                        >
                            <i class="iconfont icon-decrease"></i>
                        </div>
                        <div v-else class="btn" @click="add()">
                            <i class="iconfont icon-add"></i>
                        </div>
                    </div>
                </div>
                <div class="confirm-button">
                    <div
                        :class="{
                            loading: saveLoading,
                        }"
                        @click="subscriptionSave"
                    >
                        <img src="@/assets/svg/loading.svg" v-if="saveLoading" />
                        {{ $t('planetSettings.subscription.confirm') }}
                    </div>
                </div>
            </div>
        </div>

        <div class="rightBox">
            <div class="right">
                <h4>{{ $t('planetSettings.right.title') }}</h4>
                <el-skeleton v-if="store.state.current_planet_cycles_balance === null" animated>
                    <template #template>
                        <el-skeleton-item
                            style="width: 60%; margin-top: 20px; height: 30px"
                            variant="p"
                        />
                    </template>
                </el-skeleton>
                <p translate="no" v-else>{{ store.state.current_planet_cycles_balance }} T</p>

                <div class="mora-button">
                    <div class="addCycles" @click="addCycles">
                        {{ $t('planetSettings.right.addCycles') }}
                    </div>
                </div>
            </div>
        </div>
    </div>

    <component :is="isComponent" :componentData="componentData" @componentClose="componentClose" />
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch, inject } from 'vue';
import Avatar from '@/components/Avatar.vue';
import ChangeOwner from './components/ChangeOwner.vue';
import ChangeRecover from './components/ChangeRecover.vue';
import Manage from './components/Manage.vue';
import AddCycles from '@/components/AddCycles.vue';
import { ElMessage } from 'element-plus';
import CONFIG from '@/assets/config';
import { t } from '@/i18n';
import CoverPicture from './components/CoverPicture.vue';
import store from '@/store';
import _ from 'lodash';
import debug from '@/utils/debug';
import Skeleton from './components/Skeleton.vue';
import { Languages } from '@/assets/config/language';
import { useRouter } from 'vue-router';
import ChooseLanguage from '@/components/ChooseLanguage.vue';

export default defineComponent({
    components: {
        Avatar,
        Manage,
        AddCycles,
        ChangeOwner,
        CoverPicture,
        Skeleton,
        ChooseLanguage,
        ChangeRecover,
    },
    name: 'PlanetSettings',
    setup() {
        const router = useRouter();
        const isLoadingEdit = ref(false);
        const userData: any = ref({});
        const currentEdit = ref();
        const currentEditData = ref();
        const isComponent = ref();
        const componentData = ref();
        const editIndex = ref();
        const selectList = ref();
        const selectValue = ref();
        const planetCanister: any = inject('planetCanister', null);
        const freeData = [
            {
                price: 0,
                subType: {
                    Free: null,
                },
            },
        ];
        const isIndex = ref(true);
        const saveLoading = ref(false);

        const edit = (type) => {
            if (currentEdit.value) {
                return;
            }
            if (type === 'name') {
                currentEditData.value = userData.value.name;
            }
            if (type === 'profile') {
                currentEditData.value = userData.value.desc;
            }
            if (type === 'twitter') {
                currentEditData.value = userData.value.twitter;
            }
            if (type === 'url') {
                currentEditData.value = userData.value.url;
            }
            currentEdit.value = type;
        };

        const inputBlur = () => {
            setTimeout(() => {
                if (!isLoadingEdit.value) {
                    isLoadingEdit.value = false;
                    currentEdit.value = '';
                    currentEditData.value = '';
                } else {
                    save(currentEdit.value);
                }
            }, 300);
        };

        let saveTimeOut = 0;
        const save = async (type) => {
            if (saveTimeOut) {
                return;
            }
            saveTimeOut = 1;
            if (!currentEditData.value && type !== 'twitter') {
                if (type === 'name') {
                    ElMessage.error(t('planetSettings.fromPlaceholder.name'));
                }
                if (type === 'profile') {
                    ElMessage.error(t('planetSettings.fromPlaceholder.profile'));
                }
                saveTimeOut = 0;
                return;
            }

            if (
                type === 'twitter' &&
                currentEditData.value &&
                !currentEditData.value.includes('https://twitter.com')
            ) {
                ElMessage.error(t('planetSettings.fromPlaceholder.twitterError'));
                saveTimeOut = 0;
                return;
            }

            const _saveSuccess = () => {
                if (currentEdit.value) {
                    isLoadingEdit.value = false;
                    currentEdit.value = '';
                    currentEditData.value = '';
                    saveTimeOut = 0;
                    ElMessage.success(t('planetSettings.saveSuccess'));
                }
            };

            isLoadingEdit.value = true;
            if (type === 'url') {
                try {
                    const res = await planetCanister.value.setCustomUrl(currentEditData.value);
                    if (res) {
                        userData.value.url = currentEditData.value;
                        store.commit('SET_PLANET_DOMAIN', userData.value.url);
                        _saveSuccess();
                    }
                } catch (err) {
                    debug('failed', err);
                    ElMessage.error(t('utils.noAccess'));
                    router.push('/rover/planet');
                }
            }

            if (type === 'name') {
                try {
                    const res = await planetCanister.value.setName(currentEditData.value);
                    if (res) {
                        userData.value.name = currentEditData.value;
                        store.commit('SET_PLANET_NAME', userData.value.name);
                        _saveSuccess();
                    }
                } catch (err) {
                    debug('failed', err);
                    ElMessage.error(t('utils.noAccess'));
                    router.push('/rover/planet');
                }
            }

            if (type === 'profile') {
                try {
                    const res = await planetCanister.value.setDesc(currentEditData.value);
                    if (res) {
                        userData.value.desc = currentEditData.value;
                        store.commit('SET_PLANET_DESC', userData.value.desc);
                        _saveSuccess();
                    }
                } catch (err) {
                    debug('failed', err);
                    ElMessage.error(t('utils.noAccess'));
                    router.push('/rover/planet');
                }
            }

            if (type === 'twitter') {
                try {
                    userData.value.twitter = currentEditData.value;
                    const res = await planetCanister.value.setTwitter(currentEditData.value);
                    if (res) {
                        userData.value.twitter = currentEditData.value;
                        store.commit('SET_PLANET_TWITTER', userData.value.twitter);
                        _saveSuccess();
                    }
                } catch (err) {
                    debug('failed', err);
                    ElMessage.error(t('utils.noAccess'));
                    router.push('/rover/planet');
                }
            }
        };

        const componentClose = () => {
            if (isComponent.value === 'ChangeRecover') {
                getRecoverOwner();
            }
            isComponent.value = undefined;
        };

        const manage = () => {
            componentData.value = userData.value.writers ? userData.value.writers : [];
            isComponent.value = 'Manage';
        };

        const change = (type) => {
            componentData.value = type;
            isComponent.value = 'ChangeOwner';
        };

        const addCycles = () => {
            isComponent.value = 'AddCycles';
        };

        const subscriptionEdit = (item, index) => {
            if (Object.keys(item.subType)[0] === 'Free') {
                ElMessage.warning(t('planetSettings.subscription.priceFreeEdit'));
                return;
            }
            editIndex.value = index;
        };

        const selectGenerate = (event, item) => {
            selectList.value = [];
            const id = userData.value.subprices.map((i) => Object.keys(i.subType)[0]);
            const arr = _.difference(CONFIG.subscriptionWay, id);
            const arrObj = arr.map((item) => {
                return {
                    price: 0,
                    subType: {
                        [item]: null,
                    },
                };
            });
            selectList.value = arrObj;
        };

        const selectChange = (event, item, index) => {
            const nArr: any = [];
            const cur = userData.value.subprices[index];
            const nKey = Object.keys(event.subType)[0];
            if (nKey === 'Free') {
                userData.value.subprices = freeData;
                return;
            }

            userData.value.subprices.map((item) => {
                if (Object.keys(item.subType)[0] === Object.keys(cur.subType)[0]) {
                    nArr.push({
                        price: 0,
                        subType: {
                            [nKey]: null,
                        },
                    });
                } else {
                    nArr.push(item);
                }
            });
            userData.value.subprices = nArr;
        };

        const remove = (index) => {
            userData.value.subprices.splice(index, 1);
        };

        const add = () => {
            let isFree = false;
            userData.value.subprices.forEach((item) => {
                const key = Object.keys(item.subType)[0];
                if (key === 'Free') {
                    isFree = true;
                }
            });
            if (isFree) {
                ElMessage.warning(t('planetSettings.subscription.addFree'));
                return;
            }

            let str;
            const id = userData.value.subprices.map((i) => Object.keys(i.subType)[0]);
            for (const i of CONFIG.subscriptionWay) {
                if (!id.includes(i) && i !== 'Free') {
                    str = i;
                    break;
                }
            }
            if (!str) {
                ElMessage.warning(t('planetSettings.subscription.addError'));
                return;
            }

            userData.value.subprices.push({
                price: 0,
                subType: {
                    [str]: null,
                },
            });
        };

        const priceInputBlur = (item) => {
            item.price = parseFloat(item.price);
            editIndex.value = '';
        };

        const getPrice = (item) => {
            return item.price;
        };

        const subscriptionSave = async () => {
            if (saveLoading.value) {
                return;
            }
            let _isFree = false;
            let str = JSON.parse(JSON.stringify(userData.value.subprices)).map((item) => {
                if (Object.keys(item.subType)[0] === 'Free') {
                    _isFree = true;
                }
                item.price = Math.trunc(item.price * 10000);
                return item;
            });
            if (_isFree) {
                str = [];
            }
            saveLoading.value = true;
            try {
                const res = await planetCanister.value.setSubPrices(str);
                if (res) {
                    saveLoading.value = false;
                    ElMessage.success(t('planetSettings.subscription.saveSuccess'));
                }
            } catch (err) {
                debug('failed', err);
                ElMessage.error(t('utils.noAccess'));
                router.push('/rover/planet');
            }
        };

        const isIndexChange = async () => {
            try {
                await planetCanister.value.setCanIndex(isIndex.value);
            } catch (err) {
                debug('failed', err);
                ElMessage.error(t('utils.noAccess'));
                router.push('/rover/planet');
            }
        };

        const init = async () => {
            isIndex.value = userData.value.canindex;
            if (!userData.value.subprices.length) {
                userData.value.subprices = freeData;
            } else {
                userData.value.subprices.map((item) => {
                    item.price = Number(item.price.toString());
                });
            }

            getRecoverOwner();
        };

        const getRecoverOwner = async () => {
            try {
                const res = await planetCanister.value.getRecoverOwner();
                if (res.length) {
                    recover.value = res[0];
                }
            } catch (err) {
                console.log(err);
            }
        };

        const recover = ref();
        const setRecover = () => {
            componentData.value = recover.value;
            isComponent.value = 'ChangeRecover';
        };

        const getLang = (value) => {
            let lang = '';
            Languages().map((item) => {
                if (item.mark === userData.value.lang) {
                    lang = item.localName;
                }
            });

            return lang ? lang : Languages()[0].localName;
        };

        watch(
            () => store.state.current_planet_data,
            (val: any) => {
                if (val) {
                    userData.value = store.state.current_planet_data;
                    init();
                }
            },
        );

        onMounted(() => {
            userData.value = store.state.current_planet_data;
            if (userData.value) {
                init();
            }
        });

        const selectLanguage = () => {
            isComponent.value = 'ChooseLanguage';
        };

        return {
            isLoadingEdit,
            userData,
            currentEdit,
            currentEditData,
            isComponent,
            componentData,
            editIndex,
            selectList,
            selectValue,
            CONFIG,
            store,
            isIndex,
            saveLoading,
            recover,
            subscriptionSave,
            priceInputBlur,
            selectGenerate,
            selectChange,
            subscriptionEdit,
            componentClose,
            manage,
            change,
            addCycles,
            remove,
            add,
            inputBlur,
            setRecover,
            save,
            edit,
            getPrice,
            selectLanguage,
            getLang,
            isIndexChange,
        };
    },
});
</script>

<style scoped lang="less">
@import './components/left.less';

.planetSettings {
    display: flex;
    width: 90%;
    max-width: 1512px;
    margin: 20px auto;
    justify-content: flex-start;

    .rightBox {
        display: flex;
        .width(360);
        flex-shrink: 0;
        .margin(0, 0, 0, 40);

        .right {
            display: flex;
            .width(360);
            flex-direction: column;
            background: @bg-color;
            .border-radius(25);
            .padding(42, 30, 47, 30);
            position: fixed;
            @apply dark:(bg-dark-600);

            h4 {
                font-style: normal;
                font-weight: 400;
                .font-size(16);
                .line-height(19);
                margin-top: 0;
                color: @text-fcolor;
                @apply dark:(text-light-900/80);
            }

            p {
                font-style: normal;
                font-weight: 700;
                .font-size(32);
                .line-height(39);
                .padding(20, 0, 0, 0);
                color: @text-color;
                @apply dark:(text-light-900);
            }

            .mora-button {
                display: flex;
                .margin(30, 0, 0, 0);
                .padding(0, 0, 0, 0);
                width: 100%;

                div {
                    .border-radius(15);
                    .center();
                    .height(60);
                    min-height: 60px;
                    flex: 1;
                    font-style: normal;
                    font-weight: 350;
                    .font-size(18);
                    .line-height(22);
                    cursor: pointer;
                    transition: @transition;
                }

                .addCycles {
                    background: @bg-color-body-active;
                    color: @text-color-inverse;
                    transition: @transition;

                    &:hover {
                        cursor: pointer;
                        opacity: 0.85;
                        box-shadow: 0 0 15px rgba(128, 110, 242, 0.5);
                        transition: @transition;
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
    }
}

@media screen and (min-width: 0) and (max-width: 750px) {
    .planetSettings {
        flex-direction: column;
        width: 100%;
        margin: 0;

        .rightBox {
            display: none;
        }
    }

    :deep(.el-select) {
        .el-input {
            .el-input__wrapper {
                .border-radius(10);
                .padding(16, 8, 16, 8);
            }
        }
    }
}

@media screen and (min-width: 750px) and (max-width: 1240px) {
    .planetSettings {
        .rightBox {
            .right {
                p {
                    .font-size(22);
                }
            }
        }
    }
}
</style>
