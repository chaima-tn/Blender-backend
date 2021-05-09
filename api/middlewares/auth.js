
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;

const User = require("../models/User");

passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());

passport.deserializeUser(User.deserializeUser());

passport.isAuth =  (req, res, next) =>  {
    console.log(req.user);
    if (req.isAuthenticated()) return next();
    
    next( Object.assign(new Error("Not logged in .") , {status : 401}));
}


passport.isNotAuth =  (req, res, next) =>  {
  if (! req.isAuthenticated()) return next();
  
  next( Object.assign(new Error("Already logged in .") , {status : 401}));
}

passport.isCustomerAuth =  (req, res, next) =>  {
  if ( req.isAuthenticated() )
  {
    if( req.user.role === 'customer' ) 
      return next();
    
    next( Object.assign(new Error("Forbidden .") , {status : 403}));

  }
else
  {
    next( Object.assign(new Error("Not logged in .") , {status : 401}));
  }

}

passport.isOwnerAuth =  (req, res, next) =>  {
  if ( req.isAuthenticated() )
    {
      if( req.user.role === 'owner' ) 
        return next();
      
      next( Object.assign(new Error("Forbidden .") , {status : 403}));

    }
  else
    {
      next( Object.assign(new Error("Not logged in .") , {status : 401}));
    }
  
  }

module.exports = passport;