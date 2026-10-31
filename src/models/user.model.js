const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

//ham neeche userSchema bnarhe hai taki hme user ka data store karne ke liye schema mile. isme hamne username, email aur password ke liye validation kiya hai taki user se hme shi data mile aur agar user ne galat data provide kiya hai to usko error message bhej ske.
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required:[true, "Username is required"],
        unique: true,
        trim: true, // Remove whitespace from the beginning and end
        minlength: [3, "Username must be at least 3 characters long"],
        maxlength: [20, "Username must be at most 20 characters long"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        trim: true,// Remove whitespace from the beginning and end
        unique: [true, "Email already exists"],
        lowercase: true,
        match: [/\S+@\S+\.\S+/, 'Please use a valid email address']
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters long"],
        maxlength: [100, "Password must be at most 100 characters long"],
        select: false // Exclude the password field from query results by default mtlb agr hamm user ka data fetch kar rhe hai to password ka data hme nahi milega taki hme security mile.

    },
    systemUser:{
        type:Boolean,
        default:false,
        immutable:true, //means once the systemUser is set, it cannot be changed. This is important for maintaining the integrity of the user, as each user should have a specific role that cannot be altered after creation.
        select:false // Exclude the systemUser field from query results by default mtlb agr hamm user ka data fetch kar rhe hai to systemUser ka data hme nahi milega taki hme security mile.
    }
},{timestamps: true});// Automatically add createdAt and updatedAt fields to the schema

//this keyword is used to identify the 
// hmne pre hook ka use kiya hai taki jab bhi user ka data save ho to password ko hash kar ske taki hme security mile. pre hook ka use karke hme password ko hash karne me help milega taki hme security mile.
userSchema.pre('save', async function () { //pre middleware ka use karke hme password ko hash karne me help milega taki hme security mile. 
    if (!this.isModified('password')) { //mtlb agar password modify nahi hua hai to return kar do taki request aage process ho jaye. isse hme security milegi taki hme password ko hash karne me help milega.
        return;
    }
    // Hash the password before saving mtlb agar password modify hua hai
    const hash = await bcrypt.hash(this.password, 12);
    this.password=hash;// means ham password ko hash me convert krrne ke baad waps se password me save krdiya
});
//yaha pr ham comparePassword method ka use karke password ko compare kar rhe hai taki hme pata chale ki user ka password sahi hai ya nahi. isme hamne bcrypt.compare ka use kiya hai taki hme security mile.
userSchema.methods.comparePassword= async function (password){
    return await bcrypt.compare(password,this.password); //bcrypt.compare ka use karke password ko compare kar rhe hai taki hme security mile. isme hamne password ko compare kiya hai taki hme pata chale ki user ka password sahi hai ya nahi.


}

const userModel = mongoose.model('User', userSchema);

module.exports = userModel;