import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      // CHANGED: Password is no longer strictly required for Google users
      required: function() {
        return !this.googleId; // Only required if they aren't using Google Auth
      },
      minlength: 8,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple traditional users to have no googleId
    },
    avatar: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      default: null,
    },
    weight: {
      type: Number,
      default: null,
    },
    height: {
      type: Number,
      default: null,
    },
    fitnessGoal: {
      type: String,
      enum: ["lose_weight", "build_muscle", "improve_endurance", "stay_active", "other"],
      default: "stay_active",
    },
    weeklyGoal: {
      type: Number,
      default: 4,
      min: 1,
      max: 7,
    },
    dailyWaterGoal: {
      type: Number,
      default: 8,
    },
    waterIntake: {
      type: Number,
      default: 0,
    },
    waterDate: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Hashing hook
userSchema.pre("save", async function (next) {
  // CHANGED: Added verification to check if a password exists before hashing
  if (!this.password || !this.isModified("password")) return next();
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  // Safely handle cases where a Google user tries to sign in traditionally without a password
  if (!this.password) return false; 
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;