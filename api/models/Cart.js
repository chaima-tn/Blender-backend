
const mongoose = require('mongoose');


const productSchema = mongoose.Schema({
    
    _id /*protected*/ : mongoose.Schema.Types.ObjectId ,

    
    totalPrice /* protected */ : {
        type : Number ,
        required : true ,
        default : 0 ,
        min : 0
    } ,
    
    at /*protected*/  : {
        type : Date ,
        required : true ,
        default : new Date()
    } ,

    orders /*protected*/ : [{
        type : mongoose.Schema.Types.ObjectId ,
        ref : 'Order'
    }]

});

module.exports = mongoose.model('Cart', productSchema);