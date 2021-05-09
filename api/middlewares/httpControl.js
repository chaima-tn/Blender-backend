
module.exports = (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://127.0.0.1:8080"); //Allowing cross origin access froma any origin.
    res.header("Access-Control-Allow-Credentials",true); //Expose response credentials (session cookie in our case) to front end apps . 
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "PUT, POST, DELETE, GET");
        return res.status(200).json({});
    }
    next();
};