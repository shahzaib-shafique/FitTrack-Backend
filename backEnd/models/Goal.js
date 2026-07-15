import mongoose from "mongoose";

const goalSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
    },
    targetDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "achieved"],
      default: "pending",
    },
  },
  { timestamps: true },
);

const Goal = mongoose.model("Goal", goalSchema);
export default Goal;
