import mongoose, { Schema, Document } from "mongoose";
import User from "./User";

interface Message extends Document {
  sender: Schema.Types.ObjectId;
  recipient: Schema.Types.ObjectId;
  text: string;
}

const messagesSchema = new Schema<Message>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: User,
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: User,
    },
    text: {
      type: String,
    },
  },
  { timestamps: true },
);

export default mongoose.model("message", messagesSchema);
