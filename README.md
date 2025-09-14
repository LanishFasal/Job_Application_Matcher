# AI-Powered Resume-Job Matcher

A simple web application that uses the Google Gemini API to analyze and match job descriptions with candidate resumes. Users can add job postings, upload resumes, and get an AI-generated match score, along with a list of strengths and skill gaps.

![Project Screenshot](https://i.imgur.com/your-screenshot-url.png) <!-- Optional: Add a screenshot of your app later -->

---

## 🚀 Key Features

-   **Add & View Job Postings:** Easily create and list multiple job opportunities.
-   **Add & View Resumes:** Submit and manage candidate resumes.
-   **AI-Powered Matching:** Utilizes the Gemini API to get a detailed analysis of how well a resume fits a job description.
-   **Detailed Analysis:** The match results include a percentage score, key strengths, and identified gaps.
-   **Persistent Storage:** All data is saved in a local SQLite database.
-   **Simple Web Interface:** Clean and intuitive UI built with Flask, HTML, and Tailwind CSS.

---

## 🛠️ Technologies Used

-   **Backend:** Python, Flask
-   **Database:** SQLite
-   **AI Model:** Google Gemini API (`google-generativeai`)
-   **Frontend:** HTML, JavaScript, Tailwind CSS
-   **Environment Management:** `python-dotenv`

---

## ⚙️ Setup and Installation

Follow these steps to get the application running on your local machine.

### 1. Prerequisites

-   Python 3.8 or higher
-   Git

### 2. Clone the Repository

First, clone the project from GitHub to your local machine:
```bash
git clone https://github.com/your-username/your-repository-name.git
cd your-repository-name
