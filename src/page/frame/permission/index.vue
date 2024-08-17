<template>
    <div class="frame-permission">
        <!--  操作栏 -->
        <div class="zy-hor-tools">
            <div class="__left">
                <xmv-button type="primary" @click="handleAdd" v-permission dom-name="/permission/add">新增</xmv-button>
            </div>
            <div class="__right">
                <xmv-button @click="handleRresh">刷新</xmv-button>
            </div>
        </div>

        <xmv-layout headHval="0" lWval="200px" mode="t_lr">
            <template #left>
                <div class="left_wrap">
                    <xmv-tree :data="treeData" ref="treeRef" @nodeClick="handleTreeNodeClick"></xmv-tree>
                </div>
            </template>
            <template #right>
                <zy-table url="permission/query" ref="tableRef" :lazy="true">
                    <xmv-table-column prop="menuName" label="菜单名称"/>
                    <xmv-table-column prop="name" label="类型">
                        <template #default="{props}">
                            {{ type_mapping.find(tmp=>(tmp.value == props.data.type)).label }}
                        </template>
                            
                    </xmv-table-column>
                    <xmv-table-column prop="name" label="名称"/>
                    <xmv-table-column prop="expression" label="表达式" width="200px"/>
                    <xmv-table-column prop="" label="操作">
                        <template #default="{props}">
                            <xmv-button link type="primary" size="small" @click="handleUpdate(props.data)" v-permission dom-name="/permission/update">修改</xmv-button>
                            <xmv-button link type="primary" size="small" @click="handleDelete(props.data)" v-permission dom-name="/permission/delete">删除</xmv-button>
                        </template>
                    </xmv-table-column>
                </zy-table>
            </template>
        </xmv-layout>
    
        <!-- 表单 -->
        <xmv-dialog v-model="dialogFormVisible" title="权限编辑" width="500px">
            <xmv-form ref="formRef" label-width="100px" :mode="formMode" :rules="formRules" class="zy-dialog-form--permission">
                <xmv-form-item label="所属菜单" prop="menuId">
                    <xmv-tree-select v-model="formMode.menuId" :data="menuTreeData" clearable only-child-node :expand-level="0"></xmv-tree-select>
                </xmv-form-item>
                <xmv-form-item label="类型" prop="type">
                    <xmv-select v-model="formMode.type">
                        <xmv-option v-for="tmp in type_mapping" :value="tmp.value" :label="tmp.label"></xmv-option>
                    </xmv-select>
                </xmv-form-item>
                <xmv-form-item label="名称" prop="name">
                    <xmv-input v-model="formMode.name"></xmv-input>
                </xmv-form-item>
                <xmv-form-item label="表达式" prop="expression">
                    <xmv-input v-model="formMode.expression"></xmv-input>
                </xmv-form-item>
                <xmv-form-item label="描述" prop="desc">
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
    </div>
</template>

<script>
import {defineComponent ,nextTick,onMounted,reactive,ref} from 'vue'
import http from 'util/http'
import {tranListToTreeDate,isEmpty,deepClone,flattenNodes} from 'util/data'
import {loadingOpen,loadingClose,messageDialog,confirmDialog} from 'util/dom'
export default defineComponent({
    name:"",
    setup(props ,context) {
        const treeData = ref([])
        const treeRef = ref(null)
        const tableRef = ref(null)
        const dialogFormVisible = ref(false)
        const formRef = ref(null)
        const type_mapping = [
            {label : '界面' ,value : '1'},
            {label : '动作' ,value : '2'}
        ]
        let isAdd = false
        const formMode = reactive({
            id : '',
            menuId : '',
            name : '',
            expression : '',
            type : '',
            desc : ''
        })
        const formRules = reactive({
            menuId : [{required : true ,trigger : 'submit'}],
            name : [{required : true}],
            expression : [{required : true}],
            type : [{required : true ,trigger : 'submit'}]
        })
        let cacheTreeData

        const menuTreeData = ref([])

        const handleTreeNodeClick = (node)=>{
            let nodeList = flattenNodes(node)
            let filterList = nodeList.filter(tmp=>{return tmp.hasChildren != true})
            let menuIds = filterList.map(tmp=>tmp.id)
            tableRef.value.fetchData({menuIdsStr:menuIds.join(",")} ,true)
        }

        const handleAdd = ()=>{
            isAdd = true
            dialogFormVisible.value = true
            formRef.value.reset()
            menuTreeData.value = cacheTreeData
        }

        const handleDialogEnter = ()=>{
            formRef.value.validate().then(()=>{
                if (isAdd){
                    ajaxAddPermission()
                }else{
                    ajaxUpdatePermission()
                }
                
            })
        }

        const handleUpdate = (rowData)=>{
            isAdd = false
            dialogFormVisible.value = true
            formRef.value.reset()
            menuTreeData.value = cacheTreeData
            formMode.id = rowData.id
            nextTick(()=>{
                formMode.menuId = rowData.menuId
            })
            formMode.name = rowData.name
            formMode.type = rowData.type
            formMode.expression = rowData.expression
            formMode.desc = rowData.desc
        }

        const handleDelete = (rowData)=>{
            confirmDialog('确认要删除么？' ,()=>{
                ajaxDeletePermission(rowData)
            })
        }

        const handleRresh = ()=>{
            tableRef.value.refresh()
        }

        const ajaxGetMenus = ()=>{
            return new Promise((resolve,reject)=>{
                http.get('menu/query').then(data =>{
                    data.map(t=>{
                        t.value = t.id
                        t.label = t.name
                    })
                    data.unshift({id : 0 ,parentId : -1 ,label : '菜单树' ,value : 0})
                    let list = tranListToTreeDate(data, -1, "id", "parentId")
                    treeData.value = list
                    cacheTreeData = deepClone(list)
                    resolve()
                }).catch(()=>{
                    reject()
                })
            })
            
        }

        const ajaxAddPermission = ()=>{
            loadingOpen()
            http.post('permission/add' ,formMode).then(()=>{
                messageDialog()
                dialogFormVisible.value = false
                tableRef.value.refresh()
            }).finally(()=>{
                loadingClose()
            })
        }

        const ajaxUpdatePermission = ()=>{
            loadingOpen()
            http.post('permission/update' ,formMode).then(()=>{
                messageDialog()
                dialogFormVisible.value = false
                tableRef.value.refresh()
            }).finally(()=>{
                loadingClose()
            })
        }

        const ajaxDeletePermission = (rowData)=>{
            loadingOpen()
            http.post('permission/delete' ,{id:rowData.id}).then(()=>{
                messageDialog()
                dialogFormVisible.value = false
                tableRef.value.refresh()
            }).finally(()=>{
                loadingClose()
            })
        }

        const init = async ()=>{
            tableRef.value.hide()
            loadingOpen()
            await ajaxGetMenus()
            treeRef.value.expandNodeByLevel(0)
            loadingClose()
            tableRef.value.show()
            tableRef.value.fetchData({})
        }

        onMounted(()=>{
            init()
        })

        return {treeData,treeRef,menuTreeData,dialogFormVisible,formRef,formMode,formRules,
                tableRef,type_mapping,
                handleTreeNodeClick,handleAdd,handleDialogEnter,handleDelete,handleUpdate,
                handleRresh}
    }
})
</script>

<style lang="less">
    .frame-permission{
        .zy-dialog-form--permission{
            .xmv-select{
                width: 460px;
            }
        }
        .left_wrap{
            padding-top: 10px;
        }
    }
    
</style>
