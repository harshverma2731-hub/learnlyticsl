import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'faculty@university.edu' && password === 'admin123') {
      localStorage.setItem('faculty_auth', 'true');
      navigate('/');
    } else {
      setError('Invalid credentials. Use the demo details below.');
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-dark-card/80 backdrop-blur-xl border border-dark-border rounded-3xl p-8 shadow-2xl relative z-10">
        
        {/* Logo & Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-brand-500 p-3 rounded-2xl text-white shadow-[0_0_20px_rgba(139,92,246,0.4)] mb-4">
            <GraduationCap size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Learnlytics Portal</h1>
          <p className="text-slate-400 text-sm mt-1">Sign in to Faculty Portal</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">University Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-500" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all placeholder-slate-600"
                placeholder="faculty@university.edu"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-500" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all placeholder-slate-600"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-brand-600 hover:bg-brand-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 mt-2"
          >
            Secure Sign In <ArrowRight size={18} />
          </button>
        </form>

        {/* Demo Credentials Box */}
        <div className="mt-8 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mb-2">
            <ShieldCheck size={14} className="text-emerald-400" /> Demo Credentials
          </div>
          <div className="text-xs text-slate-500 font-mono space-y-1">
            <p>Email: faculty@university.edu</p>
            <p>Password: admin123</p>
          </div>
        </div>

      </div>
    </div>
  );
}