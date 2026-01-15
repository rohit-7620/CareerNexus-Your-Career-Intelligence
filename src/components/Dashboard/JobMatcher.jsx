import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import directGeminiService from '../../services/ai/directGeminiService';
import { Target, Search, ExternalLink, TrendingUp, Sparkles, MapPin, Briefcase, Clock, DollarSign, Users, CheckCircle, AlertCircle, Brain } from 'lucide-react';
import toast from 'react-hot-toast';

const JobMatcher = () => {
  const { userProfile } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  
  // User input states
  const [formData, setFormData] = useState({
    skills: [],
    experience: '',
    location: 'India',
    preferences: '',
    goals: ''
  });
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    // Pre-fill from user profile if available
    if (userProfile) {
      setFormData(prev => ({
        ...prev,
        skills: userProfile.skills || [],
        experience: userProfile.experience || '',
        goals: userProfile.goals || ''
      }));
    }
  }, [userProfile]);

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove)
    }));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const findMatches = async () => {
    if (formData.skills.length === 0) {
      toast.error('Please add at least one skill');
      return;
    }

    setLoading(true);
    try {
      console.log('Finding matches with data:', formData);
      const result = await directGeminiService.generateJobMatches(formData);
      console.log('Job matches result:', result);
      
      setMatches(result.matches || []);
      setAnalysis(result.overallAnalysis || null);
      setRecommendations(result.recommendations || []);
      toast.success(`Found ${result.matches?.length || 0} job matches!`);
    } catch (error) {
      console.error('Error finding matches:', error);
      toast.error('Failed to generate job matches');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-yellow-500 to-amber-500';
    return 'from-red-500 to-rose-500';
  };

  const getDemandColor = (level) => {
    if (level === 'high') return 'text-green-500';
    if (level === 'medium') return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          <Target className="inline w-10 h-10 mr-2 text-blue-500 animate-pulse" />
          AI Job Matcher
        </h1>
        <p className="text-gray-600 dark:text-gray-400 flex items-center">
          <Brain className="w-4 h-4 mr-2 text-purple-500" />
          Get personalized job matches powered by Gemini AI
        </p>
      </motion.div>

      {/* Input Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 border-2 border-purple-500/30"
      >
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <Sparkles className="w-6 h-6 mr-2 text-purple-500" />
          Your Profile
        </h2>

        <div className="space-y-4">
          {/* Skills Input */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Your Skills *
            </label>
            <form onSubmit={handleAddSkill} className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="Add a skill (e.g., React, Python, AWS)"
                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium"
              >
                Add
              </button>
            </form>
            <div className="flex flex-wrap gap-2 mt-3">
              {formData.skills.map((skill, idx) => (
                <motion.span
                  key={idx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="skill-pill bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center gap-2"
                >
                  {skill}
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-red-400 hover:text-red-300"
                  >
                    ✕
                  </button>
                </motion.span>
              ))}
            </div>
          </div>

          {/* Experience Level */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                <Briefcase className="inline w-4 h-4 mr-1" />
                Experience Level
              </label>
              <select
                value={formData.experience}
                onChange={(e) => handleInputChange('experience', e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500"
              >
                <option value="">Select experience</option>
                <option value="fresher">Fresher (0-1 years)</option>
                <option value="entry">Entry Level (1-3 years)</option>
                <option value="mid">Mid Level (3-5 years)</option>
                <option value="senior">Senior (5-8 years)</option>
                <option value="lead">Lead (8+ years)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                <MapPin className="inline w-4 h-4 mr-1" />
                Location Preference
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="e.g., Bangalore, Remote, USA"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Job Preferences */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              <Users className="inline w-4 h-4 mr-1" />
              Job Preferences
            </label>
            <input
              type="text"
              value={formData.preferences}
              onChange={(e) => handleInputChange('preferences', e.target.value)}
              placeholder="e.g., Remote work, Startup culture, Product-based company"
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Career Goals */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              <Target className="inline w-4 h-4 mr-1" />
              Career Goals
            </label>
            <textarea
              value={formData.goals}
              onChange={(e) => handleInputChange('goals', e.target.value)}
              placeholder="What are your career aspirations?"
              rows={3}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Find Matches Button */}
          <button
            onClick={findMatches}
            disabled={loading || formData.skills.length === 0}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg font-semibold text-lg flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Brain className="w-5 h-5 animate-pulse" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span>Find Perfect Matches</span>
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Analysis Section */}
      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card p-6 border-2 border-blue-500/30"
          >
            <h3 className="text-xl font-bold mb-3 flex items-center">
              <Brain className="w-6 h-6 mr-2 text-blue-500" />
              Market Analysis
            </h3>
            <p className="text-gray-700 dark:text-gray-300">{analysis}</p>
          </motion.div>
        )}

        {recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card p-6 border-2 border-green-500/30"
          >
            <h3 className="text-xl font-bold mb-3 flex items-center">
              <Sparkles className="w-6 h-6 mr-2 text-green-500" />
              Recommendations
            </h3>
            <ul className="space-y-2">
              {recommendations.map((rec, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-start text-sm"
                >
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{rec}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Job Matches */}
      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-12 flex flex-col items-center justify-center"
        >
          <Brain className="w-12 h-12 text-purple-500 animate-pulse mb-4" />
          <p className="text-lg font-semibold">AI is analyzing your profile...</p>
          <p className="text-sm text-gray-500 mt-2">Finding the best job matches for you</p>
        </motion.div>
      ) : matches.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center">
            <Sparkles className="w-6 h-6 mr-2 text-yellow-500" />
            {matches.length} Perfect Matches Found
          </h2>
          
          <div className="grid grid-cols-1 gap-6">
            {matches.map((job, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6 hover:shadow-glass-hover transition-all border-2 border-transparent hover:border-purple-500/30"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2 gradient-text">{job.role}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      <DollarSign className="inline w-4 h-4" /> {job.salaryRange} • 
                      <Clock className="inline w-4 h-4 ml-2" /> {job.estimatedTimeToReady} to ready
                    </p>
                    {job.jobDescription && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 italic mb-3">
                        {job.jobDescription}
                      </p>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <div className={`inline-block px-4 py-2 rounded-full bg-gradient-to-r ${getScoreColor(job.readinessScore)} text-white font-bold text-lg mb-2`}>
                      {job.readinessScore}%
                    </div>
                    <p className="text-sm text-gray-500">Readiness</p>
                  </div>
                </div>

                {job.whyGoodFit && (
                  <div className="mb-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <p className="text-sm flex items-start">
                      <CheckCircle className="w-4 h-4 mr-2 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Why you're a great fit:</strong> {job.whyGoodFit}</span>
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-500 mb-2 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                      Matching Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {job.matchingSkills?.map((skill, i) => (
                        <motion.span
                          key={i}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.1 + i * 0.05 }}
                          className="skill-pill bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                        >
                          {skill}
                        </motion.span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm text-gray-500 mb-2 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1 text-orange-500" />
                      Skills to Learn
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {job.missingSkills?.map((skill, i) => (
                        <motion.span
                          key={i}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.1 + i * 0.05 }}
                          className="skill-pill bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                        >
                          {skill}
                        </motion.span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm text-gray-500 mb-2 flex items-center">
                      <Users className="w-4 h-4 mr-1 text-blue-500" />
                      Hiring Companies
                    </h4>
                    <ul className="space-y-1">
                      {job.companies?.map((company, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + i * 0.05 }}
                          className="text-sm flex items-center"
                        >
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                          {company}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    <span className="text-sm">
                      Demand: <span className={`font-semibold ${getDemandColor(job.demandLevel)}`}>
                        {job.demandLevel?.toUpperCase()}
                      </span>
                    </span>
                  </div>
                  
                  {job.applyLink && (
                    <a
                      href={job.applyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg text-sm font-medium flex items-center space-x-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Apply Now</span>
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default JobMatcher;
