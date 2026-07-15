import mongoose from "mongoose";

const workoutSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
      index: true,
    },
    exercise: {
      type: String,
      required: [true, "Exercise name is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Strength",
        "Cardio",
        "Flexibility",
        "HIIT",
        "Sports",
        "Yoga",
        "CrossFit",
        "Other",
      ],
      default: "Other",
    },
    duration: {
      type: Number,
      required: [true, "Duration is required"],
      min: [1, "Duration must be at least 1 minute"],
    },
    caloriesBurned: {
      type: Number,
      default: 0,
      min: 0,
    },
    sets: {
      type: Number,
      default: null,
      min: 1,
    },
    reps: {
      type: Number,
      default: null,
      min: 1,
    },
    weight: {
      type: Number,
      default: null,
      min: 0,
    },
    notes: {
      type: String,
      default: null,
      maxlength: 500,
    },
    date: {
      type: String,
      default: () => new Date().toISOString().split("T")[0],
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
  },
  { timestamps: true }
);

const Workout = mongoose.model("Workout", workoutSchema);
export default Workout;
