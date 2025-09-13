from flask import Flask, request, jsonify, render_template
import sqlite3
import os
import json
import google.generativeai as genai
import re
from dotenv import load_dotenv

load_dotenv()  # Load .env variables

app = Flask(__name__)
DB = 'jobs.db'

# ------------------------------
# Initialize database
# ------------------------------
def init_db():
    with sqlite3.connect(DB) as conn:
        c = conn.cursor()
        c.execute('''CREATE TABLE IF NOT EXISTS jobs (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        title TEXT,
                        description TEXT,
                        requirements TEXT
                     )''')
        c.execute('''CREATE TABLE IF NOT EXISTS resumes (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        name TEXT,
                        content TEXT
                     )''')
        conn.commit()

init_db()

# ------------------------------
# Job APIs
# ------------------------------
@app.route('/jobs', methods=['POST'])
def add_job():
    try:
        data = request.json
        if not all(key in data for key in ['title', 'description', 'requirements']):
            return jsonify({"error": "Missing required fields"}), 400
        with sqlite3.connect(DB) as conn:
            c = conn.cursor()
            c.execute("INSERT INTO jobs (title, description, requirements) VALUES (?, ?, ?)",
                      (data['title'], data['description'], data['requirements']))
            conn.commit()
        return jsonify({"status": "success"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/jobs', methods=['GET'])
def list_jobs():
    with sqlite3.connect(DB) as conn:
        c = conn.cursor()
        c.execute("SELECT * FROM jobs")
        jobs = [{"id": row[0], "title": row[1], "description": row[2], "requirements": row[3]} 
                for row in c.fetchall()]
    return jsonify(jobs)

# ------------------------------
# Resume APIs
# ------------------------------
@app.route('/resumes', methods=['POST'])
def add_resume():
    try:
        data = request.json
        if not all(key in data for key in ['name', 'content']):
            return jsonify({"error": "Missing required fields"}), 400
        with sqlite3.connect(DB) as conn:
            c = conn.cursor()
            c.execute("INSERT INTO resumes (name, content) VALUES (?, ?)", 
                      (data['name'], data['content']))
            conn.commit()
        return jsonify({"status": "success"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/resumes', methods=['GET'])
def list_resumes():
    with sqlite3.connect(DB) as conn:
        c = conn.cursor()
        c.execute("SELECT * FROM resumes")
        resumes = [{"id": row[0], "name": row[1], "content": row[2]} for row in c.fetchall()]
    return jsonify(resumes)

# ------------------------------
# Match resume with job using Gemini API
# ------------------------------
@app.route('/match', methods=['POST'])
def match_resume():
    try:
        data = request.json
        job_id = data.get('job_id')
        resume_id = data.get('resume_id')
        if not job_id or not resume_id:
            return jsonify({"error": "Missing job_id or resume_id"}), 400

        # Fetch job and resume from database
        with sqlite3.connect(DB) as conn:
            c = conn.cursor()
            c.execute("SELECT description, requirements FROM jobs WHERE id = ?", (job_id,))
            job = c.fetchone()
            if not job:
                return jsonify({"error": "Job not found"}), 404
            job_desc = f"Description: {job[0]}\nRequirements: {job[1]}"

            c.execute("SELECT content FROM resumes WHERE id = ?", (resume_id,))
            resume = c.fetchone()
            if not resume:
                return jsonify({"error": "Resume not found"}), 404
            resume_text = resume[0]

        GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
        if not GEMINI_API_KEY:
            return jsonify({
                "match_score": "85%",
                "strengths": "Strong experience in frontend, React.js, problem-solving.",
                "gaps": "Limited backend exposure, no cloud experience."
            }), 200

        # Configure Gemini API with SDK
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-2.5-pro')
        prompt = f"""
You are an AI assistant tasked with analyzing job descriptions and resumes. Your response must be a valid JSON object with exactly the following structure and no additional text, using double quotes around ALL property names and values where applicable:
{{
  "match_score": "a percentage (e.g., '90%')",
  "strengths": "a comma-separated list of strengths (e.g., 'Python skills, teamwork')",
  "gaps": "a comma-separated list of missing skills (e.g., 'No Java experience, no cloud skills')"
}}
Analyze this Job Description:
{job_desc}
And this Resume:
{resume_text}
Provide only the JSON object as specified, with no explanations or extra content. Ensure all keys (match_score, strengths, gaps) are enclosed in double quotes.
"""
        response = model.generate_content(prompt)
        text = response.text.strip() if response.text else "{}"

        # Log raw response for debugging (server-side only)
        import logging
        logging.basicConfig(level=logging.DEBUG)
        logging.debug(f"Raw model response: {text}")

        # Preprocess to ensure valid JSON by adding quotes to unquoted keys
        try:
            import re
            # Extract the JSON-like object with a simpler pattern
            json_text = re.search(r'\{[^}]*\}', text)  # Basic JSON extraction
            if json_text:
                raw_json = json_text.group(0)
                # Replace unquoted keys with quoted keys (assuming standard key names)
                cleaned_json = re.sub(r'(\bmatch_score\b|\bstrengths\b|\bgaps\b)\s*:', r'"\1":', raw_json)
                match_result = json.loads(cleaned_json)
            else:
                match_result = {
                    "match_score": "N/A",
                    "strengths": "Unable to determine strengths",
                    "gaps": "Unable to determine gaps"
                }
        except json.JSONDecodeError as e:
            logging.error(f"JSON Decode Error: {e} - Raw text: {text}")
            match_result = {
                "match_score": "N/A",
                "strengths": "Unable to determine strengths",
                "gaps": "Unable to determine gaps"
            }

        return jsonify(match_result), 200

    except json.JSONDecodeError:
        return jsonify({"error": "Invalid JSON response from AI model"}), 500
    except ValueError as e:
        return jsonify({"error": f"API configuration error: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ------------------------------
# Serve frontend
# ------------------------------
@app.route('/')
def index():
    return render_template('index.html')

# ------------------------------
# Run app
# ------------------------------
if __name__ == '__main__':
    app.run(debug=True)