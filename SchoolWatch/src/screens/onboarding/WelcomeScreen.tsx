import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { GlassCard, GlassButton, GlassInput } from '../../components';
import { theme } from '../../theme';
import { GRADES } from '../../types/onboarding';

interface WelcomeScreenProps {
  onNext: (grade: string, childName?: string) => void;
}

/**
 * Onboarding Screen 1: Welcome + Child's Grade Selection
 */
export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNext }) => {
  const [childName, setChildName] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('');

  const handleNext = () => {
    if (selectedGrade) {
      onNext(selectedGrade, childName || undefined);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to SchoolWatch</Text>
          <Text style={styles.subtitle}>
            Track your Bay Area private school applications with confidence
          </Text>
        </View>

        {/* Main Content */}
        <GlassCard variant="card" style={styles.card}>
          <Text style={styles.cardTitle}>Let's get started</Text>
          <Text style={styles.cardSubtitle}>
            Tell us about your child's current grade
          </Text>

          {/* Optional: Child's Name */}
          <GlassInput
            label="Child's First Name (Optional)"
            placeholder="e.g., Alex"
            value={childName}
            onChangeText={setChildName}
            containerStyle={styles.inputContainer}
          />

          {/* Grade Selection */}
          <Text style={styles.label}>Current Grade *</Text>
          <View style={styles.gradeGrid}>
            {GRADES.map((grade) => (
              <GlassCard
                key={grade.value}
                variant={selectedGrade === grade.value ? 'lightStrong' : 'lightSubtle'}
                pressable
                animated
                onPress={() => setSelectedGrade(grade.value)}
                style={[
                  styles.gradeCard,
                  selectedGrade === grade.value && styles.gradeCardSelected,
                ]}
              >
                <Text
                  style={[
                    styles.gradeText,
                    selectedGrade === grade.value && styles.gradeTextSelected,
                  ]}
                >
                  {grade.label}
                </Text>
              </GlassCard>
            ))}
          </View>
        </GlassCard>

        {/* Next Button */}
        <GlassButton
          title="Continue"
          variant="primary"
          size="large"
          onPress={handleNext}
          disabled={!selectedGrade}
          fullWidth
          style={styles.nextButton}
        />

        {/* Footer */}
        <Text style={styles.footer}>Step 1 of 3</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  scrollContent: {
    padding: theme.spacing.screenHorizontal,
    paddingTop: theme.spacing['4xl'],
    paddingBottom: theme.spacing.xl,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    ...theme.typography.displayMedium,
    color: theme.colors.primary.main,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
  },
  card: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  cardTitle: {
    ...theme.typography.h1,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  cardSubtitle: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.lg,
  },
  inputContainer: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    ...theme.typography.labelSmall,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  gradeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  gradeCard: {
    padding: theme.spacing.md,
    minWidth: '30%',
    flex: 1,
    alignItems: 'center',
  },
  gradeCardSelected: {
    borderWidth: 2,
    borderColor: theme.colors.primary.main,
  },
  gradeText: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  gradeTextSelected: {
    ...theme.typography.label,
    color: theme.colors.primary.main,
  },
  nextButton: {
    marginBottom: theme.spacing.md,
  },
  footer: {
    ...theme.typography.caption,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
  },
});

export default WelcomeScreen;
