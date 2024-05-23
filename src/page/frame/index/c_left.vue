<template>
    <div>
        <div class="index-logo"></div>
        <div>
            <xmv-menu :data="g_menu" ref="g_menu_ref" @nodeClick="handleMenuNodeClick"></xmv-menu>
        </div>
    </div>
</template>

<script>
import {defineComponent ,ref ,onMounted ,nextTick} from 'vue'
import { useRouter ,useRoute} from 'vue-router';
import http from 'util/http'
import {g_user ,setUser ,clearUser ,g_menu ,g_menu_ref} from 'data/runtime'
import {isEmpty ,tranListToTreeDate} from 'util/data'
export default defineComponent({
    name:"",
    setup(props ,context) {

        const router = useRouter()
        const route = useRoute()

        const menuRef = ref(null)

        const handleMenuNodeClick = (node)=>{
            router.push({ path: node.value });
        }

        return {g_menu_ref ,g_menu ,menuRef ,handleMenuNodeClick}
    }
})
</script>

<style lang="less" scoped>

    .index-logo{
        height: 60px;
        background-color: @level-2-color;
    }

</style>
