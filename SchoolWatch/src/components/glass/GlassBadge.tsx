import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { theme } from '../../theme';

export type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'considering'
  | 'applied'
  | 'interviewed'
  | 'accepted'
  | 'waitlisted'
  | 'rejected'
  | 'decided';

export interface GlassBadgeProps {
  /** Badge label */
  label: string;
  /** Badge variant */
  variant?: BadgeVariant;
  /** Custom container style */
  style?: ViewStyle;
  /** Custom text style */
  textStyle?: TextStyle;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
}

/**
 * GlassBadge - Status badge with glass morphism effect
 *
 * @example
 * ```tsx
 * <GlassBadge
 *   label="Accepted"
 *   variant="accepted"
 *   size="medium"
 * />
 * ```
 */
export const GlassBadge: React.FC<GlassBadgeProps> = ({
  label,
  variant = 'default',
  style,
  textStyle,
  size = 'medium',
}) => {
  const getVariantColors = () => {
    switch (variant) {
      case 'success':
        return {
          backgroundColor: `${theme.colors.status.success}20`,
          borderColor: theme.colors.status.success,
          textColor: theme.colors.status.success,
        };
      case 'warning':
        return {
          backgroundColor: `${theme.colors.status.warning}20`,
          borderColor: theme.colors.status.warning,
          textColor: theme.colors.status.warning,
        };
      case 'error':
        return {
          backgroundColor: `${theme.colors.status.error}20`,
          borderColor: theme.colors.status.error,
          textColor: theme.colors.status.error,
        };
      case 'info':
        return {
          backgroundColor: `${theme.colors.status.info}20`,
          borderColor: theme.colors.status.info,
          textColor: theme.colors.status.info,
        };
      // Application status variants
      case 'considering':
        return {
          backgroundColor: `${theme.colors.applicationStatus.considering}20`,
          borderColor: theme.colors.applicationStatus.considering,
          textColor: theme.colors.applicationStatus.considering,
        };
      case 'applied':
        return {
          backgroundColor: `${theme.colors.applicationStatus.applied}20`,
          borderColor: theme.colors.applicationStatus.applied,
          textColor: theme.colors.applicationStatus.applied,
        };
      case 'interviewed':
        return {
          backgroundColor: `${theme.colors.applicationStatus.interviewed}20`,
          borderColor: theme.colors.applicationStatus.interviewed,
          textColor: theme.colors.applicationStatus.interviewed,
        };
      case 'accepted':
        return {
          backgroundColor: `${theme.colors.applicationStatus.accepted}20`,
          borderColor: theme.colors.applicationStatus.accepted,
          textColor: theme.colors.applicationStatus.accepted,
        };
      case 'waitlisted':
        return {
          backgroundColor: `${theme.colors.applicationStatus.waitlisted}20`,
          borderColor: theme.colors.applicationStatus.waitlisted,
          textColor: theme.colors.applicationStatus.waitlisted,
        };
      case 'rejected':
        return {
          backgroundColor: `${theme.colors.applicationStatus.rejected}20`,
          borderColor: theme.colors.applicationStatus.rejected,
          textColor: theme.colors.applicationStatus.rejected,
        };
      case 'decided':
        return {
          backgroundColor: `${theme.colors.applicationStatus.decided}20`,
          borderColor: theme.colors.applicationStatus.decided,
          textColor: theme.colors.applicationStatus.decided,
        };
      default:
        return {
          backgroundColor: theme.colors.glass.gray,
          borderColor: theme.colors.border.medium,
          textColor: theme.colors.text.secondary,
        };
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: theme.spacing.xs / 2,
          paddingHorizontal: theme.spacing.sm,
          fontSize: theme.fontSizes.xs,
        };
      case 'large':
        return {
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
          fontSize: theme.fontSizes.base,
        };
      case 'medium':
      default:
        return {
          paddingVertical: theme.spacing.xs,
          paddingHorizontal: theme.spacing.sm,
          fontSize: theme.fontSizes.sm,
        };
    }
  };

  const colors = getVariantColors();
  const sizeStyle = getSizeStyle();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.backgroundColor,
          borderColor: colors.borderColor,
          paddingVertical: sizeStyle.paddingVertical,
          paddingHorizontal: sizeStyle.paddingHorizontal,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: colors.textColor,
            fontSize: sizeStyle.fontSize,
          },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    ...theme.typography.labelSmall,
    fontWeight: theme.fontWeights.semibold,
  },
});

export default GlassBadge;
