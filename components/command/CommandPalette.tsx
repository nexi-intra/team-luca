'use client';

import React, { useEffect, useState } from 'react';
import { useCommandPalette } from '@/lib/command/context';
import { Command } from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { useFeatureRing } from '@/hooks/useFeatureRing';
import { RingGate } from '@/components/features/RingGate';

export function CommandPalette() {
  const { isOpen, setIsOpen, actions, executeAction } = useCommandPalette();
  const { currentRing } = useFeatureRing();
  const [search, setSearch] = useState('');

  // Group actions by category
  const groupedActions = React.useMemo(() => {
    const groups: Record<string, typeof actions> = {};
    
    actions.forEach(action => {
      const category = action.category || 'Other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(action);
    });

    // Sort categories by priority
    const categoryOrder = ['Navigation', 'General', 'Account', 'Advanced', 'Developer', 'Admin', 'Super Admin', 'Other'];
    const sortedGroups: Record<string, typeof actions> = {};
    
    categoryOrder.forEach(category => {
      if (groups[category]) {
        sortedGroups[category] = groups[category];
      }
    });

    // Add any remaining categories
    Object.keys(groups).forEach(category => {
      if (!sortedGroups[category]) {
        sortedGroups[category] = groups[category];
      }
    });

    return sortedGroups;
  }, [actions]);

  // Filter actions based on search
  const filteredGroups = React.useMemo(() => {
    if (!search) return groupedActions;

    const filtered: Record<string, typeof actions> = {};
    const searchLower = search.toLowerCase();

    Object.entries(groupedActions).forEach(([category, categoryActions]) => {
      const matchingActions = categoryActions.filter(action => {
        const titleMatch = action.title.toLowerCase().includes(searchLower);
        const descMatch = action.description?.toLowerCase().includes(searchLower);
        const keywordMatch = action.keywords?.some(k => k.toLowerCase().includes(searchLower));
        return titleMatch || descMatch || keywordMatch;
      });

      if (matchingActions.length > 0) {
        filtered[category] = matchingActions;
      }
    });

    return filtered;
  }, [groupedActions, search]);

  const formatShortcut = (shortcut: string) => {
    return shortcut
      .split('+')
      .map(part => {
        if (part === 'cmd') return '⌘';
        if (part === 'ctrl') return 'Ctrl';
        if (part === 'shift') return '⇧';
        if (part === 'alt') return '⌥';
        return part.toUpperCase();
      })
      .join('');
  };

  return (
    <RingGate requiredRing={1}>
      <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
        <CommandInput 
          placeholder="Type a command or search..." 
          value={search}
          onValueChange={setSearch}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          {Object.entries(filteredGroups).map(([category, categoryActions], index) => (
            <React.Fragment key={category}>
              {index > 0 && <CommandSeparator />}
              <CommandGroup heading={category}>
                {categoryActions.map(action => {
                  const Icon = action.icon;
                  const isAccessible = action.requiredRing >= currentRing;
                  
                  return (
                    <CommandItem
                      key={action.id}
                      value={action.id}
                      onSelect={() => executeAction(action.id)}
                      disabled={!isAccessible}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        {Icon && <Icon className="h-4 w-4" />}
                        <div className="flex flex-col">
                          <span className="font-medium">{action.title}</span>
                          {action.description && (
                            <span className="text-xs text-muted-foreground">
                              {action.description}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {action.requiredRing <= currentRing && (
                          <Badge variant="outline" className="text-xs">
                            Ring {action.requiredRing}
                          </Badge>
                        )}
                        {action.shortcut && (
                          <CommandShortcut>
                            {formatShortcut(action.shortcut)}
                          </CommandShortcut>
                        )}
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </React.Fragment>
          ))}
          
          {/* Help section */}
          <CommandSeparator />
          <CommandGroup heading="Help">
            <CommandItem disabled className="opacity-60">
              <Command className="mr-3 h-4 w-4" />
              <span className="text-sm">
                Press <kbd className="ml-1 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                  <span className="text-xs">⌘</span>K
                </kbd> to open this menu
              </span>
            </CommandItem>
            <CommandItem disabled className="opacity-60">
              <Badge variant="outline" className="mr-3 h-4 px-1 text-[10px]">Ring</Badge>
              <span className="text-sm">
                Your current ring: {currentRing} (Features shown are based on your access level)
              </span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </RingGate>
  );
}