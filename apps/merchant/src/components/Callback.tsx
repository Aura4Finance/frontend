import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { useExchangeCodeForToken } from '../hooks/mutations/exahngeCodeForToken';

const Callback = () => {
  const [, setLocation] = useLocation();
  const queryParms = new URLSearchParams(window.location.search);
  const code = queryParms.get('code');
  const exchangeCodeForTokenMutation = useExchangeCodeForToken();
  const hasMutated = useRef(false);

  useEffect(() => {
    if (!code) {
      setLocation('/not-found', { replace: true });
      return;
    }

    if (!hasMutated.current) {
      hasMutated.current = true; 
      exchangeCodeForTokenMutation.mutate(code as string);
    }
  }, [code, setLocation, exchangeCodeForTokenMutation]);

  if (exchangeCodeForTokenMutation.isPending) {
    return (
      <div className="flex items-center justify-center h-screen w-screen">
        <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full" />
      </div>
    );
  }

  return null;
};

export default Callback;
