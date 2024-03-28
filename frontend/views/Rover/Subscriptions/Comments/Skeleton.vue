<template>
    <el-skeleton class="commentsSkeleton" animated>
        <template #template>
            <div class="item" v-for="(item, index) in 5" :key="index">
                <div class="reply">
                    <el-skeleton-item class="replyText" variant="text" />
                </div>
                <div class="text">
                    <el-skeleton-item class="textList" variant="text" />
                    <span>
                        <el-skeleton-item class="left" variant="text" />
                        <el-skeleton-item class="center" variant="text" />
                        <el-skeleton-item class="right" variant="text" />
                    </span>
                    <div class="box" v-if="index === 0">
                        <el-skeleton-item class="boxContent" variant="text" />
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
.commentsSkeleton {
    display: flex;
    width: 100%;
    flex-wrap: wrap;
    .margin(40, 0, 0, 0);
    flex-direction: column;

    .item {
        display: flex;
        width: 100%;
        min-width: 200px;
        .margin(0, 0, 40, 0);
        margin-right: 3%;

        .reply {
            display: flex;
            font-style: normal;
            font-weight: 400;
            .font-size(16);
            .line-height(19);
            .width(46);
            color: @text-fcolor;

            .replyText {
                width: 100%;
            }
        }

        .text {
            display: flex;
            flex: 1;
            .margin(0, 0, 0, 17);
            flex-direction: column;

            .textList {
                .margin(0, 0, 12, 0);
            }

            span {
                display: flex;
                width: 100%;

                .left {
                    .width(130);
                    .margin(0, 32, 0, 0);
                }

                .center {
                    .width(50);
                    .margin(0, 32, 0, 0);
                }

                .right {
                    .width(83);
                }
            }
        }

        .box {
            .height(95);
            .margin(13, 0, 0, 0);

            .boxContent {
                .height(95);
            }
        }

        @media screen and (min-width: 0) and (max-width: 750px) {
            width: 100%;
        }
    }
}
</style>
