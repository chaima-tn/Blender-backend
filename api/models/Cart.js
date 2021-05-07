
const mongoose = require('mongoose');


const cartSchema = mongoose.Schema({
    
    _id /*protected*/ : mongoose.Schema.Types.ObjectId ,

    
    totalPrice /* protected */ : {
        type : Number ,
        required : true ,
        default : 0 ,
        min : 0
    } ,
    

    customer /* protected on update */ : {
        type :  mongoose.Schema.Types.ObjectId ,
        ref : 'User' ,
        required : true
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

module.exports = mongoose.model('Cart', cartSchema);