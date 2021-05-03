
const mongoose = require('mongoose');


const productSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    label: { 
        type: String ,
          required: true ,
          trim : true ,
          lowercase : true ,
           maxLength : 20
         },

    store : {
        type : mongoose.Schema.Types.ObjectId ,
        required : true ,
        ref : 'Store'
    }
    ,

    quantity : {
        type: Number ,
        required : true ,
        min : 1 
    } ,

    imgPath : {
        type : String ,
        trim : true 
    } ,

    unit : {
        type : String ,
        trim : true ,
        required : true ,
        lowercase : true ,
        enum: ['g', 'l' , 'kg' , 'piece'] ,
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
        trim : true ,
        lowercase : true ,
        maxLength : 200 
    } ,
    keywords : [String] ,
    createdAt : {
        type : Date ,
        required : true ,
        default : new Date()
    } ,
    categories : [
        {
            type : String ,
            trim : true ,
            lowercase : true ,
            maxLength : 20 
        }
    ] ,
    orders : [{
        type : mongoose.Schema.Types.ObjectId ,
        ref : 'Order'
    }]

});

module.exports = mongoose.model('Product', productSchema);