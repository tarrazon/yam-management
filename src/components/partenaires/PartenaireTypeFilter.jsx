import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, X } from "lucide-react";
import { PARTENAIRE_TYPES_HIERARCHY } from "@/utils/partenaireTypes";

export default function PartenaireTypeFilter({ value = [], onChange }) {
  const [open, setOpen] = useState(false);

  const allMainCategories = Object.keys(PARTENAIRE_TYPES_HIERARCHY);

  const toggleCategory = (categoryKey) => {
    const newValue = [...value];
    const index = newValue.indexOf(categoryKey);

    if (index > -1) {
      newValue.splice(index, 1);
    } else {
      newValue.push(categoryKey);
    }

    onChange(newValue);
  };

  const clearAll = () => {
    onChange([]);
  };

  const selectedLabels = value.map(key =>
    PARTENAIRE_TYPES_HIERARCHY[key]?.label || key
  );

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between"
          >
            <span className="truncate">
              {value.length === 0
                ? "Tous types"
                : `${value.length} type${value.length > 1 ? 's' : ''} sélectionné${value.length > 1 ? 's' : ''}`
              }
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4 bg-white" align="start">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">Type de partenaire</h4>
              {value.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  className="h-auto p-1 text-xs"
                >
                  Tout effacer
                </Button>
              )}
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {allMainCategories.map((categoryKey) => {
                const category = PARTENAIRE_TYPES_HIERARCHY[categoryKey];
                return (
                  <div key={categoryKey} className="flex items-center space-x-2">
                    <Checkbox
                      id={`filter-${categoryKey}`}
                      checked={value.includes(categoryKey)}
                      onCheckedChange={() => toggleCategory(categoryKey)}
                    />
                    <Label
                      htmlFor={`filter-${categoryKey}`}
                      className="text-sm cursor-pointer flex-1"
                    >
                      {category.label}
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedLabels.map((label, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {label}
              <button
                onClick={() => toggleCategory(value[index])}
                className="ml-1 hover:bg-slate-300 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
