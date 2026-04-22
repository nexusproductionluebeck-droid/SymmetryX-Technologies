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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from 'react-native-svg';

import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Button } from '@/components/Button';
import { MagnaXLogoMark } from '@/components/MagnaXLogoMark';
import { useTheme } from '@/theme/ThemeProvider';
import type { RootScreenProps } from '@/navigation/types';

type Slide = {
  key: 'connect' | 'control' | 'automate';
  title: string;
  body: string;
  accent: string;
};

const SLIDES: Slide[] = [
  {
    key: 'connect',
    title: 'Verbinden',
    body: 'Jede Lampenfassung wird zum intelligenten Infrastrukturknoten. Ohne Elektriker. Ohne Werkzeug. Magnetisch.',
    accent: '#2E75B6',
  },
  {
    key: 'control',
    title: 'Steuern',
    body: 'Licht, Mesh-WLAN, Sensorik und Kamera aus einem Punkt in der Decke. Eine App. Jede Wohnung. Jede Halle.',
    accent: '#1A8A7D',
  },
  {
    key: 'automate',
    title: 'Automatisieren',
    body: 'Dein Raum liest sich selbst. Bewegung, Luft, Licht, Präsenz — und reagiert, bevor du es bemerkst.',
    accent: '#7C5CE6',
  },
];

const { width, height } = Dimensions.get('window');

export function WelcomeCarouselScreen({ navigation }: RootScreenProps<'Welcome'>) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList<Slide>>(null);
  const scrollX = useSharedValue(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollX.value = event.nativeEvent.contentOffset.x;
  };

  const onMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
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
    <View style={styles.container}>
      <AnimatedBackground intensity="calm" />

      <View style={[styles.header, { paddingTop: insets.top + 24 }]}>
        <MagnaXLogoMark size={42} color={theme.palette.teal} accent={theme.palette.white} />
        <Text style={styles.wordmark}>MagnaX</Text>
      </View>

      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(slide) => slide.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        onMomentumScrollEnd={onMomentumEnd}
        scrollEventThrottle={16}
        renderItem={({ item, index: i }) => <SlideView slide={item} index={i} scrollX={scrollX} />}
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.dots}>
          {SLIDES.map((slide, i) => (
            <Dot key={slide.key} active={i === index} />
          ))}
        </View>
        <Button
          label={index === SLIDES.length - 1 ? 'Jetzt loslegen' : 'Weiter'}
          onPress={handleContinue}
        />
        <Button
          label="Ich habe bereits ein Konto"
          variant="ghost"
          onPress={() => navigation.navigate('Login')}
          style={{ marginTop: 8 }}
        />
      </View>
    </View>
  );
}

function SlideView({
  slide,
  index,
  scrollX,
}: {
  slide: Slide;
  index: number;
  scrollX: Animated.SharedValue<number>;
}) {
  const animatedText = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    const translateY = interpolate(scrollX.value, inputRange, [40, 0, 40]);
    const opacity = interpolate(scrollX.value, inputRange, [0.15, 1, 0.15]);
    return { transform: [{ translateY }], opacity };
  });

  const animatedArt = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    const scale = interpolate(scrollX.value, inputRange, [0.7, 1, 0.7]);
    const opacity = interpolate(scrollX.value, inputRange, [0.1, 1, 0.1]);
    return { transform: [{ scale }], opacity };
  });

  return (
    <View style={[slideStyles.slide, { width }]}>
      <Animated.View style={[slideStyles.artWrap, animatedArt]}>
        <SlideArt kind={slide.key} accent={slide.accent} />
      </Animated.View>

      <Animated.View style={[slideStyles.textWrap, animatedText]}>
        <View style={[slideStyles.accent, { backgroundColor: slide.accent }]} />
        <Text style={slideStyles.title}>{slide.title}</Text>
        <Text style={slideStyles.body}>{slide.body}</Text>
      </Animated.View>
    </View>
  );
}

function SlideArt({ kind, accent }: { kind: Slide['key']; accent: string }) {
  const size = Math.min(width * 0.72, 300);
  return (
    <Svg width={size} height={size} viewBox="0 0 300 300">
      <Defs>
        <RadialGradient id={`glow-${kind}`} cx="50%" cy="50%" r="55%">
          <Stop offset="0" stopColor={accent} stopOpacity={0.55} />
          <Stop offset="1" stopColor={accent} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx="150" cy="150" r="140" fill={`url(#glow-${kind})`} />
      <Circle cx="150" cy="150" r="96" stroke={accent} strokeOpacity={0.45} strokeWidth={1} fill="none" />
      <Circle cx="150" cy="150" r="58" stroke="#FFFFFF" strokeOpacity={0.22} strokeWidth={1} fill="none" />

      {kind === 'connect' && (
        <>
          <Path
            d="M 110 110 L 150 180 L 190 110"
            stroke="#FFFFFF"
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <Circle cx="150" cy="150" r="8" fill={accent} />
        </>
      )}
      {kind === 'control' && (
        <>
          <Circle cx="150" cy="150" r="4" fill="#FFFFFF" />
          <Circle cx="92" cy="120" r="4" fill="#FFFFFF" />
          <Circle cx="208" cy="120" r="4" fill="#FFFFFF" />
          <Circle cx="108" cy="200" r="4" fill="#FFFFFF" />
          <Circle cx="198" cy="196" r="4" fill="#FFFFFF" />
          <Path d="M 150 150 L 92 120 M 150 150 L 208 120 M 150 150 L 108 200 M 150 150 L 198 196"
                stroke="#FFFFFF"
                strokeOpacity={0.35}
                strokeWidth={1} />
        </>
      )}
      {kind === 'automate' && (
        <>
          <Path
            d="M 90 150 C 110 110, 190 110, 210 150"
            stroke="#FFFFFF"
            strokeOpacity={0.7}
            strokeWidth={3}
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d="M 90 162 C 110 202, 190 202, 210 162"
            stroke={accent}
            strokeOpacity={0.8}
            strokeWidth={3}
            strokeLinecap="round"
            fill="none"
          />
          <Circle cx="150" cy="156" r="6" fill="#FFFFFF" />
        </>
      )}
    </Svg>
  );
}

function Dot({ active }: { active: boolean }) {
  const w = useSharedValue(active ? 28 : 8);
  const o = useSharedValue(active ? 1 : 0.35);

  if (active) {
    w.value = withTiming(28, { duration: 320, easing: Easing.out(Easing.cubic) });
    o.value = withTiming(1, { duration: 200 });
  } else {
    w.value = withTiming(8, { duration: 320, easing: Easing.out(Easing.cubic) });
    o.value = withTiming(0.35, { duration: 200 });
  }

  const style = useAnimatedStyle(() => ({ width: w.value, opacity: o.value }));

  return <Animated.View style={[dotStyles.dot, active && dotStyles.active, style]} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#05090F' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  wordmark: { color: '#FFFFFF', fontSize: 22, fontWeight: '700', letterSpacing: -0.4 },
  footer: { paddingHorizontal: 24, gap: 14 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 12 },
});

const slideStyles = StyleSheet.create({
  slide: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  artWrap: { marginBottom: 40, height: Math.min(height * 0.35, 320), justifyContent: 'center' },
  textWrap: { alignItems: 'center', maxWidth: 420 },
  accent: { width: 48, height: 3, borderRadius: 3, marginBottom: 20 },
  title: {
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: '700',
    letterSpacing: -0.8,
    marginBottom: 16,
    textAlign: 'center',
  },
  body: {
    color: 'rgba(232,238,243,0.68)',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
});

const dotStyles = StyleSheet.create({
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(232,238,243,0.45)',
  },
  active: { backgroundColor: '#1A8A7D' },
});
