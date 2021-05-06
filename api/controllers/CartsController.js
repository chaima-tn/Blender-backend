
const Cart = require("../models/Cart");
const ObjectId = require('mongoose').Types.ObjectId;

// Forms an array of all the Cart model schema paths excluding only private and protected paths .
const regex = /(^_)|(^at$)|(^orders$)/; //Regex that matches private [prefixed with '_'] and protected [those that is not meant to be set by an input .] paths .
const schemaPaths = Object.getOwnPropertyNames(Cart.prototype.schema.paths).filter(item => ! regex.test(item));

//Mongoose update options .  
const updateOps = {
    useFindAndModify : false ,
    runValidators : true ,
    new :true
    };
//Mongoose delete options .         
const deleteOps  = {
    useFindAndModify : false
    };

module.exports.getAll = (req,res,next) => {

    ( 
        async  () => {
         const carts =  await Cart.find().select("-__v").populate('orders',"-__v").lean().exec() ;
         res.status(200).json(carts);
         
         }
     )
     ().catch(next);

}; 

module.exports.post = (req , res , next) => {

    //Declaring newCart , this object will be saved to DB . 
    const newCart = {
        _id :  new ObjectId() 
    };     
   
    (
        async () => { 

                    
            const reqBodyProperties = Object.getOwnPropertyNames(req.body);//populate reqBodyProperties with req.body property names .

            //Tests weither the req.body contains properties that respects the schema , in case there is at least one invalid property name an error of status 400 will be returned .
            // The message is obscure insuring security by obscurity concept .
            //This helps protect special paths that are not meant to be altered by an input and determined by the backend app logic .
            if( ! require("../functions/isArrEquals")( reqBodyProperties , schemaPaths ) )
                throw ( Object.assign(new Error("Invalid input .") , {status : 400}) );
 
            const cart = await new Cart(newCart).save({select : {__v : -1 }});
            
            res.status(201).json(cart); 
    })()
    .catch(next)

};


module.exports.delete = (req , res , next) => {

    const cartId = req.params.id ;

    (
        async () => {
            
            //Tests weither the given ID in the URL can be a valid ObjectID or not , in case it cannot be a valid ObjectID an error with status 400 is returned and no need to query the DB .
            if(! ObjectId.isValid(cartId) )
                throw ( Object.assign(new Error("Cart ID is invalid .") , {status : 400}) );

            const deletedCart = await Cart.findByIdAndRemove( cartId , deleteOps ).exec();

           if(deletedCart == null)
                throw ( Object.assign(new Error("Cart not found .") , {status : 404}) );

 
            res.status(201).json(deletedCart);
        }
    )().catch(next)
  

};