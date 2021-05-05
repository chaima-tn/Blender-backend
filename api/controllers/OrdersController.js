
const Order = require("../models/Order");
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const ObjectId = require('mongoose').Types.ObjectId;

// Forms an array of all the Order model schema paths excluding only private and protected paths .
const regex = /(^_)|(^at$)/; //Regex that matches private [prefixed with '_'] and protected [those that is not meant to be set by an input .] paths .
const schemaPaths = Object.getOwnPropertyNames(Order.prototype.schema.paths).filter(item => ! regex.test(item));

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
         const orders =  await Order.find().select("-__v").populate('product cart',"-__v").lean().exec() ;
         res.status(200).json(orders);
         
         }
     )
     ().catch(next);

}; 

module.exports.post = (req , res , next) => {

    //Declaring newOrder , this object will be saved to DB . 
    const newOrder = {
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
        
        
            //Populating the newOrder with values from the request body that matches the schema paths and ignoring other values .
            schemaPaths.forEach(item => {
                if(  req.body[item] != undefined && item !== 'accepted' ) //Any new order initially is unaccepted , it can be accepted by the store owne later on .
                    newOrder[item] = req.body[item];
            });
        
            //Tests weither the given ID in the URL can be a valid ObjectID or not , in case it cannot be a valid ObjectID an error with status 400 is returned and no need to query the DB .
            if(! ObjectId.isValid(newOrder.product) )
                throw ( Object.assign(new Error("Product ID is invalid .") , {status : 400}) );

            if(! ObjectId.isValid(newOrder.cart) )
                throw ( Object.assign(new Error("Cart ID is invalid .") , {status : 400}) );    

            const product = await Product.findById(newOrder.product).exec();

            if(product == null)
                throw ( Object.assign(new Error("Product not found .") , {status : 404}) );

            const cart =  await Cart.findById(newOrder.cart).exec();

            if(cart == null)
                throw ( Object.assign(new Error("Cart not found .") , {status : 404}) );

            const order = await new Order(newOrder).save({select : {__v : -1 }});

            await Product.updateOne({_id : newOrder.product} , {$addToSet : {orders : newOrder._id}} , updateOps).exec();//Push the new order to the list of orders of the product . 
            await Cart.updateOne({_id : newOrder.cart} , {$addToSet : {orders : newOrder._id}} , updateOps).exec();//Push the new order to the list of orders of the cart . 


            res.status(201).json(order); 
    })()
    .catch(next)

};


module.exports.put = (req , res , next) => {

    const orderId = req.params.id ;
    const updateOrder = {} ;


    (
        async () => {

            //Tests weither the given ID in the URL can be a valid ObjectID or not , in case it cannot be a valid ObjectID an error with status 400 is returned and no need to query the DB .
            if(! ObjectId.isValid(orderId) )
                throw ( Object.assign(new Error("Order ID is invalid .") , {status : 400}) );

            const reqBodyProperties = Object.getOwnPropertyNames(req.body);//populate reqBodyProperties with req.body property names .
            //Tests weither the req.body contains properties that respects the schema , in case there is at least one invalid property name an error of status 400 will be returned .
            if( ! require("../functions/isArrEquals")(reqBodyProperties , schemaPaths ) )
                throw ( Object.assign(new Error("Invalid input .") , {status : 400}) );

            //Dynamically populating the updateOrder with the new values that confirms with the Order schema .
            schemaPaths.forEach(item => {
                if( req.body[item] != undefined && item !== 'product' && item !== 'cart' ) //product id cannot be altered .
                   updateOrder[item] = req.body[item]
            });

         
            const updatedOrder = await Order.findByIdAndUpdate( orderId , updateOrder , updateOps ).exec();

            if(updatedOrder == null)
               throw ( Object.assign(new Error("Order not found .") , {status : 404}) );


            res.status(201).json(updatedOrder);
        }
    )
    ().catch(next);

};

module.exports.delete = (req , res , next) => {

    const orderId = req.params.id ;

    (
        async () => {
            
            //Tests weither the given ID in the URL can be a valid ObjectID or not , in case it cannot be a valid ObjectID an error with status 400 is returned and no need to query the DB .
            if(! ObjectId.isValid(orderId) )
                throw ( Object.assign(new Error("Order ID is invalid .") , {status : 400}) );

            const deletedOrder = await Order.findByIdAndRemove( orderId , deleteOps ).exec();

           if(deletedOrder == null)
                throw ( Object.assign(new Error("Order not found .") , {status : 404}) );

            await Product.updateOne({_id : deletedOrder.product} , {$pull : {orders : deletedOrder._id}} , updateOps).exec();//Pull the removed order from the product list of orders . 

            await Cart.updateOne({_id : deletedOrder.cart} , {$pull : {orders : deletedOrder._id}} , updateOps).exec();//Pull the removed order from the cart list of orders . 

           
            res.status(201).json(deletedOrder);
        }
    )().catch(next)
  

};