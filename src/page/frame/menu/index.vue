<template>
    <!--  操作栏 -->
    <div class="zy-hor-tools">
        <div class="__left">
            <xmv-button type="primary" @click="handleAdd" v-permission dom-name="/menu/add">新增</xmv-button>
        </div>
        <div class="__right">
            <xmv-button @click="handleRresh">刷新</xmv-button>
        </div>
    </div>
    <!-- 表格 -->
    <div class="zy-table">
        <xmv-table :data="tableData" ref="xmvTableRef" v-loading="tableLoading" :draggable="true" :before-drop="handleBeforeDrop">
            <xmv-table-column prop="name" label="名称"/>
            <xmv-table-column prop="url" label="路径"/>
            <xmv-table-column prop="icon" label="图标">
                <template #default="{props}">
                    <xmv-icon :name="props.data.icon" class="menu-icon"></xmv-icon>
                </template>
            </xmv-table-column>
            <xmv-table-column prop="" label="操作">
                <template #default="{props}">
                    <xmv-button link type="primary" size="small" @click="handleUpdate(props.data)" v-permission dom-name="/menu/update">修改</xmv-button>
                    <xmv-button link type="primary" size="small" @click="handleDelete(props.data)" v-permission dom-name="/menu/delete">删除</xmv-button>
                </template>
            </xmv-table-column>
        </xmv-table>
    </div>
    <!-- 表单 -->
    <xmv-dialog v-model="dialogFormVisible" title="菜单编辑" width="560px">
        <xmv-form ref="formRef" label-width="100px" :mode="formMode" :rules="formRules" class="zy-dialog-form--menu">
            <xmv-form-item label="名称" prop="name">
                <xmv-input v-model="formMode.name" />
            </xmv-form-item>
            <xmv-form-item label="路径" prop="url">
                <xmv-input v-model="formMode.url" />
            </xmv-form-item>
            <xmv-form-item label="父级" prop="parentId">
                <xmv-tree-select v-model="formMode.parentId" :data="menuTreeData" clearable></xmv-tree-select>
            </xmv-form-item>
            <div v-show="!iconDisabledRef">
                <xmv-form-item label="图标" prop="icon">
                    <xmv-dropdown @item-click="handleIconItemClick" extra-class="menu-icon-dropdown" :is-align-center="false">
                        <div class="icon-drop-trigger">
                            <xmv-icon v-if="formMode.icon != '' && formMode.icon != null" :name="formMode.icon"></xmv-icon>
                            <a v-else>{{ '请选择' }}</a>
                        </div>
                        <template #dropdown>
                            <xmv-dropdown-menu>
                                <xmv-dropdown-item v-for="tmp in iconList" :item-value="tmp">
                                    <xmv-icon :name="tmp"></xmv-icon>
                                </xmv-dropdown-item>
                            </xmv-dropdown-menu>
                        </template>
                    </xmv-dropdown>
                </xmv-form-item>
            </div>
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
import {defineComponent,nextTick,onMounted,reactive,ref, watch} from 'vue'
import http from 'util/http'
import {tranListToTreeDate,isEmpty,findNode} from 'util/data'
import {loadingOpen,loadingClose,messageDialog,confirmDialog} from 'util/dom'
export default defineComponent({
    name:"",
    setup(props ,context) {

        const xmvTableRef = ref(null)
        const tableLoading = ref(false)
        const tableData = ref()
        const menuTreeData = ref([])
        let isAdd = false

        const dialogFormVisible = ref(false)
        const formRef = ref(null)

        const iconDisabledRef = ref(false)

        const iconRegex = /^[a-zA-Z]+$/;

        const iconList = ref([
            'arrowLeft','arrowRight','arrowUp','arrowDown',
            'back','barChart','base',
            'calendar','check','clock','close','circleCheck','circleClose','circleCloseFilled',
            'dArrowLeft' ,'dArrowRight','download','dlt','document',
            'edit','empty',
            'hide',
            'infoFilled','lineChart',
            'loading' , 
            'message','minus','moreFilled',
            'plus','pieChart','pic',
            'refresh','refreshLeft','refreshRight',
            'sort' ,'setting' ,'search','successFilled','star',
            'upload','uploadFilled','user','userFilled',
            'vew',
            'warningFilled',
            'zoomIn','zoomOut'
        ])

        let cacheMenuList
        let cacheRowData

        const formMode = reactive({
            id : '',
            name : '',
            url : '',
            order : '',
            parentId : '',
            icon : ''
        })


        const validateIcon = ()=>{
            return new Promise((resolve,reject)=>{
                if (iconRegex.test(formMode.icon) || isEmpty(formMode.icon)){
                    resolve()
                }else{
                    reject('必须都是字母')
                }
            })
        }

        const formRules = reactive({
            name : [{required : true ,trigger : 'blur'}],
            icon : [{validator : validateIcon}]
        })

        const handleAdd = ()=>{
            isAdd = true
            dialogFormVisible.value = true
            formRef.value.reset()
            menuTreeData.value = cacheMenuList
        }

        const handleUpdate = (rowData)=>{
            isAdd = false
            cacheRowData = rowData
            dialogFormVisible.value = true
            formRef.value.reset()
            menuTreeData.value = cacheMenuList
            formMode.id = rowData.id
            formMode.name = rowData.name
            formMode.url = rowData.url
            formMode.order = rowData.order
            nextTick(()=>{
                formMode.parentId = rowData.parentId
                formMode.icon = rowData.icon
            })
        }

        const handleDelete = (rowData)=>{
            confirmDialog('确认要删除么？' ,()=>{
                ajaxDeleteMenu(rowData)
            })
        }

        const handleDialogEnter = ()=>{
            formRef.value.validate().then(()=>{
                if (isAdd){
                    if (formMode.parentId == ''){
                        formMode.parentId = 0
                    }
                    __setOrder()
                    ajaxAddMenu()
                }else{
                    if (cacheRowData.parentId != formMode.parentId){
                        __setOrder()
                    }
                    ajaxUpdateMenu()
                }
                
            })
        }

        const handleBeforeDrop = (dragNode ,dropNode)=>{
            return new Promise((resolve,reject)=>{
                if (dragNode.xmvDepth != dropNode.xmvDepth){
                    messageDialog('只能进行同级菜单的顺序调整。','error')
                    reject()
                }else{
                    // 需要先判断是否有权限
                    let parentNode = findNode(tableData.value ,dragNode.parentId ,'id')
                    let parentOrder = parentNode.order
                    resolve()
                    setTimeout(()=>{
                        parentNode.children.forEach((node,i)=>{
                            node.order = parentOrder * 100 + (i+1)
                        })
                        ajaxAdjustOrder(parentNode)
                    },0)

                }
                
            })
        }

        const handleRresh = ()=>{
            ajaxGetMenus()
        }

        const ajaxGetMenus = ()=>{
            tableLoading.value = true
            http.get('menu/query').then(data =>{
                data.map(t=>{
                    t.value = t.id
                    t.label = t.name
                })
                let list = tranListToTreeDate(data, 0, "id", "parentId")      
                cacheMenuList = list
                tableData.value = []
                nextTick(()=>{
                    tableData.value = list
                })
            }).finally(()=>{
                tableLoading.value = false
            })
        }

        const ajaxAddMenu = ()=>{
            loadingOpen()
            http.post('/menu/add' ,formMode).then(()=>{
                dialogFormVisible.value = false
                messageDialog()
                ajaxGetMenus()
            }).finally(()=>{
                loadingClose()
            })
        }

        const ajaxUpdateMenu = ()=>{
            loadingOpen()
            http.post('/menu/update' ,formMode).then(()=>{
                dialogFormVisible.value = false
                messageDialog()
                ajaxGetMenus()
            }).finally(()=>{
                loadingClose()
            })
        }

        const ajaxDeleteMenu = (rowData)=>{
            loadingOpen()
            let ids = __flattenNodes(rowData)
            http.post('/menu/delete' ,{ids:ids}).then(()=>{
                messageDialog()
                ajaxGetMenus()
            }).finally(()=>{
                loadingClose()
            })
        }

        const ajaxAdjustOrder = (parentNode)=>{
            loadingOpen()
            let paramObj = {ids : [] ,orders:[]}
            parentNode.children.forEach(node=>{
                paramObj.ids.push(node.id)
                paramObj.orders.push(node.order)
            })

            http.post('/menu/order/adjust',paramObj).then(()=>{
                messageDialog()
            }).finally(()=>{
                ajaxGetMenus()
                loadingClose()
            })
        }

        function __findMax(arr){
            // 使用reduce方法找到具有最大b属性值的对象
            const maxBObject = arr.reduce((max, current) => {
                // 如果当前对象的b属性值大于目前找到的最大值，则更新最大值
                return current.order > max.order ? current : max;
            }, {order: -Infinity}); // 初始化一个具有非常小的b值的对象作为比较的起点

            return maxBObject.order; // 返回找到的最大b值
        }

        function __flattenNodes(node) {
            // 初始化一个数组用于存放当前节点及其所有子节点的ID
            let ids = [];
            
            // 定义一个递归函数来处理每个节点
            function traverse(currentNode) {
                // 首先将当前节点的ID添加到数组中
                ids.push(currentNode.id);
                
                // 检查当前节点是否有子节点
                if (currentNode.children && currentNode.children.length) {
                // 如果有子节点，递归处理每个子节点
                currentNode.children.forEach(child => traverse(child));
                }
            }
            
            // 开始递归处理传入的节点
            traverse(node);
            
            // 返回包含所有节点ID的一维数组
            return ids;
        }

        function __setOrder(){
            let node = findNode(tableData.value ,formMode.parentId ,'id')
            let maxOrder = 0
            if (!isEmpty(node)){
                if (node.hasChildren){
                    maxOrder = __findMax(node.children)
                }else{
                    maxOrder = node.order * 100 + 1
                }
            }else{
                maxOrder = __findMax(cacheMenuList)
            }
            formMode.order = maxOrder + 1
        }

        const handleIconItemClick = (val)=>{
            formMode.icon = val
        }

        watch(()=>formMode.parentId ,(newVal)=>{
            if (isEmpty(newVal) || newVal == 0){
                iconDisabledRef.value = false
            }
            else
            {
                iconDisabledRef.value = true
                formMode.icon = ''
            }
            
        })

        onMounted(()=>{
            ajaxGetMenus()
        })

        return {xmvTableRef,tableLoading,tableData,dialogFormVisible,formRef,formMode,formRules,
                menuTreeData,iconDisabledRef,iconList,
                handleAdd,handleDialogEnter,handleDelete,handleUpdate,handleBeforeDrop,handleIconItemClick,
                handleRresh}
    }
})
</script>

<style lang="less">
    .zy-table{
        .menu-icon{
            font-size : 20px;
        }
    }

    .zy-dialog-form--menu{
        .xmv-select{
            width: 460px;
        }
    }

    .zy-dialog-form--menu{
        .icon-drop-trigger{
            cursor: pointer;
            padding-left : 5px;
            a:hover{
                color : #409eff;
            }
        }
        .xmv-icon{
            font-size: 18px;
        }
    }

    .menu-icon-dropdown{
        .xmv-dropdown-menu{
            width : 418px;
            li{
                display: inline-block;
            }
        }
    }
</style>
