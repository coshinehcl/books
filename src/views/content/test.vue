<template>
    <div>
        12312
        {{value}}
    </div>
</template>
<script>
export default {
    name:"test",
    model:{
        prop:'value',
        event:'change'
    },
    props:{
        value:{
            type:Object,
            default:()=>({})
        }
    },
    watch:{
        value(newV){
            console.log('newV',newV)
        }
    },
    created(){
        setTimeout(() => {
            this.$emit('change',{
                aa:1
            })
        }, 2000);
    }
}
</script>