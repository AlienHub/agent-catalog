import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

/** Project-owned button: native form, keyboard, disabled and focus semantics. */
export function ActionButton({ children, disabled, type = 'button', ...attributes }) {
  const reduceMotion = useReducedMotion();
  const feedbackEnabled = !reduceMotion && !disabled;
  return (
    <motion.button
      {...attributes}
      type={type}
      disabled={disabled}
      whileHover={feedbackEnabled ? { scale: 1.01 } : undefined}
      whileTap={feedbackEnabled ? { scale: 0.98 } : undefined}
      transition={{ duration: reduceMotion ? 0 : 0.12, ease: 'easeOut' }}
    >
      {children}
    </motion.button>
  );
}
