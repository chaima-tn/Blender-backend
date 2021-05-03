
const Product = require("../models/Product");
const Store = require('../models/Store');
const ObjectId = require('mongoose').Types.ObjectId;
const {unlink} = require('fs'); 
// Forms an array of all the Product model schema paths excluding only those are prefixed with an '_' .
const schemaPaths = Object.getOwnPropertyNames(Product.prototype.schema.paths).filter(item => ! /^_/.test(item));

   
const updateOps = {
    useFindAndModify : false ,
    runValidators : true ,
    new :true
    };
         
const deleteOps  = {
    useFindAndModify : false
    };

module.exports.getAll = (req,res,next) => {

    ( 
        async  () => {
         
         const products =  await Product.find().select("-__v").populate('store',"-__v").lean().exec() ;
         res.status(200).json(products);
         
         }
     )
     ().catch(next);
        }; 

module.exports.post = (req , res , next) => {
     
    const reqBodyProperties = Object.getOwnPropertyNames(req.body).filter(item => ! /^_/.test(item)); //populate reqBodyProperties with req.body properties except those prefixed with '_' .

    //Tests weither the req.body contains properties that respects the schema , in case there is at least one invalid property name an error of status 400 will be returned .
      if( ! require("../functions/isArrEquals")(reqBodyProperties , schemaPaths ) )
         throw ( Object.assign(new Error("Invalid input .") , {status : 400}) );
    
    const newProduct = {
        _id : req.id || new ObjectId() 
    };      

    if(req.file != undefined)
        newProduct.imgPath = req.file.path ; 
   
    //Populating the newProduct with values from the request body that matches the schema paths and ignoring other values .
    schemaPaths.forEach(item => {

        if(  req.body[item] != undefined )
            newProduct[item] = req.body[item];
    });

 
    //Tests weither the given ID in the URL can be a valid ObjectID or not , in case it cannot be a valid ObjectID an error with status 400 is returned and no need to query the DB .
    if(! ObjectId.isValid(newProduct.store) )
        throw ( Object.assign(new Error("Store ID is invalid .") , {status : 400}) );

    (
       async () => { 
         const store = await Store.findById(newProduct.store).exec();
         if(store == null)
            throw ( Object.assign(new Error("Store not found .") , {status : 404}) );

           const product = await new Product(newProduct).save({select : {__v : -1 }});

            await Store.updateOne({_id : newProduct.store} , {$addToSet : {products : newProduct._id}} , updateOps).exec(); 

           res.status(201).json(product);
    })()
    .catch(next);

};


module.exports.put = (req , res , next) => {

    const productId = req.params.id ;
    
    //Tests weither the given ID in the URL can be a valid ObjectID or not , in case it cannot be a valid ObjectID an error with status 400 is returned and no need to query the DB .
    if(! ObjectId.isValid(productId) )
        throw ( Object.assign(new Error("Product ID is invalid .") , {status : 400}) );

     //Tests weither the req.body contains properties that respects the schema , in case there is at least one invalid property name an error of status 400 will be returned .
     const reqBodyProperties = Object.getOwnPropertyNames(req.body).filter(item => ! /^_/.test(item)); //populate reqBodyProperties with req.body properties except those prefixed with '_' .
     if( ! require("../functions/isArrEquals")(reqBodyProperties , schemaPaths ) )
        throw ( Object.assign(new Error("Invalid input .") , {status : 400}) );

    (
        async () => {

            const updateProduct = {} ;

            if(req.file != undefined)
               updateProduct.imgPath = req.file.path ;
                 
            //Dynamically populating the updateProduct with the new values that confirms with the Product schema .
            schemaPaths.forEach(item => {

                if( req.body[item] != undefined && item !== 'imgPath' )
                   updateProduct[item] = req.body[item]
            });

         
            const updatedProduct = await Product.findByIdAndUpdate( productId , updateProduct , updateOps ).exec();

            if(updatedProduct == null)
               throw ( Object.assign(new Error("Product not found .") , {status : 404}) );


            res.status(201).json(updatedProduct);
        }
    )
    ().catch(next);

};

module.exports.delete = (req , res , next) => {

    const productId = req.params.id ;
    
    //Tests weither the given ID in the URL can be a valid ObjectID or not , in case it cannot be a valid ObjectID an error with status 400 is returned and no need to query the DB .
    if(! ObjectId.isValid(productId) )
        throw ( Object.assign(new Error("Product ID is invalid .") , {status : 400}) );

    (
        async () => {
        
           const deletedProduct = await Product.findByIdAndRemove( productId , deleteOps ).exec();

           if(deletedProduct == null)
                throw ( Object.assign(new Error("Product not found .") , {status : 404}) );

            //If product have an image then it will be delted .
            if(deletedProduct.imgPath != undefined)
                unlink( deletedProduct.imgPath , (err) => {
                if (err)
                 throw ( err ); //Debuggin only , in production such error does not need to propagate to API users , it needs to be logged locally since it is won't affect the API users . 
                });

            res.status(201).json(deletedProduct);
        }
    )
    ().catch(next);

};