import { useEffect, useState } from "react";

export function AuthDebug() {
  const [authInfo, setAuthInfo] = useState<any>({});

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const info = {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'No token',
      localStorage: Object.keys(localStorage),
    };
    setAuthInfo(info);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono max-w-sm z-50">
      <h4 className="font-bold mb-2">Auth Debug Info:</h4>
      <div>Has Token: {authInfo.hasToken ? '✅' : '❌'}</div>
      <div>Token Length: {authInfo.tokenLength}</div>
      <div>Token Preview: {authInfo.tokenPreview}</div>
      <div>LocalStorage Keys: {authInfo.localStorage?.join(', ')}</div>
    </div>
  );
}