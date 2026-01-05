import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
  ViewStyle,
} from 'react-native';
import { theme } from '../../theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface GlassModalProps {
  /** Modal visibility */
  visible: boolean;
  /** Close handler */
  onClose: () => void;
  /** Children components */
  children: React.ReactNode;
  /** Modal title (optional) */
  title?: string;
  /** Enable dismiss on backdrop press */
  dismissOnBackdrop?: boolean;
  /** Animation type */
  animationType?: 'fade' | 'slide' | 'scale';
  /** Custom content style */
  contentStyle?: ViewStyle;
}

/**
 * GlassModal - Full-screen modal with glass morphism overlay
 *
 * @example
 * ```tsx
 * <GlassModal
 *   visible={isVisible}
 *   onClose={handleClose}
 *   animationType="slide"
 * >
 *   <Text>Modal Content</Text>
 * </GlassModal>
 * ```
 */
export const GlassModal: React.FC<GlassModalProps> = ({
  visible,
  onClose,
  children,
  dismissOnBackdrop = true,
  animationType = 'slide',
  contentStyle,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: theme.glassAnimations.transitionDuration,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 20,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          damping: 15,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: theme.glassAnimations.transitionDuration,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: theme.glassAnimations.transitionDuration,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: theme.glassAnimations.transitionDuration,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, slideAnim, scaleAnim]);

  const getContentAnimatedStyle = () => {
    switch (animationType) {
      case 'slide':
        return {
          transform: [{ translateY: slideAnim }],
        };
      case 'scale':
        return {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        };
      case 'fade':
      default:
        return {
          opacity: fadeAnim,
        };
    }
  };

  const handleBackdropPress = () => {
    if (dismissOnBackdrop) {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* Glass Overlay */}
        <Pressable
          style={styles.overlay}
          onPress={handleBackdropPress}
        >
          <Animated.View
            style={[
              styles.overlayBackground,
              { opacity: fadeAnim },
            ]}
          />
        </Pressable>

        {/* Modal Content */}
        <Animated.View
          style={[
            styles.content,
            theme.glassEffects.modalContent,
            getContentAnimatedStyle(),
            contentStyle,
          ]}
        >
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayBackground: {
    ...StyleSheet.absoluteFillObject,
    ...theme.glassEffects.modalOverlay,
  },
  content: {
    width: '100%',
    maxHeight: SCREEN_HEIGHT * 0.9,
    padding: theme.spacing.lg,
    marginBottom: 0,
  },
});

export default GlassModal;
