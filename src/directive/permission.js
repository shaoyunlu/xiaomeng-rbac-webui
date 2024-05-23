import {g_user} from 'data/runtime'

export default {
    mounted (el,binding){
        let flag = false
        let domName = el.getAttribute("dom-name")
        let roles = g_user.roles
        roles.forEach(role=>{
            role.permissionDtos.forEach(permission=>{
                if (permission.expression == domName){
                    flag = true
                }
            })
        })
        // if (!flag){
        //     el.remove()
        // }
        el.style.display = (flag ? '' : 'none')
        
    },
    unmounted(el){

    }
}