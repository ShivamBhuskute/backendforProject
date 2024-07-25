// require('dotenv').config({path: './env'})
// import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path: './.env'
});
// const app = express();

connectDB()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server is running at port: ${process.env.PORT}`);
        });
    })
    .catch((error) => {
        console.log("MONGO db connection failed !!! ", error);
    });









// app.listen(port, () => {
//     console.log(`Serve at http://localhost:${port}`);
// }); // <-- Closing parenthesis added here

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
