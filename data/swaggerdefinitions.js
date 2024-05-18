
//this file contains swagger definitions for swagger.js 

module.exports = {
    UserSignup: {
        $name: "John Doe",
        $email: "johndoe@yahoo.com",
        $password: "0000",
    },
    Login: {
        $email: "johndoe@yahoo.com",
        $password: "0000",
    },
    NewTodoWithCategory: {
        $name: "todo 1",
        $description: "description todo",
        $categoryName: "category 1"
    },
    UpdateATodo: {
        $name:"new name",
        $description:"new description",
        $categoryName:"new category name"
    },
    NewStatus: {
        $statusName:"status name",

    },
    UpdateAStatus: {
        $newName:"updated status name",
    },

    NewCategory: {
        $name:"category 1"
    },
    UpdateCategory: {
        $name:"updated category name"
    }




};