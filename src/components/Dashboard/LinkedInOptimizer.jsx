import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Linkedin, TrendingUp, AlertCircle, CheckCircle, Copy, 
  Loader2, Sparkles, User, FileText, Target, Search,
  Star, Award, Briefcase, Hash, CheckCircle2, Info,
  ChevronDown, ChevronUp, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

// API Configuration for LinkedIn Optimizer
const GEMINI_API_KEY = 'AIzaSyBuItEE5gve23iLdeGKPEtNhgR98CVg35o';
const MODEL_NAME = 'gemini-2.5-flash';

const LinkedInOptimizer = () => {
  const [currentHeadline, setCurrentHeadline] = useState('');
  const [currentAbout, setCurrentAbout] = useState('');
  const [currentExperience, setCurrentExperience] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [industry, setIndustry] = useState('');
  const [skills, setSkills] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});

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

  const optimizeProfile = async () => {
    if (!targetRole.trim()) {
      toast.error('Please enter your target role');
      return;
    }

    setLoading(true);

    const prompt = `Optimize LinkedIn profile for ${targetRole} in ${industry || 'Tech'} industry.

Current Profile:
- Headline: ${currentHeadline || 'Not provided'}
- About: ${currentAbout || 'Not provided'}
- Experience bullets: ${currentExperience || 'Not provided'}
- Skills: ${skills || 'General skills'}

Generate LinkedIn optimizations. Return JSON only:
{
  "profileScore": {"current": 65, "potential": 92},
  "headline": {
    "optimized": "A powerful 220-character max headline with keywords, value proposition, and target role. Use | or • separators. Example: Senior Software Engineer | React & Node.js Expert | Building Scalable SaaS Products | Open to Opportunities",
    "charCount": 180,
    "keywords": ["keyword1", "keyword2", "keyword3"],
    "tips": ["Tip 1", "Tip 2"]
  },
  "aboutSection": {
    "optimized": "A compelling 2000-character About section with: Hook (first 2 lines visible), Story (your journey), Value (what you bring), Keywords naturally woven in, Call to action. Write in first person, be authentic and engaging. Include line breaks for readability.",
    "structure": {
      "hook": "Attention-grabbing opening line",
      "story": "Your professional journey paragraph",
      "value": "What unique value you bring",
      "achievements": "Key accomplishments with metrics",
      "cta": "Call to action for recruiters"
    },
    "keywordsIncluded": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
  },
  "experienceRewrites": [
    {
      "original": "Worked on software projects",
      "optimized": "Spearheaded development of 5+ enterprise applications using React and Node.js, reducing load time by 40% and increasing user engagement by 25%",
      "improvement": "Added metrics and action verbs"
    },
    {
      "original": "Managed team",
      "optimized": "Led cross-functional team of 8 engineers, delivering $2M project 15% under budget while maintaining 99.9% uptime",
      "improvement": "Quantified impact"
    },
    {
      "original": "Developed features",
      "optimized": "Architected and deployed microservices infrastructure processing 1M+ daily requests with 99.99% reliability",
      "improvement": "Technical specificity"
    }
  ],
  "skillsPrioritization": {
    "mustHave": ["Skill 1", "Skill 2", "Skill 3"],
    "highValue": ["Skill 4", "Skill 5", "Skill 6"],
    "emerging": ["Skill 7", "Skill 8"],
    "orderRecommendation": ["Top skill to show first", "Second", "Third"],
    "skillsToAdd": ["Missing skill 1", "Missing skill 2"],
    "skillsToRemove": ["Outdated skill"]
  },
  "recruiterKeywords": {
    "primary": ["keyword1", "keyword2", "keyword3"],
    "secondary": ["keyword4", "keyword5", "keyword6"],
    "longTail": ["long tail keyword 1", "long tail keyword 2"],
    "searchPhrases": ["phrase recruiters search for 1", "phrase 2", "phrase 3"],
    "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"]
  },
  "additionalTips": [
    {"category": "Profile Photo", "tip": "Specific tip"},
    {"category": "Banner", "tip": "Specific tip"},
    {"category": "Featured", "tip": "Specific tip"}
  ]
}

Make all content specific to ${targetRole} role. Headline must be under 220 characters. All outputs should be copy-paste ready.`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.8,
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
        setResult(parsedData);
        toast.success('LinkedIn profile optimized!');
      } else {
        throw new Error('Invalid response');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(`Failed to optimize: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Copyable section component
  const CopyableSection = ({ title, content, icon: Icon, color }) => (
    <div className={`p-4 bg-${color}-500/10 border border-${color}-500/30 rounded-lg`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Icon className={`w-4 h-4 text-${color}-400`} />
          <span className={`text-sm font-semibold text-${color}-400`}>{title}</span>
        </div>
        <button
          onClick={() => copyToClipboard(content, title)}
          className={`flex items-center space-x-1 px-2 py-1 text-xs bg-${color}-500/20 text-${color}-400 rounded hover:bg-${color}-500/30`}
        >
          <Copy className="w-3 h-3" />
          <span>Copy</span>
        </button>
      </div>
      <div className="text-sm text-gray-300 whitespace-pre-line leading-relaxed">
        {content}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          <Linkedin className="inline w-10 h-10 mr-2 text-blue-500" />
          LinkedIn Profile Optimizer
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Optimize your profile for recruiter visibility and engagement
        </p>
      </motion.div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-start space-x-3"
      >
        <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-300">
          <strong>Generates:</strong> Headline (220 chars) • About section with story & keywords • Experience rewrites • Skills prioritization • Recruiter search keywords — All copy-paste ready!
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-6 space-y-4"
        >
          <h3 className="text-xl font-bold mb-4">Your Current Profile</h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-2">
                <Target className="w-4 h-4 inline mr-2" />
                Target Role *
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g., Senior Software Engineer"
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                <Briefcase className="w-4 h-4 inline mr-2" />
                Industry
              </label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g., Technology, Finance"
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Current Headline
            </label>
            <input
              type="text"
              value={currentHeadline}
              onChange={(e) => setCurrentHeadline(e.target.value)}
              placeholder="Your current LinkedIn headline..."
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Current About Section
            </label>
            <textarea
              value={currentAbout}
              onChange={(e) => setCurrentAbout(e.target.value)}
              placeholder="Paste your current About section..."
              rows={3}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              <Briefcase className="w-4 h-4 inline mr-2" />
              Experience Bullets (to rewrite)
            </label>
            <textarea
              value={currentExperience}
              onChange={(e) => setCurrentExperience(e.target.value)}
              placeholder="Paste your experience bullet points, one per line..."
              rows={3}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              <Star className="w-4 h-4 inline mr-2" />
              Current Skills
            </label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="React, Python, Project Management..."
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <button
            onClick={optimizeProfile}
            disabled={loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Optimizing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Optimize My LinkedIn</span>
              </>
            )}
          </button>
        </motion.div>

        {/* Results Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4 max-h-[800px] overflow-y-auto pr-2"
        >
          {result ? (
            <>
              {/* Profile Score */}
              <div className="glass-card p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Profile Optimization</h3>
                    <p className="text-xs text-gray-400">Current → Potential</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`text-2xl font-bold ${getScoreColor(result.profileScore?.current || 65)}`}>
                      {result.profileScore?.current || 65}%
                    </span>
                    <span className="text-gray-400">→</span>
                    <span className={`text-2xl font-bold ${getScoreColor(result.profileScore?.potential || 92)}`}>
                      {result.profileScore?.potential || 92}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Optimized Headline */}
              <div className="glass-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <h3 className="font-semibold">Optimized Headline</h3>
                    <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded">
                      {result.headline?.charCount || 0}/220 chars
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(result.headline?.optimized, 'Headline')}
                    className="flex items-center space-x-1 px-3 py-1.5 text-xs bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </button>
                </div>
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-sm text-gray-200 font-medium">
                  {result.headline?.optimized}
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {result.headline?.keywords?.map((kw, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">{kw}</span>
                  ))}
                </div>
              </div>

              {/* Optimized About Section */}
              <div className="glass-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-green-400" />
                    <h3 className="font-semibold">Optimized About Section</h3>
                  </div>
                  <button
                    onClick={() => copyToClipboard(result.aboutSection?.optimized, 'About Section')}
                    className="flex items-center space-x-1 px-3 py-1.5 text-xs bg-green-500/20 text-green-400 rounded hover:bg-green-500/30"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy All</span>
                  </button>
                </div>
                
                {/* Structured About */}
                <div className="space-y-2 mb-3">
                  {result.aboutSection?.structure && Object.entries(result.aboutSection.structure).map(([key, value]) => (
                    <div key={key} className="p-2 bg-white/5 rounded border-l-2 border-green-500">
                      <span className="text-xs text-green-400 uppercase font-semibold">{key}:</span>
                      <p className="text-xs text-gray-300 mt-1">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Full About */}
                <button
                  onClick={() => toggleSection('about')}
                  className="flex items-center space-x-1 text-xs text-blue-400 mb-2"
                >
                  {expandedSections.about ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  <span>{expandedSections.about ? 'Hide' : 'Show'} Full About</span>
                </button>
                {expandedSections.about && (
                  <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-sm text-gray-300 whitespace-pre-line">
                    {result.aboutSection?.optimized}
                  </div>
                )}

                <div className="mt-2">
                  <span className="text-xs text-gray-400">Keywords included:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {result.aboutSection?.keywordsIncluded?.map((kw, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded">{kw}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Experience Rewrites */}
              <div className="glass-card p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Briefcase className="w-5 h-5 text-purple-400" />
                  <h3 className="font-semibold">Experience Bullet Rewrites</h3>
                </div>
                <div className="space-y-3">
                  {result.experienceRewrites?.map((item, index) => (
                    <div key={index} className="p-3 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xs text-red-400 line-through">{item.original}</span>
                      </div>
                      <div className="flex items-start justify-between">
                        <p className="text-sm text-green-400 flex-1 pr-2">{item.optimized}</p>
                        <button
                          onClick={() => copyToClipboard(item.optimized, 'Bullet')}
                          className="flex-shrink-0 p-1 text-gray-400 hover:text-white"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-xs text-gray-500 mt-1 block">✓ {item.improvement}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills Prioritization */}
              <div className="glass-card p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Star className="w-5 h-5 text-orange-400" />
                  <h3 className="font-semibold">Skills Prioritization</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-red-400 font-semibold mb-1">🔥 Must-Have (Top 3)</p>
                    <div className="space-y-1">
                      {result.skillsPrioritization?.mustHave?.map((skill, i) => (
                        <div key={i} className="flex items-center justify-between text-xs p-1.5 bg-red-500/10 rounded">
                          <span>{skill}</span>
                          <button onClick={() => copyToClipboard(skill, 'Skill')} className="text-gray-400 hover:text-white">
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-yellow-400 font-semibold mb-1">⭐ High-Value</p>
                    <div className="space-y-1">
                      {result.skillsPrioritization?.highValue?.map((skill, i) => (
                        <div key={i} className="flex items-center justify-between text-xs p-1.5 bg-yellow-500/10 rounded">
                          <span>{skill}</span>
                          <button onClick={() => copyToClipboard(skill, 'Skill')} className="text-gray-400 hover:text-white">
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {result.skillsPrioritization?.skillsToAdd?.length > 0 && (
                  <div className="mt-3 p-2 bg-green-500/10 border border-green-500/30 rounded">
                    <p className="text-xs text-green-400 font-semibold mb-1">➕ Skills to Add:</p>
                    <div className="flex flex-wrap gap-1">
                      {result.skillsPrioritization.skillsToAdd.map((skill, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded cursor-pointer" onClick={() => copyToClipboard(skill, 'Skill')}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Recruiter Search Keywords */}
              <div className="glass-card p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Search className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-semibold">Recruiter Search Keywords</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-cyan-400 font-semibold mb-1">🎯 Primary Keywords</p>
                    <div className="flex flex-wrap gap-1">
                      {result.recruiterKeywords?.primary?.map((kw, i) => (
                        <span key={i} className="text-xs px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded cursor-pointer hover:bg-cyan-500/30" onClick={() => copyToClipboard(kw, 'Keyword')}>
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-blue-400 font-semibold mb-1">🔍 Search Phrases Recruiters Use</p>
                    <div className="space-y-1">
                      {result.recruiterKeywords?.searchPhrases?.map((phrase, i) => (
                        <div key={i} className="flex items-center justify-between text-xs p-2 bg-blue-500/10 rounded">
                          <span>"{phrase}"</span>
                          <button onClick={() => copyToClipboard(phrase, 'Phrase')} className="text-gray-400 hover:text-white">
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-purple-400 font-semibold mb-1"># Hashtags for Posts</p>
                    <div className="flex flex-wrap gap-1">
                      {result.recruiterKeywords?.hashtags?.map((tag, i) => (
                        <span key={i} className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded cursor-pointer hover:bg-purple-500/30" onClick={() => copyToClipboard(tag, 'Hashtag')}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(
                    [...(result.recruiterKeywords?.primary || []), ...(result.recruiterKeywords?.secondary || [])].join(', '),
                    'All Keywords'
                  )}
                  className="mt-3 w-full px-3 py-2 text-xs bg-cyan-500/20 text-cyan-400 rounded hover:bg-cyan-500/30 flex items-center justify-center space-x-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy All Keywords</span>
                </button>
              </div>

              {/* Additional Tips */}
              {result.additionalTips?.length > 0 && (
                <div className="glass-card p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <AlertCircle className="w-5 h-5 text-yellow-400" />
                    <h3 className="font-semibold">Additional Tips</h3>
                  </div>
                  <div className="space-y-2">
                    {result.additionalTips.map((tip, i) => (
                      <div key={i} className="flex items-start space-x-2 text-xs p-2 bg-yellow-500/10 rounded">
                        <span className="font-semibold text-yellow-400">{tip.category}:</span>
                        <span className="text-gray-300">{tip.tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="glass-card p-12 text-center h-full flex flex-col items-center justify-center">
              <Linkedin className="w-16 h-16 mx-auto mb-4 text-blue-400" />
              <h3 className="text-lg font-semibold mb-2">Optimize Your LinkedIn</h3>
              <p className="text-sm text-gray-400 mb-4">
                Enter your target role and current profile to get copy-paste ready optimizations
              </p>
              <div className="flex flex-wrap justify-center gap-2 text-xs">
                <span className="px-3 py-1.5 bg-yellow-500/20 text-yellow-400 rounded-full">Headline</span>
                <span className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-full">About Section</span>
                <span className="px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-full">Experience</span>
                <span className="px-3 py-1.5 bg-orange-500/20 text-orange-400 rounded-full">Skills</span>
                <span className="px-3 py-1.5 bg-cyan-500/20 text-cyan-400 rounded-full">Keywords</span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default LinkedInOptimizer;
