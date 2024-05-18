
//jest test file 
// it was not necesssary to import all routes for this test but user can add additional tests if needed

const express=require('express');
const request=require('supertest');
const app=express();
require('dotenv').config();

const bodyParser=require('body-parser');
const jsonParser=bodyParser.json();
const jwt=require('jsonwebtoken');

//import routes for test 

const usersRouter = require('../routes/users');
const todosRouter=require('../routes/todos');
const categoriesRouter=require('../routes/category');
const StatusesRouter=require('../routes/statuses');
const db = require('../models');

//import services
const UserService = require('../services/UserService');

app.use(bodyParser.json());
app.use('/users', usersRouter);
app.use('/todos', todosRouter);
app.use('/category', categoriesRouter);
app.use('/statuses', StatusesRouter);

//start tests 

//create a new test user then we will delete it. 
const testUser= {
    name: `testuser${Math.floor(Math.random() * 100)}`,
    email:`testuser${Math.floor(Math.random() * 100)}@example.com`,
    password:"0000"
};

//token for test we will use for other tests too
let token;
// to delete created todos we will assign it to this variable
let newTodoId; 
//add user id we need to use it to delete after test

let userService;

//isDeleteTestUser if you set it false so it will not delete created user . I think developer may need to see testphases so he/she can decide to delete
// the created user for test. defult set is TRUE means it will delete created user. 
const isDeleteTestUser=true; 

describe('Todos Tests',()=> {
     

    beforeAll(async ()=> {
        //create a mock user in the database
        userService=new UserService(db);
        const res=await request(app)
        .post('/users/signup')
        .send(testUser)
        .expect(200);

        //it is a test line to see res.body in console     
        console.log("++++body userId created",res.body);
    })
    

    afterAll(async ()=> {
        //after test, i want to delete test user and related data from database with query operations. 
        //if you want to keep test user, set isDeleteTestUser to false
        if (isDeleteTestUser) {

        try {
            // Delete all categories linked to the user
            await db.sequelize.query(`DELETE FROM Categories WHERE UserId IN (SELECT id FROM Users WHERE email = ?)`, {
                replacements: [testUser.email],
                type: db.sequelize.QueryTypes.DELETE
            });
    
            // Now attempt to delete the user
            await db.sequelize.query(`DELETE FROM Users WHERE email = ?`, {
                replacements: [testUser.email],
                type: db.sequelize.QueryTypes.DELETE
            });
        } catch (error) {
            console.error('Error cleaning up test user and related data:', error);
        }
    }else {
        console.log('CLEANUP SKIPPED: You can set isDeleteTestUser to false to skip cleanup.');
    }

       
        //close database after we finish all tests
        await db.sequelize.close();
    });

    

    it('login in with valid account',async()=> {
        const response=await request(app)
        .post('/users/login') //use post route for login
        .send(testUser) //we set testUser 
    
        expect(response.statusCode).toBe(200);
        expect(response.body.data).toHaveProperty('token');
        //get the token 
        token=response.body.data.token;
        //for further test we need token 
        const decoded=jwt.verify(response.body.data.token,process.env.TOKEN_SECRET);
        expect(decoded).toHaveProperty('id');
        expect(decoded).toHaveProperty('email',testUser.email);
    });

    it('get all todos using token from previous test', async()=> {
        const response=await request(app)
        .get('/todos/all')
        .set('Authorization',`Bearer ${token}`);
        //test 
        console.log("response",response.body);

        expect(response.statusCode).toBe(200);
        expect(response.body.data).toHaveProperty('data');
        expect(Array.isArray(response.body.data.data)).toBe(true);

    });

    it('add a new todo with category using token from previous test', async () => {
        // Define a new todo item
        const newTodo = {
            //creating a new todo i used date function to create a new todo so it will be unique
            //after test it must be also deleted 
            name: `This is 7 todo item from JEST ${Date.now()}`,	
            description: `Jest created this new todo item at ${Date.now()}`,
            categoryName: `jest test category ${Date.now()}`,
        };
    
        // Make the POST request to add the new todo
        const response = await request(app)
            .post('/todos') // The route for adding a new todo
            .set('Authorization', `Bearer ${token}`) // Set the authorization header with the token
            .send(newTodo); // Send the newTodo object as the request body
    
        // Assertions to verify the response
        expect(response.statusCode).toBe(200); // Assuming 200 is the success status code
        expect(response.body.data).toHaveProperty('message')
        expect(response.body.data).toHaveProperty('data'); // Ensure there is a data property in the response

        //new todo id 
        newTodoId=response.body.data.data.id;
        console.log("newTodoId",newTodoId);      
    });

    it('delete the created todo item using token from previous test', async () => {
        // Ensure newTodoId is defined
        if (!newTodoId) {
            throw new Error('newTodoId is not defined');
        }

        const response = await request(app)
            .delete(`/todos/${newTodoId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.data).toHaveProperty('message', "Todo deleted successfully");
    });

    it('try to get todos without JWT token in the header', async () => {
        const response = await request(app)
            .get('/todos/all'); // Attempt to access the protected route without Authorization header

        // Assertions to verify the response
        expect(response.statusCode).toBe(200); // Status code is 200 because the error details are in the response body
        expect(response.body).toHaveProperty('status', 'fail');
        expect(response.body.data).toHaveProperty('statusCode', 401); // Checking the statusCode provided in the response body
        expect(response.body.data).toHaveProperty('message', "Unauthorized access. No token provided."); // Checking for the specific message set by your middleware

        
    });


    it('try to get todos with an invalid JWT token', async () => {
        const invalidToken = "Bearer invalid.token.here"; // Example of an invalid token format
    
        const response = await request(app)
            .get('/todos/all') // The route that requires authorization
            .set('Authorization', invalidToken); // Attempt to access with an invalid token
    
        // Assertions to verify the unauthorized response
        expect(response.statusCode).toBe(200); // Status code is 200 because the error details are in the response body
        expect(response.body).toHaveProperty('status', 'fail');
        expect(response.body.data).toHaveProperty('statusCode', 401); // Checking the statusCode provided in the response body
        expect(response.body.data).toHaveProperty('message', "Unauthorized access. Token is invalid."); // Checking for the specific message set by the middleware
    });


    





});