import json
import random
from datetime import datetime, timedelta

random.seed(42)
num_students = 50
results = []

for i in range(num_students):
    student_id = f"STU-{1000+i}"
    name = f"Student {i+1}"
    
    # --- NEW RICHER FEATURES ---
    login_freq = random.randint(0, 7)
    assignments_delayed = random.randint(0, 5)
    avg_quiz_score = random.randint(40, 100)
    forum_posts = random.randint(0, 10)
    video_watch_pct = random.randint(10, 100) # % of lecture videos watched
    attendance_rate = random.randint(50, 100) # % of classes attended
    library_visits = random.randint(0, 15)
    
    # --- ML LOGIC ---
    risk_value = 0
    feature_impacts = []
    
    if login_freq < 3: risk_value += 30; feature_impacts.append({"feature": "Weekly Logins", "impact": 30.0})
    else: feature_impacts.append({"feature": "Weekly Logins", "impact": -10.0})
        
    if assignments_delayed > 2: risk_value += 25; feature_impacts.append({"feature": "Late Assignments", "impact": 25.0})
    else: feature_impacts.append({"feature": "Late Assignments", "impact": -5.0})

    if avg_quiz_score < 60: risk_value += 25; feature_impacts.append({"feature": "Quiz Average", "impact": 25.0})
    else: feature_impacts.append({"feature": "Quiz Average", "impact": -15.0})
        
    if forum_posts == 0: risk_value += 10; feature_impacts.append({"feature": "Forum Posts", "impact": 10.0})
    else: feature_impacts.append({"feature": "Forum Posts", "impact": -5.0})
        
    if video_watch_pct < 40: risk_value += 15; feature_impacts.append({"feature": "Video Watch Time", "impact": 15.0})
    
    if attendance_rate < 70: risk_value += 20; feature_impacts.append({"feature": "Attendance Rate", "impact": 20.0})

    risk_value += random.randint(-10, 10)
    
    if risk_value > 70:
        status = "High Risk"
        risk_score = min(99.0, risk_value + 20)
    elif risk_value > 40:
        status = "Watch"
        risk_score = risk_value + 10
    else:
        status = "Safe"
        risk_score = max(10.0, risk_value)

    # --- GENERATE 12-WEEK HISTORY ---
    history = []
    for week in range(12, 0, -1):
        date = (datetime.now() - timedelta(weeks=week)).strftime("%b %d")
        modifier = 1.0 if status == "Safe" else (0.8 if status == "Watch" else 0.4)
        activity = int((login_freq + forum_posts) * modifier * random.uniform(0.5, 1.5))
        history.append({"week": f"Wk {13-week}", "date": date, "activity": max(0, activity)})

    # --- GENERATE RECENT ALERTS FEED ---
    alerts = []
    if login_freq < 3: alerts.append({"type": "warning", "msg": "LMS login frequency dropped to 0 this week.", "date": "2 days ago"})
    if assignments_delayed > 2: alerts.append({"type": "error", "msg": f"{assignments_delayed} assignments are currently past due.", "date": "4 days ago"})
    if video_watch_pct < 40: alerts.append({"type": "info", "msg": "Video completion rate fell below 40%.", "date": "1 week ago"})
    if not alerts: alerts.append({"type": "success", "msg": "Student is on track with all metrics.", "date": "Today"})

    results.append({
        "student_id": student_id,
        "name": name,
        "status": status,
        "risk_score": round(risk_score, 1),
        "raw_features": {
            "login_freq": login_freq,
            "assignments_delayed": assignments_delayed,
            "avg_quiz_score": avg_quiz_score,
            "forum_posts": forum_posts,
            "video_watch_pct": video_watch_pct,
            "attendance_rate": attendance_rate,
            "library_visits": library_visits
        },
        "shap_explanations": feature_impacts,
        "history": history,
        "alerts": alerts
    })

with open('ml_predictions.json', 'w') as f:
    json.dump(results, f, indent=4)

print(f"✅ Generated enriched predictions for {len(results)} students")