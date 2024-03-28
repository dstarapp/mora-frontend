<template>
    <el-skeleton animated>
        <template #template>
            <div class="item">
                <el-skeleton-item
                    variant="image"
                    style="width: 80px; height: 80px; border-radius: 100%"
                />
                <el-skeleton-item
                    class="name"
                    variant="p"
                    style="width: 50%; margin-top: 10px; margin-bottom: 15px"
                />
                <el-skeleton-item
                    variant="p"
                    v-for="i in 4"
                    :key="i"
                    style="width: 100%; margin: 3px 0"
                />
                <span style="margin-top: 10px">
                    <el-skeleton-item variant="p" style="width: 100%" />
                </span>
            </div>
        </template>
    </el-skeleton>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    setup() {
        return {};
    },
});
</script>

<style scoped lang="less">
.item {
    background: @bg-color-body;
    .center();
    flex-direction: column;
    .margin(0, 20, 20, 0);
    .border-radius(20);
    .padding(20, 20, 10, 20);
    cursor: pointer;
    transition: @transition;
    min-width: 200px;
    position: relative;
    @apply dark:(bg-dark-300);
}
</style>
