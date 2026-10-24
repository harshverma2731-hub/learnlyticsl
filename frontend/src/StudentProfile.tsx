import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchStudent, simulateStudent, logIntervention } from './api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from 'recharts';
import { ArrowLeft, AlertTriangle, CheckCircle2, SlidersHorizontal, Send, Activity, BookOpen, Video, Calendar, Bell, Lightbulb, Clock } from 'lucide-react';

export default function StudentProfile() {
  const { id } = useParams();
  const [student, setStudent] = useState<any>(null);
  const [simulation, setSimulation] = useState<any>(null);
  
  const [loginFreq, setLoginFreq] = useState(0);
  const [delayed, setDelayed] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [videoPct, setVideoPct] = useState(0);
  const [attendance, setAttendance] = useState(0);

  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchStudent(id).then((data) => {
      setStudent(data);
      setLoginFreq(data.raw_features.login_freq);
      setDelayed(data.raw_features.assignments_delayed);
      setQuizScore(data.raw_features.avg_quiz_score);
      setVideoPct(data.raw_features.video_watch_pct);
      setAttendance(data.raw_features.attendance_rate);
    });
  }, [id]);

  useEffect(() => {
    if (!student) return;
    const timer = setTimeout(() => {
      simulateStudent(id!, {
        login_freq: loginFreq, assignments_delayed: delayed, avg_quiz_score: quizScore, video_watch_pct: videoPct, attendance_rate: attendance
      }).then(setSimulation);
    }, 300); 
    return () => clearTimeout(timer);
  }, [loginFreq, delayed, quizScore, videoPct, attendance, id, student]);

  const handleIntervention = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;
    setIsSubmitting(true);
    await logIntervention({ student_id: id, action_type: 'Teacher Note', notes: note });
    setIsSubmitting(false);
    setSuccessMsg('Intervention logged successfully!');
    setNote('');
    
    const updatedStudent = await fetchStudent(id);
    setStudent(updatedStudent);

    setTimeout(() => setSuccessMsg(''), 3000);
  };

  if (!student) return <div className="p-10 text-center text-brand-500 animate-pulse font-medium">Loading AI Profile...</div>;

  const displayStatus = simulation ? simulation.status : student.status;
  const displayScore = simulation ? simulation.risk_score : student.risk_score;
  const displayShap = simulation ? simulation.shap_explanations : student.shap_explanations;

  const getStatusColor = (status: string) => {
    if (status === 'High Risk') return 'bg-red-500/10 text-red-400 border-red-500/30';
    if (status === 'Watch') return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  };

  const chartData = displayShap.map((s: any) => ({
    name: s.feature.toUpperCase(), impact: s.impact
  })).sort((a: any, b: any) => Math.abs(b.impact) - Math.abs(a.impact));

  const getAvatarUrl = (name: string) => {
    const colors = ['8B5CF6', '3B82F6', '10B981', 'F59E0B', 'EF4444'];
    const charCodeSum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const color = colors[charCodeSum % colors.length];
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${color}&color=fff&bold=true`;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-card border border-dark-border p-3 rounded-lg shadow-xl text-sm">
          <p className="text-white font-medium">{payload[0].payload.name}</p>
          <p className={payload[0].value > 0 ? "text-red-400" : "text-emerald-400"}>
            Impact: {payload[0].value > 0 ? '+' : ''}{payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <Link to="/" className="inline-flex items-center text-slate-400 hover:text-white font-medium transition-colors">
        <ArrowLeft size={18} className="mr-2" /> Back to Overview
      </Link>

      {/* Header */}
      <div className="bg-dark-card rounded-2xl p-8 border border-dark-border shadow-2xl flex justify-between items-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        
        <div className="relative z-10 flex items-center gap-6">
          <img 
            src={getAvatarUrl(student.name)} 
            alt={student.name} 
            className="w-20 h-20 rounded-2xl border-4 border-dark-border shadow-2xl"
          />
          <div>
            <h1 className="text-3xl font-bold text-white">{student.name}</h1>
            <p className="text-slate-400 mt-1">{student.student_id} • Computer Science</p>
          </div>
        </div>

        <div className="text-right relative z-10">
          <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold border mb-2 ${getStatusColor(displayStatus)}`}>
            {displayStatus}
          </div>
          <div className="text-5xl font-black text-white">{displayScore}<span className="text-xl text-slate-500 font-medium">/100</span></div>
        </div>
      </div>

      {/* Vitals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-dark-card p-5 rounded-2xl border border-dark-border flex items-center gap-4 hover:border-brand-500/50 transition-colors">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl"><Calendar size={22} /></div>
          <div><p className="text-sm text-slate-400 font-medium">Attendance</p><p className="text-2xl font-bold text-white">{student.raw_features.attendance_rate}%</p></div>
        </div>
        <div className="bg-dark-card p-5 rounded-2xl border border-dark-border flex items-center gap-4 hover:border-brand-500/50 transition-colors">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl"><Video size={22} /></div>
          <div><p className="text-sm text-slate-400 font-medium">Video Watched</p><p className="text-2xl font-bold text-white">{student.raw_features.video_watch_pct}%</p></div>
        </div>
        <div className="bg-dark-card p-5 rounded-2xl border border-dark-border flex items-center gap-4 hover:border-brand-500/50 transition-colors">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl"><BookOpen size={22} /></div>
          <div><p className="text-sm text-slate-400 font-medium">Library Visits</p><p className="text-2xl font-bold text-white">{student.raw_features.library_visits}</p></div>
        </div>
        <div className="bg-dark-card p-5 rounded-2xl border border-dark-border flex items-center gap-4 hover:border-brand-500/50 transition-colors">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl"><Activity size={22} /></div>
          <div><p className="text-sm text-slate-400 font-medium">Avg Quiz</p><p className="text-2xl font-bold text-white">{student.raw_features.avg_quiz_score}%</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Explainability Chart */}
          <div className="bg-dark-card rounded-2xl p-6 border border-dark-border shadow-xl">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <AlertTriangle className="text-amber-500" size={20} /> Why is this student flagged?
            </h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, left: 80, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                  <Bar dataKey="impact" radius={[0, 6, 6, 0]} barSize={28}>
                    {chartData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.impact > 0 ? '#ef4444' : '#10b981'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 12-Week Trend */}
          <div className="bg-dark-card rounded-2xl p-6 border border-dark-border shadow-xl">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Activity className="text-brand-500" size={20} /> 12-Week Engagement Trend
            </h2>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={student.history}>
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1F2937', borderRadius: '8px', color: '#fff' }} />
                  <Line type="monotone" dataKey="activity" stroke="#8B5CF6" strokeWidth={3} dot={{ r: 4, fill: '#8B5CF6', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#fff' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          
          {/* AI Recommendations */}
          <div className="bg-gradient-to-br from-brand-900/40 to-dark-card rounded-2xl p-6 border border-brand-500/30 shadow-[0_0_20px_rgba(139,92,246,0.1)]">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Lightbulb className="text-amber-400" size={20} /> AI Action Plan
            </h2>
            <div className="space-y-3">
              {student.recommendations?.map((rec: any, i: number) => (
                <div key={i} className="bg-dark-bg/50 p-3 rounded-xl border border-dark-border hover:border-brand-500/50 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{rec.icon}</span>
                    <span className="font-semibold text-brand-300 text-sm">{rec.title}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed pl-7">{rec.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Simulator */}
          <div className="bg-dark-card rounded-2xl p-6 border border-brand-500/30 shadow-[0_0_30px_rgba(139,92,246,0.05)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl pointer-events-none"></div>
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><SlidersHorizontal size={20} className="text-brand-500" /> What-If Simulator</h2>
            <div className="space-y-5 relative z-10">
              <div>
                <label className="flex justify-between text-xs font-medium mb-2 text-slate-400"><span>Weekly Logins</span><span className="text-brand-400">{loginFreq}</span></label>
                <input type="range" min="0" max="7" value={loginFreq} onChange={(e) => setLoginFreq(Number(e.target.value))} className="w-full accent-brand-500 h-1.5 bg-dark-border rounded-lg appearance-none cursor-pointer" />
              </div>
              <div>
                <label className="flex justify-between text-xs font-medium mb-2 text-slate-400"><span>Late Assignments</span><span className="text-brand-400">{delayed}</span></label>
                <input type="range" min="0" max="5" value={delayed} onChange={(e) => setDelayed(Number(e.target.value))} className="w-full accent-brand-500 h-1.5 bg-dark-border rounded-lg appearance-none cursor-pointer" />
              </div>
              <div>
                <label className="flex justify-between text-xs font-medium mb-2 text-slate-400"><span>Quiz Score</span><span className="text-brand-400">{quizScore}%</span></label>
                <input type="range" min="0" max="100" value={quizScore} onChange={(e) => setQuizScore(Number(e.target.value))} className="w-full accent-brand-500 h-1.5 bg-dark-border rounded-lg appearance-none cursor-pointer" />
              </div>
              <div>
                <label className="flex justify-between text-xs font-medium mb-2 text-slate-400"><span>Video Watched</span><span className="text-brand-400">{videoPct}%</span></label>
                <input type="range" min="0" max="100" value={videoPct} onChange={(e) => setVideoPct(Number(e.target.value))} className="w-full accent-brand-500 h-1.5 bg-dark-border rounded-lg appearance-none cursor-pointer" />
              </div>
              <div>
                <label className="flex justify-between text-xs font-medium mb-2 text-slate-400"><span>Attendance</span><span className="text-brand-400">{attendance}%</span></label>
                <input type="range" min="0" max="100" value={attendance} onChange={(e) => setAttendance(Number(e.target.value))} className="w-full accent-brand-500 h-1.5 bg-dark-border rounded-lg appearance-none cursor-pointer" />
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-dark-card rounded-2xl p-6 border border-dark-border shadow-xl">
            <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2"><Bell className="text-amber-500" size={20} /> Recent Alerts</h2>
            <div className="space-y-4">
              {student.alerts.map((alert: any, i: number) => (
                <div key={i} className="flex gap-3 text-sm">
                  <div className={`mt-1 w-2 h-2 rounded-full shrink-0 shadow-sm ${alert.type === 'error' ? 'bg-red-500 shadow-red-500/50' : alert.type === 'warning' ? 'bg-amber-500 shadow-amber-500/50' : alert.type === 'success' ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-blue-500 shadow-blue-500/50'}`} />
                  <div>
                    <p className="text-slate-300 font-medium leading-tight">{alert.msg}</p>
                    <p className="text-xs text-slate-500 mt-1">{alert.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interventions Form */}
          <div className="bg-dark-card rounded-2xl p-6 border border-dark-border shadow-xl">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><CheckCircle2 className="text-emerald-500" size={20} /> Log Intervention</h2>
            <form onSubmit={handleIntervention} className="space-y-3">
              <textarea placeholder="Add notes..." className="w-full bg-dark-bg border border-dark-border rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500 min-h-[80px] placeholder-slate-600" value={note} onChange={(e) => setNote(e.target.value)} />
              <button type="submit" disabled={isSubmitting || !note.trim()} className="w-full bg-brand-600 hover:bg-brand-500 text-white font-semibold py-2.5 rounded-xl transition-all shadow-lg shadow-brand-500/20 flex justify-center items-center gap-2 disabled:opacity-50">
                {isSubmitting ? 'Saving...' : <><Send size={16} /> Submit Note</>}
              </button>
              {successMsg && <p className="text-sm text-emerald-400 font-medium text-center">{successMsg}</p>}
            </form>
          </div>

          {/* Intervention History Timeline */}
          <div className="bg-dark-card rounded-2xl p-6 border border-dark-border shadow-xl">
            <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
              <Clock className="text-brand-400" size={20} /> Intervention History
            </h2>
            <div className="space-y-0 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-dark-border before:to-transparent">
              {student.interventions && student.interventions.length > 0 ? (
                student.interventions.map((intervention: any, i: number) => (
                  <div key={i} className="relative flex items-start gap-4 pb-6">
                    <div className="absolute left-0 mt-1.5 w-4 h-4 rounded-full bg-brand-500 border-4 border-dark-card shadow-[0_0_10px_rgba(139,92,246,0.5)] z-10"></div>
                    <div className="ml-8">
                      <p className="text-sm font-semibold text-white">{intervention.action_type}</p>
                      <p className="text-sm text-slate-400 mt-1">{intervention.notes}</p>
                      <p className="text-xs text-slate-500 mt-2">
                        {new Date(intervention.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 ml-8 italic">No interventions logged yet.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}