import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Copy, RefreshCw, AlertTriangle, CheckCircle, TrendingUp, Flag, Target, Lightbulb, Shield } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line, Treemap, Cell } from 'recharts';
import toast from 'react-hot-toast';

const JDIntelligence = () => {
  const [jobDescription, setJobDescription] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const parseAIResponse = (text) => {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(text);
    } catch {
      return null;
    }
  };

  const analyzeJD = async () => {
    if (!jobDescription.trim()) {
      toast.error('Please paste a job description');
      return;
    }

    try {
      setLoading(true);
      const prompt = `Analyze this job description and extract critical intelligence. Return ONLY a valid JSON object (no markdown, no extra text):

Job Description:
${jobDescription}

Return JSON with these exact keys:
{
  "hiddenSkills": [{"skill": "name", "importance": 1-10, "reason": "why it matters"}, ...],
  "atsKeywords": ["keyword1", "keyword2", ...] (20+ most critical keywords),
  "senioritySiganals": {"level": "junior|mid|senior|lead", "indicators": ["signal1", ...], "yearsRequired": number},
  "redFlags": [{"flag": "description", "severity": "high|medium|low", "implication": "what it means"}, ...],
  "customizationTips": ["tip1", "tip2", ...] (10+ specific resume customization tips),
  "skillBreakdown": [{"category": "Technical|Domain|Leadership|Soft", "skills": ["skill1", ...], "criticality": 1-10}, ...],
  "seniorityIndicators": [{"indicator": "description", "impact": 1-10}]
}`;

      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyADKWfyCNacNmMx4eCpSvN-rhLsoiHd_Qc',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' },
          }),
        }
      );

      const data = await response.json();
      const analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const parsedAnalysis = parseAIResponse(analysisText);

      if (parsedAnalysis) {
        setAnalysis(parsedAnalysis);
        toast.success('Job description analyzed!');
      } else {
        toast.error('Failed to parse analysis');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze job description');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const skillBreakdownData = analysis?.skillBreakdown?.map(cat => ({
    name: cat.category,
    value: cat.criticality * 10,
    fill: {
      'Technical': '#3b82f6',
      'Domain': '#8b5cf6',
      'Leadership': '#ec4899',
      'Soft': '#f59e0b'
    }[cat.category] || '#6b7280'
  })) || [];

  const seniorityData = analysis?.seniorityIndicators?.map((ind, idx) => ({
    indicator: `Indicator ${idx + 1}`,
    impact: ind.impact,
    fill: `hsl(${idx * 40}, 70%, 50%)`
  })) || [];

  const severityColor = (severity) => {
    const colors = {
      high: '#ef4444',
      medium: '#f59e0b',
      low: '#84cc16'
    };
    return colors[severity] || '#6b7280';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto p-6 space-y-8"
    >
      <div className="bg-gradient-to-r from-amber-600 to-amber-700 rounded-lg p-8 text-white">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Zap size={40} /> JD Intelligence
        </h1>
        <p className="text-amber-100">Extract hidden requirements, ATS keywords, seniority signals & red flags</p>
      </div>

      {!analysis ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-8 space-y-4"
        >
          <div>
            <label className="block text-sm font-semibold mb-2">Paste Job Description</label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Copy and paste the entire job description here..."
              className="w-full h-80 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:border-gray-600 font-mono text-sm"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={analyzeJD}
              disabled={loading}
              className="flex-1 bg-amber-600 text-white py-3 rounded-lg font-semibold hover:bg-amber-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw className="animate-spin" size={20} /> : <Zap size={20} />}
              {loading ? 'Analyzing...' : 'Analyze Job Description'}
            </button>

            <button
              onClick={() => setJobDescription('')}
              className="px-6 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white py-3 rounded-lg font-semibold hover:bg-gray-400 dark:hover:bg-gray-600"
            >
              Clear
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-8"
        >
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border-l-4 border-blue-600"
            >
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Hidden Skills</p>
              <p className="text-3xl font-bold text-blue-600">{analysis?.hiddenSkills?.length || 0}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border-l-4 border-green-600"
            >
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">ATS Keywords</p>
              <p className="text-3xl font-bold text-green-600">{analysis?.atsKeywords?.length || 0}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 border-l-4 border-purple-600"
            >
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Red Flags</p>
              <p className="text-3xl font-bold text-purple-600">{analysis?.redFlags?.length || 0}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-6 border-l-4 border-orange-600"
            >
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Experience Level</p>
              <p className="text-xl font-bold text-orange-600 capitalize">{analysis?.senioritySiganals?.level || 'N/A'}</p>
            </motion.div>
          </div>

          {/* Seniority Signals */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg p-6 border border-orange-200 dark:border-orange-700">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Target className="text-orange-600" size={28} /> Role Seniority Signals
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold capitalize">Level: {analysis?.senioritySiganals?.level}</span>
                    <span className="text-sm bg-orange-600 text-white px-3 py-1 rounded-full">
                      {analysis?.senioritySiganals?.yearsRequired}+ years
                    </span>
                  </div>
                  <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((analysis?.senioritySiganals?.yearsRequired || 0) * 10, 100)}%` }}
                      className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full"
                      transition={{ duration: 0.8, delay: 0.2 }}
                    />
                  </div>
                </div>
              </div>
              <div>
                <div className="space-y-2">
                  {analysis?.senioritySiganals?.indicators?.map((indicator, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center gap-2 p-2 bg-white dark:bg-orange-900/30 rounded"
                    >
                      <CheckCircle className="text-orange-600 flex-shrink-0" size={18} />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{indicator}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Skill Breakdown with Treemap */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Lightbulb className="text-yellow-600" size={28} /> Skill Breakdown by Category
            </h3>
            {skillBreakdownData.length > 0 && (
              <ResponsiveContainer width="100%" height={300}>
                <Treemap data={skillBreakdownData} dataKey="value" stroke="#ccc" fill="#8884d8">
                  {skillBreakdownData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Treemap>
              </ResponsiveContainer>
            )}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis?.skillBreakdown?.map((category, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"
                >
                  <h5 className="font-semibold mb-3 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: {
                      'Technical': '#3b82f6',
                      'Domain': '#8b5cf6',
                      'Leadership': '#ec4899',
                      'Soft': '#f59e0b'
                    }[category.category] || '#6b7280' }}></span>
                    {category.category}
                  </h5>
                  <div className="space-y-1">
                    {category.skills?.map((skill, sidx) => (
                      <div key={sidx} className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <span className="text-yellow-600">•</span> {skill}
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Criticality: {category.criticality}/10
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Hidden Skills */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border-l-4 border-blue-600">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Shield className="text-blue-600" size={28} /> Hidden Skill Requirements
            </h3>
            <div className="space-y-3">
              {analysis?.hiddenSkills?.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white dark:bg-blue-900/40 p-4 rounded-lg border-l-4 border-blue-600"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-semibold text-blue-700 dark:text-blue-300">{item.skill}</div>
                    <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Importance: {item.importance}/10</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{item.reason}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* ATS Keywords */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <CheckCircle className="text-green-600" size={28} /> ATS Keywords to Include
              </h3>
              <button
                onClick={() => copyToClipboard(analysis?.atsKeywords?.join(', ') || '')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 flex items-center gap-2"
              >
                <Copy size={16} /> Copy All
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {analysis?.atsKeywords?.map((keyword, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.02 }}
                  className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium border border-green-300 dark:border-green-700 hover:shadow-md transition-shadow"
                >
                  {keyword}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Red Flags */}
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 border-l-4 border-red-600">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Flag className="text-red-600" size={28} /> Red Flags & Concerns
            </h3>
            <div className="space-y-3">
              {analysis?.redFlags?.map((flag, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white dark:bg-red-900/40 p-4 rounded-lg border-l-4"
                  style={{ borderLeftColor: severityColor(flag.severity) }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-semibold text-gray-800 dark:text-gray-200">{flag.flag}</div>
                    <span
                      className="text-xs text-white px-2 py-1 rounded capitalize font-semibold"
                      style={{ backgroundColor: severityColor(flag.severity) }}
                    >
                      {flag.severity}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{flag.implication}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Seniority Indicators Chart */}
          {seniorityData.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-2xl font-bold mb-6">Seniority Requirement Impact</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={seniorityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="indicator" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="impact" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Resume Customization Tips */}
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-lg p-6">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Lightbulb className="text-cyan-600" size={28} /> Resume Customization Tips
            </h3>
            <div className="space-y-3">
              {analysis?.customizationTips?.map((tip, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow"
                >
                  <span className="text-cyan-600 font-bold flex-shrink-0 w-6 h-6 flex items-center justify-center bg-cyan-100 dark:bg-cyan-900/40 rounded-full">
                    {idx + 1}
                  </span>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{tip}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setAnalysis(null)}
            className="w-full bg-amber-600 text-white py-3 rounded-lg font-semibold hover:bg-amber-700"
          >
            Analyze Another Job Description
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default JDIntelligence;
