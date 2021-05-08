
const multer = require('multer');
const User = require("../models/User");
const Store = require("../models/Store");
const Product = require("../models/Product");
const ObjectId = require('mongoose').Types.ObjectId;
const maxImgSize = 5 * 1024 * 1024 /* 5 MBs maximum file size .*/ ;


//Configuring multer .
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
    cb(null, './uploads/imgs'); //Images will be saved here locally .
    }
    ,
filename: function(req, file, cb) {


    if( req.params.id != undefined ) {
        //The id is provided as a parameter .
        // If the id cannot be a valid ObjectId then a bad request error is thrown to the error handler with 400 http status code and no further work has to be done .
        if(! ObjectId.isValid( req.params.id ) )
           return cb(Object.assign(new Error("Invalid ID .") , {status : 400}) , null );

        //If the id is a valid ObjectId , further tests must accure to see if the requested document to update does exist .
        let model = null ;
        //Since this works on various documents of differnet collections , determening their corresponding model is a necessity.
        // This block determines the adequate model to use by checking the requested endpoint .
        switch ( req.baseUrl ) {

            case '/users' : 
                model = User;
                break; 

            case '/stores' :
                model = Store;
                break;
            
            case '/products' :
                model = Product;
                break;

            default : return cb(Object.assign(new Error("BAD REQUEST .") , {status : 400}) ); //By default , if no explicit endpoint matches then it is a bad request , note that this won't work since the 404 middleware in app.js will catch this before but it is a best practice to always add extra layers of restrictions . 
        }
        
        //After finding the adequate model to use to query the DB , this block checks if there's a document with the correspondign id .
         (


            async () => {

                const res = await model.findById( req.params.id ).exec() ;
              
                if(res == null)
                      throw ( Object.assign(new Error(` Not found .`) , {status : 404}) );//If no document is found a not found response is sent back with 404 status code .
                //Otherwise the id is valid and corresponds to a document in the collection therefore adding the image will precede .
                req.id = req.params.id ; //req.id is populated with the id so that other middlewares through the response lifecycle can use .
                const extension = file.mimetype.slice(file.mimetype.indexOf('/') + 1) ; //Determines the extension of the file from the mimetype [Note this is for testing only , in production such action is a potential security threat since with a valid mimetype any file smaller than maxImgSize will be uploadid .].
                 cb(null, `${req.id}.${extension}` );//Image name is the product 'ID.FILE_EXTENSION' .
            }

        )().catch(cb) // If an error occures in the async funcion it will be cought by catch and passed to cb call back function as the first arg , since the object passed is not nullish then multerer will know that it's an error and will stop and throw it to the error handler.


    }else {

        req.id =  new ObjectId(); //Since no id is provided as a paramter and a file is submitted then a new ID is genereated and req.id is pouplated .
        const extension = file.mimetype.slice(file.mimetype.indexOf('/') + 1) ; //Determines the extension of the file from the mimetype [Note this is for testing only , in production such action is a potential security threat since with a valid mimetype any file smaller than maxImgSize will be uploadid .].
        cb(null, `${req.id}.${extension}` );//Image name is the product 'ID.FILE_EXTENSION' .
    }

    
    
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

module.exports = multer({
    storage: storage,
    limits: {
    fileSize: maxImgSize //Limits the maximum size of a file that can be uploaded to 'maxImgSize' .
    },
    fileFilter: fileFilter //Apply the 'fileFilter' filter to the upload multer .
});
