# MindPulse 🧠

MindPulse is a Machine Learning web application that predicts a student's **Mental Health Score** based on their social media habits, lifestyle, and basic personal information.

## 🚀 Features

- Mental health score prediction using Machine Learning
- FastAPI backend
- Responsive HTML/CSS/JavaScript frontend
- Multi-step prediction form
- Interactive sliders for lifestyle information
- Dark mode
- Animated prediction score
- Input validation
- API error handling

## 🛠️ Technologies

- Python
- FastAPI
- Machine Learning
- HTML5
- CSS3
- JavaScript
- Uvicorn

## 📁 Project Structure

```text
MindPulse/
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── favicon.ico
│
├── main.py
├── model file
├── requirements.txt
└── README.md
```

## ▶️ Run the Project

## 1. Install dependencies
```
pip install -r requirements.txt
```
## 2. Start FastAPI
```
uvicorn main:app --reload
```

The API will run at:
```
http://127.0.0.1:8000
```

## 3. Open the Frontend

Open frontend/index.html using VS Code Live Server or another static web server.

## 🔮 Prediction API
Endpoint
```
POST /predict
```

## Example Request
```
{
  "age": 20,
  "gender": "Male",
  "country": "India",
  "academic_level": "Undergraduate",
  "most_used_platform": "Instagram",
  "purpose_of_use": "Entertainment",
  "avg_daily_usage_hours": 4.5,
  "daily_unlocks": 60,
  "study_hours": 3,
  "physical_activity_hours": 1,
  "sleep_Hours_per_night": 6.5,
  "stress_level": "High"
}
```

## Example Response
```
{
  "predicted_mental_health_score": 6.0
}
```

## ⚠️ Disclaimer

MindPulse is an educational Machine Learning project.

The predicted score is not medical advice, diagnosis, or a substitute for professional mental health support.