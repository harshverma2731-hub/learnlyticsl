import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

const getPredictions = () => {
  const filePath = path.join(__dirname, '../ml_service/ml_predictions.json');
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
};

const getInterventions = () => {
  const filePath = path.join(__dirname, 'database.json');
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
};

const saveIntervention = (intervention: any) => {
  const filePath = path.join(__dirname, 'database.json');
  const interventions = getInterventions();
  interventions.push(intervention);
  fs.writeFileSync(filePath, JSON.stringify(interventions, null, 2));
};

// --- RECOMMENDATION ENGINE ---
const getRecommendations = (features: any) => {
  const recs = [];
  if (features.assignments_delayed > 2) recs.push({ icon: "⏱️", title: "Assign Time Management Workshop", desc: "Student has multiple late submissions." });
  if (features.login_freq < 3) recs.push({ icon: "📞", title: "Schedule a Check-in Call", desc: "LMS login frequency is critically low." });
  if (features.video_watch_pct < 40) recs.push({ icon: "📚", title: "Recommend Supplemental Reading", desc: "Video engagement is low." });
  if (features.avg_quiz_score < 60) recs.push({ icon: "🧑‍🏫", title: "Suggest Peer Tutoring", desc: "Struggling with assessments." });
  if (features.attendance_rate < 70) recs.push({ icon: "🤝", title: "Wellness Check-in", desc: "Physical attendance is below 70%." });
  if (recs.length === 0) recs.push({ icon: "🌟", title: "Send Positive Reinforcement", desc: "Student is on track!" });
  return recs;
};

// --- API ENDPOINTS ---

app.get('/api/students', (req, res) => {
  res.json(getPredictions());
});

app.get('/api/students/:id', (req, res) => {
  const students = getPredictions();
  const student = students.find((s: any) => s.student_id === req.params.id);
  if (!student) return res.status(404).json({ error: "Student not found" });
  
  const interventions = getInterventions().filter((i: any) => i.student_id === req.params.id);
  const recommendations = getRecommendations(student.raw_features);
  
  res.json({ ...student, interventions, recommendations });
});

app.post('/api/interventions', (req, res) => {
  const { student_id, action_type, notes } = req.body;
  if (!student_id || !action_type) return res.status(400).json({ error: "Missing fields" });

  const newIntervention = {
    id: Date.now().toString(),
    student_id,
    action_type,
    notes,
    date: new Date().toISOString(),
    status: "Pending Review"
  };

  saveIntervention(newIntervention);
  res.status(201).json(newIntervention);
});

app.post('/api/simulate/:id', (req, res) => {
  const { login_freq, assignments_delayed, avg_quiz_score, video_watch_pct, attendance_rate } = req.body;
  
  let risk_value = 0;
  let explanations = [];

  if (login_freq < 3) { risk_value += 30; explanations.push({ feature: "Weekly Logins", impact: 30.0 }); }
  else { explanations.push({ feature: "Weekly Logins", impact: -10.0 }); }

  if (assignments_delayed > 2) { risk_value += 25; explanations.push({ feature: "Late Assignments", impact: 25.0 }); }
  else { explanations.push({ feature: "Late Assignments", impact: -5.0 }); }

  if (avg_quiz_score < 60) { risk_value += 25; explanations.push({ feature: "Quiz Average", impact: 25.0 }); }
  else { explanations.push({ feature: "Quiz Average", impact: -15.0 }); }

  if (video_watch_pct < 40) { risk_value += 15; explanations.push({ feature: "Video Watch Time", impact: 15.0 }); }
  if (attendance_rate < 70) { risk_value += 20; explanations.push({ feature: "Attendance Rate", impact: 20.0 }); }

  let status = "Safe";
  let risk_score = Math.max(10.0, risk_value);
  if (risk_value > 70) { status = "High Risk"; risk_score = Math.min(99.0, risk_value + 20); }
  else if (risk_value > 40) { status = "Watch"; risk_score = risk_value + 10; }

  res.json({ status, risk_score: Math.round(risk_score * 10) / 10, shap_explanations: explanations });
});

// --- NEW: BULK EMAIL GENERATION ENDPOINT ---
app.post('/api/bulk-email', (req, res) => {
  const { student_ids } = req.body;
  const allStudents = getPredictions();
  
  // Find the selected students
  const selectedStudents = allStudents.filter((s: any) => student_ids.includes(s.student_id));
  
  // Generate a personalized email for each
  const emails = selectedStudents.map((student: any) => {
    // Find their top risk factor to personalize the email
    const topFactor = student.shap_explanations
      .filter((s: any) => s.impact > 0)
      .sort((a: any, b: any) => b.impact - a.impact)[0];

    const reason = topFactor 
      ? `I noticed a recent change in your engagement, specifically regarding your ${topFactor.feature.toLowerCase()}.` 
      : `I wanted to reach out to see how you are doing.`;

    return {
      student_id: student.student_id,
      name: student.name,
      subject: `Checking in from your Professor - Let's Connect`,
      body: `Hi ${student.name},\n\nI hope this email finds you well. ${reason}\n\nI know college can be overwhelming, and life happens outside of the classroom. If you're struggling with the recent assignments or just need someone to talk to, my office hours are on Tuesdays at 2 PM.\n\nYou are a valued member of this class, and I want to help you succeed. Please let me know if there is anything I can do.\n\nBest,\nProfessor Smith`
    };
  });

  // Simulate network delay for realism
  setTimeout(() => {
    res.json({ success: true, emails });
  }, 800);
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});