import mongoose from "mongoose";
import { DB_NAME } from "../constants.js"

// 1. It takes time so always use async await
// 2. Use error handling
const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

        console.log(`\n MongoDB connected !! DB host ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("ERROR: ", error);
        process.exit(1);
    }
}

export default connectDB;