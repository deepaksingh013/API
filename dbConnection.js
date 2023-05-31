// const express = require("express")
const mongoose = require("mongoose")
mongoose.connect("mongodb://127.0.0.1:27017/firstdb",(err,res)=>{
    if(err){
        console.log("connection failed")
    }else if(res){
        console.log("db is connected")
    }
})
