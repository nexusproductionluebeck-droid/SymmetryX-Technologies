import { useEffect, useState } from 'react';
import { BackHandler, Platform } from 'react-native';

interface Result {
  /** Should the confirm dialog be visible right now? */
  showDialog: boolean;
  /** Dismiss the dialog (user chose "Bleiben"). */
  dismissDialog: () => void;
  /** Confirm exit — caller handles the actual navigation/reset. */
  confirmExit: () => void;
}

/**
 * Exit confirmation guard.
 *
 * When `active` is true:
 * - On web: blocks browser back + tab close. We push an extra
 *   history entry on mount; when the user hits back, we re-push
 *   that entry so the app stays on the current URL and open the
 *   in-app confirm dialog instead. Also registers `beforeunload`
 *   so tab-close / refresh triggers the native browser prompt as a
 *   secondary safety net.
 * - On Android: captures the hardware back button and shows the
 *   dialog instead of exiting the app.
 *
 * The caller owns the "what happens on confirm" action — typically
 * a `navigation.reset` to the welcome screen — so this hook stays
 * screen-agnostic.
 */
export function useExitGuard(active: boolean): Result {
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    if (!active) return;

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const currentHref = window.location.href;
      window.history.pushState({ __magnaxGuard: true }, '', currentHref);

      const handlePop = () => {
        // Re-push so the user is still "trapped" on the same URL.
        window.history.pushState({ __magnaxGuard: true }, '', currentHref);
        setShowDialog(true);
      };

      const handleBeforeUnload = (event: BeforeUnloadEvent) => {
        event.preventDefault();
        event.returnValue = '';
      };

      window.addEventListener('popstate', handlePop);
      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        window.removeEventListener('popstate', handlePop);
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      setShowDialog(true);
      return true;
    });
    return () => subscription.remove();
  }, [active]);

  return {
    showDialog,
    dismissDialog: () => setShowDialog(false),
    confirmExit: () => setShowDialog(false),
  };
}
