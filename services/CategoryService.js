

//category service 

class CategoryService {
    constructor(db) {
        this.client = db.sequelize;
        this.Category = db.Category;
        this.Todo=db.Todo;

    }


    // Try to create a new category if it doesn't already exist for the user
    async create(name, UserId) {
        // Check if the category already exists for the user
        const existingCategory = await this.Category.findOne({
            where: { name, UserId }
        });

        if (existingCategory) {
            // The category already exists, so we don't create a new one
            throw new Error("Category already exists for this user.");
        }

        // The category doesn't exist, so we create a new one
        const category = await this.Category.create({ name, UserId });
        return category;
    }

    // Method to find or create a category
    async findOrCreate(name, UserId) {
        const [category, created] = await this.Category.findOrCreate({
            where: { name, UserId },
            defaults: { name, UserId }
        });
        return category;
    }   

    
    async getAll(UserId) {
        try {
            const categories=await this.Category.findAll({
                where: {UserId},
            });
            return categories;

        }catch(error){
            throw error;
        }
    }

    async getOne (id,UserId) {
        try {
            const category=await this.Category.findOne({
                where: {id,UserId},
            });
            return category;
        } catch (error) {
            throw error;
        }

    }

    //update category  

    async update(id, UserId, name) {
        try {
            const [rowsUpdated] = await this.Category.update({ name }, {
                where: { id, UserId }
            });
            return rowsUpdated > 0; // Returns true if at least one row was updated, otherwise false
        } catch (error) {
            throw error;
        }
    }

    //delete category
    

    async delete(id, UserId) {
        // Check if the category is in use
        const inUse = await this.isCategoryInUse(id);
        if (inUse) {
            throw new Error('Category cannot be deleted because it is in use by a todo.');
        }
    
        // If not in use, proceed with deletion
        const deleted = await this.Category.destroy({
            where: { id, UserId }
        });
        return deleted > 0; // Returns true if at least one row was deleted, otherwise false
    }
    
    
    //method to get a category by name and UserId
    async getOneByNameAndUser(name,UserId) {
        return await this.Category.findOne({
            where: {name,UserId}
        });
    }

    //check if category in use 
    async isCategoryInUse(id) {
        const todo=await this.Todo.findOne({
            where: {CategoryId:id}
        })
        return !!todo; //return true is todo is found otherwise false 
    }
    
}

module.exports=CategoryService;