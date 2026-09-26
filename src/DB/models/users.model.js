import { model,Schema } from "mongoose"

const userSchema =new Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        unique:true,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
    age:{
        type:Number,
        validate:{
            validator: function(age)
            {
                return age>=18 && age<=60
            },
            message:props=>`Age must be between 18 and 60, you inserted ${props.value}`
        }
    }
},
{
    timestamps:false,
    strict:true
})


export const userModel = model("Users",userSchema)
