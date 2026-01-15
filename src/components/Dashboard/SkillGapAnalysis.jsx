import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, BookOpen, Clock, RefreshCw, CheckCircle, AlertCircle,
  Zap, TrendingUp, Award, Flame, Star, ArrowRight, Loader2,
  Brain, Code, Users, Layers, Timer, XCircle, AlertTriangle,
  ChevronRight, BarChart3, Activity, Sparkles
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, Radar, ScatterChart, Scatter, ZAxis, Cell,
  PieChart, Pie, Treemap
} from 'recharts';
import toast from 'react-hot-toast';

// API Configuration
const GEMINI_API_KEY = 'AIzaSyBOIr4HvDqPEVFoEQo1hc9KSutjSEVw6Xo';
const MODEL_NAME = 'gemini-2.5-flash';

const SkillGapAnalysis = () => {
  const [currentRole, setCurrentRole] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [currentSkills, setCurrentSkills] = useState('');
  const [analysis, setAnalysis] = useState(null);
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

  const analyzeSkills = async () => {
    if (!currentRole || !targetRole || !currentSkills) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    const prompt = `You are a career development expert analyzing skill gaps.

INPUT:
- Current Role: ${currentRole}
- Target Role: ${targetRole}
- Current Skills: ${currentSkills}

Analyze the skill gap comprehensively. Return JSON only:
{
  "summary": {
    "totalGaps": 12,
    "criticalGaps": 4,
    "optionalGaps": 5,
    "quickWins": 3,
    "estimatedTimeToReady": "6-9 months",
    "overallReadiness": 45
  },
  "currentSkills": [
    {"skill": "Skill from their list", "proficiency": 75, "relevance": "high/medium/low", "transferable": true}
  ],
  "roleRequirements": [
    {"skill": "Required skill name", "importance": "critical/important/optional", "proficiency": 85, "category": "technical/soft/domain"}
  ],
  "gapMatrix": [
    {
      "skill": "Missing or weak skill",
      "currentLevel": 20,
      "requiredLevel": 85,
      "gap": 65,
      "category": "critical/optional",
      "importance": 95,
      "learningEffort": "High/Medium/Low",
      "timeEstimate": "3-4 months",
      "difficulty": "Hard/Medium/Easy",
      "priority": 1,
      "isQuickWin": false,
      "impactOnRole": "Description of why this matters for the role",
      "learningPath": ["Step 1", "Step 2", "Step 3"]
    }
  ],
  "criticalSkills": [
    {
      "skill": "Must-have skill",
      "gap": 70,
      "why": "Why this is critical for the target role",
      "consequence": "What happens if you don't learn this",
      "timeToLearn": "2-3 months",
      "difficulty": "Hard",
      "resources": ["Resource 1", "Resource 2"]
    }
  ],
  "optionalSkills": [
    {
      "skill": "Nice-to-have skill",
      "gap": 40,
      "benefit": "How this helps but isn't required",
      "timeToLearn": "1-2 months",
      "difficulty": "Medium",
      "resources": ["Resource 1"]
    }
  ],
  "quickWins": [
    {
      "skill": "Easy to learn, high impact skill",
      "gap": 30,
      "why": "Why this is a quick win",
      "timeToLearn": "2-4 weeks",
      "impact": "High",
      "actionSteps": ["Specific action 1", "Action 2"]
    }
  ],
  "priorityOrder": [
    {
      "rank": 1,
      "skill": "Skill name",
      "rationale": "Why learn this first",
      "timeline": "Month 1-2",
      "effort": "40 hours",
      "prerequisites": ["Prerequisite 1"]
    }
  ],
  "learningRoadmap": {
    "phase1": {
      "name": "Foundation (Month 1-2)",
      "skills": ["Skill 1", "Skill 2"],
      "totalHours": 80,
      "milestones": ["Milestone 1", "Milestone 2"]
    },
    "phase2": {
      "name": "Intermediate (Month 3-4)",
      "skills": ["Skill 3", "Skill 4"],
      "totalHours": 100,
      "milestones": ["Milestone 1", "Milestone 2"]
    },
    "phase3": {
      "name": "Advanced (Month 5-6)",
      "skills": ["Skill 5", "Skill 6"],
      "totalHours": 120,
      "milestones": ["Milestone 1", "Milestone 2"]
    }
  },
  "strengthsToLeverage": ["Existing strength 1", "Strength 2"],
  "recommendations": [
    {"type": "immediate", "action": "What to do right now"},
    {"type": "shortTerm", "action": "Next 1-2 months"},
    {"type": "longTerm", "action": "3-6 months"}
  ]
}

Provide specific, actionable analysis based on real skill requirements for these roles.`;

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
        setAnalysis(parsedData);
        toast.success('Skill gap analysis complete!');
      } else {
        throw new Error('Invalid response');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(`Failed to analyze: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getEffortColor = (effort) => {
    if (effort === 'Low' || effort === 'Easy') return 'text-green-500';
    if (effort === 'Medium') return 'text-yellow-500';
    return 'text-red-500';
  };

  const getEffortBg = (effort) => {
    if (effort === 'Low' || effort === 'Easy') return 'bg-green-500';
    if (effort === 'Medium') return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getCategoryColor = (category) => {
    if (category === 'critical') return { bg: 'bg-red-500/20', border: 'border-red-500/50', text: 'text-red-400' };
    return { bg: 'bg-blue-500/20', border: 'border-blue-500/50', text: 'text-blue-400' };
  };

  const COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

  // Chart data
  const gapMatrixData = analysis?.gapMatrix?.map(g => ({
    skill: g.skill,
    gap: g.gap,
    importance: g.importance,
    effort: g.learningEffort === 'Low' ? 1 : g.learningEffort === 'Medium' ? 2 : 3,
    category: g.category
  })) || [];

  const categoryBreakdown = analysis?.gapMatrix?.reduce((acc, item) => {
    const cat = item.category;
    if (!acc[cat]) acc[cat] = 0;
    acc[cat]++;
    return acc;
  }, {});

  const pieData = categoryBreakdown ? Object.entries(categoryBreakdown).map(([name, value]) => ({ name, value })) : [];

  const radarData = analysis?.currentSkills?.slice(0, 6).map(s => ({
    skill: s.skill,
    current: s.proficiency || 50,
    required: analysis.roleRequirements?.find(r => r.skill === s.skill)?.proficiency || 80
  })) || [];

  const effortDistribution = analysis?.gapMatrix?.reduce((acc, item) => {
    const effort = item.learningEffort;
    if (!acc[effort]) acc[effort] = 0;
    acc[effort]++;
    return acc;
  }, {});

  const effortData = effortDistribution ? Object.entries(effortDistribution).map(([name, value]) => ({ name, value })) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          <Target className="inline w-10 h-10 mr-2 text-purple-500" />
          Skill Gap Analysis
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Compare your skills against role requirements with AI-powered insights
        </p>
      </motion.div>

      {/* Input Form */}
      {!analysis ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-8 max-w-2xl mx-auto"
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Analyze Your Skill Gap</h2>
            <p className="text-sm text-gray-400">Discover what skills you need to reach your target role</p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Users className="w-4 h-4 inline mr-2" />
                  Current Role *
                </label>
                <input
                  type="text"
                  value={currentRole}
                  onChange={(e) => setCurrentRole(e.target.value)}
                  placeholder="e.g., Junior Developer"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <Target className="w-4 h-4 inline mr-2" />
                  Target Role *
                </label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g., Senior Full-Stack Engineer"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <Code className="w-4 h-4 inline mr-2" />
                Your Current Skills (comma-separated) *
              </label>
              <textarea
                value={currentSkills}
                onChange={(e) => setCurrentSkills(e.target.value)}
                placeholder="React, JavaScript, HTML/CSS, Git, REST APIs, Agile..."
                rows={3}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-purple-500 focus:outline-none resize-none"
              />
            </div>

            <button
              onClick={analyzeSkills}
              disabled={loading}
              className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analyzing Skills...</span>
                </>
              ) : (
                <>
                  <Target className="w-5 h-5" />
                  <span>Analyze Skill Gap</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-4 bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30"
            >
              <Layers className="w-5 h-5 text-purple-400 mb-2" />
              <p className="text-xs text-gray-400">Total Gaps</p>
              <p className="text-2xl font-bold">{analysis.summary?.totalGaps}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-4 bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30"
            >
              <AlertCircle className="w-5 h-5 text-red-400 mb-2" />
              <p className="text-xs text-gray-400">Critical</p>
              <p className="text-2xl font-bold">{analysis.summary?.criticalGaps}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30"
            >
              <CheckCircle className="w-5 h-5 text-blue-400 mb-2" />
              <p className="text-xs text-gray-400">Optional</p>
              <p className="text-2xl font-bold">{analysis.summary?.optionalGaps}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-4 bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30"
            >
              <Zap className="w-5 h-5 text-green-400 mb-2" />
              <p className="text-xs text-gray-400">Quick Wins</p>
              <p className="text-2xl font-bold">{analysis.summary?.quickWins}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card p-4 bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/30"
            >
              <Timer className="w-5 h-5 text-orange-400 mb-2" />
              <p className="text-xs text-gray-400">Time to Ready</p>
              <p className="text-sm font-bold">{analysis.summary?.estimatedTimeToReady}</p>
            </motion.div>
          </div>

          {/* Readiness Gauge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10"
          >
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-purple-400" />
              Overall Readiness for {targetRole}
            </h3>
            <div className="flex items-center space-x-6">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="64" cy="64" r="56" stroke="#374151" strokeWidth="12" fill="none" />
                  <circle 
                    cx="64" cy="64" r="56" 
                    stroke={analysis.summary?.overallReadiness >= 70 ? '#10B981' : analysis.summary?.overallReadiness >= 40 ? '#F59E0B' : '#EF4444'}
                    strokeWidth="12" 
                    fill="none"
                    strokeDasharray={`${(analysis.summary?.overallReadiness / 100) * 352} 352`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-purple-400">{analysis.summary?.overallReadiness}%</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-400 mb-3">
                  You're <span className="font-bold text-purple-400">{analysis.summary?.overallReadiness}% ready</span> for this role. 
                  Focus on the {analysis.summary?.criticalGaps} critical skills to increase your readiness.
                </p>
                <div className="flex flex-wrap gap-2">
                  {analysis.strengthsToLeverage?.slice(0, 3).map((s, i) => (
                    <span key={i} className="text-xs px-2 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded">
                      ✓ {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Gap Matrix Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-purple-400" />
              Complete Skill Gap Matrix
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-2">Skill</th>
                    <th className="text-center py-3 px-2">Current</th>
                    <th className="text-center py-3 px-2">Required</th>
                    <th className="text-center py-3 px-2">Gap</th>
                    <th className="text-center py-3 px-2">Category</th>
                    <th className="text-center py-3 px-2">Learning Effort</th>
                    <th className="text-center py-3 px-2">Time</th>
                    <th className="text-center py-3 px-2">Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.gapMatrix?.map((gap, idx) => (
                    <motion.tr
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-b border-white/5 hover:bg-white/5"
                    >
                      <td className="py-3 px-2">
                        <div className="flex items-center space-x-2">
                          {gap.isQuickWin && <Zap className="w-3 h-3 text-green-400" />}
                          <span className="font-medium">{gap.skill}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <div className="flex items-center justify-center">
                          <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${gap.currentLevel}%` }}
                            />
                          </div>
                          <span className="ml-2 text-xs">{gap.currentLevel}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className="text-gray-400">{gap.requiredLevel}%</span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${gap.gap >= 60 ? 'bg-red-500/20 text-red-400' : gap.gap >= 30 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                          {gap.gap}%
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className={`px-2 py-1 rounded text-xs ${getCategoryColor(gap.category).bg} ${getCategoryColor(gap.category).text} border ${getCategoryColor(gap.category).border}`}>
                          {gap.category}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className={`text-xs font-medium ${getEffortColor(gap.learningEffort)}`}>
                          {gap.learningEffort}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center text-xs text-gray-400">
                        {gap.timeEstimate}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <div className="w-6 h-6 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center text-xs font-bold mx-auto">
                          {gap.priority}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Visualizations Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gap Scatter Plot */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-orange-400" />
                Gap vs Importance Matrix
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    type="number" 
                    dataKey="gap" 
                    name="Gap %" 
                    stroke="#9CA3AF" 
                    tick={{ fontSize: 11 }}
                    label={{ value: 'Skill Gap (%)', position: 'insideBottom', offset: -5, fontSize: 10 }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="importance" 
                    name="Importance" 
                    stroke="#9CA3AF" 
                    tick={{ fontSize: 11 }}
                    label={{ value: 'Importance', angle: -90, position: 'insideLeft', fontSize: 10 }}
                  />
                  <ZAxis type="number" dataKey="effort" range={[50, 400]} />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                    formatter={(value, name) => [value, name === 'gap' ? 'Gap' : name === 'importance' ? 'Importance' : name]}
                  />
                  <Scatter name="Skills" data={gapMatrixData}>
                    {gapMatrixData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.category === 'critical' ? '#EF4444' : '#3B82F6'} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Skills Radar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2 text-purple-400" />
                Current vs Required Proficiency
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="skill" stroke="#9CA3AF" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
                  <Radar name="Current" dataKey="current" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.5} />
                  <Radar name="Required" dataKey="required" stroke="#EC4899" fill="#EC4899" fillOpacity={0.2} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Category Breakdown */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <Layers className="w-5 h-5 mr-2 text-blue-400" />
                Gap Category Distribution
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.name === 'critical' ? '#EF4444' : '#3B82F6'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Learning Effort */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <Brain className="w-5 h-5 mr-2 text-yellow-400" />
                Learning Effort Distribution
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={effortData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#9CA3AF" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Bar dataKey="value" name="Skills">
                    {effortData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.name === 'Low' ? '#10B981' : entry.name === 'Medium' ? '#F59E0B' : '#EF4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Critical Skills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/30"
          >
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-red-400" />
              Critical Skills (Must Learn)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.criticalSkills?.map((skill, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold text-red-400">{skill.skill}</h4>
                    <span className={`text-xs px-2 py-1 rounded ${getEffortBg(skill.difficulty)}/20 ${getEffortColor(skill.difficulty)}`}>
                      {skill.difficulty}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">{skill.why}</p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
                    <Clock className="w-3 h-3" />
                    <span>{skill.timeToLearn}</span>
                  </div>
                  <div className="p-2 bg-red-500/20 border border-red-500/30 rounded text-xs text-red-300 mb-2">
                    ⚠️ {skill.consequence}
                  </div>
                  <details className="text-xs">
                    <summary className="cursor-pointer text-red-400 mb-1">Resources</summary>
                    <ul className="space-y-1 ml-4">
                      {skill.resources?.map((r, i) => (
                        <li key={i} className="text-gray-400">• {r}</li>
                      ))}
                    </ul>
                  </details>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quick Wins */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30"
          >
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-green-400" />
              Quick Wins (Start Here!)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analysis.quickWins?.map((skill, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <Flame className="w-4 h-4 text-green-400" />
                    <h4 className="font-bold text-green-400">{skill.skill}</h4>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">{skill.why}</p>
                  <div className="flex items-center space-x-2 text-xs text-green-400 mb-3">
                    <Timer className="w-3 h-3" />
                    <span>{skill.timeToLearn}</span>
                    <span className="ml-auto px-2 py-0.5 bg-green-500/20 rounded">High Impact</span>
                  </div>
                  <div className="space-y-1">
                    {skill.actionSteps?.map((step, i) => (
                      <div key={i} className="flex items-start text-xs text-gray-400">
                        <ChevronRight className="w-3 h-3 text-green-400 mr-1 mt-0.5 flex-shrink-0" />
                        {step}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Priority Order */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Star className="w-5 h-5 mr-2 text-yellow-400" />
              Prioritized Learning Order
            </h3>
            <div className="space-y-3">
              {analysis.priorityOrder?.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-start space-x-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="w-10 h-10 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    {item.rank}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold mb-1">{item.skill}</h4>
                    <p className="text-xs text-gray-400 mb-2">{item.rationale}</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {item.timeline}
                      </span>
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded">
                        {item.effort}
                      </span>
                      {item.prerequisites?.length > 0 && (
                        <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded">
                          Prerequisites: {item.prerequisites.join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Learning Roadmap */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-indigo-400" />
              Phased Learning Roadmap
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.values(analysis.learningRoadmap || {}).map((phase, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.15 }}
                  className={`p-4 rounded-lg border-l-4 ${
                    idx === 0 ? 'bg-blue-500/10 border-blue-500' :
                    idx === 1 ? 'bg-purple-500/10 border-purple-500' :
                    'bg-pink-500/10 border-pink-500'
                  }`}
                >
                  <h4 className="font-bold mb-2">{phase.name}</h4>
                  <div className="flex items-center space-x-2 text-xs text-gray-400 mb-3">
                    <Clock className="w-3 h-3" />
                    <span>{phase.totalHours} hours</span>
                  </div>
                  <div className="mb-3">
                    <p className="text-xs font-medium mb-1">Skills:</p>
                    <div className="flex flex-wrap gap-1">
                      {phase.skills?.map((s, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 bg-white/10 rounded">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium mb-1">Milestones:</p>
                    <ul className="space-y-1">
                      {phase.milestones?.map((m, i) => (
                        <li key={i} className="text-xs text-gray-400 flex items-start">
                          <CheckCircle className="w-3 h-3 text-green-400 mr-1 mt-0.5 flex-shrink-0" />
                          {m}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Recommendations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10"
          >
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-pink-400" />
              Personalized Recommendations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analysis.recommendations?.map((rec, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`p-4 rounded-lg border ${
                    rec.type === 'immediate' ? 'bg-red-500/10 border-red-500/30' :
                    rec.type === 'shortTerm' ? 'bg-yellow-500/10 border-yellow-500/30' :
                    'bg-blue-500/10 border-blue-500/30'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    {rec.type === 'immediate' && <AlertTriangle className="w-4 h-4 text-red-400" />}
                    {rec.type === 'shortTerm' && <Clock className="w-4 h-4 text-yellow-400" />}
                    {rec.type === 'longTerm' && <TrendingUp className="w-4 h-4 text-blue-400" />}
                    <span className="text-xs font-bold uppercase">
                      {rec.type === 'immediate' ? 'Now' : rec.type === 'shortTerm' ? '1-2 Months' : '3-6 Months'}
                    </span>
                  </div>
                  <p className="text-sm">{rec.action}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Reset Button */}
          <button
            onClick={() => setAnalysis(null)}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Analyze Different Skills</span>
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default SkillGapAnalysis;
