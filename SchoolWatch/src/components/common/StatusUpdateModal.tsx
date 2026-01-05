import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
} from 'react-native';
import { GlassCard, GlassButton, GlassBadge, GlassModal } from '../../components';
import { theme } from '../../theme';
import {
  Application,
  ApplicationStatus,
  APPLICATION_STATUS_LABELS,
  STATUS_ORDER,
} from '../../types/application';

interface StatusUpdateModalProps {
  visible: boolean;
  application: Application | null;
  onClose: () => void;
  onUpdate: (updates: {
    status?: ApplicationStatus;
    application_date?: string;
    interview_date?: string;
    decision_date?: string;
    notes?: string;
  }) => void;
}

/**
 * StatusUpdateModal - Modal for updating application status and details
 */
export const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({
  visible,
  application,
  onClose,
  onUpdate,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus | null>(null);
  const [applicationDate, setApplicationDate] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [decisionDate, setDecisionDate] = useState('');
  const [notes, setNotes] = useState('');

  React.useEffect(() => {
    if (application) {
      setSelectedStatus(application.status);
      setApplicationDate(application.application_date || '');
      setInterviewDate(application.interview_date || '');
      setDecisionDate(application.decision_date || '');
      setNotes(application.notes || '');
    }
  }, [application]);

  const handleSave = () => {
    if (!application) return;

    const updates: any = {};

    if (selectedStatus && selectedStatus !== application.status) {
      updates.status = selectedStatus;
    }

    if (applicationDate !== (application.application_date || '')) {
      updates.application_date = applicationDate || null;
    }

    if (interviewDate !== (application.interview_date || '')) {
      updates.interview_date = interviewDate || null;
    }

    if (decisionDate !== (application.decision_date || '')) {
      updates.decision_date = decisionDate || null;
    }

    if (notes !== (application.notes || '')) {
      updates.notes = notes;
    }

    if (Object.keys(updates).length > 0) {
      onUpdate(updates);
    }

    onClose();
  };

  const getStatusDescription = (status: ApplicationStatus): string => {
    const descriptions: Record<ApplicationStatus, string> = {
      considering: 'You are considering applying to this school',
      applied: 'Application has been submitted',
      interviewed: 'Interview has been completed',
      accepted: 'Congratulations! Acceptance received',
      waitlisted: 'Application is on the waitlist',
      rejected: 'Application was not accepted',
      decided: 'You have made your final decision',
    };
    return descriptions[status];
  };

  if (!application) return null;

  return (
    <GlassModal
      visible={visible}
      onClose={onClose}
      dismissOnBackdrop={true}
      animationType="slide"
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Update Application</Text>
          <Text style={styles.schoolName}>{application.school?.name}</Text>
        </View>

        {/* Status Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Application Status</Text>
          <View style={styles.statusGrid}>
            {STATUS_ORDER.map((status) => (
              <Pressable
                key={status}
                onPress={() => setSelectedStatus(status)}
                style={styles.statusOption}
              >
                <GlassCard
                  variant={selectedStatus === status ? 'lightStrong' : 'lightSubtle'}
                  style={[
                    styles.statusCard,
                    selectedStatus === status && styles.statusCardSelected,
                  ]}
                >
                  <GlassBadge label={status} variant={status as any} size="small" />
                  <Text style={styles.statusDescription}>
                    {getStatusDescription(status)}
                  </Text>
                </GlassCard>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Dates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Important Dates</Text>

          <View style={styles.dateInput}>
            <Text style={styles.label}>Application Date</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={theme.colors.text.tertiary}
              value={applicationDate}
              onChangeText={setApplicationDate}
            />
            <Text style={styles.hint}>Date you submitted the application</Text>
          </View>

          <View style={styles.dateInput}>
            <Text style={styles.label}>Interview Date</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={theme.colors.text.tertiary}
              value={interviewDate}
              onChangeText={setInterviewDate}
            />
            <Text style={styles.hint}>Date of interview or visit</Text>
          </View>

          <View style={styles.dateInput}>
            <Text style={styles.label}>Decision Date</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={theme.colors.text.tertiary}
              value={decisionDate}
              onChangeText={setDecisionDate}
            />
            <Text style={styles.hint}>Date you received the decision</Text>
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Add notes about this application..."
            placeholderTextColor={theme.colors.text.tertiary}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <GlassButton
            title="Cancel"
            variant="outline"
            size="large"
            onPress={onClose}
            style={styles.cancelButton}
          />
          <GlassButton
            title="Save Changes"
            variant="primary"
            size="large"
            onPress={handleSave}
            style={styles.saveButton}
          />
        </View>
      </ScrollView>
    </GlassModal>
  );
};

const styles = StyleSheet.create({
  modalHeader: {
    marginBottom: theme.spacing.xl,
  },
  modalTitle: {
    ...theme.typography.displaySmall,
    color: theme.colors.primary.main,
    marginBottom: theme.spacing.xs,
  },
  schoolName: {
    ...theme.typography.h3,
    color: theme.colors.text.secondary,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  statusGrid: {
    gap: theme.spacing.sm,
  },
  statusOption: {
    marginBottom: theme.spacing.sm,
  },
  statusCard: {
    padding: theme.spacing.md,
  },
  statusCardSelected: {
    borderWidth: 2,
    borderColor: theme.colors.primary.main,
  },
  statusDescription: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.sm,
  },
  dateInput: {
    marginBottom: theme.spacing.md,
  },
  label: {
    ...theme.typography.labelSmall,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  input: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.glass.white,
    borderWidth: 1,
    borderColor: theme.colors.border.medium,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  hint: {
    ...theme.typography.caption,
    color: theme.colors.text.tertiary,
  },
  notesInput: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.glass.white,
    borderWidth: 1,
    borderColor: theme.colors.border.medium,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    minHeight: 100,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 2,
  },
});

export default StatusUpdateModal;
