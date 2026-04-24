import { Pressable, StyleSheet, Text, View } from 'react-native';

export type HomeTab = 'rooms' | 'cameras' | 'analytics' | 'mesh';

interface Props {
  active: HomeTab;
  onChange: (next: HomeTab) => void;
}

const TABS: ReadonlyArray<{ key: HomeTab; label: string }> = [
  { key: 'rooms', label: 'Räume' },
  { key: 'cameras', label: 'Kameras' },
  { key: 'analytics', label: 'Analyse' },
  { key: 'mesh', label: 'Mesh' },
];

/**
 * Segmented control for the Home cockpit. Four inline tabs (Räume ·
 * Kameras · Analyse · Mesh) instead of a hidden Mesh KPI — makes
 * the app read as a proper house dashboard.
 */
export function HomeTabs({ active, onChange }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.track}>
        {TABS.map((tab) => {
          const isActive = active === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => onChange(tab.key)}
              style={[styles.tab, isActive && styles.tabActive]}
            >
              <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 20, marginBottom: 8 },
  track: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: 'rgba(26,138,125,0.32)',
    borderWidth: 1,
    borderColor: 'rgba(26,138,125,0.6)',
  },
  label: {
    color: 'rgba(232,238,243,0.65)',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  labelActive: { color: '#FFFFFF', fontWeight: '700' },
});
