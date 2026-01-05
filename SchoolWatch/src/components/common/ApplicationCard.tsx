import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { GlassCard, GlassBadge } from '../glass';
import { theme } from '../../theme';
import { Application, ApplicationStatus } from '../../types/application';

interface ApplicationCardProps {
  application: Application;
  onPress?: (application: Application) => void;
  onStatusChange?: (id: string, status: ApplicationStatus) => void;
}

/**
 * ApplicationCard - Display an application with school info and status
 */
export const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  onPress,
  onStatusChange,
}) => {
  const [daysUntilDeadline, setDaysUntilDeadline] = useState<number | null>(null);

  useEffect(() => {
    // Calculate days until next deadline
    const calculateDays = () => {
      const dates = [
        application.application_date,
        application.interview_date,
        application.decision_date,
      ]
        .filter(Boolean)
        .map(date => new Date(date!).getTime());

      if (dates.length === 0) return null;

      const now = Date.now();
      const futureDates = dates.filter(date => date > now);

      if (futureDates.length === 0) return null;

      const nextDate = Math.min(...futureDates);
      const days = Math.ceil((nextDate - now) / (1000 * 60 * 60 * 24));

      return days;
    };

    setDaysUntilDeadline(calculateDays());

    // Update every hour
    const interval = setInterval(() => {
      setDaysUntilDeadline(calculateDays());
    }, 1000 * 60 * 60);

    return () => clearInterval(interval);
  }, [application.application_date, application.interview_date, application.decision_date]);

  const getStatusVariant = (status: ApplicationStatus) => {
    return status as any; // GlassBadge already supports all application statuses
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handlePress = () => {
    if (onPress) {
      onPress(application);
    }
  };

  return (
    <GlassCard
      variant="card"
      pressable={!!onPress}
      animated={!!onPress}
      onPress={handlePress}
      style={styles.card}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.schoolName}>{application.school?.name || 'Unknown School'}</Text>
          <Text style={styles.city}>{application.school?.city}</Text>
        </View>
        <GlassBadge
          label={application.status}
          variant={getStatusVariant(application.status)}
          size="small"
        />
      </View>

      {/* Details */}
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Grade:</Text>
          <Text style={styles.detailValue}>{application.grade_applying}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Year:</Text>
          <Text style={styles.detailValue}>{application.application_year}</Text>
        </View>
      </View>

      {/* Dates */}
      {(application.application_date || application.interview_date || application.decision_date) && (
        <View style={styles.dates}>
          {application.application_date && (
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>Application:</Text>
              <Text style={styles.dateValue}>{formatDate(application.application_date)}</Text>
            </View>
          )}
          {application.interview_date && (
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>Interview:</Text>
              <Text style={styles.dateValue}>{formatDate(application.interview_date)}</Text>
            </View>
          )}
          {application.decision_date && (
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>Decision:</Text>
              <Text style={styles.dateValue}>{formatDate(application.decision_date)}</Text>
            </View>
          )}
        </View>
      )}

      {/* Countdown */}
      {daysUntilDeadline !== null && daysUntilDeadline > 0 && (
        <View style={styles.countdown}>
          <Text style={styles.countdownIcon}>⏰</Text>
          <Text style={styles.countdownText}>
            {daysUntilDeadline} day{daysUntilDeadline !== 1 ? 's' : ''} until next deadline
          </Text>
        </View>
      )}

      {/* Notes */}
      {application.notes && (
        <View style={styles.notesContainer}>
          <Text style={styles.notes} numberOfLines={2}>
            {application.notes}
          </Text>
        </View>
      )}

      {/* Footer - School Type and Tuition */}
      <View style={styles.footer}>
        {application.school?.school_type && (
          <GlassBadge label={application.school.school_type} variant="info" size="small" />
        )}
        {application.school?.tuition_range && (
          <GlassBadge label={application.school.tuition_range} variant="warning" size="small" />
        )}
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  titleContainer: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  schoolName: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs / 2,
  },
  city: {
    ...theme.typography.caption,
    color: theme.colors.text.tertiary,
  },
  details: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  detailLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.secondary,
  },
  detailValue: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.primary,
    fontWeight: theme.fontWeights.semibold,
  },
  dates: {
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  dateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  dateValue: {
    ...theme.typography.caption,
    color: theme.colors.text.primary,
    fontWeight: theme.fontWeights.medium,
  },
  countdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.glass.whiteStrong,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  countdownIcon: {
    fontSize: 16,
    marginRight: theme.spacing.xs,
  },
  countdownText: {
    ...theme.typography.bodySmall,
    color: theme.colors.primary.main,
    fontWeight: theme.fontWeights.semibold,
  },
  notesContainer: {
    marginBottom: theme.spacing.sm,
  },
  notes: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
});

export default ApplicationCard;
