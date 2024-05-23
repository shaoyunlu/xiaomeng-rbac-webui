<template>
    <!--  操作栏 -->
    <div class="zy-hor-tools">
        <div class="__left">
            <xmv-button type="primary" @click="handleAdd" v-permission dom-name="/role/add">新增</xmv-button>
        </div>
        <div class="__right">
            <xmv-button @click="handleRresh">刷新</xmv-button>
        </div>
    </div>
    <!-- 表格 -->
    <zy-table url="role/filterquery" ref="tableRef">
        <xmv-table-column prop="name" label="角色名称"/>
        <xmv-table-column prop="desc" label="描述"/>
        <xmv-table-column prop="" label="操作">
            <template #default="{props}">
                <xmv-button link type="primary" size="small" @click="handleConfigPermission(props.data)" v-permission dom-name="/role/permission/config">配置权限</xmv-button>
                <xmv-button link type="primary" size="small" @click="handleUpdate(props.data)" v-permission dom-name="role/update">修改</xmv-button>
                <xmv-button link type="primary" size="small" @click="handleDelete(props.data)" v-permission dom-name="role/delete">删除</xmv-button>
            </template>
        </xmv-table-column>
    </zy-table>
    <!-- 表单 -->
    <xmv-dialog v-model="dialogFormVisible" title="角色编辑" width="500px">
        <xmv-form ref="formRef" label-width="100px" :mode="formMode" :rules="formRules" class="zy-dialog-form frame-role-form">
            <xmv-form-item label="角色名称" prop="name">
                <xmv-input v-model="formMode.name" />
            </xmv-form-item>
            <xmv-form-item label="角色描述" prop="desc">
                <xmv-input v-model="formMode.desc" type="textarea" :rows="4"/>
            </xmv-form-item>
        </xmv-form>
        <template #footer>
            <span class="dialog-footer">
                <xmv-button @click="dialogFormVisible = false">取消</xmv-button>
                <xmv-button type="primary" @click="handleDialogEnter">
                    确认
                </xmv-button>
            </span>
        </template>
    </xmv-dialog>
    <!-- 配置菜单 -->
    <xmv-drawer
        v-model="drawerMode"
        title="菜单配置"
        :auto-close="false"
        direction="rtl"
        :before-close="handleClose">
        <template #header>
            <h4>set title by slot</h4>
        </template>
        <template #default>
        <div class="drawer-menu">
            <xmv-tree show-checkbox :data="menuData" ref="menuTreeRef"></xmv-tree>
        </div>
        </template>
        <template #footer>
        <div style="flex: auto">
            <xmv-button @click="drawerMode = false">取消</xmv-button>
            <xmv-button type="primary" @click="handleDrawerEnter">确认</xmv-button>
        </div>
        </template>
    </xmv-drawer>
</template>

<script>
import {defineComponent,ref,reactive, nextTick, watch, onMounted} from 'vue'
import {loadingOpen,loadingClose,messageDialog,confirmDialog} from 'util/dom'
import http from 'util/http'
import {tranListToTreeDate,isEmpty,flattenNodes,deepClone} from 'util/data'
export default defineComponent({
    name:"",
    setup(props ,context) {

        const tableRef = ref(null)
        const dialogFormVisible = ref(false)
        const formRef = ref(false)
        const isAddRef = ref(false)
        const formMode = reactive({
            name : '',
            desc : ''
        })
        const formRules = reactive({
            name : [{required:true,trigger:'blur'}]
        })
        const drawerMode = ref(false)
        const menuTreeRef = ref(null)
        const menuData = ref([])
        let cacheTreeData
        let cacheRowData
        const handleAdd = ()=>{
            isAddRef.value = true
            dialogFormVisible.value = true
            formRef.value.reset()
        }

        const handleConfigPermission = async (rowData)=>{
            cacheRowData = rowData
            drawerMode.value = true
            menuData.value = deepClone(cacheTreeData)
            console.log(rowData)
            nextTick(()=>{
                rowData.permissionDtos.forEach(tmp=>{
                    menuTreeRef.value.checkNode({value : tmp.id + '-' + tmp.menuId ,isChecked :true})
                })
            })
        }

        const handleDrawerEnter = (rowData)=>{
            let arr = flattenNodes(menuData.value)
            arr = arr.filter(tmp=>{
                return (tmp.isChecked && tmp.tmpType == 'permission')
            })
            let ids = arr.map(tmp=>tmp.id)
            ajaxConfigPermissions(ids)
        }

        const handleDialogEnter = ()=>{
            formRef.value.validate().then(()=>{
                if (isAddRef.value){
                    ajaxAddRole()
                }else{
                    ajaxUpdateRole()
                }
            })
        }
        
        const handleUpdate = (rowData)=>{
            isAddRef.value = false
            dialogFormVisible.value = true
            if (dialogFormVisible.value){
                formRef.value.reset()
                formMode.id = rowData.id
                formMode.name = rowData.name
                formMode.desc = rowData.desc
            }
        }

        const handleDelete = (rowData)=>{
            confirmDialog('确认要删除么？' ,()=>{
                ajaxDeleteRole(rowData)
            })
        }

        const handleRresh = ()=>{
            tableRef.value.refresh()
        }

        const ajaxAddRole = ()=>{
            loadingOpen()
            http.post('/role/add' ,formMode).then(()=>{
                dialogFormVisible.value = false
                messageDialog()
                tableRef.value.refresh()
            }).finally(()=>{
                loadingClose()
            })
        }

        const ajaxUpdateRole = ()=>{
            loadingOpen()
            http.post('/role/update' ,formMode).then(()=>{
                dialogFormVisible.value = false
                messageDialog()
                tableRef.value.refresh()
            }).finally(()=>{
                loadingClose()
            })
        }

        const ajaxDeleteRole = (rowData)=>{
            loadingOpen()
            http.post('/role/delete' ,{id:rowData.id}).then(()=>{
                messageDialog()
                tableRef.value.refresh()
            }).finally(()=>{
                loadingClose()
            })
        }

        const ajaxGetMenus = ()=>{
            return new Promise((resolve ,reject)=>{
                http.get('menu/query').then(data =>{
                    data.map(t=>{
                        t.value = t.id
                        t.label = t.name
                        t.idEx = t.id
                    })
                    resolve(data)
                }).catch(()=>{
                    reject()
                }).finally(()=>{
                })
            })
        }

        const ajaxGetPermissions = ()=>{
            let params = {pageNum: 0 ,pageSize: 9999}
            return new Promise((resolve,reject)=>{
                http.get('permission/query' ,{params}).then(data=>{
                    resolve(data.content)
                }).catch(()=>{
                    reject()
                })
            })
        }

        const ajaxConfigPermissions = (permissionIds)=>{
            loadingOpen()
            http.post('role/permission/config' ,{id:cacheRowData.id ,permissionIds : permissionIds}).then(()=>{
                messageDialog()
                drawerMode.value = false
                tableRef.value.refresh()
            }).finally(()=>{
                loadingClose()
            })
        }

        const createPermissionTree = async ()=>{
            let menuData = await ajaxGetMenus()
            let permissionData = await ajaxGetPermissions()
            permissionData.forEach(tmp=>{
                tmp.idEx = tmp.id + '-' + tmp.menuId
                tmp.value = tmp.idEx
                tmp.label = tmp.name
                tmp.parentId = tmp.menuId
                tmp.tmpType = 'permission'
            })
            let listData = [].concat(menuData).concat(permissionData)
            let treeData = tranListToTreeDate(listData, 0, "idEx", "parentId")
            cacheTreeData = treeData
        }

        onMounted(()=>{
            createPermissionTree()
        })

        watch(drawerMode ,(newVal)=>{
            if (!newVal){
                menuData.value = []
            }
        })

        return {dialogFormVisible,formRef,formMode,formRules,tableRef,
                drawerMode,menuData,menuTreeRef,
                handleAdd,handleDialogEnter,handleDelete,handleUpdate,
                handleConfigPermission,handleDrawerEnter,handleRresh}
    }
})
</script>

<style lang="less" scoped>
    .frame-role-form{
        .xmv-input{
            width : 360px;
        }
    }
</style>
