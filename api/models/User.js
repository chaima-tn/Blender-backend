
const mongoose = require('mongoose');


const userSchema = mongoose.Schema({
    
    _id /*protected*/ : mongoose.Schema.Types.ObjectId ,

    firstName: { 
        type: String ,
         required: true ,
         lowercase : true ,
          trim : true ,
           maxLength : 20
        } ,

    lastName: { 
            type: String ,
             required: true ,
             lowercase : true ,
              trim : true ,
               maxLength : 20
            } ,

    imgPath /*protected*/ : {
        type : String ,
        trim : true 
    } ,
    
    birthDate : {
        type : Date ,
        required : true ,
        min: '1921-01-01',
        validate: {
            validator: (date) => {

                const diff_ms = Date.now() - date.getTime();
                const age_dt = new Date(diff_ms); 
            
                return Math.abs(age_dt.getUTCFullYear() - 1970) >= 16 ;
            },
            message: () =>  ` Users must be 16 years old or older to use Blender . `
          },
    } ,
        
    role /* protected on update */ : {
        type : String ,
        required: true ,
        lowercase : true ,
        trim : true ,
        enum : ['owner' , 'customer'] 
    } ,

    store /*protected */ : {
        type : mongoose.Schema.Types.ObjectId ,
        ref : 'Store'
    }
    ,

    username /* must be unique / protected on update */ : {
        type : String ,
        required : true ,
        lowercase : true ,
        trim :true ,
        maxLength : 20 ,
        //unique : true 
    } ,

    password : {
        type : String ,
        required : true ,
        minLength : 8 ,
        maxLength : 25 ,
    } ,

    phone /*must be unique*/ : {
        type :Number ,
        required : true ,
        min : 20000000 ,
        max : 99999999 ,
    }
    ,

    email /*must be unique*/  : {
        type : String ,
        required : true ,
        match : /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g ,
        //unique : true
    }
    ,

    at /*protected*/  : {
        type : Date ,
        required : true ,
        default : new Date()
    } ,

    carts /*protected*/ : [{
        type : mongoose.Schema.Types.ObjectId ,
        ref : 'Cart'
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

module.exports = mongoose.model('User', userSchema);