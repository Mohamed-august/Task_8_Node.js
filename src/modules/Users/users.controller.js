import { Router } from "express";
import { successRes } from "../../utils/success.res.js";
import { userModel } from "../../DB/models/users.model.js";
import { getUserById } from "./users.service.js";
const userRouter = Router()

export const routes = {
    base:"/users",
    hello:"/"
}

userRouter.get(routes.hello,(req,res,next)=>
{
    successRes({res,msg:"user module"})
}
)

userRouter.post("/signup", async (req,res)=>{
    const {name,email,password,phone,age}=req.body
    try{
        const isUserExist = await userModel.findOne({email})
        if(isUserExist)
        {
            return res.status(409).json({
                msg:"User already exists"
            })
        }
        const user = await userModel.create({
            name,
            email,
            password,
            phone,
            age
        })
        return res.status(201).json({msg:"User created successfully",user})
    }
    catch(error)
    {
        return res.status(500).json({msg:"internal server error",error})
    }
})


userRouter.post("/login",async (req,res)=>{
    const {email,password}=req.body
    try{
        const isUserExist = await userModel.findOne({email,password})
        if(isUserExist)
        {
            return res.status(200).json({
                msg:"You logged in successfully",
            })
        }
        else{
            return res.status(404).json({
                msg:"User not found"
            })
        }
    }
    catch(error)
    {
        return res.status(500).json({msg:"internal server error",error})
    }
})

userRouter.patch("/:id", async (req,res)=>
        {
            try{
            const {email,password, ...safeUpdates} = req.body
            if(email)
            {
                const isEmailExists = await userModel.findOne({email,_id:{$ne:req.params.id}})
                if(isEmailExists)
                return res.status(409).json({
                    msg:"User already exists"
                })
                safeUpdates.email=email
            }
            const user = await userModel.findByIdAndUpdate(req.params.id, safeUpdates,{new:true , runValidators:true})
            if(user)
            {
                return res.status(200).json({msg:"User updated successfully",user})
            }
            return res.status(404).json({
                msg:"User not found"
            })
    }
            catch(error)
            {
                return res.status(500).json({msg:"internal server error",error})
            }
        })

userRouter.get("/:id",async(req,res)=>
        {
            try{
            const user = await getUserById(req.params.id)
            if(user)
            {
                return res.status(200).json({msg:"User found successfully",user})
            }
            else
            {
                return res.status(404).json({
                msg:"User not found"
            })
            }}
            catch(error)
            {
                return res.status(500).json({msg:"internal server error",error})
            }
        })

userRouter.delete("/:id",async(req,res)=>
        {
            try{
            const user = await userModel.findByIdAndDelete(req.params.id)
            if(user)
            {
                return res.status(200).json({msg:"User deleted successfully",user})
            }
            else
            {
                return res.status(404).json({
                msg:"User not found"
            })
            }}
            catch(error)
            {
                return res.status(500).json({msg:"internal server error",error})
            }
        })

export default userRouter
