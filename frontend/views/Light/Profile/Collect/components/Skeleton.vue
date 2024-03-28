<template>
    <el-skeleton animated>
        <template #template>
            <div class="img-box"><el-skeleton-item variant="image" class="w-full h-52" /></div>
            <div class="con-box">
                <div class="info">
                    <div class="logo">
                        <el-skeleton-item variant="image" class="w-12 h-12" />
                    </div>
                    <div class="plugin-name"><el-skeleton-item variant="text" class="w-30" /></div>
                </div>
                <div class="des">
                    <el-skeleton-item variant="text" />
                    <el-skeleton-item variant="text" class="w-4/5" />
                    <el-skeleton-item variant="text" class="w-2/5" />
                </div>
                <div class="flex justify-between items-center h-9">
                    <div class="category">
                        <el-skeleton-item variant="text" class="w-20" />
                    </div>
                    <!-- <div class="btn-box">
                        <el-skeleton-item variant="text" class="w-20 h-8" />
                    </div> -->
                </div>
            </div>
        </template>
    </el-skeleton>
</template>

<script lang="ts" setup></script>

<style lang="less" scoped>
@import url('./list.less');
</style>
