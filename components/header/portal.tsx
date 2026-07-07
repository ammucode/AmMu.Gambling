import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function HeaderPortal({ children }: React.PropsWithChildren) {
  const [target, setTarget] = useState<HTMLElement|null>(null);

  useEffect(() => {
    let attempts = 0;
    
    const findElement = () => {
      const element = document.getElementById("dynamic-header");
      if (element) {
        setTarget(element);
      } else if (attempts < 5) {
        attempts++;
        setTimeout(findElement, 50); // Retry every 50ms for a split second
      }
    };

    findElement();

    // Cleanup reference when navigating away from this specific page instance
    return () => setTarget(null);
  }, []);

  console.log(target, children);

  // Return children into the portal only after mounting to the DOM target
  return target ? createPortal(children, target) : null;
}