const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const {isEmail} = require("validator")

const userSchema = new mongoose.Schema({
    email:{
        type:String,
        require:[true,"please enter an email"],     //1st index is error message
        unique:true,        //cannot send error as 1st index for unique
        lowercase:true,
        validate: [isEmail,"Please enter a valid email"]
    },
    password:{ 
        type:String,
        required:[true,"please enter an password"],
        minlength:[6,"Minimum password length is 6 character"]
    }
})

//fire a function after a doc saved to db
// userSchema.post("save",function(doc,next){  
//     console.log("new user was created and saved",doc)
//     next()
// })

//fire a function before doc saved to db
userSchema.pre("save",async function(next){
    this.password = await bcrypt.hash(this.password,8)
    next()
})

//static method to login user
userSchema.statics.login = async function(email,password){
    const user = await this.findOne({email:email})  //this is User
    if(user){
        const isMatch = await bcrypt.compare(password,user.password)
        if(isMatch){
            return user
        }
        throw Error("incorrect password")
    }
    throw Error("incorrect email")
}

const User = mongoose.model("user",userSchema)
module.exports = User