//imports
const express   = require("express");
const bodyParser = require('body-parser');         
const cors = require('cors');

//knex database query builder
const bcrypt = require('bcrypt-nodejs');
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
var salt = bcrypt.genSaltSync(saltRounds);

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// app.get("/", (req,res) => {

//     res.json( "Get Root Path" );
// });

app.put("/profile", (req,res) => {
    // const send = { path: "put"};
    const { difficulty, score, email, name, toptime3, toptime6, toptime9 } = req.body;
    console.log(difficulty, score, email, name, toptime3, toptime6, toptime9)
    switch (difficulty) {
        case 3:
            db('users')
            .where('email', '=', email)
            .update({
                toptime3: score
            })
            .returning("*")
            .then(response => {
                res.json(response[0])
            })
            break;
        case 6:
            db('users')
            .where('email', '=', email)
            .update({
                toptime6: score
            })
            .returning("*")
            .then(response => {
                res.json(response[0])
            })
            break;
        case 9:
            db('users')
            .where('email', '=', email)
            .update({
                toptime9: score
            })
            .returning("*")
            .then(response => {
                res.json(response[0])
            })
            break;
        default:
            db('users')
            .where('email', '=', email)
            .returning("*")
            .then(response => {
                res.json(response[0])
            })
            break;
    }

    // console.log(difficulty, email, name, toptime3, toptime6, toptime9)
    // res.json( "hi" );
});

app.get("/leaderboard", (req,res) => {
    const send = { path: "leaderboard"};
    
    db('users').min( {toptime3:"toptime3", toptime6:"toptime6", toptime9:"toptime9"} )
    .then(response => {
        const {toptime3, toptime6, toptime9} = response[0];
        var topDogs = [];
        // db.select('*').from('users').where('toptime3', '=', 100)
        db.select('*').from('users').where( {toptime3} )
        .then(response => {
            topDogs.push( {name:response[0].name, toptime3} )
            db.select('*').from('users').where( {toptime6} )
            .then(response => {
                topDogs.push( {name:response[0].name, toptime6} )
                db.select('*').from('users').where( {toptime9} )
                .then(response => {
                    topDogs.push( {name:response[0].name, toptime9} )
                    res.json(topDogs)
                })
            })
        })
    })
});


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

    const hash = bcrypt.hashSync(password, salt);
        
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
                toptime3: null,
                toptime6: null,
                toptime9: null
            })
            .into("users")
            .returning('*')
            .then( newUser => {
                res.json(newUser[0])
                return 
            })
        })
        .catch(er => res.status(400).json('already have that email on file'))
    // });

});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server Living")
});

