<template>
    <el-dialog class="w700" :title="$t('editor.formula.title')" v-model="dialogVisible" :before-close="handleClose"
        @closed="afterClose">
        <div class="formula" @click="openItemIndex = ''">
            <div class="select">
                <div class="item" @click.stop="openItemIndex = 1">
                    <div class="mord" v-html="renderTeX('\\alpha')"></div>
                    <div class="mord" v-html="renderTeX('\\beta')"></div>
                    <div class="mord" v-html="renderTeX('\\Delta')"></div>
                    <i></i>

                    <transition name="el-fade-in-linear">
                        <div class="allBtn" v-show="openItemIndex === 1">
                            <div class="mord" v-for="(item, index) in mordBtn.btn1" :key="index"
                                v-html="renderTeX(item)" @click="add(item)"></div>
                        </div>
                    </transition>
                </div>
                <div class="item" @click.stop="openItemIndex = 2">
                    <div class="mord" v-html="renderTeX('\\times')"></div>
                    <div class="mord" v-html="renderTeX('\\div')"></div>
                    <div class="mord" v-html="renderTeX('\\exists')"></div>
                    <i></i>

                    <transition name="el-fade-in-linear">
                        <div class="allBtn" v-show="openItemIndex === 2">
                            <div class="mord" v-for="(item, index) in mordBtn.btn2" :key="index"
                                v-html="renderTeX(item)" @click="add(item)"></div>
                        </div>
                    </transition>
                </div>
                <div class="item" @click.stop="openItemIndex = 3">
                    <div class="mord" v-html="renderTeX('\\leq')"></div>
                    <div class="mord" v-html="renderTeX('\\ne')"></div>
                    <div class="mord" v-html="renderTeX('\\supset')"></div>
                    <i></i>

                    <transition name="el-fade-in-linear">
                        <div class="allBtn" v-show="openItemIndex === 3">
                            <div class="mord" v-for="(item, index) in mordBtn.btn3" :key="index"
                                v-html="renderTeX(item)" @click="add(item)"></div>
                        </div>
                    </transition>
                </div>
                <div class="item" @click.stop="openItemIndex = 4">
                    <div class="mord" v-html="renderTeX('\\left[ x \\right]')"></div>
                    <div class="mord" v-html="renderTeX('\\tilde{x}')"></div>
                    <div class="mord" v-html="renderTeX('\\sqrt{x}')"></div>
                    <i></i>

                    <transition name="el-fade-in-linear">
                        <div class="allBtn" v-show="openItemIndex === 4">
                            <div class="mord" v-for="(item, index) in mordBtn.btn4" :key="index"
                                v-html="renderTeX(item)" @click="add(item)"></div>
                        </div>
                    </transition>
                </div>
                <div class="item" @click.stop="openItemIndex = 5">
                    <div class="mord" v-html="renderTeX('\\leftarrow')"></div>
                    <div class="mord" v-html="renderTeX('\\rightarrow')"></div>
                    <div class="mord" v-html="renderTeX('\\Rightarrow')"></div>
                    <i></i>

                    <transition name="</transition>el-fade-in-linear">
                        <div class="allBtn" v-show="openItemIndex === 5">
                            <div class="mord" v-for="(item, index) in mordBtn.btn5" :key="index"
                                v-html="renderTeX(item)" @click="add(item)"></div>
                        </div>
                    </transition>
                </div>
            </div>
            <el-input ref="textareaDom" class="textarea" v-model="formula" type="textarea" resize="none"
                :placeholder="$t('editor.formula.formulaPlaceholder')" @input="textareaChange" />
        </div>

        <div class="preview" ref="previewDom" @click="openItemIndex = ''"></div>

        <div class="mora-button">
            <div class="cancel" @click="cancel">
                {{ $t('editor.formula.cancel') }}
            </div>
            <div class="confirm" @click="confirm">
                {{ $t('editor.formula.confirm') }}
            </div>
        </div>
    </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import { t } from '@/i18n';
import katex from 'katex';
import 'katex/dist/katex.css';

export default defineComponent({
    name: 'Formula',
    emits: ['componentClose'],
    props: {
        insertCallback: { type: Function },
        componentDefaultValue: { type: String },
    },
    setup(props, context) {
        const dialogVisible = ref(true);
        const formula = ref();
        const formulaRes = ref();
        const previewDom = ref();
        const textareaDom = ref();
        const openItemIndex = ref();

        const mordBtn = ref({
            btn1: [
                '\\alpha',
                '\\beta',
                '\\gamma',
                '\\delta',
                '\\epsilon',
                '\\varepsilon',
                '\\zeta',
                '\\eta',
                '\\theta',
                '\\vartheta',
                '\\iota',
                '\\kappa',
                '\\lambda',
                '\\mu',
                '\\nu',
                '\\xi',
                '\\pi',
                '\\varpi',
                '\\rho',
                '\\varrho',
                '\\sigma',
                '\\varsigma',
                '\\tau',
                '\\upsilon',
                '\\phi',
                '\\varphi',
                '\\chi',
                '\\psi',
                '\\omega',
                '\\Gamma',
                '\\Delta',
                '\\Theta',
                '\\Lambda',
                '\\Xi',
                '\\Pi',
                '\\Sigma',
                '\\Upsilon',
                '\\Phi',
                '\\Psi',
                '\\Omega',
            ],
            btn2: [
                '\\times',
                '\\div',
                '\\cdot',
                '\\pm',
                '\\mp',
                '\\ast',
                '\\star',
                '\\circ',
                '\\bullet',
                '\\oplus',
                '\\ominus',
                '\\oslash',
                '\\otimes',
                '\\odot',
                '\\dagger',
                '\\ddagger',
                '\\vee',
                '\\wedge',
                '\\cap',
                '\\cup',
                '\\aleph',
                '\\Re',
                '\\Im',
                '\\top',
                '\\bot',
                '\\infty',
                '\\partial',
                '\\forall',
                '\\exists',
                '\\neg',
                '\\angle',
                '\\triangle',
                '\\diamond',
            ],
            btn3: [
                '\\leq',
                '\\geq',
                '\\prec',
                '\\succ',
                '\\preceq',
                '\\succeq',
                '\\ll',
                '\\gg',
                '\\equiv',
                '\\sim',
                '\\simeq',
                '\\asymp',
                '\\approx',
                '\\ne',
                '\\subset',
                '\\supset',
                '\\subseteq',
                '\\supseteq',
                '\\in',
                '\\ni',
                '\\notin',
            ],
            btn4: [
                'x_{a}',
                'x^{b}',
                'x_{a}',
                '^{b}',
                '\\bar{x}',
                '\\tilde{x}',
                '\\frac{a}{b}',
                '\\sqrt{x}',
                '\\sqrt[n]{x}',
                '\\bigcap_{a}^{b}',
                '\\bigcup_{a}^{b}',
                '\\prod_{a}^{b}',
                '\\coprod_{a}^{b}',
                '\\left( x \\right)',
                '\\left\\{ x \\right\\}',
                '\\left| x \\right|',
                '\\int_{a}^{b}',
                '\\oint_{a}^{b}',
                '\\sum_{a}^{b}{x}',
                '\\lim_{a \\rightarrow b}{x}',
            ],
            btn5: [
                '\\leftarrow',
                '\\rightarrow',
                '\\leftrightarrow',
                '\\Leftarrow',
                '\\Rightarrow',
                '\\Leftrightarrow',
                '\\uparrow',
                '\\downarrow',
                '\\updownarrow',
                '\\Uparrow',
                '\\Downarrow',
                '\\Updownarrow',
            ],
        });

        const add = (text) => {
            textareaDom.value.focus();
            let selectionStart = textareaDom.value.$el.children[0].selectionStart;
            if (!formula.value) {
                formula.value = text;
                return;
            }
            let str = formula.value.split('');
            str.splice(selectionStart, 0, text);
            formula.value = str.join('');
            textareaChange();
        };

        const handleClose = () => {
            dialogVisible.value = false;
        };

        const afterClose = () => {
            context.emit('componentClose');
        };

        const confirm = () => {
            if (!formula.value) {
                ElMessage.error(t('editor.formula.noFormulaValue'));
                return;
            }
            props.insertCallback &&
                props.insertCallback({
                    formula: formula.value.replace(/^[\s$]*|\s*$/g, '').replace(/\$+/g, ''),
                });

            dialogVisible.value = false;
        };

        const cancel = () => {
            dialogVisible.value = false;
        };

        const textareaChange = () => {
            let str = formula.value;
            str = str.replace(/^[\s$]*|\s*$/g, '').replace(/\$+/g, '');
            const macros = {
                '\\RR': '\\mathbb{R}',
            };
            katex.render(str, previewDom.value, {
                displayMode: true,
                globalGroup: true,
                macros,
                throwOnError: false,
            });
        };

        const renderTeX = (text) => {
            var html = katex.renderToString(text, {
                throwOnError: false,
            });
            return html;
        };

        onMounted(() => {
            if (props.componentDefaultValue) {
                formula.value = props.componentDefaultValue;
                nextTick(() => {
                    textareaChange();
                    textareaDom.value.focus();
                });
            }
        });

        return {
            formula,
            formulaRes,
            dialogVisible,
            previewDom,
            mordBtn,
            textareaDom,
            openItemIndex,
            add,
            renderTeX,
            textareaChange,
            handleClose,
            afterClose,
            confirm,
            cancel,
        };
    },
});
</script>

<style scoped lang="less">
.formula {
    display: flex;
    flex-direction: column;
    .border-radius(10);
    border: 1px solid #dddddd;
    @apply dark:(border-transparent);

    .select {
        display: flex;
        .height(50);
        height: 50px;
        background: @bg-color-grey;
        .border-radius-top(9);
        @apply dark:(bg-dark-50);

        .item {
            display: flex;
            height: 50px;
            align-items: center;
            .padding(0, 12, 0, 12);
            cursor: pointer;
            position: relative;

            .mord {
                font-size: 14px;
                color: @text-fcolor;
                @apply dark:(text-light-900/80);
            }

            i {
                width: 0;
                height: 0;
                border-width: 0 4px 4px;
                border-style: solid;
                border-color: transparent transparent @text-fcolor;
                margin-left: 5px;
            }

            .allBtn {
                display: flex;
                position: absolute;
                bottom: 49px;
                left: -186px;
                width: 100%;
                flex-wrap: wrap;
                width: 417px;
                padding: 15px 13px 6px 14px;
                box-shadow: 0 0 15px rgba(0, 0, 0, 0.15);
                background: #ffffff;
                border-radius: 10px;
                @apply dark:(bg-dark-300);

                &:after {
                    content: '';
                    left: 208px;
                    position: absolute;
                    bottom: -5px;
                    width: 0;
                    height: 0;
                    border-top: 6px solid #fff;
                    border-right: 6px solid transparent;
                    border-left: 6px solid transparent;
                }

                .mord {
                    .center();
                    margin-bottom: 5px;
                    width: 30px;
                    height: 30px;
                    border: 1px solid transparent;
                    transition: @transition;
                    border-radius: 8px;

                    &:hover {
                        border: 1px solid #dddddd;
                        transition: @transition;
                    }
                }
            }

            // &:hover {
            //     .allBtn {
            //         display: flex;
            //     }
            // }

            &:nth-child(4) {
                .allBtn {
                    .mord {
                        width: 78px;
                        height: 45px;
                    }
                }
            }
        }
    }

    :deep(.el-textarea) {
        .border-radius-bottom(9);
    }

    .textarea {
        background: #f9f9f9;
        @apply dark:(bg-dark-300);

        :deep(.el-textarea__inner) {
            .padding(11, 23, 11, 23);
            .height(129);
            .font-size(14);
        }
    }
}

.preview {
    width: 100%;
    .height(180);
    background: #f9f9f9;
    border: 2px dashed #dddddd;
    .border-radius(10);
    .margin(30);
    .padding(11, 23, 11, 23);
    overflow-y: scroll;
    @apply dark:(bg-dark-300 border-dark-50);

    :deep(.katex) {
        display: inline-block;
        width: 100%;
        height: 100%;
        text-align: left;
        .font-size(18);
        color: @text-color;
        @apply dark:(text-light-900/80);
    }
}

.mora-button {
    display: flex;
    .padding(0, 50, 0, 50);
    .margin(38, 0, 0, 0);

    div {
        .border-radius(10);
        .center();
        .height(45);
        min-height: 45px;
        flex: 1;
        font-style: normal;
        font-weight: 350;
        .font-size(16);
        .line-height(19);
        cursor: pointer;
        transition: @transition;
    }

    .cancel {
        .margin(0, 30, 0, 0);
        border: 1px solid @border-color;
        color: @text-fcolor;
    }

    .confirm {
        background: @bg-color-body-active;
        color: @text-color-inverse;

        &.loading {
            transition: @transition;
            background: @bg-color-body-loading;
        }

        img {
            .margin(0, 5, 0, 0);
        }
    }
}

.dark {
    .formula {
        .select {
            .item {
                i {
                    border-color: transparent transparent#cacaca;
                }

                .allBtn {
                    &:after {
                        border-top: 6px solid #2d2d2d;
                    }
                }
            }
        }
    }
}
</style>
