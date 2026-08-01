'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useAuthStore } from '@/lib/auth';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Link } from '@/i18n/navigation';
import api from '@/lib/api';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || t('loginError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-[#181818] p-8 rounded-xl border border-white/5 shadow-2xl">
        <h1 className="text-3xl font-bold text-white text-center mb-8">{t('loginTitle')}</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="email"
            required
            placeholder={t('email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#0f0f0f] border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-white/20 focus:border-white outline-none transition"
          />
          <input
            type="password"
            required
            placeholder={t('password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#0f0f0f] border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-white/20 focus:border-white outline-none transition"
          />

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
            {t('signIn')}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          {t('noAccount')}{' '}
          <Link href="/register" className="text-purple-400 hover:text-purple-300 underline underline-offset-4">
            {t('signUp')}
          </Link>
        </p>
      </div>
    </div>
  );
}