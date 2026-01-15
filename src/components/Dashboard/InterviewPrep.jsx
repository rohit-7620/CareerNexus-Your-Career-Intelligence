import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Send, Sparkles, Code, Users, Building2, 
  ChevronDown, ChevronUp, CheckCircle2, XCircle, 
  Lightbulb, AlertTriangle, Target, BookOpen,
  Loader2, Briefcase
} from 'lucide-react';
import toast from 'react-hot-toast';

// Direct API key for Interview Prep feature
const GEMINI_API_KEY = 'AIzaSyCoZrg5nbpcOv2xt58W9vmhtdesHGpBkoA';
const MODEL_NAME = 'gemini-2.5-flash';

const InterviewPrep = () => {
  const [jobRole, setJobRole] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('mid');
  const [interviewData, setInterviewData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('technical');
  const [expandedQuestions, setExpandedQuestions] = useState({});

  const experienceLevels = [
    { value: 'entry', label: 'Entry Level (0-2 years)' },
    { value: 'mid', label: 'Mid Level (2-5 years)' },
    { value: 'senior', label: 'Senior Level (5-10 years)' },
    { value: 'lead', label: 'Lead/Principal (10+ years)' }
  ];

  const categories = [
    { id: 'technical', label: 'Technical Questions', icon: Code, color: 'from-blue-500 to-cyan-500' },
    { id: 'behavioral', label: 'Behavioral (STAR)', icon: Users, color: 'from-purple-500 to-pink-500' },
    { id: 'systemDesign', label: 'System Design / Case', icon: Building2, color: 'from-orange-500 to-red-500' },
    { id: 'commonMistakes', label: 'Common Mistakes', icon: AlertTriangle, color: 'from-yellow-500 to-amber-500' }
  ];

  const generateInterviewQuestions = async () => {
    if (!jobRole.trim()) {
      toast.error('Please enter a job role');
      return;
    }

    setLoading(true);
    
    // Retry logic for rate limiting
    const makeRequest = async (retries = 3, delay = 2000) => {
      const prompt = `Generate interview prep for ${experienceLevel} ${jobRole}. Return ONLY this JSON structure (no markdown, no code blocks):

{"technical":[{"question":"string","difficulty":"Easy|Medium|Hard","idealAnswer":"string","answerFramework":["step1","step2"],"keyPoints":["point1"],"followUpQuestions":["q1"]}],"behavioral":[{"question":"string","starFramework":{"situation":"string","task":"string","action":"string","result":"string"},"idealAnswer":"string","tips":["tip1"],"whatInterviewersLookFor":["trait1"]}],"systemDesign":[{"question":"string","type":"System Design|Case Study","approach":["step1"],"keyConsiderations":["item1"],"idealAnswer":"string","commonPitfalls":["pitfall1"]}],"commonMistakes":[{"mistake":"string","impact":"string","howToAvoid":"string","betterApproach":"string"}],"generalTips":["tip1","tip2"]}

Generate 4 technical questions, 3 behavioral, 2 system design, 4 common mistakes.
Keep answers concise (under 200 words each). Use simple quotes, no special characters.
Return ONLY the JSON object, starting with { and ending with }`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 8192,
              responseMimeType: "application/json"
            }
          })
        }
      );

      // Handle rate limiting with retry
      if (response.status === 429) {
        if (retries > 0) {
          toast.loading(`Rate limited. Retrying in ${delay/1000}s...`, { duration: delay });
          await new Promise(resolve => setTimeout(resolve, delay));
          return makeRequest(retries - 1, delay * 1.5);
        }
        throw new Error('Rate limit exceeded. Please try again in a minute.');
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.error?.message || 'API request failed');
      }

      return await response.json();
    };

    // Helper function to clean and parse JSON from AI response
    const parseAIResponse = (rawText) => {
      console.log('Raw AI response length:', rawText.length);
      
      // Step 1: Remove markdown code blocks
      let text = rawText.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
      
      // Step 2: Find JSON boundaries
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}');
      
      if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error('No JSON object found in response');
      }
      
      text = text.substring(jsonStart, jsonEnd + 1);
      
      // Step 3: Clean the JSON string
      // Replace actual newlines/tabs with spaces (not escaped ones)
      text = text
        .split('\n').join(' ')
        .split('\r').join('')
        .split('\t').join(' ');
      
      // Step 4: Fix common JSON issues
      // Remove trailing commas before } or ]
      text = text.replace(/,(\s*[}\]])/g, '$1');
      
      // Step 5: Try to parse
      try {
        return JSON.parse(text);
      } catch (e) {
        console.error('First parse attempt failed:', e.message);
        
        // Step 6: More aggressive cleaning
        // Replace multiple spaces with single space
        text = text.replace(/\s+/g, ' ');
        
        // Try again
        return JSON.parse(text);
      }
    };

    try {
      const data = await makeRequest();
      console.log('API Response received');
      
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        const rawText = data.candidates[0].content.parts[0].text;
        const parsedData = parseAIResponse(rawText);
        
        setInterviewData(parsedData);
        setActiveCategory('technical');
        setExpandedQuestions({});
        toast.success('Interview questions generated!');
      } else {
        console.error('Unexpected response structure:', data);
        throw new Error('Invalid response from API');
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      toast.error(`Failed to generate: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleQuestion = (categoryId, index) => {
    const key = `${categoryId}-${index}`;
    setExpandedQuestions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'hard': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          <Zap className="inline w-10 h-10 mr-2 text-yellow-500" />
          AI Interview Prep
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Get role-specific interview questions with ideal answer frameworks
        </p>
      </motion.div>

      {/* Input Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium mb-2">
              <Briefcase className="w-4 h-4 inline mr-2" />
              Job Role
            </label>
            <input
              type="text"
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              placeholder="e.g., Software Engineer, Product Manager"
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-primary-500 focus:outline-none transition-all"
            />
          </div>
          
          <div className="md:col-span-1">
            <label className="block text-sm font-medium mb-2">
              <Target className="w-4 h-4 inline mr-2" />
              Experience Level
            </label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-primary-500 focus:outline-none transition-all"
            >
              {experienceLevels.map(level => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-1 flex items-end">
            <button
              onClick={generateInterviewQuestions}
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Generate Questions</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Results Section */}
      {interviewData && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Category Tabs */}
          <motion.div variants={itemVariants} className="flex flex-wrap gap-2 justify-center">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-full font-medium transition-all flex items-center space-x-2 ${
                  activeCategory === category.id
                    ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                    : 'bg-white/5 hover:bg-white/10 border border-white/10'
                }`}
              >
                <category.icon className="w-4 h-4" />
                <span>{category.label}</span>
                <span className="px-2 py-0.5 text-xs rounded-full bg-white/20">
                  {interviewData[category.id]?.length || 0}
                </span>
              </button>
            ))}
          </motion.div>

          {/* General Tips */}
          {interviewData.generalTips && (
            <motion.div variants={itemVariants} className="glass-card p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
              <div className="flex items-center space-x-2 mb-3">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                <h3 className="font-semibold">Pro Tips</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {interviewData.generalTips.map((tip, i) => (
                  <span key={i} className="px-3 py-1 text-sm bg-white/10 rounded-full">
                    {tip}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Questions Display */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* Technical Questions */}
              {activeCategory === 'technical' && interviewData.technical?.map((item, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: index * 0.1 }}
                  className="glass-card overflow-hidden"
                >
                  <div
                    onClick={() => toggleQuestion('technical', index)}
                    className="p-4 cursor-pointer hover:bg-white/5 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{item.question}</h4>
                        <span className={`inline-block px-2 py-0.5 text-xs rounded-full mt-1 ${getDifficultyColor(item.difficulty)}`}>
                          {item.difficulty}
                        </span>
                      </div>
                    </div>
                    {expandedQuestions[`technical-${index}`] ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  
                  <AnimatePresence>
                    {expandedQuestions[`technical-${index}`] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-white/10"
                      >
                        <div className="p-4 space-y-4">
                          {/* Answer Framework */}
                          <div>
                            <h5 className="font-semibold text-sm text-blue-400 mb-2 flex items-center">
                              <BookOpen className="w-4 h-4 mr-2" />
                              Answer Framework
                            </h5>
                            <div className="space-y-2">
                              {item.answerFramework?.map((step, i) => (
                                <div key={i} className="flex items-start space-x-2">
                                  <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs flex-shrink-0">
                                    {i + 1}
                                  </span>
                                  <span className="text-sm">{step}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Ideal Answer */}
                          <div>
                            <h5 className="font-semibold text-sm text-green-400 mb-2 flex items-center">
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Ideal Answer
                            </h5>
                            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-sm">
                              {item.idealAnswer}
                            </div>
                          </div>

                          {/* Key Points */}
                          {item.keyPoints && (
                            <div>
                              <h5 className="font-semibold text-sm text-purple-400 mb-2">Key Points to Cover</h5>
                              <div className="flex flex-wrap gap-2">
                                {item.keyPoints.map((point, i) => (
                                  <span key={i} className="px-3 py-1 text-sm bg-purple-500/20 text-purple-300 rounded-full">
                                    {point}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Follow-up Questions */}
                          {item.followUpQuestions && (
                            <div>
                              <h5 className="font-semibold text-sm text-orange-400 mb-2">Potential Follow-ups</h5>
                              <ul className="space-y-1">
                                {item.followUpQuestions.map((q, i) => (
                                  <li key={i} className="text-sm flex items-start">
                                    <span className="text-orange-400 mr-2">→</span>
                                    {q}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}

              {/* Behavioral Questions (STAR Format) */}
              {activeCategory === 'behavioral' && interviewData.behavioral?.map((item, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: index * 0.1 }}
                  className="glass-card overflow-hidden"
                >
                  <div
                    onClick={() => toggleQuestion('behavioral', index)}
                    className="p-4 cursor-pointer hover:bg-white/5 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <h4 className="font-semibold text-lg">{item.question}</h4>
                    </div>
                    {expandedQuestions[`behavioral-${index}`] ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  
                  <AnimatePresence>
                    {expandedQuestions[`behavioral-${index}`] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-white/10"
                      >
                        <div className="p-4 space-y-4">
                          {/* STAR Framework */}
                          {item.starFramework && (
                            <div>
                              <h5 className="font-semibold text-sm text-purple-400 mb-3">STAR Framework</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                                  <div className="font-bold text-purple-400 text-sm mb-1">S - Situation</div>
                                  <p className="text-sm">{item.starFramework.situation}</p>
                                </div>
                                <div className="bg-pink-500/10 border border-pink-500/20 rounded-lg p-3">
                                  <div className="font-bold text-pink-400 text-sm mb-1">T - Task</div>
                                  <p className="text-sm">{item.starFramework.task}</p>
                                </div>
                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                                  <div className="font-bold text-blue-400 text-sm mb-1">A - Action</div>
                                  <p className="text-sm">{item.starFramework.action}</p>
                                </div>
                                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                                  <div className="font-bold text-green-400 text-sm mb-1">R - Result</div>
                                  <p className="text-sm">{item.starFramework.result}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Ideal Answer */}
                          <div>
                            <h5 className="font-semibold text-sm text-green-400 mb-2 flex items-center">
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Example Answer
                            </h5>
                            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-sm">
                              {item.idealAnswer}
                            </div>
                          </div>

                          {/* What Interviewers Look For */}
                          {item.whatInterviewersLookFor && (
                            <div>
                              <h5 className="font-semibold text-sm text-cyan-400 mb-2">What Interviewers Look For</h5>
                              <div className="flex flex-wrap gap-2">
                                {item.whatInterviewersLookFor.map((trait, i) => (
                                  <span key={i} className="px-3 py-1 text-sm bg-cyan-500/20 text-cyan-300 rounded-full">
                                    {trait}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Tips */}
                          {item.tips && (
                            <div>
                              <h5 className="font-semibold text-sm text-yellow-400 mb-2 flex items-center">
                                <Lightbulb className="w-4 h-4 mr-2" />
                                Tips
                              </h5>
                              <ul className="space-y-1">
                                {item.tips.map((tip, i) => (
                                  <li key={i} className="text-sm flex items-start">
                                    <span className="text-yellow-400 mr-2">•</span>
                                    {tip}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}

              {/* System Design / Case Questions */}
              {activeCategory === 'systemDesign' && interviewData.systemDesign?.map((item, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: index * 0.1 }}
                  className="glass-card overflow-hidden"
                >
                  <div
                    onClick={() => toggleQuestion('systemDesign', index)}
                    className="p-4 cursor-pointer hover:bg-white/5 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{item.question}</h4>
                        <span className="inline-block px-2 py-0.5 text-xs rounded-full mt-1 bg-orange-500/20 text-orange-300">
                          {item.type}
                        </span>
                      </div>
                    </div>
                    {expandedQuestions[`systemDesign-${index}`] ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  
                  <AnimatePresence>
                    {expandedQuestions[`systemDesign-${index}`] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-white/10"
                      >
                        <div className="p-4 space-y-4">
                          {/* Approach */}
                          {item.approach && (
                            <div>
                              <h5 className="font-semibold text-sm text-orange-400 mb-2">Step-by-Step Approach</h5>
                              <div className="space-y-2">
                                {item.approach.map((step, i) => (
                                  <div key={i} className="flex items-start space-x-2">
                                    <span className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs flex-shrink-0">
                                      {i + 1}
                                    </span>
                                    <span className="text-sm">{step}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Key Considerations */}
                          {item.keyConsiderations && (
                            <div>
                              <h5 className="font-semibold text-sm text-blue-400 mb-2">Key Considerations</h5>
                              <div className="flex flex-wrap gap-2">
                                {item.keyConsiderations.map((consideration, i) => (
                                  <span key={i} className="px-3 py-1 text-sm bg-blue-500/20 text-blue-300 rounded-full">
                                    {consideration}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Ideal Answer */}
                          <div>
                            <h5 className="font-semibold text-sm text-green-400 mb-2 flex items-center">
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Structured Response
                            </h5>
                            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-sm">
                              {item.idealAnswer}
                            </div>
                          </div>

                          {/* Common Pitfalls */}
                          {item.commonPitfalls && (
                            <div>
                              <h5 className="font-semibold text-sm text-red-400 mb-2 flex items-center">
                                <XCircle className="w-4 h-4 mr-2" />
                                Common Pitfalls to Avoid
                              </h5>
                              <ul className="space-y-1">
                                {item.commonPitfalls.map((pitfall, i) => (
                                  <li key={i} className="text-sm flex items-start">
                                    <span className="text-red-400 mr-2">✗</span>
                                    {pitfall}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}

              {/* Common Mistakes */}
              {activeCategory === 'commonMistakes' && interviewData.commonMistakes?.map((item, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: index * 0.1 }}
                  className="glass-card overflow-hidden"
                >
                  <div
                    onClick={() => toggleQuestion('commonMistakes', index)}
                    className="p-4 cursor-pointer hover:bg-white/5 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 flex items-center justify-center text-white font-bold text-sm">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <h4 className="font-semibold text-lg">{item.mistake}</h4>
                    </div>
                    {expandedQuestions[`commonMistakes-${index}`] ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  
                  <AnimatePresence>
                    {expandedQuestions[`commonMistakes-${index}`] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-white/10"
                      >
                        <div className="p-4 space-y-4">
                          {/* Impact */}
                          <div>
                            <h5 className="font-semibold text-sm text-red-400 mb-2 flex items-center">
                              <XCircle className="w-4 h-4 mr-2" />
                              Why This Hurts
                            </h5>
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm">
                              {item.impact}
                            </div>
                          </div>

                          {/* How to Avoid */}
                          <div>
                            <h5 className="font-semibold text-sm text-yellow-400 mb-2 flex items-center">
                              <AlertTriangle className="w-4 h-4 mr-2" />
                              How to Avoid
                            </h5>
                            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-sm">
                              {item.howToAvoid}
                            </div>
                          </div>

                          {/* Better Approach */}
                          <div>
                            <h5 className="font-semibold text-sm text-green-400 mb-2 flex items-center">
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Better Approach
                            </h5>
                            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-sm">
                              {item.betterApproach}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}

      {/* Empty State */}
      {!interviewData && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-12 text-center"
        >
          <Zap className="w-20 h-20 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2">Ready to Ace Your Interview?</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Enter your target job role and experience level to get AI-generated interview questions
            with ideal answer frameworks, STAR method examples, and common mistakes to avoid.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {['Technical Q&A', 'Behavioral STAR', 'System Design', 'Common Mistakes'].map((tag, i) => (
              <span key={i} className="px-3 py-1 text-sm bg-white/10 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default InterviewPrep;
