
const multer = require('multer');

const ObjectId = require('mongoose').Types.ObjectId;
const maxImgSize = 5 * 1024 * 1024 /* 5 MBs maximum file size .*/ ;


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

module.exports = multer({
    storage: storage,
    limits: {
    fileSize: maxImgSize //Limits the maximum size of a file that can be uploaded to 'maxImgSize' .
    },
    fileFilter: fileFilter //Apply the 'fileFilter' filter to the upload multer .
});
