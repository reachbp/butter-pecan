import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { GlassCard, GlassButton, GlassBadge } from '../../components';
import { theme } from '../../theme';
import { School } from '../../types/onboarding';
import { schoolsApi } from '../../services/api';

interface SchoolSelectionScreenProps {
  onComplete: (schoolIds: string[]) => void;
  onBack: () => void;
}

/**
 * Onboarding Screen 3: School Selection
 */
export const SchoolSelectionScreen: React.FC<SchoolSelectionScreenProps> = ({
  onComplete,
  onBack,
}) => {
  const [schools, setSchools] = useState<School[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<School[]>([]);
  const [selectedSchools, setSelectedSchools] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  // Fetch schools on mount
  useEffect(() => {
    fetchSchools();
  }, []);

  // Filter schools when search or city filter changes
  useEffect(() => {
    filterSchools();
  }, [searchQuery, selectedCity, schools]);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      const response = await schoolsApi.getAll();
      setSchools(response.schools);
      setFilteredSchools(response.schools);
    } catch (error) {
      console.error('Failed to fetch schools:', error);
      // TODO: Show error toast
    } finally {
      setLoading(false);
    }
  };

  const filterSchools = () => {
    let filtered = [...schools];

    // Apply city filter
    if (selectedCity) {
      filtered = filtered.filter(school => school.city === selectedCity);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        school =>
          school.name.toLowerCase().includes(query) ||
          school.short_name?.toLowerCase().includes(query) ||
          school.city.toLowerCase().includes(query)
      );
    }

    setFilteredSchools(filtered);
  };

  const toggleSchool = (schoolId: string) => {
    const newSelected = new Set(selectedSchools);
    if (newSelected.has(schoolId)) {
      newSelected.delete(schoolId);
    } else {
      newSelected.add(schoolId);
    }
    setSelectedSchools(newSelected);
  };

  const handleComplete = () => {
    if (selectedSchools.size > 0) {
      onComplete(Array.from(selectedSchools));
    }
  };

  // Get unique cities for filter
  const cities = Array.from(new Set(schools.map(s => s.city))).sort();

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
      >
        {/* Header - Sticky */}
        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Select Schools</Text>
            <Text style={styles.subtitle}>
              Choose the schools you're applying to (select at least 1)
            </Text>
          </View>

          {/* Search Bar */}
          <View style={[styles.searchContainer, theme.glassEffects.lightSubtle]}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search schools..."
              placeholderTextColor={theme.colors.text.tertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* City Filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cityFilterContainer}
          >
            <GlassBadge
              label="All Cities"
              variant={selectedCity === null ? 'applied' : 'default'}
              size="small"
              style={styles.cityBadge}
            />
            {cities.map(city => (
              <GlassCard
                key={city}
                variant={selectedCity === city ? 'lightStrong' : 'lightSubtle'}
                pressable
                onPress={() => setSelectedCity(selectedCity === city ? null : city)}
                style={styles.cityBadge}
              >
                <Text
                  style={[
                    styles.cityBadgeText,
                    selectedCity === city && styles.cityBadgeTextSelected,
                  ]}
                >
                  {city}
                </Text>
              </GlassCard>
            ))}
          </ScrollView>
        </View>

        {/* Schools List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary.main} />
            <Text style={styles.loadingText}>Loading schools...</Text>
          </View>
        ) : filteredSchools.length === 0 ? (
          <GlassCard variant="card" style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              No schools found. Try adjusting your search or filters.
            </Text>
          </GlassCard>
        ) : (
          filteredSchools.map(school => (
            <GlassCard
              key={school.id}
              variant={selectedSchools.has(school.id) ? 'lightStrong' : 'card'}
              pressable
              animated
              onPress={() => toggleSchool(school.id)}
              style={[
                styles.schoolCard,
                selectedSchools.has(school.id) && styles.schoolCardSelected,
              ]}
            >
              <View style={styles.schoolHeader}>
                <View style={styles.schoolInfo}>
                  <Text style={styles.schoolName}>{school.name}</Text>
                  <Text style={styles.schoolCity}>{school.city}</Text>
                </View>
                {selectedSchools.has(school.id) && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </View>

              {school.description && (
                <Text style={styles.schoolDescription} numberOfLines={2}>
                  {school.description}
                </Text>
              )}

              <View style={styles.schoolDetails}>
                {school.grades_offered && (
                  <GlassBadge label={school.grades_offered} size="small" />
                )}
                {school.school_type && (
                  <GlassBadge label={school.school_type} variant="info" size="small" />
                )}
                {school.tuition_range && (
                  <GlassBadge label={school.tuition_range} variant="warning" size="small" />
                )}
              </View>
            </GlassCard>
          ))
        )}
      </ScrollView>

      {/* Bottom Bar - Fixed */}
      <View style={styles.bottomBar}>
        <Text style={styles.selectedCount}>
          {selectedSchools.size} school{selectedSchools.size !== 1 ? 's' : ''} selected
        </Text>
        <View style={styles.buttonContainer}>
          <GlassButton
            title="Back"
            variant="outline"
            size="medium"
            onPress={onBack}
            style={styles.backButton}
          />
          <GlassButton
            title="Complete Setup"
            variant="primary"
            size="medium"
            onPress={handleComplete}
            disabled={selectedSchools.size === 0}
            style={styles.completeButton}
          />
        </View>
        <Text style={styles.footer}>Step 3 of 3</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  headerContainer: {
    backgroundColor: theme.colors.background.secondary,
    paddingTop: theme.spacing['3xl'],
    paddingHorizontal: theme.spacing.screenHorizontal,
    paddingBottom: theme.spacing.md,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.screenHorizontal,
    paddingBottom: 120, // Space for bottom bar
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
  cityFilterContainer: {
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
  },
  cityBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  cityBadgeText: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.secondary,
  },
  cityBadgeTextSelected: {
    color: theme.colors.primary.main,
    fontWeight: theme.fontWeights.semibold,
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
    padding: theme.spacing.lg,
    alignItems: 'center',
    marginVertical: theme.spacing.xl,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  schoolCard: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  schoolCardSelected: {
    borderWidth: 2,
    borderColor: theme.colors.primary.main,
  },
  schoolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  schoolInfo: {
    flex: 1,
  },
  schoolName: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs / 2,
  },
  schoolCity: {
    ...theme.typography.caption,
    color: theme.colors.text.tertiary,
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: theme.colors.primary.contrast,
    fontSize: 16,
    fontWeight: theme.fontWeights.bold,
  },
  schoolDescription: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  schoolDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...theme.glassEffects.navbar,
    paddingHorizontal: theme.spacing.screenHorizontal,
    paddingVertical: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  selectedCount: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  backButton: {
    flex: 1,
  },
  completeButton: {
    flex: 2,
  },
  footer: {
    ...theme.typography.caption,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
  },
});

export default SchoolSelectionScreen;
