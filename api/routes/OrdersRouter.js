

const router = require("express").Router();
const controller = require('../controllers/OrdersController');



// GET on FQDN/products OR FQDN/orders/
router.get("/",controller.getAll);

// POST on FQDN/products OR FQDN/orders/
 router.post("/" , controller.post);

// PUT on FQDN/orders/ID .
router.put("/:id" , controller.put );


// DELETE on FQDN/orders/ID .
router.delete("/:id" , controller.delete );

module.exports = router;