<template>
    <el-drawer
        v-model="drawer"
        direction="btt"
        title="Directory"
        :before-close="handleClose"
        size="45%"
    >
        <Directory @click="handleClose" />
    </el-drawer>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import Directory from './Directory.vue';

export default defineComponent({
    emits: ['componentClose'],
    components: { Directory },
    setup(props, context) {
        const drawer = ref(true);
        const handleClose = () => {
            context.emit('componentClose');
        };
        return {
            drawer,
            handleClose,
        };
    },
});
</script>

<style lang="less" scoped></style>
