import { db } from '../../config/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import geminiService from '../ai/geminiService';

class CareerTwinService {
  async createCareerTwin(userId, userData) {
    try {
      // Generate AI Career Twin profile
      const twinProfile = await geminiService.generateCareerTwin(userData);
      
      // Predict career trajectory
      const trajectory = await geminiService.predictCareerTrajectory(twinProfile);
      
      // Save to Firestore
      const careerTwinData = {
        userId,
        profile: twinProfile,
        trajectory,
        userData,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
        version: 1
      };
      
      await setDoc(doc(db, 'careerTwins', userId), careerTwinData);
      
      return careerTwinData;
    } catch (error) {
      console.error('Error creating career twin:', error);
      throw error;
    }
  }

  async getCareerTwin(userId) {
    try {
      const twinDoc = await getDoc(doc(db, 'careerTwins', userId));
      
      if (twinDoc.exists()) {
        return twinDoc.data();
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching career twin:', error);
      throw error;
    }
  }

  async updateCareerTwin(userId, updates) {
    try {
      const twinRef = doc(db, 'careerTwins', userId);
      const twinDoc = await getDoc(twinRef);
      
      if (!twinDoc.exists()) {
        throw new Error('Career twin not found');
      }
      
      const currentData = twinDoc.data();
      const updatedUserData = { ...currentData.userData, ...updates };
      
      // Regenerate profile with new data
      const newProfile = await geminiService.generateCareerTwin(updatedUserData);
      const newTrajectory = await geminiService.predictCareerTrajectory(newProfile);
      
      await updateDoc(twinRef, {
        profile: newProfile,
        trajectory: newTrajectory,
        userData: updatedUserData,
        lastUpdated: serverTimestamp(),
        version: currentData.version + 1
      });
      
      return { profile: newProfile, trajectory: newTrajectory };
    } catch (error) {
      console.error('Error updating career twin:', error);
      throw error;
    }
  }

  async addSkill(userId, newSkill) {
    try {
      const twinRef = doc(db, 'careerTwins', userId);
      const twinDoc = await getDoc(twinRef);
      
      if (!twinDoc.exists()) {
        throw new Error('Career twin not found');
      }
      
      const currentData = twinDoc.data();
      const updatedSkills = [...(currentData.userData.skills || []), newSkill];
      
      return await this.updateCareerTwin(userId, { 
        skills: updatedSkills 
      });
    } catch (error) {
      console.error('Error adding skill:', error);
      throw error;
    }
  }

  async getSkillEvolution(userId) {
    try {
      const twinDoc = await getDoc(doc(db, 'careerTwins', userId));
      
      if (!twinDoc.exists()) {
        return null;
      }
      
      const data = twinDoc.data();
      
      // Return skill evolution data for visualization
      return {
        currentSkills: data.userData.skills,
        skillCategories: data.profile.skillCategories,
        proficiency: data.profile.skillProficiency,
        strengthAreas: data.profile.strengthAreas,
        growthAreas: data.profile.growthAreas
      };
    } catch (error) {
      console.error('Error fetching skill evolution:', error);
      throw error;
    }
  }
}

export default new CareerTwinService();
