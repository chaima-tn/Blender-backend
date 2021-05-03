const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const multer = require('multer');
const ObjectId = require('mongoose').Types.ObjectId;
const {unlink} = require('fs'); 
const maxImgSize = 5 * 1024 * 1024 /* 5 MBs maximum file size .*/ ;
// Forms an array of all the Product model schema paths excluding only those are prefixed with an '_' .
const schemaPaths = Object.getOwnPropertyNames(Product.prototype.schema.paths).filter(item => ! /^_/.test(item));

//Configuring multer .
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './uploads/imgs/products'); //Images will be saved here locally .
    }
    ,
  filename: function(req, file, cb) {
      req.id = req.params.id || new ObjectId();
      const extension = file.mimetype.slice(file.mimetype.indexOf('/') + 1) ; //Determines the extension of the file from the mimetype [Note this is for testing only , in production such action is a potential security threat since with a valid mimetype any file smaller than maxImgSize will be uploadid .].
    cb(null, `${req.id}.${extension}` );//Image name is the product 'ID.FILE_EXTENSION' .
  }
  });
  
  const fileFilter = (req, file, cb) => {
    // Accept a file
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(null, false);// Reject a file
    }
  };
  
  const upload = multer({
    storage: storage,
    limits: {
      fileSize: maxImgSize //Limits the maximum size of a file that can be uploaded to 'maxImgSize' .
    },
    fileFilter: fileFilter //Apply the 'fileFilter' filter to the upload multer .
  });



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
 router.post("/" , upload.single('img') ,(req , res , next) => {
     
    const reqBodyProperties = Object.getOwnPropertyNames(req.body).filter(item => ! /^_/.test(item)); //populate reqBodyProperties with req.body properties except those prefixed with '_' .

    //Tests weither the req.body contains properties that respects the schema , in case there is at least one invalid property name an error of status 400 will be returned .
      if( ! require("../functions/isArrEquals")(reqBodyProperties , schemaPaths ) )
         throw ( Object.assign(new Error("Invalid input .") , {status : 400}) );
    
    const newProduct = {
        _id : req.id || new ObjectId() 
    };        
    if(req.id != undefined)
        newProduct.imgPath = req.file.path ; 
   
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
router.put("/:id", upload.single('img') , (req , res , next) => {

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
            const deleteOps  = {
                useFindAndModify : false
            };
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

} );

module.exports = router;