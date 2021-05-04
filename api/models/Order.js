
const mongoose = require('mongoose');


const productSchema = mongoose.Schema({
    
    _id /*protected*/ : mongoose.Schema.Types.ObjectId,

    quantity : {
        type: Number ,
        required : true ,
        min : 1 
    } ,

    accepted : {
        type : Boolean 
    } ,
  
    at /*protected*/  : {
        type : Date ,
        required : true ,
        default : new Date()
    } ,

 

    by : {
        type :  mongoose.Schema.Types.ObjectId ,
        ref : 'User' ,
        //required : true
    } ,

    product /*protected on update */  : {
        type : mongoose.Schema.Types.ObjectId ,
        ref : 'Product' ,
        required : true
    } 

});

module.exports = mongoose.model('Order', productSchema);