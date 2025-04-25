import mongoose  from "mongoose";
import bcrypt  from "bcryptjs";

const userSchema = new mongoose.Schema({
    fullName:{
        type: String,
        required: true,
        minlength: 3,
        trim: true
    },
    phone:{
        type: String,
        required: true,
        unique: true
    },
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password:{
        type: String,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    transactionPin:{
        type: String,
        minlength: 4,
    },
    otp: {type:String},
    otpExpires: { type: Date },
}, {timestamps: true}

);

userSchema.pre("save", async function (next) {
    if(!this.isModified("password"))
        return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
    
});

const User = mongoose.model('User', userSchema);
export default User;