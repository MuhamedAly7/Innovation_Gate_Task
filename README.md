# How to prepare your local setup

## Prerequisites
- Docker
- Node.js

1. **Clone the Repository**:
   ```bash
   git clone git@github.com:MuhamedAly7/Innovation_Gate_Task.git
   cd Innovation_Gate_Task
   ```

2. **Set Up Environment Variables**:
    Copy the example environment file and modify it as needed:
    ```bash
    cp .env.example .env
    ```
3. Update the `.env` file 
    ```bash
    DB_CONNECTION=mysql
    DB_HOST=laravel_mysql
    DB_PORT=3306
    DB_DATABASE=laravel
    DB_USERNAME=root
    DB_PASSWORD=root
    ```
   
4. **Build and Start Docker Containers**:
   ```bash
   docker compose up -d --build
   ```
   
5. **Install Composer Dependencies**:
   ```bash
   docker compose exec app composer install
   ```
   
6. **Generate Application Key**:
   ```bash
   docker compose exec app php artisan key:generate
   ```
   
7. **Run Migrations**:
   ```bash
   docker compose exec app php artisan migrate
   ```
   
8. **Install Node.js Dependencies and Build Assets**:
   ```bash
   docker compose exec app php artisan jwt:secret
   ```
   
9. ** Add those line to .env file**
   ```bash
   JWT_SECRETJWT_TTL=60
    JWT_BLACKLIST_ENABLED=true
   ```

10. Test the application by opening the browser and navigating to:
    ```
    http://localhost:8080
    ```
    

# Task Management API Documentation

This document outlines the API endpoints for the Task Management System built with Laravel 12.35.1 and PHP 8.3.26. The API uses JWT (JSON Web Token) for authentication and follows a RESTful structure. All endpoints are prefixed with /api (e.g., `http://localhost:8080/api/`).

# Table of Contents

#### 1- General Information 

#### 2- Authentication Endpoints

- Register
- Login
- Logout
- Get All Users


#### 3- Task Management Endpoints

- Get User's Tasks
- Create Task
- Show Task
- Update Task
- Assign Task
- Toggle Task Completion
- Delete Task


#### 4- Error Responses

## General Information

Base URL: `http://localhost:8080/api`

Authentication: Most endpoints require a JWT token in the Authorization header as Bearer <token>. Obtain the token via the /login endpoint.
Content Type: All requests and responses use Content-Type: application/json.
Response Format: Responses use a consistent structure via the ApiResponse helper:


`{
"status": "success" | "error",
"message": "string",
"data": { ... } | [],
"errors": { ... } | [] // For validation errors
}`


Environment Variable: Replace {{BASE_URL}} in requests with `http://localhost:8080/api`.

## Authentication Endpoints
### Register
Register a new user and store their details.

- URL: `/register`
- Method: POST
- Authentication: None
- Request Body:
`{
"name": "string",
"email": "string",
"password": "string",
"password_confirmation": "string"
}`

- `name`: Required, max 255 characters, letters and spaces only.
- `email`: Required, valid email, unique in users table.
- `password`: Required, minimum 6 characters.
- `password_confirmation`: Must match password.


#### - Example Request:
`curl -X POST http://localhost:8080/api/register \
-H "Content-Type: application/json" \
-d '{
"name": "Mohamedali",
"email": "mohamedali@email.com",
"password": "123456789",
"password_confirmation": "123456789"
}'
`

- **Success Response** (201 Created):
`{
"status": "success",
"message": "User successfully registered",
"data": []
}`

- **Error Responses**:

- **422 Unprocessable Entity** (Validation Error):
`{
"status": "error",
"message": "Registering Error",
"errors": {
"email": ["Invalid email or password"],
"password": ["Password must be at least 6 characters"]
}
}`




## Login
Authenticate a user and return a JWT token.

- **URL**: /login
- **Method**: POST
- **Authentication**: None
- **Request Body**:
`{
"email": "string",
"password": "string"
}`

- `email`: Required, valid email.
- `password`: Required.


- **Example Request**:
`curl -X POST `http://localhost:8080/api/login` \
-H "Content-Type: application/json" \
-d '{
"email": "mohamedali@email.com",
"password": "123456789"
}'
`

- **Success Response** (200 OK):

`{
"status": "success",
"message": "User successfully logged in",
"data": {
"token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
"user": {
"id": 1,
"name": "Mohamedali",
"email": "mohamedali@email.com"
}
}
}`

- Error Responses:

- **401 Unauthorized** (Invalid Credentials):
`{
"status": "error",
"message": "Invalid Credentials",
"errors": [],
"code": 401
}`

- 422 Unprocessable Entity (Validation Error):
`{
"status": "error",
"message": "Login Error",
"errors": {
"email": ["The email field is required"]
}
}`

  
### Logout
Invalidate the user's current JWT token.

- **URL**: `/logout`
- **Method**: `POST`
- **Authentication**: Required (`Bearer <token>`)
- **Request Body**: None
- Example Request:
`curl -X POST http://localhost:8080/api/logout \
-H "Authorization: Bearer <token>"`

- **Success Response** (200 OK):
`{
"status": "success",
"message": "User successfully logged out",
"data": []
}`

- **Error Responses**:

- **401 Unauthorized** (Invalid/Expired Token):
`{
"status": "error",
"message": "Unauthorized",
"errors": [],
"code": 401
}`




### Get All Users
Retrieve a list of all users (for assignee selection).

- **URL**: `/users`
- **Method**: `GET`
- **Authentication**: Required (`Bearer <token>`)
- **Request Body**: None
- **Example Request**:
`curl -X GET http://localhost:8080/api/users \
-H "Authorization: Bearer <token>"`

- **Success Response** (200 OK):
`{
"status": "success",
"message": "Users retrieved successfully",
"data": {
"users": [
{
"name": "Mohamedali",
"email": "mohamedali@email.com"
},
{
"name": "Ganna",
"email": "ganna@email.com"
}
]
}
}
`
- **Error Responses**:

- **401 Unauthorized** (Invalid/Expired Token):
`{
"status": "error",
"message": "Unauthorized",
"errors": [],
"code": 401
}`

## Task Management Endpoints
All task endpoints require authentication via `Bearer <token>` in the Authorization header. Tasks are visible/editable only by assignees, except for reassignment and deletion, which are restricted to the task creator.

### Get User's Tasks
Retrieve tasks assigned to the authenticated user, optionally filtered by priority.

- **URL**: `/tasks`
- **Method**: `GET`
- **Authentication**: `Required`
- **Query Parameters**:

- priority (optional): Filter tasks by priority (`low, medium, high`).


- **Example Request**:
`curl -X GET http://localhost:8080/api/tasks?priority=high \
-H "Authorization: Bearer <token>"`

- **Success Response** (200 OK):
`{
"status": "success",
"message": "Tasks retrieved successfully",
"data": {
"tasks": [
{
"id": 1,
"title": "Test Task",
"description": "First test task",
"due_date": "2025-10-30",
"priority": "high",
"is_completed": false,
"creator_id": 1,
"assignee_id": 1,
"created_at": "2025-10-25T14:00:00.000000Z",
"updated_at": "2025-10-25T14:00:00.000000Z"
}
]
}
}
`
- **Error Responses**:

- **401 Unauthorized**:
`{
"status": "error",
"message": "Unauthorized",
"errors": [],
"code": 401
}`




### Create Task
Create a new task and assign it to a user.

- **URL**: `/tasks`
- **Method**: POST
- **Authentication**: `Required`
- **Request Body**:
`{
"title": "string",
"description": "string" | null,
"due_date": "string (YYYY-MM-DD)",
"assignee_email": "string",
"priority": "low" | "medium" | "high"
}`

- `title`: Required, max 255 characters.
- `description`: Optional.
- `due_date`: Required, valid date, not in the past.
- `assignee_email`: Required, must exist in `users` table.
- `priority`: Optional, defaults to `medium`.


- **Example Request**:
`curl -X POST http://localhost:8080/api/tasks \
-H "Content-Type: application/json" \
-H "Authorization: Bearer <token>" \
-d '{
"title": "test task4",
"description": "first test task4",
"due_date": "2025-10-30",
"assignee_email": "mohamedali@email.com",
"priority": "high"
}'`

- **Success Response** (201 Created):
`{
"status": "success",
"message": "Task created successfully",
"data": {
"task": {
"id": 4,
"title": "test task4",
"description": "first test task4",
"due_date": "2025-10-30",
"priority": "high",
"is_completed": false,
"creator_id": 1,
"assignee_id": 1,
"created_at": "2025-10-25T14:00:00.000000Z",
"updated_at": "2025-10-25T14:00:00.000000Z"
}
},
"code": 201
}`

- **Error Responses**:

- **403 Forbidden** (Invalid Assignee):
`{
"status": "error",
"message": "Assignee not found",
"errors": [],
"code": 404
}`

- **422 Unprocessable** Entity (Validation Error):
`{
"status": "error",
"message": "Task validation failed",
"errors": {
"due_date": ["Due date cannot be in the past"]
}
}`




### Show Task
Retrieve details of a specific task (visible to assignee only).

- **URL**: `/tasks/{id}`
- **Method**: `GET`
- **Authentication**: `Required`
- **URL Parameters**:

  - `id`: Task ID.


- **Example Request**:
`curl -X GET http://localhost:8080/api/tasks/2 \
-H "Authorization: Bearer <token>"`

- **Success Response** (200 OK):
`{
"status": "success",
"message": "Task retrieved successfully",
"data": {
"task": {
"id": 2,
"title": "Test Task",
"description": "Task description",
"due_date": "2025-10-30",
"priority": "medium",
"is_completed": false,
"creator_id": 1,
"assignee_id": 1,
"created_at": "2025-10-25T14:00:00.000000Z",
"updated_at": "2025-10-25T14:00:00.000000Z"
}
},
"code": 200
}`

- **Error Responses**:

- **403 Forbidden** (Not Assignee):
`{
"status": "error",
"message": "Task not found or unauthorized",
"errors": [],
"code": 403
}`




### Update Task
Update an existing task (assignee only).

- **URL**: `/tasks/{id}`
- **Method**: `PUT`
- **Authentication**: `Required`
- **URL Parameters**:

  - `id`: Task ID.


- **Request Body**:
`{
"title": "string",
"description": "string" | null,
"due_date": "string (YYYY-MM-DD)",
"priority": "low" | "medium" | "high"
}`

All fields are optional; only provided fields are updated.


- **Example Request**:
`curl -X PUT http://localhost:8080/api/tasks/4 \
-H "Content-Type: application/json" \
-H "Authorization: Bearer <token>" \
-d '{
"title": "updated task4",
"priority": "low"
}'`

- **Success Response** (200 OK):
`{
"status": "success",
"message": "Task updated successfully",
"data": {
"task": {
"id": 4,
"title": "updated task4",
"description": "first test task4",
"due_date": "2025-10-30",
"priority": "low",
"is_completed": false,
"creator_id": 1,
"assignee_id": 1,
"created_at": "2025-10-25T14:00:00.000000Z",
"updated_at": "2025-10-25T14:10:00.000000Z"
}
},
"code": 200
}`

- **Error Responses**:

- **403 Forbidden** (Not Assignee):
`{
"status": "error",
"message": "Task not found or unauthorized",
"errors": [],
"code": 403
}`

- **422 Unprocessable** Entity:
`{
"status": "error",
"message": "Task update validation failed",
"errors": {
"due_date": ["Due date cannot be in the past"]
}
}`




### Assign Task
Reassign a task to another user (creator only).

- **URL**: /tasks/{id}/assign
- **Method**: POST
- **Authentication**: Required
- **URL Parameters**:

  - id: Task ID.


- Request Body:
`{
"assignee_email": "string"
}`

- `assignee_email`: Required, must exist in users table.


- **Example Request**:
`curl -X POST http://localhost:8080/api/tasks/4/assign \
-H "Content-Type: application/json" \
-H "Authorization: Bearer <token>" \
-d '{
"assignee_email": "ganna@email.com"
}'`

- **Success Response** (200 OK):
`{
"status": "success",
"message": "Task assigned successfully",
"data": {
"task": {
"id": 4,
"title": "updated task4",
"description": "first test task4",
"due_date": "2025-10-30",
"priority": "low",
"is_completed": false,
"creator_id": 1,
"assignee_id": 2,
"created_at": "2025-10-25T14:00:00.000000Z",
"updated_at": "2025-10-25T14:15:00.000000Z"
}
},
"code": 200
}`

- **Error Responses**:

- **403 Forbidden** (Not Creator):
`{
"status": "error",
"message": "Task not found or unauthorized",
"errors": [],
"code": 403
}`

- **404 Not Found** (Invalid Assignee):
`{
"status": "error",
"message": "Assignee not found",
"errors": [],
"code": 404
}`




### Toggle Task Completion
Toggle the completion status of a task (assignee only).

- **URL**: `/tasks/{id}/complete`
- **Method**: `PATCH`
- **Authentication**: `Required`
- **URL Parameters**:

  - `id`: Task ID.


- **Request Body**: None
- **Example Request**:
`curl -X PATCH http://localhost:8080/api/tasks/4/complete \
-H "Authorization: Bearer <token>"`

- **Success Response** (200 OK):
`{
"status": "success",
"message": "Task completion toggled",
"data": {
"task": {
"id": 4,
"title": "updated task4",
"description": "first test task4",
"due_date": "2025-10-30",
"priority": "low",
"is_completed": true,
"creator_id": 1,
"assignee_id": 2,
"created_at": "2025-10-25T14:00:00.000000Z",
"updated_at": "2025-10-25T14:20:00.000000Z"
}
},
"code": 200
}`

- **Error Responses**:

- **403 Forbidden** (Not Assignee):
`{
"status": "error",
"message": "Task not found or unauthorized",
"errors": [],
"code": 403
}`




- **Delete Task**
Delete a task (creator or assignee only).

- **URL**: `/tasks/{id}`
- **Method**: `DELETE`
- **Authentication**: `Required`
- **URL Parameters**:

  - `id`: Task ID.


- **Example Request**:
`curl -X DELETE http://localhost:8080/api/tasks/3 \
-H "Authorization: Bearer <token>"`

- Success Response (200 OK):
`{
"status": "success",
"message": "Task deleted",
"data": [],
"code": 200
}`

- **Error Responses**:

- **403 Forbidden** (Not Creator or Assignee):
`{
"status": "error",
"message": "Task not found or unauthorized",
"errors": [],
"code": 403
}`




- **Error Responses**
Common error responses across all endpoints:

- **401 Unauthorized** (Invalid/Expired Token):
`{
"status": "error",
"message": "Unauthorized",
"errors": [],
"code": 401
}`

- **422 Unprocessable** Entity (Validation Errors):
`{
"status": "error",
"message": "<Validation Error Message>",
"errors": {
"<field>": ["<error message>"]
}
}`

- **500 Internal Server Error** (Unexpected Errors):
`{
"status": "error",
"message": "Internal Server Error",
"errors": []
}`



## Notes

- **Postman Collection**: The provided collection (`innovation_gate`) includes all endpoints with example requests. Ensure `{{BASE_URL}}` is set to `http://localhost:8080/api` in your Postman environment. The login request includes a script to store the JWT token in the `{{token}}` variable for authenticated requests.
- Security:

  - JWT tokens are validated by `JwtMiddleware`.
  - Task visibility is restricted to assignees for view/update/complete actions.
  - Task reassignment and deletion are restricted to creators (except deletion, which also allows assignees).
