<template>
    <div class="wrap-login-form">
        <div class="login-form">
            <h1>后台管理系统</h1>
            <xmv-form :mode="formMode" :rules="formRule" ref="formRef" label-width="100px" @keydown.enter="handleFormClick">
                <xmv-form-item label="" prop="name">
                    <xmv-input v-model="formMode.name" ref="userInputRef"/>
                </xmv-form-item>
                <xmv-form-item label="" prop="password">
                    <xmv-input v-model="formMode.password" type="password"></xmv-input>
                </xmv-form-item>
                <xmv-form-item label="" prop="validateNum" class="form-item-code">
                    <xmv-input v-model="formMode.validateNum"></xmv-input>
                    <img class="__image" :style="{opacity : opacityRef}"  :src="srcRef" @click="handleImgClick"/>
                </xmv-form-item>
                
                <div class="__button">
                    <xmv-button type="primary" @click="handleFormClick" :disabled="buttonDisabledRef">提交</xmv-button>
                </div>
            </xmv-form>
        </div>
    </div>
</template>

<script>
import {defineComponent, nextTick, onMounted, reactive ,ref} from 'vue'
import http from 'util/http'
import {blobHttp} from 'util/http'
import {loadingOpen,loadingClose,messageDialog} from 'util/dom'
import {useRouter} from 'vue-router'
import {setUser} from 'data/runtime'
export default defineComponent({
    name:"",
    setup(props ,context) {
        const router = useRouter()
        const formRef = ref(null)
        const buttonDisabledRef = ref(false)
        const userInputRef = ref(null)

        const srcRef = ref('')
        const opacityRef = ref(0)

        const formMode = reactive({
            name : '',
            password : '',
            validateNum : ''
        })

        const formRule = reactive({
            name : [{required : true}],
            password : [{required : true ,trigger:'blur'}],
            validateNum : [{required : true ,trigger:'blur'}]
        })

        const handleImgClick = ()=>{
            createCaptcha()
        }
        const handleFormClick = ()=>{
            if (buttonDisabledRef.value){
                console.log('避免重复提交')
                return false
            }
            buttonDisabledRef.value = true
            formRef.value.validate().then(()=>{
                loadingOpen()
                http.post('login' ,formMode).then(data=>{
                    messageDialog('登录成功，正在为您跳转...','success',1000)
                    setUser(data)
                    setTimeout(()=>{
                        // TO-DO
                        router.push('/')
                    } ,1000)
                }).catch(error=>{
                    createCaptcha()
                    formMode.password = ''
                    formMode.validateNum = ''
                    buttonDisabledRef.value = false
                }).finally(()=>{
                    loadingClose()
                })
            }).catch(()=>{
                buttonDisabledRef.value = false
            })
        }

        const createCaptcha = ()=>{
            blobHttp.get('captcha').then((data)=>{
                const url = URL.createObjectURL(data.data)
                opacityRef.value = 1
                srcRef.value = url
            })
        }

        onMounted(()=>{
            userInputRef.value.focus()
            createCaptcha()
        })

        return {formRef ,formMode ,formRule ,srcRef ,buttonDisabledRef,userInputRef,
                opacityRef,
                handleImgClick ,handleFormClick}
    }
})
</script>

<style lang="less">

    .wrap-login-form{
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-image: linear-gradient(120deg, #3498db, #8e44ad);
    }

    .login-form{
        width: 360px;
        height: 580px;
        border-radius: 10px;
        display: flex;
        flex-direction: column;
        align-items: center;
        background: #f1f1f1;

        h1{
            margin-top: 80px;
            margin-bottom: 60px;
        }

        .xmv-input{
            width: 260px;
            border-bottom: 2px solid #adadad;
        }

        .xmv-form-item {
            display: flex;
            margin-bottom: 28px;
        }

        .xmv-form-item.is-required .xmv-form-item__label:before {
            content: "";
            color: var(--xmv-color-danger);
            margin-right: 4px;
        }

        .xmv-form-item__content{
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .xmv-input__wrapper{
            background-color: transparent;
            box-shadow: none;
        }

        .xmv-form-item__error{
            padding-left: 10px;
        }

        .xmv-form-item.is-error .xmv-input__wrapper {
            box-shadow: none;
        }

        .form-item-code{
            .xmv-input{
                width: 128px;
            }
        }

        .__button{
            margin-top: 50px;
            display: flex;
            align-items: center;
            padding: 0 45px;
            .xmv-button--primary{
                display: block;
                width: 100%;
                height: 50px;
                border: none;
                background: linear-gradient(120deg, #3498db, #8e44ad, #3498db);
                background-size: 200%;
                color: #fff;
                outline: none;
                cursor: pointer;
                transition: .5s;
                &:hover {
                    background-position: right;
                }
            }
        }
        .__image{
            width: 125px;
            height: 32px;
            margin-left: 10px;
        }
    }
</style>
