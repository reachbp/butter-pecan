import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Animated,
} from 'react-native';
import { theme } from '../../theme';

export interface GlassButtonProps {
  /** Button text */
  title: string;
  /** Press handler */
  onPress: () => void;
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'glass' | 'outline';
  /** Button size */
  size?: 'small' | 'medium' | 'large';
  /** Disabled state */
  disabled?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Full width button */
  fullWidth?: boolean;
  /** Custom style */
  style?: ViewStyle;
  /** Custom text style */
  textStyle?: TextStyle;
}

/**
 * GlassButton - Button component with glass morphism effect
 *
 * @example
 * ```tsx
 * <GlassButton
 *   title="Submit"
 *   variant="primary"
 *   size="large"
 *   onPress={handleSubmit}
 * />
 * ```
 */
export const GlassButton: React.FC<GlassButtonProps> = ({
  title,
  onPress,
  variant = 'glass',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: theme.glassAnimations.pressScale,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.colors.primary.main,
          borderWidth: 0,
        };
      case 'secondary':
        return {
          backgroundColor: theme.colors.secondary.main,
          borderWidth: 0,
        };
      case 'glass':
        return theme.glassEffects.button;
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: theme.colors.primary.main,
        };
      default:
        return theme.glassEffects.button;
    }
  };

  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
        };
      case 'medium':
        return {
          paddingVertical: theme.spacing.buttonPadding.vertical,
          paddingHorizontal: theme.spacing.buttonPadding.horizontal,
        };
      case 'large':
        return {
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.xl,
        };
      default:
        return {
          paddingVertical: theme.spacing.buttonPadding.vertical,
          paddingHorizontal: theme.spacing.buttonPadding.horizontal,
        };
    }
  };

  const getTextColor = (): string => {
    if (disabled) return theme.colors.text.disabled;

    switch (variant) {
      case 'primary':
        return theme.colors.primary.contrast;
      case 'secondary':
        return theme.colors.secondary.contrast;
      case 'glass':
        return theme.colors.primary.main;
      case 'outline':
        return theme.colors.primary.main;
      default:
        return theme.colors.primary.main;
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle = size === 'small'
      ? theme.typography.buttonSmall
      : theme.typography.button;

    return {
      ...baseStyle,
      color: getTextColor(),
    };
  };

  const buttonStyle = [
    styles.button,
    getVariantStyle(),
    getSizeStyle(),
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ];

  const animatedStyle = {
    transform: [{ scale: scaleAnim }],
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
    >
      <Animated.View style={[buttonStyle, animatedStyle]}>
        {loading ? (
          <ActivityIndicator
            color={getTextColor()}
            size="small"
          />
        ) : (
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
        )}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
});

export default GlassButton;
