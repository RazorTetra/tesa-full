// app/components/LoadingIdicator.js
"use client";

import { motion } from "framer-motion";

export default function LoadingIndicator() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-indigo-950">
      <div className="space-y-6 text-center">
        <motion.div
          className="flex space-x-2 justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="w-4 h-4 bg-blue-500 rounded-full"
              animate={{
                y: ["0%", "-50%", "0%"],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                repeatType: "reverse",
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-white text-lg"
        >
          Memuat data...
        </motion.div>

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "200px" }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
          className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto"
        />
      </div>
    </div>
  );
}