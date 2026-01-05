import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Pressable,
} from 'react-native';
import { GlassCard, GlassButton, GlassBadge } from '../../components';
import { StatusUpdateModal } from '../../components/common/StatusUpdateModal';
import { theme } from '../../theme';
import {
  Application,
  ApplicationStatus,
  UpdateApplicationDTO,
} from '../../types/application';
import { applicationsApi } from '../../services/api';

interface ApplicationDetailScreenProps {
  application: Application;
  onBack: () => void;
  onUpdate: (updatedApplication: Application) => void;
  onDelete: () => void;
}

/**
 * ApplicationDetailScreen - Detailed view of an application with editing capabilities
 */
export const ApplicationDetailScreen: React.FC<ApplicationDetailScreenProps> = ({
  application: initialApplication,
  onBack,
  onUpdate,
  onDelete,
}) => {
  const [application, setApplication] = useState(initialApplication);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleUpdate = async (updates: UpdateApplicationDTO) => {
    try {
      setUpdating(true);
      const response = await applicationsApi.update(application.id, updates);
      setApplication(response.application);
      onUpdate(response.application);

      Alert.alert('Success', 'Application updated successfully');
    } catch (error) {
      console.error('Failed to update application:', error);
      Alert.alert('Error', 'Failed to update application. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Application',
      `Are you sure you want to delete the application for ${application.school?.name}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await applicationsApi.delete(application.id);
              Alert.alert('Success', 'Application deleted');
              onDelete();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete application');
            }
          },
        },
      ]
    );
  };

  const handleQuickStatusChange = (status: ApplicationStatus) => {
    Alert.alert(
      'Update Status',
      `Change status to "${status}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => handleUpdate({ status }),
        },
      ]
    );
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Not set';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getNextSteps = (): string[] => {
    switch (application.status) {
      case 'considering':
        return [
          'Research school curriculum and values',
          'Schedule a campus visit',
          'Prepare application materials',
        ];
      case 'applied':
        return [
          'Confirm application was received',
          'Prepare for possible interview',
          'Submit any additional materials',
        ];
      case 'interviewed':
        return [
          'Send thank you note to interviewer',
          'Wait for decision notification',
          'Consider backup options',
        ];
      case 'waitlisted':
        return [
          'Submit letter of continued interest',
          'Update on any new achievements',
          'Consider accepting other offers',
        ];
      case 'accepted':
        return [
          'Review financial aid package',
          'Attend accepted students event',
          'Decide by enrollment deadline',
        ];
      default:
        return [];
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </Pressable>
          <Text style={styles.title}>{application.school?.name || 'Application'}</Text>
          <View style={styles.statusBadge}>
            <GlassBadge label={application.status} variant={application.status as any} />
          </View>
        </View>

        {/* School Info */}
        <GlassCard variant="card" style={styles.card}>
          <Text style={styles.cardTitle}>School Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Location:</Text>
            <Text style={styles.infoValue}>{application.school?.city || 'N/A'}</Text>
          </View>
          {application.school?.grades_offered && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Grades:</Text>
              <Text style={styles.infoValue}>{application.school.grades_offered}</Text>
            </View>
          )}
          {application.school?.school_type && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Type:</Text>
              <Text style={styles.infoValue}>{application.school.school_type}</Text>
            </View>
          )}
          {application.school?.tuition_range && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tuition:</Text>
              <Text style={styles.infoValue}>{application.school.tuition_range}</Text>
            </View>
          )}
        </GlassCard>

        {/* Application Details */}
        <GlassCard variant="card" style={styles.card}>
          <Text style={styles.cardTitle}>Application Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Grade Applying:</Text>
            <Text style={styles.infoValue}>{application.grade_applying}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Application Year:</Text>
            <Text style={styles.infoValue}>{application.application_year}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Current Status:</Text>
            <GlassBadge
              label={application.status}
              variant={application.status as any}
              size="small"
            />
          </View>
        </GlassCard>

        {/* Timeline */}
        <GlassCard variant="card" style={styles.card}>
          <Text style={styles.cardTitle}>Timeline</Text>
          <View style={styles.timelineItem}>
            <Text style={styles.timelineLabel}>Application Date:</Text>
            <Text style={styles.timelineValue}>{formatDate(application.application_date)}</Text>
          </View>
          <View style={styles.timelineItem}>
            <Text style={styles.timelineLabel}>Interview Date:</Text>
            <Text style={styles.timelineValue}>{formatDate(application.interview_date)}</Text>
          </View>
          <View style={styles.timelineItem}>
            <Text style={styles.timelineLabel}>Decision Date:</Text>
            <Text style={styles.timelineValue}>{formatDate(application.decision_date)}</Text>
          </View>
        </GlassCard>

        {/* Notes */}
        {application.notes && (
          <GlassCard variant="card" style={styles.card}>
            <Text style={styles.cardTitle}>Notes</Text>
            <Text style={styles.notesText}>{application.notes}</Text>
          </GlassCard>
        )}

        {/* Next Steps */}
        {getNextSteps().length > 0 && (
          <GlassCard variant="lightSubtle" style={styles.card}>
            <Text style={styles.cardTitle}>💡 Suggested Next Steps</Text>
            {getNextSteps().map((step, index) => (
              <View key={index} style={styles.nextStepItem}>
                <Text style={styles.nextStepBullet}>•</Text>
                <Text style={styles.nextStepText}>{step}</Text>
              </View>
            ))}
          </GlassCard>
        )}

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <GlassButton
            title="Update Details"
            variant="primary"
            size="large"
            onPress={() => setUpdateModalVisible(true)}
            fullWidth
            loading={updating}
            style={styles.actionButton}
          />

          <View style={styles.rowButtons}>
            <GlassButton
              title="Share"
              variant="glass"
              size="medium"
              onPress={() => Alert.alert('Share', 'Share functionality coming soon')}
              style={styles.halfButton}
            />
            <GlassButton
              title="Delete"
              variant="outline"
              size="medium"
              onPress={handleDelete}
              style={styles.halfButton}
            />
          </View>
        </View>
      </ScrollView>

      {/* Status Update Modal */}
      <StatusUpdateModal
        visible={updateModalVisible}
        application={application}
        onClose={() => setUpdateModalVisible(false)}
        onUpdate={handleUpdate}
      />
    </View>
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
    marginBottom: theme.spacing.lg,
  },
  backButton: {
    marginBottom: theme.spacing.md,
  },
  backButtonText: {
    ...theme.typography.body,
    color: theme.colors.primary.main,
  },
  title: {
    ...theme.typography.displayMedium,
    color: theme.colors.primary.main,
    marginBottom: theme.spacing.sm,
  },
  statusBadge: {
    marginTop: theme.spacing.sm,
  },
  card: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  cardTitle: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  infoLabel: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
  },
  infoValue: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: theme.fontWeights.semibold,
  },
  timelineItem: {
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  timelineLabel: {
    ...theme.typography.labelSmall,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  timelineValue: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
  },
  notesText: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    lineHeight: theme.lineHeights.relaxed * theme.fontSizes.base,
  },
  nextStepItem: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
  },
  nextStepBullet: {
    ...theme.typography.body,
    color: theme.colors.primary.main,
    marginRight: theme.spacing.sm,
  },
  nextStepText: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    flex: 1,
  },
  actionsContainer: {
    marginTop: theme.spacing.lg,
  },
  actionButton: {
    marginBottom: theme.spacing.md,
  },
  rowButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  halfButton: {
    flex: 1,
  },
});

export default ApplicationDetailScreen;
