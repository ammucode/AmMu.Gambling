import { useCallback, useState } from 'react';

export default function useToggle(initialState: boolean) {
  const [state, setState] = useState(initialState);
  const toggleState = useCallback(() => {
    setState((s) => !s);
  }, []);
  // useEffect(() => {
  //   setState(initialState);
  // }, [initialState]);
  return [state, toggleState] as const;
}
