const mongoose = require("mongoose")
const signupSchema = mongoose.Schema({
    fname:String,
    lname:String,
    email:{
        type:String,
        required:true,
        unique:true
    },
    cemail:String,
    password:String,
    cpassword:String
})
// module.exports = mongoose.module("signups",SignupSchema)

const userdb = mongoose.model('signups',signupSchema)

module.exports = userdb