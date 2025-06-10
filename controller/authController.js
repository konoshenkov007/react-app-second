// 400 = client error (e.g., missing fields)

// 401 = unauthorized (e.g., bad credentials)

// 409 = conflict (e.g., email already registered)

const User = require("../models/auth");

const register = async (req, res) => {
    try {
        const existingUser = await User.findOne({ email: req.body.email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({ success: false, message: "Email is already registered." });
        }

        const user = await User.create(req.body);
        const { name, email } = user;
        res.status(201).json({success:true, message:"Registration successful.", data:{ name, email }});
    } catch (error) {
        console.error(error);
        res.status(500).json({success:false, message:"Oops! Something weird happened. Try again later."})
    }
};

const login = async (req, res) => {
    let { email, password } = req.body;

    email = email?.toLowerCase(); // normalize input
    
    try {
        if(!email || !password){
            return res.status(400).json({success:false, message:"All fields are required."});
        }

        //Checking if user is registered
        const user = await User.findOne({ email: new RegExp(`^${email}$`, 'i') }); //regex for case sensitivity
        if(!user){
            return res.status(401).json({success:false, message:"Invalid email or password."});
        }

        //Checking if its Incorrect credentials
        const authenticated = await user.comparePassword(password);
        if(!authenticated){
            return res.status(401).json({success:false, message:"Invalid email or password."});
        }

        const token = user.generateToken();

        res.status(200).json({ success:true, message:"Login successful.", data:user, token:token });

    } catch (error) {
        console.error(error);
        res.status(500).json({success:false, message:"Oops! Something weird happened. Try again later.", error:error});
    }

}

module.exports = { register, login };