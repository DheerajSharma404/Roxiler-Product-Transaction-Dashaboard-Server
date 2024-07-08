import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "roxiler_porduct_transaction_db",
    });

    console.log("MongoDB Connected");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

export default {
  PORT: process.env.PORT,
  MONGODB_URI: process.env.MONGODB_URI,
  connect,
};
