import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { GlassCard, GlassBadge } from '../../components';
import { theme } from '../../theme';
import { School } from '../../types/school';
import { communityDataApi, SchoolCommunityStats } from '../../services/communityDataApi';

interface SchoolInsightsScreenProps {
  school: School;
  onBack?: () => void;
}

/**
 * SchoolInsightsScreen - Display community-contributed insights about a school
 */
export const SchoolInsightsScreen: React.FC<SchoolInsightsScreenProps> = ({ school, onBack }) => {
  const [stats, setStats] = useState<SchoolCommunityStats | null>(null);
  const [history, setHistory] = useState<SchoolCommunityStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear() + 1);

  useEffect(() => {
    loadData();
  }, [school.id, selectedYear]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [statsResponse, historyResponse] = await Promise.all([
        communityDataApi.getSchoolStats(school.id, selectedYear),
        communityDataApi.getSchoolHistory(school.id, 3),
      ]);

      setStats(statsResponse.stats);
      setHistory(historyResponse.history);
    } catch (error) {
      console.error('Failed to load community insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStatCard = (
    title: string,
    value: string | number | undefined,
    subtitle?: string,
    icon?: string
  ) => (
    <View style={styles.statCard}>
      {icon && <Text style={styles.statIcon}>{icon}</Text>}
      <Text style={styles.statValue}>{value ?? 'N/A'}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  const renderRatingStars = (rating: number | undefined) => {
    if (!rating) return 'N/A';
    const stars = '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
    return `${stars} (${rating.toFixed(1)})`;
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
          <Text style={styles.title}>{school.name}</Text>
          <Text style={styles.subtitle}>Community Insights</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading insights...</Text>
        </View>
      </View>
    );
  }

  if (!stats || stats.total_contributions === 0) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {onBack && (
            <Pressable onPress={onBack} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Back</Text>
            </Pressable>
          )}

          <View style={styles.header}>
            <Text style={styles.title}>{school.name}</Text>
            <Text style={styles.subtitle}>Community Insights</Text>
          </View>

          <GlassCard variant="lightSubtle" style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyTitle}>No Community Data Yet</Text>
            <Text style={styles.emptyMessage}>
              Be the first to contribute data about {school.name}! Your anonymized experience helps
              other families make informed decisions.
            </Text>
          </GlassCard>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {onBack && (
          <Pressable onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </Pressable>
        )}

        <View style={styles.header}>
          <Text style={styles.title}>{school.name}</Text>
          <Text style={styles.subtitle}>Community Insights</Text>
          <View style={styles.contributionsBadge}>
            <GlassBadge
              label={`${stats.total_contributions} contributions`}
              variant="info"
              size="small"
            />
          </View>
        </View>

        {/* Acceptance Rates */}
        <GlassCard variant="card" style={styles.card}>
          <Text style={styles.sectionTitle}>📈 Acceptance Statistics</Text>
          <View style={styles.statsGrid}>
            {renderStatCard(
              'Acceptance Rate',
              stats.acceptance_rate ? `${stats.acceptance_rate.toFixed(1)}%` : 'N/A',
              undefined,
              '✅'
            )}
            {renderStatCard(
              'Waitlist Rate',
              stats.waitlist_rate ? `${stats.waitlist_rate.toFixed(1)}%` : 'N/A',
              undefined,
              '⏳'
            )}
            {renderStatCard(
              'Rejection Rate',
              stats.rejection_rate ? `${stats.rejection_rate.toFixed(1)}%` : 'N/A',
              undefined,
              '❌'
            )}
          </View>
        </GlassCard>

        {/* Experience Ratings */}
        <GlassCard variant="card" style={styles.card}>
          <Text style={styles.sectionTitle}>⭐ Experience Ratings</Text>

          <View style={styles.ratingRow}>
            <Text style={styles.ratingLabel}>Application Difficulty</Text>
            <Text style={styles.ratingValue}>
              {renderRatingStars(stats.avg_application_difficulty)}
            </Text>
          </View>

          <View style={styles.ratingRow}>
            <Text style={styles.ratingLabel}>Interview Difficulty</Text>
            <Text style={styles.ratingValue}>
              {renderRatingStars(stats.avg_interview_difficulty)}
            </Text>
          </View>

          <View style={styles.ratingRow}>
            <Text style={styles.ratingLabel}>Overall Experience</Text>
            <Text style={styles.ratingValue}>
              {renderRatingStars(stats.avg_overall_experience)}
            </Text>
          </View>
        </GlassCard>

        {/* Financial Aid */}
        {stats.financial_aid_percentage !== undefined && stats.financial_aid_percentage > 0 && (
          <GlassCard variant="card" style={styles.card}>
            <Text style={styles.sectionTitle}>💰 Financial Aid</Text>
            <View style={styles.financialAidRow}>
              <Text style={styles.financialAidLabel}>Families Receiving Aid</Text>
              <Text style={styles.financialAidValue}>
                {stats.financial_aid_percentage.toFixed(1)}%
              </Text>
            </View>
            <Text style={styles.financialAidNote}>
              Based on {stats.total_contributions} community contributions
            </Text>
          </GlassCard>
        )}

        {/* Historical Trends */}
        {history.length > 1 && (
          <GlassCard variant="card" style={styles.card}>
            <Text style={styles.sectionTitle}>📊 Historical Trends</Text>
            {history.map((yearStats) => (
              <View key={yearStats.application_year} style={styles.historyRow}>
                <Text style={styles.historyYear}>{yearStats.application_year}</Text>
                <View style={styles.historyStats}>
                  <Text style={styles.historyValue}>
                    {yearStats.acceptance_rate
                      ? `${yearStats.acceptance_rate.toFixed(1)}% accepted`
                      : 'N/A'}
                  </Text>
                  <Text style={styles.historyContributions}>
                    {yearStats.total_contributions} contributions
                  </Text>
                </View>
              </View>
            ))}
          </GlassCard>
        )}

        {/* Data Privacy Notice */}
        <GlassCard variant="lightSubtle" style={styles.card}>
          <Text style={styles.privacyIcon}>🔒</Text>
          <Text style={styles.privacyTitle}>About This Data</Text>
          <Text style={styles.privacyText}>
            All data is anonymized and contributed by the SchoolWatch community. Statistics are
            calculated from {stats.total_contributions} families who chose to share their
            experiences. Individual identities are never revealed.
          </Text>
        </GlassCard>
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
    marginBottom: theme.spacing.sm,
  },
  contributionsBadge: {
    marginTop: theme.spacing.sm,
  },
  card: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: 100,
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.glass.whiteMedium,
    borderRadius: theme.borderRadius.md,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: theme.spacing.xs,
  },
  statValue: {
    ...theme.typography.h1,
    color: theme.colors.primary.main,
    marginBottom: theme.spacing.xs / 2,
  },
  statTitle: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  statSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.text.tertiary,
    fontSize: 10,
    textAlign: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  ratingLabel: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
  },
  ratingValue: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: theme.fontWeights.medium,
  },
  financialAidRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  financialAidLabel: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
  },
  financialAidValue: {
    ...theme.typography.h2,
    color: theme.colors.primary.main,
  },
  financialAidNote: {
    ...theme.typography.caption,
    color: theme.colors.text.tertiary,
    fontStyle: 'italic',
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  historyYear: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
  },
  historyStats: {
    alignItems: 'flex-end',
  },
  historyValue: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: theme.fontWeights.semibold,
  },
  historyContributions: {
    ...theme.typography.caption,
    color: theme.colors.text.tertiary,
  },
  privacyIcon: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  privacyTitle: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  privacyText: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: theme.lineHeights.relaxed * theme.fontSizes.base,
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
});

export default SchoolInsightsScreen;
