# AI-Powered Job & Resume Matcher

<img width="1437" height="865" alt="Screenshot 2025-09-15 150714" src="https://github.com/user-attachments/assets/398b13f6-6afc-4b44-9415-a9f4e896d6e5" />

<img width="1286" height="880" alt="Screenshot 2025-09-15 150745" src="https://github.com/user-attachments/assets/86e71943-bf18-4183-ac26-18acb005d27b" />

An intelligent web application that uses Google's Gemini Pro AI to analyze, score, and find the perfect match between job descriptions and candidate resumes. This tool streamlines the initial screening process for recruiters by providing a data-driven match score, highlighting candidate strengths, and identifying skill gaps.

---

## ✨ Key Features

*   **📄 Dynamic Job & Resume Management:** Easily add and view job postings and candidate resumes through a clean and intuitive UI.
*   **🤖 AI-Powered Matching:** Utilizes the Google Gemini API to perform a deep semantic analysis of job requirements against a resume's content.
*   **📊 Detailed Match Analysis:** For every match, the AI provides:
    *   A **Match Score** (percentage) indicating the level of fit.
    *   A list of the candidate's key **Strengths** relevant to the job.
    *   A summary of potential **Gaps** or missing skills.
*   **🚀 Responsive Frontend:** Built with Flask, vanilla JavaScript, and Tailwind CSS for a seamless experience on any device.
*   **📦 Lightweight Backend:** A simple and efficient Flask server with a SQLite database for easy setup and deployment.

---

## 🛠️ Tech Stack

*   **Backend:** Python, Flask
*   **Frontend:** HTML, Tailwind CSS, Vanilla JavaScript
*   **Database:** SQLite
*   **AI Model:** Google Gemini Pro
*   **Libraries:** `google-generativeai`, `python-dotenv`

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   Python 3.8+
*   `pip` package manager
*   A Google Gemini API Key. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/your-repo-name.git
    cd your-repo-name
    ```

2.  **Create and activate a virtual environment (recommended):**
    ```bash
    # For macOS/Linux
    python3 -m venv venv
    source venv/bin/activate

    # For Windows
    python -m venv venv
    .\venv\Scripts\activate
    ```

3.  **Install the required dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Set up your environment variables:**
    *   Create a new file named `.env` in the root of your project.
    *   Add your Gemini API key to this file:
    ```
    GEMINI_API_KEY="YOUR_API_KEY_HERE"
    ```

5.  **Run the Flask application:**
    ```bash
    flask run
    ```
    The application will now be running at `http://127.0.0.1:5000`. Open this URL in your browser to start using the app!

---

## 🏗️ How It Works

The application follows a simple but powerful architecture:

1.  **Frontend (UI):** The user adds job postings and resumes through the web interface.
2.  **Flask Backend:** The data is sent to the Flask server, which saves it to the local **SQLite** database.
3.  **Matching Request:** When a user clicks "Match Resume", the frontend sends the selected `job_id` and `resume_id` to the `/match` endpoint.
4.  **AI Analysis:** The Flask server retrieves the job and resume text from the database and sends them to the **Google Gemini API** with a carefully crafted prompt.
5.  **JSON Response:** The Gemini model analyzes the text and returns a structured JSON object containing the `match_score`, `strengths`, and `gaps`.
6.  **Display Results:** The backend forwards this JSON to the frontend, where the results are dynamically displayed to the user.

---

## API Endpoints

The application exposes the following RESTful API endpoints:

| Method | Endpoint      | Description                               |
|--------|---------------|-------------------------------------------|
| `POST` | `/jobs`       | Adds a new job posting.                   |
| `GET`  | `/jobs`       | Retrieves a list of all job postings.     |
| `POST` | `/resumes`    | Adds a new resume.                        |
| `GET`  | `/resumes`    | Retrieves a list of all resumes.          |
| `POST` | `/match`      | Matches a job with a resume using the AI. |

---

## 📈 Future Improvements

*   [ ] **File Uploads:** Allow users to upload PDF or DOCX resumes instead of copy-pasting text.
*   [ ] **Batch Matching:** Implement functionality to match one resume against multiple jobs at once.
*   [ ] **Database Migration:** Upgrade from SQLite to a more robust database like PostgreSQL for production use.
*   [ ] **Enhanced UI:** Add pagination and search functionality for jobs and resumes.
*   [ ] **Authentication:** Add user accounts to keep job and resume lists private.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
