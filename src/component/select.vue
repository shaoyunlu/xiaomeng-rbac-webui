<template>
    <xmv-select>
        <xmv-option v-if="tmp in listData" 
            :key="tmp[valueStr]" 
            :value="tmp[valueStr]" 
            :label="tmp[labelStr]"></xmv-option>
    </xmv-select>
</template>

<script>
import {defineComponent ,onMounted ,ref} from 'vue'
import http from 'util/http'
export default defineComponent({
    name:"",
    props:{
        url : String,
        labelStr : 'label',
        valueStr : 'value'
    },
    setup(props ,context) {

        const listData = ref([])

        onMounted(()=>{
            http.get(props.url ,{
                params : {
                    pageNum : 0,
                    pageSize : 9999
                }
            }).then(data=>{
                listData.value = data.content
                console.log(listData.value)
            })
        })

        return {listData}
    }
})
</script>

<style lang="" scoped></style>
