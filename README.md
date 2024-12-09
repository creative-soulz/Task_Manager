
#Task Manager Application 


    This is a Task Manager Application built with Django as the backend, GraphQL using Graphene for the API layer, and React.js for the frontend. Tailwind CSS is used for styling, providing a clean, modern look with minimal custom CSS.
========================================================================================================================================
Table of Contents
*****************
    Features
    Technologies
    Setup Instructions
    Running the Application
    Project Structure
    License
    Features


========================================================================================================================================
Task Management: Create, update, and delete tasks with various attributes like priority, due date, and assigned user.

User Roles: Admin and Normal user roles with specific permissions for task management.

GraphQL API: Efficient querying of data with GraphQL, allowing for flexible and precise data requests.

Real-Time UI: React frontend dynamically updates based on the current state of tasks.

Responsive Design: Tailwind CSS ensures the app looks great on all devices.

Drag and Drop: Tasks can be organized and moved between columns to represent status changes.

========================================================================================================================================
Technologies
************
    Backend
    
        Django: Python web framework for creating the backend.
        Graphene-Django: GraphQL library for Django that integrates GraphQL with Django ORM.
        GraphQL-JWT: Handles authentication and authorization for secure API access.
        PostgreSQL: Database used for data storage.
    Frontend
        React.js: JavaScript library for building the user interface.
        Tailwind CSS: Utility-first CSS framework for styling.
        Redux Toolkit: State management for handling global state in the frontend.
========================================================================================================================================
Setup Instructions
******************
    Prerequisites
    Python 3.9+
    Node.js and npm
    PostgreSQL database
    Git for version control
========================================================================================================================================
Backend Setup
*************

1.Clone the Repository:
    git clone https://github.com/your-username/your-repo-name.git
    cd your-repo-name
2.Install Dependencies: Set up a virtual environment and install dependencies:
    python -m venv env
    source env/bin/activate  # or `env\Scripts\activate` on Windows
    pip install -r requirements.txt
3.Database Setup: Configure your PostgreSQL database and add your credentials to the .env file:
    SECRET_KEY="your-secret-key"
    DATABASE_NAME="your-db-name"
    DATABASE_USER="your-db-user"
    DATABASE_PASSWORD="your-db-password"
    DATABASE_HOST="localhost"
    DATABASE_PORT="5432"
4.Apply Migrations:
    python manage.py migrate
5.Run the Backend Server:
    python manage.py runserver

========================================================================================================================================

Frontend Setup
**************

1.Navigate to the Frontend Directory:
    cd frontend
2.Install Frontend Dependencies:
    npm install
3.Start the Frontend Development Server:
    npm start
4.The frontend will be served at http://localhost:3000, and the backend at http://localhost:8000.

========================================================================================================================================
Running the Application
***********************
To run the entire app in development mode:

1.Start the Backend:
    python manage.py runserver
2.Start the Frontend:
    npm start
3.You can access the app at http://localhost:3000.

========================================================================================================================================
Project Structure
*****************

your-repo-name/
├── backend/
│   ├── manage.py
│   ├── backend/
│   ├── task/               # Django app for task management
│   └── .env                # Environment variables for sensitive data
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── tailwind.config.js  # Tailwind CSS configuration
├── .gitignore
├── README.md
└── requirements.txt
========================================================================================================================================
    
