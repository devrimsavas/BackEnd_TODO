//category routes 

var express = require('express');
var router = express.Router();
var jsend = require('jsend');
var db=require('../models');
var crypto=require('crypto');
var UserService=require('../services/UserService');
var userService=new UserService(db);
const TodoService=require('../services/TodoService');
const todoService=new TodoService(db);
var CategoryService = require('../services/CategoryService');
var categoryService = new CategoryService(db);

var bodyParser = require('body-parser');
var jsonParser=bodyParser.json();
const isAuth = require('../middleware/middleware');

//add jwt middleware 
var jwt=require('jsonwebtoken');

router.use(jsend.middleware);

//post a new category POST 

router.post('/', isAuth, async (req, res, next) => {

    //#swagger.tags=["Category"]
    //#swagger.description="Creates a new category for the logged in user"
    

    try {
        const { name } = req.body;

        // Validate input
        if (!name) {
            return res.jsend.fail({
                statusCode: 400,
                message: "Name is required."
            });
        }

        const UserId = req.user.id;

        const category = await categoryService.create(name, UserId);

        return res.jsend.success({
            statusCode: 201,
            data: category,
            message: "Category created successfully."
        });

    } catch (error) {
        console.error("Error creating category:", error);

        // Customize the response based on the error type
        let errorMessage = "Internal server error.";
        let statusCode = 500;

        // Here, adjust to match the exact error message thrown by the service
        if (error.message === "Category already exists for this user.") {
            errorMessage = error.message;
            statusCode = 400;
        } else if (error.name === 'SequelizeUniqueConstraintError') {
            errorMessage = "Category name already exists."; 
            statusCode = 400;
        }

        res.jsend.error({
            statusCode: statusCode,
            message: errorMessage
        });
    }
});

//get all categories for logged in user
router.get('/',isAuth,async (req,res,nex)=> {

    //#swagger.tags=["Category"]
    //#swagger.description="Get all categories for logged in user"
    try {
        const UserId=req.user.id; //add later error handling
        const categories=await categoryService.getAll(UserId);
        res.jsend.success({
            statusCode:200,
            data:categories,
            message:"Categories retrieved successfully."
        });
    } catch (error) {
        console.error("Error retrieving categories:", error);
        res.jsend.error({
            statusCode: 500,
            message:"Failed to fetch categories."
        })
    }

})

//update a category with PUT 

router.put('/:id', isAuth, async (req, res) => {

    //#swagger.tags=["Category"]
    //#swagger.description="Update a category with PUT"
    const { name } = req.body;
    const { id } = req.params; // category id from URL
    const UserId = req.user.id; // Extracted from token in isAuth middleware

    // Validate input
    if (!name || !id || !UserId) {
        let missingFields = [];
        if (!name) missingFields.push("name");
        if (!id) missingFields.push("id");
        if (!UserId) missingFields.push("UserId");

        return res.jsend.fail({
            statusCode: 400,
            message: `Missing required field(s): ${missingFields.join(", ")}.`
        });
    }

    try {
        const updated = await categoryService.update(id, UserId, name);
        if (updated) {
            return res.jsend.success({
                statusCode: 200,
                message: "Category updated successfully.",
                data: { id, name } // Optionally return the updated category's id and new name
            });
        } else {
            return res.jsend.fail({
                statusCode: 404,
                message: "Category not found or does not belong to the user."
            });
        }
    } catch (error) {
        console.error("Error updating category:", error);
        res.jsend.error({
            statusCode: 500,
            message: "Failed to update category.",
            error: error.message // Providing the error message can help in debugging
        });
    }
});

//delete a category with DELETE if its id is not assigned to any todo

router.delete('/:id', isAuth, async (req, res) => {

    //#swagger.tags=["Category"]
    //#swagger.description="Delete a category with DELETE"
    const { id } = req.params;
    const UserId = req.user.id;

    try {
        const deleted = await categoryService.delete(id, UserId);
        if (deleted) {
            return res.jsend.success({
                statusCode: 200,
                message: "Category deleted successfully."
            });
        } else {
            return res.jsend.fail({
                statusCode: 404,
                message: "Category not found or does not belong to the user."
            });
        }
    } catch (error) {
        console.error("Error deleting category:", error);

        // Adjusting here to pass specific error messages directly
        let statusCode = 500;
        let errorMessage = "Failed to delete category.";
        
        // Custom error handling based on the error type or message
        if (error.message === 'Category cannot be deleted because it is in use by a todo.' || error.message === "Category not found or does not belong to the user.") {
            statusCode = 400; // Bad request status code
            errorMessage = error.message;
        }

        res.jsend.error({
            statusCode: statusCode,
            message: errorMessage
        });
    }
});






module.exports=router;