import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../Models/User";

const secret = process.env.JWT_SECRET

interface request extends Request{
  verify:boolean,
  user:string,
  ID:string
}

const authenticate = async (
  req: request,
  res: Response,
  next: NextFunction,
) => {
  if (req.cookies.token) {
    try {
      const  {id}  = jwt.verify(req.cookies.token,secret!) as JwtPayload;
      const user = await User.findById(id);
      if (user) {
        req.verify = true;
        req.user = user.username;
        req.ID = id;
        next();
      } else {
        res.sendStatus(401);
      }
    } catch (err) {
      res.sendStatus(500);
    }
  } else {
    res.sendStatus(401);
  }
};

export default authenticate;
