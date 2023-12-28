import express, { Request, Response } from "express";
import Messages from "../Models/Messages";
import authenticate from "../Middlewares/auth";

const router = express.Router();

router.get(
  "/messages/:userId",
  authenticate,
  async (req: Request, res: Response) => {
    const ID = req.params.userId;
    const user1 = req.ID;

    const messagesBetween = await Messages.find({
      recipient: { $in: [ID, user1] },
      sender: { $in: [ID, user1] },
    }).sort({ createdAt: 1 });
    res.json(messagesBetween);
  },
);

export default router;
