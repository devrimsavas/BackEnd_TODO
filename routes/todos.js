var express = require('express');
var router = express.Router();
var jsend=require('jsend');
var crypto=require('crypto');
var bodyParser=require('body-parser');
var jsonParser=bodyParser.json();

const db=require('../models');
const TodoService=require('../services/TodoService');
const todoService=new TodoService(db);
const CategoryService = require('../services/CategoryService');
const categoryService = new CategoryService(db);
const StatusService=require('../services/StatusService');
const statusService=new StatusService(db);


const isAuth = require('../middleware/middleware');

//use jsend middleware
router.use(jsend.middleware);

/* Return all the logged in users todo's with the category associated with each todo and
status that is not the deleted status */
router.get('/', isAuth, async (req, res) => {
    //#swagger.tags=["Todo"]
    //#swagger.description="Get all the logged in user's todos with the category associated with each todo and status that is not the deleted status"
    
    try {
        const UserId=req.user.id;
        const todos=await todoService.getAllNotDeleted(UserId);
        return res.jsend.success({
            statusCode: 200,
            data: todos,
            message: "Todos retrieved successfully."
        })
    } catch (error) {
        console.error("Error retrieving todos:", error);
        return res.jsend.error({
            statusCode: 500,
            message: "Failed to fetch todos."
        })
    }

	
	
});

// Return all the users todos including todos with a deleted status

router.get('/all', isAuth, async (req, res) => {
    //#swagger.tags=["Todo"]
    //#swagger.description="Get all the users todos including todos with a deleted status"

    // Check if the user ID is present after running the isAuth middleware
    if (!req.user || !req.user.id) {
        // If not, return an unauthorized error
        return res.jsend.fail({
            statusCode: 401,
            message: "Unauthorized access. No token provided or token is invalid."
        });
    }

    const UserId = req.user.id;
    
    try {
        // Fetch all todos for the user, without filtering out the "Deleted" status
        const todos = await todoService.getAll(UserId);
        
        return res.jsend.success({
            statusCode: 200,
            data: todos,
            message: "All todos retrieved successfully, including deleted ones."
        });
    } catch (error) {
        console.error("Error retrieving all todos:", error);
        return res.jsend.error({
            statusCode: 500,
            message: "Failed to fetch all todos.",
            data:error.message
        });
    }
});



// Return all the todos with the deleted status

router.get('/deleted', isAuth, async (req, res) => {
    //#swagger.tags=["Todo"]
    //#swagger.description="Get all the todos with the deleted status"
    const UserId = req.user.id; // Assuming isAuth middleware adds user details to req.user

    try {
        
        const deletedTodos = await todoService.getTodosByStatus(UserId, 'Deleted'); 

        // Check if there are any deleted todos
        if (deletedTodos.length === 0) {
            return res.jsend.success({
                statusCode: 200,
                message: "No todos with 'Deleted' status found."
            });
        }

        // If there are deleted todos, return them
        return res.jsend.success({
            statusCode: 200,
            data: deletedTodos,
            message: "Todos with 'Deleted' status retrieved successfully."
        });
    } catch (error) {
        console.error("Error retrieving todos with 'Deleted' status:", error);
        return res.jsend.error({
            statusCode: 500,
            message: "Failed to fetch todos with 'Deleted' status.",
            error: error.message // Including the error message can help with debugging
        });
    }
});



// Add a new todo with their category for the logged in user
router.post('/', isAuth, async (req, res) => {
    //#swagger.tags=["Todo"]
    //#swagger.description="Add a new todo with their category for the logged in user"
    /*#swagger.parameters['body']={
        in:"body",
        description:"Add a new todo with their category for the logged in user",
        required:true,
        schema:{$ref:"#/definitions/NewTodoWithCategory"}
    }
    */
    const { name, description, categoryName } = req.body;
    const UserId = req.user.id;
	

	

    // Validate input
    if (!name || !description || !categoryName) {
        return res.status(400).jsend.fail({
            message: "Name, description, and category name are required."
        });
    }

    try {
        // Attempt to create the category (or find if it exists)
        let category;
        try {
            category = await categoryService.create(categoryName, UserId);
			console.log(`it is test from todos.js post new todo with category : ${category} `);
        } catch (error) {
            if (error.message === "Category already exists for this user.") {
                // If the category already exists for the user, retrieve it instead
                category = await categoryService.getOneByNameAndUser(categoryName, UserId);
            } else {
                // If another error occurred, re-throw it
                throw error;
            }
        }
        //check this todo is alerady exists 
        const existingTodo=await todoService.checkForDuplicate(name,description,category.id,UserId)
        if (existingTodo) {
            return res.jsend.fail({
                status: 400,
                message:"A todo with the same name and description already exists in this category."
            })
        }

        // With the category ensured, create the Todo
        const StatusId = 1; // Assuming "1" is the ID for "Not Started"
        const todo = await todoService.create({
            name,
            description,
            CategoryId: category.id, // Use the ensured category's ID
            StatusId,
            UserId
        });

        res.jsend.success({
            message: "New todo with category created successfully.",
            data: todo
        });
    } catch (error) {
        console.error("Error creating todo with category:", error);
        res.status(500).jsend.error({
            message: "Failed to create new todo with category.",
            error: error.message
        });
    }
});


// Return all the statuses from the database
router.get('/statuses', isAuth , async (req, res) => {
    //#swagger.tags=["Status"]
    //#swagger.description="Get all the statuses from the database"
	try {
        //check first user exists 
        if (!req.user || !req.user.id) {
            //if not user exists 
            return res.jsend.fail({
                status:400,
                message:"Unauthorized user or user not found"
            });
        }
        const statuses=await statusService.getAll();
        res.jsend.success({
            statusCode:200,
            statuses:statuses
        })
    } catch (error) {
        console.error("Error retrieving all statuses:", error);
        res.jsend.error({
            statusCode: 500,
            message: "Failed to fetch all statuses.",
            error: error
        });
    }
});

// Change/update a specific todo for logged in user
router.put('/:id', isAuth, async (req, res) => {
    //#swagger.tags=["Todo"]
    //#swagger.description="Change/update a specific todo for logged in user"
    const { id } = req.params; // Todo ID
    const UserId = req.user.id; // Extracted from authentication middleware
    const { name, description, statusName } = req.body; // New values

    // Validate input 
    if (!name || !description || !statusName) {
        return res.status(400).jsend.fail({
            message: "Name, description, and status name are required."
        });
    }

    try {
        const updatedTodo = await todoService.updateTodo(id, UserId, { name, description, statusName });
        res.jsend.success({
            message: "Todo updated successfully.",
            data: updatedTodo,
        });
    } catch (error) {
        console.error("Error updating todo:", error.message);
        res.status(500).jsend.error({
            message: error.message || "Failed to update todo."
        });
    }
});


// Delete a specific todo if for the logged in user
router.delete('/:id', isAuth, async (req, res) => {
    //#swagger.tags=["Todo"]
    //#swagger.description="Delete a specific todo if for the logged in user"
    const todoId=req.params.id;
    const userId=req.user.id;

    try {
        const todo=await todoService.getOne(todoId,userId);
        if (!todo) {
            return res.jsend.fail({
                statusCode:404,
                message:"Todo not found or not belong to this user"
            });
        }
        const deleted=await todoService.delete(todoId);
        if (deleted) {
            return res.jsend.success({
                statusCode:200,
                message:"Todo deleted successfully"
            });
        }else {
            return res.jsend.error({
                statusCode:500,
                message:"Failed to delete todo"
            });
        };

    } catch(error) {
        console.error("Error deleting todo:", error);
        return res.jsend.error({
            statusCode:500,
            message:"Failed to delete todo",
            error:error.message
        });
    }
	
});

module.exports = router;

