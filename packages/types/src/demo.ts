/**
 * Demo step types
 */
export interface DemoStep {
  id: string;
  type: 'click' | 'type' | 'wait' | 'navigate' | 'assert' | 'highlight' | 'scroll' | 'hover';
  target?: string;
  value?: string;
  delay?: number;
  description?: string;
}

/**
 * Demo script configuration
 */
export interface DemoScript {
  id: string;
  title: string;
  description: string;
  steps: DemoStep[];
  metadata?: {
    author?: string;
    version?: string;
    tags?: string[];
  };
}

/**
 * Demo playback state
 */
export interface DemoState {
  isPlaying: boolean;
  isPaused: boolean;
  currentScript: DemoScript | null;
  currentStepIndex: number;
  scripts: DemoScript[];
  speed: number;
  error: string | null;
  highlights: string[];
}

/**
 * Demo context interface
 */
export interface DemoContextType extends DemoState {
  loadScript: (scriptId: string) => Promise<void>;
  loadScriptFromMarkdown: (markdown: string) => void;
  play: () => void;
  pause: () => void;
  stop: () => void;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (index: number) => void;
  setSpeed: (speed: number) => void;
  registerElement: (id: string, element: HTMLElement) => void;
  unregisterElement: (id: string) => void;
}