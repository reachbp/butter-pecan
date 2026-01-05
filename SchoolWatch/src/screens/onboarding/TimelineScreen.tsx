import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { GlassCard, GlassButton } from '../../components';
import { theme } from '../../theme';

interface TimelineScreenProps {
  onNext: (graduationYear: number, applicationYear: number) => void;
  onBack: () => void;
  childGrade: string;
}

/**
 * Onboarding Screen 2: Target Graduation Year + Application Timeline
 */
export const TimelineScreen: React.FC<TimelineScreenProps> = ({
  onNext,
  onBack,
  childGrade,
}) => {
  const [selectedGraduationYear, setSelectedGraduationYear] = useState<number | null>(null);
  const [selectedApplicationYear, setSelectedApplicationYear] = useState<number | null>(null);

  // Calculate suggested graduation years based on grade
  const currentYear = new Date().getFullYear();
  const gradeNumber = childGrade === 'PK' ? -1 : childGrade === 'K' ? 0 : parseInt(childGrade);
  const yearsToGraduation = 12 - gradeNumber;

  const suggestedGraduationYear = currentYear + yearsToGraduation;
  const graduationYears = Array.from(
    { length: 10 },
    (_, i) => suggestedGraduationYear - 2 + i
  );

  // Application years (typically current year or next year)
  const applicationYears = [currentYear, currentYear + 1];

  // Auto-select suggested years
  useEffect(() => {
    setSelectedGraduationYear(suggestedGraduationYear);
    setSelectedApplicationYear(currentYear);
  }, []);

  const handleNext = () => {
    if (selectedGraduationYear && selectedApplicationYear) {
      onNext(selectedGraduationYear, selectedApplicationYear);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Application Timeline</Text>
        <Text style={styles.subtitle}>
          When will your child graduate and when are you applying?
        </Text>
      </View>

      {/* Graduation Year Selection */}
      <GlassCard variant="card" style={styles.card}>
        <Text style={styles.cardTitle}>Target Graduation Year</Text>
        <Text style={styles.cardSubtitle}>
          Based on {childGrade === 'PK' ? 'Pre-K' : childGrade === 'K' ? 'Kindergarten' : `Grade ${childGrade}`},
          we suggest {suggestedGraduationYear}
        </Text>

        <View style={styles.yearGrid}>
          {graduationYears.map((year) => (
            <GlassCard
              key={year}
              variant={selectedGraduationYear === year ? 'lightStrong' : 'lightSubtle'}
              pressable
              animated
              onPress={() => setSelectedGraduationYear(year)}
              style={[
                styles.yearCard,
                selectedGraduationYear === year && styles.yearCardSelected,
              ]}
            >
              <Text
                style={[
                  styles.yearText,
                  selectedGraduationYear === year && styles.yearTextSelected,
                ]}
              >
                {year}
              </Text>
              {year === suggestedGraduationYear && (
                <Text style={styles.suggestedBadge}>Suggested</Text>
              )}
            </GlassCard>
          ))}
        </View>
      </GlassCard>

      {/* Application Year Selection */}
      <GlassCard variant="card" style={styles.card}>
        <Text style={styles.cardTitle}>Application Year</Text>
        <Text style={styles.cardSubtitle}>
          Which admissions cycle are you tracking?
        </Text>

        <View style={styles.applicationYearContainer}>
          {applicationYears.map((year) => (
            <GlassCard
              key={year}
              variant={selectedApplicationYear === year ? 'lightStrong' : 'lightSubtle'}
              pressable
              animated
              onPress={() => setSelectedApplicationYear(year)}
              style={[
                styles.applicationYearCard,
                selectedApplicationYear === year && styles.yearCardSelected,
              ]}
            >
              <Text
                style={[
                  styles.applicationYearText,
                  selectedApplicationYear === year && styles.yearTextSelected,
                ]}
              >
                {year}
              </Text>
              <Text style={styles.applicationYearLabel}>
                {year === currentYear ? 'This Year' : 'Next Year'}
              </Text>
            </GlassCard>
          ))}
        </View>
      </GlassCard>

      {/* Info Card */}
      <GlassCard variant="lightSubtle" style={styles.infoCard}>
        <Text style={styles.infoText}>
          💡 Most Bay Area private schools send decisions between March and April
          each year. You'll be able to track timelines for your selected schools next.
        </Text>
      </GlassCard>

      {/* Navigation Buttons */}
      <View style={styles.buttonContainer}>
        <GlassButton
          title="Back"
          variant="outline"
          size="large"
          onPress={onBack}
          style={styles.backButton}
        />
        <GlassButton
          title="Continue"
          variant="primary"
          size="large"
          onPress={handleNext}
          disabled={!selectedGraduationYear || !selectedApplicationYear}
          style={styles.nextButton}
        />
      </View>

      {/* Footer */}
      <Text style={styles.footer}>Step 2 of 3</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  scrollContent: {
    padding: theme.spacing.screenHorizontal,
    paddingTop: theme.spacing['3xl'],
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
    marginBottom: theme.spacing.md,
  },
  cardTitle: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  cardSubtitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  yearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  yearCard: {
    padding: theme.spacing.md,
    minWidth: '22%',
    flex: 1,
    alignItems: 'center',
  },
  yearCardSelected: {
    borderWidth: 2,
    borderColor: theme.colors.primary.main,
  },
  yearText: {
    ...theme.typography.h3,
    color: theme.colors.text.secondary,
  },
  yearTextSelected: {
    color: theme.colors.primary.main,
    fontWeight: theme.fontWeights.semibold,
  },
  suggestedBadge: {
    ...theme.typography.caption,
    color: theme.colors.secondary.main,
    marginTop: theme.spacing.xs,
  },
  applicationYearContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  applicationYearCard: {
    padding: theme.spacing.lg,
    flex: 1,
    alignItems: 'center',
  },
  applicationYearText: {
    ...theme.typography.h2,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  applicationYearLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.tertiary,
  },
  infoCard: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  infoText: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.secondary,
    lineHeight: theme.lineHeights.relaxed * theme.fontSizes.sm,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
  footer: {
    ...theme.typography.caption,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
  },
});

export default TimelineScreen;
