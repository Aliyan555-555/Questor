import { TargetAndTransition, Transition, Variant } from "framer-motion";
export const bounceScaleAnimation = {
  scale: 1,
};

export const bounceTransition = {
  type: "spring",
  stiffness: 300,
  damping: 10,
  duration: 0.5,
  delay: 0.4,
};

export const bounceInitialScale = {
  scale: 2,
};

export const CounterRoundInitial: Variant = {
    scale: 1,
    rotate: 0,
  };
  
  export const CounterRoundAnimation: TargetAndTransition = {
    rotate: 0, 
  };
  
  export const CounterRoundTransition: Transition = {
    delay: 0,
    duration: 0.1,
    repeat: 0,
    repeatDelay: 0,
    type: "spring",
    stiffness: 200,
    damping: 40,
  };
  