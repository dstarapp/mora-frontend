<template>
    <div class="invitationCodeBox">
        <div class="box">
            <p>Opposite party pid</p>
            <span>
                <el-input-number class="num" v-model="num" :min="1" :max="100" placeholder="number" />
                <div class="generate" @click="generate"> generate </div>
            </span>
        </div>
        <strong v-if="codeList.length">
            <p v-for="item in codeList" :key="item.code">
                {{ item.code }} - {{ item.user.toString() }}
            </p>
        </strong>
        <div class="box">
            <el-input type="textarea" v-model="textarea" :autosize="{ minRows: 5 }"
                placeholder="Please input Opposite party pid" />
        </div>
        <div class="mora-button">
            <div class="confirm" :class="{ loading: isLoading }" @click="confirm">
                <img src="@/assets/svg/loading.svg" v-if="isLoading" />
                Add invitation code
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import store from '@/store';
import { createActor } from '@/request/agent';
import { idlFactory as invitationCodeFactory } from '@/request/canister/invitationCode.did';
import CONFIG from '@/assets/config';
import debug from '@/utils/debug';
import { Principal } from '@dfinity/principal';
import { ElMessage } from 'element-plus';

export default defineComponent({
    components: {},
    props: {},
    setup() {
        const isLoading = ref(false);
        const pid = ref();
        const textarea = ref();
        const num = ref(1);
        const codeList: any = ref([]);
        const invitationCodeCanister = ref();

        const generateRandomString = (length = 15) => {
            let result = '';
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            const charactersLength = characters.length;

            for (let i = 0; i < length; i++) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }

            return result;
        };

        const generate = () => {
            if (!textarea.value) {
                return;
            }
            codeList.value = [];

            let set = new Set();
            textarea.value.split('\n').map((item) => {
                set.add(item.trim());
            });
            let arr = Array.from(set);

            arr.map((item) => {
                for (let i = 0; i < num.value; i++) {
                    let code = generateRandomString();
                    codeList.value.push({
                        code: code,
                        user: Principal.fromText(item),
                    });
                }
            });
        };

        const confirm = async () => {
            isLoading.value = true;
            try {
                await invitationCodeCanister.value.add_code(codeList.value);
                isLoading.value = false;
                ElMessage.success('Add success');
            } catch (err) {
                debug('error', err);
                isLoading.value = false;
                ElMessage.error('No authority');
            }
        };

        const init = async () => {
            invitationCodeCanister.value = await createActor(
                CONFIG.invitationCodeCanister,
                invitationCodeFactory,
                store.state.agent,
            );
        };

        onMounted(() => {
            init();
        });

        return {
            store,
            isLoading,
            pid,
            textarea,
            num,
            codeList,
            confirm,
            generate,
        };
    },
});
</script>

<style scoped lang="less">
.invitationCodeBox {
    margin: 50px;
    display: flex;
    flex-direction: column;
    border: 1px solid #000;
    padding-bottom: 15px;
    border-radius: 10px;

    >strong {
        padding: 20px 20px 0 20px;
        font-size: 12px;
        font-weight: normal;
        display: flex;
        flex-direction: column;
    }

    .box {
        padding: 20px 20px 0 20px;
        flex-direction: column;
        display: flex;

        p {
            display: flex;
            font-size: 14px;
            margin-bottom: 10px;
            width: 100%;

            i {
                margin-left: auto;
                font-size: 14px;
                cursor: pointer;
            }
        }

        .item {
            .center();
            margin-top: 5px;

            i {
                padding: 0 5px 0 10px;
                cursor: pointer;
            }
        }

        span {
            display: flex;
        }
    }

    .num {
        width: 200px;

        :deep(.el-input__inner) {
            padding: 10px 20px !important;
        }
    }

    .generate {
        display: flex;
        margin-left: auto;
        cursor: pointer;
        color: #806ef2;
        font-size: 14px;
    }

    :deep(.el-input),
    :deep(.el-textarea) {
        border: 1px solid #dddddd;
        border-radius: 6px;
        @apply dark:(border-dark-100);

        .el-input__inner,
        .el-textarea__inner {
            color: #666;
            text-align: left;
            font-size: 14px;
            padding: 10px;
            @apply dark:(text-light-900/80);
        }
    }

    .mora-button {
        margin: 0;
        padding: 20px;
    }
}
</style>
