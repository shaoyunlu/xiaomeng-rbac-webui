<template>
    <!--  操作栏 -->
    <div class="zy-hor-tools">
        <div class="__left">
            <xmv-button type="primary" @click="handleAdd" v-permission dom-name="/user/add">新增</xmv-button>
            <xmv-button @click="handleBatchDelete" v-permission dom-name="/user/batchdelete">批量删除</xmv-button>
        </div>
        <div class="__right">
            <xmv-input suffix-icon="search" placeholder="搜索" @iconClick="handleSearch" @keydown.enter="handleSearch" ref="searchInputRef"></xmv-input>
        </div>
    </div>
    <!-- 表格 -->
    <zy-table url="user/query" ref="tableRef">
        <xmv-table-column type="checkbox" width="55"/>
        <xmv-table-column prop="name" label="用户名"/>
        <xmv-table-column prop="realName" label="真实姓名" />
        <xmv-table-column label="角色" sortable :sort-method="handleSort" prop="roles.name">
            <template #default="{props}">
                <span>{{ props.data.roleDtos.map(t=>t.name).join(",") }}</span>
            </template>
        </xmv-table-column>
        <xmv-table-column prop="updateTime" label="更新时间"></xmv-table-column>
        <xmv-table-column prop="" label="操作">
            <template #default="{props}">
                <xmv-button v-permission dom-name="/user/update" link type="primary" size="small" @click="handleUpdate(props.data)">修改</xmv-button>
                <xmv-button v-permission dom-name="/user/delete" link type="primary" size="small" @click="handleDelete(props.data)">删除</xmv-button>
            </template>
        </xmv-table-column>
    </zy-table>

    <!-- 表单 -->
    <xmv-dialog v-model="dialogFormVisible" title="用户编辑" width="500px">
        <xmv-form ref="formRef" label-width="100px" :mode="formMode" :rules="formRules" class="zy-dialog-form">
            <xmv-form-item label="用户名" prop="name">
                <xmv-input v-model="formMode.name" />
            </xmv-form-item>
            <xmv-form-item label="真实姓名" prop="realName">
                <xmv-input v-model="formMode.realName" />
            </xmv-form-item>
            <div v-if="isAddRef">
                <xmv-form-item label="密码" prop="password">
                    <xmv-input v-model="formMode.password" type="password"></xmv-input>
                </xmv-form-item>
                <xmv-form-item label="确认密码" prop="checkPassword">
                    <xmv-input v-model="formMode.checkPassword" type="password"></xmv-input>
                </xmv-form-item>
            </div>
            <xmv-form-item label="角色" prop="roleIds">
                <xmv-select v-model="formMode.roleIds" multiple>
                    <xmv-option v-for="tmp in roleListRef"
                        :key="tmp.id" 
                        :value="tmp.id" 
                        :label="tmp.name"></xmv-option>
                </xmv-select>
            </xmv-form-item>
            <xmv-form-item label="邮箱" prop="email">
                <xmv-input v-model="formMode.email"></xmv-input>
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

</template>

<script>
import {defineComponent ,reactive,ref,onMounted, nextTick} from 'vue'
import {loadingOpen,loadingClose,messageDialog,confirmDialog} from 'util/dom'
import http from 'util/http'
export default defineComponent({
    name:"",
    setup(props ,context) {
        const tableRef = ref(null)
        const dialogFormVisible = ref(null)
        const formRef = ref(null)
        const roleListRef = ref([])
        const searchInputRef = ref(null)
        const isAddRef = ref(false)

        const validatePassword = ()=>{
            return new Promise((resolve ,reject)=>{
                if (formMode.password == formMode.checkPassword)
                    resolve()
                else
                    reject('密码不一致。')
            })
        }

        const formMode = reactive({
            id : '',
            name : '',
            realName : '',
            password : '',
            checkPassword : '',
            email : '',
            roleIds : []
        })

        const formRules = reactive({
            name : [{required : true}],
            realName : [{required : true}],
            password : [{required : true}],
            checkPassword : [{required : true ,validator : validatePassword ,trigger : 'blur'}],
            email : [{email : true}],
            roleIds : [{required : true ,trigger : 'submit'}]
        })

        const handleSearch = ()=>{
            tableRef.value.fetchData({name : searchInputRef.value.getVal()})
        }

        const handleAdd = async ()=>{
            isAddRef.value = true
            formRules.password = [{required : true}]
            formRules.checkPassword = [{required : true ,validator : validatePassword ,trigger : 'blur'}]
            dialogFormVisible.value = !dialogFormVisible.value
            if (dialogFormVisible.value){
                formRef.value.reset()
                ajaxRoleList()
            }
        }

        const handleUpdate = async (rowData)=>{
            isAddRef.value = false
            formRules.password = []
            formRules.checkPassword = []
            dialogFormVisible.value = !dialogFormVisible.value
            if (dialogFormVisible.value){
                formRef.value.reset()
                await ajaxRoleList()
                formMode.id = rowData.id
                formMode.name = rowData.name
                formMode.realName = rowData.realName
                formMode.email = rowData.email
                formMode.roleIds = rowData.roleDtos.map(t=>t.id)
            }
        }

        const handleSort = (key ,sortStr)=>{
            tableRef.value.sort(key ,sortStr)
        }

        const handleDialogEnter = ()=>{
            formRef.value.validate().then(()=>{
                if (isAddRef.value){
                    ajaxAddUser()
                }else{
                    ajaxUpdateUser()
                }
                
            })
        }

        const handleDelete = (rowData)=>{
            confirmDialog('确认要删除么？',()=>{
                ajaxDeleteUser(rowData)
            })
        }

        const handleBatchDelete = ()=>{
            let data = tableRef.value.getSelectedData()
            if (data.length == 0){
                messageDialog('请至少选择一条记录。' ,'info')
            }else{
                confirmDialog('确认要删除么？',()=>{
                    let idList = data.map(tmp=>tmp.id)
                    ajaxBatchDeleteUser(idList)
                })
            }
        }

        const ajaxAddUser = ()=>{
            loadingOpen()
            http.post('user/add' ,formMode).then(res=>{
                dialogFormVisible.value = false
                messageDialog()
                tableRef.value.refresh()
            }).finally(()=>{
                loadingClose()
            })
        }

        const ajaxUpdateUser = ()=>{
            loadingOpen()
            http.post('user/update' ,formMode).then(res=>{
                dialogFormVisible.value = false
                messageDialog()
                tableRef.value.refresh()
            }).finally(()=>{
                loadingClose()
            })
        }

        const ajaxDeleteUser = (rowData)=>{
            loadingOpen()
            http.post('user/delete' ,{id : rowData.id}).then(res=>{
                messageDialog()
                tableRef.value.refresh()
            }).finally(()=>{
                loadingClose()
            })
        }

        const ajaxBatchDeleteUser = (idList)=>{
            loadingOpen()
            http.post('user/batchdelete' ,idList).then(res=>{
                messageDialog()
                tableRef.value.refresh()
            }).finally(()=>{
                loadingClose()
            })
        }

        const ajaxRoleList =  ()=>{
            return new Promise((resolve,reject)=>{
                http.get('role/query').then(data=>{
                    roleListRef.value = data
                    resolve()
                }).catch(()=>{
                    reject()
                })
            })
        }

        onMounted(()=>{
            
        })

        return {tableRef ,dialogFormVisible ,formMode ,formRules ,formRef ,roleListRef,
                searchInputRef,isAddRef,
                handleAdd ,handleDialogEnter ,handleDelete ,handleSearch,handleUpdate,handleSort,
                handleBatchDelete}
    }
})
</script>

<style lang="" scoped></style>
