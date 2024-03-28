<template>
    <div class="settings">
        <h3>{{ $t('editor.settings.title') }}</h3>
        <div class="item source">
            <p>{{ $t('editor.settings.source.name') }}</p>
            <div class="part">
                <el-select v-model="sourceValue" :placeholder="$t('editor.settings.source.selectPlaceholder')"
                    :teleported="false">
                    <el-option v-for="item in source" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <input v-if="sourceValue === 'Reproduced'" type="text" v-model="sourceLink"
                    :placeholder="$t('editor.settings.source.linkPlaceholder')" class="soureinput" />
            </div>
        </div>
        <div class="item category">
            <p>{{ $t('editor.settings.category.name') }}</p>
            <div class="part">
                <el-select v-model="category" @change="categoryChange"
                    :placeholder="$t('editor.settings.category.selectPlaceholder')" :teleported="false">
                    <el-option v-for="item in categoryList" :key="item.name" :label="item.name"
                        :value="item.id.toString()" />
                </el-select>
                <el-select v-if="optionsChild && optionsChild.length" v-model="categoryChild"
                    @change="categoryChildChange" :teleported="false"
                    :placeholder="$t('editor.settings.category.selectPlaceholder')">
                    <el-option v-for="item in optionsChild" :key="item.name" :label="item.name"
                        :value="item.id.toString()" />
                </el-select>

                <div class="edit" @click="categoryEdit" v-if="isWriters">
                    {{ $t('editor.settings.category.edit') }}
                </div>
            </div>
        </div>
        <div class="item coverImage">
            <p>{{ $t('editor.settings.cover.name') }}</p>
            <div class="part">
                <div class="avatar-uploader">
                    <el-upload :class="{ hover: cover }" :multiple="false" v-loading="isUploadLoading" action=""
                        :show-file-list="false" :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload"
                        :http-request="uploadFile">
                        <template v-if="cover">
                            <img :src="getImagesUrl(cover)" />
                            <span @click.stop="cover = ''">
                                <i class="iconfont icon-delete"></i>
                            </span>
                        </template>
                        <el-icon v-else class="avatar-uploader-icon">
                            <i class="iconfont icon-add"></i>
                        </el-icon>
                        <template #tip>
                            <div class="el-upload__fromArticle" @click="fromArticle">
                                {{ $t('editor.settings.cover.fromArticle') }}
                            </div>
                            <div class="el-upload__tip">
                                {{ $t('editor.settings.cover.tips') }}
                            </div>
                        </template>
                    </el-upload>
                </div>
            </div>
        </div>
        <div class="item tags">
            <p>{{ $t('editor.settings.tags.name') }}</p>
            <div class="part">
                <el-tag v-for="tag in tags" :key="tag" closable :disable-transitions="false" @close="handleClose(tag)">
                    {{ tag }}
                </el-tag>
                <el-input v-show="tags.length < 5" v-model="tagsInput" @keydown.enter="tagsKeydown"
                    :placeholder="$t('editor.settings.tags.tagsPlaceholder')" />
            </div>
        </div>
        <div class="item summary">
            <p>{{ $t('editor.settings.summary.name') }}</p>
            <div class="part">
                <textarea v-model="summaryVal" cols="30" rows="6"
                    :placeholder="$t('editor.settings.summary.placeholder')"></textarea>
            </div>
        </div>
        <div class="item comments">
            <p>{{ $t('editor.settings.comments.name') }}</p>
            <div class="part">
                <el-tooltip :content="$t('editor.settings.comments.disabledComments')" :teleported="false"
                    placement="top-start">
                    <el-switch v-model="comments" @change="commentsChange" :disabled="!isComments"
                        active-color="#806EF2" />
                </el-tooltip>
            </div>
        </div>
    </div>

    <ArticleCategory v-if="isCategoryEdit" @articleCategoryClose="articleCategoryClose" />

    <ImgCutting v-if="isImgCutting" :title="$t('editor.settings.cover.title')"
        :subtitle="$t('editor.settings.cover.subtitle')" @cuttingClose="cuttingClose" @cuttingSuccess="cuttingSuccess"
        :config="{
            autoCropWidth: 720,
            autoCropHeight: 385,
            fixedNumber: [720, 385],
            enlarge: 3,
            full: true,
        }" :imgFile="imgFile" :imageUrl="imageUrl" :cuttingBoxHeight="250" />

    <FromArticle v-if="isFromArticleShow" @fromArticleClose="fromArticleClose"
        @fromArticleConfirm="fromArticleConfirm" />
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import ArticleCategory from '@/components/ArticleCategory.vue';
import { t } from '@/i18n';
import store from '@/store';
import { getImagesUrl, imagesIsUpload } from '@/utils/functions';
import ImgCutting from '@/components/ImgCutting.vue';
import FromArticle from './FromArticle.vue';

export default defineComponent({
    components: { ArticleCategory, ImgCutting, FromArticle },
    name: 'settings',
    emits: ['modifySettings'],
    props: {
        permissions: { type: String },
    },
    setup(props, context) {
        const categoryList: any = ref([]);
        const optionsChild = ref();
        const category = ref('');
        const categoryChild = ref('');
        const cover = ref('');
        const tags = ref([]);
        const summaryVal = ref('');
        const comments = ref(false);
        const isComments = ref();
        const tagsInput = ref();
        const isCategoryEdit = ref(false);
        const isUploadLoading = ref(false);
        const imageUrl = ref();
        const isImgCutting = ref(false);
        const imgFile = ref();
        // source
        const sourceValue = ref('Original');
        const sourceLink = ref('');
        const source = ref([
            { label: 'Original', value: 'Original' },
            { label: 'Reproduced', value: 'Reproduced' },
        ]);
        const isWriters = ref(false);
        const isFromArticleShow = ref(false);

        const categoryChange = (change, isMounted) => {
            categoryList.value.map((item) => {
                if (item.id.toString() === change) {
                    optionsChild.value = item.children;
                    if (!isMounted) {
                        categoryChild.value = '';
                        modifySettings();
                    }
                }
            });
        };

        const categoryChildChange = (change) => {
            modifySettings();
        };

        const categoryEdit = () => {
            isCategoryEdit.value = true;
            setCategorysList();
        };

        const tagsKeydown = () => {
            if (tagsInput.value) {
                if (tags.value.includes(tagsInput.value)) {
                    ElMessage.error(t('editor.settings.tags.addError'));
                    return false;
                }
                tags.value.push(tagsInput.value);
                tagsInput.value = '';
                modifySettings();
            }
        };

        const handleClose = (tag) => {
            tags.value.splice(tags.value.indexOf(tag), 1);
            modifySettings();
        };

        const commentsChange = () => {
            modifySettings();
        };

        const articleCategoryClose = () => {
            isCategoryEdit.value = false;
        };

        const modifySettings = () => {
            const str = {
                category: category.value,
                categoryChild: categoryChild.value,
                cover: cover.value,
                tags: tags.value,
                comments: comments.value,
                abstract: summaryVal,
                original: sourceValue.value === 'Original' ? true : false,
                fromurl: sourceLink.value,
            };
            context.emit('modifySettings', str);
        };

        const setCategorysList = () => {
            let categorysList = store.state.current_planet_data;
            if (categorysList && categorysList.categorys.length) {
                categoryList.value = categorysList.categorys;
            }
        };

        const setSettingsData = (obj) => {
            cover.value = obj.thumb;
            tags.value = obj.tags;
            comments.value = obj.allowComment;
            summaryVal.value = obj.abstract;
            sourceValue.value = obj.original ? 'Original' : 'Reproduced';
            sourceLink.value = obj.fromurl;

            let cate = obj.cate.toString();
            let subcate = obj.subcate.toString();
            if (cate !== '0') {
                category.value = cate;
                categoryList.value.forEach((item) => {
                    if (item.id.toString() === cate && item.children.length) {
                        optionsChild.value = item.children;
                        if (subcate !== '0') {
                            categoryChild.value = subcate;
                        }
                    }
                });
            }
        };

        const uploadFile = ({ file }) => {
            if (!imagesIsUpload(file)) {
                return false;
            }
            imageUrl.value = URL.createObjectURL(file);
            imgFile.value = file;
            isImgCutting.value = true;
        };

        const handleAvatarSuccess = () => { };

        const beforeAvatarUpload = async () => { };

        const getSettingsData = () => {
            let str = {
                tags: tags.value.map((item) => item),
                cate: Number(category.value ? category.value : 0),
                subcate: Number(categoryChild.value ? categoryChild.value : 0),
                thumb: cover.value,
                allowComment: comments.value,
                abstract: summaryVal.value,
                original: sourceValue.value === 'Original' ? true : false,
                fromurl: sourceLink.value,
            };
            return str;
        };

        const fromArticle = () => {
            isFromArticleShow.value = true;
        };

        const fromArticleClose = () => {
            isFromArticleShow.value = false;
        };

        const fromArticleConfirm = (file) => {
            imageUrl.value = URL.createObjectURL(file);
            imgFile.value = file;
            isImgCutting.value = true;
        };

        watch(
            () => store.state.current_planet_data,
            (val: any) => {
                if (!val) {
                    isWriters.value = false;
                    return;
                }
                if (val.categorys.length) {
                    setCategorysList();
                }

                if (!~val.writers.toString().indexOf(store.state?.user_data?.pid)) {
                    isWriters.value = true;
                } else {
                    isWriters.value = false;
                }
            },
        );

        watch(
            () => props.permissions,
            (val) => {
                if (val) {
                    isComments.value = props.permissions;
                    if (val === 'Subcribe' || val === 'Public') {
                        isComments.value = true;
                    } else {
                        isComments.value = false;
                        comments.value = false;
                    }
                }
            },
            {
                immediate: true,
            },
        );

        const cuttingSuccess = async (hex) => {
            cover.value = hex;
            isUploadLoading.value = false;
        };

        const cuttingClose = () => {
            isImgCutting.value = false;
        };

        onMounted(() => {
            setCategorysList();

            if (category.value) {
                categoryChange(category.value, true);
            }
        });

        return {
            isUploadLoading,
            categoryList,
            category,
            categoryChild,
            optionsChild,
            tagsInput,
            summaryVal,
            cover,
            tags,
            comments,
            isComments,
            isCategoryEdit,
            store,
            isImgCutting,
            imgFile,
            imageUrl,
            source,
            sourceValue,
            sourceLink,
            isWriters,
            isFromArticleShow,
            fromArticleClose,
            fromArticleConfirm,
            fromArticle,
            categoryChange,
            categoryChildChange,
            categoryEdit,
            handleAvatarSuccess,
            beforeAvatarUpload,
            tagsKeydown,
            handleClose,
            commentsChange,
            articleCategoryClose,
            uploadFile,
            getImagesUrl,
            getSettingsData,
            setSettingsData,
            cuttingClose,
            cuttingSuccess,
        };
    },
});
</script>

<style scoped lang="less">
.settings {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    background: @bg-color;
    border-top: 1px solid @border-color;
    @apply dark:(bg-dark-800 border-dark-100);

    h3 {
        font-size: 24px;
        line-height: 29px;
        color: @text-color;

        margin: 30px 0 0 0;
        font-weight: 400;
        @apply dark:(text-light-900/80);
    }

    .item {
        display: flex;
        width: 100%;
        margin-top: 25px;

        p {
            display: flex;
            font-weight: 400;
            font-size: 16px;
            width: 190px;
            color: @text-color;
            @apply dark:(text-light-900/80);
        }

        .part {
            display: flex;
            width: calc(100% - 190px);
            flex-wrap: wrap;

            :deep(.el-select) {
                margin-right: 18px;
                width: 163px;

                .el-input {
                    .el-input__wrapper {
                        height: 45px;
                    }
                }
            }

            input {
                flex: 1;
                border: 2px solid #e8e8e8;
                border-radius: 12px;
                padding: 0 12px;
                font-size: 14px;
                @apply dark:(border-dark-100 bg-dark-300);

                &::placeholder {
                    font-size: 14px;
                }
            }
        }

        &.category,
        &.source {
            height: 45px;
            line-height: 45px;

            .edit {
                font-weight: 400;
                font-size: 16px;
                color: #806ef2;
                margin-left: 2px;
                cursor: pointer;
            }
        }

        &.coverImage {
            :deep(.avatar-uploader) {
                height: 115px;
                position: relative;

                .el-upload {
                    width: 160px;
                    height: 90px;

                    img {
                        height: 90px;
                    }
                }

                .avatar-uploader-icon {
                    i {
                        font-size: 32px;
                    }
                }

                .el-upload__fromArticle {
                    font-size: 12px;
                    color: @color-success;
                    margin-top: 7px;
                    cursor: pointer;
                }

                .el-upload__tip {
                    margin-top: 3px;
                }

                .hover {

                    // span {
                    //   display: flex;
                    // }
                    .el-upload {
                        span {
                            position: absolute;
                            background: rgba(0, 0, 0, 0.8);
                            padding: 5px 10px;
                            font-size: 12px;
                            color: @text-color-inverse;
                            transition: @transition;
                            opacity: 0;
                            bottom: 15px;
                            border-radius: 5px;
                        }
                    }

                    &:hover {
                        span {
                            opacity: 1;
                            transition: @transition;
                        }
                    }
                }
            }
        }

        &.tags {
            line-height: 32px;
            flex-wrap: wrap;

            .el-tag {
                margin-right: 15px;
                height: 32px;
                line-height: 32px;
                margin-bottom: 10px;
                font-size: 14px;
                padding: 0px 8px;
                @apply dark:(bg-transparent);

                &.is-closable {
                    padding-right: 6px;
                }
            }

            :deep(.el-input) {
                width: 98px;
                margin-bottom: 10px;
                height: 32px;
                background: #f2f2f2;
                @apply dark:(bg-transparent);

                .el-input__wrapper {
                    padding: 0px 10px;

                    .el-input__inner {
                        color: #999999;
                        font-size: 14px;
                    }
                }
            }
        }

        &.summary {
            textarea {
                width: 100%;
                background: #f2f2f2;
                resize: none;
                border-radius: 10px;
                padding: 15px;
                border: none;
                font-size: 14px;
                @apply dark:(bg-dark-300);
            }
        }

        &.comments {
            margin-top: 15px;
            line-height: 32px;
        }
    }
}

:deep(.el-switch__core) {
    @apply dark:( !border-dark-100);
}
</style>
