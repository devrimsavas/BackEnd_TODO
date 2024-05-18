[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-24ddc0f5d75046c5622901739e7c5dd533143b0c8e959d652212380cedb1ea36.svg)](https://classroom.github.com/a/rS2-Rpoa)

![](http://143.42.108.232/pvt/Noroff-64.png)
# Noroff
## Back-end Development Year 1
### REST API - Course Assignment 1 <sup>V2</sup>

Startup code for Noroff back-end development 1 - REST API course.

Instruction for the course assignment is in the LMS (Moodle) system of Noroff.
[https://lms.noroff.no](https://lms.noroff.no)

![](http://143.42.108.232/pvt/important.png)

You will not be able to make any submission after the deadline of the course assignment. Make sure to make all your commit **BEFORE** the deadline

![](http://143.42.108.232/pvt/help_small.png)

If you are unsure of any instructions for the course assignment, contact out to your teacher on **Microsoft Teams**.

**REMEMBER** Your Moodle LMS submission must have your repository link **AND** your Github username in the text file.

---

# Application Installation and Usage Instructions
## Overview

This REST API application allows users to create and manage todo lists using a MySQL database. It utilizes JSON Web Tokens (JWT) for authentication and operates solely as a backend service with no front-end component.

## Prerequisites

- **Node.js**: The runtime environment for running the JavaScript server.
- **MySQL**: The database used to store all application data.
- Ensure you have installed all necessary Node.js packages as specified in the project's `package.json`.

## Initial Setup

### Environment Configuration

1. Generate a `TOKEN_SECRET` using Node.js:
    ```bash
    node
    ```
    Inside the Node.js CLI, execute:
    ```javascript
    require('crypto').randomBytes(64).toString('hex')
    ```
    Copy the output string and define it in your `.env` file as `TOKEN_SECRET`.

### Database Initialization

- Configure your MySQL credentials in the `.env` file and initialize the database schema:
    ```javascript
    db.sequelize.sync({ force: true });
    ```
    **Important:** After the initial setup, change `force: true` to `force: false` to avoid losing data on subsequent application launches.

## Running the Application

Execute the following command to start the server:
```bash
npm start
```
The API is now up and running and can interact with the defined endpoints.

## API Usage Instructions

### Categories

- **Create a Category**
  - **POST** `/category`
  - **Required**: `name`
- **Retrieve All Categories**
  - **GET** `/category`



# Environment Variables
An example environment file is provided as `env.example`. This file illustrates how you should configure your `.env` file. 

## Steps to Setup Environment Variables:

1. **Create Database**:
   - Run the following command in MySQL to create a new database:
     ```
     CREATE DATABASE myTodo;
     ```
   - Ensure you provide object rights from the MySQL Administration menu to allow your application to perform database operations.

2. **Install dotenv**:
   - Run the command `npm install dotenv` to install the dotenv package which manages your environment variables.
   - Add `require('dotenv').config();` at the top of your `app.js` file to load the environment variables.

3. **Set up TOKEN_SECRET**:
   - As mentioned in the previous section, you can generate a `TOKEN_SECRET` using Node.js by running:
     ```node
     node
     require('crypto').randomBytes(64).toString('hex')
     ```
   - Copy the generated string and set it as your `TOKEN_SECRET` in your `.env` file.

## Additional Information:
- It's essential to follow these setup instructions to ensure that your application functions correctly without any unauthorized access issues.


# Additional Libraries/Packages
This application utilizes various packages to ensure proper functionality. Make sure to install the following packages:

- **dotenv**: Manages environment variables. Install it using:
npm install dotenv
Ensure to place `require('dotenv').config();` at the top of your `app.js` file as described in previous sections.

- **jsend**: Used for standardizing server responses. Install it using: `npm install jsend`

- **JSON Web Token (JWT)**: Used for user authentication and session management. Install it using: `npm install jsonwebtoken`
- **MySQL and Sequelize**: These are used for database interactions. Make sure you install MySQL libraries for Node.js:
`npm install mysql mysql2`
`npm install sequelize`
Also, create a blank database named `myTodo` and configure your MySQL user's privileges accordingly.
- **Jest and Supertest**: These are used for running tests. Install them using:
`npm install jest supertest --save-dev`
you can find testsuite under root folder tests. for detailed info about test , refer to comments in test file. 

To run tests, use the following command:
`npm test`


# NodeJS Version Used
This application requires Node.js and it has been tested with Node.js version 20.10.0. It is recommended to use at least this version to ensure all features work as expected without any issues.
### Checking Your Node.js Version 
check your node version in terminal
`node -v` 




# SWAGGER Documentation link
Swagger provides a powerful tools for visualizing and interacting with the API's endpoint without adding and frontpage. So In this application, Swagger is used. When app is started , Swagger would create swagger_output.json file at the root level. You may delete this file and re-create again. 
For exploring the API documentation via Swagger, visit the following URL: 
[Swagger API Docs] (http://localhost:3000/doc)

**Very Important:** Almost all endpoints are JWT protected. So in order to test these routes, you need to enter the bearer token in the authorization input in this format:
`Bearer <your token>`
After you successfully log in using the login endpoint in the Swagger interface, you need to copy the token to test protected endpoints.






