<script lang="ts" setup>
import { SupportedShowName } from '@mora-light/core/types/transmit';
import { PropType, computed } from 'vue';

const props = defineProps({
    keyName: {
        type: String,
        required: true,
    },
    name: {
        type: String as PropType<SupportedShowName>,
        required: true,
    },
});
const showName = computed(() => {
    switch (props.name) {
        case 'BoolView':
            return 'Tips';
        case 'ImageView':
            return 'Image';
        case 'TableView':
            return 'Table';
        case 'TextView':
            return 'Text';
        case 'VecView':
            return 'List';
        case 'OptView':
            return 'Option';
        case 'RecordView':
            return 'Object';
        case 'VariantView':
            return 'Enumerate';
        case 'TupleView':
            return 'Tuple';
    }
});
</script>

<template>
    <div class="show-view-name-content">
        <template v-if="props.keyName">
            <span>{{ `${props.keyName} : ` }}</span>
        </template>
        <span>{{ showName }}</span>
    </div>
</template>

<style lang="less" scoped>
.show-view-name-content {
    width: 100%;
    font-weight: 400;
    font-size: 14px;
    color: #000000;
    text-align: left;
    span{
        &:first-child {
            @apply dark:(text-light-900);
        }
        &:last-child {
            @apply dark:(text-light-900/60);
        }
    }
}
</style>
