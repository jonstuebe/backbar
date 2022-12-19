import { useCallback, useRef } from "react";
import Confetti from "react-native-confetti";

export const useConfetti = () => {
  const confettiRef = useRef<Confetti>(null);
  const startConfetti = useCallback(() => {
    confettiRef?.current?.startConfetti();
  }, []);

  const stopConfetti = useCallback(() => {
    confettiRef?.current?.stopConfetti();
  }, []);

  return {
    confettiRef,
    startConfetti,
    stopConfetti,
  };
};
