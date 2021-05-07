
const User = require("../models/User");
const Store = require('../models/Store');
const ObjectId = require('mongoose').Types.ObjectId;
const {unlink} = require('fs'); 
// Forms an array of all the User model schema paths excluding only private and protected paths .
const regex = /(^_)|(^imgPath$)|(^at$)|(^carts$)|(^store$)/; //Regex that matches private [prefixed with '_'] and protected [those that is not meant to be set by an input .] paths .
const schemaPaths = Object.getOwnPropertyNames(User.prototype.schema.paths).filter(item => ! regex.test(item));

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
         const users =  await User.find().select("-__v").populate('store carts',"-__v").lean().exec() ;
         res.status(200).json(users);
         
         }
     )
     ().catch(next);
        }; 

module.exports.post = (req , res , next) => {

    //Declaring newUser , this object will be saved to DB . 
    const newUser = {
        _id : req.id || new ObjectId() 
    };     
   
    (
        async () => { 

         
        //If an image is uploaded then its path must be included in the newUser POJO to be saved in the DB .
        /// Note this init must be done before any throw operation .
        if(req.file != undefined)
            newUser.imgPath = req.file.path.replace(/\\/g,"/"); 
                
        const reqBodyProperties = Object.getOwnPropertyNames(req.body);//populate reqBodyProperties with req.body property names .

        //Tests weither the req.body contains properties that respects the schema , in case there is at least one invalid property name an error of status 400 will be returned .
        // The message is obscure insuring security by obscurity concept .
        //This helps protect special paths that are not meant to be altered by an input and determined by the backend app logic .
        if( ! require("../functions/isArrEquals")(reqBodyProperties , schemaPaths ) )
            throw ( Object.assign(new Error("Invalid input .") , {status : 400}) );
     
     
         //Populating the newUser with values from the request body that matches the schema paths and ignoring other values .
         schemaPaths.forEach(item => {
             if(  req.body[item] != undefined )
                 newUser[item] = req.body[item];
         });
     
        const query = await User.find({ $or: [ { email : newUser.email } ,{ username : newUser.username }, {phone : newUser.phone }] });
        if ( query.length ){
            throw ( Object.assign(new Error("User info(s) are duplicated .") , {status : 400}) ); 
        }

        const user = await new User(newUser).save({select : {__v : -1 }});

        res.status(201).json(user); 
          
        
    })()
    .catch(err => {
          //If the none saved user have an image then it will be delted .
        if(newUser.imgPath != undefined) {
            unlink( newUser.imgPath , (error) => {
                if (error)
                err = error//Debuggin only , in userion such error does not need to propagate to API users , it needs to be logged locally since it  won't affect the API users . 
            });
        }

        next(err); //Throw the error to the ErrorHandler .

    })

};


module.exports.put = (req , res , next) => {

    const userId = req.params.id ;
    const updateUser = {} ;


    (
        async () => {
            
            
            //If an image is uploaded then its path must be included in the newUser POJO to be saved in the DB .
            if(req.file != undefined )
               updateUser.imgPath = req.file.path.replace(/\\/g,"/"); 
                 

            //Tests weither the given ID in the URL can be a valid ObjectID or not , in case it cannot be a valid ObjectID an error with status 400 is returned and no need to query the DB .
            if(! ObjectId.isValid(userId) )
             throw ( Object.assign(new Error("User ID is invalid .") , {status : 400}) );

            const reqBodyProperties = Object.getOwnPropertyNames(req.body);//populate reqBodyProperties with req.body property names .
            //Tests weither the req.body contains properties that respects the schema , in case there is at least one invalid property name an error of status 400 will be returned .
            if( ! require("../functions/isArrEquals")(reqBodyProperties , schemaPaths ) )
                throw ( Object.assign(new Error("Invalid input .") , {status : 400}) );

            //Dynamically populating the updateUser with the new values that confirms with the User schema .
            schemaPaths.forEach(item => {
                if( req.body[item] != undefined  && item !== 'username' && item !== 'role' ) //sotreId / Username and role cannot be altered .
                   updateUser[item] = req.body[item]
            });

            const query = await User.find({ $or: [ { email : updateUser.email } , {phone : updateUser.phone }] });
            if ( query.length ){
                throw ( Object.assign(new Error("User info(s) are duplicated .") , {status : 400}) ); 
            }

         
            const updatedUser = await User.findByIdAndUpdate( userId , updateUser , updateOps ).exec();

            if(updatedUser == null)
               throw ( Object.assign(new Error("User not found .") , {status : 404}) );


            res.status(201).json(updatedUser);
        }
    )
    ().catch(next);

};

module.exports.delete = (req , res , next) => {

    const userId = req.params.id ;

    (
        async () => {
            
            //Tests weither the given ID in the URL can be a valid ObjectID or not , in case it cannot be a valid ObjectID an error with status 400 is returned and no need to query the DB .
            if(! ObjectId.isValid(userId) )
               throw ( Object.assign(new Error("User ID is invalid .") , {status : 400}) );

            const deletedUser = await User.findByIdAndRemove( userId , deleteOps ).exec();

           if(deletedUser == null)
                throw ( Object.assign(new Error("User not found .") , {status : 404}) );
         
            //If user have an image then it will be delted only if all the operations above succedes .
            if(  deletedUser.imgPath != undefined ) {
             
                unlink( deletedUser.imgPath , (err) => {
                    if (err)
                    throw ( err ); //Debugging only , in userion such error does not need to propagate to API users , it needs to be logged locally since it is won't affect the API users . 
                });
            
            }

            res.status(201).json(deletedUser);
        }
    )().catch(next)
  

};