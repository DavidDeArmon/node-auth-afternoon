require ('dotenv').config()
const express = require('express');
const session = require('express-session');
const passport = require('passport')
const Auth0Strategy = require('passport-auth0')
const students = require('./students.json')

const app = express();

app.use(session({
    secret:process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:false,
    cookie:{
        maxAge:10000
    }
    
}))

app.use(passport.initialize())
app.use(passport.session())
passport.use(new Auth0Strategy({
    domain:process.env.DOMAIN,
    clientID:process.env.CLIENT_ID,
    clientSecret:process.env.CLIENT_SECRET,
    callbackURL:'/login',
    scope:'openid email profile'
},
function(acessToken,refreshtoken,extraParams,profile,done){
    return done(null,profile)
}
))

passport.serializeUser((user,done)=>{
    return done(null,{clientID:user.id,email:user._json.email,name:user._json.name})
})
passport.deserializeUser((user,done)=>{
    return done(null,user)
})

app.get('/login',passport.authenticate('auth0' ,{    
    successRedirect:'/students',
    failureRedirect:'/login',
    connection:'github'
},console.log('hello')))

function authenticated(req,res,next){
    if(req.user){
        next()
    }else{
        res.sendStatus(401)
    }
}

app.get('/students',authenticated, (req,res,next)=>{
    return res.status(200).send(students)
})


const port = 3001;
app.listen( port, () => { console.log(`Server listening on port ${port}`); } );