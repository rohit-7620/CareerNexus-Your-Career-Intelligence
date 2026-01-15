import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Copy, RefreshCw, Loader2, Sparkles, Building2, 
  User, Briefcase, Target, Heart, Rocket, CheckCircle2,
  AlertCircle, Info, Download, Edit3
} from 'lucide-react';
import toast from 'react-hot-toast';

// API Configuration for Cover Letter
const GEMINI_API_KEY = 'AIzaSyAnBHpmEmAZEuIiLqeTsJj1ulq-b0oV7rI';
const MODEL_NAME = 'gemini-2.5-flash';

const CoverLetterGenerator = () => {
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [userProfile, setUserProfile] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [keySkills, setKeySkills] = useState('');
  const [loading, setLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState(null);
  const [letterAnalysis, setLetterAnalysis] = useState(null);
  const [wordCount, setWordCount] = useState(0);

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

  const generateCoverLetter = async () => {
    if (!jobTitle || !companyName || !jobDescription) {
      toast.error('Please fill in job title, company name, and job description');
      return;
    }

    setLoading(true);

    const prompt = `Write a professional cover letter for the ${jobTitle} position at ${companyName}.

STRICT REQUIREMENTS:
- Maximum 350 words (CRITICAL - count carefully)
- Human, professional tone (not robotic)
- Four clear sections: Role Relevance, Value Proposition, Cultural Alignment, Call to Action

INPUT DATA:
Job Description: ${jobDescription}
Company: ${companyName}
Position: ${jobTitle}
Candidate Profile: ${userProfile || 'Experienced professional'}
Years of Experience: ${yearsExperience || '3-5 years'}
Key Skills: ${keySkills || 'Relevant industry skills'}

Return JSON only:
{"coverLetter":{"opening":"Dear Hiring Manager,","roleRelevance":"A compelling paragraph (50-80 words) explaining why you're excited about this specific role and how your background directly aligns with the position requirements. Reference specific job requirements.","valueProposition":"A powerful paragraph (80-100 words) highlighting your unique value - specific achievements, quantified results, and skills that would benefit ${companyName}. Include metrics where possible.","culturalAlignment":"A paragraph (50-70 words) demonstrating your knowledge of ${companyName}'s culture, mission, or values and how you align with them. Show you've researched the company.","callToAction":"A strong closing paragraph (40-50 words) expressing enthusiasm, requesting an interview, and thanking them. End with confidence.","closing":"Sincerely,\\n[Your Name]"},"fullLetter":"The complete cover letter as one flowing text with proper paragraph breaks","wordCount":320,"analysis":{"toneScore":92,"relevanceScore":88,"uniquenessScore":85,"keywordsMatched":["keyword1","keyword2","keyword3"],"strengths":["Strength 1","Strength 2"],"suggestions":["Suggestion if any"]}}

Write authentically as a real person would. Avoid clichés like "I am writing to express my interest" - be direct and engaging. The letter should feel genuine and specific to ${companyName}.`;

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
        setCoverLetter(parsedData.coverLetter);
        setLetterAnalysis(parsedData.analysis);
        setWordCount(parsedData.wordCount || parsedData.fullLetter?.split(/\s+/).length || 0);
        toast.success('Cover letter generated!');
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

  const getFullLetterText = () => {
    if (!coverLetter) return '';
    return `${coverLetter.opening}

${coverLetter.roleRelevance}

${coverLetter.valueProposition}

${coverLetter.culturalAlignment}

${coverLetter.callToAction}

${coverLetter.closing}`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getFullLetterText());
    toast.success('Copied to clipboard!');
  };

  const downloadAsTxt = () => {
    const blob = new Blob([getFullLetterText()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Cover_Letter_${companyName.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded!');
  };

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          <FileText className="inline w-10 h-10 mr-2 text-purple-500" />
          Smart Cover Letter Generator
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create personalized, company-aligned cover letters with AI
        </p>
      </motion.div>

      {/* Constraints Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg flex items-center space-x-3"
      >
        <Info className="w-5 h-5 text-purple-400 flex-shrink-0" />
        <div className="text-sm text-purple-300">
          <strong>Output:</strong> Max 350 words • Human, professional tone • 4 key sections: Role Relevance, Value Proposition, Cultural Alignment, Strong CTA
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-6 space-y-4"
        >
          <h3 className="text-xl font-bold mb-4">Input Details</h3>

          <div className="grid grid-cols-2 gap-3">
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
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                <Building2 className="w-4 h-4 inline mr-2" />
                Company Name *
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g., Google"
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              <Target className="w-4 h-4 inline mr-2" />
              Job Description *
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here..."
              rows={4}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-purple-500 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Your Profile / Background
            </label>
            <textarea
              value={userProfile}
              onChange={(e) => setUserProfile(e.target.value)}
              placeholder="Brief summary of your background, achievements, and what makes you unique..."
              rows={3}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-purple-500 focus:outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-2">Years Experience</label>
              <select
                value={yearsExperience}
                onChange={(e) => setYearsExperience(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-purple-500 focus:outline-none"
              >
                <option value="">Select...</option>
                <option value="0-1 years">0-1 years</option>
                <option value="2-3 years">2-3 years</option>
                <option value="4-5 years">4-5 years</option>
                <option value="6-8 years">6-8 years</option>
                <option value="10+ years">10+ years</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Key Skills</label>
              <input
                type="text"
                value={keySkills}
                onChange={(e) => setKeySkills(e.target.value)}
                placeholder="React, Python, Leadership..."
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={generateCoverLetter}
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
                <span>Generate Cover Letter</span>
              </>
            )}
          </button>
        </motion.div>

        {/* Output Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          {coverLetter ? (
            <>
              {/* Word Count & Scores */}
              <div className="glass-card p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${wordCount <= 350 ? 'text-green-500' : 'text-red-500'}`}>
                        {wordCount}
                      </div>
                      <div className="text-xs text-gray-400">/ 350 words</div>
                    </div>
                    {letterAnalysis && (
                      <>
                        <div className="h-8 w-px bg-white/20"></div>
                        <div className="text-center">
                          <div className={`text-xl font-bold ${getScoreColor(letterAnalysis.toneScore)}`}>
                            {letterAnalysis.toneScore}%
                          </div>
                          <div className="text-xs text-gray-400">Tone</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-xl font-bold ${getScoreColor(letterAnalysis.relevanceScore)}`}>
                            {letterAnalysis.relevanceScore}%
                          </div>
                          <div className="text-xs text-gray-400">Relevance</div>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center space-x-1 px-3 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 text-sm"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </button>
                    <button
                      onClick={downloadAsTxt}
                      className="flex items-center space-x-1 px-3 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 text-sm"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Cover Letter Sections */}
              <div className="glass-card p-6 space-y-4 max-h-[500px] overflow-y-auto">
                {/* Opening */}
                <div className="text-gray-300 font-medium">
                  {coverLetter.opening}
                </div>

                {/* Role Relevance */}
                <div className="p-4 bg-blue-500/10 border-l-4 border-blue-500 rounded-r-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Role Relevance</span>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">{coverLetter.roleRelevance}</p>
                </div>

                {/* Value Proposition */}
                <div className="p-4 bg-green-500/10 border-l-4 border-green-500 rounded-r-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Rocket className="w-4 h-4 text-green-400" />
                    <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">Value Proposition</span>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">{coverLetter.valueProposition}</p>
                </div>

                {/* Cultural Alignment */}
                <div className="p-4 bg-purple-500/10 border-l-4 border-purple-500 rounded-r-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Heart className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Cultural Alignment</span>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">{coverLetter.culturalAlignment}</p>
                </div>

                {/* Call to Action */}
                <div className="p-4 bg-orange-500/10 border-l-4 border-orange-500 rounded-r-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-orange-400" />
                    <span className="text-xs font-semibold text-orange-400 uppercase tracking-wider">Call to Action</span>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">{coverLetter.callToAction}</p>
                </div>

                {/* Closing */}
                <div className="text-gray-300 whitespace-pre-line">
                  {coverLetter.closing}
                </div>
              </div>

              {/* Analysis */}
              {letterAnalysis && (
                <div className="glass-card p-4">
                  <h4 className="text-sm font-semibold mb-3">Letter Analysis</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-400 mb-2 flex items-center">
                        <CheckCircle2 className="w-3 h-3 text-green-500 mr-1" /> Strengths
                      </p>
                      <div className="space-y-1">
                        {letterAnalysis.strengths?.map((s, i) => (
                          <div key={i} className="text-xs text-green-400">• {s}</div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-2 flex items-center">
                        <Target className="w-3 h-3 text-blue-500 mr-1" /> Keywords Matched
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {letterAnalysis.keywordsMatched?.map((kw, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">{kw}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="glass-card p-12 text-center h-full flex flex-col items-center justify-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">Generate Your Cover Letter</h3>
              <p className="text-sm text-gray-400 mb-4">
                Fill in the job details and your profile to create a personalized cover letter
              </p>
              <div className="flex flex-wrap justify-center gap-2 text-xs">
                <span className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-full flex items-center">
                  <Target className="w-3 h-3 mr-1" /> Role Relevance
                </span>
                <span className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-full flex items-center">
                  <Rocket className="w-3 h-3 mr-1" /> Value Proposition
                </span>
                <span className="px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-full flex items-center">
                  <Heart className="w-3 h-3 mr-1" /> Cultural Fit
                </span>
                <span className="px-3 py-1.5 bg-orange-500/20 text-orange-400 rounded-full flex items-center">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Strong CTA
                </span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CoverLetterGenerator;
