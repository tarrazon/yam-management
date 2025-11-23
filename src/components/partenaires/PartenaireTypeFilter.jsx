import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, X } from "lucide-react";
import { PARTENAIRE_TYPES_HIERARCHY } from "@/utils/partenaireTypes";

export default function PartenaireTypeFilter({ value = [], onChange }) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState({});

  const toggleExpand = (path) => {
    setExpanded(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const isSelected = (path) => {
    return value.includes(path);
  };

  const toggleSelection = (path) => {
    const newValue = [...value];
    const index = newValue.indexOf(path);

    if (index > -1) {
      newValue.splice(index, 1);
    } else {
      newValue.push(path);
    }

    onChange(newValue);
  };

  const clearAll = () => {
    onChange([]);
  };

  const getLabelFromPath = (path) => {
    const parts = path.split('.');
    let current = PARTENAIRE_TYPES_HIERARCHY;
    let labels = [];

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];

      if (i === 0) {
        labels.push(current[part]?.label || part);
        current = current[part]?.children;
      } else {
        if (current && current[part]) {
          labels.push(current[part].label || part);
          current = current[part].children;
        }
      }
    }

    return labels.join(' > ');
  };

  const selectedLabels = value.map(path => getLabelFromPath(path));

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
        <PopoverContent className="w-96 p-4 bg-white" align="start">
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

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {Object.entries(PARTENAIRE_TYPES_HIERARCHY).map(([mainKey, mainConfig]) => {
                const mainPath = mainKey;
                const isMainExpanded = expanded[mainPath];
                const hasChildren = mainConfig.children && Object.keys(mainConfig.children).length > 0;

                return (
                  <div key={mainKey} className="space-y-2">
                    <div className="flex items-center gap-2">
                      {hasChildren && (
                        <button
                          type="button"
                          onClick={() => toggleExpand(mainPath)}
                          className="p-0.5 hover:bg-slate-100 rounded"
                        >
                          {isMainExpanded ? (
                            <ChevronDown className="w-4 h-4 text-slate-500" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-500" />
                          )}
                        </button>
                      )}
                      {!hasChildren && <div className="w-5" />}
                      <Checkbox
                        id={`filter-${mainKey}`}
                        checked={isSelected(mainPath)}
                        onCheckedChange={() => toggleSelection(mainPath)}
                      />
                      <Label
                        htmlFor={`filter-${mainKey}`}
                        className="font-semibold text-sm cursor-pointer"
                      >
                        {mainConfig.label}
                      </Label>
                    </div>

                    {hasChildren && isMainExpanded && (
                      <div className="ml-8 space-y-2">
                        {Object.entries(mainConfig.children).map(([subKey, subConfig]) => {
                          const subPath = `${mainKey}.${subKey}`;
                          const isSubExpanded = expanded[subPath];
                          const hasSubChildren = subConfig.children && Object.keys(subConfig.children).length > 0;

                          return (
                            <div key={subKey} className="space-y-2">
                              <div className="flex items-center gap-2">
                                {hasSubChildren && (
                                  <button
                                    type="button"
                                    onClick={() => toggleExpand(subPath)}
                                    className="p-0.5 hover:bg-slate-100 rounded"
                                  >
                                    {isSubExpanded ? (
                                      <ChevronDown className="w-4 h-4 text-slate-500" />
                                    ) : (
                                      <ChevronRight className="w-4 h-4 text-slate-500" />
                                    )}
                                  </button>
                                )}
                                {!hasSubChildren && <div className="w-5" />}
                                <Checkbox
                                  id={`filter-${subPath}`}
                                  checked={isSelected(subPath)}
                                  onCheckedChange={() => toggleSelection(subPath)}
                                />
                                <Label
                                  htmlFor={`filter-${subPath}`}
                                  className="text-sm cursor-pointer"
                                >
                                  {subConfig.label}
                                </Label>
                              </div>

                              {hasSubChildren && isSubExpanded && (
                                <div className="ml-8 space-y-2">
                                  {Object.entries(subConfig.children).map(([subSubKey, subSubConfig]) => {
                                    const subSubPath = `${mainKey}.${subKey}.${subSubKey}`;

                                    return (
                                      <div key={subSubKey} className="flex items-center gap-2">
                                        <div className="w-5" />
                                        <Checkbox
                                          id={`filter-${subSubPath}`}
                                          checked={isSelected(subSubPath)}
                                          onCheckedChange={() => toggleSelection(subSubPath)}
                                        />
                                        <Label
                                          htmlFor={`filter-${subSubPath}`}
                                          className="text-sm cursor-pointer"
                                        >
                                          {subSubConfig.label}
                                        </Label>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
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
              <span className="text-xs">{label}</span>
              <button
                onClick={() => toggleSelection(value[index])}
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
