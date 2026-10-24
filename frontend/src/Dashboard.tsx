import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchStudents } from './api';
import { AlertCircle, ChevronRight, Search, CheckSquare, Square, Send, X, Mail, CheckCircle2 } from 'lucide-react';

export default function Dashboard() {
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generatedEmails, setGeneratedEmails] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetchStudents().then(setStudents);
  }, []);

  const filtered = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  const getStatusColor = (status: string) => {
    if (status === 'High Risk') return 'bg-red-500/10 text-red-400 border-red-500/20';
    if (status === 'Watch') return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  };

  const getAvatarUrl = (name: string) => {
    const colors = ['8B5CF6', '3B82F6', '10B981', 'F59E0B', 'EF4444'];
    const charCodeSum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const color = colors[charCodeSum % colors.length];
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${color}&color=fff&bold=true`;
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) setSelectedIds([]);
    else setSelectedIds(filtered.map(s => s.student_id));
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    else setSelectedIds([...selectedIds, id]);
  };

  // --- OPEN EMAIL MODAL ---
  const handleOpenEmailModal = async () => {
    setIsModalOpen(true);
    setIsGenerating(true);
    setGeneratedEmails([]);
    
    try {
      const res = await fetch('http://localhost:5000/api/bulk-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_ids: selectedIds })
      });
      const data = await res.json();
      setGeneratedEmails(data.emails);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  // --- "SEND" EMAILS ---
  const handleSendEmails = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setIsModalOpen(false);
      setSelectedIds([]);
      alert(`Successfully sent ${generatedEmails.length} personalized emails!`);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Student Overview</h1>
          <p className="text-slate-400 mt-1">Flagged students requiring review.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Search students..." 
            className="pl-10 pr-4 py-2.5 bg-dark-card border border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 w-64 text-white placeholder-slate-500 transition-all"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-dark-card rounded-2xl border border-dark-border overflow-hidden shadow-2xl relative">
        
        {/* Floating Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div className="absolute top-0 left-0 w-full bg-brand-600 text-white px-6 py-3 flex items-center justify-between z-20 shadow-lg animate-in slide-in-from-top-2">
            <span className="font-medium">{selectedIds.length} student(s) selected</span>
            <div className="flex items-center gap-4">
              <button onClick={handleOpenEmailModal} className="flex items-center gap-2 bg-white text-brand-600 px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-slate-100 transition-colors shadow-sm">
                <Send size={16} /> {selectedIds.length === 1 ? 'Generate Check-in' : 'Generate Bulk Check-ins'}
              </button>
              <button onClick={() => setSelectedIds([])} className="text-white/80 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
          </div>
        )}

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-dark-border text-slate-400 text-sm font-medium bg-dark-bg/50">
              <th className="p-5 w-10">
                <button onClick={toggleSelectAll} className="text-slate-400 hover:text-white transition-colors">
                  {selectedIds.length === filtered.length && filtered.length > 0 ? <CheckSquare size={18} /> : <Square size={18} />}
                </button>
              </th>
              <th className="p-5">Student</th>
              <th className="p-5">Risk Score</th>
              <th className="p-5">Status</th>
              <th className="p-5">Top Factor</th>
              <th className="p-5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border">
            {filtered.map((student) => {
              const topFactor = student.shap_explanations
                .filter((s: any) => s.impact > 0)
                .sort((a: any, b: any) => b.impact - a.impact)[0];
              const isSelected = selectedIds.includes(student.student_id);

              return (
                <tr key={student.student_id} className={`hover:bg-white/[0.02] transition-colors group ${isSelected ? 'bg-brand-500/5' : ''}`}>
                  <td className="p-5">
                    <button onClick={() => toggleSelect(student.student_id)} className={`transition-colors ${isSelected ? 'text-brand-500' : 'text-slate-500 hover:text-slate-300'}`}>
                      {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                    </button>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <img src={getAvatarUrl(student.name)} alt={student.name} className="w-10 h-10 rounded-full border-2 border-dark-border shadow-sm" />
                      <div>
                        <div className="font-semibold text-white">{student.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{student.student_id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                       <div className="w-full bg-dark-bg rounded-full h-1.5 max-w-[100px] overflow-hidden">
                          <div className={`h-1.5 rounded-full ${student.risk_score > 70 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : student.risk_score > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${student.risk_score}%` }}></div>
                       </div>
                       <span className="text-sm font-medium text-slate-300">{student.risk_score}%</span>
                    </div>
                  </td>
                  <td className="p-5">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(student.status)}`}>{student.status}</span>
                  </td>
                  <td className="p-5 text-sm text-slate-400 flex items-center gap-1.5">
                    {topFactor ? (<><AlertCircle size={14} className="text-red-400" />{topFactor.feature} (+{topFactor.impact})</>) : (<span className="text-slate-600">No major risks</span>)}
                  </td>
                  <td className="p-5 text-right">
                    <Link to={`/student/${student.student_id}`} className="inline-flex items-center text-brand-500 hover:text-brand-400 font-medium text-sm transition-colors group-hover:translate-x-1 duration-200">
                      Profile <ChevronRight size={16} className="ml-1" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* EMAIL PREVIEW MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl animate-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-dark-border flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2"><Mail className="text-brand-500" /> Email Preview</h2>
                <p className="text-sm text-slate-400 mt-1">The AI has personalized these drafts based on each student's risk factors.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors"><X size={24} /></button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {isGenerating ? (
                <div className="text-center py-10 text-brand-400 animate-pulse font-medium">Generating personalized emails...</div>
              ) : (
                generatedEmails.map((email: any, i: number) => (
                  <div key={i} className="bg-dark-bg border border-dark-border rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2 border-b border-dark-border pb-2">
                      <span className="text-sm text-slate-400">To: <span className="text-white font-medium">{email.name}</span></span>
                      <span className="text-xs text-slate-500">{email.student_id}</span>
                    </div>
                    <p className="text-sm text-brand-300 font-medium mb-2">Subject: {email.subject}</p>
                    <pre className="text-sm text-slate-300 whitespace-pre-wrap font-sans">{email.body}</pre>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-dark-border flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg text-slate-300 hover:text-white transition-colors font-medium">Cancel</button>
              <button 
                onClick={handleSendEmails} 
                disabled={isGenerating || isSending}
                className="bg-brand-600 hover:bg-brand-500 text-white px-6 py-2 rounded-lg font-semibold transition-all shadow-lg shadow-brand-500/20 flex items-center gap-2 disabled:opacity-50"
              >
                {isSending ? 'Sending...' : <><Send size={16} /> Send {generatedEmails.length} Emails</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}