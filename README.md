# Simple Payroll App

A simple web-based payroll management system for managing employees, salaries, deductions, and payroll processing.
Modern payroll systems commonly connect employee records, attendance/leave, salary components, deductions, payroll runs, payslips and reporting into one workflow.

## 🚀 Live Application

**Frontend:**
https://simple-payroll-portal.onrender.com

**Backend API:**
https://simplepayrollapp.onrender.com

## 📌 Features

* Admin authentication and login
* User registration and login
* Password reset
* Role-based authorization
* Employee management
* Add, edit and delete employees
* Salary management
* Deduction management
* Payroll processing
* Payroll history
* Responsive dashboard
* MongoDB database integration
* REST API

## 🛠️ Technologies Used

### Frontend

* React
* Vite
* Axios
* CSS

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* bcryptjs
* dotenv
* CORS

## 📁 Project Structure

```text
SimplePayrollApp/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── app.js
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── App.jsx
│   └── package.json
│
├── .gitignore
└── README.md

## ⚙️ Running the Project Locally

### 1. Clone the repository

```bash
git clone https://github.com/yaseerzakariyah-rgb/SimplePayrollApp.git
```

### 2. Open the project

```bash
cd SimplePayrollApp
```

### 3. Install backend dependencies

```bash
cd backend
npm install
```

### 4. Configure environment variables

Create a `.env` file inside the `backend` folder.

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Do not commit your `.env` file to GitHub.

### 5. Start the backend

```bash
npm run dev
```

The backend will run on:

```text
http://localhost:5000
```

### 6. Install frontend dependencies

Open another terminal:

```bash
cd frontend
npm install
```

### 7. Start the frontend

```bash
npm run dev
```

The frontend will normally run on:

```text
http://localhost:5173
```

## 🔐 Authentication

The application uses JWT-based authentication.

Users have different roles:

* **Admin** — can manage employees, salaries, deductions and payroll.
* **Employee/User** — has limited permissions.

The administrator account should be created securely and the password should not be stored in this README.

## 🗄️ Database

The application uses MongoDB with Mongoose.

MongoDB stores:

* Users
* Employees
* Salaries
* Deductions
* Payroll records

## 🌐 Deployment

The application is successfully deployed using Render.

The frontend communicates with the deployed backend API, while the backend connects to MongoDB.

Environment variables such as database credentials and JWT secrets are configured through the hosting platform and are not stored in the GitHub repository.

## 👨‍💻 Author

Developed as part of the TS Academy Simple Payroll App Capstone-Project.

## 📄 License

This project is created for educational purposes.
