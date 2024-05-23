<template>
    <div class="index-top">
        <div class="right">
            <xmv-dropdown @item-click="handleItemClick" extra-class="index-top-dropdown">
                <div class="user">
                    {{ g_user.realName.substr(0,1) }}
                </div>
                <template #dropdown>
                    <xmv-dropdown-menu>
                        <xmv-dropdown-item item-value="1">修改密码</xmv-dropdown-item>
                        <xmv-dropdown-item item-value="2">退出</xmv-dropdown-item>
                    </xmv-dropdown-menu>
                </template>
            </xmv-dropdown>
        </div>
    </div>
    <xmv-dialog v-model="dialogFormVisible" title="密码修改" width="500px">
        <xmv-form :mode="formMode" :rules="formRule" ref="formRef" label-width="100px" @keydown.enter="handleFormClick">
            <xmv-form-item label="旧密码" prop="oldPassword">
                <xmv-input v-model="formMode.oldPassword" type="password"/>
            </xmv-form-item>
            <xmv-form-item label="新密码" prop="password">
                <xmv-input v-model="formMode.password" type="password"/>
            </xmv-form-item>
            <xmv-form-item label="确认新密码" prop="checkPassword">
                <xmv-input v-model="formMode.checkPassword" type="password"/>
            </xmv-form-item>
            <xmv-form-item class="xmv-form-item--button">
                <xmv-button type="primary" @click="handleFormClick">提交</xmv-button>
            </xmv-form-item>
        </xmv-form>
    </xmv-dialog>
    
</template>

<script>
import {defineComponent, reactive ,ref} from 'vue'
import {useRouter} from 'vue-router'
import {g_user,clearUser,g_menu} from 'data/runtime'
import {loadingOpen,loadingClose,messageDialog,confirmDialog} from 'util/dom'
import http from 'util/http'
export default defineComponent({
    name:"",
    setup(props ,context) {

        const router = useRouter()

        const dialogFormVisible = ref(false)
        const buttonDisabledRef = ref(false)
        const formRef = ref(null)

        const validatePassword = ()=>{
            return new Promise((resolve ,reject)=>{
                if (formMode.password == formMode.checkPassword)
                    resolve()
                else
                    reject('密码不一致。')
            })
        }

        const formMode = reactive({
            oldPassword : "",
            password : "",
            checkPassword : ""
        })

        const formRule = reactive({
            oldPassword : [{required : true}],
            password : [{required : true}],
            checkPassword : [{required : true ,validator : validatePassword ,trigger:'blur'}]
        })

        const handleItemClick = (val)=>{
            switch (val) {
                case "1":
                    handleUpdatePassword()
                    break;
                case "2":
                    handleExit()
                    break;
                default:
                    break;
            }
        }

        const handleExit = ()=>{
            confirmDialog('确认要退出么？' ,()=>{
                http.post('/logout').then(res=>{
                    g_menu.value = []
                    router.push('/login')
                })
            })
        }

        const handleUpdatePassword = ()=>{
            formRef.value.reset()
            dialogFormVisible.value = true
        }

        const handleFormClick = ()=>{
            formRef.value.validate().then(()=>{
                if (formMode.password == formMode.oldPassword){
                    messageDialog('新旧密码不允许相同，请重新输入。' ,'error')
                    formRef.value.reset()
                    return false
                }
                ajaxUpdatePasswrod()
            })
        }

        const ajaxUpdatePasswrod = ()=>{
            loadingOpen()
            http.post("user/password/update" ,{
                id : g_user.id,
                oldPassword : formMode.oldPassword,
                password : formMode.password
            }).then(()=>{
                dialogFormVisible.value = false
                messageDialog('操作成功，需要您进行重新登陆，马上为您转到登录页面...' ,'success',3000)
                clearUser()
                setTimeout(()=>{
                    router.push('/login')
                },3000)
                
            }).catch((res)=>{
                messageDialog(res ,'error')
            }).finally(()=>{
                loadingClose()
                formRef.value.reset()
            })
        }

        return {g_user ,formRef, formMode, formRule, dialogFormVisible,buttonDisabledRef,
                handleItemClick,handleUpdatePassword,handleExit,handleFormClick}
    }
})
</script>

<style lang="less">
    .index-top{
        display: flex;
        align-items: center;
        flex-direction: row-reverse;
        height: 100%;
        background-color: @level-1-color;
        padding-right: 50px;

        .user{
            display: inline-block;
            background-color: palegoldenrod;
            border-radius: 40px;
            width: 40px;
            height: 40px;
            line-height: 40px;
            font-size: 20px;
            text-align: center;
            cursor: default;
        }
    }

    .index-top-dropdown{
        z-index: 1999 !important;
    }
</style>
