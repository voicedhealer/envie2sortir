"use client";

import { useEffect, useState } from "react";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { useRouter } from "next/navigation";

export default function TestMetricsPage() {
  const { session, loading } = useSupabaseSession();
  const router = useRouter();
  const [testResults, setTestResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (loading) return;
    
    if (!session || session.user?.role !== 'admin') {
      router.push('/auth?error=AccessDenied');
      return;
    }
  }, [session, loading, router]);

  const runTest = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/test-metrics");
      const data = await response.json();
      setTestResults(data);
    } catch (error) {
      console.error("Erreur lors du test:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || !session || session.user?.role !== 'admin') {
    return <div className="p-8">Chargement...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Test des Métriques</h1>
      
      <button
        onClick={runTest}
        disabled={isLoading}
        className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? "Test en cours..." : "Lancer le test"}
      </button>

      {testResults && (
        <div className="space-y-6">
          {/* Cloudflare */}
          <div className={`p-6 rounded-lg border ${
            testResults.results.cloudflare.configured 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <h2 className="text-xl font-semibold mb-4">☁️ Cloudflare</h2>
            {testResults.results.cloudflare.configured ? (
              <div>
                <p className="text-green-600 font-semibold">✅ Configuration correcte</p>
                <pre className="mt-4 p-4 bg-white rounded text-sm overflow-auto">
                  {JSON.stringify(testResults.results.cloudflare.data, null, 2)}
                </pre>
              </div>
            ) : (
              <div>
                <p className="text-red-600 font-semibold">❌ Erreur</p>
                <p className="mt-2 text-red-700">{testResults.results.cloudflare.error}</p>
              </div>
            )}
          </div>

          {/* Railway */}
          <div className={`p-6 rounded-lg border ${
            testResults.results.railway.configured 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <h2 className="text-xl font-semibold mb-4">🚂 Railway</h2>
            {testResults.results.railway.configured ? (
              <div>
                <p className="text-green-600 font-semibold">✅ Configuration correcte</p>
                <pre className="mt-4 p-4 bg-white rounded text-sm overflow-auto">
                  {JSON.stringify(testResults.results.railway.data, null, 2)}
                </pre>
              </div>
            ) : (
              <div>
                <p className="text-red-600 font-semibold">❌ Erreur</p>
                <p className="mt-2 text-red-700">{testResults.results.railway.error}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}




