const mongoose = require('mongoose');


const productSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    label: { type: String, required: true , trim : true , maxLength : 20 },
    quantity : {
        type: Number ,
        required : true ,
        min : 1 
    } ,

    imgPath : {
        type : String 
        
    } ,

    unit : {
        type : String ,
        required : true ,
        enum: ['g', 'l' , 'piece'] ,
        default : 'piece'
    } ,
    unitPrice : {
        type : Number ,
        required : true ,
        min : 0
    } ,
    detail : {
        type : String ,
        required : true ,
        maxLength : 200 
    } ,
    keywords : [String] ,
    createdAt : {
        type : Date ,
        required : true ,
        default : new Date()
    } ,
    categories : [String] ,
    orders : [{
        type : mongoose.Schema.Types.ObjectId ,
        ref : 'Order'
    }]

});

module.exports = mongoose.model('Product', productSchema);