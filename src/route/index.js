import {createRouter ,createWebHashHistory} from 'vue-router'


import indexVue from 'page/frame/index/index.vue'

import loginVue from 'page/frame/login/login.vue'
import frameUserVue from 'page/frame/user/index.vue'
import frameRoleVue from 'page/frame/role/index.vue'
import frameMenuVue from 'page/frame/menu/index.vue'
import framePermissionVue from 'page/frame/permission/index.vue'

const routes = [
    {
        path: '/login',
        component: loginVue
    },

    { 
        path : '/',
        component : indexVue,
        children : [
            {
                path : 'frame/user',
                component : frameUserVue
            },
            {
                path : 'frame/role',
                component : frameRoleVue
            },
            {
                path : 'frame/menu',
                component : frameMenuVue
            },
            {
                path : 'frame/permission',
                component : framePermissionVue
            }
        ]
    }
]

const router = createRouter({
    history : createWebHashHistory(),
    routes : routes
})

export default router