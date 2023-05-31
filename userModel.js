const mongoose = require("mongoose")

const user = mongoose.Schema({
    name:{
        type:String,
    },
    email:{
        type:String
    },
    password:{
        type:String
    },
    mobilenumber:{
        type:Number
    },
    otp:{
        type:Number
    },
    otpverify:{
        type:Boolean,
        default:false
    },
    token:{
        type:String,
        default:""
    }

})

   
module.exports = mongoose.model("User",user)
