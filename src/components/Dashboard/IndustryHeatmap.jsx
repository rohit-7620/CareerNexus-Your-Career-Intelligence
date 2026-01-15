import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Plot from 'react-plotly.js';
import { 
  TrendingUp, 
  Globe, 
  MapPin, 
  BarChart3, 
  Target, 
  Zap, 
  Brain, 
  Sparkles,
  Shield,
  DollarSign,
  Users,
  AlertTriangle,
  ChevronRight,
  Filter,
  RefreshCw
} from 'lucide-react';
import industryHeatmapService from '../../services/ai/industryHeatmapService';
import toast from 'react-hot-toast';

const IndustryHeatmap = () => {
  const [heatmapData, setHeatmapData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('india');
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const [userProfile, setUserProfile] = useState({
    skills: ['JavaScript', 'React', 'Python', 'Node.js'],
    experience: '2-5 years',
    interests: ['AI/ML', 'Web Development', 'Cloud Computing'],
    location: 'India'
  });

  useEffect(() => {
    generateHeatmap();
  }, []);

  const generateHeatmap = async () => {
    setIsLoading(true);
    try {
      const data = await industryHeatmapService.generateIndustryHeatmap(userProfile);
      setHeatmapData(data);
      toast.success('Industry heatmap generated successfully!');
    } catch (error) {
      console.error('Failed to generate heatmap:', error);
      toast.error('Using fallback industry data');
      setHeatmapData(industryHeatmapService.getFallbackData());
    } finally {
      setIsLoading(false);
    }
  };

  const getDemandColor = (level) => {
    switch (level) {
      case 'High': return 'text-green-500 bg-green-500/20';
      case 'Medium': return 'text-yellow-500 bg-yellow-500/20';
      case 'Low': return 'text-red-500 bg-red-500/20';
      default: return 'text-gray-500 bg-gray-500/20';
    }
  };

  const getSaturationColor = (level) => {
    switch (level) {
      case 'Low': return 'text-green-500';
      case 'Medium': return 'text-yellow-500';
      case 'High': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getEntryBarrierStars = (score) => {
    return '★'.repeat(score) + '☆'.repeat(5 - score);
  };

  // Prepare Plotly Heatmap Data
  const getHeatmapPlotData = () => {
    if (!heatmapData?.industries) return null;

    const industries = heatmapData.industries.map(i => i.name.split(' ')[0]);
    const metrics = ['Demand', 'Salary Growth', 'Entry Barrier', 'Saturation'];
    
    const z = heatmapData.industries.map(industry => [
      industry.demandScore,
      industry.salaryGrowth[selectedRegion]['2028'],
      industry.entryBarrier * 20,
      industry.saturationPercent
    ]);

    return [{
      z: z,
      x: metrics,
      y: industries,
      type: 'heatmap',
      colorscale: [
        [0, '#1e3a5f'],
        [0.25, '#2563eb'],
        [0.5, '#7c3aed'],
        [0.75, '#f59e0b'],
        [1, '#10b981']
      ],
      showscale: true,
      colorbar: {
        title: 'Score',
        titleside: 'right'
      },
      hovertemplate: '<b>%{y}</b><br>%{x}: %{z}<extra></extra>'
    }];
  };

  // Prepare Salary Growth Line Chart Data
  const getSalaryGrowthPlotData = () => {
    if (!heatmapData?.industries) return null;

    const years = ['2024', '2025', '2026', '2027', '2028'];
    const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'];
    
    return heatmapData.industries.slice(0, 5).map((industry, idx) => ({
      x: years,
      y: years.map(year => industry.salaryGrowth[selectedRegion][year]),
      type: 'scatter',
      mode: 'lines+markers',
      name: industry.name.split(' ').slice(0, 2).join(' '),
      line: { color: colors[idx], width: 3 },
      marker: { size: 8 }
    }));
  };

  // Prepare Entry Barrier Bar Chart
  const getEntryBarrierPlotData = () => {
    if (!heatmapData?.industries) return null;

    return [{
      x: heatmapData.industries.map(i => i.name.split(' ').slice(0, 2).join(' ')),
      y: heatmapData.industries.map(i => i.entryBarrier),
      type: 'bar',
      marker: {
        color: heatmapData.industries.map(i => {
          if (i.entryBarrier <= 2) return '#10b981';
          if (i.entryBarrier <= 3) return '#f59e0b';
          return '#ef4444';
        })
      },
      hovertemplate: '<b>%{x}</b><br>Entry Barrier: %{y}/5<extra></extra>'
    }];
  };

  // Prepare Demand vs Saturation Scatter
  const getDemandSaturationPlotData = () => {
    if (!heatmapData?.industries) return null;

    return [{
      x: heatmapData.industries.map(i => i.saturationPercent),
      y: heatmapData.industries.map(i => i.demandScore),
      text: heatmapData.industries.map(i => i.name.split(' ').slice(0, 2).join(' ')),
      mode: 'markers+text',
      type: 'scatter',
      textposition: 'top center',
      marker: {
        size: heatmapData.industries.map(i => i.salaryGrowth[selectedRegion]['2028'] + 10),
        color: heatmapData.industries.map((_, idx) => {
          const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'];
          return colors[idx % colors.length];
        }),
        opacity: 0.8
      },
      hovertemplate: '<b>%{text}</b><br>Saturation: %{x}%<br>Demand: %{y}<extra></extra>'
    }];
  };

  const plotLayout = {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { color: '#9ca3af', family: 'Inter, sans-serif' },
    margin: { t: 40, r: 20, b: 60, l: 100 },
    xaxis: { gridcolor: 'rgba(156, 163, 175, 0.1)' },
    yaxis: { gridcolor: 'rgba(156, 163, 175, 0.1)' }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Sparkles className="w-16 h-16 mx-auto text-purple-500 animate-spin mb-4" />
          <h2 className="text-2xl font-bold mb-2">Analyzing Industry Trends...</h2>
          <p className="text-gray-500">Generating AI-powered market intelligence</p>
        </motion.div>
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
            <TrendingUp className="w-10 h-10 mr-3 text-green-500" />
            Industry Heatmap
          </h1>
          <p className="text-gray-500 flex items-center">
            <Brain className="w-4 h-4 mr-2 text-purple-500" />
            AI-Powered Market Intelligence • Top 10 Industries Analysis
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Region Toggle */}
          <div className="flex items-center bg-gray-800/50 rounded-lg p-1">
            <button
              onClick={() => setSelectedRegion('india')}
              className={`flex items-center px-4 py-2 rounded-lg transition-all ${
                selectedRegion === 'india' 
                  ? 'bg-gradient-to-r from-orange-500 to-green-500 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <MapPin className="w-4 h-4 mr-2" />
              India
            </button>
            <button
              onClick={() => setSelectedRegion('global')}
              className={`flex items-center px-4 py-2 rounded-lg transition-all ${
                selectedRegion === 'global' 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Globe className="w-4 h-4 mr-2" />
              Global
            </button>
          </div>

          <button
            onClick={generateHeatmap}
            className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-all"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </motion.div>

      {/* Summary Card */}
      {heatmapData?.summary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 border-2 border-purple-500/30"
        >
          <div className="flex items-start gap-4">
            <Sparkles className="w-8 h-8 text-purple-500 flex-shrink-0 animate-pulse" />
            <div>
              <h2 className="text-xl font-bold mb-2 gradient-text">AI Market Summary</h2>
              <p className="text-gray-300 leading-relaxed">{heatmapData.summary}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Table - Top 10 Industries */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 overflow-x-auto"
      >
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <BarChart3 className="w-6 h-6 mr-2 text-blue-500" />
          Top 10 Industries for Your Profile
          <span className="ml-3 text-sm font-normal text-gray-500">
            ({selectedRegion === 'india' ? '🇮🇳 India' : '🌍 Global'})
          </span>
        </h2>

        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 px-2 text-sm font-semibold text-gray-400">#</th>
              <th className="text-left py-3 px-2 text-sm font-semibold text-gray-400">Industry</th>
              <th className="text-center py-3 px-2 text-sm font-semibold text-gray-400">Demand</th>
              <th className="text-center py-3 px-2 text-sm font-semibold text-gray-400">Salary Growth (2024-28)</th>
              <th className="text-center py-3 px-2 text-sm font-semibold text-gray-400">Skill Saturation</th>
              <th className="text-center py-3 px-2 text-sm font-semibold text-gray-400">Entry Barrier</th>
              <th className="text-center py-3 px-2 text-sm font-semibold text-gray-400">Avg Salary</th>
            </tr>
          </thead>
          <tbody>
            {heatmapData?.industries?.map((industry, idx) => (
              <motion.tr
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => setSelectedIndustry(selectedIndustry === idx ? null : idx)}
                className={`border-b border-gray-800 cursor-pointer transition-all hover:bg-white/5 ${
                  selectedIndustry === idx ? 'bg-purple-500/10' : ''
                }`}
              >
                <td className="py-4 px-2">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    idx < 3 ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black' : 'bg-gray-700 text-gray-300'
                  }`}>
                    {industry.rank}
                  </span>
                </td>
                <td className="py-4 px-2">
                  <div className="flex items-center">
                    <ChevronRight className={`w-4 h-4 mr-2 transition-transform ${
                      selectedIndustry === idx ? 'rotate-90' : ''
                    }`} />
                    <div>
                      <p className="font-semibold text-white">{industry.name}</p>
                      <p className="text-xs text-gray-500">{industry.jobGrowthRate} job growth</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-2 text-center">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDemandColor(industry.demandLevel)}`}>
                    {industry.demandLevel}
                  </span>
                </td>
                <td className="py-4 px-2 text-center">
                  <div className="flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 mr-1 text-green-500" />
                    <span className="text-green-400 font-semibold">
                      +{industry.salaryGrowth[selectedRegion]['2024']}% → +{industry.salaryGrowth[selectedRegion]['2028']}%
                    </span>
                  </div>
                </td>
                <td className="py-4 px-2 text-center">
                  <div className="flex flex-col items-center">
                    <span className={`font-medium ${getSaturationColor(industry.skillSaturation)}`}>
                      {industry.skillSaturation}
                    </span>
                    <div className="w-20 h-2 bg-gray-700 rounded-full mt-1">
                      <div 
                        className={`h-full rounded-full ${
                          industry.saturationPercent < 35 ? 'bg-green-500' :
                          industry.saturationPercent < 55 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${industry.saturationPercent}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="py-4 px-2 text-center">
                  <span className={`text-lg ${
                    industry.entryBarrier <= 2 ? 'text-green-400' :
                    industry.entryBarrier <= 3 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {getEntryBarrierStars(industry.entryBarrier)}
                  </span>
                </td>
                <td className="py-4 px-2 text-center">
                  <span className="text-blue-400 font-semibold">
                    {industry.avgSalary[selectedRegion]}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {/* Expanded Industry Details */}
        <AnimatePresence>
          {selectedIndustry !== null && heatmapData?.industries[selectedIndustry] && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-purple-500/30"
            >
              {(() => {
                const industry = heatmapData.industries[selectedIndustry];
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-purple-400 mb-2">Description</h4>
                      <p className="text-gray-300 text-sm">{industry.description}</p>
                      
                      <h4 className="font-semibold text-purple-400 mt-4 mb-2">Entry Barrier</h4>
                      <p className="text-gray-300 text-sm">{industry.entryBarrierDescription}</p>
                      
                      <h4 className="font-semibold text-purple-400 mt-4 mb-2">Future Outlook</h4>
                      <p className="text-gray-300 text-sm">{industry.futureOutlook}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-purple-400 mb-2">Top Skills Required</h4>
                      <div className="flex flex-wrap gap-2">
                        {industry.topSkillsRequired?.map((skill, i) => (
                          <span key={i} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                      
                      <h4 className="font-semibold text-purple-400 mt-4 mb-2">
                        Top Companies ({selectedRegion === 'india' ? 'India' : 'Global'})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {industry.topCompanies?.[selectedRegion]?.map((company, i) => (
                          <span key={i} className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                            {company}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Salary Growth Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-green-500" />
            Salary Growth Trend (2024-2028)
            <span className="ml-2 text-sm font-normal text-gray-500">Top 5 Industries</span>
          </h3>
          {heatmapData?.industries && (
            <Plot
              data={getSalaryGrowthPlotData()}
              layout={{
                ...plotLayout,
                height: 350,
                showlegend: true,
                legend: { orientation: 'h', y: -0.2 },
                xaxis: { ...plotLayout.xaxis, title: 'Year' },
                yaxis: { ...plotLayout.yaxis, title: 'Growth %' }
              }}
              config={{ responsive: true, displayModeBar: false }}
              style={{ width: '100%' }}
            />
          )}
        </motion.div>

        {/* Demand vs Saturation Scatter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-purple-500" />
            Demand vs Skill Saturation
            <span className="ml-2 text-sm font-normal text-gray-500">Bubble size = Salary Growth</span>
          </h3>
          {heatmapData?.industries && (
            <Plot
              data={getDemandSaturationPlotData()}
              layout={{
                ...plotLayout,
                height: 350,
                xaxis: { ...plotLayout.xaxis, title: 'Skill Saturation %' },
                yaxis: { ...plotLayout.yaxis, title: 'Demand Score' }
              }}
              config={{ responsive: true, displayModeBar: false }}
              style={{ width: '100%' }}
            />
          )}
        </motion.div>

        {/* Entry Barrier Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-yellow-500" />
            Entry Barrier Score (1-5)
            <span className="ml-2 text-sm font-normal text-gray-500">Lower is easier</span>
          </h3>
          {heatmapData?.industries && (
            <Plot
              data={getEntryBarrierPlotData()}
              layout={{
                ...plotLayout,
                height: 350,
                xaxis: { ...plotLayout.xaxis, tickangle: -45 },
                yaxis: { ...plotLayout.yaxis, title: 'Barrier Score', range: [0, 5] }
              }}
              config={{ responsive: true, displayModeBar: false }}
              style={{ width: '100%' }}
            />
          )}
        </motion.div>

        {/* Industry Heatmap Matrix */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6"
        >
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
            Industry Metrics Heatmap
          </h3>
          {heatmapData?.industries && (
            <Plot
              data={getHeatmapPlotData()}
              layout={{
                ...plotLayout,
                height: 400,
                margin: { ...plotLayout.margin, l: 120 }
              }}
              config={{ responsive: true, displayModeBar: false }}
              style={{ width: '100%' }}
            />
          )}
        </motion.div>
      </div>

      {/* Insights Section */}
      {heatmapData?.insights && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-6"
        >
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <Brain className="w-6 h-6 mr-2 text-purple-500" />
            AI-Powered Insights
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
              <div className="flex items-center mb-2">
                <Target className="w-5 h-5 mr-2 text-green-500" />
                <h4 className="font-semibold text-green-400">Top Recommendation</h4>
              </div>
              <p className="text-sm text-gray-300">{heatmapData.insights.topRecommendation}</p>
            </div>

            <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
              <div className="flex items-center mb-2">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
                <h4 className="font-semibold text-blue-400">Emerging Trend</h4>
              </div>
              <p className="text-sm text-gray-300">{heatmapData.insights.emergingTrend}</p>
            </div>

            <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
              <div className="flex items-center mb-2">
                <AlertTriangle className="w-5 h-5 mr-2 text-yellow-500" />
                <h4 className="font-semibold text-yellow-400">Market Warning</h4>
              </div>
              <p className="text-sm text-gray-300">{heatmapData.insights.marketWarning}</p>
            </div>

            <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
              <div className="flex items-center mb-2">
                <DollarSign className="w-5 h-5 mr-2 text-purple-500" />
                <h4 className="font-semibold text-purple-400">Salary Insight</h4>
              </div>
              <p className="text-sm text-gray-300">{heatmapData.insights.salaryInsight}</p>
            </div>

            <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/30 md:col-span-2">
              <div className="flex items-center mb-2">
                <Zap className="w-5 h-5 mr-2 text-red-500" />
                <h4 className="font-semibold text-red-400">Skill Gap Alert</h4>
              </div>
              <p className="text-sm text-gray-300">{heatmapData.insights.skillGapAlert}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Region Comparison */}
      {heatmapData?.regionComparison && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* India */}
          <div className="glass-card p-6 border-2 border-orange-500/30">
            <div className="flex items-center mb-4">
              <span className="text-3xl mr-3">🇮🇳</span>
              <div>
                <h3 className="text-xl font-bold">India Market</h3>
                <p className="text-sm text-gray-500">{heatmapData.regionComparison.india.marketMaturity}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-400">Hot Industries</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {heatmapData.regionComparison.india.hotIndustries?.map((ind, i) => (
                    <span key={i} className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-sm">
                      {ind}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Avg Salary Growth</span>
                <span className="text-green-400 font-bold text-xl">
                  {heatmapData.regionComparison.india.avgSalaryGrowth}
                </span>
              </div>
            </div>
          </div>

          {/* Global */}
          <div className="glass-card p-6 border-2 border-blue-500/30">
            <div className="flex items-center mb-4">
              <span className="text-3xl mr-3">🌍</span>
              <div>
                <h3 className="text-xl font-bold">Global Market</h3>
                <p className="text-sm text-gray-500">{heatmapData.regionComparison.global.marketMaturity}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-400">Hot Industries</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {heatmapData.regionComparison.global.hotIndustries?.map((ind, i) => (
                    <span key={i} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-sm">
                      {ind}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Avg Salary Growth</span>
                <span className="text-green-400 font-bold text-xl">
                  {heatmapData.regionComparison.global.avgSalaryGrowth}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default IndustryHeatmap;
