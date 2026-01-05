import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { GlassCard, GlassButton, GlassBadge } from '../../components';
import { ApplicationCard } from '../../components/common/ApplicationCard';
import { theme } from '../../theme';
import { Application, ApplicationStatus, STATUS_ORDER } from '../../types/application';
import { applicationsApi } from '../../services/api';

interface DashboardScreenProps {
  onApplicationPress?: (application: Application) => void;
  onAddApplication?: () => void;
}

/**
 * DashboardScreen - Main application tracking dashboard
 */
export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onApplicationPress,
  onAddApplication,
}) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus | 'all'>('all');
  const [stats, setStats] = useState<{ total: number; byStatus: Record<string, number> }>({
    total: 0,
    byStatus: {},
  });

  useEffect(() => {
    fetchApplications();
    fetchStats();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [searchQuery, selectedStatus, applications]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await applicationsApi.getAll();
      setApplications(response.applications);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      // TODO: Show error toast
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await applicationsApi.getStats();
      setStats(response.stats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const filterApplications = () => {
    let filtered = [...applications];

    // Apply status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(app => app.status === selectedStatus);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        app =>
          app.school?.name.toLowerCase().includes(query) ||
          app.school?.city.toLowerCase().includes(query) ||
          app.grade_applying.toLowerCase().includes(query)
      );
    }

    setFilteredApplications(filtered);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchApplications(), fetchStats()]);
    setRefreshing(false);
  };

  const getStatusCount = (status: ApplicationStatus): number => {
    return stats.byStatus[status] || 0;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary.main}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>My Applications</Text>
          <Text style={styles.subtitle}>
            Track your Bay Area private school applications
          </Text>
        </View>

        {/* Stats Cards */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsContainer}
        >
          <GlassCard variant="lightSubtle" style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </GlassCard>

          {STATUS_ORDER.map(status => {
            const count = getStatusCount(status);
            if (count === 0) return null;

            return (
              <GlassCard
                key={status}
                variant="lightSubtle"
                style={styles.statCard}
                pressable
                onPress={() => setSelectedStatus(status)}
              >
                <Text style={styles.statNumber}>{count}</Text>
                <GlassBadge label={status} variant={status as any} size="small" />
              </GlassCard>
            );
          })}
        </ScrollView>

        {/* Search Bar */}
        <View style={[styles.searchContainer, theme.glassEffects.lightSubtle]}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search schools, cities, grades..."
            placeholderTextColor={theme.colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Status Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          <GlassCard
            variant={selectedStatus === 'all' ? 'lightStrong' : 'lightSubtle'}
            pressable
            onPress={() => setSelectedStatus('all')}
            style={styles.filterChip}
          >
            <Text
              style={[
                styles.filterText,
                selectedStatus === 'all' && styles.filterTextSelected,
              ]}
            >
              All ({stats.total})
            </Text>
          </GlassCard>

          {STATUS_ORDER.map(status => {
            const count = getStatusCount(status);
            return (
              <GlassCard
                key={status}
                variant={selectedStatus === status ? 'lightStrong' : 'lightSubtle'}
                pressable
                onPress={() => setSelectedStatus(status)}
                style={styles.filterChip}
              >
                <Text
                  style={[
                    styles.filterText,
                    selectedStatus === status && styles.filterTextSelected,
                  ]}
                >
                  {status} ({count})
                </Text>
              </GlassCard>
            );
          })}
        </ScrollView>

        {/* Applications List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary.main} />
            <Text style={styles.loadingText}>Loading applications...</Text>
          </View>
        ) : filteredApplications.length === 0 ? (
          <GlassCard variant="card" style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📚</Text>
            <Text style={styles.emptyTitle}>
              {applications.length === 0
                ? 'No applications yet'
                : 'No applications match your filters'}
            </Text>
            <Text style={styles.emptyText}>
              {applications.length === 0
                ? 'Start tracking your school applications by adding your first one!'
                : 'Try adjusting your search or filters.'}
            </Text>
            {applications.length === 0 && onAddApplication && (
              <GlassButton
                title="Add First Application"
                variant="primary"
                size="medium"
                onPress={onAddApplication}
                style={styles.emptyButton}
              />
            )}
          </GlassCard>
        ) : (
          <>
            <Text style={styles.resultCount}>
              Showing {filteredApplications.length} application
              {filteredApplications.length !== 1 ? 's' : ''}
            </Text>

            {filteredApplications.map(application => (
              <ApplicationCard
                key={application.id}
                application={application}
                onPress={onApplicationPress}
              />
            ))}
          </>
        )}
      </ScrollView>

      {/* Floating Add Button */}
      {onAddApplication && applications.length > 0 && (
        <View style={styles.fab}>
          <GlassButton
            title="+ Add Application"
            variant="primary"
            size="large"
            onPress={onAddApplication}
            fullWidth
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.screenHorizontal,
    paddingTop: theme.spacing['3xl'],
    paddingBottom: 100, // Space for FAB
  },
  header: {
    marginBottom: theme.spacing.md,
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
  statsContainer: {
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
  },
  statCard: {
    padding: theme.spacing.md,
    minWidth: 100,
    alignItems: 'center',
  },
  statNumber: {
    ...theme.typography.displaySmall,
    color: theme.colors.primary.main,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  searchContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  searchInput: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    padding: 0,
  },
  filterContainer: {
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
  },
  filterChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  filterText: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.secondary,
  },
  filterTextSelected: {
    color: theme.colors.primary.main,
    fontWeight: theme.fontWeights.semibold,
  },
  resultCount: {
    ...theme.typography.caption,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing.sm,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing['4xl'],
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.md,
  },
  emptyCard: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    marginVertical: theme.spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  emptyTitle: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  emptyButton: {
    minWidth: 200,
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing.lg,
    left: theme.spacing.screenHorizontal,
    right: theme.spacing.screenHorizontal,
    ...theme.glassEffects.card,
    padding: theme.spacing.md,
  },
});

export default DashboardScreen;
