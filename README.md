# User Service

This User Service project is a microservice for managing users. It supports registration, login, password reset, and sending password reset emails using a Redis queue and Nodemailer.

## Technologies Used

- Node.js (Express)
- MySQL (MariaDB)
- Redis + BullMQ (Job queue for email sending)
- Nodemailer (Email sending)
- bcrypt (Password hashing)
- JSON Web Token (JWT) (Authentication)
- dotenv (Environment variable management)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/user-service.git
cd user-service

2. Install dependencies:

npm install

3. Create a .env file and configure environment variables:

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=medquad_db
JWT_SECRET=your_jwt_secret_key
PORT=3002

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password

REDIS_HOST=localhost
REDIS_PORT=6379
 
4. Start Redis server (if not running).

5. Run the worker process to handle email sending jobs:

cd user-service
node worker.js

6. Start the server:

npm start

### API Endpoints

POST /users/register: Register a new user

POST /users/login: User login

POST /users/forgot-password: Password reset request (sends reset email)

GET /users/me: Get current user info (requires token)

PATCH /users/update-password: Update user password (requires token)

Notes

Recommended Redis version: 6.2.0 or higher

Email sending via Gmail requires app password or enabling less secure app access
