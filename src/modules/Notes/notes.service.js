import { notesModel } from "../../DB/models/notes.model.js";

export const getNoteById = async(id)=>
{
    return await notesModel.findById(id)
}
