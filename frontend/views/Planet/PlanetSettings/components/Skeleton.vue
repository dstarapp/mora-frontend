<template>
    <el-skeleton animated class="left">
        <template #template>
            <h2>{{ $t('planetSettings.title') }}</h2>
            <div class="avatarBox">
                <el-skeleton-item variant="image" class="skeletonAvatar" />
            </div>
            <div class="from">
                <div class="item">
                    <div class="label">
                        {{ $t('planetSettings.from.name') }}
                    </div>
                    <div class="m">
                        <div class="inputBox">
                            <p><el-skeleton-item variant="text" style="width: 150px" /></p>
                        </div>
                    </div>
                </div>
                <div class="item">
                    <div class="label">
                        {{ $t('planetSettings.from.profile') }}
                    </div>
                    <div class="m">
                        <div class="textareaBox" style="flex-direction: column">
                            <el-skeleton-item
                                style="width: 80%; margin-bottom: 5px; height: 12px"
                                variant="p"
                            />
                            <el-skeleton-item
                                style="width: 80%; margin-bottom: 5px; height: 12px"
                                variant="p"
                            />
                            <el-skeleton-item style="width: 20%; height: 12px" variant="p" />
                        </div>
                    </div>
                </div>
                <div class="item">
                    <div class="label">
                        {{ $t('planetSettings.from.cover') }}
                    </div>
                    <div class="m">
                        <el-skeleton-item
                            variant="image"
                            style="width: 130px; height: 80px; border-radius: 15px"
                        />
                    </div>
                </div>
                <div class="item">
                    <div class="label">
                        {{ $t('planetSettings.from.twitter') }}
                    </div>
                    <div class="m">
                        <div class="inputBox blue">
                            <p><el-skeleton-item variant="text" style="width: 250px" /></p>
                        </div>
                    </div>
                </div>
                <div class="item">
                    <div class="label">
                        {{ $t('planetSettings.from.domain') }}
                    </div>
                    <div class="m">
                        <div class="inputBox blue">
                            <p><el-skeleton-item variant="text" style="width: 250px" /></p>
                        </div>
                    </div>
                </div>
                <div class="item">
                    <div class="label">
                        {{ $t('planetSettings.from.writer') }}
                    </div>
                    <div class="m t">
                        <div class="writerBox">
                            <el-skeleton-item variant="p" style="width: 50px" />
                        </div>
                    </div>
                </div>
                <div class="item">
                    <div class="label">
                        {{ $t('planetSettings.from.owner') }}
                    </div>
                    <div class="m">
                        <div class="textareaBox" style="flex-direction: column">
                            <el-skeleton-item
                                style="width: 80%; margin-bottom: 5px; height: 12px"
                                variant="p"
                            />
                            <el-skeleton-item style="width: 20%; height: 12px" variant="p" />
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </el-skeleton>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'Skeleton',
    setup() {
        return {};
    },
});
</script>

<style scoped lang="less">
@import './left.less';
</style>
