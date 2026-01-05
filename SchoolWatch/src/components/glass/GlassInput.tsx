import React from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { theme } from '../../theme';

export interface GlassInputProps extends TextInputProps {
  /** Input label */
  label?: string;
  /** Error message */
  error?: string;
  /** Container style */
  containerStyle?: ViewStyle;
}

/**
 * GlassInput - Text input with glass morphism effect
 *
 * @example
 * ```tsx
 * <GlassInput
 *   label="Email"
 *   placeholder="Enter your email"
 *   value={email}
 *   onChangeText={setEmail}
 *   error={emailError}
 * />
 * ```
 */
export const GlassInput: React.FC<GlassInputProps> = ({
  label,
  error,
  containerStyle,
  style,
  ...props
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, theme.glassEffects.lightSubtle]}>
        <TextInput
          style={[styles.input, theme.typography.body, style]}
          placeholderTextColor={theme.colors.text.tertiary}
          {...props}
        />
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    ...theme.typography.labelSmall,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  inputContainer: {
    paddingHorizontal: theme.spacing.inputPadding.horizontal,
    paddingVertical: theme.spacing.inputPadding.vertical,
  },
  input: {
    color: theme.colors.text.primary,
    padding: 0,
  },
  error: {
    ...theme.typography.caption,
    color: theme.colors.status.error,
    marginTop: theme.spacing.xs,
  },
});

export default GlassInput;
