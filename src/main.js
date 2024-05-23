import {createApp} from 'vue'
import App from './main.vue'

import register from 'xiaomeng-ui'
import 'xiaomeng-ui/dist/xmv-ui.css'
import './style/index.less'

import router from './route'

import zyTable from 'comp/table.vue'
import permission from 'directive/permission'

// 需要注册几个常用的组件

const app = createApp(App)
app.use(router)
app.use(register)
app.directive("permission" ,permission)
app.mount('#app')

app.component('zyTable', zyTable)

