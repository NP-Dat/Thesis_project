
# Thesis Brain-Dump: Phase 1 & 2 Strategy

## 1. The Psychological Test (Phase 1)
**What we chose:** The Copenhagen Burnout Inventory (CBI).

**Why we chose it:** It is completely free to use (unlike the MBI, which is copyrighted), it is highly respected in academic research, and it splits burnout into specific areas so we can tell if the *job* is causing the stress or if it is just general life fatigue. 

**How it is formatted:** The full CBI has 19 questions, but since this is for industrial/factory workers, we will drop the "Client-related" questions and use the 13 questions focused on Personal and Work burnout.

Users will answer questions like:
* *How often do you feel tired?*
* *How often are you physically exhausted?*
* *Are you exhausted in the morning at the thought of another day at work?*
* *Does your work frustrate you?*

Users select one of five answers, which we convert directly into points in the backend:
* **Always** = 100 points
* **Often** = 75 points
* **Sometimes** = 50 points
* **Seldom** = 25 points
* **Never/Almost Never** = 0 points

**What we get from the test:** We take all their answers and calculate the **average score** (from 0 to 100). This single number represents their current psychological exhaustion.

---

## 2. The Machine Learning Dataset (Phase 2)
**What we chose:** The "Employee Burnout Prediction" dataset (originally from a HackerEarth machine learning challenge).
* **Link:** [kaggle.com/datasets/vijaysubhashp/employee-burnout-prediction](https://www.kaggle.com/datasets/vijaysubhashp/employee-burnout-prediction)

**Why we chose it:** We cannot legally get real medical and HR records from a factory. This dataset is already cleaned, validated, and perfectly structured to teach an AI how things like workload and seniority affect mental fatigue.

**Dataset Format:** It is a tabular CSV file with 22,750 rows. The columns we care about most are:
* `Designation`: Seniority level, scaled from 1.0 to 5.0.
* `Resource_Allocation`: How much work/hours they are assigned, scaled from 1.0 to 10.0.
* `Mental_Fatigue_Score`: How exhausted they are, scaled from 0.0 to 10.0.
* `Burn_Rate`: **This is the final target variable the AI predicts.** Scaled from 0.0 to 1.0 (where 1.0 means total breakdown).

---

## 3. How We Connect the Test to the Dataset
This is the core logic of how your web app will actually work.

The Kaggle dataset requires three main ingredients to predict the `Burn_Rate`: 
1. Designation 
2. Resource Allocation 
3. Mental Fatigue Score

Here is how we get those ingredients in your live web app:

* **Step A: The Simulated HR Profile (The Passive Data)**
    Since we don't have a real factory HR database, when a user creates an account on your website, your backend will auto-generate mock values for `Designation` (e.g., 2.0) and `Resource_Allocation` (e.g., 8.5). This proves you know how to handle system integrations.
* **Step B: The Quiz Conversion (The Active Data)**
    The user takes the CBI test on your frontend. Let's say their average score is **75** out of 100. 
    The Kaggle dataset's `Mental_Fatigue_Score` only goes up to 10.0. So, we map the columns by simply dividing the CBI score by 10. 
    *Mapping logic: CBI Score of 75 $\rightarrow$ `Mental_Fatigue_Score` of 7.5.*
* **Step C: The AI Prediction**
    Your Node.js backend grabs the simulated HR data (`Designation: 2.0`, `Resource: 8.5`) and the converted quiz score (`Fatigue: 7.5`). It sends these three numbers to your AI model (trained entirely on the Kaggle dataset). The AI crunches the numbers and returns a predicted `Burn_Rate` (e.g., 0.82), which triggers the web app to suggest mental health resources.