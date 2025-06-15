'use client';

import React, { createContext, useContext, useReducer, useCallback, useRef, useEffect } from 'react';
import { DemoContextType, DemoState, DemoScript, DemoStep } from './types';
import { parseMarkdownScript } from './parser';

const initialState: DemoState = {
  isPlaying: false,
  isPaused: false,
  currentScript: null,
  currentStepIndex: 0,
  scripts: [],
  speed: 1,
  error: null,
  highlights: []
};

type DemoAction =
  | { type: 'SET_SCRIPT'; script: DemoScript }
  | { type: 'SET_SCRIPTS'; scripts: DemoScript[] }
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'STOP' }
  | { type: 'SET_STEP_INDEX'; index: number }
  | { type: 'SET_SPEED'; speed: number }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'ADD_HIGHLIGHT'; elementId: string }
  | { type: 'REMOVE_HIGHLIGHT'; elementId: string }
  | { type: 'CLEAR_HIGHLIGHTS' };

function demoReducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case 'SET_SCRIPT':
      return { ...state, currentScript: action.script, currentStepIndex: 0, error: null };
    case 'SET_SCRIPTS':
      return { ...state, scripts: action.scripts };
    case 'PLAY':
      return { ...state, isPlaying: true, isPaused: false };
    case 'PAUSE':
      return { ...state, isPlaying: false, isPaused: true };
    case 'STOP':
      return { ...state, isPlaying: false, isPaused: false, currentStepIndex: 0, highlights: [] };
    case 'SET_STEP_INDEX':
      return { ...state, currentStepIndex: action.index };
    case 'SET_SPEED':
      return { ...state, speed: action.speed };
    case 'SET_ERROR':
      return { ...state, error: action.error, isPlaying: false };
    case 'ADD_HIGHLIGHT':
      return { ...state, highlights: [...new Set([...state.highlights, action.elementId])] };
    case 'REMOVE_HIGHLIGHT':
      return { ...state, highlights: state.highlights.filter(id => id !== action.elementId) };
    case 'CLEAR_HIGHLIGHTS':
      return { ...state, highlights: [] };
    default:
      return state;
  }
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function useDemoContext() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemoContext must be used within DemoProvider');
  }
  return context;
}

interface DemoProviderProps {
  children: React.ReactNode;
}

export function DemoProvider({ children }: DemoProviderProps) {
  const [state, dispatch] = useReducer(demoReducer, initialState);
  const elementsRef = useRef<Map<string, HTMLElement>>(new Map());

  const executeStep = useCallback(async (step: DemoStep) => {
    dispatch({ type: 'CLEAR_HIGHLIGHTS' });
    
    try {
      switch (step.type) {
        case 'click': {
          const element = elementsRef.current.get(step.target!);
          if (!element) throw new Error(`Element not found: ${step.target}`);
          dispatch({ type: 'ADD_HIGHLIGHT', elementId: step.target! });
          await new Promise(resolve => setTimeout(resolve, 300));
          element.click();
          break;
        }

        case 'type': {
          const element = elementsRef.current.get(step.target!) as HTMLInputElement;
          if (!element) throw new Error(`Element not found: ${step.target}`);
          dispatch({ type: 'ADD_HIGHLIGHT', elementId: step.target! });
          element.focus();
          
          // Simulate typing
          element.value = '';
          for (const char of step.value!) {
            element.value += char;
            element.dispatchEvent(new Event('input', { bubbles: true }));
            await new Promise(resolve => setTimeout(resolve, 50 / state.speed));
          }
          element.dispatchEvent(new Event('change', { bubbles: true }));
          break;
        }

        case 'wait': {
          await new Promise(resolve => setTimeout(resolve, (step.delay || 1000) / state.speed));
          break;
        }

        case 'navigate': {
          if (step.value?.startsWith('http')) {
            window.open(step.value, '_blank');
          } else {
            window.history.pushState(null, '', step.value);
            window.dispatchEvent(new PopStateEvent('popstate'));
          }
          break;
        }

        case 'highlight': {
          const element = elementsRef.current.get(step.target!);
          if (!element) throw new Error(`Element not found: ${step.target}`);
          dispatch({ type: 'ADD_HIGHLIGHT', elementId: step.target! });
          await new Promise(resolve => setTimeout(resolve, (step.delay || 2000) / state.speed));
          break;
        }

        case 'scroll': {
          const element = elementsRef.current.get(step.target!);
          if (!element) throw new Error(`Element not found: ${step.target}`);
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          await new Promise(resolve => setTimeout(resolve, 1000 / state.speed));
          break;
        }

        case 'hover': {
          const element = elementsRef.current.get(step.target!);
          if (!element) throw new Error(`Element not found: ${step.target}`);
          dispatch({ type: 'ADD_HIGHLIGHT', elementId: step.target! });
          element.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
          await new Promise(resolve => setTimeout(resolve, (step.delay || 1000) / state.speed));
          element.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
          break;
        }

        case 'assert': {
          // This would be implemented based on your testing needs
          console.log('Assert step:', step);
          break;
        }
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  }, [state.speed]);

  const play = useCallback(() => {
    if (!state.currentScript || state.isPlaying) return;
    
    dispatch({ type: 'PLAY' });
    
    const runSteps = async () => {
      const { currentScript, currentStepIndex } = state;
      if (!currentScript) return;
      
      for (let i = currentStepIndex; i < currentScript.steps.length; i++) {
        if (!state.isPlaying) break;
        
        dispatch({ type: 'SET_STEP_INDEX', index: i });
        
        try {
          await executeStep(currentScript.steps[i]);
        } catch (error) {
          dispatch({ type: 'STOP' });
          break;
        }
        
        // Wait between steps
        await new Promise(resolve => setTimeout(resolve, 500 / state.speed));
      }
      
      dispatch({ type: 'STOP' });
    };
    
    runSteps();
  }, [state, executeStep]);

  const pause = useCallback(() => {
    dispatch({ type: 'PAUSE' });
  }, []);

  const stop = useCallback(() => {
    dispatch({ type: 'STOP' });
  }, []);

  const nextStep = useCallback(() => {
    if (!state.currentScript) return;
    const nextIndex = Math.min(state.currentStepIndex + 1, state.currentScript.steps.length - 1);
    dispatch({ type: 'SET_STEP_INDEX', index: nextIndex });
    executeStep(state.currentScript.steps[nextIndex]);
  }, [state, executeStep]);

  const previousStep = useCallback(() => {
    const prevIndex = Math.max(state.currentStepIndex - 1, 0);
    dispatch({ type: 'SET_STEP_INDEX', index: prevIndex });
  }, [state.currentStepIndex]);

  const goToStep = useCallback((index: number) => {
    if (!state.currentScript) return;
    const validIndex = Math.max(0, Math.min(index, state.currentScript.steps.length - 1));
    dispatch({ type: 'SET_STEP_INDEX', index: validIndex });
    executeStep(state.currentScript.steps[validIndex]);
  }, [state.currentScript, executeStep]);

  const setSpeed = useCallback((speed: number) => {
    dispatch({ type: 'SET_SPEED', speed: Math.max(0.5, Math.min(speed, 5)) });
  }, []);

  const loadScript = useCallback(async (scriptId: string) => {
    try {
      const response = await fetch(`/demo/${scriptId}.md`);
      if (!response.ok) throw new Error('Script not found');
      const markdown = await response.text();
      const script = parseMarkdownScript(markdown);
      dispatch({ type: 'SET_SCRIPT', script });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', error: error instanceof Error ? error.message : 'Failed to load script' });
    }
  }, []);

  const loadScriptFromMarkdown = useCallback((markdown: string) => {
    try {
      const script = parseMarkdownScript(markdown);
      dispatch({ type: 'SET_SCRIPT', script });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', error: error instanceof Error ? error.message : 'Failed to parse script' });
    }
  }, []);

  const registerElement = useCallback((id: string, element: HTMLElement) => {
    elementsRef.current.set(id, element);
  }, []);

  const unregisterElement = useCallback((id: string) => {
    elementsRef.current.delete(id);
  }, []);

  // Load available scripts on mount
  useEffect(() => {
    const loadScripts = async () => {
      try {
        const response = await fetch('/api/demo/scripts');
        if (response.ok) {
          const scripts = await response.json();
          dispatch({ type: 'SET_SCRIPTS', scripts });
        }
      } catch (error) {
        console.error('Failed to load demo scripts:', error);
      }
    };
    
    loadScripts();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear any highlights when unmounting
      dispatch({ type: 'CLEAR_HIGHLIGHTS' });
    };
  }, []);

  const value: DemoContextType = {
    ...state,
    loadScript,
    loadScriptFromMarkdown,
    play,
    pause,
    stop,
    nextStep,
    previousStep,
    goToStep,
    setSpeed,
    registerElement,
    unregisterElement
  };

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}