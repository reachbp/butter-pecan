import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { OnboardingFlow } from './src/screens/onboarding';
import { OnboardingData } from './src/types/onboarding';
import { theme } from './src/theme';

export default function App() {
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  const handleOnboardingComplete = (data: OnboardingData) => {
    console.log('Onboarding completed with data:', data);

    // Show summary
    Alert.alert(
      'Onboarding Complete!',
      `${data.childFirstName ? `Child: ${data.childFirstName}\n` : ''}` +
      `Grade: ${data.childGrade}\n` +
      `Graduation Year: ${data.targetGraduationYear}\n` +
      `Application Year: ${data.applicationYear}\n` +
      `Selected Schools: ${data.selectedSchools.length}`,
      [
        {
          text: 'OK',
          onPress: () => setOnboardingComplete(true),
        },
      ]
    );

    // TODO: Save to backend and navigate to dashboard
  };

  return (
    <View style={styles.container}>
      <OnboardingFlow onComplete={handleOnboardingComplete} />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
});
