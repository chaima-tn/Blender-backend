

const router = require("express").Router();
const controller = require('../controllers/OrdersController');



// GET on FQDN/products OR FQDN/products/
router.get("/",controller.getAll);

// POST on FQDN/products OR FQDN/products/
 router.post("/" , controller.post);

// PUT on FQDN/products/ID .
router.put("/:id" , controller.put );


// DELETE on FQDN/products/ID .
router.delete("/:id" , controller.delete );

module.exports = router;