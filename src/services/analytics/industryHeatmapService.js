import axios from 'axios';

class IndustryHeatmapService {
  constructor() {
    this.baseUrl = import.meta.env.VITE_FIREBASE_FUNCTIONS_URL || 'http://localhost:5001';
  }

  /**
   * Fetch industry heatmap data from Cloud Functions
   * Uses BigQuery-backed endpoint
   */
  async getIndustryHeatmap(region = 'IN', domain = 'technology') {
    try {
      const response = await axios.get(
        `${this.baseUrl}/industryHeatmap`,
        {
          params: { region, domain },
          headers: { 'Access-Control-Allow-Origin': '*' },
        }
      );
      return response.data.points || [];
    } catch (error) {
      console.error('Industry heatmap fetch error:', error);
      return this.getFallbackHeatmap();
    }
  }

  /**
   * Get salary trends by role and region
   */
  async getSalaryTrends(region = 'IN', yearRange = 5) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/salaryTrends`,
        { params: { region, yearRange } }
      );
      return response.data.trends || [];
    } catch (error) {
      console.error('Salary trends fetch error:', error);
      return this.getFallbackSalaryTrends();
    }
  }

  /**
   * Get skill demand index
   */
  async getSkillDemandIndex(skills = []) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/skillDemandIndex`,
        { skills }
      );
      return response.data.skillDemands || [];
    } catch (error) {
      console.error('Skill demand index fetch error:', error);
      return this.getFallbackSkillDemand(skills);
    }
  }

  /**
   * Fallback demo heatmap data
   */
  getFallbackHeatmap() {
    return [
      { role: 'Frontend Developer', demandIndex: 78, medianSalary: 850000, scarcity: 0.35 },
      { role: 'Data Analyst', demandIndex: 72, medianSalary: 700000, scarcity: 0.28 },
      { role: 'ML Engineer', demandIndex: 81, medianSalary: 1400000, scarcity: 0.52 },
      { role: 'Cloud Architect', demandIndex: 69, medianSalary: 1600000, scarcity: 0.47 },
      { role: 'DevOps Engineer', demandIndex: 75, medianSalary: 1000000, scarcity: 0.42 },
      { role: 'Cybersecurity Engineer', demandIndex: 85, medianSalary: 1200000, scarcity: 0.58 },
      { role: 'Full Stack Developer', demandIndex: 74, medianSalary: 900000, scarcity: 0.38 },
      { role: 'Database Admin', demandIndex: 68, medianSalary: 950000, scarcity: 0.33 },
    ];
  }

  /**
   * Fallback salary trends
   */
  getFallbackSalaryTrends() {
    return [
      { year: 2019, role: 'Software Engineer', salary: 600000 },
      { year: 2020, role: 'Software Engineer', salary: 700000 },
      { year: 2021, role: 'Software Engineer', salary: 800000 },
      { year: 2022, role: 'Software Engineer', salary: 900000 },
      { year: 2023, role: 'Software Engineer', salary: 1000000 },
      { year: 2024, role: 'Software Engineer', salary: 1100000 },
    ];
  }

  /**
   * Fallback skill demand
   */
  getFallbackSkillDemand(skills = []) {
    const demandMap = {
      'React': 92,
      'Python': 95,
      'JavaScript': 88,
      'TypeScript': 85,
      'AWS': 90,
      'Docker': 87,
      'Kubernetes': 84,
      'GraphQL': 78,
      'Machine Learning': 93,
      'AI': 96,
      'Cloud': 89,
      'DevOps': 86,
    };

    return skills.map(skill => ({
      skill,
      demandScore: demandMap[skill] || 70,
      growth: Math.floor(Math.random() * 20) + 5,
      averageSalary: Math.floor(Math.random() * 600000) + 800000,
    }));
  }
}

export default new IndustryHeatmapService();
