import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, Briefcase, DollarSign, Loader2, Target, Zap,
  Shield, AlertTriangle, ArrowUpRight, ArrowDownRight, Minus,
  Bot, Building2, ChevronRight, Clock, Award, BarChart3,
  PieChart as PieIcon, Activity, Layers, Lightbulb, RefreshCw
} from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  PieChart, Pie, ComposedChart, Scatter
} from 'recharts';
import toast from 'react-hot-toast';

// API Configuration
const GEMINI_API_KEY = 'AIzaSyCoMgHG3iJBD1X5-_TkKfdqtHayrNEyx2o';
const MODEL_NAME = 'gemini-2.5-flash';

const CareerPredictionEngine = () => {
  const [currentRole, setCurrentRole] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [skills, setSkills] = useState('');
  const [industry, setIndustry] = useState('');
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);

  const parseAIResponse = (rawText) => {
    let text = rawText.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) throw new Error('No JSON found');
    text = text.substring(jsonStart, jsonEnd + 1);
    text = text.split('\n').join(' ').split('\r').join('').split('\t').join(' ');
    text = text.replace(/,(\s*[}\]])/g, '$1').replace(/\s+/g, ' ');
    return JSON.parse(text);
  };

  const generatePredictions = async () => {
    if (!currentRole || !yearsExperience || !skills) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    const prompt = `You are a career forecasting expert. Analyze and predict the 5-year career trajectory.

INPUT:
- Current Role: ${currentRole}
- Years of Experience: ${yearsExperience}
- Key Skills: ${skills}
- Industry: ${industry || 'Not specified'}

Generate comprehensive career predictions. Return JSON only:
{
  "summary": {
    "currentPosition": "${currentRole}",
    "predictedGrowth": "High/Medium/Low",
    "overallOutlook": "Brief 1-sentence outlook",
    "confidenceScore": 85
  },
  "roleEvolution": [
    {
      "year": 1,
      "role": "Current or immediate next role",
      "probability": 95,
      "salaryMin": 80000,
      "salaryMax": 95000,
      "salaryMid": 87500,
      "keyResponsibilities": ["Resp 1", "Resp 2"],
      "skillsRequired": ["Skill 1", "Skill 2"],
      "automationRisk": 25,
      "stabilityIndex": 85,
      "demandTrend": "rising/stable/declining"
    },
    {
      "year": 2,
      "role": "Next progression role",
      "probability": 80,
      "salaryMin": 90000,
      "salaryMax": 110000,
      "salaryMid": 100000,
      "keyResponsibilities": ["Resp 1", "Resp 2"],
      "skillsRequired": ["Skill 1", "Skill 2"],
      "automationRisk": 22,
      "stabilityIndex": 82,
      "demandTrend": "rising/stable/declining"
    },
    {
      "year": 3,
      "role": "Mid-term role",
      "probability": 70,
      "salaryMin": 105000,
      "salaryMax": 130000,
      "salaryMid": 117500,
      "keyResponsibilities": ["Resp 1", "Resp 2"],
      "skillsRequired": ["Skill 1", "Skill 2"],
      "automationRisk": 20,
      "stabilityIndex": 80,
      "demandTrend": "rising/stable/declining"
    },
    {
      "year": 4,
      "role": "Senior progression",
      "probability": 60,
      "salaryMin": 120000,
      "salaryMax": 150000,
      "salaryMid": 135000,
      "keyResponsibilities": ["Resp 1", "Resp 2"],
      "skillsRequired": ["Skill 1", "Skill 2"],
      "automationRisk": 18,
      "stabilityIndex": 78,
      "demandTrend": "rising/stable/declining"
    },
    {
      "year": 5,
      "role": "Target role in 5 years",
      "probability": 50,
      "salaryMin": 140000,
      "salaryMax": 180000,
      "salaryMid": 160000,
      "keyResponsibilities": ["Resp 1", "Resp 2"],
      "skillsRequired": ["Skill 1", "Skill 2"],
      "automationRisk": 15,
      "stabilityIndex": 75,
      "demandTrend": "rising/stable/declining"
    }
  ],
  "salaryBands": {
    "currentMarket": {"min": 75000, "max": 95000, "median": 85000},
    "year3Projection": {"min": 100000, "max": 135000, "median": 117500},
    "year5Projection": {"min": 135000, "max": 185000, "median": 160000},
    "industryComparison": [
      {"industry": "Tech", "avgSalary": 120000},
      {"industry": "Finance", "avgSalary": 115000},
      {"industry": "Healthcare", "avgSalary": 100000},
      {"industry": "Consulting", "avgSalary": 110000}
    ],
    "salaryGrowthRate": 12
  },
  "industryShifts": {
    "currentIndustryHealth": 85,
    "disruptions": [
      {"factor": "AI Automation", "impact": "High", "description": "Brief impact description", "timeframe": "2-3 years"},
      {"factor": "Remote Work", "impact": "Medium", "description": "Brief impact", "timeframe": "Ongoing"}
    ],
    "emergingOpportunities": ["Opportunity 1", "Opportunity 2", "Opportunity 3"],
    "decliningAreas": ["Area 1", "Area 2"],
    "industryGrowthProjection": [
      {"year": 2024, "growth": 5},
      {"year": 2025, "growth": 7},
      {"year": 2026, "growth": 8},
      {"year": 2027, "growth": 6},
      {"year": 2028, "growth": 5}
    ]
  },
  "automationAnalysis": {
    "currentRoleRisk": 30,
    "futureRoleRisk": 20,
    "tasksAtRisk": ["Task that may be automated 1", "Task 2"],
    "safeSkills": ["Skill that remains human-centric 1", "Skill 2"],
    "riskBySkill": [
      {"skill": "Skill 1", "risk": 20},
      {"skill": "Skill 2", "risk": 45},
      {"skill": "Skill 3", "risk": 15},
      {"skill": "Skill 4", "risk": 60},
      {"skill": "Skill 5", "risk": 30}
    ],
    "recommendation": "How to future-proof career"
  },
  "stabilityMetrics": {
    "overallStability": 78,
    "factors": [
      {"factor": "Job Security", "score": 80, "trend": "up"},
      {"factor": "Industry Growth", "score": 75, "trend": "up"},
      {"factor": "Skill Demand", "score": 85, "trend": "stable"},
      {"factor": "Competition", "score": 70, "trend": "down"},
      {"factor": "Economic Resilience", "score": 72, "trend": "stable"}
    ],
    "riskFactors": ["Risk 1", "Risk 2"],
    "stabilityAdvice": "Advice for career stability"
  },
  "keyInsights": [
    {"type": "opportunity", "title": "Insight title", "description": "Detailed insight"},
    {"type": "warning", "title": "Warning title", "description": "What to watch out for"},
    {"type": "action", "title": "Action item", "description": "What to do now"}
  ],
  "alternativePaths": [
    {"path": "Alternative career path 1", "probability": 40, "salaryPotential": 150000},
    {"path": "Alternative path 2", "probability": 30, "salaryPotential": 140000}
  ]
}

Provide realistic, data-driven predictions based on current market trends.`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 8192,
              responseMimeType: "application/json"
            }
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'API request failed');
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        const parsedData = parseAIResponse(data.candidates[0].content.parts[0].text);
        setPredictions(parsedData);
        toast.success('Career predictions generated!');
      } else {
        throw new Error('Invalid response');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(`Failed to generate predictions: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-green-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBg = (score) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getRiskColor = (risk) => {
    if (risk <= 30) return 'text-green-500';
    if (risk <= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up' || trend === 'rising') return <ArrowUpRight className="w-4 h-4 text-green-500" />;
    if (trend === 'down' || trend === 'declining') return <ArrowDownRight className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  // Chart data preparation
  const salaryTrajectoryData = predictions?.roleEvolution?.map(r => ({
    year: `Year ${r.year}`,
    min: r.salaryMin,
    max: r.salaryMax,
    mid: r.salaryMid,
    role: r.role
  })) || [];

  const automationRiskData = predictions?.roleEvolution?.map(r => ({
    year: `Year ${r.year}`,
    risk: r.automationRisk,
    stability: r.stabilityIndex
  })) || [];

  const stabilityRadarData = predictions?.stabilityMetrics?.factors?.map(f => ({
    factor: f.factor,
    score: f.score
  })) || [];

  const skillRiskData = predictions?.automationAnalysis?.riskBySkill || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          <TrendingUp className="inline w-10 h-10 mr-2 text-blue-500" />
          Career Prediction Engine
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          AI-powered 5-year career trajectory forecast with detailed analytics
        </p>
      </motion.div>

      {/* Input Form */}
      {!predictions ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-8 max-w-2xl mx-auto"
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Forecast Your Career</h2>
            <p className="text-sm text-gray-400">Enter your details for personalized predictions</p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Briefcase className="w-4 h-4 inline mr-2" />
                  Current Role *
                </label>
                <input
                  type="text"
                  value={currentRole}
                  onChange={(e) => setCurrentRole(e.target.value)}
                  placeholder="e.g., Software Engineer"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Years of Experience *
                </label>
                <input
                  type="number"
                  value={yearsExperience}
                  onChange={(e) => setYearsExperience(e.target.value)}
                  placeholder="e.g., 3"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <Building2 className="w-4 h-4 inline mr-2" />
                Industry (Optional)
              </label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g., Technology, Finance, Healthcare"
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <Zap className="w-4 h-4 inline mr-2" />
                Key Skills (comma-separated) *
              </label>
              <textarea
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="React, Python, AWS, Leadership, Project Management..."
                rows={3}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none resize-none"
              />
            </div>

            <button
              onClick={generatePredictions}
              disabled={loading}
              className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analyzing Career Data...</span>
                </>
              ) : (
                <>
                  <TrendingUp className="w-5 h-5" />
                  <span>Generate 5-Year Forecast</span>
                </>
              )}
            </button>
          </div>

          {/* Features Preview */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: <TrendingUp className="w-4 h-4" />, label: 'Role Evolution' },
              { icon: <DollarSign className="w-4 h-4" />, label: 'Salary Bands' },
              { icon: <Bot className="w-4 h-4" />, label: 'Automation Risk' },
              { icon: <Shield className="w-4 h-4" />, label: 'Stability Index' },
            ].map((f, i) => (
              <div key={i} className="flex items-center space-x-2 text-xs text-gray-400 p-2 bg-white/5 rounded">
                <span className="text-blue-400">{f.icon}</span>
                <span>{f.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30"
            >
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                <span className={`text-xs px-2 py-0.5 rounded ${predictions.summary?.predictedGrowth === 'High' ? 'bg-green-500/20 text-green-400' : predictions.summary?.predictedGrowth === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                  {predictions.summary?.predictedGrowth}
                </span>
              </div>
              <p className="text-xs text-gray-400">Growth Outlook</p>
              <p className="text-lg font-bold">{predictions.summary?.predictedGrowth} Growth</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-4 bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30"
            >
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-5 h-5 text-green-400" />
                <ArrowUpRight className="w-4 h-4 text-green-400" />
              </div>
              <p className="text-xs text-gray-400">5-Year Salary</p>
              <p className="text-lg font-bold">${(predictions.salaryBands?.year5Projection?.median || 0).toLocaleString()}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-4 bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/30"
            >
              <div className="flex items-center justify-between mb-2">
                <Bot className="w-5 h-5 text-orange-400" />
                <span className={`text-xs ${getRiskColor(predictions.automationAnalysis?.currentRoleRisk || 0)}`}>
                  {predictions.automationAnalysis?.currentRoleRisk || 0}%
                </span>
              </div>
              <p className="text-xs text-gray-400">Automation Risk</p>
              <p className="text-lg font-bold">{predictions.automationAnalysis?.currentRoleRisk <= 30 ? 'Low' : predictions.automationAnalysis?.currentRoleRisk <= 60 ? 'Medium' : 'High'}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-4 bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30"
            >
              <div className="flex items-center justify-between mb-2">
                <Shield className="w-5 h-5 text-purple-400" />
                <span className={`text-xs ${getScoreColor(predictions.stabilityMetrics?.overallStability || 0)}`}>
                  {predictions.stabilityMetrics?.overallStability || 0}%
                </span>
              </div>
              <p className="text-xs text-gray-400">Stability Index</p>
              <p className="text-lg font-bold">{predictions.stabilityMetrics?.overallStability >= 70 ? 'Stable' : predictions.stabilityMetrics?.overallStability >= 40 ? 'Moderate' : 'Volatile'}</p>
            </motion.div>
          </div>

          {/* Role Evolution Forecast Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Layers className="w-5 h-5 mr-2 text-blue-400" />
              5-Year Role Evolution Forecast
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-2">Year</th>
                    <th className="text-left py-3 px-2">Predicted Role</th>
                    <th className="text-center py-3 px-2">Probability</th>
                    <th className="text-right py-3 px-2">Salary Range</th>
                    <th className="text-center py-3 px-2">Automation Risk</th>
                    <th className="text-center py-3 px-2">Stability</th>
                    <th className="text-center py-3 px-2">Demand</th>
                  </tr>
                </thead>
                <tbody>
                  {predictions.roleEvolution?.map((role, idx) => (
                    <motion.tr
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="border-b border-white/5 hover:bg-white/5"
                    >
                      <td className="py-3 px-2">
                        <span className="w-8 h-8 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-xs font-bold">
                          Y{role.year}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <div className="font-medium">{role.role}</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {role.skillsRequired?.slice(0, 2).map((s, i) => (
                            <span key={i} className="text-xs px-1.5 py-0.5 bg-white/10 rounded">{s}</span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <div className="flex items-center justify-center">
                          <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${role.probability}%` }}
                            />
                          </div>
                          <span className="ml-2 text-xs">{role.probability}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <div className="text-green-400 font-medium">${role.salaryMid?.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">
                          ${role.salaryMin?.toLocaleString()} - ${role.salaryMax?.toLocaleString()}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${role.automationRisk <= 30 ? 'bg-green-500/20 text-green-400' : role.automationRisk <= 60 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                          {role.automationRisk}%
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${role.stabilityIndex >= 70 ? 'bg-green-500/20 text-green-400' : role.stabilityIndex >= 40 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                          {role.stabilityIndex}%
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        {getTrendIcon(role.demandTrend)}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Visualizations Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Salary Trajectory Chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-green-400" />
                Salary Band Trajectory
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={salaryTrajectoryData}>
                  <defs>
                    <linearGradient id="salaryGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="year" stroke="#9CA3AF" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#9CA3AF" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v/1000)}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                    formatter={(value, name) => [`$${value?.toLocaleString()}`, name === 'min' ? 'Min' : name === 'max' ? 'Max' : 'Median']}
                  />
                  <Area type="monotone" dataKey="max" fill="url(#salaryGradient)" stroke="transparent" />
                  <Area type="monotone" dataKey="min" fill="#1F2937" stroke="transparent" />
                  <Line type="monotone" dataKey="mid" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', r: 5 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Automation Risk vs Stability */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-orange-400" />
                Risk vs Stability Over Time
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={automationRiskData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="year" stroke="#9CA3AF" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#9CA3AF" tick={{ fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="risk" name="Automation Risk" stroke="#F59E0B" strokeWidth={2} dot={{ fill: '#F59E0B', r: 4 }} />
                  <Line type="monotone" dataKey="stability" name="Stability Index" stroke="#8B5CF6" strokeWidth={2} dot={{ fill: '#8B5CF6', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Stability Factors Radar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-purple-400" />
                Career Stability Factors
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={stabilityRadarData}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="factor" stroke="#9CA3AF" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
                  <Radar name="Score" dataKey="score" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.5} />
                </RadarChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {predictions.stabilityMetrics?.factors?.map((f, i) => (
                  <div key={i} className="flex items-center justify-between text-xs p-2 bg-white/5 rounded">
                    <span className="flex items-center">
                      {getTrendIcon(f.trend)}
                      <span className="ml-1">{f.factor}</span>
                    </span>
                    <span className={getScoreColor(f.score)}>{f.score}%</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Skill Automation Risk */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <Bot className="w-5 h-5 mr-2 text-yellow-400" />
                Automation Risk by Skill
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={skillRiskData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" domain={[0, 100]} stroke="#9CA3AF" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="skill" type="category" stroke="#9CA3AF" tick={{ fontSize: 10 }} width={80} />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Bar dataKey="risk" name="Risk %">
                    {skillRiskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.risk <= 30 ? '#10B981' : entry.risk <= 60 ? '#F59E0B' : '#EF4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Industry Shifts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Building2 className="w-5 h-5 mr-2 text-cyan-400" />
              Industry Shifts Impact
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Industry Health Gauge */}
              <div className="p-4 bg-white/5 rounded-lg text-center">
                <p className="text-sm text-gray-400 mb-2">Industry Health</p>
                <div className="relative w-32 h-32 mx-auto">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="64" cy="64" r="56" stroke="#374151" strokeWidth="12" fill="none" />
                    <circle 
                      cx="64" cy="64" r="56" 
                      stroke={predictions.industryShifts?.currentIndustryHealth >= 70 ? '#10B981' : predictions.industryShifts?.currentIndustryHealth >= 40 ? '#F59E0B' : '#EF4444'}
                      strokeWidth="12" 
                      fill="none"
                      strokeDasharray={`${(predictions.industryShifts?.currentIndustryHealth / 100) * 352} 352`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-3xl font-bold ${getScoreColor(predictions.industryShifts?.currentIndustryHealth)}`}>
                      {predictions.industryShifts?.currentIndustryHealth}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Disruptions */}
              <div className="p-4 bg-white/5 rounded-lg">
                <p className="text-sm font-medium mb-3 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2 text-yellow-400" />
                  Key Disruptions
                </p>
                <div className="space-y-2">
                  {predictions.industryShifts?.disruptions?.map((d, i) => (
                    <div key={i} className="p-2 bg-white/5 rounded text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{d.factor}</span>
                        <span className={`px-1.5 py-0.5 rounded ${d.impact === 'High' ? 'bg-red-500/20 text-red-400' : d.impact === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                          {d.impact}
                        </span>
                      </div>
                      <p className="text-gray-500">{d.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Opportunities */}
              <div className="p-4 bg-white/5 rounded-lg">
                <p className="text-sm font-medium mb-3 flex items-center">
                  <Lightbulb className="w-4 h-4 mr-2 text-green-400" />
                  Emerging Opportunities
                </p>
                <div className="space-y-2">
                  {predictions.industryShifts?.emergingOpportunities?.map((o, i) => (
                    <div key={i} className="flex items-center text-xs p-2 bg-green-500/10 border border-green-500/20 rounded">
                      <ChevronRight className="w-3 h-3 text-green-400 mr-2" />
                      {o}
                    </div>
                  ))}
                </div>
                {predictions.industryShifts?.decliningAreas?.length > 0 && (
                  <>
                    <p className="text-xs text-gray-500 mt-3 mb-2">Declining Areas:</p>
                    {predictions.industryShifts.decliningAreas.map((a, i) => (
                      <div key={i} className="flex items-center text-xs p-2 bg-red-500/10 border border-red-500/20 rounded mb-1">
                        <ArrowDownRight className="w-3 h-3 text-red-400 mr-2" />
                        {a}
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </motion.div>

          {/* Key Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Lightbulb className="w-5 h-5 mr-2 text-yellow-400" />
              Key Insights & Recommendations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {predictions.keyInsights?.map((insight, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`p-4 rounded-lg border ${
                    insight.type === 'opportunity' ? 'bg-green-500/10 border-green-500/30' :
                    insight.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30' :
                    'bg-blue-500/10 border-blue-500/30'
                  }`}
                >
                  <div className="flex items-center mb-2">
                    {insight.type === 'opportunity' && <Award className="w-4 h-4 text-green-400 mr-2" />}
                    {insight.type === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-400 mr-2" />}
                    {insight.type === 'action' && <Target className="w-4 h-4 text-blue-400 mr-2" />}
                    <span className="text-sm font-semibold">{insight.title}</span>
                  </div>
                  <p className="text-xs text-gray-400">{insight.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Alternative Paths */}
          {predictions.alternativePaths?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <Layers className="w-5 h-5 mr-2 text-indigo-400" />
                Alternative Career Paths
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {predictions.alternativePaths.map((path, i) => (
                  <div key={i} className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{path.path}</span>
                      <span className="text-xs px-2 py-1 bg-white/10 rounded">{path.probability}% match</span>
                    </div>
                    <p className="text-lg font-bold text-green-400">${path.salaryPotential?.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Potential Salary</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Reset Button */}
          <button
            onClick={() => setPredictions(null)}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Generate New Predictions</span>
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default CareerPredictionEngine;
