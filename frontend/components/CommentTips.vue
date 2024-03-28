<template>
    <el-dialog
        v-model="dialogVisible"
        :title="$t('comment.ctitle')"
        :show-close="false"
        :close-on-click-modal="false"
    >
        <div class="box">
            {{ $t('comment.ctips') }}
        </div>
        <div class="mora-button">
            <div class="confirm">
                {{ $t('comment.cbtn') }}
            </div>
        </div>
    </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
    setup() {
        const dialogVisible = ref(true);

        return {
            dialogVisible,
        };
    },
});
</script>

<style lang="less" scoped>
.box {
    width: 100%;
    .font-size(18);
    .padding(0, 30, 0, 30);
    img {
        .width(52);
        margin: 0 auto 40px auto;
    }
    @apply dark:(text-light-900/80);
}
.mora-button {
    padding: 0px 135px 0px 135px;
}

@media screen and (min-width: 0) and (max-width: 750px) {
    .box {
        .padding(10, 30, 0, 30);
        img {
            margin: 0 auto 20px auto;
        }
    }
}
</style>
