
const mongoose = require('mongoose');


const storeSchema = mongoose.Schema({
    _id /*protected*/ : mongoose.Schema.Types.ObjectId,
    name: { 
            type: String ,
             required: true ,
             lowercase : true ,
              trim : true ,
               maxLength : 20
            } ,
    
    imgPath /*protected*/ : {
                type : String 
                
            } ,
    
    keywords : [String] ,

    createdAt /*protected*/ : {
                type : Date ,
                required : true ,
                default : new Date()
            } ,
    
    categories : [String] ,
    
    products /*protected*/ : [{
                type : mongoose.Schema.Types.ObjectId ,
                ref : 'Product'
            }]
        ,
    
    address : {
        governorate : {
            type : String ,
            required : true ,
            trim : true ,
            lowercase : true ,
            enum: [
                    "tataouine","kebili","medenine","kasserine","gafsa","sfax","sidi bouzid",
                    "gabes","kairouan","tozeur","kef","siliana","bizerte","beja","jendouba",
                    "mahdia","nabeul","zaghouan","sousse","mannouba","monastir","ben arous",
                    "ariana","tunis"
                ] 
           
        } ,
        municipality : {
            type : String ,
            trim : true ,
            required : true ,
            lowercase : true ,
            maxLength : 20
        } ,
        postalCode : {
            type : Number ,
            min : 1000 ,
            max : 9199 ,
            required :true
        } ,
        city : {
            type : String ,
            trim : true ,
            required : true ,
            lowercase : true ,
            maxLength : 20
        } ,
        street : {
            type : String ,
            trim : true ,
            required : true ,
            lowercase : true ,
            maxLength : 30
            
        }
    } 
   
});

module.exports = mongoose.model('Store', storeSchema);