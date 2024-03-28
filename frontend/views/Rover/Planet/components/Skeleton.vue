<template>
    <el-skeleton class="item">
        <template #template>
            <div class="header">
                <div class="planetInfo">
                    <el-skeleton-item variant="image" class="skeletonAvatar" />
                    <div class="info">
                        <div class="name">
                            <el-skeleton-item
                                variant="text"
                                style="width: 110px; margin-right: 10px"
                            />
                            <el-skeleton-item
                                variant="text"
                                style="width: 30px; margin-right: 10px"
                            />
                            <el-skeleton-item variant="text" style="width: 30px" />
                        </div>
                        <div class="pid">
                            <el-skeleton-item variant="text" style="width: 150px" />
                        </div>
                    </div>
                </div>
                <div class="planetData">
                    <div class="dataItem" style="margin-right: 10px">
                        <span class="title">
                            <el-skeleton-item variant="text" style="width: 80px" />
                        </span>
                        <span class="data">
                            <el-skeleton-item variant="text" style="width: 80px" />
                        </span>
                    </div>
                    <div class="dataItem" style="margin-right: 10px">
                        <span class="title">
                            <el-skeleton-item variant="text" style="width: 80px" />
                        </span>
                        <span class="data">
                            <el-skeleton-item variant="text" style="width: 80px" />
                        </span>
                    </div>
                    <div class="dataItem">
                        <span class="title">
                            <el-skeleton-item variant="text" style="width: 80px" />
                        </span>
                        <span class="data">
                            <el-skeleton-item variant="text" style="width: 80px" />
                        </span>
                    </div>
                </div>
            </div>
            <div class="pbox">
                <div class="profile">
                    <el-skeleton-item
                        v-for="i in 2"
                        :key="i"
                        variant="p"
                        style="width: 100%; margin: 3px 0"
                    />
                </div>
                <div class="info">
                    <div class="btnbox">
                        <el-skeleton-item
                            variant="button"
                            style="width: 120px; margin-right: 15px"
                        />
                        <el-skeleton-item variant="button" style="width: 120px" />
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
@import './item.less';
.skeletonAvatar {
    .width(80);
    .height(80);
    border-radius: 100%;
}
</style>
