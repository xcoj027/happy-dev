/** HappyDev - Offline Developer Utilities Suite
 * @author TNQSW
 * @license MIT (with Trademark Retention Notice)
 * Copyright (c) 2026 TNQSW. Retain TNQ trademark, author credits and notices.
 */
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

interface AnimatedCollapseProps {
  expanded: boolean;
  children: React.ReactNode;
  id?: string;
  keepMounted?: boolean;
  disableAnimation?: boolean;
}

// Animate between measured pixel heights; no grid-track or height:auto interpolation.
export const AnimatedCollapse: React.FC<AnimatedCollapseProps> = ({ expanded, children, id, keepMounted = false, disableAnimation = false }) => {
  const [mounted, setMounted] = useState(expanded);
  const [height, setHeight] = useState(0);
  const content = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (expanded) setMounted(true);
  }, [expanded]);
  useLayoutEffect(() => {
    if (!mounted || !content.current) return;
    const element = content.current;
    const measure = () => setHeight(element.getBoundingClientRect().height);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [mounted]);
  useEffect(() => {
    if (expanded || keepMounted || !mounted) return;
    // Fallback for reduced motion and hosts that do not dispatch transitionend.
    const timer = setTimeout(() => setMounted(false), disableAnimation ? 0 : 260);
    return () => clearTimeout(timer);
  }, [expanded, keepMounted, mounted, disableAnimation]);

  return (
    <div id={id} aria-hidden={!expanded} inert={!expanded} data-collapse-state={expanded ? 'expanded' : 'collapsed'}
      style={{ height: expanded ? height : 0 }}
      className={`overflow-hidden shrink-0 ${disableAnimation ? '' : 'transition-[height] duration-250 ease-in-out motion-reduce:transition-none'}`}
      onTransitionEnd={event => {
        if (event.target === event.currentTarget && event.propertyName === 'height' && !expanded && !keepMounted) setMounted(false);
      }}>
      {mounted && <div ref={content} className="flow-root min-w-0">{children}</div>}
    </div>
  );
};
