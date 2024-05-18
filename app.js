
//add swagger 
const swaggerUi=require('swagger-ui-express');
const swaggerFile=require('./swagger_output.json');
const bodyParser=require('body-parser');



const db = require('./models');
const StatusService = require('./services/StatusService');
const statusService = new StatusService(db);

require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var usersRouter = require('./routes/users');
var todosRouter=require('./routes/todos');
var categoriesRouter=require('./routes/category');
var StatusesRouter=require('./routes/statuses');


//important after make it true make it false othercase, it will not create statuses and give error
db.sequelize.sync({ force: false });


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/users', usersRouter);
app.use('/todos', todosRouter);
app.use('/category', categoriesRouter);
app.use('/statuses', StatusesRouter);

//bind swagger 
app.use(bodyParser.json());
app.use('/doc',swaggerUi.serve,swaggerUi.setup(swaggerFile));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

// Function to initialize default statuses
async function initializeApp() {
    try {
        await db.sequelize.sync(); // Ensure your DB is synced
        
        // Check if statuses are already initialized
        const statusCount = await db.Status.count();
        if (statusCount === 0) {
            // No statuses found, initialize them
            console.log('Initializing default statuses...');
            await statusService.initializeStatuses();
            console.log('Statuses initialized.');
        } else {
            // Statuses are already initialized
            console.log('Default statuses are already initialized.');
        }
        
    } catch (error) {
        console.error('Failed to initialize the application:', error);
    }
}

// Call the initialization function
initializeApp();

module.exports = app;

