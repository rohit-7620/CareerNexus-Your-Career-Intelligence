import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, Copy, RefreshCw, TrendingUp, Mail, Phone, Shield,
  Target, Award, AlertTriangle, ChevronRight, CheckCircle, Zap,
  Briefcase, Users, Clock, TrendingDown, Loader2, Sparkles,
  MessageSquare, FileText, Brain, Lightbulb, ArrowUpRight
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, LineChart, Line, Area, AreaChart, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import toast from 'react-hot-toast';

// API Configuration
const GEMINI_API_KEY = 'AIzaSyB7M6r2yUGGJNgDTE2B_m1aCq6HyC3etUg';
const MODEL_NAME = 'gemini-2.5-flash';

const SalaryNegotiationAssistant = () => {
  const [jobTitle, setJobTitle] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');
  const [offeredSalary, setOfferedSalary] = useState('');
  const [skills, setSkills] = useState('');
  const [negotiationData, setNegotiationData] = useState(null);
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

  const generateNegotiationStrategy = async () => {
    if (!jobTitle || !location || !experience || !offeredSalary) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    const prompt = `You are a confident, data-backed salary negotiation expert. Create a comprehensive negotiation strategy.

INPUT:
- Job Title: ${jobTitle}
- Location: ${location}
- Years of Experience: ${experience}
- Offered Salary: $${offeredSalary}
- Key Skills: ${skills || 'Not specified'}

Generate a professional, data-driven negotiation strategy. Return JSON only:
{
  "marketAnalysis": {
    "salaryRange": {
      "minimum": 95000,
      "p25": 110000,
      "median": 130000,
      "p75": 155000,
      "p90": 180000,
      "maximum": 200000
    },
    "yourPosition": "below/at/above market",
    "percentileRank": 45,
    "marketInsights": "Brief analysis of where the offer stands in the market"
  },
  "anchorSalary": {
    "recommendedAsk": 145000,
    "rationale": "Why this number is strategically chosen",
    "minimumAcceptable": 125000,
    "idealTarget": 150000,
    "walkAwayNumber": 115000,
    "confidenceLevel": "high/medium",
    "dataPoints": ["Supporting fact 1", "Supporting fact 2", "Supporting fact 3"]
  },
  "negotiationScripts": {
    "initialResponse": {
      "subject": "Email subject line",
      "body": "Professional email expressing gratitude and initiating negotiation. Should be confident, data-backed, and include specific numbers.",
      "keyPhrases": ["Important phrase to use", "Another key phrase"]
    },
    "phoneScript": {
      "opening": "How to start the conversation confidently",
      "statementOfValue": "How to articulate your value proposition",
      "anchorStatement": "How to present your target number with confidence",
      "handlePushback": "How to respond if they say no initially",
      "closing": "How to close the conversation professionally"
    },
    "counterOfferResponse": {
      "ifLowBall": "Script if they come back with a low counter",
      "ifReasonable": "Script if they meet you partway",
      "ifExcellent": "Script if they meet or exceed your ask"
    }
  },
  "benefitsTradeof": {
    "priorityMatrix": [
      {
        "benefit": "Signing Bonus",
        "valueDollar": 15000,
        "easinessToNegotiate": "high/medium/low",
        "impactOnTotal": "high",
        "negotiationTip": "How to ask for this"
      },
      {
        "benefit": "Stock Options/RSUs",
        "valueDollar": 25000,
        "easinessToNegotiate": "medium",
        "impactOnTotal": "high",
        "negotiationTip": "How to negotiate this"
      },
      {
        "benefit": "Remote Work Flexibility",
        "valueDollar": 10000,
        "easinessToNegotiate": "high",
        "impactOnTotal": "medium",
        "negotiationTip": "How to frame this request"
      },
      {
        "benefit": "PTO/Vacation Days",
        "valueDollar": 5000,
        "easinessToNegotiate": "medium",
        "impactOnTotal": "medium",
        "negotiationTip": "Strategy"
      },
      {
        "benefit": "Professional Development Budget",
        "valueDollar": 3000,
        "easinessToNegotiate": "high",
        "impactOnTotal": "low",
        "negotiationTip": "How to request"
      }
    ],
    "packageOptimization": "Strategy to maximize total compensation beyond base salary",
    "nonMonetaryWins": ["Benefit 1", "Benefit 2", "Benefit 3"]
  },
  "recruiterTactics": [
    {
      "tactic": "Name of common recruiter tactic",
      "description": "What they say or do",
      "intent": "What they're actually trying to achieve",
      "counterStrategy": "How to respond confidently and professionally",
      "exampleResponse": "Exact words you can use"
    }
  ],
  "negotiationTimeline": {
    "day1": {"action": "What to do immediately", "goal": "What to achieve"},
    "day2to3": {"action": "Follow-up actions", "goal": "Goal"},
    "day4to5": {"action": "Next steps", "goal": "Goal"},
    "day6to7": {"action": "Final push", "goal": "Goal"}
  },
  "psychologicalTactics": [
    {"tactic": "Silence technique", "when": "When to use", "how": "How to apply"},
    {"tactic": "Mirroring", "when": "When to use", "how": "How to apply"}
  ],
  "redFlags": [
    {"warning": "Red flag to watch for", "meaning": "What it indicates"},
    {"warning": "Another red flag", "meaning": "What it indicates"}
  ],
  "confidenceBuilders": [
    "Fact or affirmation to boost confidence 1",
    "Fact 2",
    "Fact 3",
    "Fact 4",
    "Fact 5"
  ],
  "successMetrics": {
    "excellent": "Outcomes that represent excellent negotiation",
    "good": "Good outcome",
    "acceptable": "Minimum acceptable outcome",
    "walkAway": "When to walk away"
  }
}

Use confident, data-backed tone. Provide specific numbers and actionable scripts.`;

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
        setNegotiationData(parsedData);
        toast.success('Negotiation strategy generated!');
      } else {
        throw new Error('Invalid response');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(`Failed to generate strategy: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const getEasinessColor = (easiness) => {
    if (easiness === 'high') return { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' };
    if (easiness === 'medium') return { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' };
    return { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' };
  };

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6'];

  // Chart data
  const salaryRangeData = negotiationData?.marketAnalysis?.salaryRange ? [
    { name: 'Min', value: negotiationData.marketAnalysis.salaryRange.minimum },
    { name: '25th', value: negotiationData.marketAnalysis.salaryRange.p25 },
    { name: 'Median', value: negotiationData.marketAnalysis.salaryRange.median },
    { name: '75th', value: negotiationData.marketAnalysis.salaryRange.p75 },
    { name: '90th', value: negotiationData.marketAnalysis.salaryRange.p90 },
    { name: 'Max', value: negotiationData.marketAnalysis.salaryRange.maximum },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          <DollarSign className="inline w-10 h-10 mr-2 text-green-500" />
          Salary Negotiation Assistant
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Confident, data-backed strategies to maximize your compensation package
        </p>
      </motion.div>

      {/* Input Form */}
      {!negotiationData ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-8 max-w-2xl mx-auto"
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Build Your Negotiation Strategy</h2>
            <p className="text-sm text-gray-400">Get data-backed insights and ready-to-use scripts</p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Briefcase className="w-4 h-4 inline mr-2" />
                  Job Title *
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g., Senior Software Engineer"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-green-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <Users className="w-4 h-4 inline mr-2" />
                  Location *
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., San Francisco, CA"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-green-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Years of Experience *
                </label>
                <input
                  type="number"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="e.g., 5"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-green-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <DollarSign className="w-4 h-4 inline mr-2" />
                  Offered Salary ($) *
                </label>
                <input
                  type="number"
                  value={offeredSalary}
                  onChange={(e) => setOfferedSalary(e.target.value)}
                  placeholder="e.g., 120000"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-green-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <Award className="w-4 h-4 inline mr-2" />
                Key Skills (Optional)
              </label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g., Python, AWS, Team Leadership"
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-green-500 focus:outline-none"
              />
            </div>

            <button
              onClick={generateNegotiationStrategy}
              disabled={loading}
              className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analyzing Market Data...</span>
                </>
              ) : (
                <>
                  <TrendingUp className="w-5 h-5" />
                  <span>Generate Negotiation Strategy</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Market Analysis Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-4 bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30"
            >
              <TrendingDown className="w-5 h-5 text-red-400 mb-2" />
              <p className="text-xs text-gray-400">Your Offer</p>
              <p className="text-2xl font-bold">${parseInt(offeredSalary).toLocaleString()}</p>
              <p className="text-xs text-red-400">{negotiationData.marketAnalysis?.percentileRank}th percentile</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-4 bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30"
            >
              <Target className="w-5 h-5 text-green-400 mb-2" />
              <p className="text-xs text-gray-400">Recommended Ask</p>
              <p className="text-2xl font-bold text-green-400">${negotiationData.anchorSalary?.recommendedAsk?.toLocaleString()}</p>
              <p className="text-xs text-green-400">+${(negotiationData.anchorSalary?.recommendedAsk - parseInt(offeredSalary)).toLocaleString()}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30"
            >
              <Award className="w-5 h-5 text-blue-400 mb-2" />
              <p className="text-xs text-gray-400">Market Median</p>
              <p className="text-2xl font-bold">${negotiationData.marketAnalysis?.salaryRange?.median?.toLocaleString()}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-4 bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30"
            >
              <Shield className="w-5 h-5 text-purple-400 mb-2" />
              <p className="text-xs text-gray-400">Walk Away #</p>
              <p className="text-2xl font-bold">${negotiationData.anchorSalary?.walkAwayNumber?.toLocaleString()}</p>
            </motion.div>
          </div>

          {/* Market Salary Range */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <BarChart className="w-5 h-5 mr-2 text-green-400" />
              Market Salary Range for {jobTitle}
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={salaryRangeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" tick={{ fontSize: 11 }} />
                <YAxis stroke="#9CA3AF" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v/1000)}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                  formatter={(value) => [`$${value?.toLocaleString()}`, 'Salary']}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {salaryRangeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-sm text-gray-300">{negotiationData.marketAnalysis?.marketInsights}</p>
            </div>
          </motion.div>

          {/* Anchor Salary Strategy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30"
          >
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-green-400" />
              Your Anchor Salary Strategy
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-lg text-center">
                <p className="text-xs text-gray-400 mb-1">Ideal Target</p>
                <p className="text-2xl font-bold text-green-400">${negotiationData.anchorSalary?.idealTarget?.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg text-center">
                <p className="text-xs text-gray-400 mb-1">Recommended Ask</p>
                <p className="text-2xl font-bold text-blue-400">${negotiationData.anchorSalary?.recommendedAsk?.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-orange-500/20 border border-orange-500/30 rounded-lg text-center">
                <p className="text-xs text-gray-400 mb-1">Minimum Acceptable</p>
                <p className="text-2xl font-bold text-orange-400">${negotiationData.anchorSalary?.minimumAcceptable?.toLocaleString()}</p>
              </div>
            </div>
            <div className="p-4 bg-white/5 rounded-lg mb-3">
              <h4 className="text-sm font-semibold mb-2 flex items-center">
                <Brain className="w-4 h-4 mr-2 text-green-400" />
                Strategic Rationale
              </h4>
              <p className="text-sm text-gray-300">{negotiationData.anchorSalary?.rationale}</p>
            </div>
            <div className="flex items-center space-x-2 mb-3">
              <span className={`px-3 py-1 rounded text-xs font-medium ${negotiationData.anchorSalary?.confidenceLevel === 'high' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                {negotiationData.anchorSalary?.confidenceLevel} confidence
              </span>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-2">Supporting Data Points:</h4>
              <div className="space-y-1">
                {negotiationData.anchorSalary?.dataPoints?.map((point, i) => (
                  <div key={i} className="flex items-start text-xs text-gray-400">
                    <CheckCircle className="w-3 h-3 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                    {point}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Negotiation Scripts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-blue-400" />
              Ready-to-Use Negotiation Scripts
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Email Script */}
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-blue-400" />
                    Email Response
                  </h4>
                  <button
                    onClick={() => copyToClipboard(negotiationData.negotiationScripts?.initialResponse?.body || '')}
                    className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </button>
                </div>
                <div className="p-3 bg-white/5 rounded text-xs mb-3">
                  <p className="text-gray-500 mb-2">Subject: {negotiationData.negotiationScripts?.initialResponse?.subject}</p>
                  <p className="text-gray-300 whitespace-pre-wrap">{negotiationData.negotiationScripts?.initialResponse?.body}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold mb-1">Key Phrases:</p>
                  <div className="flex flex-wrap gap-1">
                    {negotiationData.negotiationScripts?.initialResponse?.keyPhrases?.map((phrase, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">{phrase}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Phone Script */}
              <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-purple-400" />
                    Phone Conversation
                  </h4>
                  <button
                    onClick={() => copyToClipboard(Object.values(negotiationData.negotiationScripts?.phoneScript || {}).join('\n\n'))}
                    className="flex items-center space-x-1 px-2 py-1 text-xs bg-purple-500/20 text-purple-400 rounded hover:bg-purple-500/30"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </button>
                </div>
                <div className="space-y-2 text-xs">
                  {Object.entries(negotiationData.negotiationScripts?.phoneScript || {}).map(([key, value], i) => (
                    <div key={i} className="p-2 bg-white/5 rounded">
                      <p className="text-purple-400 font-semibold mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}:</p>
                      <p className="text-gray-300">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Counter-Offer Responses */}
            <div className="mt-4 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
              <h4 className="font-bold mb-3 flex items-center">
                <FileText className="w-4 h-4 mr-2 text-orange-400" />
                Counter-Offer Response Scripts
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {Object.entries(negotiationData.negotiationScripts?.counterOfferResponse || {}).map(([key, value], i) => (
                  <div key={i} className="p-3 bg-white/5 rounded">
                    <p className="text-xs font-semibold text-orange-400 mb-2">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                    <p className="text-xs text-gray-300">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Benefits Trade-off Strategy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2 text-yellow-400" />
              Benefits Trade-off Strategy
            </h3>
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-2">Benefit</th>
                    <th className="text-right py-3 px-2">$ Value</th>
                    <th className="text-center py-3 px-2">Ease to Negotiate</th>
                    <th className="text-center py-3 px-2">Impact</th>
                    <th className="text-left py-3 px-2">Negotiation Tip</th>
                  </tr>
                </thead>
                <tbody>
                  {negotiationData.benefitsTradeof?.priorityMatrix?.map((item, idx) => (
                    <motion.tr
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-b border-white/5 hover:bg-white/5"
                    >
                      <td className="py-3 px-2 font-medium">{item.benefit}</td>
                      <td className="py-3 px-2 text-right text-green-400">${item.valueDollar?.toLocaleString()}</td>
                      <td className="py-3 px-2 text-center">
                        <span className={`px-2 py-1 rounded text-xs ${getEasinessColor(item.easinessToNegotiate).bg} ${getEasinessColor(item.easinessToNegotiate).text} border ${getEasinessColor(item.easinessToNegotiate).border}`}>
                          {item.easinessToNegotiate}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className={`text-xs ${item.impactOnTotal === 'high' ? 'text-green-400' : item.impactOnTotal === 'medium' ? 'text-yellow-400' : 'text-gray-400'}`}>
                          {item.impactOnTotal}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-xs text-gray-400">{item.negotiationTip}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <h4 className="text-sm font-semibold mb-2 text-blue-400">Package Optimization</h4>
                <p className="text-xs text-gray-300">{negotiationData.benefitsTradeof?.packageOptimization}</p>
              </div>
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <h4 className="text-sm font-semibold mb-2 text-green-400">Non-Monetary Wins</h4>
                <div className="space-y-1">
                  {negotiationData.benefitsTradeof?.nonMonetaryWins?.map((win, i) => (
                    <div key={i} className="flex items-center text-xs text-gray-300">
                      <CheckCircle className="w-3 h-3 text-green-400 mr-2" />
                      {win}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Common Recruiter Tactics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/30"
          >
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
              Common Recruiter Tactics & Counter-Strategies
            </h3>
            <div className="space-y-3">
              {negotiationData.recruiterTactics?.map((tactic, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-4 bg-white/5 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold text-red-400">{tactic.tactic}</h4>
                    <Shield className="w-4 h-4 text-orange-400" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-gray-500 mb-1">What they say:</p>
                      <p className="text-gray-300 mb-2">"{tactic.description}"</p>
                      <p className="text-gray-500 mb-1">Their intent:</p>
                      <p className="text-gray-300">{tactic.intent}</p>
                    </div>
                    <div>
                      <p className="text-green-400 mb-1">Your counter-strategy:</p>
                      <p className="text-gray-300 mb-2">{tactic.counterStrategy}</p>
                      <p className="text-blue-400 mb-1">Example response:</p>
                      <p className="text-gray-300 italic p-2 bg-blue-500/10 border border-blue-500/30 rounded">"{tactic.exampleResponse}"</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Timeline & Psychological Tactics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Negotiation Timeline */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-400" />
                7-Day Negotiation Timeline
              </h3>
              <div className="space-y-3">
                {Object.entries(negotiationData.negotiationTimeline || {}).map(([day, info], i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-400">{day.replace(/([A-Z])/g, ' $1').trim()}</p>
                      <p className="text-sm font-medium">{info.action}</p>
                      <p className="text-xs text-gray-500">Goal: {info.goal}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Psychological Tactics */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <Brain className="w-5 h-5 mr-2 text-purple-400" />
                Psychological Tactics
              </h3>
              <div className="space-y-3">
                {negotiationData.psychologicalTactics?.map((tactic, i) => (
                  <div key={i} className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                    <h4 className="text-sm font-bold text-purple-400 mb-2">{tactic.tactic}</h4>
                    <p className="text-xs text-gray-400 mb-1"><span className="font-semibold">When:</span> {tactic.when}</p>
                    <p className="text-xs text-gray-400"><span className="font-semibold">How:</span> {tactic.how}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-bold mb-2 flex items-center text-red-400">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Red Flags
                </h4>
                <div className="space-y-2">
                  {negotiationData.redFlags?.map((flag, i) => (
                    <div key={i} className="p-2 bg-red-500/10 border border-red-500/30 rounded text-xs">
                      <p className="font-semibold text-red-400">{flag.warning}</p>
                      <p className="text-gray-400">{flag.meaning}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Confidence Builders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30"
          >
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-green-400" />
              Confidence Builders - You've Got This!
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {negotiationData.confidenceBuilders?.map((builder, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start space-x-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg"
                >
                  <Zap className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-300">{builder}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Success Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-blue-400" />
              Define Your Success
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {Object.entries(negotiationData.successMetrics || {}).map(([key, value], i) => (
                <div key={i} className={`p-4 rounded-lg border ${
                  key === 'excellent' ? 'bg-green-500/10 border-green-500/30' :
                  key === 'good' ? 'bg-blue-500/10 border-blue-500/30' :
                  key === 'acceptable' ? 'bg-yellow-500/10 border-yellow-500/30' :
                  'bg-red-500/10 border-red-500/30'
                }`}>
                  <p className="text-xs font-bold uppercase mb-2 ${
                    key === 'excellent' ? 'text-green-400' :
                    key === 'good' ? 'text-blue-400' :
                    key === 'acceptable' ? 'text-yellow-400' :
                    'text-red-400'
                  }">{key}</p>
                  <p className="text-xs text-gray-300">{value}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Reset Button */}
          <button
            onClick={() => setNegotiationData(null)}
            className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Generate New Strategy</span>
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default SalaryNegotiationAssistant;
