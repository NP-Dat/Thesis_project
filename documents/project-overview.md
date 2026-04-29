Here is a clear, simple, high-level overview of your entire project. Think of this as the "Executive Summary" or "ReadMe" that you can show to anyone so they instantly understand what you are building and how it works.

---

# Project Overview: Industrial Employee Burnout Detection System

## 1. The Big Picture
This project is a web-based application designed to help factories and industrial companies monitor the mental health of their workers. By combining standard HR data with a quick psychological quiz, the system uses Artificial Intelligence to predict if an employee is at risk of severe burnout before it happens.

## 2. How the "Magic" Works (The Core Logic)
The entire system revolves around calculating a final **Burn Rate** (a score from 0.0 to 1.0, where 1.0 means a total mental breakdown). To calculate this, the AI needs three specific ingredients:

* **Ingredient 1: Designation (Simulated HR Data).** The seniority level of the worker.
* **Ingredient 2: Resource Allocation (Simulated HR Data).** How heavy the worker's workload is.
    * *Note on Simulation:* Because we cannot legally use a real factory's HR database, our backend will automatically generate mock data for Ingredients 1 and 2 when a user registers.
* **Ingredient 3: Mental Fatigue Score (Active User Data).** The worker logs in and takes a short 13-question quiz called the Copenhagen Burnout Inventory (CBI). Their answers are converted into a fatigue score from 0 to 10.

**The Prediction:** The Node.js server takes these three ingredients, hands them to the Python AI service, and the AI returns the final predicted Burn Rate.

## 3. The Two User Experiences (Frontend)
The React frontend is built strictly for desktop screens and is split into two separate views:

* **The Employee Portal:** This is for the worker. They log in to view their current workload, take their periodic burnout quiz, and see a personalized dashboard. If their AI-predicted Burn Rate is too high, the system immediately shows them resources to get help.
* **The Admin/HR Portal:** This is the command center for management. It features a dashboard with heatmaps and charts showing the overall mental health of different factory departments. It also includes a "High-Risk Alerts" table to flag specific workers who need immediate intervention.

## 4. The Tech Stack (Under the Hood)
The system is built using a modern, multi-part architecture:

* **Frontend (The UI):** Built with **React**. This handles all the screens, dashboards, and quizzes the user interacts with.
* **Main Backend (The Traffic Cop):** Built with **Node.js & Express**. This manages user logins, generates the simulated HR data, calculates the quiz scores, and passes data back and forth.
* **AI Microservice (The Brain):** Built with **Python & FastAPI**. A small, dedicated server that holds the trained Machine Learning model. It takes the numbers from Express, predicts the Burn Rate, and sends the result back.
* **Databases (The Memory):** 
    * **MySQL:** Stores all structured data like user accounts, passwords, and their simulated HR records.
    * **MongoDB:** Stores the flexible data, specifically the CBI test bank questions and answers.

---

This document gives you a complete bird's-eye view of what we have planned out in Phases 1, 2, and 3. 

Since we have the full concept and architecture locked in, would you like to move on to designing the **Database Schemas (ERD)** for MySQL and MongoDB?