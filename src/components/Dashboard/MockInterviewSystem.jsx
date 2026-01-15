import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic2, RefreshCw, Volume2, CheckCircle, User, Briefcase,
  MessageSquare, Loader2, Sparkles, Award, Target, TrendingUp,
  ChevronRight, Clock, Star, AlertCircle, CheckCircle2, XCircle,
  ThumbsUp, ThumbsDown, Copy, RotateCcw, Play, Pause
} from 'lucide-react';
import { 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell
} from 'recharts';
import toast from 'react-hot-toast';

// API Configuration for Mock Interview
const GEMINI_API_KEY = 'AIzaSyAS6jRVKt6K0-1uGLWPk8XGMPqogv2_9Ew';
const MODEL_NAME = 'gemini-2.5-flash';

const MockInterviewSystem = () => {
  const [jobRole, setJobRole] = useState('');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [interviewType, setInterviewType] = useState('behavioral');
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [interviewHistory, setInterviewHistory] = useState([]);
  const [overallStats, setOverallStats] = useState({ totalScore: 0, questionsAnswered: 0 });

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

  const getNextQuestion = async () => {
    if (!jobRole) {
      toast.error('Please enter job role');
      return;
    }

    setLoading(true);
    setFeedback(null);
    setAnswer('');

    const prompt = `You are a professional interviewer conducting a ${difficulty} level ${interviewType} interview for a ${jobRole} position.

This is question ${questionCount + 1} of the interview.

Generate ONE interview question. Return JSON only:
{
  "question": "A specific, professional interview question appropriate for ${jobRole} at ${difficulty} level",
  "type": "${interviewType}",
  "difficulty": "${difficulty}",
  "timeToAnswer": "2-3 minutes",
  "whatToLookFor": ["Key point interviewer looks for 1", "Key point 2", "Key point 3"],
  "context": "Brief context about why this question is asked for this role",
  "interviewerNote": "What would make a strong vs weak answer"
}

Be professional and ask questions that real interviewers ask for ${jobRole} positions. Question type: ${interviewType}.`;

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
              maxOutputTokens: 2048,
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
        setCurrentQuestion(parsedData);
        setQuestionCount(prev => prev + 1);
        setInterviewStarted(true);
        toast.success('Question ready!');
      } else {
        throw new Error('Invalid response');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(`Failed to get question: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim()) {
      toast.error('Please provide an answer');
      return;
    }

    setLoading(true);

    const prompt = `You are a professional interviewer evaluating a candidate's response.

INTERVIEW CONTEXT:
- Role: ${jobRole}
- Difficulty: ${difficulty}
- Question Type: ${interviewType}

QUESTION ASKED:
"${currentQuestion?.question}"

CANDIDATE'S ANSWER:
"${answer}"

Evaluate this response as a professional interviewer would. Return JSON only:
{
  "overallScore": 75,
  "scores": {
    "communication": {"score": 78, "feedback": "Specific feedback on communication clarity"},
    "clarity": {"score": 72, "feedback": "Specific feedback on answer clarity and structure"},
    "relevance": {"score": 80, "feedback": "How relevant the answer was to the question"},
    "depth": {"score": 70, "feedback": "Depth of knowledge demonstrated"},
    "confidence": {"score": 75, "feedback": "Perceived confidence in delivery"}
  },
  "structuredFeedback": {
    "strengths": ["Specific strength 1", "Specific strength 2"],
    "improvements": ["Specific area to improve 1", "Specific area to improve 2"],
    "missingPoints": ["Important point they should have mentioned"]
  },
  "improvedAnswer": "A model answer that demonstrates how the candidate could have answered better. This should be a complete, well-structured response that the candidate can learn from.",
  "interviewerVerdict": "Brief professional assessment as an interviewer would give",
  "tips": ["Actionable tip 1 for improvement", "Actionable tip 2"],
  "wouldHire": "yes/maybe/no - based on this answer alone",
  "followUpQuestion": "A follow-up question an interviewer might ask based on this answer"
}

Be constructive but honest. Provide specific, actionable feedback.`;

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
              maxOutputTokens: 4096,
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
        setFeedback(parsedData);
        
        // Update history and stats
        setInterviewHistory(prev => [...prev, {
          question: currentQuestion?.question,
          answer: answer,
          score: parsedData.overallScore,
          feedback: parsedData
        }]);
        
        setOverallStats(prev => ({
          totalScore: prev.totalScore + parsedData.overallScore,
          questionsAnswered: prev.questionsAnswered + 1
        }));
        
        toast.success('Answer evaluated!');
      } else {
        throw new Error('Invalid response');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(`Failed to evaluate: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetInterview = () => {
    setInterviewStarted(false);
    setCurrentQuestion(null);
    setAnswer('');
    setFeedback(null);
    setQuestionCount(0);
    setInterviewHistory([]);
    setOverallStats({ totalScore: 0, questionsAnswered: 0 });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied!');
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

  const getHireColor = (verdict) => {
    if (verdict === 'yes') return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (verdict === 'maybe') return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  const radarData = feedback?.scores ? [
    { metric: 'Communication', value: feedback.scores.communication?.score || 0 },
    { metric: 'Clarity', value: feedback.scores.clarity?.score || 0 },
    { metric: 'Relevance', value: feedback.scores.relevance?.score || 0 },
    { metric: 'Depth', value: feedback.scores.depth?.score || 0 },
    { metric: 'Confidence', value: feedback.scores.confidence?.score || 0 },
  ] : [];

  const avgScore = overallStats.questionsAnswered > 0 
    ? Math.round(overallStats.totalScore / overallStats.questionsAnswered) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          <Mic2 className="inline w-10 h-10 mr-2 text-orange-500" />
          AI Mock Interview
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Practice with a professional AI interviewer and get instant feedback
        </p>
      </motion.div>

      {/* Stats Bar (when interview started) */}
      {interviewStarted && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 flex items-center justify-between"
        >
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-orange-400" />
              <span className="text-sm">Question {questionCount}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-blue-400" />
              <span className="text-sm">{interviewType}</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-sm">Avg Score: <span className={getScoreColor(avgScore)}>{avgScore}%</span></span>
            </div>
          </div>
          <button
            onClick={resetInterview}
            className="flex items-center space-x-1 px-3 py-1.5 text-xs bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
          >
            <RotateCcw className="w-3 h-3" />
            <span>End Interview</span>
          </button>
        </motion.div>
      )}

      {/* Setup Screen */}
      {!interviewStarted ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-8 max-w-xl mx-auto"
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-orange-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Start Your Interview</h2>
            <p className="text-sm text-gray-400">Configure your mock interview session</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                <Briefcase className="w-4 h-4 inline mr-2" />
                Target Role *
              </label>
              <input
                type="text"
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                placeholder="e.g., Senior Software Engineer"
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Interview Type</label>
                <select
                  value={interviewType}
                  onChange={(e) => setInterviewType(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-orange-500 focus:outline-none"
                >
                  <option value="behavioral">Behavioral</option>
                  <option value="technical">Technical</option>
                  <option value="situational">Situational</option>
                  <option value="competency">Competency-based</option>
                  <option value="case">Case Study</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-orange-500 focus:outline-none"
                >
                  <option value="junior">Junior</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="senior">Senior</option>
                  <option value="executive">Executive</option>
                </select>
              </div>
            </div>

            <button
              onClick={getNextQuestion}
              disabled={loading}
              className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Preparing Interview...</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  <span>Start Interview</span>
                </>
              )}
            </button>
          </div>

          {/* Process Info */}
          <div className="mt-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
            <h4 className="text-sm font-semibold text-orange-400 mb-2">Interview Process:</h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
              <div className="flex items-center space-x-2">
                <ChevronRight className="w-3 h-3 text-orange-400" />
                <span>One question at a time</span>
              </div>
              <div className="flex items-center space-x-2">
                <ChevronRight className="w-3 h-3 text-orange-400" />
                <span>Detailed evaluation</span>
              </div>
              <div className="flex items-center space-x-2">
                <ChevronRight className="w-3 h-3 text-orange-400" />
                <span>Structured feedback</span>
              </div>
              <div className="flex items-center space-x-2">
                <ChevronRight className="w-3 h-3 text-orange-400" />
                <span>Improved answer suggestion</span>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Question & Answer Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* Interviewer Question */}
            <div className="glass-card p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-orange-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-semibold text-orange-400">Interviewer</span>
                    <span className="text-xs px-2 py-0.5 bg-white/10 rounded">{currentQuestion?.type}</span>
                    <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {currentQuestion?.timeToAnswer}
                    </span>
                  </div>
                  <p className="text-lg font-medium leading-relaxed">"{currentQuestion?.question}"</p>
                  
                  {currentQuestion?.context && (
                    <p className="text-xs text-gray-500 mt-2 italic">Context: {currentQuestion.context}</p>
                  )}
                </div>
              </div>

              {/* What to look for (hidden hint) */}
              {currentQuestion?.whatToLookFor && (
                <details className="mt-4 p-3 bg-white/5 rounded-lg">
                  <summary className="text-xs text-gray-400 cursor-pointer">💡 Hint: Key points to cover</summary>
                  <ul className="mt-2 space-y-1">
                    {currentQuestion.whatToLookFor.map((point, i) => (
                      <li key={i} className="text-xs text-gray-500 flex items-start">
                        <CheckCircle className="w-3 h-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>

            {/* Answer Input */}
            <div className="glass-card p-6">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-sm font-semibold text-blue-400">Your Response</span>
              </div>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here... Be specific, use examples, and structure your response clearly."
                rows={8}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-orange-500 focus:outline-none resize-none"
                disabled={feedback !== null}
              />
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-500">{answer.split(/\s+/).filter(Boolean).length} words</span>
                {!feedback && (
                  <button
                    onClick={submitAnswer}
                    disabled={loading || !answer.trim()}
                    className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50 flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Evaluating...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Submit Answer</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Feedback Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {feedback ? (
              <>
                {/* Score Overview */}
                <div className="glass-card p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">Evaluation Score</h3>
                      <p className="text-xs text-gray-400">Professional interviewer assessment</p>
                    </div>
                    <div className="text-center">
                      <div className={`text-4xl font-bold ${getScoreColor(feedback.overallScore)}`}>
                        {feedback.overallScore}
                      </div>
                      <div className="text-xs text-gray-400">/ 100</div>
                    </div>
                  </div>

                  {/* Hire Verdict */}
                  <div className={`p-3 rounded-lg border ${getHireColor(feedback.wouldHire)} text-center`}>
                    <span className="text-sm font-semibold">
                      {feedback.wouldHire === 'yes' && '✓ Would likely hire based on this answer'}
                      {feedback.wouldHire === 'maybe' && '? More evidence needed - borderline answer'}
                      {feedback.wouldHire === 'no' && '✗ Answer needs significant improvement'}
                    </span>
                  </div>
                </div>

                {/* Radar Chart */}
                <div className="glass-card p-4">
                  <h4 className="text-sm font-semibold mb-2">Communication & Clarity Scores</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#374151" />
                      <PolarAngleAxis dataKey="metric" stroke="#9CA3AF" tick={{ fontSize: 10 }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 8 }} />
                      <Radar name="Score" dataKey="value" stroke="#F97316" fill="#F97316" fillOpacity={0.5} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Structured Feedback */}
                <div className="glass-card p-4 space-y-3">
                  <h4 className="text-sm font-semibold">Structured Feedback</h4>
                  
                  {/* Strengths */}
                  <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-xs font-semibold text-green-400 mb-2 flex items-center">
                      <ThumbsUp className="w-3 h-3 mr-1" /> Strengths
                    </p>
                    <ul className="space-y-1">
                      {feedback.structuredFeedback?.strengths?.map((s, i) => (
                        <li key={i} className="text-xs text-green-300 flex items-start">
                          <CheckCircle2 className="w-3 h-3 mr-2 mt-0.5 flex-shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Improvements */}
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <p className="text-xs font-semibold text-yellow-400 mb-2 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" /> Areas to Improve
                    </p>
                    <ul className="space-y-1">
                      {feedback.structuredFeedback?.improvements?.map((s, i) => (
                        <li key={i} className="text-xs text-yellow-300 flex items-start">
                          <ChevronRight className="w-3 h-3 mr-2 mt-0.5 flex-shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Missing Points */}
                  {feedback.structuredFeedback?.missingPoints?.length > 0 && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <p className="text-xs font-semibold text-red-400 mb-2 flex items-center">
                        <XCircle className="w-3 h-3 mr-1" /> Missing Points
                      </p>
                      <ul className="space-y-1">
                        {feedback.structuredFeedback.missingPoints.map((s, i) => (
                          <li key={i} className="text-xs text-red-300 flex items-start">
                            <ChevronRight className="w-3 h-3 mr-2 mt-0.5 flex-shrink-0" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Improved Answer */}
                <div className="glass-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-blue-400 flex items-center">
                      <Sparkles className="w-4 h-4 mr-2" /> Suggested Improved Answer
                    </h4>
                    <button
                      onClick={() => copyToClipboard(feedback.improvedAnswer)}
                      className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </button>
                  </div>
                  <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-sm text-gray-300 leading-relaxed max-h-48 overflow-y-auto">
                    {feedback.improvedAnswer}
                  </div>
                </div>

                {/* Interviewer Verdict & Tips */}
                <div className="glass-card p-4">
                  <h4 className="text-sm font-semibold mb-2">Interviewer's Take</h4>
                  <p className="text-sm text-gray-300 italic mb-3">"{feedback.interviewerVerdict}"</p>
                  
                  <h4 className="text-sm font-semibold mb-2 text-orange-400">💡 Tips for Improvement</h4>
                  <ul className="space-y-1">
                    {feedback.tips?.map((tip, i) => (
                      <li key={i} className="text-xs text-gray-400 flex items-start">
                        <Star className="w-3 h-3 text-orange-400 mr-2 mt-0.5 flex-shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Follow-up Question Preview */}
                {feedback.followUpQuestion && (
                  <div className="glass-card p-4 bg-purple-500/10 border border-purple-500/30">
                    <p className="text-xs text-purple-400 mb-1">Potential Follow-up Question:</p>
                    <p className="text-sm text-gray-300">"{feedback.followUpQuestion}"</p>
                  </div>
                )}

                {/* Next Question Button */}
                <button
                  onClick={getNextQuestion}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Loading Next Question...</span>
                    </>
                  ) : (
                    <>
                      <ChevronRight className="w-5 h-5" />
                      <span>Next Question</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <div className="glass-card p-12 text-center h-full flex flex-col items-center justify-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">Submit Your Answer</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Type your response and submit to receive professional feedback
                </p>
                <div className="flex flex-wrap justify-center gap-2 text-xs">
                  <span className="px-2 py-1 bg-white/10 rounded">Communication Score</span>
                  <span className="px-2 py-1 bg-white/10 rounded">Clarity Score</span>
                  <span className="px-2 py-1 bg-white/10 rounded">Structured Feedback</span>
                  <span className="px-2 py-1 bg-white/10 rounded">Model Answer</span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MockInterviewSystem;
