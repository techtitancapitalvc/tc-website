"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

// useLayoutEffect warns during SSR; fall back to useEffect on the server.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

type Options = {
  /** Fixed width the content is designed at (px). */
  designWidth: number;
  /** Vertical space taken by fixed chrome above the frame, e.g. navbar (px). */
  reservedHeight?: number;
  /** Never scale below this. Keeps content legible on very short screens. */
  minScale?: number;
  /**
   * Never scale above this. Stops the frame ballooning on huge / ultrawide
   * screens — the content caps at this size and extra width becomes side
   * padding. Set it to your reference screen's scale (designWidth / refWidth).
   */
  maxScale?: number;
};

/**
 * Fits a fixed-size "design frame" into the current viewport by computing a
 * single uniform scale factor: min(availableWidth / frameWidth, availableHeight / frameHeight).
 *
 * The frame is laid out once at `designWidth` (fixed px) and everything inside
 * it scales together via `transform: scale()`, so proportions are identical on
 * every device and the frame always fits one screen — both horizontally AND
 * vertically. The natural height is measured live, so font loading / content
 * changes are handled automatically.
 */
export function useScaleToFit<T extends HTMLElement = HTMLDivElement>({
  designWidth,
  reservedHeight = 0,
  minScale = 0.5,
  maxScale = 1.35,
}: Options) {
  const frameRef = useRef<T>(null);
  const [scale, setScale] = useState(1);
  const [ready, setReady] = useState(false);

  const compute = useCallback(() => {
    const frame = frameRef.current;
    if (!frame) return;

    // offsetHeight is the UNSCALED layout height — transforms don't affect it,
    // so reading it here never feeds back into the ResizeObserver.
    const frameHeight = frame.offsetHeight;
    if (frameHeight === 0) return;

    const availableWidth = window.innerWidth;
    const availableHeight = window.innerHeight - reservedHeight;

    const next = Math.min(
      availableWidth / designWidth,
      availableHeight / frameHeight,
      maxScale,
    );

    setScale(Math.max(next, minScale));
    setReady(true);
  }, [designWidth, reservedHeight, minScale, maxScale]);

  useIsomorphicLayoutEffect(() => {
    compute();

    const frame = frameRef.current;
    // Catches reflow when web fonts load or content changes height.
    const ro = frame ? new ResizeObserver(compute) : null;
    if (frame) ro?.observe(frame);

    window.addEventListener("resize", compute);
    // Some browsers report fonts ready after first paint; re-measure then.
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(compute).catch(() => {});
    }

    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", compute);
    };
  }, [compute]);

  return { frameRef, scale, ready };
}
