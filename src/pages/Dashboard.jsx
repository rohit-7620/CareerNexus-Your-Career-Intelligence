import { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/Logo';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Sparkles, 
  Award, 
  Zap,
  BarChart3,
  User,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
  FileText,
  DollarSign,
  Briefcase,
  Mic2,
  BookOpen,
  CheckSquare
} from 'lucide-react';
import CareerTwin from '../components/Dashboard/CareerTwin';
import IndustryHeatmap from '../components/Dashboard/IndustryHeatmap';
import JobMatcher from '../components/Dashboard/JobMatcher';
import CareerSimulator from '../components/Dashboard/CareerSimulator';
import InterviewPrep from '../components/Dashboard/InterviewPrep';
import LearningRoadmap from '../components/Dashboard/LearningRoadmap';
import Benchmarking from '../components/Dashboard/Benchmarking';
import Overview from '../components/Dashboard/Overview';
import ResumeGenerator from '../components/Dashboard/ResumeGenerator';
import CoverLetterGenerator from '../components/Dashboard/CoverLetterGenerator';
import LinkedInOptimizer from '../components/Dashboard/LinkedInOptimizer';
import MockInterviewSystem from '../components/Dashboard/MockInterviewSystem';
import CareerPredictionEngine from '../components/Dashboard/CareerPredictionEngine';
import SkillGapAnalysis from '../components/Dashboard/SkillGapAnalysis';
import SalaryNegotiationAssistant from '../components/Dashboard/SalaryNegotiationAssistant';
import JDIntelligence from '../components/Dashboard/JDIntelligence';
import EnhancedLearningRoadmap from '../components/Dashboard/EnhancedLearningRoadmap';

const Dashboard = ({ darkMode, toggleDarkMode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { currentUser, userProfile, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: BarChart3, label: 'Overview', exact: true },
    { path: '/dashboard/career-twin', icon: Brain, label: 'AI Career Twin' },
    { path: '/dashboard/heatmap', icon: TrendingUp, label: 'Industry Heatmap' },
    { path: '/dashboard/job-matcher', icon: Target, label: 'Job Matcher' },
    { path: '/dashboard/simulator', icon: Sparkles, label: 'Career Simulator' },
    { path: '/dashboard/interview', icon: Zap, label: 'Interview Prep' },
    { path: '/dashboard/learning', icon: Award, label: 'Learning Path' },
    { path: '/dashboard/benchmark', icon: BarChart3, label: 'Benchmarking' },
    
    // Advanced Features (New)
    { path: '/dashboard/resume-generator', icon: FileText, label: 'ATS Resume', category: 'Advanced' },
    { path: '/dashboard/cover-letter', icon: FileText, label: 'Cover Letter' },
    { path: '/dashboard/linkedin', icon: Briefcase, label: 'LinkedIn Optimizer' },
    { path: '/dashboard/mock-interview', icon: Mic2, label: 'Mock Interview' },
    { path: '/dashboard/career-prediction', icon: TrendingUp, label: 'Career Prediction' },
    { path: '/dashboard/skill-gap', icon: Target, label: 'Skill Gap Analysis' },
    { path: '/dashboard/salary-negotiation', icon: DollarSign, label: 'Salary Negotiation' },
    { path: '/dashboard/jd-intelligence', icon: Zap, label: 'JD Intelligence' },
    { path: '/dashboard/enhanced-learning', icon: BookOpen, label: 'Enhanced Learning' },
  ];

  const isActive = (path, exact) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 glass-card border-r border-white/10 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <Logo size="default" showText={true} />
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  isActive(item.path, item.exact)
                    ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg'
                    : 'hover:bg-white/10'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {userProfile?.displayName || currentUser?.email?.split('@')[0]}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {currentUser?.email}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={toggleDarkMode}
                className="flex-1 p-2 glass-card rounded-lg hover:bg-white/10 transition-colors"
              >
                {darkMode ? <Sun className="w-4 h-4 mx-auto" /> : <Moon className="w-4 h-4 mx-auto" />}
              </button>
              
              <button
                onClick={logout}
                className="flex-1 p-2 glass-card rounded-lg hover:bg-red-500/20 transition-colors text-red-500"
              >
                <LogOut className="w-4 h-4 mx-auto" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="glass-card border-b border-white/10 p-4 lg:hidden">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-white/10"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            
            <Logo size="small" showText={true} />
            
            <div className="w-10"></div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-4 lg:p-8">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/career-twin" element={<CareerTwin />} />
            <Route path="/heatmap" element={<IndustryHeatmap />} />
            <Route path="/job-matcher" element={<JobMatcher />} />
            <Route path="/simulator" element={<CareerSimulator />} />
            <Route path="/interview" element={<InterviewPrep />} />
            <Route path="/learning" element={<LearningRoadmap />} />
            <Route path="/benchmark" element={<Benchmarking />} />
            
            {/* Advanced Features */}
            <Route path="/resume-generator" element={<ResumeGenerator />} />
            <Route path="/cover-letter" element={<CoverLetterGenerator />} />
            <Route path="/linkedin" element={<LinkedInOptimizer />} />
            <Route path="/mock-interview" element={<MockInterviewSystem />} />
            <Route path="/career-prediction" element={<CareerPredictionEngine />} />
            <Route path="/skill-gap" element={<SkillGapAnalysis />} />
            <Route path="/salary-negotiation" element={<SalaryNegotiationAssistant />} />
            <Route path="/jd-intelligence" element={<JDIntelligence />} />
            <Route path="/enhanced-learning" element={<EnhancedLearningRoadmap />} />
          </Routes>
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
