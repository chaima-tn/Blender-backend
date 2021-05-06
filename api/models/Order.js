
const mongoose = require('mongoose');


const productSchema = mongoose.Schema({
    
    _id /*protected*/ : mongoose.Schema.Types.ObjectId,


    totalPrice /* protected */ : {
        type : Number ,
        required : true ,
        default : 0 ,
        min : 0
    } ,

    quantity /*protected on update*/  : {
        type: Number ,
        required : true ,
        min : 1 
    } ,

    accepted /*protected on create */ : {
        type : Boolean ,
        default : false
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
    } ,

    cart /*protected on update */ : {
        type : mongoose.Schema.Types.ObjectId ,
        ref : 'Cart' ,
        required : true
    }

});

module.exports = mongoose.model('Order', productSchema);