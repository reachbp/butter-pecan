import React from 'react';
import { View, ViewProps, StyleSheet, Pressable, Animated } from 'react-native';
import { theme } from '../../theme';
import { GlassEffectType } from '../../theme/glassEffects';

export interface GlassCardProps extends ViewProps {
  /** Glass effect variant */
  variant?: GlassEffectType;
  /** Enable press interaction */
  pressable?: boolean;
  /** Press handler */
  onPress?: () => void;
  /** Enable hover animation (scale effect) */
  animated?: boolean;
  /** Children components */
  children?: React.ReactNode;
}

/**
 * GlassCard - Primary glass morphism container component
 *
 * @example
 * ```tsx
 * <GlassCard variant="card" pressable onPress={handlePress}>
 *   <Text>Content here</Text>
 * </GlassCard>
 * ```
 */
export const GlassCard: React.FC<GlassCardProps> = ({
  variant = 'card',
  pressable = false,
  onPress,
  animated = false,
  children,
  style,
  ...props
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const glassStyle = theme.glassEffects[variant];

  const handlePressIn = () => {
    if (animated) {
      Animated.spring(scaleAnim, {
        toValue: theme.glassAnimations.pressScale,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (animated) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  };

  const containerStyle = [
    styles.container,
    glassStyle,
    style,
  ];

  const animatedStyle = animated ? {
    transform: [{ scale: scaleAnim }],
  } : undefined;

  if (pressable && onPress) {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        {...props}
      >
        <Animated.View style={[containerStyle, animatedStyle]}>
          {children}
        </Animated.View>
      </Pressable>
    );
  }

  return (
    <Animated.View style={[containerStyle, animatedStyle]} {...props}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});

export default GlassCard;
