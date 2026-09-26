import express from "express"

import chalk from "chalk"
import userRouter, { routes as userRoutes } from "./modules/Users/users.controller.js"
import notesRouter, { routes as notesRoutes } from "./modules/Notes/notes.controller.js"
import { DBConnection } from "./DB/db.connection.js"
import { userModel } from "./DB/models/users.model.js"
import { notesModel } from "./DB/models/notes.model.js"

const bootstrap = async ()=>
{
    const app =express()
    app.use(express.json())
    await DBConnection()
    app.get("/",(req,res)=>
    {
        console.log("Hello")
    })

    app.use(userRoutes.base,userRouter)
    app.use(notesRoutes.base,notesRouter)
    app.use((err,req,res,next)=>
    {
        const statusCode=err.cause?.statusCode || 500

        console.log({statusCode})



        res.status(statusCode).json({
            errMsg:err.message,
            status:statusCode
        })
    })

    userModel
    notesModel
    app.listen(3000,()=>
        {
            console.log(chalk.green("Server is running on port 3000"));
            
        })
}

export default bootstrap
