import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { WelcomeScreen } from './WelcomeScreen';
import { TimelineScreen } from './TimelineScreen';
import { SchoolSelectionScreen } from './SchoolSelectionScreen';
import { OnboardingData } from '../../types/onboarding';

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
}

/**
 * Onboarding Flow Orchestrator
 * Manages navigation between the 3 onboarding screens
 */
export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [onboardingData, setOnboardingData] = useState<Partial<OnboardingData>>({
    selectedSchools: [],
  });

  // Step 1: Welcome + Grade Selection
  const handleWelcomeComplete = (grade: string, childName?: string) => {
    setOnboardingData(prev => ({
      ...prev,
      childGrade: grade,
      childFirstName: childName,
    }));
    setCurrentStep(2);
  };

  // Step 2: Timeline Selection
  const handleTimelineComplete = (graduationYear: number, applicationYear: number) => {
    setOnboardingData(prev => ({
      ...prev,
      targetGraduationYear: graduationYear,
      applicationYear,
    }));
    setCurrentStep(3);
  };

  const handleTimelineBack = () => {
    setCurrentStep(1);
  };

  // Step 3: School Selection
  const handleSchoolSelectionComplete = (schoolIds: string[]) => {
    const completeData: OnboardingData = {
      ...onboardingData,
      selectedSchools: schoolIds,
    } as OnboardingData;

    // Call parent completion handler
    onComplete(completeData);
  };

  const handleSchoolSelectionBack = () => {
    setCurrentStep(2);
  };

  return (
    <View style={styles.container}>
      {currentStep === 1 && (
        <WelcomeScreen onNext={handleWelcomeComplete} />
      )}
      {currentStep === 2 && onboardingData.childGrade && (
        <TimelineScreen
          onNext={handleTimelineComplete}
          onBack={handleTimelineBack}
          childGrade={onboardingData.childGrade}
        />
      )}
      {currentStep === 3 && (
        <SchoolSelectionScreen
          onComplete={handleSchoolSelectionComplete}
          onBack={handleSchoolSelectionBack}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default OnboardingFlow;
