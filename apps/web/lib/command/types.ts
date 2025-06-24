import { LucideIcon } from 'lucide-react';
import type { FeatureRing } from '@monorepo/features';

export interface CommandAction {
  id: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  shortcut?: string;
  requiredRing: FeatureRing;
  category?: string;
  action: () => void | Promise<void>;
  keywords?: string[];
}

export interface CommandCategory {
  id: string;
  title: string;
  requiredRing: FeatureRing;
}

export interface CommandPaletteContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggle: () => void;
  actions: CommandAction[];
  registerAction: (action: CommandAction) => void;
  unregisterAction: (actionId: string) => void;
  executeAction: (actionId: string) => void;
}