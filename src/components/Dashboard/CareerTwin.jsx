import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Plot from 'react-plotly.js';
import { useAuth } from '../../contexts/AuthContext';
import careerTwinService from '../../services/ai/careerTwinService';
import { 
  Brain, 
  Plus, 
  TrendingUp, 
  Target, 
  Sparkles,
  RefreshCw,
  Star,
  Zap,
  Award,
  AlertTriangle,
  Briefcase,
  DollarSign,
  CheckCircle,
  ArrowRight,
  Shield,
  Rocket,
  BookOpen,
  User,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import toast from 'react-hot-toast';

const CareerTwin = () => {
  const { currentUser, userProfile } = useAuth();
  const [careerTwin, setCareerTwin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expandedRole, setExpandedRole] = useState(null);
  
  // Form inputs
  const [formData, setFormData] = useState({
    education: '',
    skills: '',
    experience: '',
    interests: '',
    goals: ''
  });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        education: userProfile.education || '',
        skills: (userProfile.skills || []).join(', '),
        experience: userProfile.experience || '',
        interests: (userProfile.interests || []).join(', '),
        goals: userProfile.goals || ''
      });
      loadCareerTwin();
    } else {
      setLoading(false);
      setShowForm(true);
    }
  }, [userProfile]);

  const loadCareerTwin = async () => {
    try {
      setLoading(true);
      setGenerating(true);
      
      const profileData = {
        education: formData.education || userProfile?.education,
        skills: formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(Boolean) : userProfile?.skills || [],
        experience: formData.experience || userProfile?.experience,
        interests: formData.interests ? formData.interests.split(',').map(s => s.trim()).filter(Boolean) : userProfile?.interests || [],
        goals: formData.goals || userProfile?.goals
      };
      
      console.log('Loading career twin with profile:', profileData);
      
      const result = await careerTwinService.generateCareerTwin(profileData);
      
      if (result) {
        setCareerTwin({
          userId: currentUser?.uid,
          profile: result,
          userData: profileData
        });
        toast.success('🤖 AI Career Twin generated successfully!');
        setShowForm(false);
      }
    } catch (error) {
      console.error('Error loading career twin:', error);
      toast.error('Using fallback data');
      setCareerTwin({
        userId: currentUser?.uid,
        profile: careerTwinService.getFallbackData(userProfile),
        userData: userProfile || {}
      });
    } finally {
      setLoading(false);
      setGenerating(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.skills.trim()) {
      toast.error('Please enter at least some skills');
      return;
    }
    loadCareerTwin();
  };

  // Plotly: Strength Radar Chart
  const getStrengthRadarData = () => {
    const scores = careerTwin?.profile?.strengthsAndDifferentiators?.strengthScores || {};
    const categories = ['Technical', 'Soft Skills', 'Domain', 'Leadership', 'Innovation', 'Communication'];
    const values = [
      scores.technical || 50,
      scores.softSkills || 50,
      scores.domainExpertise || 50,
      scores.leadership || 50,
      scores.innovation || 50,
      scores.communication || 50
    ];
    
    return [{
      type: 'scatterpolar',
      r: [...values, values[0]],
      theta: [...categories, categories[0]],
      fill: 'toself',
      fillcolor: 'rgba(99, 102, 241, 0.3)',
      line: { color: '#818cf8', width: 2 },
      marker: { size: 8, color: '#818cf8' },
      name: 'Your Strengths'
    }];
  };

  // Plotly: Role Suitability Bar Chart
  const getRoleSuitabilityData = () => {
    const roles = careerTwin?.profile?.roleSuitability || [];
    return [{
      type: 'bar',
      x: roles.map(r => r.suitabilityScore),
      y: roles.map(r => r.role),
      orientation: 'h',
      marker: {
        color: roles.map(r => {
          if (r.suitabilityScore >= 85) return '#10b981';
          if (r.suitabilityScore >= 70) return '#3b82f6';
          return '#f59e0b';
        }),
        line: { color: 'rgba(255,255,255,0.2)', width: 1 }
      },
      text: roles.map(r => `${r.suitabilityScore}%`),
      textposition: 'outside',
      hovertemplate: '<b>%{y}</b><br>Score: %{x}%<extra></extra>'
    }];
  };

  // Plotly: Market Demand Forecast Line Chart
  const getMarketDemandData = () => {
    const forecast = careerTwin?.profile?.growthPotential?.marketDemandForecast || {};
    return [{
      type: 'scatter',
      mode: 'lines+markers',
      x: ['Now', '6 Months', '1 Year', '2 Years', '5 Years'],
      y: [
        forecast.current || 70,
        forecast.sixMonths || 75,
        forecast.oneYear || 78,
        forecast.twoYears || 82,
        forecast.fiveYears || 85
      ],
      line: { color: '#10b981', width: 3, shape: 'spline' },
      marker: { size: 10, color: '#10b981' },
      fill: 'tozeroy',
      fillcolor: 'rgba(16, 185, 129, 0.1)',
      name: 'Market Demand'
    }];
  };

  // Plotly: Risk Factors Gauge
  const getRiskGaugeData = () => {
    const risks = careerTwin?.profile?.riskFactorsAndImprovements?.riskScores || {};
    const categories = ['Automation', 'Saturation', 'Obsolescence', 'Competition'];
    const values = [
      risks.automationRisk || 30,
      risks.marketSaturation || 40,
      risks.skillObsolescence || 35,
      risks.competitionLevel || 50
    ];
    
    return [{
      type: 'bar',
      x: categories,
      y: values,
      marker: {
        color: values.map(v => {
          if (v >= 60) return '#ef4444';
          if (v >= 40) return '#f59e0b';
          return '#10b981';
        })
      },
      text: values.map(v => `${v}%`),
      textposition: 'outside',
      hovertemplate: '<b>%{x}</b><br>Risk: %{y}%<extra></extra>'
    }];
  };

  // Plotly: Skill Proficiency Pie
  const getSkillPieData = () => {
    const prof = careerTwin?.profile?.skillProficiency || {};
    return [{
      type: 'pie',
      values: [prof.technical || 70, prof.soft || 65, prof.domain || 55, prof.leadership || 50],
      labels: ['Technical', 'Soft Skills', 'Domain', 'Leadership'],
      marker: {
        colors: ['#818cf8', '#10b981', '#f59e0b', '#ec4899']
      },
      hole: 0.4,
      textinfo: 'label+percent',
      textposition: 'outside',
      hovertemplate: '<b>%{label}</b><br>%{value}%<extra></extra>'
    }];
  };

  const plotLayout = {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { color: '#9ca3af', family: 'Inter, sans-serif' },
    margin: { t: 40, r: 30, b: 40, l: 120 },
    xaxis: { gridcolor: 'rgba(156, 163, 175, 0.1)' },
    yaxis: { gridcolor: 'rgba(156, 163, 175, 0.1)' }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Brain className="w-16 h-16 text-purple-500" />
        </motion.div>
        <p className="text-xl font-semibold gradient-text">Generating Your AI Career Twin...</p>
        <p className="text-gray-500">Analyzing skills, market trends, and career paths</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center">
            <Brain className="w-10 h-10 mr-3 text-purple-500" />
            AI Career Twin
          </h1>
          <p className="text-gray-500 flex items-center">
            <Sparkles className="w-4 h-4 mr-2 text-yellow-500" />
            Your AI-Powered Professional Identity Analysis
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all"
          >
            <User className="w-4 h-4 mr-2" />
            {showForm ? 'Hide Form' : 'Update Profile'}
          </button>
          <button
            onClick={loadCareerTwin}
            disabled={generating}
            className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${generating ? 'animate-spin' : ''}`} />
            Regenerate
          </button>
        </div>
      </motion.div>

      {/* Input Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card p-6 border-2 border-purple-500/30"
          >
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-purple-500" />
              Your Career Profile
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Education</label>
                  <input
                    type="text"
                    value={formData.education}
                    onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                    placeholder="e.g., B.Tech in Computer Science"
                    className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Experience</label>
                  <input
                    type="text"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    placeholder="e.g., 3 years"
                    className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Skills (comma separated) *</label>
                <input
                  type="text"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="e.g., JavaScript, React, Python, Node.js, SQL"
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Interests (comma separated)</label>
                <input
                  type="text"
                  value={formData.interests}
                  onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                  placeholder="e.g., AI/ML, Cloud Computing, Web Development"
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Career Goals</label>
                <textarea
                  value={formData.goals}
                  onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                  placeholder="e.g., Become a senior full-stack developer at a top tech company"
                  rows={2}
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={generating}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg font-semibold transition-all disabled:opacity-50"
              >
                {generating ? '⚡ Generating Career Twin...' : '🚀 Generate AI Career Twin'}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {careerTwin?.profile && (
        <>
          {/* Section 1: Professional Identity Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 border-2 border-purple-500/30 bg-gradient-to-r from-purple-900/20 to-blue-900/20"
          >
            <h2 className="text-2xl font-bold mb-4 flex items-center text-purple-400">
              <User className="w-6 h-6 mr-3" />
              Professional Identity Summary
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold gradient-text mb-2">
                    {careerTwin.profile.professionalIdentity?.archetype || 'Tech Professional'}
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {careerTwin.profile.professionalIdentity?.summary}
                  </p>
                </div>
              </div>
              
              {careerTwin.profile.professionalIdentity?.uniqueValue && (
                <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                  <p className="text-yellow-300 flex items-start">
                    <Sparkles className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                    <span><strong>Unique Value:</strong> {careerTwin.profile.professionalIdentity.uniqueValue}</span>
                  </p>
                </div>
              )}
              
              {/* Skills Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                {careerTwin.userData?.skills?.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-purple-500/20 border border-purple-500/50 rounded-full text-sm text-purple-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Section 2: Strengths & Differentiators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 border border-green-500/30"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center text-green-400">
              <Award className="w-6 h-6 mr-3" />
              Strengths & Differentiators
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Bullet Points */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-green-300 mb-3 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Core Strengths
                  </h4>
                  <ul className="space-y-2">
                    {careerTwin.profile.strengthsAndDifferentiators?.coreStrengths?.map((strength, idx) => (
                      <li key={idx} className="flex items-start text-gray-300 text-sm">
                        <span className="text-green-500 mr-2">•</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-blue-300 mb-3 flex items-center">
                    <Shield className="w-4 h-4 mr-2" />
                    Competitive Advantages
                  </h4>
                  <ul className="space-y-2">
                    {careerTwin.profile.strengthsAndDifferentiators?.competitiveAdvantages?.map((adv, idx) => (
                      <li key={idx} className="flex items-start text-gray-300 text-sm">
                        <span className="text-blue-500 mr-2">•</span>
                        {adv}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {careerTwin.profile.strengthsAndDifferentiators?.uniqueSkillCombinations && (
                  <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                    <p className="text-purple-300 text-sm">
                      <strong>💡 Unique Combination:</strong> {careerTwin.profile.strengthsAndDifferentiators.uniqueSkillCombinations}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Right: Plotly Radar Chart */}
              <div>
                <h4 className="font-semibold text-gray-300 mb-2 text-center">Strength Profile</h4>
                <Plot
                  data={getStrengthRadarData()}
                  layout={{
                    ...plotLayout,
                    height: 300,
                    polar: {
                      radialaxis: {
                        visible: true,
                        range: [0, 100],
                        gridcolor: 'rgba(156, 163, 175, 0.2)'
                      },
                      angularaxis: { gridcolor: 'rgba(156, 163, 175, 0.2)' },
                      bgcolor: 'rgba(0,0,0,0)'
                    },
                    showlegend: false
                  }}
                  config={{ responsive: true, displayModeBar: false }}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </motion.div>

          {/* Section 3: Role Suitability Score (Top 5 Roles) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card p-6 border border-blue-500/30"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center text-blue-400">
              <Briefcase className="w-6 h-6 mr-3" />
              Role Suitability Score (Top 5 Roles)
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Plotly Bar Chart */}
              <div>
                <Plot
                  data={getRoleSuitabilityData()}
                  layout={{
                    ...plotLayout,
                    height: 350,
                    xaxis: { ...plotLayout.xaxis, title: 'Suitability Score %', range: [0, 100] },
                    yaxis: { ...plotLayout.yaxis, automargin: true }
                  }}
                  config={{ responsive: true, displayModeBar: false }}
                  style={{ width: '100%' }}
                />
              </div>
              
              {/* Right: Role Details */}
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                {careerTwin.profile.roleSuitability?.map((role, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      expandedRole === idx 
                        ? 'bg-blue-500/20 border-blue-500/50' 
                        : 'bg-white/5 border-white/10 hover:border-blue-500/30'
                    }`}
                    onClick={() => setExpandedRole(expandedRole === idx ? null : idx)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mr-2 ${
                          idx === 0 ? 'bg-yellow-500 text-black' : 'bg-gray-600'
                        }`}>
                          {role.rank}
                        </span>
                        <span className="font-semibold">{role.role}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${
                          role.suitabilityScore >= 85 ? 'text-green-400' :
                          role.suitabilityScore >= 70 ? 'text-blue-400' : 'text-yellow-400'
                        }`}>
                          {role.suitabilityScore}%
                        </span>
                        {expandedRole === idx ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {expandedRole === idx && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 pt-3 border-t border-white/10"
                        >
                          <div className="flex items-center gap-3 mb-2 text-sm">
                            <span className="text-green-400 flex items-center">
                              <DollarSign className="w-3 h-3 mr-1" />
                              {role.salaryRange}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              role.demandLevel === 'high' ? 'bg-green-500/20 text-green-400' :
                              role.demandLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {role.demandLevel?.toUpperCase()} Demand
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm mb-2">
                            <strong className="text-gray-300">Why it fits:</strong> {role.reasoning}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {role.keyMatchingSkills?.map((skill, sIdx) => (
                              <span key={sIdx} className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-xs">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Section 4: Growth Potential Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 border border-cyan-500/30"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center text-cyan-400">
              <TrendingUp className="w-6 h-6 mr-3" />
              Growth Potential Analysis
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Timeline & Bullets */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                    <h4 className="font-semibold text-green-400 mb-1 text-sm flex items-center">
                      <ArrowRight className="w-3 h-3 mr-1" />
                      Short Term (6-12mo)
                    </h4>
                    <p className="text-gray-300 text-xs">{careerTwin.profile.growthPotential?.shortTerm}</p>
                  </div>
                  <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                    <h4 className="font-semibold text-blue-400 mb-1 text-sm flex items-center">
                      <Rocket className="w-3 h-3 mr-1" />
                      Mid Term (2-3yr)
                    </h4>
                    <p className="text-gray-300 text-xs">{careerTwin.profile.growthPotential?.midTerm}</p>
                  </div>
                  <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                    <h4 className="font-semibold text-purple-400 mb-1 text-sm flex items-center">
                      <Star className="w-3 h-3 mr-1" />
                      Long Term (5+yr)
                    </h4>
                    <p className="text-gray-300 text-xs">{careerTwin.profile.growthPotential?.longTerm}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white/5 rounded-lg">
                    <h4 className="font-semibold text-cyan-300 mb-2 text-sm">🚀 Emerging Opportunities</h4>
                    <div className="flex flex-wrap gap-1">
                      {careerTwin.profile.growthPotential?.emergingOpportunities?.map((opp, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 rounded text-xs">
                          {opp}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg">
                    <h4 className="font-semibold text-yellow-300 mb-2 text-sm">📈 Trending Skills</h4>
                    <div className="flex flex-wrap gap-1">
                      {careerTwin.profile.growthPotential?.skillsTrending?.map((skill, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-yellow-500/20 text-yellow-300 rounded text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Salary Growth */}
                {careerTwin.profile.growthPotential?.salaryGrowthPotential && (
                  <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                    <h4 className="font-semibold text-green-400 mb-2 text-sm">💰 Salary Growth Potential</h4>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Current: <span className="text-green-400">{careerTwin.profile.growthPotential.salaryGrowthPotential.currentRange}</span></span>
                      <span className="text-gray-400">2yr: <span className="text-blue-400">{careerTwin.profile.growthPotential.salaryGrowthPotential.potentialIn2Years}</span></span>
                      <span className="text-gray-400">5yr: <span className="text-purple-400">{careerTwin.profile.growthPotential.salaryGrowthPotential.potentialIn5Years}</span></span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Right: Market Demand Chart */}
              <div>
                <h4 className="font-semibold text-gray-300 mb-2 text-center">Market Demand Forecast</h4>
                <Plot
                  data={getMarketDemandData()}
                  layout={{
                    ...plotLayout,
                    height: 280,
                    xaxis: { ...plotLayout.xaxis, title: 'Timeline' },
                    yaxis: { ...plotLayout.yaxis, title: 'Demand Score', range: [0, 100] },
                    showlegend: false
                  }}
                  config={{ responsive: true, displayModeBar: false }}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </motion.div>

          {/* Section 5: Risk Factors & Improvement Areas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-card p-6 border border-orange-500/30"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center text-orange-400">
              <AlertTriangle className="w-6 h-6 mr-3" />
              Risk Factors & Improvement Areas
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Risk Chart */}
              <div>
                <h4 className="font-semibold text-gray-300 mb-2 text-center">Risk Assessment</h4>
                <Plot
                  data={getRiskGaugeData()}
                  layout={{
                    ...plotLayout,
                    height: 250,
                    xaxis: { ...plotLayout.xaxis },
                    yaxis: { ...plotLayout.yaxis, title: 'Risk %', range: [0, 100] },
                    showlegend: false
                  }}
                  config={{ responsive: true, displayModeBar: false }}
                  style={{ width: '100%' }}
                />
              </div>
              
              {/* Right: Bullet Points */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-red-400 mb-2 flex items-center text-sm">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Market Risks
                  </h4>
                  <ul className="space-y-1">
                    {careerTwin.profile.riskFactorsAndImprovements?.marketRisks?.map((risk, idx) => (
                      <li key={idx} className="flex items-start text-gray-300 text-xs">
                        <span className="text-red-500 mr-2">•</span>
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-yellow-400 mb-2 flex items-center text-sm">
                    <Target className="w-4 h-4 mr-2" />
                    Skill Gaps to Address
                  </h4>
                  <ul className="space-y-1">
                    {careerTwin.profile.riskFactorsAndImprovements?.skillGaps?.map((gap, idx) => (
                      <li key={idx} className="flex items-start text-gray-300 text-xs">
                        <span className="text-yellow-500 mr-2">•</span>
                        {gap}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-orange-400 mb-2 flex items-center text-sm">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Improvement Areas
                  </h4>
                  <ul className="space-y-1">
                    {careerTwin.profile.riskFactorsAndImprovements?.improvementAreas?.map((area, idx) => (
                      <li key={idx} className="flex items-start text-gray-300 text-xs">
                        <span className="text-orange-500 mr-2">•</span>
                        {area}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Urgent Upskilling */}
            {careerTwin.profile.riskFactorsAndImprovements?.urgentUpskilling && (
              <div className="mt-4 p-4 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-lg border border-red-500/30">
                <h4 className="font-semibold text-red-400 mb-3 text-sm">⚡ Urgent Upskilling Required</h4>
                <div className="flex flex-wrap gap-2">
                  {careerTwin.profile.riskFactorsAndImprovements.urgentUpskilling.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Additional Visualizations Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Skill Proficiency Pie */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-6"
            >
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                Skill Proficiency Breakdown
              </h3>
              <Plot
                data={getSkillPieData()}
                layout={{
                  ...plotLayout,
                  height: 300,
                  showlegend: true,
                  legend: { orientation: 'h', y: -0.1 }
                }}
                config={{ responsive: true, displayModeBar: false }}
                style={{ width: '100%' }}
              />
            </motion.div>

            {/* Action Plan */}
            {careerTwin.profile.actionPlan && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="glass-card p-6 bg-gradient-to-r from-purple-900/20 to-blue-900/20"
              >
                <h3 className="text-xl font-bold mb-4 flex items-center text-purple-400">
                  <Rocket className="w-5 h-5 mr-2" />
                  Your Action Plan
                </h3>
                <div className="space-y-3">
                  {careerTwin.profile.actionPlan.map((action, idx) => (
                    <div
                      key={idx}
                      className="flex items-start p-3 bg-white/5 rounded-lg border border-white/10"
                    >
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center mr-3 flex-shrink-0 text-sm font-bold ${
                        idx === 0 ? 'bg-green-500' : idx === 1 ? 'bg-blue-500' : 'bg-purple-500'
                      }`}>
                        {idx + 1}
                      </span>
                      <div>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          idx === 0 ? 'bg-green-500/20 text-green-400' : 
                          idx === 1 ? 'bg-blue-500/20 text-blue-400' : 
                          'bg-purple-500/20 text-purple-400'
                        }`}>
                          {idx === 0 ? 'Immediate' : idx === 1 ? 'Short-term' : 'Medium-term'}
                        </span>
                        <p className="text-gray-300 text-sm mt-1">{action}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CareerTwin;
