import type { ComponentType, SVGProps } from 'react';
import type { Topic } from '../data/types';
import { IconChart, IconFactory, IconPulse, IconScale, IconShield } from './Icons';

type IconC = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;

export const TOPIC_ICON: Record<Topic, IconC> = {
  'Healthcare AI': IconPulse,
  'Business Analytics': IconChart,
  'Security & Privacy': IconShield,
  'Economics & Society': IconScale,
  'Industry & Supply Chains': IconFactory,
};
