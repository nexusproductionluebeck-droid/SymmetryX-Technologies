import { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { MagnaXLogoMark } from '@/components/MagnaXLogoMark';
import { useTheme } from '@/theme/ThemeProvider';
import type { RootScreenProps } from '@/navigation/types';

type Slide = { title: string; body: string; accent: string };

const SLIDES: Slide[] = [
  {
    title: 'Verbinden',
    body: 'Ersetze deine Lampenfassung. Der MagnaX-Lock rastet magnetisch ein — kein Werkzeug, kein Elektriker.',
    accent: '#2E75B6',
  },
  {
    title: 'Steuern',
    body: 'Licht, Sensorik, WLAN-Mesh und Kamera aus jedem Deckenpunkt. Eine App. Ein Zuhause.',
    accent: '#1A8A7D',
  },
  {
    title: 'Automatisieren',
    body: 'Szenen, Zeitpläne und Bewegungsregeln. Dein Zuhause reagiert, bevor du es merkst.',
    accent: '#1B3A5C',
  },
];

const { width } = Dimensions.get('window');

export function WelcomeCarouselScreen({ navigation }: RootScreenProps<'Welcome'>) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList<Slide>>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(event.nativeEvent.contentOffset.x / width);
    if (next !== index) setIndex(next);
  };

  const handleContinue = () => {
    if (index < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1, animated: true });
      return;
    }
    navigation.navigate('Login');
  };

  return (
    <LinearGradient
      colors={[theme.palette.navy, '#0A1B30']}
      style={[styles.container, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}
    >
      <View style={styles.header}>
        <MagnaXLogoMark size={48} color={theme.palette.teal} accent={theme.palette.white} />
        <Text style={styles.wordmark}>MagnaX</Text>
      </View>

      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(item) => item.title}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={[styles.accent, { backgroundColor: item.accent }]} />
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
          </View>
        )}
      />

      <View style={styles.dots}>
        {SLIDES.map((s, i) => (
          <View
            key={s.title}
            style={[
              styles.dot,
              { backgroundColor: i === index ? theme.palette.teal : 'rgba(255,255,255,0.3)' },
            ]}
          />
        ))}
      </View>

      <View style={styles.actions}>
        <Button
          label={index === SLIDES.length - 1 ? 'Jetzt loslegen' : 'Weiter'}
          onPress={handleContinue}
        />
        <Button
          label="Anmelden"
          variant="ghost"
          onPress={() => navigation.navigate('Login')}
          style={{ marginTop: 8 }}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 24 },
  wordmark: { color: '#FFFFFF', fontSize: 22, fontWeight: '700' },
  slide: { paddingHorizontal: 36, justifyContent: 'center' },
  accent: { width: 56, height: 4, borderRadius: 4, marginBottom: 24 },
  title: { color: '#FFFFFF', fontSize: 34, fontWeight: '700', letterSpacing: -0.5, marginBottom: 16 },
  body: { color: 'rgba(255,255,255,0.78)', fontSize: 17, lineHeight: 25 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginVertical: 16 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  actions: { paddingHorizontal: 24 },
});
