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

// bounceAnimation.ts
// animations.ts (or wherever the animation constants are defined)

// Adjust the initial rotation
export const CounterRoundInitial: Variant = {
    scale: 1,
    rotate: 0, // Initial rotation at 0 degrees
  };
  
  // Adjust the rotation animation to keep adding rotation
  export const CounterRoundAnimation: TargetAndTransition = {
    rotate: 0, // Start at 0, will dynamically update via the component state
  };
  
  // Adjust the transition for smoother continuous rotation
  export const CounterRoundTransition: Transition = {
    delay: 0, // Delay before starting the rotation
    duration: 0.1, // Duration of each complete rotation (from 0 -> 360 degrees)
    repeat: 0, // No need for repeat, as we want to animate continuously
    repeatDelay: 0, // No delay between repeats
    type: "spring", // Spring animation for smooth transitions
    stiffness: 200, // Spring stiffness
    damping: 40, // Damping to control the bounciness
  };
  