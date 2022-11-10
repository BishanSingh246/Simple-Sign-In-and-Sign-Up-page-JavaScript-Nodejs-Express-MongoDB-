const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const express = require("express");
const cookieParser = require("cookie-parser");




// Schema for post api
var schema = new mongoose.Schema({
    fname: { type: String, required: true },
    lname: String,
    email: { type: String, required: true },
    password: String,
    tokens:[{token:{type:String, required:true}}]
  });
  
  // for json web token(" generatng token")
  schema.methods.generateAuthToken= async function(){
    try {
      // const token = jwt.sign({_id:this._id.toString()},"thisisforsignupandsigninwithmongodbandjwtwithhashpassword");
      const token = jwt.sign({_id:this._id.toString()}, process.env.SECRET_KEY);
      // adding value to tokens data in schema
      this.tokens = this.tokens.concat({token:token})
      // for saving token in database
      await this.save();
      // console.log(`token created sucessfully =====>>>> ${token}`);
      return token
    } catch (error) {
      res.send(`Error in jwt ${error}`);
    }
  
  }
  
  // to make password hash before user.save method
  schema.pre("save", async function(next){
    if(this.isModified("password")){
      // const passwordHash = await bcrypt.hash(password, 10);
      // console.log(`the current password is ${this.password}`);
      this.password = await bcrypt.hash(this.password, 10);
      // console.log(`the current password is ${this.password}`);
    }
    next();
  })
  
  const Userdb = mongoose.model("userdb", schema);
  
  module.exports = Userdb