import React, { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronRight } from "lucide-react";
import { PARTENAIRE_TYPES_HIERARCHY } from "@/utils/partenaireTypes";

export default function PartenaireTypeSelector({ value = {}, onChange }) {
  const [expanded, setExpanded] = useState({});

  const toggleExpand = (path) => {
    setExpanded(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const isMainCategorySelected = (mainKey) => {
    return value[mainKey] !== undefined;
  };

  const isSubCategorySelected = (mainKey, subKey) => {
    return value[mainKey]?.[subKey] !== undefined;
  };

  const isSubSubCategorySelected = (mainKey, subKey, subSubKey) => {
    return Array.isArray(value[mainKey]?.[subKey]) && value[mainKey][subKey].includes(subSubKey);
  };

  const toggleMainCategory = (mainKey) => {
    const newValue = { ...value };
    if (newValue[mainKey] !== undefined) {
      delete newValue[mainKey];
    } else {
      newValue[mainKey] = {};
    }
    onChange(newValue);
  };

  const toggleSubCategory = (mainKey, subKey) => {
    const newValue = { ...value };
    if (!newValue[mainKey]) {
      newValue[mainKey] = {};
    }

    if (newValue[mainKey][subKey] !== undefined) {
      delete newValue[mainKey][subKey];
      if (Object.keys(newValue[mainKey]).length === 0) {
        delete newValue[mainKey];
      }
    } else {
      newValue[mainKey][subKey] = [];
    }
    onChange(newValue);
  };

  const toggleSubSubCategory = (mainKey, subKey, subSubKey) => {
    const newValue = { ...value };
    if (!newValue[mainKey]) {
      newValue[mainKey] = {};
    }
    if (!Array.isArray(newValue[mainKey][subKey])) {
      newValue[mainKey][subKey] = [];
    }

    const subSubArray = newValue[mainKey][subKey];
    const index = subSubArray.indexOf(subSubKey);

    if (index > -1) {
      subSubArray.splice(index, 1);
      if (subSubArray.length === 0) {
        delete newValue[mainKey][subKey];
        if (Object.keys(newValue[mainKey]).length === 0) {
          delete newValue[mainKey];
        }
      }
    } else {
      subSubArray.push(subSubKey);
    }

    onChange(newValue);
  };

  return (
    <div className="space-y-3 max-h-[500px] overflow-y-auto border border-slate-200 rounded-lg p-4">
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
                id={mainKey}
                checked={isMainCategorySelected(mainKey)}
                onCheckedChange={() => toggleMainCategory(mainKey)}
              />
              <Label
                htmlFor={mainKey}
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
                          id={subPath}
                          checked={isSubCategorySelected(mainKey, subKey)}
                          onCheckedChange={() => toggleSubCategory(mainKey, subKey)}
                          disabled={!isMainCategorySelected(mainKey)}
                        />
                        <Label
                          htmlFor={subPath}
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
                                  id={subSubPath}
                                  checked={isSubSubCategorySelected(mainKey, subKey, subSubKey)}
                                  onCheckedChange={() => toggleSubSubCategory(mainKey, subKey, subSubKey)}
                                  disabled={!isSubCategorySelected(mainKey, subKey)}
                                />
                                <Label
                                  htmlFor={subSubPath}
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
  );
}
