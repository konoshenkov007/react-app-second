require("dotenv").config();
const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;
const host = process.env.SERVER || "localhost";

const mongoose = require("mongoose");

const auth = require("./middleware/authentication"); 

const middleware = require("./middleware/logger");

app.use(express.json());
app.use(middleware);

const start = async () => {
    if(!process.env.mongoose_URI){
        console.error("ERROR: Mongoose URI missing in .env");
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.mongoose_URI);

        console.log("Connected to Mongoose DB");

        app.get("/", (req, res) => {
            res.status(200).json({success:true, message:"Welcome to THE server."});
        })

        const authRouter = require("./routes/authRouter");
        app.use("/api", authRouter);

        app.get("/api/auth", auth, (req, res) => {
            res.status(200).json({success:true, message:"Authorization Token is valid."});
        });
        app.get("/api/user", auth, (req, res) => {
            res.status(200).json({success:true, message:"Welcome to dashboard."});
        });
        
        // This should go after all routes but before the global error handler
        app.all('*', (req, res) => {
            res.status(404).json({success:false, message:`Cannot find ${req.originalUrl} on this server`}); // Forward to error handler
        });

        app.listen(PORT, host, () => {
            console.log(`Now Listening on ${host}:${PORT} ...`);
        });
    } catch (error) {
        console.error(error);
        process.exit(1);
    }

}

start();