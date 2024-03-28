<template>
    <el-dialog
        v-model="dialogVisible"
        :title="$t('invitation.title')"
        :before-close="handleClose"
        @closed="afterClose"
    >
        <div class="box">
            <img src="@/assets/svg/invitation.svg" />
            <p>{{ $t('invitation.txt') }}</p>
            <div class="inputbox">
                <input type="text" :placeholder="$t('invitation.placeholder')" v-model="code" />
            </div>
            <div class="mora-button">
                <div
                    class="confirm"
                    :class="isLoading ? 'loading' : code.length > 12 ? '' : 'disabled'"
                    @click="confirm"
                >
                    <img src="@/assets/svg/loading.svg" v-if="isLoading" />
                    {{ $t('utils.avatar.btns.confirm') }}
                </div>
            </div>
        </div>
    </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
    setup(props, context) {
        const dialogVisible = ref(true);
        const isLoading = ref(false);
        const code = ref('');
        const handleClose = () => {};
        const afterClose = () => {};
        const confirm = () => {};
        return {
            dialogVisible,
            isLoading,
            handleClose,
            afterClose,
            confirm,
            code,
        };
    },
});
</script>

<style lang="less" scoped>
.box {
    @apply w-full;
    img {
        @apply w-14 block mx-auto;
    }
    .inputbox {
        @apply w-full px-30 <sm:(px-5);
        input {
            @apply w-full border border-gray-200 rounded-full h-12 leading-11 px-5 text-center text-xl text-black tracking-wider dark:(border-dark-100 bg-dark-800 text-white);
            &::placeholder {
                @apply text-base tracking-normal;
            }
        }
    }
    p {
        @apply pt-6 pb-7 px-8 break-normal text-dark-500 <sm:(px-5 pb-5) dark:(text-light-900/80);
    }
    .mora-button {
        @apply px-30 <sm:(px-5);
        img {
            @apply w-5;
        }
    }
}
</style>
