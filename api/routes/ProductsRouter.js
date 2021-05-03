

const router = require("express").Router();
const upload = require('../middlewares/uploadImg');
const controller = require('../controllers/ProductsController');



// GET on FQDN/products OR FQDN/products/
router.get("/",controller.getAll);

// POST on FQDN/products OR FQDN/products/
 router.post("/" , upload.single('img') ,controller.post);

// PUT on FQDN/products/ID .
router.put("/:id", upload.single('img') , controller.put );


// DELETE on FQDN/products/ID .
router.delete("/:id", controller.delete );

module.exports = router;