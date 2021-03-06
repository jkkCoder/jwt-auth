const User = require("../models/User")
const jwt = require("jsonwebtoken")

//handle errors
const handleErrors = (err)=>{
    console.log(err.message, err.code)
    let errors={
        email:"",
        password:""
    }

    //incorrect email
    if(err.message === "incorrect email")
        errors.email = "that email is not registered"
    
    //incorrect password
    if(err.message === "incorrect password")
        errors.password = "that password is incorrect"
    
    //duplicate error code
    if(err.code === 11000){         //this is  duplicate email code
        console.log("email already registered")
        errors.email = "that email is already registered"
        return errors
    }

    //validation errors
    if(err.message.includes("user validation failed")){
        Object.values(err.errors).forEach(({properties})=>{
            errors[properties.path] = properties.message
        })
    }

    return errors
}

const maxAge = 3*24*60*60   //3 days
const createToken = (id)=>{
    return jwt.sign({id},"thisismysexysecretcodewhichicannotrevealjayeshsantoshpinkykittu",{
        expiresIn: maxAge
    })
}

const signup_get = (req,res)=>{
    res.render("signup")
}

const login_get = (req,res)=>{
    res.render("login")
}

const signup_post = async (req,res)=>{
    const {email,password} = req.body

    try{
        const user = await User.create({email,password})
        const token = createToken(user._id)
        res.cookie("jwt",token,{httpOnly:true,maxAge:maxAge*1000})     //token expires in 3 days so cookie should also expire in 3 days
                                                                        //httpOnly cannot makes us access to cookies from frontend
        res.status(201).json({user:user._id})
    }catch(err){
        const errors = handleErrors(err)
        res.status(400).json({errors:errors})
    }
}

const login_post = async (req,res)=>{
    const {email,password} = req.body
    try{
        const user = await User.login(email,password)      //function defined in user models as static function
        const token = createToken(user._id)
        res.cookie("jwt",token,{httpOnly:true,maxAge:maxAge*1000})

        res.status(200).json({user:user._id})        
    }catch(err){
        const errors = handleErrors(err)
        res.status(400).json({errors:errors})
    }
}

const logout_get = (req,res)=>{
    res.cookie("jwt","",{ maxAge:1})    //changing the value of jwt to null and deleting it asap
    res.redirect("/")
}

module.exports = {
    signup_get,
    login_get,
    signup_post,
    login_post,
    logout_get
}