<template> </template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

export default defineComponent({
    name: 'Transfer',
    setup() {
        const route = useRoute();
        const router = useRouter();

        onMounted(() => {
            if (route.query.id) {
                router.push({
                    name: 'planetEditor',
                    params: {
                        id: route.query.id,
                    },
                });
            } else {
                router.push({
                    name: 'homeIndex',
                });
            }
        });

        return {};
    },
});
</script>

<style scoped lang="less"></style>
