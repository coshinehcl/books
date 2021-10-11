<template>
    <div>
        <Card>
            <Form ref="form" :model="form" :rules="rules">
                <Form-item prop="name">
                    <Input type="text" v-model="form.user" placeholder="Username">
                        <Icon type="ios-person-outline" slot="prepend"></Icon>
                    </Input>
                </Form-item>
                <Form-item prop="password">
                    <Input type="password" v-model="form.password" placeholder="Password">
                        <Icon type="ios-locked-outline" slot="prepend"></Icon>
                    </Input>
                </Form-item>
                <Form-item>
                    <Button type="primary" @click="onSubmit">登录</Button>
                </Form-item>
            </Form>
        </Card>
    </div>
</template>
<script>
export default {
    name:"login",
    data(){
        return {
            form:{
                user:'',
                password:''
            },
            rules:{}
        }
    }
}
</script>