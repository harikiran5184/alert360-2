const mongoose = require('mongoose')

const loginSchema=mongoose.Schema({
    phoneno:{
        type: String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    userName:{
        type:String,
        required:true
    },location:{
        type:String,
        require:false
    },
    email:{
        type:String,
        require:false
    },DID:{
        type:String,
        require:false
    }
})

let Login=module.exports=mongoose.model('usersData',loginSchema)