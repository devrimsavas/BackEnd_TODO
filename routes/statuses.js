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

var StatusService = require('../services/StatusService');
var statusService = new StatusService(db);

var bodyParser = require('body-parser');
var jsonParser=bodyParser.json();
const isAuth = require('../middleware/middleware');

//add jwt middleware 
var jwt=require('jsonwebtoken');

router.use(jsend.middleware);


//add a new status 
router.post('/',isAuth,async (req,res)=> {
    //#swagger.tags=["Status"]
    //#swagger.description="Add  new status to do database"

    const {statusName}=req.body;

    if (!req.user || !req.user.id) {
        return res.jsend.fail({
            status: 400,
            message: "Unauthorized user or user not found"
        });
    }

    if (!statusName) {
        return res.jsend.fail({
            status:400,
            message:"Status name is required"

        });
    }

    try {
        const status=await statusService.create(statusName);
        res.jsend.success({
            statusCode: 201,
            message: "Status created successfully",
            data: status
        });
    } catch (error) {
        if (error.name === "SequelizeUniqueConstraintError") {
            res.jsend.fail({
                statusCode:400,
                message:"This status already exis"
            });
        } else {
            console.error("Error creating status:", error);
            res.jsend.error({
                statusCode: 500,
                message: "Failed to create new status.",
                error: error.message
            });
        }
    }

})


//delete a status
router.delete('/:id', isAuth, async (req, res) => {
    //#swagger.tags=["Status"]
    //#swagger.description="Delete a status by its ID"
    const { id } = req.params;

    if (!req.user || !req.user.id) {
        return res.jsend.fail({
            status: 400,
            message: "Unauthorized user or user not found."
        });
    }

    try {
        const deleted = await statusService.delete(id);
        if (deleted) {
            return res.jsend.success({
                statusCode: 200,
                message: "Status deleted successfully."
            });
        } else {
            return res.jsend.fail({
                statusCode: 404,
                message: "Status not found or could not be deleted."
            });
        }
    } catch (error) {
        console.error("Error deleting status:", error);
        res.jsend.error({
            statusCode: 500,
            message: "Failed to delete status.",
            error: error.message
        });
    }
});

//update status 

router.put('/:id', isAuth, async (req, res) => {
    //#swagger.tags=["Status"]
    //#swagger.description="Update the name of a status by its ID"
    const { id } = req.params;
    const { newName } = req.body;

    if (!req.user || !req.user.id) {
        return res.jsend.fail({
            status: 400,
            message: "Unauthorized user or user not found."
        });
    }

    // Validate input
    if (!newName) {
        return res.jsend.fail({
            statusCode: 400,
            message: "New name for the status is required."
        });
    }

    try {
        const updated = await statusService.update(id, newName);
        if (updated) {
            return res.jsend.success({
                statusCode: 200,
                message: "Status updated successfully."
            });
        } else {
            return res.jsend.fail({
                statusCode: 404,
                message: "Status not found or could not be updated."
            });
        }
    } catch (error) {
        console.error("Error updating status:", error);
        res.jsend.error({
            statusCode: 500,
            message: "Failed to update status.",
            error: error.message
        });
    }
});




module.exports=router;