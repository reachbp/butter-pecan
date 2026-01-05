import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { GlassCard, GlassButton, GlassBadge } from './src/components';
import { theme } from './src/theme';

export default function App() {
  const handlePress = () => {
    console.log('Button pressed!');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.title}>SchoolWatch</Text>
        <Text style={styles.subtitle}>Glass Component Showcase</Text>

        {/* Glass Cards */}
        <GlassCard variant="card" style={styles.card}>
          <Text style={styles.cardTitle}>Welcome to SchoolWatch</Text>
          <Text style={styles.cardText}>
            Track your private school applications with style
          </Text>
          <GlassBadge label="MVP" variant="success" />
        </GlassCard>

        <GlassCard variant="card" pressable animated onPress={handlePress} style={styles.card}>
          <Text style={styles.cardTitle}>Application Status</Text>
          <View style={styles.badgeContainer}>
            <GlassBadge label="Considering" variant="considering" size="small" />
            <GlassBadge label="Applied" variant="applied" size="small" />
            <GlassBadge label="Interviewed" variant="interviewed" size="small" />
          </View>
          <View style={styles.badgeContainer}>
            <GlassBadge label="Accepted" variant="accepted" size="small" />
            <GlassBadge label="Waitlisted" variant="waitlisted" size="small" />
            <GlassBadge label="Rejected" variant="rejected" size="small" />
          </View>
          <Text style={styles.hint}>Tap this card to test animation</Text>
        </GlassCard>

        {/* Buttons */}
        <GlassButton
          title="Glass Button"
          variant="glass"
          size="large"
          onPress={handlePress}
          fullWidth
          style={styles.button}
        />

        <GlassButton
          title="Primary Button"
          variant="primary"
          size="large"
          onPress={handlePress}
          fullWidth
          style={styles.button}
        />

        <GlassButton
          title="Secondary Button"
          variant="secondary"
          size="medium"
          onPress={handlePress}
          fullWidth
          style={styles.button}
        />

        <GlassButton
          title="Outline Button"
          variant="outline"
          size="medium"
          onPress={handlePress}
          fullWidth
          style={styles.button}
        />
      </ScrollView>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.screenHorizontal,
    paddingTop: theme.spacing['4xl'],
  },
  title: {
    ...theme.typography.displayMedium,
    color: theme.colors.primary.main,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xl,
  },
  card: {
    padding: theme.spacing.cardPadding,
    marginBottom: theme.spacing.md,
  },
  cardTitle: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  cardText: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  hint: {
    ...theme.typography.caption,
    color: theme.colors.text.tertiary,
    fontStyle: 'italic',
    marginTop: theme.spacing.sm,
  },
  button: {
    marginBottom: theme.spacing.md,
  },
});
