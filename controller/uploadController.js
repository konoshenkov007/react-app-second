const cloudinary = require("cloudinary").v2;
const fs = require("fs");

const uploadImage = async (req, res) => {
    //CHECK IF FILE IS IN REQUEST
    if(!req.files || !req.files.image){
        return res.status(400).json({success:false, message:"Missing or invalid data"});
    }

    //CHECK MIME TYPE
    //Even though Cloudinary does its own validation, checking MIME type early 
    //lets you reject bad uploads without wasting bandwidth.
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(req.files.image.mimetype)) {
        return res.status(400).json({ success: false, message: "Unsupported file type" });
    }

    //CHECK FILE DATA SIZE
    //Cloudinary does have limits, but you might want to enforce tighter limits yourself to:
    //  Save on upload bandwidth
    //  Catch issues before they hit Cloudinary 
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (req.files.image.size > maxSize) {
        return res.status(400).json({ success: false, message: "File too large. Max 2MB allowed." });
    }

    try {
        const result = await cloudinary.uploader.upload(
            req.files.image.tempFilePath, {
                use_filename: true,
                folder: "MyTestImagesFolder"
            }
        );

        //fs.unlinkSync(req.files.image.tempFilePath);
        //Using unlinkSync blocks the event loop. It's better to use the async version inside try/catch
        fs.unlink(req.files.image.tempFilePath, (err) => {
            if (err) console.log("Temp file deletion failed:", err);
        });

        //SAVE IMAGE URL IN MONGOOSE DB HERE
        req.body.image = result.secure_url;
        //const savedData = await MyModel.create(req.body);
        console.log(req.body.image);

        res.status(200).json({success:true, message:"Image uploaded successfully."});
    } catch (error) {
        console.log(error);
        res.status(500).json({success:false, message:"Upload failed."});
    }

    
}

module.exports = uploadImage;