import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

const colorSchemes = {
  blue: {
    bg: "from-blue-500 to-blue-600",
    light: "bg-blue-50",
    text: "text-blue-600",
  },
  green: {
    bg: "from-emerald-500 to-emerald-600",
    light: "bg-emerald-50",
    text: "text-emerald-600",
  },
  purple: {
    bg: "from-purple-500 to-purple-600",
    light: "bg-purple-50",
    text: "text-purple-600",
  },
  orange: {
    bg: "from-orange-500 to-orange-600",
    light: "bg-orange-50",
    text: "text-orange-600",
  },
};

export default function StatsCardCRM({ title, value, icon: Icon, color, subtitle }) {
  const scheme = colorSchemes[color] || colorSchemes.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden bg-white">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
              <h3 className="text-3xl font-bold text-[#1E40AF]">{value}</h3>
            </div>
            <div className={`p-3 rounded-xl ${scheme.light}`}>
              <Icon className={`w-6 h-6 ${scheme.text}`} />
            </div>
          </div>
          {subtitle && (
            <p className="text-sm text-slate-500">{subtitle}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}