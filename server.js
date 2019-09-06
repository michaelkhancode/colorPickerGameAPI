//imports
const express   = require("express");
const bodyParser = require('body-parser');         
const cors = require('cors');

//knex database query builder
const bcrypt = require('bcrypt');
const db = require('knex')({
    client:'pg',				
    connection: {
        host : '127.0.0.1',		
        user : 'postgres',		
        password : 'wordpass',	
        database : 'rgbgame'	
    }
});
//imports

//express server
const app       = express();
//express server



//middleware
app.use(cors())
//middleware

const saltRounds = 10;

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.get("/", (req,res) => {

    res.json( "Get Root Path" );
});

app.get("/profile", (req,res) => {
    const send = { path: "profile"};
    res.json( send );
});

app.get("/leaderboard", (req,res) => {
    const send = { path: "leaderboard"};
    res.json( send );
});

// xoxoxo

app.post("/signin", (req,res) => {
    let { email, password } = req.body;

    db.select('*').from('login').where('email', '=', email)
    .then((user) => {
        bcrypt.compare(password, user[0].password, function(err, correct) {
            if (correct) {
                db.select('*').from('users').where('email', '=', email)
                .then((user) => res.json(user[0]))
            } else {
                res.status(400).json('email or password not recognized')
            }
        });
    })
    .catch(er => res.status(400).json('email or password not recognized'))

});

app.post("/register", (req,res) => {
    let { name, email, password } = req.body;

    bcrypt.hash(password, saltRounds, function(err, hash) {
        db.insert({
            email,
            password:hash
        })
        .into("login")
        .returning('*')
        .then( newUser => {
            return db.insert({
                name,
                email,
                toptime: null
            })
            .into("users")
            .returning('*')
            .then( newUser => {
                res.json(newUser[0])
                return 
            })
        })
        .catch(er => res.status(400).json('already have that email on file'))
    });

});

app.listen(3000, () => {
    console.log("Server Living")
});

