import { model,Schema } from "mongoose"
import { userModel } from "./users.model.js";

const notesSchema =new Schema({
    title:{
        type:String,
        required:true,
        trim:true,
        validate:{
            validator: function(title)
            {
                return title !== title.toUpperCase();
            },
            message:props=>`Age must not be all uppercase, you inserted ${props.value}`
        }
    }
    ,content:{
        type:String,
        required:true
    },
    userId:
    {
        type:Schema.Types.ObjectId,
        ref:userModel,
        required:true
    }
},
{
    timestamps:true,
    strict:true
})


export const notesModel = model("Notes",notesSchema)
