import { userModel } from "../../DB/models/users.model.js";

export const getUserById = async(id)=>
{
    return await userModel.findById(id)
}
