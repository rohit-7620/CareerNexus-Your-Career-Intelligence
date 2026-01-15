import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, BookOpen, Target, Calendar, CheckCircle2, 
  Circle, ExternalLink, Loader2, Sparkles, GraduationCap,
  Briefcase, DollarSign, Clock, ChevronDown, ChevronUp,
  Play, BookMarked, Code, Trophy, Flame, Star
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, RadarChart,
  PolarGrid, PolarAngleAxis, Radar, LineChart, Line,
  CartesianGrid, Legend
} from 'recharts';
import toast from 'react-hot-toast';

// API Configuration
const GEMINI_API_KEY = 'AIzaSyB-GCgJ4mf4RIF2tz_K2-62aMrcASB6At4';
const MODEL_NAME = 'gemini-2.5-flash';

// Color palette for visualizations (Plotly/Seaborn inspired)
const COLORS = {
  primary: ['#636EFA', '#EF553B', '#00CC96', '#AB63FA', '#FFA15A', '#19D3F3', '#FF6692', '#B6E880'],
  sequential: ['#0d0887', '#46039f', '#7201a8', '#9c179e', '#bd3786', '#d8576b', '#ed7953', '#fb9f3a', '#fdca26', '#f0f921'],
  diverging: ['#8e0152', '#c51b7d', '#de77ae', '#f1b6da', '#fde0ef', '#e6f5d0', '#b8e186', '#7fbc41', '#4d9221', '#276419']
};

const LearningRoadmap = () => {
  const [targetSkill, setTargetSkill] = useState('');
  const [currentLevel, setCurrentLevel] = useState('beginner');
  const [weeklyHours, setWeeklyHours] = useState('10');
  const [learningData, setLearningData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('roadmap');
  const [expandedWeeks, setExpandedWeeks] = useState({});
  const [completedTasks, setCompletedTasks] = useState({});

  const levels = [
    { value: 'beginner', label: 'Beginner (No experience)' },
    { value: 'elementary', label: 'Elementary (Basic knowledge)' },
    { value: 'intermediate', label: 'Intermediate (Some projects)' },
    { value: 'advanced', label: 'Advanced (Professional experience)' }
  ];

  const tabs = [
    { id: 'roadmap', label: 'Skill Roadmap', icon: Target },
    { id: 'weekly', label: 'Weekly Plan', icon: Calendar },
    { id: 'resources', label: 'Resources', icon: BookOpen },
    { id: 'projects', label: 'Projects', icon: Code },
    { id: 'certifications', label: 'Certifications', icon: GraduationCap }
  ];

  const generateLearningPath = async () => {
    if (!targetSkill.trim()) {
      toast.error('Please enter a skill to learn');
      return;
    }

    setLoading(true);
    
    const prompt = `Create learning path for ${targetSkill} from ${currentLevel} level with ${weeklyHours} hours/week.

Return JSON only:
{"skillRoadmap":{"overview":"string","totalWeeks":14,"stages":[{"name":"Beginner","weeks":"1-4","skills":["skill1","skill2"],"milestone":"string","progress":25},{"name":"Intermediate","weeks":"5-10","skills":["skill3"],"milestone":"string","progress":50},{"name":"Advanced","weeks":"11-14","skills":["skill4"],"milestone":"string","progress":75}]},"weeklyPlan":[{"week":1,"title":"string","focus":"string","hours":10,"tasks":[{"task":"string","duration":"2 hours","type":"video"}],"deliverable":"string"}],"resources":{"free":[{"name":"string","type":"Course","url":"https://example.com","duration":"10 hours","rating":4.8}],"paid":[{"name":"string","type":"Course","url":"https://example.com","price":"$49","duration":"20 hours","rating":4.9}]},"projects":[{"name":"string","difficulty":"Beginner","skills":["skill1"],"description":"string","estimatedHours":10,"week":"3-4"}],"certifications":[{"name":"string","provider":"string","cost":"$150","difficulty":"Intermediate","duration":"30 hours","url":"https://example.com","value":"High"}],"skillProgression":[{"week":1,"beginner":100,"intermediate":0,"advanced":0},{"week":7,"beginner":30,"intermediate":60,"advanced":10},{"week":14,"beginner":0,"intermediate":20,"advanced":80}],"hoursDistribution":[{"category":"Theory","hours":30,"percentage":20},{"category":"Practice","hours":60,"percentage":40},{"category":"Projects","hours":45,"percentage":30},{"category":"Review","hours":15,"percentage":10}]}

Generate 3 stages, 12 weeks plan, 4 free resources, 3 paid resources, 4 projects, 3 certifications. Keep text short.`;

    // Helper function to clean and parse JSON
    const parseAIResponse = (rawText) => {
      let text = rawText.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
      
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}');
      
      if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error('No JSON object found in response');
      }
      
      text = text.substring(jsonStart, jsonEnd + 1);
      
      // Clean the JSON string - replace actual newlines with spaces
      text = text.split('\n').join(' ').split('\r').join('').split('\t').join(' ');
      
      // Remove trailing commas before } or ]
      text = text.replace(/,(\s*[}\]])/g, '$1');
      
      // Replace multiple spaces with single space
      text = text.replace(/\s+/g, ' ');
      
      try {
        return JSON.parse(text);
      } catch (e) {
        console.error('Parse error:', e.message);
        // Try more aggressive cleaning
        text = text.replace(/,\s*,/g, ','); // Remove double commas
        text = text.replace(/\[\s*,/g, '['); // Remove leading comma in arrays
        text = text.replace(/,\s*\]/g, ']'); // Remove trailing comma in arrays
        return JSON.parse(text);
      }
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
        const rawText = data.candidates[0].content.parts[0].text;
        const parsedData = parseAIResponse(rawText);
        
        setLearningData(parsedData);
        setActiveTab('roadmap');
        setExpandedWeeks({});
        setCompletedTasks({});
        toast.success('Learning path generated!');
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

  const toggleWeek = (weekNum) => {
    setExpandedWeeks(prev => ({ ...prev, [weekNum]: !prev[weekNum] }));
  };

  const toggleTask = (weekNum, taskIndex) => {
    const key = `${weekNum}-${taskIndex}`;
    setCompletedTasks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getCompletionPercentage = () => {
    if (!learningData?.weeklyPlan) return 0;
    let total = 0;
    let completed = 0;
    learningData.weeklyPlan.forEach((week, wi) => {
      week.tasks?.forEach((_, ti) => {
        total++;
        if (completedTasks[`${wi + 1}-${ti}`]) completed++;
      });
    });
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900/95 border border-white/20 rounded-lg p-3 shadow-xl">
          <p className="text-white font-medium mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          <Award className="inline w-10 h-10 mr-2 text-yellow-500" />
          AI Learning Path Generator
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Get a personalized roadmap from Beginner to Advanced with timeline and resources
        </p>
      </motion.div>

      {/* Input Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium mb-2">
              <Target className="w-4 h-4 inline mr-2" />
              Skill to Learn
            </label>
            <input
              type="text"
              value={targetSkill}
              onChange={(e) => setTargetSkill(e.target.value)}
              placeholder="e.g., React, Python, Machine Learning"
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-primary-500 focus:outline-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              <BookOpen className="w-4 h-4 inline mr-2" />
              Current Level
            </label>
            <select
              value={currentLevel}
              onChange={(e) => setCurrentLevel(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-primary-500 focus:outline-none"
            >
              {levels.map(level => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              <Clock className="w-4 h-4 inline mr-2" />
              Hours/Week
            </label>
            <select
              value={weeklyHours}
              onChange={(e) => setWeeklyHours(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-primary-500 focus:outline-none"
            >
              <option value="5">5 hours</option>
              <option value="10">10 hours</option>
              <option value="15">15 hours</option>
              <option value="20">20 hours</option>
              <option value="30">30+ hours</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={generateLearningPath}
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Generate Path</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Results */}
      {learningData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-4"
            >
              <div className="flex items-center justify-between">
                <Calendar className="w-8 h-8 text-blue-500" />
                <span className="text-2xl font-bold">{learningData.skillRoadmap?.totalWeeks || 14}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Total Weeks</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-4"
            >
              <div className="flex items-center justify-between">
                <Trophy className="w-8 h-8 text-yellow-500" />
                <span className="text-2xl font-bold">{getCompletionPercentage()}%</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Completed</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-4"
            >
              <div className="flex items-center justify-between">
                <BookMarked className="w-8 h-8 text-green-500" />
                <span className="text-2xl font-bold">
                  {(learningData.resources?.free?.length || 0) + (learningData.resources?.paid?.length || 0)}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Resources</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-4"
            >
              <div className="flex items-center justify-between">
                <GraduationCap className="w-8 h-8 text-purple-500" />
                <span className="text-2xl font-bold">{learningData.certifications?.length || 0}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Certifications</p>
            </motion.div>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {/* Skill Roadmap Tab */}
            {activeTab === 'roadmap' && (
              <motion.div
                key="roadmap"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Overview */}
                <div className="glass-card p-6">
                  <h3 className="text-xl font-bold mb-3">Learning Journey Overview</h3>
                  <p className="text-gray-600 dark:text-gray-400">{learningData.skillRoadmap?.overview}</p>
                </div>

                {/* Skill Progression Chart - Plotly Style Area Chart */}
                <div className="glass-card p-6">
                  <h3 className="text-xl font-bold mb-4">Skill Progression Over Time</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={learningData.skillProgression}>
                      <defs>
                        <linearGradient id="beginnerGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#636EFA" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#636EFA" stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="intermediateGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00CC96" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#00CC96" stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="advancedGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#EF553B" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#EF553B" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="week" stroke="#9CA3AF" tickFormatter={(v) => `Week ${v}`} />
                      <YAxis stroke="#9CA3AF" tickFormatter={(v) => `${v}%`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Area type="monotone" dataKey="beginner" stackId="1" stroke="#636EFA" fill="url(#beginnerGrad)" name="Beginner" />
                      <Area type="monotone" dataKey="intermediate" stackId="1" stroke="#00CC96" fill="url(#intermediateGrad)" name="Intermediate" />
                      <Area type="monotone" dataKey="advanced" stackId="1" stroke="#EF553B" fill="url(#advancedGrad)" name="Advanced" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Hours Distribution - Pie Chart */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="glass-card p-6">
                    <h3 className="text-xl font-bold mb-4">Time Distribution</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={learningData.hoursDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="hours"
                          label={({ category, percentage }) => `${category}: ${percentage}%`}
                        >
                          {learningData.hoursDistribution?.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS.primary[index % COLORS.primary.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Roadmap Timeline */}
                  <div className="glass-card p-6">
                    <h3 className="text-xl font-bold mb-4">Learning Stages</h3>
                    <div className="space-y-4">
                      {learningData.skillRoadmap?.stages?.map((stage, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="relative pl-8 pb-4 border-l-2 border-purple-500/50 last:border-l-0"
                        >
                          <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-purple-500"></div>
                          <div className="bg-white/5 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-bold text-lg">{stage.name}</h4>
                              <span className="text-sm bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
                                Weeks {stage.weeks}
                              </span>
                            </div>
                            <p className="text-sm text-gray-400 mb-2">{stage.milestone}</p>
                            <div className="flex flex-wrap gap-1">
                              {stage.skills?.map((skill, i) => (
                                <span key={i} className="text-xs px-2 py-1 bg-white/10 rounded">{skill}</span>
                              ))}
                            </div>
                            <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${stage.progress}%` }}
                                transition={{ duration: 1, delay: 0.5 }}
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                              />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Weekly Plan Tab */}
            {activeTab === 'weekly' && (
              <motion.div
                key="weekly"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {/* Timeline Visualization */}
                <div className="glass-card p-6">
                  <h3 className="text-xl font-bold mb-4">Weekly Hours Timeline</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={learningData.weeklyPlan?.slice(0, 16)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="week" stroke="#9CA3AF" tickFormatter={(v) => `W${v}`} />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                        formatter={(value) => [`${value} hours`, 'Duration']}
                      />
                      <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                        {learningData.weeklyPlan?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS.primary[index % COLORS.primary.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Weekly Checklist */}
                <div className="space-y-3">
                  {learningData.weeklyPlan?.map((week, weekIndex) => (
                    <motion.div
                      key={weekIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: weekIndex * 0.05 }}
                      className="glass-card overflow-hidden"
                    >
                      <div
                        onClick={() => toggleWeek(week.week)}
                        className="p-4 cursor-pointer hover:bg-white/5 transition-colors flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                            weekIndex < 4 ? 'bg-green-500/20 text-green-400' :
                            weekIndex < 8 ? 'bg-yellow-500/20 text-yellow-400' :
                            weekIndex < 12 ? 'bg-orange-500/20 text-orange-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            W{week.week}
                          </div>
                          <div>
                            <h4 className="font-semibold">{week.title}</h4>
                            <p className="text-sm text-gray-500">{week.focus} • {week.hours} hours</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-gray-500">
                            {week.tasks?.filter((_, ti) => completedTasks[`${week.week}-${ti}`]).length || 0}/{week.tasks?.length || 0} tasks
                          </span>
                          {expandedWeeks[week.week] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                      </div>

                      <AnimatePresence>
                        {expandedWeeks[week.week] && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-white/10"
                          >
                            <div className="p-4 space-y-3">
                              {/* Tasks Checklist */}
                              <div className="space-y-2">
                                {week.tasks?.map((task, taskIndex) => (
                                  <div
                                    key={taskIndex}
                                    onClick={() => toggleTask(week.week, taskIndex)}
                                    className={`p-3 rounded-lg cursor-pointer transition-all flex items-start space-x-3 ${
                                      completedTasks[`${week.week}-${taskIndex}`]
                                        ? 'bg-green-500/10 border border-green-500/30'
                                        : 'bg-white/5 hover:bg-white/10'
                                    }`}
                                  >
                                    {completedTasks[`${week.week}-${taskIndex}`] ? (
                                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    ) : (
                                      <Circle className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                                    )}
                                    <div className="flex-1">
                                      <p className={completedTasks[`${week.week}-${taskIndex}`] ? 'line-through text-gray-500' : ''}>
                                        {task.task}
                                      </p>
                                      <div className="flex items-center space-x-2 mt-1">
                                        <span className="text-xs px-2 py-0.5 bg-white/10 rounded">{task.duration}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded ${
                                          task.type === 'video' ? 'bg-red-500/20 text-red-400' :
                                          task.type === 'reading' ? 'bg-blue-500/20 text-blue-400' :
                                          'bg-green-500/20 text-green-400'
                                        }`}>
                                          {task.type === 'video' && <Play className="w-3 h-3 inline mr-1" />}
                                          {task.type}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Deliverable */}
                              <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                                <p className="text-sm">
                                  <span className="font-semibold text-purple-400">🎯 Deliverable:</span> {week.deliverable}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Resources Tab */}
            {activeTab === 'resources' && (
              <motion.div
                key="resources"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Free Resources */}
                <div className="glass-card p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center">
                    <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                    Free Resources
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {learningData.resources?.free?.map((resource, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 bg-white/5 rounded-lg border border-green-500/20 hover:border-green-500/50 transition-all"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">{resource.name}</h4>
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">FREE</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
                          <span>{resource.type}</span>
                          <span>•</span>
                          <span>{resource.duration}</span>
                          <span>•</span>
                          <span>⭐ {resource.rating}</span>
                        </div>
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-400 hover:text-blue-300 flex items-center"
                        >
                          <ExternalLink className="w-4 h-4 mr-1" /> Open Resource
                        </a>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Paid Resources */}
                <div className="glass-card p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center">
                    <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                    Premium Resources
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {learningData.resources?.paid?.map((resource, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 bg-white/5 rounded-lg border border-yellow-500/20 hover:border-yellow-500/50 transition-all"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">{resource.name}</h4>
                          <span className="text-sm font-bold text-yellow-400">{resource.price}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
                          <span>{resource.type}</span>
                          <span>•</span>
                          <span>{resource.duration}</span>
                          <span>•</span>
                          <span>⭐ {resource.rating}</span>
                        </div>
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-400 hover:text-blue-300 flex items-center"
                        >
                          <ExternalLink className="w-4 h-4 mr-1" /> View Course
                        </a>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Projects Tab */}
            {activeTab === 'projects' && (
              <motion.div
                key="projects"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="glass-card p-6">
                  <h3 className="text-xl font-bold mb-4">Project Ideas by Skill Level</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={learningData.projects} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis type="number" stroke="#9CA3AF" />
                      <YAxis dataKey="name" type="category" stroke="#9CA3AF" width={150} tick={{ fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                        formatter={(value) => [`${value} hours`, 'Estimated Time']}
                      />
                      <Bar dataKey="estimatedHours" radius={[0, 4, 4, 0]}>
                        {learningData.projects?.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={
                              entry.difficulty === 'Beginner' ? '#00CC96' :
                              entry.difficulty === 'Intermediate' ? '#FFA15A' : '#EF553B'
                            } 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {learningData.projects?.map((project, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className={`glass-card p-5 border-l-4 ${
                        project.difficulty === 'Beginner' ? 'border-green-500' :
                        project.difficulty === 'Intermediate' ? 'border-yellow-500' : 'border-red-500'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-lg">{project.name}</h4>
                        <span className={`text-xs px-2 py-1 rounded ${
                          project.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400' :
                          project.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {project.difficulty}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mb-3">{project.description}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {project.skills?.map((skill, i) => (
                          <span key={i} className="text-xs px-2 py-1 bg-white/10 rounded">{skill}</span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>⏱️ {project.estimatedHours} hours</span>
                        <span>📅 Week {project.week}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Certifications Tab */}
            {activeTab === 'certifications' && (
              <motion.div
                key="certifications"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {learningData.certifications?.map((cert, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-card p-6"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                          <GraduationCap className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg">{cert.name}</h4>
                          <p className="text-sm text-gray-500">{cert.provider}</p>
                          <div className="flex items-center space-x-3 mt-2">
                            <span className={`text-xs px-2 py-1 rounded ${
                              cert.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400' :
                              cert.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {cert.difficulty}
                            </span>
                            <span className="text-sm text-gray-500">⏱️ {cert.duration}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-xl font-bold text-green-400">{cert.cost}</p>
                          <p className="text-xs text-gray-500">{cert.value}</p>
                        </div>
                        <a
                          href={cert.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors flex items-center"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Enroll
                        </a>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Empty State */}
      {!learningData && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-12 text-center"
        >
          <Award className="w-20 h-20 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2">Create Your Learning Path</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Enter a skill you want to master and get a personalized roadmap with
            weekly plans, curated resources, projects, and certification recommendations.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {['Skill Roadmap', 'Weekly Plan', 'Free & Paid Resources', 'Project Ideas', 'Certifications'].map((tag, i) => (
              <span key={i} className="px-3 py-1 text-sm bg-white/10 rounded-full">{tag}</span>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default LearningRoadmap;
