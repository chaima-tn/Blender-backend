
const mongoose = require('mongoose');


const productSchema = mongoose.Schema({
    
    _id /*protected*/ : mongoose.Schema.Types.ObjectId,

    
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