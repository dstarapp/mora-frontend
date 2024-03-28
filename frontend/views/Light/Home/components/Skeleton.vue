<template>
    <el-skeleton animated>
        <template #template>
            <el-skeleton-item variant="image" class="w-full h-52 rounded-tl-2xl rounded-tr-2xl"/>
            <div class="conbox">
                <div class="info">
                    <div class="logo">
                        <el-skeleton-item variant="image" class="w-full h-full"/>
                    </div>
                    <div class="plugin-name"><el-skeleton-item variant="h1" class="w-25"/></div>
                </div>
                <div class="des">
                    <el-skeleton-item variant="text" class="w-full h-4"/>
                    <el-skeleton-item variant="text" class="w-full h-4 my-1"/>
                    <el-skeleton-item variant="text" class="w-2/3 h-4"/>
                </div>
                <div class="flex justify-between items-center h-9">
                    <div class="category">
                        <el-skeleton-item variant="h3" class="w-25"/>
                    </div>
                </div>
            </div>
        </template>
    </el-skeleton>
</template>

<style scoped lang="less">
.conbox {
    @apply w-full p-5 border border-light-700 border-t-transparent rounded-bl-2xl rounded-br-2xl dark:(border-dark-100);
    .info {
        @apply w-full -mt-10 flex relative;
        .logo {
            @apply w-13 h-13 rounded-xl border-3 border-white overflow-hidden dark:(border-dark-100);
            img {
                @apply w-full h-full;
            }
        }
        .plugin-name {
            @apply flex-1 ml-3 pt-7 truncate font-bold;
        }
    }
    .des {
        @apply w-full mt-3 mb-5;
    }
    .category {
        background-image: linear-gradient(to right, #34d399, #7cee83);
        -webkit-background-clip: text;
        color: transparent;
        font-weight: 500;
    }
}
</style>
