

const router = require("express").Router();
const upload = require('../middlewares/uploadImg');
const controller = require('../controllers/StoresController');



// GET on FQDN/products OR FQDN/stores/
router.get("/",controller.getAll);

// POST on FQDN/products OR FQDN/stores/
 router.post("/" , upload.single('img') ,controller.post);

// PUT on FQDN/stores/ID .
router.put("/:id", upload.single('img') , controller.put );


// DELETE on FQDN/stores/ID .
router.delete("/:id", controller.delete );

module.exports = router;