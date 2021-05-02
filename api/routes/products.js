const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const ObjectId = require('mongoose').Types.ObjectId;

// Forms an array of all the Product model schema paths excluding only those are prefixed with an '_' .
const schemaPaths = Object.getOwnPropertyNames(Product.prototype.schema.paths).filter(item => ! /^_/.test(item));

// GET on FQDN/products OR FQDN/products/
router.get("/",(req,res,next) => {

   ( 
       async  () => {
        
        const products =  await Product.find().select("-__v").lean().exec() ;
        res.status(200).json(products);
        
        }
    )
    ().catch(next);

});

// POST on FQDN/products OR FQDN/products/
 router.post("/" , (req , res , next) => {
     
    const reqBodyProperties = Object.getOwnPropertyNames(req.body).filter(item => ! /^_/.test(item));

    //Tests weither the req.body contains properties that respects the schema , in case there is at least one invalid property name an error of status 400 will be returned .
      if( ! require("../functions/isArrEquals")(reqBodyProperties , schemaPaths ) )
         throw ( Object.assign(new Error("Invalid input .") , {status : 400}) );
    
    const newProduct = {
        _id : new ObjectId()
    };        
   
    //Populating the newProduct with values from the request body that matches the schema paths and ignoring other values .
    schemaPaths.forEach(item => {

        if(  req.body[item] != undefined )
            newProduct[item] = req.body[item];
    });

    (
       async () => { 
           const product = await new Product(newProduct).save({select : {__v : -1 }});
           res.status(201).json(product);
    })()
    .catch(next);

  

});

// PUT on FQDN/products/ID .
router.put("/:id", (req , res , next) => {

    const productId = req.params.id ;
    
    //Tests weither the given ID in the URL can be a valid ObjectID or not , in case it cannot be a valid ObjectID an error with status 400 is returned and no need to query the DB .
    if(! ObjectId.isValid(productId) )
        throw ( Object.assign(new Error("Product ID is invalid .") , {status : 400}) );

     //Tests weither the req.body contains properties that respects the schema , in case there is at least one invalid property name an error of status 400 will be returned .
    if( ! require("../functions/isArrEquals")(reqBodyProperties , schemaPaths ) )
        throw ( Object.assign(new Error("Invalid input .") , {status : 400}) );

    (
        async () => {

            const updateProduct = {} ;

            //Dynamically populating the updateProduct with the new values that confirms with the Product schema .
            schemaPaths.forEach(item => {

                if( req.body[item] != undefined )
                   updateProduct[item] = req.body[item]
            });

            //Saving the updateProduct
        const updateOps = {
                useFindAndModify : false ,
                 runValidators : true ,
                  new :true
            };
         
            const updatedProduct = await Product.findByIdAndUpdate( productId , updateProduct , updateOps ).exec();

            if(updatedProduct == null)
               throw ( Object.assign(new Error("Product not found .") , {status : 404}) );


            res.status(201).json(updatedProduct);
        }
    )
    ().catch(next);

} );


// DELETE on FQDN/products/ID .
router.delete("/:id", (req , res , next) => {

    const productId = req.params.id ;
    
    //Tests weither the given ID in the URL can be a valid ObjectID or not , in case it cannot be a valid ObjectID an error with status 400 is returned and no need to query the DB .
    if(! ObjectId.isValid(productId) )
        throw ( Object.assign(new Error("Product ID is invalid .") , {status : 400}) );

    (
        async () => {

           const deletedProduct = await Product.findByIdAndRemove(productId).exec();

           if(deletedProduct == null)
            throw ( Object.assign(new Error("Product not found .") , {status : 404}) );

            res.status(201).json(deletedProduct);
        }
    )
    ().catch(next);

} );

module.exports = router;