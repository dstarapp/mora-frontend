<template>
    <div class="container-404">
        <div class="planet-box">
            <div class="eye">
                <div class="upper-pupil"></div>
                <div class="iris"></div>
                <div class="lower-pupil"></div>
            </div>
            <div class="planet-1"><img src="@/assets/svg/planet-404-1.svg" /></div>
            <div class="planet-2"><img src="@/assets/svg/planet-404-2.svg" /></div>
            <div class="planet-3"><img src="@/assets/svg/planet-404-3.svg" /></div>
            <div class="planet-4"><img src="@/assets/svg/planet-404-4.svg" /></div>
            <img :src="store.state.theme === 'light' ? Light_404 : Dark_404" />
        </div>
        <p>{{ $t('found.tip') }}</p>
        <button @click="goUrl">{{ $t('found.go') }}</button>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import store from '@/store';
import Light_404 from '@/assets/svg/light-404.svg';
import Dark_404 from '@/assets/svg/dark-404.svg';

export default defineComponent({
    setup() {
        const router = useRouter();

        const goUrl = () => {
            router.push('/');
        };

        return {
            goUrl,
            store,
            Light_404,
            Dark_404,
        };
    },
});
</script>

<style lang="less" scoped>
.container-404 {
    position: fixed;
    width: 40%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    .planet-box {
        width: 100%;
        position: relative;

        .eye {
            width: 150px;
            height: 150px;
            background: white;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 0.12rem;
            clip-path: circle(50% at center);
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-51%, -58%);

            .iris {
                width: 40%;
                height: 40%;
                background: black;
                border-radius: 50%;
                animation: movement 6s ease-in-out infinite;
            }

            .upper-pupil,
            .lower-pupil {
                width: 100%;
                height: 20px;
                background: #806ef2;
                position: absolute;
                animation: blink 6s ease-in-out infinite;
                z-index: 1;
            }

            .upper-pupil {
                top: 0;
            }

            .lower-pupil {
                bottom: 0;
            }
        }

        img {
            width: 100%;
            height: 100%;
        }

        .planet-1,
        .planet-2,
        .planet-3,
        .planet-4 {
            position: absolute;

            img {
                width: 80%;
            }
        }

        .planet-1 {
            left: -40px;
            top: 10px;
            animation: planetOne 4s linear infinite;
            animation-direction: alternate;
        }

        .planet-2 {
            left: 15px;
            bottom: 10px;
            animation: planetTwo 5s linear infinite;
            animation-direction: alternate;
        }

        .planet-3 {
            top: -50px;
            right: 40px;
            animation: planetThree 4s linear infinite;
            animation-direction: alternate;
        }

        .planet-4 {
            right: -120px;
            top: 100px;
            animation: planetFour 4s linear infinite;
            animation-direction: alternate;
        }
    }

    p {
        width: 100%;
        padding: 40px 0;
        text-align: center;
        font-size: 48px;
    }

    button {
        width: 200px;
        padding: 10px 0;
        text-align: center;
        display: block;
        margin: 0 auto;
        border: 2px solid #806ef2;
        color: #806ef2;
        border-radius: 15px;
        transition: 0.3s all linear;

        &:hover {
            cursor: pointer;
            background-color: #806ef2;
            color: white;
            transition: 0.3s all linear;
        }
    }
}

@keyframes planetOne {
    0% {
        left: -80px;
        top: 100px;
    }

    100% {
        left: -40px;
        top: 10px;
    }
}

@-webkit-keyframes planetOne {
    0% {
        left: -80px;
        top: 100px;
    }

    100% {
        left: -40px;
        top: 10px;
    }
}

@keyframes planetTwo {
    0% {
        left: 150px;
        bottom: -40px;
    }

    100% {
        left: 15px;
        bottom: 10px;
    }
}

@-webkit-keyframes planetTwo {
    0% {
        left: 150px;
        bottom: -40px;
    }

    100% {
        left: 15px;
        bottom: 10px;
    }
}

@keyframes planetThree {
    0% {
        top: -30px;
        right: 10px;
    }

    100% {
        top: -50px;
        right: 40px;
    }
}

@-webkit-keyframes planetThree {
    0% {
        top: -30px;
        right: 10px;
    }

    100% {
        top: -50px;
        right: 40px;
    }
}

@keyframes planetFour {
    0% {
        right: -50px;
        top: 160px;
    }

    100% {
        right: -120px;
        top: 100px;
    }
}

@-webkit-keyframes planetFour {
    0% {
        right: -50px;
        top: 160px;
    }

    100% {
        right: -120px;
        top: 100px;
    }
}

@keyframes movement {
    0%,
    10% {
        transform: translateX(0);
    }

    20% {
        transform: translateX(-80%);
    }

    30%,
    80% {
        transform: translateX(0);
    }

    90% {
        transform: translateX(80%);
    }

    100% {
        transform: translateX(0);
    }
}

@keyframes blink {
    0%,
    30% {
        height: 20px;
    }

    32% {
        height: 40px;
    }

    34% {
        height: 20px;
    }

    36% {
        height: 40px;
    }

    38%,
    50% {
        height: 20px;
    }

    60%,
    70% {
        height: 45px;
    }

    80%,
    100% {
        height: 20px;
    }
}

@media screen and (min-width: 751px) and (max-width: 1024px) {
    .container-404 {
        width: 60%;

        .planet-box {
            .eye {
                width: 120px;
                height: 120px;
                transform: translate(-53%, -58%);
                margin: 0 0.2rem;
            }
        }
    }
}

@media screen and (min-width: 0) and (max-width: 750px) {
    .container-404 {
        width: 70%;

        .planet-box {
            .eye {
                width: 80px;
                height: 80px;
                transform: translate(-60%, -58%);
                margin: 0 0.4rem;
            }

            .planet-1,
            .planet-2,
            .planet-3,
            .planet-4 {
                img {
                    width: 60%;
                }
            }
        }

        p {
            font-size: 30px;
        }

        button {
            width: 100px;
            font-size: 14px;
        }
    }
}
</style>
