"use client";

import { useFeatureRing } from "@/hooks/useFeatureRing";
import { getRingName, FEATURE_RINGS, FeatureRing } from "@monorepo/features";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function FeatureRingSelector() {
  const { currentRing, setRing } = useFeatureRing();

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Feature Ring:</span>
      <Select
        value={currentRing.toString()}
        onValueChange={(value: string) =>
          setRing(parseInt(value) as FeatureRing)
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="4">{getRingName(4)} (Ring 4)</SelectItem>
          <SelectItem value="3">{getRingName(3)} (Ring 3)</SelectItem>
          <SelectItem value="2">{getRingName(2)} (Ring 2)</SelectItem>
          <SelectItem value="1">{getRingName(1)} (Ring 1)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
