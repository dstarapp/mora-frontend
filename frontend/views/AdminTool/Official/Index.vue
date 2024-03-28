<template>
    <div class="main">
        <div class="list2">
            <el-input v-model="cid" class="input" placeholder="Enter planet id"></el-input>
            <el-button class="btn2" type="primary" @click="activePlanet(cid)">
                Start certification
            </el-button>
        </div>
        <div class="list2">
            <el-input v-model="cid2" class="input" placeholder="Enter planet id"></el-input>
            <el-button class="btn2" type="primary" @click="cancel(cid2)">
                decertification
            </el-button>
        </div>
        <template v-if="currentActivePlanet">
            <div>currently selected planet:{{ currentActivePlanet }}</div>
            <div>planet name:{{ currentActivePlanetData.name }}</div>
            <el-button :disabled="officialLoading" class="btn" @click="official" type="primary">
                {{ officialLoading ? 'In certification...' : 'Certification' }}
            </el-button>
        </template>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import store from '@/store';
import { setOfficial, cancelOfficial } from '@/utils/official';
import { createActor } from '@/request/agent';
import { idlFactory as planetFactory } from '@/request/canister/planet.did';
import PidList from './components/PidList.vue';
import { isPrincipalString } from '@/utils/functions';
import { ElMessage } from 'element-plus';

export default defineComponent({
    components: { PidList },
    props: {},
    setup() {
        const currentActivePlanet = ref();
        const currentActivePlanetData = ref();
        const officialLoading = ref(false);
        const cid = ref();
        const cid2 = ref();

        const activePlanet = async (item) => {
            if (!isPrincipalString(item)) {
                ElMessage.error('pid error');
                return;
            }

            currentActivePlanet.value = '';
            currentActivePlanetData.value = '';
            const planetCanister = await createActor(item, planetFactory);
            currentActivePlanetData.value = await planetCanister.getPlanetBase();
            currentActivePlanet.value = item;
        };

        const cancel = async (item) => {
            if (!isPrincipalString(item)) {
                ElMessage.error('pid error');
                return;
            }
            if (officialLoading.value) {
                return;
            }
            officialLoading.value = true;
            await cancelOfficial(item);
            officialLoading.value = false;
        };

        const official = async () => {
            if (officialLoading.value) {
                return;
            }
            officialLoading.value = true;
            await setOfficial(currentActivePlanet.value, currentActivePlanetData.value.name);
            officialLoading.value = false;
        };

        return {
            activePlanet,
            cancel,
            official,
            cid,
            cid2,
            officialLoading,
            currentActivePlanet,
            currentActivePlanetData,
            store,
        };
    },
});
</script>

<style scoped lang="less">
.main {
    margin: 50px;
    display: flex;
    flex-direction: column;
    border: 1px solid #000;
    padding-bottom: 15px;
    border-radius: 10px;

    >div {
        margin: 15px 15px 0 15px;

        &.list {
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
        }

        &.list2 {
            margin: 15px 15px 0 15px;
            display: flex;

            .input {
                border-radius: 5px;
                border: 1px solid #000;
                display: flex;
                flex: 1;

                :deep(.el-input__wrapper) {
                    border-radius: 5px;
                    padding: 0px 10px 0px 10px;
                }
            }

            .btn2 {
                height: 35px !important;
                margin-left: 15px;
            }
        }
    }

    .btn {
        margin: 15px 15px 0 15px;
    }
}
</style>
