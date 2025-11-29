'use client';

import { useState } from 'react';
import { useSupabaseSession } from '@/hooks/useSupabaseSession';
import { useRouter } from 'next/navigation';
import { Loader2, Mail, CheckCircle2, AlertCircle, Send } from 'lucide-react';

export default function TestEmailPage() {
  const { session, loading } = useSupabaseSession();
  const router = useRouter();
  const [testEmail, setTestEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message?: string; error?: string; emailId?: string } | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-orange-500 w-8 h-8" />
      </div>
    );
  }

  if (!session || session.user?.role !== 'admin') {
    router.push('/auth?error=AccessDenied');
    return null;
  }

  const handleTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setResult(null);

    try {
      const res = await fetch('/api/admin/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: testEmail }),
      });

      const data = await res.json();
      setResult(data);
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message || 'Erreur lors de l\'envoi',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-6">
            <Mail className="w-8 h-8 text-[#ff751f]" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Test d'envoi d'email</h1>
              <p className="text-sm text-gray-600">Vérifier que Resend fonctionne correctement</p>
            </div>
          </div>

          <form onSubmit={handleTest} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email de destination
              </label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="votre-email@example.com"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#ff751f] outline-none"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                L'email de test sera envoyé à cette adresse
              </p>
            </div>

            <button
              type="submit"
              disabled={isSending || !testEmail}
              className="w-full bg-gradient-to-r from-[#ff751f] to-[#ff1fa9] hover:from-[#ff751f]/80 hover:to-[#ff1fa9]/80 text-white font-semibold rounded-lg px-6 py-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSending ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Envoi en cours...</span>
                </>
              ) : (
                <>
                  <Send size={20} />
                  <span>Envoyer l'email de test</span>
                </>
              )}
            </button>
          </form>

          {result && (
            <div
              className={`mt-6 p-4 rounded-lg border ${
                result.success
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-start gap-3">
                {result.success ? (
                  <CheckCircle2 className="text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <h3
                    className={`font-semibold mb-2 ${
                      result.success ? 'text-green-800' : 'text-red-800'
                    }`}
                  >
                    {result.success ? '✅ Email envoyé avec succès !' : '❌ Erreur'}
                  </h3>
                  {result.message && (
                    <p className={`text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                      {result.message}
                    </p>
                  )}
                  {result.error && (
                    <p className="text-sm text-red-700 mt-2">{result.error}</p>
                  )}
                  {result.emailId && (
                    <p className="text-xs text-gray-600 mt-2">
                      ID de l'email: {result.emailId}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Instructions :</h3>
            <ul className="text-xs text-gray-600 space-y-2">
              <li>• Entrez votre adresse email dans le champ ci-dessus</li>
              <li>• Cliquez sur "Envoyer l'email de test"</li>
              <li>• Vérifiez votre boîte de réception (et les spams)</li>
              <li>• Si l'email arrive, Resend est correctement configuré ✅</li>
            </ul>
            <p className="text-xs text-gray-500 mt-3">
              <strong>Note:</strong> Les variables d'environnement (RESEND_API_KEY, RESEND_FROM_EMAIL) sont vérifiées côté serveur uniquement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

