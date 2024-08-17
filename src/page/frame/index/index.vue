<template>
    <xmv-layout headHval="60px" lWval="200px" mode="l_tr">
        <template #top>
            <c-top></c-top>
        </template>
        <template #left>
            <div class="index-left">
                <c-left></c-left>
            </div>
        </template>
        <template #right>
            <div class="index-right">
                <router-view v-if="isRouterShow"></router-view>
            </div>
        </template>
    </xmv-layout>
</template>

<script>
import {defineComponent,onMounted,nextTick,ref} from 'vue'
import cLeft from './c_left'
import cTop from './c_top'
import { useRouter ,useRoute} from 'vue-router';
import http from 'util/http'
import {g_user ,setUser ,clearUser ,g_menu ,g_menu_ref} from 'data/runtime'
import {isEmpty ,tranListToTreeDate} from 'util/data'
export default defineComponent({
    name:"",
    components : {cLeft,cTop},
    setup(props ,context) {

        const router = useRouter()
        const route = useRoute()

        const isRouterShow = ref(false)

        onMounted(()=>{
            http.get('session/user').then(res=>{
                if (res ==null || route.path == "/login"){
                    clearUser()
                    router.push('/login')
                }
                else
                {
                    setUser(res)
                    isRouterShow.value = true
                    let matchs = route.matched
                    http.get('user/menu/query' ,{id:res.id}).then(data =>{
                        data.forEach((tmp)=>{
                            tmp.name = tmp.name
                            tmp.value = (tmp.url != "" ? tmp.url : tmp.id)
                        })
                        let list = tranListToTreeDate(data, 0, "id", "parentId")
                        g_menu.value = list

                        nextTick(()=>{
                            let routePath
                            if (isEmpty(matchs) || matchs.length == 1){
                                if (!isEmpty(g_user) ){
                                    let menu = data.find(tmp => !isEmpty(tmp.url) && tmp.parentId != 0)
                                    routePath = menu.url
                                }
                                router.push(routePath)
                                g_menu_ref.value.activeNode(routePath)
                            }
                            else{
                                g_menu_ref.value.activeNode(route.path)
                            }
                        })
                    })
                    
                }
            })         
        })

        return {isRouterShow}
    }
})
</script>

<style lang="less" scoped>
    .index-left{
        height: 100%;
        border-right: 1px solid #ddd;
    }
    .index-right{
        height: 100%;
        padding: 10px;
    }
</style>
