import { Router } from "express";
import mongoose from "mongoose";
import { successRes } from "../../utils/success.res.js";
import { notesModel } from "../../DB/models/notes.model.js";
import { getNoteById } from "./notes.service.js";

const notesRouter = Router();

const getUserId = (req) => {
    return req.headers?.userid || req.headers?.['user-id'] || req.query?.userId || req.body?.userId || req.params?.userId;
};

export const routes = {
    base: "/notes",
    hello: "/"
};

notesRouter.get(routes.hello, (req, res, next) => {
    successRes({ res, msg: "notes module" });
});

notesRouter.post("/", async (req, res) => {
    const { title, content, userId } = req.body;
    try {
        const note = await notesModel.create({
            title,
            content,
            userId
        });
        return res.status(201).json({ msg: "Note created successfully", note });
    } catch (error) {
        return res.status(500).json({ msg: "internal server error", error });
    }
});

notesRouter.patch("/all", async (req, res) => {
    try {
        const { title } = req.body;
        const result = await notesModel.updateMany({}, { title }, { runValidators: true });
        return res.status(200).json({ msg: "All notes updated successfully", result });
    } catch (error) {
        return res.status(500).json({ msg: "internal server error", error });
    }
});

notesRouter.get("/paginate-sort", async (req, res) => {
    try {
        const { page = 1, limit = 5, userId, id } = req.query;
        const targetUserId = userId || id || req.body?.userId;

        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.max(1, parseInt(limit) || 5);
        const skip = (pageNum - 1) * limitNum;

        const query = targetUserId ? { userId: targetUserId } : {};

        const notes = await notesModel
            .find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        return res.status(200).json(notes);
    } catch (error) {
        return res.status(500).json({ msg: "internal server error", error });
    }
});


notesRouter.get("/note-by-content", async (req, res) => {
    try {
        const userId = getUserId(req);
        const { content } = req.query;

        const filter = {};
        if (content) {
            filter.content = { $regex: content, $options: "i" };
        }
        if (userId) {
            filter.userId = userId;
        }

        const note = await notesModel.findOne(filter);

        if (!note) {
            return res.status(404).json({ msg: "No note found" });
        }

        return res.status(200).json({ msg: "Note retrieved successfully", note });
    } catch (error) {
        return res.status(500).json({ msg: "internal server error", error });
    }
});

notesRouter.get("/note-with-user", async (req, res) => {
    try {
        const userId = getUserId(req);
        const filter = userId ? { userId } : {};

        const notes = await notesModel.find(filter)
            .select("title userId createdAt")
            .populate({ path: "userId", select: "email -_id" });

        return res.status(200).json({ msg: "Notes retrieved successfully", notes });
    } catch (error) {
        return res.status(500).json({ msg: "internal server error", error });
    }
});

notesRouter.get("/aggregate", async (req, res) => {
    try {
        const userId = getUserId(req);
        const { title } = req.query;

        const matchStage = {};
        if (userId) {
            matchStage.userId = mongoose.Types.ObjectId.isValid(userId)
                ? new mongoose.Types.ObjectId(userId)
                : userId;
        }
        if (title) {
            matchStage.title = { $regex: title, $options: "i" };
        }

        const pipeline = [];
        if (Object.keys(matchStage).length > 0) {
            pipeline.push({ $match: matchStage });
        }
        pipeline.push(
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user",
                },
            },
            { $unwind: "$user" },
            {
                $project: {
                    title: 1,
                    userId: 1,
                    createdAt: 1,
                    "user.name": 1,
                    "user.email": 1,
                },
            }
        );

        const notes = await notesModel.aggregate(pipeline);

        return res.status(200).json({ msg: "Notes retrieved successfully", notes });
    } catch (error) {
        return res.status(500).json({ msg: "internal server error", error });
    }
});

notesRouter.delete("/", async (req, res) => {
    try {
        const userId = getUserId(req);
        const filter = userId ? { userId } : {};

        await notesModel.deleteMany(filter);

        return res.status(200).json({ msg: "Deleted" });
    } catch (error) {
        return res.status(500).json({ msg: "internal server error", error });
    }
});


notesRouter.patch("/:noteId", async (req, res) => {
    try {
        const { title, content, userId } = req.body;
        const note = await notesModel.findById(req.params.noteId);
        if (!note) {
            return res.status(404).json({ msg: "Note not found" });
        }
        if (note.userId.toString() !== userId?.toString()) {
            return res.status(403).json({ msg: "you are not the owner" });
        }
        if (title) note.title = title;
        if (content) note.content = content;
        await note.save();
        return res.status(200).json({ msg: "Note updated successfully", note });
    } catch (error) {
        return res.status(500).json({ msg: "internal server error", error });
    }
});

notesRouter.put("/replace/:noteId", async (req, res) => {
    try {
        const { title, content, userId } = req.body;
        const note = await notesModel.findById(req.params.noteId);
        if (!note) {
            return res.status(404).json({ msg: "Note not found" });
        }
        if (note.userId.toString() !== userId?.toString()) {
            return res.status(403).json({ msg: "you are not the owner" });
        }
        note.title = title;
        note.content = content;
        await note.save();
        return res.status(200).json({ msg: "Note replaced successfully", note });
    } catch (error) {
        return res.status(500).json({ msg: "internal server error", error });
    }
});

notesRouter.delete("/:noteId", async (req, res) => {
    try {
        const { userId } = req.body;
        const note = await notesModel.findById(req.params.noteId);
        if (!note) {
            return res.status(404).json({ msg: "Note not found" });
        }
        if (note.userId.toString() !== userId?.toString()) {
            return res.status(403).json({ msg: "you are not the owner" });
        }
        await note.deleteOne();
        return res.status(200).json({ msg: "Note deleted successfully", note });
    } catch (error) {
        return res.status(500).json({ msg: "internal server error", error });
    }
});

notesRouter.get("/:noteId", async (req, res) => {
    try {
        const { noteId } = req.params;
        const userId = getUserId(req);

        const note = await getNoteById(noteId);
        if (!note) {
            return res.status(404).json({ msg: "Note not found" });
        }

        await note.populate("userId");

        if (userId && note.userId?._id?.toString() !== userId.toString()) {
            return res.status(403).json({ msg: "you are not the owner" });
        }

        return res.status(200).json({ msg: "Note retrieved successfully", note });
    } catch (error) {
        return res.status(500).json({ msg: "internal server error", error });
    }
});

export default notesRouter;
