const mongoose = require("mongoose");

const authorSchema = new mongoose.Schema({
    name : {
        type : String ,
        required : true ,
    } ,
    email :{
        type : String , 
        required : true , 
    } , 
    password : {
        type : String ,
        required : true , 

    }
})

const author = mongoose.model('author' , authorSchema);
module.exports = author;