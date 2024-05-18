//user service 

class UserService {
    constructor(db) {
        this.client=db.sequelize;
        this.User=db.User;
    }

    async getOne(email) {
        return this.User.findOne({
            where: {email:email}
        })
    }

    async create(name,email,encryptedPassword,salt) {
        return this.User.create({
            name:name,
            email:email,
            encryptedPassword:encryptedPassword,
            salt:salt
        })
    }

    //this method had to add to delete test user after test. 
    // i prefered to use email to identify user.assume email is unique
    // i used query operations to delete test user. but keep it for future
    async deleteByEmail(email) {
        return this.User.destroy({
            where: {email:email}
        });
    }


        
}

module.exports = UserService
