// app/components/SubjectCardSkeleton.js
"use client";

import { motion } from "framer-motion";

export function SubjectCardSkeleton() {
  return (
    <div className="bg-gradient-to-br from-indigo-950 to-slate-900 p-6 rounded-2xl shadow-lg backdrop-blur-md bg-opacity-60">
      <motion.div
        className="animate-pulse flex justify-between items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="space-y-3">
          <div className="h-6 w-32 bg-gray-700 rounded"></div>
          <div className="h-4 w-24 bg-gray-700 rounded"></div>
        </div>
        <div className="h-10 w-28 bg-gray-700 rounded-lg"></div>
      </motion.div>
    </div>
  );
}