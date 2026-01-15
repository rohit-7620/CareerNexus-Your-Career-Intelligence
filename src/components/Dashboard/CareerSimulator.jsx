import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import directGeminiService from '../../services/ai/directGeminiService';
import { 
  Sparkles, DollarSign, Briefcase, Clock, TrendingUp, 
  Shield, Rocket, Target, AlertTriangle, CheckCircle, 
  ChevronRight, Award, Zap, BarChart3, ArrowRight,
  GitBranch, Calendar, GraduationCap
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  Legend, CartesianGrid
} from 'recharts';
import toast from 'react-hot-toast';

const CareerSimulator = () => {
  const { userProfile } = useAuth();
  const [skills, setSkills] = useState('');
  const [currentRole, setCurrentRole] = useState('');
  const [experience, setExperience] = useState('mid');
  const [currentSalary, setCurrentSalary] = useState(600000);
  const [targetRole, setTargetRole] = useState('');
  const [simulation, setSimulation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPath, setSelectedPath] = useState(0);

  const runSimulation = async () => {
    if (!skills.trim()) {
      toast.error('Please enter your skills');
      return;
    }

    setLoading(true);
    try {
      const result = await directGeminiService.simulateCareerPaths({
        skills: skills.split(',').map(s => s.trim()),
        currentRole: currentRole || 'Software Developer',
        experience,
        currentSalary: parseInt(currentSalary),
        targetRole: targetRole || 'Senior Engineer',
        interests: 'technology and career growth'
      });
      setSimulation(result);
      toast.success('🎯 5-Year Career Simulation Complete!');
    } catch (error) {
      console.error('Simulation error:', error);
      toast.error('Simulation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getSalaryChartData = () => {
    if (!simulation?.comparison?.salaryComparison) return [];
    return simulation.comparison.salaryComparison.map(item => ({
      year: `Year ${item.year}`,
      Conservative: Math.round(item.conservative / 100000),
      Accelerated: Math.round(item.accelerated / 100000),
      Pivot: Math.round(item.pivot / 100000)
    }));
  };

  const pathColors = {
    Conservative: { bg: 'from-blue-600 to-cyan-600', text: 'text-blue-400', border: 'border-blue-500/30' },
    Accelerated: { bg: 'from-green-600 to-emerald-600', text: 'text-green-400', border: 'border-green-500/30' },
    'Pivot / Alternative': { bg: 'from-purple-600 to-pink-600', text: 'text-purple-400', border: 'border-purple-500/30' }
  };

  const getPathIcon = (pathType) => {
    if (pathType === 'Conservative') return Shield;
    if (pathType === 'Accelerated') return Rocket;
    return GitBranch;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          <Sparkles className="inline w-10 h-10 mr-2 text-purple-500" />
          5-Year Career Simulator
        </h1>
        <p className="text-gray-400">
          Simulate 3 distinct career paths and see your potential future
        </p>
      </div>

      {/* Input Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 border border-primary-500/30"
      >
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2 text-primary-500" />
          Your Profile
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Your Skills (comma-separated)</label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="React, Python, AWS, Machine Learning..."
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-primary-500 focus:outline-none text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Current Role</label>
            <input
              type="text"
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value)}
              placeholder="Software Developer"
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-primary-500 focus:outline-none text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Target/Dream Role</label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="Senior Engineer, Tech Lead..."
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-primary-500 focus:outline-none text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Experience Level</label>
            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-primary-500 focus:outline-none text-white"
            >
              <option value="entry-level">Entry Level (0-2 years)</option>
              <option value="mid">Mid Level (2-5 years)</option>
              <option value="senior">Senior (5-8 years)</option>
              <option value="lead">Lead/Principal (8+ years)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Current Salary (₹/year)</label>
            <input
              type="number"
              value={currentSalary}
              onChange={(e) => setCurrentSalary(e.target.value)}
              placeholder="600000"
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-primary-500 focus:outline-none text-white"
            />
          </div>
        </div>

        <button
          onClick={runSimulation}
          disabled={loading}
          className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 flex items-center justify-center"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              Simulating 5-Year Career Paths...
            </>
          ) : (
            <>
              <Rocket className="w-5 h-5 mr-2" />
              Run 5-Year Career Simulation
            </>
          )}
        </button>
      </motion.div>

      {/* Simulation Results */}
      {simulation && (
        <>
          {/* Path Selector Tabs */}
          <div className="flex flex-wrap gap-4 justify-center">
            {simulation.paths?.map((path, index) => {
              const PathIcon = getPathIcon(path.pathType);
              const colors = pathColors[path.pathType] || pathColors.Conservative;
              return (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedPath(index)}
                  className={`px-6 py-4 rounded-xl border-2 transition-all ${
                    selectedPath === index 
                      ? `bg-gradient-to-r ${colors.bg} border-transparent shadow-lg scale-105` 
                      : `glass-card ${colors.border} hover:scale-102`
                  }`}
                >
                  <div className="flex items-center">
                    <PathIcon className={`w-6 h-6 mr-3 ${selectedPath === index ? 'text-white' : colors.text}`} />
                    <div className="text-left">
                      <p className={`font-bold ${selectedPath === index ? 'text-white' : colors.text}`}>
                        {path.pathType}
                      </p>
                      <p className={`text-sm ${selectedPath === index ? 'text-white/80' : 'text-gray-400'}`}>
                        Risk: {path.riskLevel} | Growth: {path.totalSalaryGrowth}
                      </p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Selected Path Details */}
          <AnimatePresence mode="wait">
            {simulation.paths?.[selectedPath] && (
              <motion.div
                key={selectedPath}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Path Overview Card */}
                <div className={`glass-card p-6 border ${pathColors[simulation.paths[selectedPath].pathType]?.border || 'border-blue-500/30'}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className={`text-2xl font-bold ${pathColors[simulation.paths[selectedPath].pathType]?.text || 'text-blue-400'}`}>
                        {simulation.paths[selectedPath].pathType} Path
                      </h2>
                      <p className="text-gray-300 mt-2">{simulation.paths[selectedPath].pathDescription}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-green-400">+{simulation.paths[selectedPath].totalSalaryGrowth}</p>
                      <p className="text-sm text-gray-400">5-Year Growth</p>
                    </div>
                  </div>

                  {/* Risk vs Reward Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="p-4 bg-white/5 rounded-lg">
                      <p className="text-sm text-gray-400 mb-1">Risk Level</p>
                      <p className={`text-xl font-bold ${
                        simulation.paths[selectedPath].riskLevel === 'Low' ? 'text-green-400' :
                        simulation.paths[selectedPath].riskLevel === 'High' ? 'text-red-400' : 'text-yellow-400'
                      }`}>{simulation.paths[selectedPath].riskLevel}</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-lg">
                      <p className="text-sm text-gray-400 mb-1">Reward Potential</p>
                      <p className="text-xl font-bold text-blue-400">{simulation.paths[selectedPath].rewardPotential}</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-lg">
                      <p className="text-sm text-gray-400 mb-1">Success Probability</p>
                      <p className="text-xl font-bold text-purple-400">{simulation.paths[selectedPath].riskVsRewardAnalysis?.probability || 70}%</p>
                    </div>
                  </div>
                </div>

                {/* Year-wise Timeline Table */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 border border-primary-500/30">
                  <h3 className="text-xl font-bold mb-6 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-primary-500" />
                    5-Year Roles Timeline
                  </h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="py-3 px-4 text-left text-gray-400">Year</th>
                          <th className="py-3 px-4 text-left text-gray-400">Role</th>
                          <th className="py-3 px-4 text-left text-gray-400">Company Type</th>
                          <th className="py-3 px-4 text-left text-gray-400">Salary (₹ LPA)</th>
                          <th className="py-3 px-4 text-left text-gray-400">Key Milestones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {simulation.paths[selectedPath].yearlyProgression?.map((year, idx) => (
                          <motion.tr key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} className="border-b border-white/5 hover:bg-white/5">
                            <td className="py-4 px-4">
                              <span className="px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full font-bold">Year {year.year}</span>
                            </td>
                            <td className="py-4 px-4"><span className="font-semibold text-white">{year.role}</span></td>
                            <td className="py-4 px-4 text-gray-300">{year.company}</td>
                            <td className="py-4 px-4"><span className="text-green-400 font-bold">₹{(year.salary / 100000).toFixed(1)}L</span></td>
                            <td className="py-4 px-4">
                              <div className="flex flex-wrap gap-1">
                                {year.keyMilestones?.slice(0, 2).map((m, i) => (
                                  <span key={i} className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">{m}</span>
                                ))}
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>

                {/* Skill Upgrades Per Year */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 border border-secondary-500/30">
                  <h3 className="text-xl font-bold mb-6 flex items-center">
                    <GraduationCap className="w-5 h-5 mr-2 text-secondary-500" />
                    Skill Upgrades Per Year
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {simulation.paths[selectedPath].yearlyProgression?.map((year, idx) => (
                      <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <h4 className="font-bold text-primary-400 mb-3">Year {year.year}</h4>
                        <div className="space-y-2 mb-3">
                          <p className="text-xs text-gray-400 uppercase">Skills</p>
                          {year.skillsToAcquire?.map((skill, i) => (
                            <div key={i} className="flex items-center">
                              <Zap className="w-3 h-3 text-yellow-500 mr-2" />
                              <span className="text-sm text-gray-300">{skill}</span>
                            </div>
                          ))}
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs text-gray-400 uppercase">Certifications</p>
                          {year.certifications?.map((cert, i) => (
                            <div key={i} className="flex items-center">
                              <Award className="w-3 h-3 text-green-500 mr-2" />
                              <span className="text-sm text-gray-300">{cert}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Risk vs Reward Analysis */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 border border-orange-500/30">
                  <h3 className="text-xl font-bold mb-6 flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-orange-500" />
                    Risk vs Reward Analysis
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-green-400 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2" />Advantages (Pros)
                      </h4>
                      {simulation.paths[selectedPath].riskVsRewardAnalysis?.pros?.map((pro, idx) => (
                        <motion.div key={idx} initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: idx * 0.1 }} className="flex items-start p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                          <ArrowRight className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-300">{pro}</span>
                        </motion.div>
                      ))}
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-semibold text-red-400 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-2" />Challenges (Cons)
                      </h4>
                      {simulation.paths[selectedPath].riskVsRewardAnalysis?.cons?.map((con, idx) => (
                        <motion.div key={idx} initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: idx * 0.1 }} className="flex items-start p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                          <ArrowRight className="w-4 h-4 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-300">{con}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/30">
                    <p className="text-purple-300"><strong>Best For:</strong> {simulation.paths[selectedPath].riskVsRewardAnalysis?.bestFor}</p>
                  </div>
                </motion.div>

                {/* Path Summary */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 bg-gradient-to-r from-primary-900/30 to-secondary-900/30 border border-primary-500/30">
                  <h3 className="text-xl font-bold mb-4 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
                    Path Summary
                  </h3>
                  <p className="text-gray-300 leading-relaxed text-lg">{simulation.paths[selectedPath].summary}</p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Salary Comparison Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 border border-green-500/30">
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-green-500" />
              5-Year Salary Progression Comparison
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={getSalaryChartData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="year" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" label={{ value: 'Salary (₹ LPA)', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.9)', border: '1px solid #4f46e5', borderRadius: '8px' }} formatter={(value) => [`₹${value}L`, '']} />
                <Legend />
                <Line type="monotone" dataKey="Conservative" stroke="#3b82f6" strokeWidth={3} dot={{ r: 5 }} name="🛡️ Conservative" />
                <Line type="monotone" dataKey="Accelerated" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} name="🚀 Accelerated" />
                <Line type="monotone" dataKey="Pivot" stroke="#a855f7" strokeWidth={3} dot={{ r: 5 }} name="🔄 Pivot" />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Overall Recommendation */}
          {simulation.comparison && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30">
              <h3 className="text-xl font-bold mb-4 flex items-center text-blue-400">
                <Target className="w-5 h-5 mr-2" />
                AI Recommendation
              </h3>
              <p className="text-gray-300 mb-4">{simulation.comparison.recommendation}</p>
              <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                <p className="text-yellow-300"><strong>💡 Key Insight:</strong> {simulation.comparison.keyInsight}</p>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default CareerSimulator;
