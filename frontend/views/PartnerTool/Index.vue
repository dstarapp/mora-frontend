<template>
    <router-view></router-view>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useRoute, useRouter } from 'vue-router';

export default defineComponent({
    components: {},
    props: {},
    name: 'AdminTool',
    setup() {
        const route = useRoute();
        const router = useRouter();

        const toLink = (name) => {
            router.push({
                name: name,
            });
        };

        return {
            toLink,
        };
    },
});
</script>

<style scoped lang="less"></style>
