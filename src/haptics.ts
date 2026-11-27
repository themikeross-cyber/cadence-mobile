import * as Haptics from 'expo-haptics';

function safely(effect: Promise<void>) {
  effect.catch(() => {});
}

export function hapticSelect() {
  safely(Haptics.selectionAsync());
}

export function hapticComplete() {
  safely(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
}

export function hapticDelete() {
  safely(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
}
