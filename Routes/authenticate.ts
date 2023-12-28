import express, { Request, Response } from "express";
import User from "../Models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import authenticate from "../Middlewares/auth";

const authRouter = express.Router();
authRouter.post("/login", async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  try {
    if (!user) {
      res.status(401).json({ msg: "User does not exist." });
    } else {
      const compare = await bcrypt.compare(password, user.password as string);
      if (compare) {
        const token = await jwt.sign(
          { id: user.id },
          process.env.JWT_SECRET as string,
        );
        const expiration = 24 * 60 * 60 * 1000;
        res
          .status(200)
          .cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: expiration,
          })
          .send();
      } else {
        res
          .status(401)
          .json({ msg: "The password you entered was incorrect." });
      }
    }
  } catch (err) {
    res.status(500).json({ msg: err });
  }
});

authRouter.post("/register", async (req: Request, res: Response) => {
  const { username, password, email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(password, salt);
      await User.create({
        username,
        email,
        password: secPass,
      });
      res.status(201).json({ msg: "User created" });
    } else {
      res
        .status(401)
        .json({ msg: "An account with this E-Mail already exists" });
    }
  } catch (err) {
    res.status(500).json({ msg: err });
  }
});

authRouter.get("/verifytoken", authenticate, (req: Request, res: Response) => {
  if (req.verify) {
    res.status(200).json({ user: req.user });
  } else {
    res.sendStatus(401);
  }
});

authRouter.post("/logout", (req: Request, res: Response) => {
  res
    .cookie("token", "", { httpOnly: true, sameSite: "none", secure: true })
    .send();
});

export default authRouter;
