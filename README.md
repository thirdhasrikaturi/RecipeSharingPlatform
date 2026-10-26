# RecipeSharingPlatform
# 🍲 Recipe Sharing Platform

A full-stack web application that allows users to discover, share, and manage recipes in one place. Recipe Sharing Platform provides a simple and user-friendly interface where users can explore recipes, view ingredients and cooking instructions, share their own creations, and review recipes.

## 📌 About the Project

The Recipe Sharing Platform is designed to bring food lovers together by making it easy to discover and share homemade recipes. Users can browse recipes shared by others, view recipe details, and contribute their own recipes. An administrator manages the overall recipe collection and helps maintain the platform.

## ✨ Features

- **User Authentication** – Register, log in, and log out.
- **Browse Recipes** – View recipes shared by different users.
- **Add Recipes** – Share recipes with names, categories, cooking time, images, descriptions, ingredients, and instructions.
- **Edit and Delete Recipes** – Users can manage their own recipes.
- **Admin Management** – Administrators can add, edit, and delete recipes across the platform.
- **Recipe Details** – View ingredients, preparation details, and cooking instructions.
- **Search and Explore** – Find recipes easily using the available recipe browsing features.
- **Ratings and Reviews** – Share feedback and rate recipes.
- **Recipe Statistics** – View recipe counts, including personal recipes and all recipes.
- **Access Control** – Role-based permissions help ensure that users manage only their own recipes, while administrators can manage all recipes.

## 🛠️ Technologies Used

### Frontend
- **React.js** – Building interactive user interfaces.
- **JavaScript** – Application logic and interactivity.
- **HTML5** – Web page structure.
- **CSS3** – Styling and responsive layouts.
- **Vite** – Frontend development server and build tool.

### Backend
- **Node.js** – JavaScript runtime for server-side development.
- **Express.js** – Building REST API endpoints.
- **JWT (JSON Web Tokens)** – Token-based authentication.
- **bcrypt / password hashing** – Include this if password hashing is implemented in the project.

### Database
- **MySQL** – Storing user accounts, recipes, and reviews.
- **MySQL2** – Node.js database connectivity, if used by the backend.

### Development Tools
- **Visual Studio Code** – Code editor.
- **Git** – Version control.
- **GitHub** – Source code hosting and project collaboration.
- **MySQL Workbench** – Database management.

## 👥 User Roles

### Regular User
- Register and log in to the platform.
- View recipes shared by all users.
- Add new recipes.
- Edit and delete their own recipes.
- View recipe details and submit reviews.

### Administrator
- View all recipes.
- Add new recipes.
- Edit and delete any recipe.
- Manage the overall recipe collection.

## 📂 Project Structure

```text
RecipeSharingPlatform/
├── backend/
│   ├── db.js
│   ├── server.js
│   ├── package.json
│   └── package-lock.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── .gitignore
├── package.json
└── package-lock.json
```

## ⚙️ Installation and Setup

### Prerequisites
Install the following before running the project:
- Node.js and npm
- MySQL Server
- Git (optional, for cloning and version control)

### 1. Clone the Repository

```bash
git clone https://github.com/thirdhasrikaturi/RecipeSharingPlatform.git
cd RecipeSharingPlatform
```

### 2. Install Dependencies

Install the root dependencies if the root `package.json` defines them:

```bash
npm install
```

Install frontend dependencies:

```bash
cd frontend
npm install
```

Install backend dependencies:

```bash
cd ../backend
npm install
```

### 3. Configure the Database

- Start your MySQL server.
- Create a database named `recipe_sharing`.
- Set up the required tables for users, recipes, and reviews.
- Configure the database connection using the environment variables expected by the backend.

### 4. Configure Environment Variables

Create a `.env` file in the backend directory and add the required configuration using the variable names expected by `backend/db.js` and `backend/server.js`.

For example, your configuration may include:

```env
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=recipe_sharing
JWT_SECRET=your_private_secret
```

**Important:** The variable names above are examples. Check your backend code and use the exact names it expects. Never upload real passwords or secret keys to GitHub.

### 5. Run the Backend

From the backend directory, use the start command defined in `backend/package.json`, for example:

```bash
npm start
```

If the project uses a different script, run the corresponding command from its `package.json`.

### 6. Run the Frontend

Open a separate terminal:

```bash
cd frontend
npm run dev
```

Open the local URL shown in the terminal, usually `http://localhost:5173`.

## 🔐 Security

- Authentication tokens are used to protect restricted operations.
- Recipe ownership and administrator permissions are enforced by the backend.
- Environment variables are used for sensitive configuration.
- `.env` files and dependency folders are excluded through `.gitignore`.

## 🎯 Project Objectives

- Build a practical full-stack web application.
- Demonstrate frontend and backend integration.
- Implement authentication and role-based authorization.
- Perform database operations using MySQL.
- Provide an easy-to-use recipe sharing experience.

## 🚀 Future Enhancements

- Advanced recipe search and filtering.
- Favorite recipes and personalized collections.
- Recipe categories and dietary filters.
- User profile management.
- Improved mobile responsiveness.
- Recipe image upload functionality.
- Deployment to a public hosting platform.

## 👩‍💻 Project Information

**Project Name:** Recipe Sharing Platform  
**Project Type:** Full-Stack Web Application  
**Frontend:** React.js and Vite  
**Backend:** Node.js and Express.js  
**Database:** MySQL  
**Version Control:** Git and GitHub

---

Made with ❤️ for food lovers!
