<template>
    <div class="invitationCodeBox">
        <div class="box">
            <span>
                <el-input-number
                    class="num"
                    v-model="num"
                    :min="1"
                    :max="100"
                    placeholder="number"
                />
            </span>
        </div>
        <div class="box">
            <p>Opposite party pid</p>
            <el-input
                type="text"
                v-model="textarea"
                placeholder="Please input Opposite party pid"
            />
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
import CONFIG from '@/assets/config';
import debug from '@/utils/debug';
import { Principal } from '@dfinity/principal';
import { ElMessage } from 'element-plus';
import { codesGenerateByPermission } from '@/components/light-experience/canisters/audit/apis';

export default defineComponent({
    components: {},
    props: {},
    setup() {
        const isLoading = ref(false);
        const pid = ref();
        const textarea = ref();
        const num = ref(1);
        const codeList: any = ref([]);

        const generate = () => {};

        const confirm = async () => {
            if (!store.state.agent || !textarea.value || isLoading.value) {
                return;
            }
            isLoading.value = true;
            let res = await codesGenerateByPermission(
                store.state.agent,
                num.value,
                Principal.fromText(textarea.value),
            );
            isLoading.value = false;
            if (res.length) {
                ElMessage.success('Add success');
            }
        };

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

    > strong {
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

    :deep(.el-input) {
        border: 1px solid #dddddd;
        border-radius: 6px;
        @apply dark:(border-dark-100);

        .el-input__inner,
        .el-textarea__inner {
            color: #666;
            text-align: left;
            font-size: 14px;
            padding: 0px;
            @apply dark:(text-light-900/80);
        }
    }

    .mora-button {
        margin: 0;
        padding: 20px;
    }
}
</style>
