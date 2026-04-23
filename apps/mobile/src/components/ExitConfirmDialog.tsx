import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { Button } from '@/components/Button';

interface Props {
  visible: boolean;
  onDismiss: () => void;
  onConfirm: () => void;
  title?: string;
  body?: string;
  confirmLabel?: string;
  dismissLabel?: string;
}

/**
 * MAGNA-X-styled confirmation dialog for destructive exits. Uses a
 * native Modal so the backdrop sits above everything including the
 * animated background; the card itself slides up, the scrim fades.
 */
export function ExitConfirmDialog({
  visible,
  onDismiss,
  onConfirm,
  title = 'Wirklich zurück?',
  body = 'Wenn du jetzt zurück gehst, verlierst du deine aktuelle Ansicht und musst die Demo von vorne starten.',
  confirmLabel = 'Trotzdem zurück',
  dismissLabel = 'Bleiben',
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      {visible && (
        <>
          <Animated.View
            entering={FadeIn.duration(180)}
            exiting={FadeOut.duration(160)}
            style={StyleSheet.absoluteFill}
          >
            <Pressable style={styles.scrim} onPress={onDismiss} />
          </Animated.View>

          <View style={styles.bottomWrap} pointerEvents="box-none">
            <Animated.View
              entering={SlideInDown.duration(260).springify().damping(18)}
              exiting={SlideOutDown.duration(200)}
              style={styles.card}
            >
              <LinearGradient
                colors={['rgba(30,48,70,0.9)', 'rgba(14,22,30,0.95)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.handle} />
              <View style={styles.eyebrowRow}>
                <View style={styles.eyebrowDot} />
                <Text style={styles.eyebrow}>MAGNA-X · HINWEIS</Text>
              </View>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.body}>{body}</Text>

              <View style={{ height: 18 }} />
              <Button label={dismissLabel} onPress={onDismiss} />
              <View style={{ height: 10 }} />
              <Button label={confirmLabel} variant="secondary" onPress={onConfirm} />
            </Animated.View>
          </View>
        </>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(5,9,15,0.72)',
  },
  bottomWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  card: {
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 34,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignSelf: 'center',
    marginBottom: 18,
  },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  eyebrowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E09A46',
    marginRight: 6,
    shadowColor: '#E09A46',
    shadowOpacity: 0.9,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  eyebrow: {
    color: 'rgba(232,238,243,0.65)',
    fontSize: 10,
    letterSpacing: 2.5,
    fontWeight: '700',
  },
  title: { color: '#FFFFFF', fontSize: 22, fontWeight: '700', letterSpacing: -0.4 },
  body: {
    color: 'rgba(232,238,243,0.75)',
    fontSize: 14,
    marginTop: 10,
    lineHeight: 20,
  },
});
