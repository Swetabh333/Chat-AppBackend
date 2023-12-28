import express, { Request, Response } from "express";
import User from "../Models/User";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const user = await User.find({}, { _id: 1, username: 1 });
    res.status(200).json(user);
  } catch (err) {
    res.sendStatus(500);
  }
});

export default router;
