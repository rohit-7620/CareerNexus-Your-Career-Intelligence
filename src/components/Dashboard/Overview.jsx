import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { 
  TrendingUp, 
  Award, 
  Target, 
  Zap, 
  Brain,
  ArrowRight,
  Sparkles,
  Activity,
  Briefcase,
  Clock,
  Star
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadialBarChart,
  RadialBar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const Overview = () => {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState({
    careerScore: 78,
    skillsLearned: 12,
    interviewsCompleted: 5,
    xpPoints: 2450
  });

  // Sample data for visualizations
  const skillProgressData = [
    { month: 'Jan', skills: 8, interviews: 2, applications: 5 },
    { month: 'Feb', skills: 10, interviews: 3, applications: 8 },
    { month: 'Mar', skills: 12, interviews: 5, applications: 12 },
    { month: 'Apr', skills: 15, interviews: 7, applications: 15 },
    { month: 'May', skills: 18, interviews: 9, applications: 20 },
    { month: 'Jun', skills: 22, interviews: 12, applications: 25 }
  ];

  const careerScoreBreakdown = [
    { name: 'Technical Skills', value: 85, fill: '#3b82f6' },
    { name: 'Soft Skills', value: 72, fill: '#8b5cf6' },
    { name: 'Experience', value: 68, fill: '#ec4899' },
    { name: 'Education', value: 90, fill: '#f59e0b' },
    { name: 'Projects', value: 75, fill: '#10b981' }
  ];

  const weeklyActivity = [
    { day: 'Mon', hours: 3.5 },
    { day: 'Tue', hours: 5.2 },
    { day: 'Wed', hours: 4.1 },
    { day: 'Thu', hours: 6.3 },
    { day: 'Fri', hours: 4.8 },
    { day: 'Sat', hours: 2.5 },
    { day: 'Sun', hours: 1.2 }
  ];

  const topSkills = [
    { skill: 'React', level: 90, color: '#61dafb' },
    { skill: 'Python', level: 85, color: '#3776ab' },
    { skill: 'Node.js', level: 78, color: '#339933' },
    { skill: 'TypeScript', level: 72, color: '#3178c6' },
    { skill: 'AWS', level: 65, color: '#ff9900' }
  ];

  // Animated counter component
  const AnimatedCounter = ({ value, suffix = '' }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      let start = 0;
      const end = typeof value === 'number' ? value : parseInt(value);
      if (start === end) return;

      const inc = end / 50;
      const timer = setInterval(() => {
        start += inc;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 30);
      return () => clearInterval(timer);
    }, [value]);

    return (
      <>
        {count}
        {suffix}
      </>
    );
  };

  const quickActions = [
    {
      title: 'Update Career Twin',
      description: 'Add new skills and experiences',
      icon: Brain,
      link: '/dashboard/career-twin',
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Explore Jobs',
      description: 'Find matching opportunities',
      icon: Target,
      link: '/dashboard/job-matcher',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Practice Interview',
      description: 'AI-powered mock sessions',
      icon: Zap,
      link: '/dashboard/interview',
      color: 'from-orange-500 to-amber-500'
    },
    {
      title: 'View Heatmap',
      description: 'Live industry trends',
      icon: TrendingUp,
      link: '/dashboard/heatmap',
      color: 'from-green-500 to-emerald-500'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 10,
      },
    },
  };

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Welcome Header with animated gradient */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="relative">
          <motion.div
            animate={{ 
              boxShadow: [
                '0 0 20px rgba(139, 92, 246, 0.1)',
                '0 0 40px rgba(139, 92, 246, 0.2)',
                '0 0 20px rgba(139, 92, 246, 0.1)',
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-0 rounded-lg blur-xl"
          />
          <div className="relative">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Welcome back, <span className="gradient-text">{userProfile?.displayName || 'Professional'}!</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Sparkles className="w-4 h-4 text-primary-500" />
              </motion.span>
              Your career intelligence dashboard is ready
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid with enhanced animations */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={containerVariants}
      >
        {[
          { label: 'Career Score', value: stats.careerScore, suffix: '/100', icon: Award, color: 'text-primary-500', bgColor: 'from-primary-500/10 to-primary-500/5' },
          { label: 'Skills Learned', value: stats.skillsLearned, suffix: '', icon: Brain, color: 'text-secondary-500', bgColor: 'from-secondary-500/10 to-secondary-500/5' },
          { label: 'Interviews Done', value: stats.interviewsCompleted, suffix: '', icon: Zap, color: 'text-accent-500', bgColor: 'from-accent-500/10 to-accent-500/5' },
          { label: 'XP Points', value: stats.xpPoints, suffix: ' XP', icon: TrendingUp, color: 'text-purple-500', bgColor: 'from-purple-500/10 to-purple-500/5' }
        ].map((stat, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            whileHover={{ 
              scale: 1.05,
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className={`glass-card p-6 bg-gradient-to-br ${stat.bgColor} overflow-hidden`}
          >
            {/* Animated background elements */}
            <motion.div
              className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-10"
              animate={{
                x: [0, 10, -10, 0],
                y: [0, -10, 10, 0],
              }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              style={{ background: `linear-gradient(135deg, ${stat.color.replace('text-', '')}, transparent)` }}
            />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <motion.div
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </motion.div>
                <motion.span 
                  className="text-sm text-gray-500 font-semibold"
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {stat.label}
                </motion.span>
              </div>
              <div className="text-3xl font-bold flex items-baseline gap-1">
                <motion.span
                  key={stats[Object.keys(stats)[index]]}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </motion.span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <div>
        <motion.h2 
          className="text-2xl font-bold mb-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          Quick Actions
        </motion.h2>
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          variants={containerVariants}
        >
          {quickActions.map((action, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <Link to={action.link}>
                <motion.div 
                  className="glass-card p-6 group hover:shadow-glass-hover transition-all cursor-pointer relative overflow-hidden"
                  whileHover={{ boxShadow: '0 20px 50px rgba(0,0,0,0.15)' }}
                >
                  {/* Animated gradient background on hover */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-5 transition-opacity`}
                  />
                  
                  <div className="relative z-10 flex items-start justify-between">
                    <div className="flex-1">
                      <motion.div 
                        className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-lg flex items-center justify-center mb-4`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <motion.div
                          animate={{ 
                            y: [0, -4, 0],
                          }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        >
                          <action.icon className="w-6 h-6 text-white" />
                        </motion.div>
                      </motion.div>
                      <motion.h3 
                        className="text-xl font-bold mb-2"
                        animate={{ color: 'inherit' }}
                      >
                        {action.title}
                      </motion.h3>
                      <motion.p 
                        className="text-gray-600 dark:text-gray-400"
                        initial={{ opacity: 0.7 }}
                        whileHover={{ opacity: 1 }}
                      >
                        {action.description}
                      </motion.p>
                    </div>
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="flex-shrink-0"
                    >
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
                    </motion.div>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Recent Activity with staggered animations */}
      <motion.div 
        className="glass-card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <motion.h2 
          className="text-2xl font-bold mb-4"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          Recent Activity
        </motion.h2>
        <motion.div 
          className="space-y-4"
          variants={containerVariants}
        >
          {[
            { action: 'Completed React Interview', time: '2 hours ago', icon: Zap },
            { action: 'Added Python skill to Career Twin', time: '1 day ago', icon: Brain },
            { action: 'Viewed Data Science heatmap', time: '2 days ago', icon: TrendingUp }
          ].map((activity, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ x: 5, backgroundColor: 'rgba(255,255,255,0.1)' }}
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
              >
                <activity.icon className="w-5 h-5 text-primary-500" />
              </motion.div>
              <div className="flex-1">
                <motion.p 
                  className="font-medium"
                  animate={{ opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                >
                  {activity.action}
                </motion.p>
                <p className="text-sm text-gray-500">{activity.time}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Skill Growth Chart */}
      <motion.div
        className="glass-card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="text-green-500" size={28} />
            Your Growth Journey
          </h2>
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-sm bg-green-500/10 text-green-500 px-3 py-1 rounded-full font-semibold"
          >
            ↑ 23% this month
          </motion.div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={skillProgressData}>
            <defs>
              <linearGradient id="colorSkills" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorInterviews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorApplications" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.2} />
            <XAxis dataKey="month" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(0,0,0,0.8)', 
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
              }}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="skills" 
              stroke="#3b82f6" 
              fillOpacity={1} 
              fill="url(#colorSkills)"
              strokeWidth={2}
              animationDuration={2000}
            />
            <Area 
              type="monotone" 
              dataKey="interviews" 
              stroke="#8b5cf6" 
              fillOpacity={1} 
              fill="url(#colorInterviews)"
              strokeWidth={2}
              animationDuration={2000}
            />
            <Area 
              type="monotone" 
              dataKey="applications" 
              stroke="#10b981" 
              fillOpacity={1} 
              fill="url(#colorApplications)"
              strokeWidth={2}
              animationDuration={2000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Two Column Layout for Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Career Score Breakdown */}
        <motion.div
          className="glass-card p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Award className="text-yellow-500" size={28} />
            Career Score Breakdown
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <RadialBarChart 
              cx="50%" 
              cy="50%" 
              innerRadius="20%" 
              outerRadius="90%" 
              data={careerScoreBreakdown}
              startAngle={90}
              endAngle={-270}
            >
              <RadialBar
                minAngle={15}
                background
                clockWise
                dataKey="value"
                cornerRadius={10}
                animationDuration={2000}
              />
              <Legend 
                iconSize={10} 
                layout="vertical" 
                verticalAlign="middle" 
                align="right"
                wrapperStyle={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.8)', 
                  border: 'none',
                  borderRadius: '8px'
                }}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Weekly Activity */}
        <motion.div
          className="glass-card p-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Activity className="text-purple-500" size={28} />
            Weekly Learning Activity
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.2} />
              <XAxis dataKey="day" stroke="#888" />
              <YAxis stroke="#888" label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.8)', 
                  border: 'none',
                  borderRadius: '8px'
                }}
                formatter={(value) => [`${value} hours`, 'Learning Time']}
              />
              <Bar 
                dataKey="hours" 
                fill="url(#barGradient)" 
                radius={[8, 8, 0, 0]}
                animationDuration={1500}
              >
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Top Skills with Animated Progress Bars */}
      <motion.div
        className="glass-card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Star className="text-amber-500" size={28} />
          Top Skills Mastery
        </h2>
        <div className="space-y-4">
          {topSkills.map((skill, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 + index * 0.1 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: skill.color }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                  />
                  <span className="font-semibold">{skill.skill}</span>
                </div>
                <motion.span
                  className="text-sm font-bold"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 + index * 0.1 }}
                >
                  {skill.level}%
                </motion.span>
              </div>
              <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="absolute top-0 left-0 h-full rounded-full"
                  style={{ 
                    background: `linear-gradient(90deg, ${skill.color}, ${skill.color}dd)`
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${skill.level}%` }}
                  transition={{ 
                    duration: 1.5, 
                    delay: 0.9 + index * 0.1,
                    ease: 'easeOut'
                  }}
                >
                  <motion.div
                    className="absolute inset-0"
                    animate={{ 
                      backgroundPosition: ['0% 0%', '100% 100%'],
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{
                      background: `linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)`,
                      backgroundSize: '200% 200%'
                    }}
                  />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Career Milestones Timeline */}
      <motion.div
        className="glass-card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Clock className="text-cyan-500" size={28} />
          Career Milestones
        </h2>
        <div className="space-y-6">
          {[
            { title: 'Started Career Journey', date: 'Jan 2024', icon: Briefcase, color: 'blue' },
            { title: 'First Technical Interview', date: 'Mar 2024', icon: Zap, color: 'purple' },
            { title: 'Mastered React Framework', date: 'Jun 2024', icon: Brain, color: 'pink' },
            { title: 'Landing Dream Role', date: 'Q1 2026', icon: Target, color: 'green', future: true }
          ].map((milestone, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 + index * 0.15 }}
              className="flex items-start gap-4"
            >
              <motion.div
                className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                  milestone.future 
                    ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-500 border-dashed' 
                    : `bg-gradient-to-br from-${milestone.color}-500 to-${milestone.color}-600`
                }`}
                whileHover={{ scale: 1.1, rotate: 5 }}
                animate={milestone.future ? { 
                  boxShadow: [
                    '0 0 0 0 rgba(16, 185, 129, 0.4)',
                    '0 0 0 10px rgba(16, 185, 129, 0)',
                  ]
                } : {}}
                transition={milestone.future ? { duration: 2, repeat: Infinity } : {}}
              >
                <milestone.icon className={milestone.future ? 'text-green-500' : 'text-white'} size={24} />
              </motion.div>
              <div className="flex-1">
                <motion.h4 
                  className="font-bold text-lg"
                  whileHover={{ x: 5 }}
                >
                  {milestone.title}
                </motion.h4>
                <p className="text-sm text-gray-500">{milestone.date}</p>
                {milestone.future && (
                  <motion.span
                    className="inline-block mt-1 text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    Upcoming Goal
                  </motion.span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Overview;
