import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <GraduationCap className="h-8 w-8 text-primary-foreground" />
        </motion.div>
        <h2 className="text-xl font-semibold mb-2">Atlas Mind</h2>
        <p className="text-muted-foreground">Loading your learning experience...</p>
      </motion.div>
    </div>
  );
}