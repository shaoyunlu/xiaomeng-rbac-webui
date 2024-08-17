<template>
    <div class="zy-table" ref="tableRef" v-loading="loading">
        <xmv-table :data="tableData" ref="xmvTableRef"  :draggable="draggable">
            <slot></slot>
        </xmv-table>
        <div class="zy-table-divider"></div>
        <xmv-pagination 
                ref="paginationRef"
                :total="total" 
                v-model:page-size="pageSizeMode" 
                layout="size,prev,pager,next"
                @changeNumber="handleChangeNumber"></xmv-pagination>
    </div>
</template>

<script>
import {defineComponent,ref,onMounted, nextTick} from 'vue'
import {isEmpty} from 'util/data'
import http from 'util/http'
export default defineComponent({
    name:"",
    props:{
        url : String,
        lazy : {type : Boolean ,default : false},
        draggable : {type:Boolean ,default : false}
    },
    setup(props ,context) {

        const xmvTableRef = ref(null)
        const tableRef = ref(null)

        const loading = ref(false)
        const paginationRef = ref(null)

        const total = ref(0)
        const tableData = ref([])

        const pageSizeMode = ref(10)

        let cacheQuery

        const handleChangeNumber = ()=>{
            fetchData(false)
        }

        const fetchData = (query = {} ,resetPage = false)=>{
            cacheQuery = query
            loading.value = true
            if (resetPage){
                paginationRef.value.reset()
            }
            let pageInfo = paginationRef.value.getPageInfo()
            let params = {
                    pageNum : pageInfo.pageNum - 1,
                    pageSize : pageInfo.pageSize,
            }
            Object.assign(params,query)
            http.get(props.url ,{
                params
            }).then(data=>{
                loading.value = false
                tableData.value = []
                nextTick(()=>{
                    tableData.value = data.content
                })
                total.value = data.totalElements
            })
        }

        const getSelectedData = ()=>{
            let data = xmvTableRef.value.data
            return data.filter((tmp=>tmp.checked))
        }

        const sort = (key ,direction)=>{
            if (!isEmpty(direction)){
                Object.assign(cacheQuery ,{sortBy : key ,sortDirection : direction})
            }else{
                delete cacheQuery.sortBy
                delete cacheQuery.sortDirection
            }
            refresh()
        }

        const refresh = ()=>{
            fetchData(cacheQuery)
        }

        const show = ()=>{
            tableRef.value.style.opacity = 1
        }

        const hide = ()=>{
            tableRef.value.style.opacity = 0
        }

        onMounted(()=>{
            if (!props.lazy){
                fetchData()
            }
        })

        return {pageSizeMode,total,tableData,paginationRef,loading,
                xmvTableRef,tableRef,show,hide,
                handleChangeNumber,refresh,fetchData,getSelectedData,sort}
    }
})
</script>

<style lang="less">
    .zy-table{
        position: relative;
    }
    .zy-table-divider{
        height: 10px;
    }
</style>
