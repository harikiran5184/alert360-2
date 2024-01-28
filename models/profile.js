const mongoose = require('mongoose')

const photoSchema=mongoose.Schema({
    phoneno:{
        type: String,
        required:true
    },
    userName:{
        type:String,
        required:true
    },
    photo:{
        type:String,
        required:true
    }
})

let ProfilePhoto=module.exports=mongoose.model('ProfilePhoto',photoSchema)