
//todo service
const CategoryService = require('./CategoryService');
const StatusService = require('./StatusService');
const {Op} = require("sequelize");

class TodoService {
    constructor(db) {
        this.client = db.sequelize;
        this.Todo = db.Todo;
        this.Category = db.Category;
        this.Status = db.Status;
        this.categoryService = new CategoryService(db);
        this.statusService=new StatusService(db);
    }

    async getAll(userId) {
        return await  this.Todo.findAll({
            where: { UserId: userId },
            include:[this.Status,this.Category],
        });
    }

    async getOne(id,userId) {
        return await  this.Todo.findOne({
            where: { 
                id: id,
                 UserId: userId
                 },
        });
    }

    async create(todo) {
        return await this.Todo.create(todo);

    }

    // Create a todo with a category
    async createWithCategory(todoData) {
        const { name, description, categoryName, UserId } = todoData;
    
        // Ensure the category exists or create it if it does not
        let category;
        try {
            category = await this.categoryService.create(categoryName, UserId);
        } catch (error) {
            if (error.message !== "Category already exists for this user.") {
                throw error; // Re-throw error if it's not about existing category
            }
            // If the category already exists, fetch it
            category = await this.categoryService.getOneByNameAndUser(categoryName, UserId);
        }
    
        // Check if a todo with the same name, description, and category already exists for this user
        const existingTodo = await this.Todo.findOne({
            where: {
                name,
                description,
                CategoryId: category.id,
                UserId
            }
        });
    
        if (existingTodo) {
            // Todo already exists, return a message indicating the duplication
            throw new Error('A todo with the same name and description already exists in this category.');
        }
    
        // With the category ensured and duplication checked, create the Todo
        const StatusId = 1; // Assuming "1" is the ID for "Not Started"
        const todo = await this.Todo.create({
            name,
            description,
            CategoryId: category.id, // Use the ensured category's ID
            StatusId,
            UserId
        });
    
        return todo;
    }  



    //delete todo with id
    delete(id) {
        return this.Todo.destroy({where: {id: id}})
    }

    
    //new update function

    async updateTodo(todoId, userId, updateData) {
        //  updateData contains { name, description, statusName }
        const { name, description, statusName } = updateData;
    
        // Find the status ID based on the statusName
        const status = await this.Status.findOne({
            where: { status: statusName }
        });
        if (!status) {
            throw new Error(`Status '${statusName}' not found.`);
        }
    
        // Update the todo
        const [rowsUpdated] = await this.Todo.update(
            { name, description, StatusId: status.id },
            { where: { id: todoId, UserId: userId } }
        );
    
        if (rowsUpdated === 0) {
            throw new Error('Todo not found or you do not have permission to update this todo.');
        }
    
        return await this.Todo.findOne({
            where: { id: todoId, UserId: userId },
            include: [this.Status, this.Category],
        });
    }


    //check for duplicate
    async checkForDuplicate(name,description,CategoryId,UserId) {
        return await this.Todo.findOne({
            where: {
                name,
                description,
                CategoryId,
                UserId
            }
        })
    }

    //get all todos with status not deleted 
    async getAllNotDeleted(userId) {
        const deletedStatusId=4 //it is from table and instructions 4 for deleted 
        return await this.Todo.findAll({
            where: {
                UserId: userId,
                StatusId:{[Op.ne]:deletedStatusId} //Op.ne means not equal 
            },
            include:[this.Status,this.Category],
        });
    }

    // Get todos by status for a user
    async getTodosByStatus(userId, statusName) {
        // First, find the statusId based on the statusName
        const status = await this.Status.findOne({
            where: { status: statusName }
        });
    
        if (!status) {
            // If the status does not exist, throw an error or return an empty array
            
            throw new Error(`Status '${statusName}' not found.`);
            // or return [];
        }

        const todos = await this.Todo.findAll({
            where: {
                UserId: userId,
                StatusId: status.id // Use the found statusId
            },
            include: [this.Status, this.Category]
        });

        return todos;
    }

    

}

module.exports=TodoService;