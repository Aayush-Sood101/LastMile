'use client';

import { motion } from 'framer-motion';

export default function PageHeader({ title, subtitle, actions = null }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between"
    >
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
        {subtitle && <p className="text-gray-600">{subtitle}</p>}
      </div>
      
      {actions && (
        <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
          {actions}
        </div>
      )}
    </motion.div>
  );
}
