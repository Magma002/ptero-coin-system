import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

export function AnimatedCounter({ value }: { value: number }) {
  const [hasMounted, setHasMounted] = useState(false);
  const spring = useSpring(value, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) => Math.round(current).toLocaleString());

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <span>{value.toLocaleString()}</span>;
  }

  return <motion.span>{display}</motion.span>;
}
