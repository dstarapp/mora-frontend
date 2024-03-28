<template>
    <p @click="official()">
        {{ pid }}
        <em>{{ officialLoading ? 'loading' : !isOfficial ? 'unauthorized' : 'authorized' }}</em>
    </p>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { getOfficial } from '@/utils/official';

export default defineComponent({
    props: {
        pid: {
            type: String,
        },
        officialLoading: {
            type: Boolean,
        },
    },
    setup(props, context) {
        const isOfficial = ref();

        const official = () => {
            if (props.officialLoading) {
                return;
            }
            if (isOfficial.value) {
                context.emit('actrivePlanet', props.pid);
            } else {
                context.emit('cancel', props.pid);
            }
        };

        onMounted(async () => {
            isOfficial.value = await getOfficial(props.pid);
        });

        return {
            official,
            isOfficial,
        };
    },
});
</script>

<style scoped lang="less">
p {
    border: 1px solid #000;
    margin-bottom: 10px;
    padding: 5px;
    border-radius: 5px;
    cursor: pointer;
    position: relative;
    display: flex;
    align-items: center;

    em {
        position: absolute;
        right: 15px;
        font-style: normal;
    }
}
</style>
