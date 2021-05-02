const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const ObjectId = require('mongoose').Types.ObjectId;

// Forms an array of all the Product model schema paths excluding only those are prefixed with an '_' .
const schemaPaths = Object.getOwnPropertyNames(Product.prototype.schema.paths).filter(item => ! /^_/.test(item)) ;


router.get("/",(req,res,next) => {

   ( 
       async  () => {
        const docs =  await Product.find({}).select("-__v").lean().exec() ;
        res.status(200).json(docs);

        }
    )
    ().catch(next);

});

 router.post("/" , (req , res , next) => {

    const newProduct = {
        _id : new ObjectId()
    };        
   
    schemaPaths.forEach(item => {

        if(  req.body[item] != undefined )
            newProduct[item] = req.body[item];
    });

    (
       async () => { 
           const product = await new Product(newProduct).save();
           res.status(201).json(product);
    })()
    .catch(next);

});

router.put("/:id", (req , res , next) => {

    const productId = req.params.id ;
    
    if(! ObjectId.isValid(productId) )
        throw ( Object.assign(new Error("Product ID is invalid .") , {status : 400}) );

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

module.exports = router;