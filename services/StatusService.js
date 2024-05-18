
//Status Service 

class StatusService {
    constructor(db) {
        this.client = db.sequelize;
        this.Status=db.Status;
    }

    //initialize status
    async defaultStatutes() {
        
        const defaultStatuses=['Not Started','Started','Completed','Deleted'];
        for (const status of defaultStatuses) {
            const [statusEntry,created]=await this.Status.findOrCreate({
                where: {status:status},
                defaults: {status:status}
            });
            if (created) {
                console.log(`Created default status: ${status}`);	
            }
        }
    }

    async create(statusName) {

        const [status,created]=await this.Status.findOrCreate({
            where: {status:statusName},
            defaults: {status:statusName}
        });
        return status;
    }

    //retrieve a staus by Id 
    async getById(statusId) {
        return await this.Status.findByPk(statusId);
    }

    async getByName(statusName) {
        return await this.Status.findOne({
            where: {status:statusName}
        });
    }

    //update a status 
    async update (statusId,statusName) {
        const status=await this.Status.findByPk(statusId);
        if (status) {
            status.status=statusName;
            await status.save();
            return status;
        }
        return null;
    }

        // Delete a status
    async delete(statusId) {
        const status = await this.Status.findByPk(statusId);
        if (status) {
            await status.destroy();
            return true;
        }
        return false;
    }
    
        // Initialize default statuses
    async initializeStatuses() {
        const statuses = ['Not Started', 'Started', 'Completed', 'Deleted'];
        await Promise.all(statuses.map(async (statusName) => {
            await this.create(statusName);
        }));
    }

    async getAll() {
        return await this.Status.findAll();
    }
    
}

module.exports = StatusService;