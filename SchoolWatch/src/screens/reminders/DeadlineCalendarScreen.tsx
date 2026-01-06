import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { GlassCard, GlassBadge } from '../../components';
import { theme } from '../../theme';
import { Application } from '../../types/application';
import { applicationsApi } from '../../services/api';

interface DeadlineCalendarScreenProps {
  onApplicationPress?: (application: Application) => void;
}

interface DeadlineItem {
  application: Application;
  deadline: Date;
  deadlineType: 'application' | 'interview' | 'decision';
  daysUntil: number;
}

/**
 * DeadlineCalendarScreen - Shows all upcoming deadlines in chronological order
 */
export const DeadlineCalendarScreen: React.FC<DeadlineCalendarScreenProps> = ({
  onApplicationPress,
}) => {
  const [deadlines, setDeadlines] = useState<DeadlineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDeadlines();
  }, []);

  const loadDeadlines = async () => {
    try {
      setLoading(true);
      const response = await applicationsApi.getAll();
      const applications = response.applications;

      // Extract all deadlines from applications
      const allDeadlines: DeadlineItem[] = [];

      applications.forEach((app) => {
        if (app.application_date) {
          const deadline = new Date(app.application_date);
          const daysUntil = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

          // Only show future deadlines
          if (daysUntil >= 0) {
            allDeadlines.push({
              application: app,
              deadline,
              deadlineType: 'application',
              daysUntil,
            });
          }
        }

        if (app.interview_date) {
          const deadline = new Date(app.interview_date);
          const daysUntil = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

          if (daysUntil >= 0) {
            allDeadlines.push({
              application: app,
              deadline,
              deadlineType: 'interview',
              daysUntil,
            });
          }
        }

        if (app.decision_date) {
          const deadline = new Date(app.decision_date);
          const daysUntil = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

          if (daysUntil >= 0) {
            allDeadlines.push({
              application: app,
              deadline,
              deadlineType: 'decision',
              daysUntil,
            });
          }
        }
      });

      // Sort by deadline date (earliest first)
      allDeadlines.sort((a, b) => a.deadline.getTime() - b.deadline.getTime());

      setDeadlines(allDeadlines);
    } catch (error) {
      console.error('Failed to load deadlines:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadDeadlines();
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getUrgencyColor = (daysUntil: number): string => {
    if (daysUntil <= 3) return theme.colors.status.error;
    if (daysUntil <= 7) return theme.colors.status.warning;
    return theme.colors.primary.main;
  };

  const getDeadlineTypeLabel = (type: string): string => {
    switch (type) {
      case 'application':
        return 'Application Deadline';
      case 'interview':
        return 'Interview Date';
      case 'decision':
        return 'Decision Date';
      default:
        return 'Deadline';
    }
  };

  const getDeadlineIcon = (type: string): string => {
    switch (type) {
      case 'application':
        return '📝';
      case 'interview':
        return '🎯';
      case 'decision':
        return '🎓';
      default:
        return '📅';
    }
  };

  const groupByWeek = (deadlines: DeadlineItem[]): { [key: string]: DeadlineItem[] } => {
    const groups: { [key: string]: DeadlineItem[] } = {};

    deadlines.forEach((item) => {
      let key = '';
      if (item.daysUntil === 0) {
        key = 'Today';
      } else if (item.daysUntil === 1) {
        key = 'Tomorrow';
      } else if (item.daysUntil <= 7) {
        key = 'This Week';
      } else if (item.daysUntil <= 14) {
        key = 'Next Week';
      } else if (item.daysUntil <= 30) {
        key = 'This Month';
      } else {
        key = 'Later';
      }

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
    });

    return groups;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Upcoming Deadlines</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Loading deadlines...</Text>
        </View>
      </View>
    );
  }

  const groupedDeadlines = groupByWeek(deadlines);
  const groupOrder = ['Today', 'Tomorrow', 'This Week', 'Next Week', 'This Month', 'Later'];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Upcoming Deadlines</Text>
          <Text style={styles.subtitle}>{deadlines.length} upcoming deadlines</Text>
        </View>

        {deadlines.length === 0 ? (
          <GlassCard variant="lightSubtle" style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyTitle}>No Upcoming Deadlines</Text>
            <Text style={styles.emptyMessage}>
              Add application dates to your applications to see upcoming deadlines here.
            </Text>
          </GlassCard>
        ) : (
          groupOrder.map((groupName) => {
            const items = groupedDeadlines[groupName];
            if (!items || items.length === 0) return null;

            return (
              <View key={groupName} style={styles.section}>
                <Text style={styles.sectionTitle}>{groupName}</Text>
                {items.map((item, index) => (
                  <GlassCard
                    key={`${item.application.id}-${item.deadlineType}-${index}`}
                    variant="card"
                    pressable={!!onApplicationPress}
                    onPress={() => onApplicationPress?.(item.application)}
                    style={styles.deadlineCard}
                  >
                    <View style={styles.cardHeader}>
                      <View style={styles.cardHeaderLeft}>
                        <Text style={styles.deadlineIcon}>{getDeadlineIcon(item.deadlineType)}</Text>
                        <View style={styles.cardInfo}>
                          <Text style={styles.schoolName}>{item.application.school?.name}</Text>
                          <Text style={styles.deadlineType}>
                            {getDeadlineTypeLabel(item.deadlineType)}
                          </Text>
                        </View>
                      </View>
                      <GlassBadge
                        label={item.application.status}
                        variant={item.application.status as any}
                        size="small"
                      />
                    </View>

                    <View style={styles.cardBody}>
                      <View style={styles.dateRow}>
                        <Text style={styles.dateLabel}>Date:</Text>
                        <Text style={styles.dateValue}>{formatDate(item.deadline)}</Text>
                      </View>
                      <View
                        style={[
                          styles.urgencyBadge,
                          { backgroundColor: getUrgencyColor(item.daysUntil) + '15' },
                        ]}
                      >
                        <Text
                          style={[styles.urgencyText, { color: getUrgencyColor(item.daysUntil) }]}
                        >
                          {item.daysUntil === 0
                            ? 'Due Today!'
                            : item.daysUntil === 1
                            ? 'Due Tomorrow'
                            : `${item.daysUntil} days remaining`}
                        </Text>
                      </View>
                    </View>
                  </GlassCard>
                ))}
              </View>
            );
          })
        )}
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
  title: {
    ...theme.typography.displayMedium,
    color: theme.colors.primary.main,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    paddingLeft: theme.spacing.xs,
  },
  deadlineCard: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deadlineIcon: {
    fontSize: 24,
    marginRight: theme.spacing.sm,
  },
  cardInfo: {
    flex: 1,
  },
  schoolName: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs / 2,
  },
  deadlineType: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  cardBody: {
    marginTop: theme.spacing.sm,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  dateLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.secondary,
  },
  dateValue: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.primary,
    fontWeight: theme.fontWeights.semibold,
  },
  urgencyBadge: {
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    alignItems: 'center',
  },
  urgencyText: {
    ...theme.typography.bodySmall,
    fontWeight: theme.fontWeights.semibold,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCard: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: theme.spacing.md,
  },
  emptyTitle: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  emptyMessage: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: theme.lineHeights.relaxed * theme.fontSizes.base,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
  },
});

export default DeadlineCalendarScreen;
