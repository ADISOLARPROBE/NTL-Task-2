import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";

const connectDB = async () => {
    try {
        const connectioInstance = await mongoose.connect
        (`${process.env.MONGODB_URI}`)
        console.log(`MongoDB connected !!! 
            ${connectioInstance.connection.host}`);

       
    } catch (error) {
        console.log("MongoDB connection failed", error);
        process.exit(1);
    }
};

export default connectDB;
