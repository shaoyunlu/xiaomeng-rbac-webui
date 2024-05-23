import { ref ,reactive } from "vue";

export const g_user = reactive({
    id : '',
    name : '',
    realName : '',
    roles : []
})

export const g_menu_ref = ref(null)

export const g_menu = ref([])

export function setUser(userDto){
    g_user.id = userDto.id
    g_user.name = userDto.name
    g_user.realName = userDto.realName
    g_user.roles = userDto.roleDtos
}

export function clearUser(){
    g_user.id = ''
    g_user.name = ''
    g_user.realName = ''
    g_user.roles = []

}