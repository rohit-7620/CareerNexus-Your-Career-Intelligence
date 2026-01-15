import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, Users, TrendingUp, Target, Award, Briefcase,
  FileText, MessageSquare, DollarSign, Loader2, Sparkles,
  ChevronUp, ChevronDown, AlertTriangle, CheckCircle2, Star,
  ArrowUp, ArrowDown, Minus
} from 'lucide-react';
import { 
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell,
  LineChart, Line, CartesianGrid, Legend, AreaChart, Area
} from 'recharts';
import toast from 'react-hot-toast';

// API Configuration for Benchmarking
const GEMINI_API_KEY = 'AIzaSyDU0VBDKnBexpnmB6xAqiqoEu1BK_L4Nho';
const MODEL_NAME = 'gemini-2.5-flash';

// Color palette
const COLORS = {
  primary: '#6366F1',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  chart: ['#636EFA', '#EF553B', '#00CC96', '#AB63FA', '#FFA15A', '#19D3F3']
};

const Benchmarking = () => {
  const [targetRole, setTargetRole] = useState('');
  const [yearsExperience, setYearsExperience] = useState('2');
  const [skills, setSkills] = useState('');
  const [benchmarkData, setBenchmarkData] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateBenchmark = async () => {
    if (!targetRole.trim()) {
      toast.error('Please enter a target role');
      return;
    }

    setLoading(true);

    const prompt = `Analyze career benchmarking for a ${targetRole} with ${yearsExperience} years experience and skills: ${skills || 'general'}.

Return JSON only:
{"overallScore":{"percentile":75,"rating":"Above Average","trend":"up"},"comparison":{"skills":{"score":78,"percentile":72,"marketAverage":65,"gap":13,"strengths":["skill1","skill2"],"weaknesses":["skill3"]},"experience":{"score":70,"percentile":68,"marketAverage":60,"relevanceScore":75,"industryFit":"Good"},"resumeQuality":{"score":72,"percentile":65,"atsScore":78,"keywordOptimization":70,"formatting":80,"impactStatements":65},"interviewReadiness":{"score":68,"percentile":60,"technicalPrep":70,"behavioralPrep":65,"communicationScore":72},"salaryPositioning":{"currentPercentile":65,"marketRate":"$85,000-$110,000","yourPosition":"$95,000","competitiveness":"Average","negotiationPower":"Medium"}},"radarData":[{"metric":"Skills","you":78,"market":65},{"metric":"Experience","you":70,"market":60},{"metric":"Resume","you":72,"market":68},{"metric":"Interview","you":68,"market":55},{"metric":"Salary","you":65,"market":70}],"percentileBreakdown":[{"category":"Technical Skills","percentile":78,"status":"strong"},{"category":"Soft Skills","percentile":65,"status":"average"},{"category":"Domain Knowledge","percentile":72,"status":"strong"},{"category":"Leadership","percentile":55,"status":"weak"},{"category":"Communication","percentile":70,"status":"average"}],"marketGaps":[{"gap":"Cloud certifications","importance":"High","currentLevel":40,"requiredLevel":80},{"gap":"System design","importance":"High","currentLevel":50,"requiredLevel":85},{"gap":"Leadership experience","importance":"Medium","currentLevel":30,"requiredLevel":60}],"improvementPriority":[{"priority":1,"area":"string","impact":"High","timeToImprove":"2-3 months","actions":["action1","action2"]},{"priority":2,"area":"string","impact":"Medium","timeToImprove":"1-2 months","actions":["action1"]}],"insights":[{"type":"strength","title":"string","description":"string"},{"type":"opportunity","title":"string","description":"string"},{"type":"warning","title":"string","description":"string"}],"salaryBenchmark":[{"range":"60-80K","percentage":15,"isYou":false},{"range":"80-100K","percentage":35,"isYou":true},{"range":"100-120K","percentage":30,"isYou":false},{"range":"120K+","percentage":20,"isYou":false}]}

Make analysis specific to ${targetRole} role with ${yearsExperience} years experience. Be realistic with scores.`;

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
        setBenchmarkData(parsedData);
        toast.success('Benchmark analysis complete!');
      } else {
        throw new Error('Invalid response');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(`Failed to generate: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up') return <ArrowUp className="w-4 h-4 text-green-500" />;
    if (trend === 'down') return <ArrowDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const getStatusColor = (status) => {
    if (status === 'strong') return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (status === 'average') return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          <BarChart3 className="inline w-10 h-10 mr-2 text-blue-500" />
          Career Benchmarking
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Compare your profile against market standards and get actionable insights
        </p>
      </motion.div>

      {/* Input Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              <Briefcase className="w-4 h-4 inline mr-2" />
              Target Role
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g., Senior Software Engineer"
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-primary-500 focus:outline-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              <Award className="w-4 h-4 inline mr-2" />
              Years Experience
            </label>
            <select
              value={yearsExperience}
              onChange={(e) => setYearsExperience(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-primary-500 focus:outline-none"
            >
              <option value="0">0-1 years</option>
              <option value="2">2-3 years</option>
              <option value="4">4-5 years</option>
              <option value="6">6-8 years</option>
              <option value="10">10+ years</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              <Target className="w-4 h-4 inline mr-2" />
              Key Skills
            </label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="React, Node.js, AWS..."
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-primary-500 focus:outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={generateBenchmark}
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Benchmark Me</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Results */}
      {benchmarkData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Overall Scorecard */}
          <div className="glass-card p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-2 border-blue-500/30">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="text-center md:text-left mb-4 md:mb-0">
                <h2 className="text-2xl font-bold mb-1">Overall Benchmark Score</h2>
                <p className="text-gray-400">Your market positioning</p>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className={`text-6xl font-bold ${getScoreColor(benchmarkData.overallScore?.percentile || 75)}`}>
                    {benchmarkData.overallScore?.percentile || 75}
                  </div>
                  <p className="text-sm text-gray-400">Percentile</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center space-x-2">
                    {getTrendIcon(benchmarkData.overallScore?.trend)}
                    <span className="text-xl font-semibold">{benchmarkData.overallScore?.rating || 'Above Average'}</span>
                  </div>
                  <p className="text-sm text-gray-400">Market Position</p>
                </div>
              </div>
            </div>
          </div>

          {/* Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { key: 'skills', label: 'Skills', icon: Target, color: 'from-blue-500 to-cyan-500' },
              { key: 'experience', label: 'Experience', icon: Briefcase, color: 'from-purple-500 to-pink-500' },
              { key: 'resumeQuality', label: 'Resume Quality', icon: FileText, color: 'from-green-500 to-emerald-500' },
              { key: 'interviewReadiness', label: 'Interview Ready', icon: MessageSquare, color: 'from-orange-500 to-amber-500' },
              { key: 'salaryPositioning', label: 'Salary Position', icon: DollarSign, color: 'from-red-500 to-rose-500' }
            ].map((item, index) => {
              const data = benchmarkData.comparison?.[item.key] || {};
              const score = data.score || data.currentPercentile || 70;
              const percentile = data.percentile || data.currentPercentile || 65;
              
              return (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card p-4"
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${item.color} flex items-center justify-center mb-3`}>
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-sm text-gray-400 mb-1">{item.label}</p>
                  <div className="flex items-end justify-between">
                    <span className={`text-2xl font-bold ${getScoreColor(score)}`}>{score}</span>
                    <span className="text-xs text-gray-500">Top {100 - percentile}%</span>
                  </div>
                  <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${score}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className={`h-full bg-gradient-to-r ${item.color}`}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Radar Chart & Percentile Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Radar Chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-6"
            >
              <h3 className="text-xl font-bold mb-4">You vs Market Average</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={benchmarkData.radarData}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="metric" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                  <Radar
                    name="You"
                    dataKey="you"
                    stroke="#6366F1"
                    fill="#6366F1"
                    fillOpacity={0.6}
                  />
                  <Radar
                    name="Market Average"
                    dataKey="market"
                    stroke="#F59E0B"
                    fill="#F59E0B"
                    fillOpacity={0.3}
                  />
                  <Legend />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Percentile Breakdown */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-6"
            >
              <h3 className="text-xl font-bold mb-4">Percentile Ranking</h3>
              <div className="space-y-4">
                {benchmarkData.percentileBreakdown?.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-32 text-sm truncate">{item.category}</div>
                    <div className="flex-1">
                      <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.percentile}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                          className={`h-full ${getScoreBg(item.percentile)}`}
                        />
                      </div>
                    </div>
                    <div className="w-16 text-right">
                      <span className={`font-bold ${getScoreColor(item.percentile)}`}>{item.percentile}%</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded border ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Market Gaps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <h3 className="text-xl font-bold mb-4">
              <AlertTriangle className="inline w-5 h-5 mr-2 text-yellow-500" />
              Strength vs Market Gaps
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {benchmarkData.marketGaps?.map((gap, index) => (
                <div key={index} className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold">{gap.gap}</h4>
                    <span className={`text-xs px-2 py-1 rounded ${
                      gap.importance === 'High' ? 'bg-red-500/20 text-red-400' :
                      gap.importance === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {gap.importance}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Current</span>
                      <span className="text-red-400">{gap.currentLevel}%</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden relative">
                      <div 
                        className="h-full bg-red-500/50 absolute"
                        style={{ width: `${gap.currentLevel}%` }}
                      />
                      <div 
                        className="h-full bg-green-500/30 absolute border-l-2 border-green-500"
                        style={{ left: `${gap.currentLevel}%`, width: `${gap.requiredLevel - gap.currentLevel}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Required</span>
                      <span className="text-green-400">{gap.requiredLevel}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Salary Benchmark Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <h3 className="text-xl font-bold mb-4">
              <DollarSign className="inline w-5 h-5 mr-2 text-green-500" />
              Salary Market Position
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={benchmarkData.salaryBenchmark}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="range" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" tickFormatter={(v) => `${v}%`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                    formatter={(value) => [`${value}%`, 'Market Distribution']}
                  />
                  <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
                    {benchmarkData.salaryBenchmark?.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.isYou ? '#10B981' : '#6366F1'}
                        opacity={entry.isYou ? 1 : 0.6}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              
              <div className="space-y-4">
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <p className="text-sm text-gray-400">Market Rate Range</p>
                  <p className="text-2xl font-bold text-green-400">
                    {benchmarkData.comparison?.salaryPositioning?.marketRate || '$85,000 - $110,000'}
                  </p>
                </div>
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-sm text-gray-400">Your Position</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {benchmarkData.comparison?.salaryPositioning?.yourPosition || '$95,000'}
                  </p>
                </div>
                <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                  <p className="text-sm text-gray-400">Negotiation Power</p>
                  <p className="text-xl font-bold text-purple-400">
                    {benchmarkData.comparison?.salaryPositioning?.negotiationPower || 'Medium'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Improvement Priority List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <h3 className="text-xl font-bold mb-4">
              <TrendingUp className="inline w-5 h-5 mr-2 text-purple-500" />
              Improvement Priority List
            </h3>
            <div className="space-y-4">
              {benchmarkData.improvementPriority?.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border-l-4 ${
                    item.priority === 1 ? 'border-red-500 bg-red-500/5' :
                    item.priority === 2 ? 'border-yellow-500 bg-yellow-500/5' :
                    'border-blue-500 bg-blue-500/5'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                        item.priority === 1 ? 'bg-red-500' :
                        item.priority === 2 ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}>
                        #{item.priority}
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg">{item.area}</h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                          <span className={`px-2 py-0.5 rounded ${
                            item.impact === 'High' ? 'bg-red-500/20 text-red-400' :
                            item.impact === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {item.impact} Impact
                          </span>
                          <span>•</span>
                          <span>{item.timeToImprove}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="ml-11 mt-2">
                    <p className="text-sm text-gray-400 mb-2">Actions:</p>
                    <div className="flex flex-wrap gap-2">
                      {item.actions?.map((action, i) => (
                        <span key={i} className="text-sm px-3 py-1 bg-white/5 rounded-full">
                          {action}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Key Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <h3 className="text-xl font-bold mb-4">
              <Star className="inline w-5 h-5 mr-2 text-yellow-500" />
              Key Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {benchmarkData.insights?.map((insight, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border ${
                    insight.type === 'strength' ? 'bg-green-500/10 border-green-500/30' :
                    insight.type === 'opportunity' ? 'bg-blue-500/10 border-blue-500/30' :
                    'bg-yellow-500/10 border-yellow-500/30'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    {insight.type === 'strength' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                    {insight.type === 'opportunity' && <TrendingUp className="w-5 h-5 text-blue-500" />}
                    {insight.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
                    <h4 className="font-semibold">{insight.title}</h4>
                  </div>
                  <p className="text-sm text-gray-400">{insight.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Empty State */}
      {!benchmarkData && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-12 text-center"
        >
          <BarChart3 className="w-20 h-20 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2">Benchmark Your Career</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Enter your target role and experience to get a comprehensive comparison against market standards.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {['Skills Analysis', 'Resume Score', 'Interview Readiness', 'Salary Position', 'Market Gaps'].map((tag, i) => (
              <span key={i} className="px-3 py-1 text-sm bg-white/10 rounded-full">{tag}</span>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Benchmarking;
