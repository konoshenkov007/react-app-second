require("dotenv").config();
const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;
const host = process.env.SERVER || "localhost";

const mongoose = require("mongoose");

const auth = require("./middleware/authentication"); 

const logger = require("./middleware/logger");

const fileUpload = require("express-fileupload");

const cloudinary = require("cloudinary").v2;
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

app.use(fileUpload({useTempFiles: true}));
app.use(express.json());
app.use(logger);

const start = async () => {
    if(!process.env.mongoose_URI){
        console.log("ERROR: Mongoose URI missing in .env");
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.mongoose_URI);

        console.log("Connected to Mongoose DB");

        app.get("/", (req, res) => {
            res.status(200).json({success:true, message:"Welcome to THE server."});
        })

        const uploadRouter = require("./routes/uploadRouter");
        app.use("/api", uploadRouter);

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
        console.log(error);
        process.exit(1);
    }

}

start();