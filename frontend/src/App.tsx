import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import StudentProfile from './StudentProfile';
import Login from './Login';
import { GraduationCap, LogOut } from 'lucide-react';

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const isAuth = localStorage.getItem('faculty_auth') === 'true';

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem('faculty_auth');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-dark-bg">
      <nav className="bg-dark-bg/80 backdrop-blur-md border-b border-dark-border px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-brand-500 p-2 rounded-xl text-white shadow-[0_0_15px_rgba(139,92,246,0.5)]">
            <GraduationCap size={24} />
          </div>
          <Link to="/" className="text-xl font-bold text-white tracking-tight">
            Learnlytics
          </Link>
        </div>
        
        <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors bg-dark-card px-4 py-2 rounded-lg border border-dark-border">
          <LogOut size={16} /> Sign Out
        </button>
      </nav>
      <main className="max-w-7xl mx-auto p-6">
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedLayout>
            <Dashboard />
          </ProtectedLayout>
        } />
        <Route path="/student/:id" element={
          <ProtectedLayout>
            <StudentProfile />
          </ProtectedLayout>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;