export type SubscriptionTier = 'basic' | 'home' | 'business' | 'enterprise';

export type UserRole = 'super-admin' | 'admin' | 'manager' | 'operator' | 'viewer' | 'guest';

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  role: UserRole;
  tier: SubscriptionTier;
  locale: 'de' | 'en' | 'es' | 'fr' | 'it';
  createdAt: string;
}

export const TIER_FEATURES: Record<SubscriptionTier, ReadonlyArray<string>> = {
  basic: ['app_control', 'firmware_updates', 'simple_scenes'],
  home: [
    'app_control',
    'firmware_updates',
    'simple_scenes',
    'automations',
    'energy_reports',
    'schedules',
    'voice_control',
  ],
  business: [
    'app_control',
    'firmware_updates',
    'simple_scenes',
    'automations',
    'energy_reports',
    'schedules',
    'voice_control',
    'multi_site',
    'api_access',
    'analytics',
    'usage_data',
  ],
  enterprise: [
    'app_control',
    'firmware_updates',
    'simple_scenes',
    'automations',
    'energy_reports',
    'schedules',
    'voice_control',
    'multi_site',
    'api_access',
    'analytics',
    'usage_data',
    'sla',
    'failover',
    'custom_integration',
    'dedicated_support',
  ],
};

export const TIER_PRICE_EUR: Record<SubscriptionTier, number> = {
  basic: 0,
  home: 4.99,
  business: 14.99,
  enterprise: 49.99,
};
