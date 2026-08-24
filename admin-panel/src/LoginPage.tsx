import { useState } from 'react';
import type { FormEvent } from 'react';
import { login } from './api';
import type { AdminUser } from './types';

interface Props {
  onLogin: (user: AdminUser) => void;
}

function LoginPage({ onLogin }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await login(email, password);
      onLogin(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Giriş başarısız');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="login-icon" aria-hidden="true">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2 2 7v2h20V7L12 2Z M4 10v9H2v2h20v-2h-2v-9h-2v9h-3v-9h-2v9H9v-9H7v9H4v-9Z"
              fill="currentColor"
            />
          </svg>
        </div>
        <h1>Kapaklı Belediyesi Yönetim Paneli</h1>
        <p className="login-subtitle">Devam etmek için giriş yapın</p>
        <label>
          E-posta
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Şifre
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
