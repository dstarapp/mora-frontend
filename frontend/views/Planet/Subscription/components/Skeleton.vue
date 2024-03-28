<template>
    <el-skeleton class="item" animated>
        <template #template>
            <div class="user">
                <el-skeleton-item variant="image" class="header" />
                <span>
                    <strong>
                        <el-skeleton-item variant="text" style="width: 100px" />
                    </strong>
                </span>
            </div>
            <div class="key">
                <p>
                    <el-skeleton-item variant="text" style="width: 100%" />
                    <el-skeleton-item variant="text" style="width: 100%" />
                    <el-skeleton-item variant="text" style="width: 50px" />
                </p>
            </div>
            <div class="price">
                <el-skeleton-item variant="text" style="width: 80px; height: 32px" />
                <el-skeleton-item variant="text" style="width: 80px; height: 32px" />
            </div>
            <div class="expired">
                <strong><el-skeleton-item variant="text" style="width: 120px" /></strong>
                <p>
                    <el-skeleton-item variant="text" style="width: 40px" />
                </p>
            </div>
        </template>
    </el-skeleton>
</template>

<style lang="less" scoped>
.item {
    background: @bg-color;
    .border-radius(25);
    .padding(26, 25, 23, 25);
    flex-direction: column;
    cursor: pointer;
    border: 2px solid transparent;
    transition: @transition;
    position: relative;
    overflow: hidden;
    @apply dark:(bg-dark-600);

    .isBlack {
        position: absolute;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(2px);
        left: 0;
        top: 0;
        .border-radius(25);
        z-index: 2;
        display: flex;
        justify-content: flex-end;

        .icon-blacklist {
            color: @text-color-grey;
            .font-size(22);
            .margin(26, 25, 0, 0);
        }
    }

    .user {
        display: flex;

        .header {
            .center();
            .width(50);
            .height(50);
            border-radius: 50%;
            overflow: hidden;

            img {
                .width(50);
            }
        }

        span {
            display: flex;
            flex: 1;
            flex-direction: column;
            .height(50);
            justify-content: center;
            .margin(0, 0, 0, 20);

            strong {
                font-style: normal;
                font-weight: 400;
                .font-size(16);
                .line-height(19);
                color: @text-color;
                display: flex;
                .height(18);
                align-items: center;

                i {
                    display: flex;
                    background: url(@/assets/svg/permanent.svg) no-repeat center center;
                    background-size: 100% 100%;
                    .width(22);
                    .height(18);
                    .margin(0, 0, 0, 6);
                }
            }

            em {
                font-style: normal;
                font-weight: 400;
                .font-size(14);
                .line-height(17);
                color: @text-fcolor;
                .margin(6);
            }
        }
    }

    .key {
        display: flex;
        justify-content: space-between;
        .margin(30);

        p {
            flex: 1;
            color: @text-fcolor;
            .margin(0, 5, 0, 0);
        }

        .icon-copy {
            .center();
            .height(30);
            .width(30);
            color: @text-color-grey;
            border: 2px solid @border-color;
            .font-size(16);
            .border-radius(10);
            cursor: pointer;
            transition: @transition;
            flex-shrink: 0;
            .margin(0, 0, 0, 10);

            &:hover {
                transition: @transition;
                border-color: @bg-color-body-active;
                color: @text-active;
            }
        }
    }

    .price {
        display: flex;
        width: 100%;
        justify-content: space-between;
        .padding(16, 0, 27, 0);

        p {
            font-style: normal;
            color: @text-color;
            .font-size(32);
            .line-height(39);

            i {
                .font-size(14);
                .line-height(16);
                font-style: normal;
                font-weight: 400;
                color: @text-color-grey;
                .margin(0, 0, 0, 5);
            }

            em {
                .font-size(24);
                .line-height(29);
                font-style: normal;
            }
        }
    }

    .expired {
        border-top: 1px solid @border-color;
        .padding(15, 0, 0, 0);
        position: relative;
        @apply dark:(border-dark-100);
        &.mt15 {
            .margin(15);
        }

        em {
            font-style: normal;
            font-weight: 400;
            .font-size(14);
            color: @text-color;
        }

        strong {
            display: block;
        }

        p {
            position: absolute;
            right: 0;
            font-weight: 500;
            .font-size(14);
            .line-height(19);
            color: @text-active;
            display: none;
        }
    }

    &:hover {
        transition: @transition;
        border: 2px solid @border-color;
        .border-radius(25);
        @apply dark:(border-dark-100);
        .expired {
            p {
                display: flex;
                z-index: 3;
            }
        }

        .permanentPrice {
            strong {
                display: flex;
                z-index: 3;
            }
        }
    }
}
@media screen and (min-width: 1040px) and (max-width: 1240px) {
    .item {
        .expired {
            p {
                display: block;
                z-index: 3;
            }
        }
        .permanentPrice {
            strong {
                display: block;
                z-index: 3;
            }
        }
    }
}

@media screen and (min-width: 750px) and (max-width: 1040px) {
    .item {
        .key {
            .icon-copy {
                .width(50);
                .height(50);
            }
        }
        .expired {
            p {
                display: block;
                z-index: 3;
            }
        }
        .permanentPrice {
            strong {
                display: block;
                z-index: 3;
            }
        }
    }
}

@media screen and (min-width: 0) and (max-width: 750px) {
    .item {
        .user {
            .header {
                .width(90);
                .height(90);

                img {
                    width: 100%;
                    border-radius: 100%;
                }
            }

            span {
                strong {
                    .margin(10, 0, 0, 0);
                    .font-size(18);
                }

                em {
                    .margin(8, 0, 0, 0);
                }
            }
        }

        .key {
            .margin(10, 0, 0, 0);
            p {
                .font-size(14);
                .line-height(16);
            }
            .icon-copy {
                .width(50);
                .height(50);
            }
        }
        .price {
            .padding(20, 0, 20, 0);
        }
        .expired {
            p {
                display: block;
                z-index: 3;
                top: 25px;
            }
        }
        .permanentPrice {
            strong {
                display: block;
                z-index: 3;
            }
        }
    }
}
</style>
