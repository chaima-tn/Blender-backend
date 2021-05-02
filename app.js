
const express = require("express");
const app = express();
const morgan = require("morgan");
const mongoose = require("mongoose");

mongoose.Promise = global.Promise; //Setting the mongoose promises to JS global promises .

const user = process.env.DB_USER || {username : "blender" , password : "BzlbGQaWYeoG2jbC"}; //DB user .
const db = process.env.DB_NAME || "blender"; //DB name .

const uri = `mongodb+srv://${encodeURIComponent(user.username)}:${encodeURIComponent(user.password)}@blender.u1jxs.mongodb.net/${encodeURIComponent(db)}?retryWrites=true&w=majority`;

async function start() {

    //connecting to db .
    console.log(`Connecting to DB "${db}" ...`);
    const connection = await mongoose.connect(uri, {useNewUrlParser: true , useUnifiedTopology:true});
    console.log(`Connected to DB "${db}" as "${user.username}" at ${new Date().toDateString()}.`);   

    /* If the connection to db failed it will throw an error which will break the execution of this function and will be catched with start().catch()
        Then one single middleware will be added to the stack and will match any given path and response with a 503 response indicating the unavailability of the service .
    */

    /* If the connection is established successfully then these middlewares gonna be added to the stack and the middleware of 503 response will not */

    //Middlewares

    app.use(morgan("dev")); //Http request Logger .
    app.use(express.json()); //JSON parser .
    app.use('/uploads', express.static('uploads')); //uploads is a static folder .

    //CORS specification .
    app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
        return res.status(200).json({});
    }
    next();
    });


    //Routes .

    app.use("/products",require("./api/routes/products"));


    //Requested resource does not match any route .
    app.use((req, res, next) => {
        throw  ( Object.assign( new Error("Not found") , {status : 404 } ) );
    });
    

    //Error handler .
    app.use((error, req, res, next) => {
        console.error(error); //Log the error stack trace to stderr .
        //Send an error back to client with the corresponding http status code if specified otherwise code 500 will be chosen .
        res.status(error.status || 500).json({
        error: {
            message: error.message
        }
        });
    });

}

      


 //connecting to the DB .
 //If failed then the error stack trace will be logged in the stderr and the server will response to any request on any resource with a 503 http response .
start().catch(err => {

    console.error(err);  

    app.use((req , res , next) => {
    res.status(503).json({
        error: {
          message: "Service is temporarily unavailable ."
        }
      });
});

}); 






//exporting the app object .
module.exports = app;