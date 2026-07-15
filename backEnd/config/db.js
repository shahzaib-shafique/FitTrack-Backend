import mongoose from "mongoose";

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error("❌ Error: MONGO_URI is missing from your .env configuration file.");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected Successfully!`);
    console.log(`Connected Host Cluster: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database Connection Failed!`);
    console.error(`Reason: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;