
const Store = require("../models/Store");
const ObjectId = require('mongoose').Types.ObjectId;
const {unlink} = require('fs'); 
// Forms an array of all the Store model schema paths excluding only those are prefixed with an '_' .
const schemaPaths = Object.getOwnPropertyNames(Store.prototype.schema.paths).filter(item => ! /^_/.test(item));

module.exports.getAll = (req,res,next) => {

    ( 
        async  () => {
         
         const stores =  await Store.find().select("-__v").populate('products',"-__v").lean().exec() ;
         res.status(200).json(stores);
         
         }
     )
     ().catch(next);
        }; 

module.exports.post = (req , res , next) => {
     
    const reqBodyProperties = Object.getOwnPropertyNames(req.body).filter(item => ! /^_/.test(item)); //populate reqBodyProperties with req.body properties except those prefixed with '_' .

    //Tests weither the req.body contains properties that respects the schema , in case there is at least one invalid property name an error of status 400 will be returned .
      if( ! require("../functions/isArrEquals")(reqBodyProperties , schemaPaths ) )
         throw ( Object.assign(new Error("Invalid input .") , {status : 400}) );
    
    const newStore = {
        _id : req.id || new ObjectId() 
    };      

    if(req.file != undefined)
     newStore.imgPath = req.file.path ; 
   
    //Populating the newProduct with values from the request body that matches the schema paths and ignoring other values .
    schemaPaths.forEach(item => {

        if(  req.body[item] != undefined )
          newStore[item] = req.body[item];
    });

    (
       async () => { 
           const store = await new Store(newStore).save({select : {__v : -1 }});
           res.status(201).json(store);
    })()
    .catch(next);

};


module.exports.put = (req , res , next) => {

    const storeId = req.params.id ;
    
    //Tests weither the given ID in the URL can be a valid ObjectID or not , in case it cannot be a valid ObjectID an error with status 400 is returned and no need to query the DB .
    if(! ObjectId.isValid(storeId) )
        throw ( Object.assign(new Error("Store ID is invalid .") , {status : 400}) );

     //Tests weither the req.body contains properties that respects the schema , in case there is at least one invalid property name an error of status 400 will be returned .
     const reqBodyProperties = Object.getOwnPropertyNames(req.body).filter(item => ! /^_/.test(item)); //populate reqBodyProperties with req.body properties except those prefixed with '_' .
     if( ! require("../functions/isArrEquals")(reqBodyProperties , schemaPaths ) )
        throw ( Object.assign(new Error("Invalid input .") , {status : 400}) );

    (
        async () => {

            const updateStore = {} ;

            if(req.file != undefined)
              updateStore.imgPath = req.file.path ;
                 
            //Dynamically populating the updateProduct with the new values that confirms with the Store schema .
            schemaPaths.forEach(item => {

                if( req.body[item] != undefined && item !== 'imgPath' )
                  updateStore[item] = req.body[item]
            });

            
            //Saving the updateProduct
        const updateOps = {
                useFindAndModify : false ,
                 runValidators : true ,
                  new :true
            };
         
            const updatedStore = await Store.findByIdAndUpdate( storeId , updateStore , updateOps ).exec();

            if(updatedStore == null)
               throw ( Object.assign(new Error("Store not found .") , {status : 404}) );


            res.status(201).json(updatedStore);
        }
    )
    ().catch(next);

};

module.exports.delete = (req , res , next) => {

    const storeId = req.params.id ;
    
    //Tests weither the given ID in the URL can be a valid ObjectID or not , in case it cannot be a valid ObjectID an error with status 400 is returned and no need to query the DB .
    if(! ObjectId.isValid(storeId) )
        throw ( Object.assign(new Error("Store ID is invalid .") , {status : 400}) );

    (
        async () => {
            const deleteOps  = {
                useFindAndModify : false
            };
           const deletedStore = await Store.findByIdAndRemove( storeId , deleteOps ).exec();

           if(deletedStore == null)
                throw ( Object.assign(new Error("Store not found .") , {status : 404}) );

            //If product have an image then it will be delted .
            if(deletedStore.imgPath != undefined)
                unlink( deletedStore.imgPath , (err) => {
                if (err)
                 throw ( err ); //Debuggin only , in production such error does not need to propagate to API users , it needs to be logged locally since it is won't affect the API users . 
                });

            res.status(201).json(deletedStore);
        }
    )
    ().catch(next);

};