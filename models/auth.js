const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const { isEmail } = require("validator");
const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const userSchema = new Schema({
    name: {
        type: String,
        required: [true, "Please provide a Name."]
    },
    email: {
        type: String,
        required: [true, "Please provide an Email Address."],
        lowercase: true, // <- this forces lowercase storage
        unique: true,
        validate: [isEmail, "Please provide a valid Email Address."]
    },
    password: {
        type: String,
        required: [true, "Please provide a Password."],
        minlength: [7, "Password minimum lenght is 7."]
    }
}, {timestamps: true});

//This runs before insertion of new data during registration
userSchema.pre("save", async function (next) {
    // Format name: capitalize first letter of each word
    if (this.name) {
        this.name = this.name
            .toLowerCase()
            .split(" ")
            .filter(word => word) // remove extra spaces
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    }

    // Normalize firstName
    // if (this.firstName) {
    //     this.firstName = this.firstName
    //         .toLowerCase()
    //         .split(" ")
    //         .filter(word => word)
    //         .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    //         .join(" ");
    // }

    // Normalize lastName
    // if (this.lastName) {
    //     this.lastName = this.lastName
    //         .toLowerCase()
    //         .split(" ")
    //         .filter(word => word)
    //         .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    //         .join(" ");
    // }

    // Hash password (only if it's new or modified)
    if (this.isModified("password")) {
        const salt = await bcrypt.genSalt();
        this.password = await bcrypt.hash(this.password, salt);
    }

    next();
});

//create a new mongoDB method here called "compare password"
//this will be used in login to check if the inputed password matches with whats on the database
userSchema.methods.comparePassword = async function(userPassword) {
    const isCorrect = await bcrypt.compare(userPassword, this.password);
    return isCorrect;
};

//generate token
userSchema.methods.generateToken = function() {
    return jwt.sign(
        {userID: this._id, name: this.name}, 
        process.env.JWT_Secret,
        {expiresIn: "1d"}
    );
};

// Clean JSON output
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    delete user.__v;
    return user;
};

module.exports = mongoose.model("User", userSchema);