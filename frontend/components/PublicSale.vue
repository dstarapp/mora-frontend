<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { mySnsCanvas } from '@/utils/snsCanvas'
const dialogVisible = ref(true);
const mycanvas = ref(null);

onMounted(() => {
    nextTick(() => {
        setTimeout(() => {
            mySnsCanvas(mycanvas.value);
        }, 200);
    })
})

const emit = defineEmits(['close'])
const closeDialog = () => {
    emit('close');
}

const openLink = () => {
    window.open('https://nns.ic0.app/project/?project=bxmkl-2iaaa-aaaaq-aac6q-cai', '_blank');
}
</script>

<template>
    <el-dialog v-model="dialogVisible" :show-close="false" :close-on-click-modal="true"
        class="indexing w800 !rounded-4xl <sm:(!rounded-3xl)">
        <div class="box">
            <div class="canvas">
                <p>MORA DAO <br />SNS SALE<br />IS COMING!</p>
                <canvas ref="mycanvas"></canvas>
            </div>
            <div class="bbox">
                <button @click="closeDialog">Close</button>
                <button @click="openLink">Mora Public Sale</button>
            </div>
        </div>
    </el-dialog>
</template>

<style lang="less" scoped>
.box {
    @apply w-full pt-10 pb-15 relative <sm:(pb-10);
    background: linear-gradient(180deg, #1C1F64 0%, #423AA4 52%, #806CFF 100%);

    .canvas {
        @apply w-full h-110;

        p {
            @apply pt-20 text-white text-5xl font-bold leading-18 md:(hidden);
        }

        canvas {
            @apply !w-full transform scale-170 z-0 -mt-8 <sm:(hidden);
        }
    }

    .bbox {
        @apply absolute bottom-14 left-0 w-full flex items-center justify-center z-10 <sm:(bottom-8);

        button {
            @apply w-65 h-14 rounded-2xl mx-5 bg-white text-center text-black transition duration-300 hover:(transition duration-300 opacity-70) <sm:(rounded-xl mx-3 w-38);

            &:first-child {
                @apply bg-indigo-300;
            }

            &:last-child {
                @apply bg-lime-400;
            }
        }
    }
}
</style>
