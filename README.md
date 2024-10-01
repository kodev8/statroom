# Kalev Keil - EPITA International BSc Semester 4 Final Project

----------
##  StatRoom Project Overview
----------

This is a demo project that serves as a proof of concept for a platform designed to allow sports coaches, players, and enthusiasts to retrieve and analyze sport-specific data from videos using AI, for key detections and an assistant for analysis. In `report.md`, I go into more depth about the development process and decisions.

Here is the project structure:


    🗃️ StatRoomAI
    ├─ 📃 README.md  
    ├─ 🖥️ back/  
    │  ├─ 🐳 Dockerfile  
    │  ├─ 🔐 firebase-conf.ts  
    │  ├─ 🚀 boot/  
    │  │  ├─ init.ts  
    │  │  └─ setup.ts  
    │  ├─ 📂 constants/ (auth, mailer, status codes)  
    │  ├─ 📂 controllers/ (handles API logic for accounts, activities, etc.)  
    │  ├─ 🗄️ database/ (setup for Firebase, MongoDB, Neo4j, Redis)  
    │  ├─ 🛠️ middleware/ (authentication, rate-limiting, error handling)  
    │  ├─ 📦 models/ (data models for subscriptions, notifications, etc.)  
    │  ├─ 🚦 routes/ (API routes for accounts, teams, billing, etc.)  
    │  └─ 🛠️ utils/ (helper functions for auth and services)  
    ├─ ⚽ football_ai/  
    │  ├─ 🧠 aimodels/ (pretrained models for detection)
    │  │   └─ setup_models.py
    │  ├─ 🛠️ rag/ (retrieval-augmented generation scripts)  
    │  ├─ 🛡️ server/ (backend utilities and socket setup)
    │  └─ 📂 sports/ (soccer-specific analysis and configurations, provided by Roboflow)  
    ├─ 🌐 front/  
    │  ├─ 🐳 Dockerfile  
    │  ├─ 📂 public/ (media assets like videos, logos)  
    │  └─ 📂 src/  
    │     ├─ Main React components (App, Navbar, etc.)  
    │     ├─ Layouts (AccountLayout, DashboardLayout, etc.)  
    │     ├─ Forms (ContactUs, CreateProject, etc.)  
    │     ├─ UI components (shadcn and custom components like buttons etc.)  
    │     ├─ Pages (Auth, Dashboard, Projects, Profile)  
    │     └─ Route handlers (PrivateRoute, PublicRoute)  
    └─ 📂 shared/ (constants and shared types)  
    


## 🟢 Quick Start
----------

For each server/app, please look at the relevant env.example file. Once you create the respective env file for each, you can continue setting up the application.

**Backend**
This project depends on two servers.
The first handles basic application API functionality like authentication, project, and team info.
This is an express server which can be set up using the following steps starting from the main project directory:
*You must ensure that there is a running instance of MongoDB, redis and Neo4j* 


    cd back # change to the backend directory
    npm install # install dependencies
    npm run init_data # initialize data in mongodb
    npm run start # run the server

 
The second server handles AI-specific requests to use models to retrieve detections from videos and then uses another model to analyze the data retrieved. 
This is a FastAPI server that can be set up using the following steps starting from the main project directory:


    cd football_ai # change to the football_ai directory
    pip install -r requirements.txt # install dependencies
    py ./aimodels/setup_models.py # download py torch models provided by roboflow sports
    fastapi run ./server/backend.py --port 8000 # run the server

**Frontend**
The front end is a react application created with Vite. You can get started by following the steps below.


    cd front # change to the frontend directory
    npm install # install dependencies
    npm run start # run the web application


## 🧑‍💻Usage
----------

Once the project has been set up, you can start using the web application. Some of the main features include:

- Authentication and Authorization 
    - Role Management
    - Third-party authentication with Google or GitHub
    - Two Factor Authentication
    
- Account Preferences and Activity
    - Dark Mode
    - Update account data and user preferences
    - Notification preferences on account activity
    - Newsletter subscription
    - Contact admin
    
- Projects and Teams
    - A Project is where videos can be uploaded for analysis
    - A Team manages one or more projects
    - Manage team member roles
    - Project invitations other users to collaborate with you and other members on different projects via email or shared links
    - Project organization: Sort projects by status, favorites, tags, recent projects, or place projects in folders to find them easily
    - Search functionality: search for resources by name or by tags with `#`
    
- AI
    - Choose a service that uses AI models to retrieve detections.
    - Collaborative chat with an assistant to get insights into the data 



## 📝 Project References
----------

The video demo, project report, ai usage can be found [here](https://epitafr-my.sharepoint.com/:u:/g/personal/kalev-giovanni_keil_epita_fr/Ecr2JnkVuzFGl-7rMQcyrnkB2k24SGb2XlwSIHwawUROJw?e=SIUYJs).

The project references maintained throughout development can be found in the `references.md` file.

