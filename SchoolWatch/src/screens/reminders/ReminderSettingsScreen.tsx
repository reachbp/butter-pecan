import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  Pressable,
} from 'react-native';
import { GlassCard, GlassButton } from '../../components';
import { theme } from '../../theme';
import { reminderApi, UserReminderPreferences } from '../../services/reminderApi';

interface ReminderSettingsScreenProps {
  onBack?: () => void;
}

/**
 * ReminderSettingsScreen - Manage reminder and notification preferences
 */
export const ReminderSettingsScreen: React.FC<ReminderSettingsScreenProps> = ({ onBack }) => {
  const [preferences, setPreferences] = useState<UserReminderPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editable state
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [applicationDays, setApplicationDays] = useState<number[]>([7, 3, 1]);
  const [interviewDays, setInterviewDays] = useState<number[]>([7, 3, 1]);
  const [decisionDays, setDecisionDays] = useState<number[]>([7, 3, 1]);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const response = await reminderApi.getPreferences();
      const prefs = response.preferences;
      setPreferences(prefs);

      // Set editable state
      setNotificationEnabled(prefs.notification_enabled);
      setEmailEnabled(prefs.email_enabled);
      setPushEnabled(prefs.push_enabled);
      setApplicationDays(prefs.application_deadline_days || [7, 3, 1]);
      setInterviewDays(prefs.interview_date_days || [7, 3, 1]);
      setDecisionDays(prefs.decision_date_days || [7, 3, 1]);
    } catch (error) {
      console.error('Failed to load preferences:', error);
      Alert.alert('Error', 'Failed to load reminder preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await reminderApi.updatePreferences({
        notification_enabled: notificationEnabled,
        email_enabled: emailEnabled,
        push_enabled: pushEnabled,
        application_deadline_days: applicationDays,
        interview_date_days: interviewDays,
        decision_date_days: decisionDays,
      });

      Alert.alert('Success', 'Reminder preferences updated successfully');
      loadPreferences(); // Reload to get updated data
    } catch (error) {
      console.error('Failed to save preferences:', error);
      Alert.alert('Error', 'Failed to save reminder preferences');
    } finally {
      setSaving(false);
    }
  };

  const toggleDayPreference = (
    type: 'application' | 'interview' | 'decision',
    day: number
  ) => {
    const setter = type === 'application'
      ? setApplicationDays
      : type === 'interview'
      ? setInterviewDays
      : setDecisionDays;

    const current = type === 'application'
      ? applicationDays
      : type === 'interview'
      ? interviewDays
      : decisionDays;

    if (current.includes(day)) {
      setter(current.filter(d => d !== day));
    } else {
      setter([...current, day].sort((a, b) => b - a));
    }
  };

  const renderDaySelector = (
    type: 'application' | 'interview' | 'decision',
    title: string,
    icon: string
  ) => {
    const selectedDays = type === 'application'
      ? applicationDays
      : type === 'interview'
      ? interviewDays
      : decisionDays;

    const dayOptions = [14, 7, 3, 1];

    return (
      <GlassCard variant="card" style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>{icon}</Text>
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
        <Text style={styles.cardDescription}>
          Choose when to receive reminders before this date
        </Text>
        <View style={styles.dayOptions}>
          {dayOptions.map((day) => (
            <Pressable
              key={day}
              onPress={() => toggleDayPreference(type, day)}
              style={[
                styles.dayOption,
                selectedDays.includes(day) && styles.dayOptionSelected,
              ]}
            >
              <Text
                style={[
                  styles.dayOptionText,
                  selectedDays.includes(day) && styles.dayOptionTextSelected,
                ]}
              >
                {day} day{day !== 1 ? 's' : ''} before
              </Text>
            </Pressable>
          ))}
        </View>
      </GlassCard>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          {onBack && (
            <Pressable onPress={onBack} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Back</Text>
            </Pressable>
          )}
          <Text style={styles.title}>Reminder Settings</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading preferences...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {onBack && (
          <Pressable onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </Pressable>
        )}

        <View style={styles.header}>
          <Text style={styles.title}>Reminder Settings</Text>
          <Text style={styles.subtitle}>Manage when and how you receive deadline reminders</Text>
        </View>

        {/* Notification Channels */}
        <GlassCard variant="card" style={styles.card}>
          <Text style={styles.sectionTitle}>Notification Channels</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>All Notifications</Text>
              <Text style={styles.settingDescription}>Master switch for all reminders</Text>
            </View>
            <Switch
              value={notificationEnabled}
              onValueChange={setNotificationEnabled}
              trackColor={{ false: theme.colors.glass.whiteMedium, true: theme.colors.primary.main }}
              thumbColor={theme.colors.glass.white}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Push Notifications</Text>
              <Text style={styles.settingDescription}>Get notifications on your device</Text>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
              disabled={!notificationEnabled}
              trackColor={{ false: theme.colors.glass.whiteMedium, true: theme.colors.primary.main }}
              thumbColor={theme.colors.glass.white}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Email Reminders</Text>
              <Text style={styles.settingDescription}>Receive reminders via email</Text>
            </View>
            <Switch
              value={emailEnabled}
              onValueChange={setEmailEnabled}
              disabled={!notificationEnabled}
              trackColor={{ false: theme.colors.glass.whiteMedium, true: theme.colors.primary.main }}
              thumbColor={theme.colors.glass.white}
            />
          </View>
        </GlassCard>

        {/* Reminder Timing */}
        <Text style={styles.sectionHeader}>Reminder Timing</Text>

        {renderDaySelector('application', 'Application Deadlines', '📝')}
        {renderDaySelector('interview', 'Interview Dates', '🎯')}
        {renderDaySelector('decision', 'Decision Dates', '🎓')}

        {/* Info Card */}
        <GlassCard variant="lightSubtle" style={styles.card}>
          <Text style={styles.infoIcon}>💡</Text>
          <Text style={styles.infoTitle}>How Reminders Work</Text>
          <Text style={styles.infoText}>
            When you add or update dates on your applications, reminders are automatically created
            based on your preferences above. You'll receive notifications at the times you've
            selected for each type of deadline.
          </Text>
        </GlassCard>

        {/* Save Button */}
        <GlassButton
          title="Save Preferences"
          variant="primary"
          size="large"
          onPress={handleSave}
          loading={saving}
          fullWidth
          style={styles.saveButton}
        />
      </ScrollView>
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
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
  },
  sectionHeader: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    paddingLeft: theme.spacing.xs,
  },
  card: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  settingInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  settingLabel: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs / 2,
  },
  settingDescription: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  cardIcon: {
    fontSize: 24,
    marginRight: theme.spacing.sm,
  },
  cardTitle: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
  },
  cardDescription: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  dayOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  dayOption: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.glass.whiteMedium,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  dayOptionSelected: {
    backgroundColor: theme.colors.primary.main + '20',
    borderColor: theme.colors.primary.main,
  },
  dayOptionText: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.secondary,
  },
  dayOptionTextSelected: {
    color: theme.colors.primary.main,
    fontWeight: theme.fontWeights.semibold,
  },
  infoIcon: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  infoTitle: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  infoText: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: theme.lineHeights.relaxed * theme.fontSizes.base,
  },
  saveButton: {
    marginTop: theme.spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
  },
});

export default ReminderSettingsScreen;
