import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema({

    name: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    role: {
        type: String,
        enum: ['user','admin','worker'],
        required: true,
        lowercase: true,
        trim: true,
    },
    refreshToken: {
        type: String,
    }

}, {

    timestamps: true

})

userSchema.pre( "save", async function(next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash( this.password, 10 ); 
    next();
} ) 

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare( password, this.password );
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            name: this.name,
        },

        process.env.ACCESS_TOKEN_SECRET,

        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },

        process.env.REFRESH_TOKEN_SECRET,

        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

// Hide sensitive data when sending user objects in api response
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.refreshToken;
  return user;
};


export const User = mongoose.model("User", userSchema)