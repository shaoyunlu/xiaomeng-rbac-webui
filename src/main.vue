<template>
    <router-view></router-view>
</template>

<script>
import {defineComponent,onMounted,nextTick} from 'vue'
import {isEmpty} from 'util/data'
import {useRouter} from 'vue-router'
import http from 'util/http'
import {g_user ,setUser ,clearUser} from 'data/runtime'
import {messageDialog} from 'util/dom'
export default defineComponent({
    name:"",
    setup(props ,context) {

        const router = useRouter()

        const validateRoute = (to,next)=>{
            let flag = false
            let roles = g_user.roles
            roles.forEach(role=>{
                role.permissionDtos.forEach(permission=>{
                    if (permission.expression == to.path){
                        flag = true
                        next()
                    }
                })
            })
            if (!flag){
                messageDialog('你没有权限访问该页面。' ,'error')
            }
        }

        onMounted(()=>{
            router.beforeEach((to ,from ,next)=>{
                if (to.path == "/login" || to.path == '/'){
                    next()
                }else{
                    if (isEmpty(g_user.id)){
                        http.get('session/user').then(res=>{
                            if (res ==null){
                                clearUser()
                                router.push('/login')
                            }else{
                                setUser(res)
                                validateRoute(to,next)
                            }
                        })
                    }else{
                        validateRoute(to,next)
                    }
                }
            })
        })
        return {}
    }
})
</script>

<style lang="" scoped></style>
