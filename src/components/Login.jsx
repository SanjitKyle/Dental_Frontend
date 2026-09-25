import React, { useContext, useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Activity, Stethoscope } from 'lucide-react';
import { login } from '../services/auth';
import { getStaff } from '../services/staff';
import { ContextProvider } from '../context/store';
import { useNavigate, Link } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { setUser } = useContext(ContextProvider);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      setIsLoading(true);
      const res = await login({ email, password });
      if (res.data.success) {
        const token = res.data?.data?.token || res.data?.token;
        const loggedUser = res.data?.data?.user || res.data?.user;

        // If staff role, try to immediately fetch and attach their granular permissions
        if (token && (loggedUser?.role === 'staff' || !loggedUser?.role)) {
          try {
            const staffRes = await getStaff(token);
            const staffList = Array.isArray(staffRes?.data) ? staffRes.data : Array.isArray(staffRes) ? staffRes : [];
            const userEmail = (loggedUser?.email || email || '').toLowerCase().trim();
            const userId = String(loggedUser?._id || loggedUser?.id || '');
            const userName = (loggedUser?.name || loggedUser?.fullName || '').toLowerCase().trim();

            const matched = staffList.find(s => 
              (s.email && s.email.toLowerCase().trim() === userEmail) ||
              (s.employeeuserId && String(s.employeeuserId) === userId) ||
              (s._id && String(s._id) === userId) ||
              (s.fullName && s.fullName.toLowerCase().trim() === userName)
            );

            if (matched && Array.isArray(matched.permissions)) {
              if (res.data?.data?.user) {
                res.data.data.user.permissions = matched.permissions;
                res.data.data.user.employment = matched.employment;
                res.data.data.user.designation = matched.designation;
              } else if (res.data?.user) {
                res.data.user.permissions = matched.permissions;
                res.data.user.employment = matched.employment;
                res.data.user.designation = matched.designation;
              }
            }
          } catch (staffErr) {
            console.warn('Could not pre-fetch staff permissions on login:', staffErr);
          }
        }

        localStorage.setItem("user", JSON.stringify(res.data));
        setUser(res.data);
        if (onLogin) onLogin(); 
        navigate('/dashboard');
      }
    } catch (erro) {
      const errorMessage = erro?.response?.data?.message || erro.message || "Invalid email or password.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      
      {/* Left side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-24 relative">
        
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Activity className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold text-slate-900 tracking-tight">Dental Clinic</span>
          </div>

          <div className="mb-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">
              Welcome back
            </h1>
            <p className="text-slate-500 font-medium">
              Sign in to your account to manage your clinic operations and patient records.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium placeholder:text-slate-400"
                  placeholder="doctor@dentalclinic.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-slate-700">Password</label>
                <a href="#" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">Forgot password?</a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium placeholder:text-slate-400"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="remember" 
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer" 
              />
              <label htmlFor="remember" className="ml-2.5 text-sm font-medium text-slate-600 cursor-pointer">
                Remember me for 30 days
              </label>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-medium flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none group"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In to Dashboard
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm font-medium text-slate-500">
              Don't have an account?{' '}
              <a href="/register" className="text-blue-600 font-bold hover:text-blue-700 transition-colors">
                Create one now
              </a>
            </p>
          </div>

        </div>
      </div>

      {/* Right side - Visuals */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-between p-12">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] mix-blend-screen translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] mix-blend-screen -translate-x-1/3 translate-y-1/3" />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)]"></div>

        <div className="relative z-10 flex flex-col h-full justify-center text-white max-w-xl mx-auto">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-sm font-medium text-blue-200 mb-6 backdrop-blur-md">
              <ShieldCheck className="w-4 h-4" />
              HIPAA Compliant Platform
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
              Transforming Healthcare Management.
            </h2>
            <p className="text-lg text-slate-300 font-medium leading-relaxed">
              Dental Clinic streamlines your clinic's operations, allowing you to focus on what matters most — providing exceptional patient care.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-2 gap-6 mt-12 border-t border-white/10 pt-12">
            <div>
              <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mb-4">
                <Stethoscope className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="font-bold text-white mb-2">Patient Records</h3>
              <p className="text-sm text-slate-400 font-medium">Securely access and manage complete medical histories.</p>
            </div>
            <div>
              <div className="w-10 h-10 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mb-4">
                <Activity className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="font-bold text-white mb-2">Real-time Analytics</h3>
              <p className="text-sm text-slate-400 font-medium">Monitor your clinic's performance with actionable insights.</p>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 flex items-center justify-between mt-auto pt-12">
          <div className="text-sm font-medium text-slate-400">
            © {new Date().getFullYear()} Dental Clinic Inc.
          </div>
          <div className="flex gap-6 text-sm font-medium text-slate-400">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
