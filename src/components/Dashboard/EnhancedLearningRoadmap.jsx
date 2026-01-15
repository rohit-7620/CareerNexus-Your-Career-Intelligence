import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Award, CalendarDays, RefreshCw, CheckCircle, Target, Star, Zap, GitBranch, TrendingUp, Lightbulb, Code, Layers } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ComposedChart, Area, ScatterChart, Scatter, Cell } from 'recharts';
import toast from 'react-hot-toast';

const EnhancedLearningRoadmap = () => {
  const [targetSkill, setTargetSkill] = useState('');
  const [currentLevel, setCurrentLevel] = useState('beginner');
  const [targetLevel, setTargetLevel] = useState('advanced');
  const [hoursPerWeek, setHoursPerWeek] = useState('10');
  const [roadmap, setRoadmap] = useState(null);
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

  const generateRoadmap = async () => {
    if (!targetSkill || !hoursPerWeek) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const prompt = `Create a comprehensive enhanced learning strategy. Return ONLY valid JSON (no markdown):

Skill: ${targetSkill}
Current Level: ${currentLevel}
Target Level: ${targetLevel}
Hours/Week: ${hoursPerWeek}

Return JSON with these exact keys:
{
  "skillStackingMap": [{"layer": 1-5, "skills": ["skill1", ...], "foundation": true|false}],
  "projectFirstPath": [{"project": "name", "difficulty": 1-10, "duration": "X weeks", "skills": ["skill1", ...], "portfolio": "how it helps portfolio"}],
  "aiToolsGuide": [{"tool": "name", "purpose": "what it does", "integration": "how to use", "timePerWeek": number}],
  "portfolioAlignment": [{"artefact": "type", "metrics": ["metric1", ...], "impact": 1-10}],
  "learningROI": {
    "score": 1-100,
    "breakdown": [{"dimension": "name", "value": 1-10, "color": "#hexcolor"}],
    "timeline": [{"month": number, "skillLevel": 1-100, "marketValue": number}],
    "estimatedEarningBoost": "percentage"
  },
  "actionPlan": [{"phase": number, "title": "name", "duration": "X weeks", "actions": ["action1", ...], "milestones": ["milestone1", ...]}]
}`;

      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyBUR3r_YwSTv0pG5ei1xxzCarVn3_MP740',
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
      const roadmapText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const parsedRoadmap = parseAIResponse(roadmapText);

      if (parsedRoadmap) {
        setRoadmap(parsedRoadmap);
        toast.success('Enhanced learning strategy created!');
      } else {
        toast.error('Failed to parse strategy');
      }
    } catch (error) {
      console.error('Roadmap error:', error);
      toast.error('Failed to generate strategy');
    } finally {
      setLoading(false);
    }
  };

  const roiBreakdownData = roadmap?.learningROI?.breakdown || [];
  const roiTimelineData = roadmap?.learningROI?.timeline || [];
  
  const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#ef4444'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto p-6 space-y-8"
    >
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg p-8 text-white">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <BookOpen size={40} /> Enhanced Learning Strategy
        </h1>
        <p className="text-indigo-100">Skill stacking • Project-first • AI tools • Portfolio alignment • ROI optimized</p>
      </div>

      {!roadmap ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-8 space-y-4 max-w-2xl mx-auto"
        >
          <div>
            <label className="block text-sm font-semibold mb-2">What skill do you want to master?</label>
            <input
              type="text"
              value={targetSkill}
              onChange={(e) => setTargetSkill(e.target.value)}
              placeholder="e.g., Full-Stack Web Development"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Current Level</label>
              <select
                value={currentLevel}
                onChange={(e) => setCurrentLevel(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Target Level</label>
              <select
                value={targetLevel}
                onChange={(e) => setTargetLevel(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Hours per Week</label>
            <select
              value={hoursPerWeek}
              onChange={(e) => setHoursPerWeek(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="5">5 hours/week</option>
              <option value="10">10 hours/week</option>
              <option value="20">20 hours/week</option>
              <option value="30">30+ hours/week</option>
            </select>
          </div>

          <button
            onClick={generateRoadmap}
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="animate-spin" size={20} /> : <Target size={20} />}
            {loading ? 'Creating Strategy...' : 'Create Strategy'}
          </button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-8"
        >
          {/* Learning ROI Score */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-6 border border-green-200 dark:border-green-700">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="text-green-600" size={28} /> Learning ROI Score
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center"
                >
                  <div className="text-5xl font-bold text-green-600 mb-2">{roadmap?.learningROI?.score || 0}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">Overall ROI Score</div>
                  <div className="text-lg font-semibold text-green-700 dark:text-green-300">
                    {roadmap?.learningROI?.estimatedEarningBoost}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Estimated earning boost</p>
                </motion.div>
              </div>
              
              {roiBreakdownData.length > 0 && (
                <div>
                  <ResponsiveContainer width="100%" height={250}>
                    <RadarChart data={roiBreakdownData}>
                      <PolarGrid stroke="#ddd" />
                      <PolarAngleAxis dataKey="dimension" stroke="#666" />
                      <PolarRadiusAxis angle={90} domain={[0, 10]} stroke="#999" />
                      <Radar name="Score" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* ROI Timeline */}
          {roiTimelineData.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-2xl font-bold mb-6">Growth Timeline & Market Value</h3>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={roiTimelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" label={{ value: 'Month', position: 'insideBottomRight', offset: -5 }} />
                  <YAxis yAxisId="left" label={{ value: 'Skill Level %', angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="right" orientation="right" label={{ value: 'Market Value ($)', angle: 90, position: 'insideRight' }} />
                  <Tooltip formatter={(value) => typeof value === 'number' ? value.toLocaleString() : value} />
                  <Area yAxisId="left" type="monotone" dataKey="skillLevel" fill="#3b82f6" stroke="#2563eb" fillOpacity={0.6} />
                  <Line yAxisId="right" type="monotone" dataKey="marketValue" stroke="#10b981" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Skill Stacking Map */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Layers className="text-blue-600" size={28} /> Skill Stacking Architecture
            </h3>
            <div className="space-y-4">
              {roadmap?.skillStackingMap?.map((layer, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-lg border-l-4 border-blue-600"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                      L{layer.layer}
                    </div>
                    <div>
                      <p className="font-semibold">{layer.foundation ? 'Foundation Layer' : 'Advanced Layer'}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Prerequisite skills</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {layer.skills?.map((skill, sidx) => (
                      <motion.span
                        key={sidx}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: sidx * 0.05 }}
                        className="bg-white dark:bg-gray-700 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium border border-blue-300 dark:border-blue-600"
                      >
                        {skill}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Project-First Learning Path */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <GitBranch className="text-purple-600" size={28} /> Project-First Learning Path
            </h3>
            <div className="space-y-4">
              {roadmap?.projectFirstPath?.map((project, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h5 className="font-bold text-lg">{project.project}</h5>
                    <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded">Difficulty: {project.difficulty}/10</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{project.portfolio}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {project.skills?.map((skill, sidx) => (
                      <span key={sidx} className="text-xs bg-purple-200 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 px-2 py-1 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">⏱ {project.duration}</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* AI Tools Integration */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Zap className="text-yellow-600" size={28} /> AI Tools & Integration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roadmap?.aiToolsGuide?.map((tool, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-700"
                >
                  <h5 className="font-bold text-lg mb-2 flex items-center gap-2">
                    <Code size={18} className="text-yellow-600" /> {tool.tool}
                  </h5>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{tool.purpose}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    <strong>Integration:</strong> {tool.integration}
                  </p>
                  <div className="text-xs bg-yellow-600 text-white inline-block px-2 py-1 rounded">
                    {tool.timePerWeek}h/week
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Portfolio Alignment */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Star className="text-orange-600" size={28} /> Portfolio Alignment & Impact
            </h3>
            <div className="space-y-3">
              {roadmap?.portfolioAlignment?.map((artefact, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 p-4 rounded-lg border-l-4 border-orange-600"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h5 className="font-bold text-orange-800 dark:text-orange-300">{artefact.artefact}</h5>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Impact: {artefact.impact}/10</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {artefact.metrics?.map((metric, midx) => (
                      <span key={midx} className="text-xs bg-orange-200 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300 px-2 py-1 rounded">
                        {metric}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Action Plan */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <CheckCircle className="text-indigo-600" size={28} /> Action Plan
            </h3>

            {roadmap?.actionPlan?.map((phase, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 border-l-4 border-indigo-600"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-xl font-bold">Phase {phase.phase}: {phase.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Duration: {phase.duration}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mb-4">
                  <p className="text-sm font-semibold mb-3 text-indigo-700 dark:text-indigo-300">Actions:</p>
                  <ul className="space-y-2">
                    {phase.actions?.map((action, aidx) => (
                      <motion.li
                        key={aidx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: aidx * 0.05 }}
                        className="flex items-start gap-3"
                      >
                        <CheckCircle size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{action}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* Milestones */}
                <div>
                  <p className="text-sm font-semibold mb-3 text-green-700 dark:text-green-300">Milestones:</p>
                  <div className="flex flex-wrap gap-2">
                    {phase.milestones?.map((milestone, midx) => (
                      <motion.span
                        key={midx}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: midx * 0.05 }}
                        className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium border border-green-300 dark:border-green-700"
                      >
                        {milestone}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <button
            onClick={() => setRoadmap(null)}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700"
          >
            Create New Strategy
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default EnhancedLearningRoadmap;
