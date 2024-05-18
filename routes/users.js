var express = require('express');
var router = express.Router();
var jsend = require('jsend');
var db=require('../models');
var crypto=require('crypto');
var UserService=require('../services/UserService');
var userService=new UserService(db);
var bodyParser = require('body-parser');
var jsonParser=bodyParser.json();
router.use(jsend.middleware);

//add jwt middleware 
var jwt=require('jsonwebtoken');

// Post for registered users to be able to login

router.post('/login', jsonParser, async (req, res) => {

    //#swagger.tags=["User"]
    //#swagger.description="Login for registered users"    
    /*#swagger.parameters['body']={
        in:'body',
        description:'Login for registered users',
        required:true,
        schema: {$ref: '#/definitions/Login'}
    }
    */
    const { email, password } = req.body;
    if (!email || !password) {
        return res.jsend.fail({
            statusCode: 400,
            result: "Email and password are required."
        });
    }

    userService.getOne(email).then(data => {
        if (!data) {
            return res.jsend.fail({
                statusCode: 400,
                result: "Invalid email or password."
            });
        }

        crypto.pbkdf2(password, data.salt, 31000, 64, 'sha512', (err, hashedPassword) => {
            if (err) {
                console.error("Hashing error:", err);
                return res.jsend.error({
                    statusCode: 500,
                    result: "An error occurred during password verification."
                });
            }

            // Now comparing the Buffer directly, assuming encryptedPassword is also stored as a Buffer.
            if (!crypto.timingSafeEqual(data.encryptedPassword, hashedPassword)) {
                return res.jsend.fail({
                    statusCode: 400,
                    result: "Invalid email or password."
                });
            }

            // If password matches, proceed with token creation
            try {
                let token = jwt.sign(
                    { id: data.id, email: data.email, name: data.name },
                    process.env.TOKEN_SECRET,
                    { expiresIn: '1h' }
                );

                return res.jsend.success({
                    statusCode: 200,
                    result: "The user is logged in.",
                    token: token
                });
            } catch (error) {
                console.error("Token creation error:", error);
                return res.jsend.error({
                    statusCode: 500,
                    result: "Something went wrong with token creation."
                });
            }
        });
    }).catch(error => {
        console.error("Login process error:", error);
        return res.jsend.error({
            statusCode: 500,
            message: "Internal server error during login process."
        });
    });
});


// Post for new users to register / signup

router.post('/signup', async (req, res) => {

    //#swagger.tags=["User"]
    //#swagger.description="Signup for new users"
    /*#swagger.parameters['body']={
        in:'body',
        description:'Signup for new users',
        required:true,
        schema: {$ref: '#/definitions/UserSignup'}
        
    }
    */
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.jsend.fail({
            statusCode: 400,
            message: "Name, email, and password are required."
        });
    }

    try {
        const existingUser = await userService.getOne(email);
        if (existingUser) {
            return res.jsend.fail({
                statusCode: 400,
                result: "User already exists."
            });
        }

        const salt = crypto.randomBytes(16);
        crypto.pbkdf2(password, salt, 31000, 64, 'sha512', async (err, hashedPassword) => {
            if (err) {
                console.error("Hashing error:", err);
                return res.jsend.error({
                    statusCode: 500,
                    message: "An error occurred during account creation."
                });
            }

            try {
                await userService.create(name, email, hashedPassword, salt);
                res.jsend.success({
                    statusCode: 200,
                    result: "User created successfully."
                });
            } catch (error) {
                console.error("Signup error:", error);
                res.jsend.error({
                    statusCode: 500,
                    message: "Internal server error."
                });
            }
        });
    } catch (error) {
        console.error("Database error:", error);
        res.jsend.error({
            statusCode: 500,
            message: "Internal server error."
        });
    }
});


router.get('/fail', (req, res) => {
    //#swagger.tags=["User"]
    //#swagger.description="Get fail for testing purpose"
	return res.status(401).jsend.error({ statusCode: 401, message: 'message', data: 'data' });
});

module.exports = router;

