// require('dotenv').config({path: './env'})
// import dotenv from "dotenv"
import connectDB from "./db/index.js";
import express from "express"

const app = express()

// dotenv.config({
//     path: './env'
// })

connectDB()
    .then(() => {
        app.listen(process.env.PORT || 3000, () => {
            console.log(`Server is running at port: ${process.env.PORT}`);
        });
    })
    .catch((err) => {
        console.log("MONGO db connection failed !!! ", err);
    })














// import express from "express";
// const app = express();

// ; (async () => {
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI} /
//             ${DB_NAME} `)
//         app.on("errror", () => {
//             console.log("ERRR: ", error);
//             throw error
//         })

//         app.listen(process.env.PORT, () => {
//             console.log(`App is listening on PORT ${process.env.PORT}`);
//         })
//     } catch (error) {
//         console.error("ERROR", error);
//         throw err
//     }
// })()