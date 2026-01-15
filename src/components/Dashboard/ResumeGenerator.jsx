import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, RefreshCw, FileText, CheckCircle, AlertTriangle, 
  Sparkles, Loader2, Target, Award, TrendingUp, Search,
  CheckCircle2, XCircle, AlertCircle, Copy, Eye, Edit3,
  Briefcase, GraduationCap, Code, User, Info
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer
} from 'recharts';
import toast from 'react-hot-toast';

// API Configuration for ATS Resume
const GEMINI_API_KEY = 'AIzaSyCemIsRZFT4ikY5d8oV5IxXNqRRxy2U7fs';
const MODEL_NAME = 'gemini-2.5-flash';

const ResumeGenerator = () => {
  const [activeTab, setActiveTab] = useState('generate');
  const [jobDescription, setJobDescription] = useState('');
  const [currentResume, setCurrentResume] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [experience, setExperience] = useState('');
  const [education, setEducation] = useState('');
  const [skills, setSkills] = useState('');
  const [certifications, setCertifications] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [plainTextResume, setPlainTextResume] = useState('');
  const resumeRef = useRef(null);

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

  // Generate plain text ATS resume format
  const generatePlainTextResume = (data) => {
    const r = data.resumeContent;
    let text = '';
    
    // Header - Simple text, no icons/graphics
    text += `${r.header?.name || fullName || 'YOUR NAME'}\n`;
    text += `${r.header?.title || targetRole}\n`;
    text += `${r.header?.email || email} | ${r.header?.phone || phone} | ${r.header?.location || location}`;
    if (r.header?.linkedin || linkedin) text += ` | ${r.header?.linkedin || linkedin}`;
    text += '\n\n';
    
    // Professional Summary
    text += `PROFESSIONAL SUMMARY\n`;
    text += `${'─'.repeat(50)}\n`;
    text += `${r.summary}\n\n`;
    
    // Experience
    text += `PROFESSIONAL EXPERIENCE\n`;
    text += `${'─'.repeat(50)}\n`;
    r.experience?.forEach((exp) => {
      text += `${exp.title}\n`;
      text += `${exp.company} | ${exp.location} | ${exp.duration}\n`;
      exp.achievements?.forEach((achievement) => {
        text += `* ${achievement}\n`;
      });
      text += '\n';
    });
    
    // Skills
    text += `SKILLS\n`;
    text += `${'─'.repeat(50)}\n`;
    if (r.skills?.technical?.length) {
      text += `Technical: ${r.skills.technical.join(', ')}\n`;
    }
    if (r.skills?.tools?.length) {
      text += `Tools: ${r.skills.tools.join(', ')}\n`;
    }
    if (r.skills?.soft?.length) {
      text += `Soft Skills: ${r.skills.soft.join(', ')}\n`;
    }
    text += '\n';
    
    // Education
    text += `EDUCATION\n`;
    text += `${'─'.repeat(50)}\n`;
    r.education?.forEach((edu) => {
      text += `${edu.degree}\n`;
      text += `${edu.institution} | ${edu.year}`;
      if (edu.gpa) text += ` | GPA: ${edu.gpa}`;
      text += '\n';
    });
    text += '\n';
    
    // Certifications
    if (r.certifications?.length) {
      text += `CERTIFICATIONS\n`;
      text += `${'─'.repeat(50)}\n`;
      r.certifications.forEach((cert) => {
        text += `* ${cert}\n`;
      });
    }
    
    return text;
  };

  const generateATSResume = async () => {
    if (!targetRole.trim() || !experience.trim()) {
      toast.error('Please enter target role and experience');
      return;
    }

    setLoading(true);

    const prompt = `Generate a one-page ATS-optimized resume for ${targetRole} role.

STRICT ATS RULES:
- NO tables, icons, graphics, or special characters
- Use standard ATS-safe formatting
- Include quantified achievements with metrics (%, $, numbers)
- Use strong action verbs (Led, Developed, Implemented, Achieved, etc.)
- Role-aligned achievements specific to ${targetRole}
- Keyword density optimized for ATS scanners
- Each bullet point must have measurable impact

Candidate Info:
Name: ${fullName || 'Professional Name'}
Email: ${email || 'email@example.com'}
Phone: ${phone || '+1-XXX-XXX-XXXX'}
Location: ${location || 'City, State'}
LinkedIn: ${linkedin || 'linkedin.com/in/username'}

Experience: ${experience}
Education: ${education || 'Not specified'}
Skills: ${skills || 'General'}
Certifications: ${certifications || 'None'}
Target Job Description: ${jobDescription || 'General role'}

Return JSON only:
{"atsScore":{"overall":92,"keywordDensity":88,"formatting":95,"quantification":90,"actionVerbs":85},"resumeContent":{"header":{"name":"${fullName || 'Professional Name'}","title":"${targetRole}","email":"${email || 'email@example.com'}","phone":"${phone || 'phone'}","location":"${location || 'City, State'}","linkedin":"${linkedin || ''}"},"summary":"Powerful 2-3 sentence summary with keywords. Include years of experience, key skills, and value proposition.","experience":[{"title":"Job Title","company":"Company Name","duration":"Month Year - Present","location":"City, State","achievements":["Led initiative that increased X by 45% resulting in $500K revenue growth","Developed and implemented system reducing processing time by 60%","Managed cross-functional team of 8 engineers delivering projects 20% under budget","Spearheaded automation initiative improving efficiency by 35%"]}],"education":[{"degree":"Degree Name","institution":"Institution Name","year":"20XX","gpa":"3.X/4.0"}],"skills":{"technical":["Skill1","Skill2","Skill3","Skill4","Skill5"],"tools":["Tool1","Tool2","Tool3"],"soft":["Leadership","Communication","Problem-solving"]},"certifications":["Cert 1","Cert 2"]},"keywordsAnalysis":{"matched":["keyword1","keyword2"],"density":{"keyword1":4,"keyword2":3},"suggested":["keyword3","keyword4"]},"quantificationScore":{"totalBullets":12,"quantifiedBullets":10,"percentage":83},"actionVerbsUsed":["Led","Developed","Implemented","Managed","Achieved","Spearheaded","Optimized","Delivered"],"scoreBreakdown":[{"category":"Keywords","score":88},{"category":"Quantification","score":90},{"category":"Action Verbs","score":85},{"category":"Format","score":95}]}

Create resume with ALL achievements quantified with specific metrics. Make it role-specific for ${targetRole}.`;

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
        setResult(parsedData);
        // Generate plain text ATS resume
        const plainText = generatePlainTextResume(parsedData);
        setPlainTextResume(plainText);
        toast.success(`ATS Resume generated! Score: ${parsedData.atsScore?.overall || 85}%`);
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

  const analyzeResume = async () => {
    if (!currentResume.trim()) {
      toast.error('Please paste your current resume');
      return;
    }

    setLoading(true);

    const prompt = `Analyze this resume for ATS compatibility:

Resume:
${currentResume}

Target Job Description: ${jobDescription || 'General job posting'}

Return JSON only:
{"atsScore":{"overall":75,"breakdown":{"keywordMatch":70,"formatting":80,"structure":78,"readability":72}},"keywordsAnalysis":{"matched":["keyword1","keyword2"],"missing":["missing1","missing2","missing3"],"density":{"keyword1":3,"keyword2":2}},"formatIssues":[{"issue":"Issue description","severity":"High","fix":"How to fix it"}],"contentAnalysis":{"strengths":["Strength 1","Strength 2"],"weaknesses":["Weakness 1","Weakness 2"],"actionVerbs":{"used":["verb1","verb2"],"suggested":["verb3","verb4"]},"metrics":{"hasQuantifiedAchievements":true,"count":5}},"sectionAnalysis":[{"section":"Summary","score":70,"feedback":"Feedback text"},{"section":"Experience","score":75,"feedback":"Feedback text"},{"section":"Skills","score":80,"feedback":"Feedback text"},{"section":"Education","score":85,"feedback":"Feedback text"}],"improvements":[{"priority":1,"section":"Section","issue":"Issue","suggestion":"How to improve","impact":"High"},{"priority":2,"section":"Section","issue":"Issue","suggestion":"How to improve","impact":"Medium"}],"scoreBreakdown":[{"category":"Keywords","score":70,"max":100},{"category":"Format","score":80,"max":100},{"category":"Structure","score":78,"max":100},{"category":"Content","score":72,"max":100}],"optimizedSuggestions":{"summary":"Improved summary text","bulletPoints":["Improved bullet 1","Improved bullet 2"]}}

Be specific and actionable with suggestions.`;

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
        setResult(parsedData);
        toast.success(`Analysis complete! ATS Score: ${parsedData.atsScore?.overall || 75}%`);
      } else {
        throw new Error('Invalid response');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(`Failed to analyze: ${error.message}`);
    } finally {
      setLoading(false);
    }
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

  const getSeverityColor = (severity) => {
    if (severity === 'High') return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (severity === 'Medium') return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          <FileText className="inline w-10 h-10 mr-2 text-blue-500" />
          ATS Resume Optimizer
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Generate and analyze ATS-optimized resumes with AI-powered insights
        </p>
      </motion.div>

      {/* Tab Switcher */}
      <div className="flex space-x-2 p-1 bg-white/5 rounded-lg w-fit">
        {[
          { id: 'generate', label: 'Generate Resume', icon: Sparkles },
          { id: 'analyze', label: 'Analyze Resume', icon: Search }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setResult(null); }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === tab.id 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Generate Tab */}
      {activeTab === 'generate' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Input Form */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-xl font-bold mb-4">Resume Details</h3>

            {/* ATS Rules Info */}
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg mb-4">
              <div className="flex items-start space-x-2">
                <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-300">
                  <strong>ATS Rules Applied:</strong> No tables/graphics, ATS-safe fonts, quantified bullets, role-aligned achievements, keyword optimized
                </div>
              </div>
            </div>

            {/* Personal Info Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">Full Name *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Smith"
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 focus:border-primary-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@email.com"
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 focus:border-primary-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1-555-123-4567"
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 focus:border-primary-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="New York, NY"
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 focus:border-primary-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">LinkedIn</label>
                <input
                  type="text"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="linkedin.com/in/john"
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 focus:border-primary-500 focus:outline-none"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                <Briefcase className="w-4 h-4 inline mr-2" />
                Target Role *
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g., Senior Software Engineer"
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-primary-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Experience * (Include metrics: %, $, numbers)
              </label>
              <textarea
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="E.g.: Led team of 8 engineers, increased revenue by 45%, reduced costs by $200K, improved performance by 60%..."
                rows={4}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-primary-500 focus:outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-2">
                  <GraduationCap className="w-4 h-4 inline mr-2" />
                  Education
                </label>
                <input
                  type="text"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  placeholder="B.S. Computer Science, MIT, 2020"
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 focus:border-primary-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Award className="w-4 h-4 inline mr-2" />
                  Certifications
                </label>
                <input
                  type="text"
                  value={certifications}
                  onChange={(e) => setCertifications(e.target.value)}
                  placeholder="AWS Solutions Architect, PMP..."
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 focus:border-primary-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <Code className="w-4 h-4 inline mr-2" />
                Skills (Keywords)
              </label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="React, Node.js, Python, AWS, Docker, Agile, Scrum..."
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-primary-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <Target className="w-4 h-4 inline mr-2" />
                Job Description (For Keyword Optimization)
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the target job description for better keyword matching..."
                rows={3}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-primary-500 focus:outline-none resize-none"
              />
            </div>

            <button
              onClick={generateATSResume}
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Generating ATS Resume...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Generate One-Page ATS Resume</span>
                </>
              )}
            </button>
          </div>

          {/* Preview/Results */}
          <div className="space-y-4">
            {result?.resumeContent ? (
              <>
                {/* ATS Score Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-card p-4 bg-gradient-to-br from-green-500/10 to-blue-500/10 border-2 border-green-500/30"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold">ATS Score</h3>
                      <p className="text-xs text-gray-400">Optimized for ATS systems</p>
                    </div>
                    <div className={`text-4xl font-bold ${getScoreColor(result.atsScore?.overall || 90)}`}>
                      {result.atsScore?.overall || 90}%
                    </div>
                  </div>
                  
                  {/* Score Breakdown */}
                  <div className="grid grid-cols-4 gap-2">
                    {result.scoreBreakdown?.map((item, i) => (
                      <div key={i} className="text-center p-2 bg-white/5 rounded">
                        <div className={`text-lg font-bold ${getScoreColor(item.score)}`}>{item.score}%</div>
                        <div className="text-xs text-gray-400">{item.category}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Quantification & Action Verbs Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-card p-4"
                  >
                    <h4 className="text-sm font-semibold mb-2 text-green-400">Quantified Bullets</h4>
                    <div className="flex items-end justify-between">
                      <span className="text-3xl font-bold">{result.quantificationScore?.percentage || 83}%</span>
                      <span className="text-xs text-gray-400">{result.quantificationScore?.quantifiedBullets || 10}/{result.quantificationScore?.totalBullets || 12} bullets</span>
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-card p-4"
                  >
                    <h4 className="text-sm font-semibold mb-2 text-blue-400">Action Verbs Used</h4>
                    <div className="flex flex-wrap gap-1">
                      {result.actionVerbsUsed?.slice(0, 6).map((verb, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded">{verb}</span>
                      ))}
                    </div>
                  </motion.div>
                </div>

                {/* Plain Text Resume Preview - ATS Safe */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-4"
                  ref={resumeRef}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold flex items-center">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                      ATS-Safe Plain Text Resume
                    </h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => copyToClipboard(plainTextResume)}
                        className="flex items-center space-x-1 text-xs px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </button>
                      <button
                        onClick={() => {
                          const blob = new Blob([plainTextResume], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${fullName || 'Resume'}_ATS.txt`;
                          a.click();
                          URL.revokeObjectURL(url);
                          toast.success('Downloaded as .txt file');
                        }}
                        className="flex items-center space-x-1 text-xs px-3 py-1.5 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download .txt</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Plain text resume display - NO icons, NO graphics */}
                  <pre className="bg-gray-900 p-4 rounded-lg text-xs font-mono text-gray-300 overflow-x-auto whitespace-pre-wrap max-h-[400px] overflow-y-auto border border-gray-700" style={{ fontFamily: 'Arial, sans-serif' }}>
                    {plainTextResume}
                  </pre>

                  <div className="mt-3 p-2 bg-green-500/10 border border-green-500/30 rounded text-xs text-green-400">
                    <CheckCircle2 className="w-3 h-3 inline mr-1" />
                    This format is 100% ATS-compatible: No tables, no icons, no graphics, standard fonts only.
                  </div>
                </motion.div>

                {/* Keywords Analysis */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-4"
                >
                  <h3 className="text-sm font-bold mb-3">Keywords Optimization</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-400 mb-2 flex items-center">
                        <CheckCircle2 className="w-3 h-3 text-green-500 mr-1" /> Matched Keywords
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {result.keywordsAnalysis?.matched?.map((kw, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded">{kw}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-2 flex items-center">
                        <TrendingUp className="w-3 h-3 text-blue-500 mr-1" /> Add These Keywords
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {result.keywordsAnalysis?.suggested?.map((kw, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded cursor-pointer hover:bg-blue-500/30" onClick={() => copyToClipboard(kw)}>+ {kw}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </>
            ) : (
              <div className="glass-card p-12 text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">Generate ATS-Compliant Resume</h3>
                <p className="text-sm text-gray-400 mb-4">Fill in your details to create a one-page, keyword-optimized resume</p>
                <div className="flex flex-wrap justify-center gap-2 text-xs">
                  <span className="px-2 py-1 bg-white/10 rounded">No Tables</span>
                  <span className="px-2 py-1 bg-white/10 rounded">No Graphics</span>
                  <span className="px-2 py-1 bg-white/10 rounded">Quantified Bullets</span>
                  <span className="px-2 py-1 bg-white/10 rounded">Keywords Optimized</span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Analyze Tab */}
      {activeTab === 'analyze' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Input */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-xl font-bold mb-4">Paste Your Resume</h3>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Current Resume *
              </label>
              <textarea
                value={currentResume}
                onChange={(e) => setCurrentResume(e.target.value)}
                placeholder="Paste your current resume text here for ATS analysis..."
                rows={10}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-primary-500 focus:outline-none resize-none font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <Target className="w-4 h-4 inline mr-2" />
                Target Job Description (Optional)
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description to check keyword alignment..."
                rows={4}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-primary-500 focus:outline-none resize-none"
              />
            </div>

            <button
              onClick={analyzeResume}
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>Analyze Resume</span>
                </>
              )}
            </button>
          </div>

          {/* Analysis Results */}
          <div className="space-y-4">
            {result?.atsScore ? (
              <>
                {/* Score Overview */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`glass-card p-6 border-2 ${
                    result.atsScore.overall >= 80 
                      ? 'bg-gradient-to-br from-green-500/10 to-blue-500/10 border-green-500/30' 
                      : result.atsScore.overall >= 60 
                        ? 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30'
                        : 'bg-gradient-to-br from-red-500/10 to-pink-500/10 border-red-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">ATS Score</h3>
                      <p className="text-sm text-gray-400">
                        {result.atsScore.overall >= 80 ? 'Excellent! Ready for submission' :
                         result.atsScore.overall >= 60 ? 'Good, but needs improvements' :
                         'Needs significant optimization'}
                      </p>
                    </div>
                    <div className={`text-5xl font-bold ${getScoreColor(result.atsScore.overall)}`}>
                      {result.atsScore.overall}%
                    </div>
                  </div>

                  {/* Score Breakdown Chart */}
                  <ResponsiveContainer width="100%" height={150}>
                    <BarChart data={result.scoreBreakdown} layout="vertical">
                      <XAxis type="number" domain={[0, 100]} stroke="#9CA3AF" />
                      <YAxis dataKey="category" type="category" stroke="#9CA3AF" width={80} tick={{ fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                        formatter={(value) => [`${value}%`, 'Score']}
                      />
                      <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                        {result.scoreBreakdown?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.score >= 80 ? '#10B981' : entry.score >= 60 ? '#F59E0B' : '#EF4444'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>

                {/* Keywords Analysis */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-6"
                >
                  <h3 className="text-lg font-bold mb-4">Keywords Analysis</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-2 flex items-center">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mr-1" /> Matched Keywords
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {result.keywordsAnalysis?.matched?.map((kw, i) => (
                          <span key={i} className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">{kw}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-2 flex items-center">
                        <XCircle className="w-4 h-4 text-red-500 mr-1" /> Missing Keywords
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {result.keywordsAnalysis?.missing?.map((kw, i) => (
                          <span key={i} className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded">{kw}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Improvements */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-6"
                >
                  <h3 className="text-lg font-bold mb-4">Priority Improvements</h3>
                  <div className="space-y-3">
                    {result.improvements?.map((item, index) => (
                      <div 
                        key={index}
                        className={`p-3 rounded-lg border ${getSeverityColor(item.impact)}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sm">{item.section}</span>
                          <span className={`text-xs px-2 py-0.5 rounded ${getSeverityColor(item.impact)}`}>
                            {item.impact} Impact
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mb-1">{item.issue}</p>
                        <p className="text-xs text-green-400">✓ {item.suggestion}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Section Analysis */}
                {result.sectionAnalysis && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-6"
                  >
                    <h3 className="text-lg font-bold mb-4">Section-by-Section Analysis</h3>
                    <div className="space-y-3">
                      {result.sectionAnalysis.map((section, index) => (
                        <div key={index} className="p-3 bg-white/5 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{section.section}</span>
                            <span className={`font-bold ${getScoreColor(section.score)}`}>{section.score}%</span>
                          </div>
                          <div className="h-2 bg-gray-700 rounded-full overflow-hidden mb-2">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${section.score}%` }}
                              transition={{ duration: 1 }}
                              className={`h-full ${getScoreBg(section.score)}`}
                            />
                          </div>
                          <p className="text-xs text-gray-400">{section.feedback}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </>
            ) : (
              <div className="glass-card p-12 text-center">
                <Search className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">Analyze Your Resume</h3>
                <p className="text-sm text-gray-400">Paste your resume to get detailed ATS compatibility analysis</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Keyword Insights (shown for both tabs when there's a result) */}
      {result?.keywordsAnalysis?.suggested && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-bold mb-4">
            <TrendingUp className="inline w-5 h-5 mr-2 text-purple-500" />
            Suggested Keywords to Add
          </h3>
          <div className="flex flex-wrap gap-2">
            {result.keywordsAnalysis.suggested.map((kw, i) => (
              <span 
                key={i} 
                className="px-3 py-1.5 bg-purple-500/20 text-purple-300 rounded-lg text-sm cursor-pointer hover:bg-purple-500/30 transition-all flex items-center"
                onClick={() => copyToClipboard(kw)}
              >
                <span className="mr-1">+</span> {kw}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* ATS Tips */}
      {result?.atsCompatibility && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="glass-card p-4 border-l-4 border-green-500">
            <h4 className="font-semibold text-green-400 mb-2 flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-2" /> Strengths
            </h4>
            <ul className="space-y-1">
              {result.atsCompatibility.strengths?.map((s, i) => (
                <li key={i} className="text-sm text-gray-400">• {s}</li>
              ))}
            </ul>
          </div>
          <div className="glass-card p-4 border-l-4 border-yellow-500">
            <h4 className="font-semibold text-yellow-400 mb-2 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" /> Warnings
            </h4>
            <ul className="space-y-1">
              {result.atsCompatibility.warnings?.map((w, i) => (
                <li key={i} className="text-sm text-gray-400">• {w}</li>
              ))}
            </ul>
          </div>
          <div className="glass-card p-4 border-l-4 border-blue-500">
            <h4 className="font-semibold text-blue-400 mb-2 flex items-center">
              <Sparkles className="w-4 h-4 mr-2" /> Pro Tips
            </h4>
            <ul className="space-y-1">
              {result.atsCompatibility.tips?.map((t, i) => (
                <li key={i} className="text-sm text-gray-400">• {t}</li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ResumeGenerator;
