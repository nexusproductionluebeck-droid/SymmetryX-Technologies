/**
 * React 18.3 type shim.
 *
 * @types/react >= 18.3 makes `refs` a required field on Component,
 * but several third-party class components (react-native-svg,
 * react-native-reanimated createAnimatedComponent) still ship types
 * generated against the older shape where it was optional.
 *
 * Until those libraries update their typings, we loosen the Component
 * declaration just enough to let JSX usage compile. The runtime is
 * unaffected — `refs` was a legacy escape hatch that's been dead on
 * React's side for years.
 */
import 'react';

declare module 'react' {
  interface Component<P = unknown, S = unknown, SS = unknown> {
    refs?: { [key: string]: React.ReactInstance };
  }
}
