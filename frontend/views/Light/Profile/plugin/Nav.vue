<template>
    <div class="nav" :class="{ expansion: isExpansion }">
        <div class="logo" @click="jump('lightHome')">
            <img src="@/assets/svg/editor-logo.svg" alt="" />
            <p>{{ $t('plugin.nav.logo') }}</p>
        </div>
        <div class="btnList">
            <div :class="{ active: route.name === 'lightProfileUser' }" @click="jump('lightProfileUser')">
                <span>
                    <i class="iconfont icon-plugin-mine"></i>
                    <p>{{ $t('plugin.route.user') }}</p>
                </span>
            </div>
            <div :class="{ active: route.name === 'lightProfileCollect' }" @click="jump('lightProfileCollect')">
                <span>
                    <i class="iconfont icon-plugin-sc"></i>
                    <p>{{ $t('plugin.route.collect') }}</p>
                </span>
            </div>
            <div :class="{
        active:
            route.name === 'lightProfileCreate' || route.name === 'lightProfileEdit',
    }" @click="jump('lightProfileCreate')">
                <span>
                    <i class="iconfont icon-plugin-add"></i>
                    <p>{{ $t('plugin.route.create') }}</p>
                </span>
            </div>

            <div :class="{ active: route.name === 'lightProfileNotice' }" @click="jump('lightProfileNotice')">
                <span>
                    <em v-if="store.state.light_read_num"></em>
                    <i class="iconfont icon-notice-empty"></i>
                    <p>{{ $t('plugin.route.notice') }}</p>
                </span>
            </div>
            <div v-if="isLightProfileAudit" :class="{
        active: route.name === 'lightProfileAudit',
    }" @click="jump('lightProfileAudit')">
                <span>
                    <i class="iconfont icon-review"></i>
                    <p>{{ $t('plugin.route.audit') }}</p>
                </span>
            </div>
            <div :class="{ active: route.name === 'lightProfileAuditCode' }" @click="jump('lightProfileAuditCode')">
                <span>
                    <i class="iconfont icon-invite"></i>
                    <p>{{ $t('plugin.route.auditCode') }}</p>
                </span>
            </div>
            <div @click="globalOutLogin">
                <span>
                    <i class="iconfont icon-plugin-quit"></i>
                    <p>{{ $t('plugin.route.logout') }}</p>
                </span>
            </div>
            <div class="bottom">
                <i @click="isExpansion = !isExpansion" class="iconfont icon-plugin-aright"></i>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, inject, computed, watch, onMounted, PropType } from 'vue';
import store from '@/store';
import { Agent } from '@dfinity/agent';
import { useRouter, useRoute } from 'vue-router';
import { initialUserExperienceCanister } from '@/components/light-experience/canisters/common';
import { permissionsHasAllPermissions } from '@/components/light-experience/canisters/experience_manager/apis';
import { Principal } from '@dfinity/principal';

const route = useRoute();
const router = useRouter();
const isExpansion = ref(false);
const globalOutLogin = inject<() => void>('globalOutLogin')!;

const agent = computed<Agent>(() => store.state.agent);
const currentUser = async (): Promise<string> => (await agent.value.getPrincipal()).toText();
watch(
    () => agent.value,
    (nv, ov) => {
        if (ov && nv) window.location.reload();
        else if (nv) init();
    },
);
const init = async () => {
    const current_user = await currentUser();
    initialUserExperienceCanister(current_user);
};

onMounted(() => {
    if (agent.value) init();
});

const isLightProfileAudit = ref<boolean>(store.state.is_light_profile_audit === 1 ? true : false);

watch(
    () => store.state.user_data,
    async (n, o) => {
        let sVuex = store.state.is_light_profile_audit;
        if (!o && n && n.pid && sVuex === -1) {
            let res = await new Promise<boolean>((resolve) => {
                permissionsHasAllPermissions(agent.value, Principal.fromText(n.pid))
                    .then((d) => resolve(d))
                    .catch((e) => {
                        console.error('🚀 ~ file: Nav.vue:123 ~ res ~ e:', e);
                        resolve(false);
                    });
            });
            isLightProfileAudit.value = res;
            store.commit('SET_IS_LIGHT_PROFILE_AUDIT', res ? 1 : 2);
        }
    },
    { immediate: true, deep: true },
);

const jump = (
    type:
        | 'lightHome'
        | 'lightProfileUser'
        | 'lightProfileCollect'
        | 'lightProfileCreate'
        | 'lightProfileHelp'
        | 'lightProfileNotice'
        | 'lightProfileAudit'
        | 'lightProfileAuditCode',
) => router.push({ name: type });
</script>

<style lang="less" scoped>
.nav {
    display: flex;
    flex-shrink: 0;
    width: 68px;
    background: linear-gradient(183.7deg, #212332 2.14%, rgba(49, 53, 89, 0.83) 83.74%);
    border-radius: 0 20px 20px 0;
    flex-direction: column;
    overflow: hidden;
    transition: @transition;

    .logo {
        display: flex;
        height: 40px;
        cursor: pointer;
        margin: 24px 0;

        img {
            width: 40px;
            height: 40px;
            margin-left: 14px;
        }

        p {
            display: none;
            font-size: 20px;
            align-items: center;
            height: 40px;
            color: #fff;
            font-weight: bold;
            margin-left: 10px;
        }
    }

    .btnList {
        display: flex;
        flex: 1;
        flex-direction: column;
        width: 100%;
        position: relative;
        padding-top: 50px;

        div {
            display: flex;
            height: 40px;
            display: flex;
            cursor: pointer;
            flex-direction: column;
            margin-top: 25px;

            span {
                display: flex;
                height: 100%;
                transition: @transition;
                border-radius: 33px 0px 0px 33px;
                margin-left: 8px;
                align-items: center;
                padding-left: 15px;
                position: relative;

                &::before,
                &::after {
                    opacity: 0;
                    transition: @transition;
                    content: '';
                    display: block;
                    height: 12px;
                    width: 12px;
                    position: absolute;
                    background: radial-gradient(circle at 0% 0%, transparent 12px, #f3f3f3 12.3px);
                }

                &::before {
                    right: 0;
                    top: -12px;
                }

                &::after {
                    right: 0;
                    bottom: -12px;
                    transform: scaleY(-1);
                }

                em {
                    background-color: #ff0000;
                    // min-width: 16px;
                    // height: 16px;
                    width: 8px;
                    height: 8px;
                    font-size: 12px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    color: #fff;
                    position: absolute;
                    right: 20px;
                    top: 5px;
                    border-radius: 50%;
                    font-style: normal;
                    font-size: 0;
                }

                i {
                    font-size: 18px;
                    color: #b2b3bb;
                    transition: @transition;
                }

                p {
                    display: none;
                    margin-left: 10px;
                    font-size: 14px;
                    color: #b2b3bb;
                    white-space: nowrap;
                    transition: @transition;
                }
            }

            &:nth-last-child(2) {
                margin-top: 70px;
            }

            &.active {
                span {
                    background: #f3f3f3;
                    transition: @transition;
                    @apply dark:(bg-dark-900);

                    &::before,
                    &::after {
                        transition: @transition;
                        opacity: 1;
                    }

                    i,
                    p {
                        color: #292a3c;
                        @apply dark:(text-light-900);
                    }
                }

                &:hover {
                    span {

                        i,
                        p {
                            color: #292a3c;
                            transition: @transition;
                            @apply dark:(text-light-900);
                        }
                    }
                }
            }

            &:hover {
                span {

                    i,
                    p {
                        color: #fff;
                        transition: @transition;
                        scale: 1.06;
                    }
                }
            }
        }

        .bottom {
            .center();
            position: absolute;
            width: 100%;
            height: 30px;
            bottom: 26px;

            i {
                .center();
                font-size: 20px;
                background: #292a3c;
                box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.08);
                color: #fff;
                width: 24px;
                border-radius: 50%;
                height: 24px;
                transition: @transition;
            }
        }
    }

    &.expansion {
        width: 135px;
        transition: @transition;

        .logo {
            p {
                display: flex;
            }
        }

        .btnList {
            div {
                span {
                    p {
                        display: flex;
                    }
                }
            }

            .bottom {
                i {
                    transform: rotate(180deg);
                    transition: @transition;
                }
            }
        }
    }
}

.dark {
    .nav {
        .btnList {
            div {
                span {

                    &::before,
                    &::after {
                        background: radial-gradient(circle at 0% 0%,
                                transparent 12px,
                                #0f0f0f 12.3px);
                    }
                }
            }
        }
    }
}
</style>
