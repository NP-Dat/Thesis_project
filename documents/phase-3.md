Here is the breakdown for Phase 3. This document is written as a clear, internal reference guide for your development process, focusing on the system architecture and how data flows between your chosen tech stack.

# Thesis Brain-Dump: Phase 3 (System Architecture & APIs)

**Tech Stack Overview:**
* **Frontend:** React (Desktop-only UI).
* **Main Backend:** Node.js with Express.
* **AI Microservice:** Python with FastAPI.
* **Databases (to be designed later):** MySQL for structured user/HR data, MongoDB for the CBI test bank and flexible document storage.

---

## 1. Frontend: React Application (Desktop Only)

The frontend is split into two distinct portals: one for the Factory Employees and one for the HR/Admin team. Since this is desktop-only, the UI will utilize wide-screen layouts, sidebars, and data-rich tables/charts without worrying about mobile hamburger menus or stacking.

### Part A: Employee Portal
This is where the worker logs in, views their simulated work profile, takes the CBI test, and gets their results.

**1. Login / Registration Page**
* **Look & Feel:** A simple, clean split-screen. Left side has a graphic representing industrial wellness; right side has the login/register forms.
* **Purpose:** Authenticate the user and trigger the creation of their "Simulated HR Profile" upon first registration.
* **Data Received (GET):** None.
* **Data Sent (POST):** Email, password, basic demographics (Age, Gender). 

**2. Employee Dashboard**
* **Look & Feel:** A dashboard with a left-hand navigation sidebar. The main view contains summary cards (e.g., "Your Simulated Workload", "Last Check-in Date") and a line chart showing their fatigue history over time.
* **Purpose:** The central hub for the employee to see their status and access the quiz.
* **Data Received (GET):** * User profile info.
    * Simulated HR Data (`Designation`, `Resource Allocation`).
    * Historical `Burn_Rate` scores for the chart.
* **Data Sent:** None.

**3. CBI Assessment Page (The Test)**
* **Look & Feel:** A distraction-free, wizard-like interface. One question per screen or a clean list with large, clickable radio buttons for the 1-to-5 scale (Always to Never). Progress bar at the top.
* **Purpose:** To collect the "Active Input" for the mental fatigue calculation.
* **Data Received (GET):** The 13 CBI questions fetched from the test bank.
* **Data Sent (POST):** An array of the selected answers/scores.

**4. Prediction Results & Support Page**
* **Look & Feel:** A results screen featuring a large Gauge Chart (like a speedometer) showing their AI-predicted `Burn_Rate`. Below the chart, a list of actionable cards (e.g., "Talk to a Counselor," "Take a 15-min breathing break").
* **Purpose:** To display the AI's verdict and provide immediate intervention if the score is critical.
* **Data Received (GET):** The calculated `Mental_Fatigue_Score`, the AI-predicted `Burn_Rate`, and an array of recommended intervention links.
* **Data Sent:** None.

### Part B: Admin/HR Portal
This is the command center for HR to monitor the overall health of the factory floor.

**1. Admin Dashboard**
* **Look & Feel:** A highly analytical layout. Large heatmaps, bar charts comparing different factory departments (e.g., Assembly Line vs. Maintenance), and a summary widget showing "Total High-Risk Employees."
* **Purpose:** To give managers a macro-level view of factory burnout trends.
* **Data Received (GET):** Aggregated, anonymized statistics (e.g., average burn rate per department, total tests taken this week).
* **Data Sent:** None.

**2. High-Risk Alerts Page**
* **Look & Feel:** A data table with filtering and sorting capabilities. 
* **Purpose:** To show specific profiles that have crossed the danger threshold (e.g., Burn Rate > 0.8). *Note for thesis defense: Emphasize that in a real scenario, this would be anonymized or require strict HR permissions to view.*
* **Data Received (GET):** List of users with high `Burn_Rate` scores, including their simulated HR variables (Shift, Workload) to provide context.
* **Data Sent:** None.

---

## 2. Backend: Express APIs & System Flow

The Node.js/Express backend acts as the traffic controller. It pulls questions from MongoDB, handles user data in MySQL, and talks to the Python FastAPI service to get the machine learning predictions.

### Authentication APIs (MySQL)
* **`POST /api/auth/register`**: Creates a new user in MySQL. **Crucial Step:** During this controller logic, Express will run a script to randomly generate the `Designation` and `Resource_Allocation` values to simulate their HR profile and save it to the database.
* **`POST /api/auth/login`**: Authenticates the user and returns a JWT (JSON Web Token) for session management.

### Employee Data APIs (MySQL)
* **`GET /api/employee/dashboard`**: Fetches the user's details, their simulated HR data, and their past test scores to populate the React frontend dashboard.

### Assessment APIs (MongoDB & MySQL integration)
* **`GET /api/quiz/questions`**: Queries MongoDB to fetch the list of CBI questions and their point values. Sends them to the React Assessment Page.
* **`POST /api/quiz/submit`**: The most important endpoint. 
    1. Receives the user's answers from React.
    2. Calculates the average score (0 to 100).
    3. Converts it into the `Mental_Fatigue_Score` (0.0 to 10.0).
    4. Queries MySQL to get the user's `Designation` and `Resource_Allocation`.
    5. **Triggers the AI Service** (see next section).
    6. Receives the AI prediction, saves the result to MySQL, and sends the final `Burn_Rate` back to the React Results Page.

### Admin APIs (MySQL)
* **`GET /api/admin/stats`**: Runs SQL aggregate queries (e.g., `GROUP BY department`) to get the average burn rates and serves this to the Admin Dashboard charts.
* **`GET /api/admin/alerts`**: Runs a SQL query `WHERE burn_rate > 0.8` to populate the High-Risk Alerts data table.

---

## 3. Backend: AI Service (Python / FastAPI)

We use a separate Python microservice because Python is the best ecosystem for Machine Learning. Express is terrible for running ML models, but great at handling web traffic.

* **Endpoint:** `POST /predict`
* **How it works:** * The Node.js backend sends a JSON payload to this FastAPI endpoint containing: `{"Designation": 2.0, "Resource_Allocation": 8.5, "Mental_Fatigue_Score": 7.5}`.
    * The Python app loads your pre-trained model (likely saved as a `.pkl` file from scikit-learn).
    * The model evaluates the three numbers and outputs the prediction (e.g., `0.82`).
    * FastAPI returns `{"predicted_burn_rate": 0.82}` back to the Node.js server.