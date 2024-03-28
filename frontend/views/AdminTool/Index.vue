<template>
    <div class="burningBox">
        <div class="tab">
            <p @click="toLink('official')">official</p>
            <p @click="toLink('invitationCode')">invitationCode</p>
            <p @click="toLink('audit')">audit</p>
            <p @click="toLink('lightCode')">lightCode</p>
        </div>
        <router-view></router-view>
    </div>
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

<style scoped lang="less">
.burningBox {
    display: flex;
    flex-direction: column;

    .tab {
        width: 100%;
        border-bottom: 1px solid #e8e8e8;
        display: flex;
        padding: 10px;

        p {
            margin-right: 10px;
            cursor: pointer;
            border-right: 1px solid #000;
            padding-right: 10px;

            &:last-child {
                border-right: 0;
            }
        }
    }
}
</style>
