import React, { useState } from 'react';
import {
  UserProfile,
  apiCheckEmailVerified,
  apiGoogleSignIn,
  apiLogin,
  apiLogout,
  apiResendVerificationEmail,
  apiResetPassword,
  apiSignup,
} from '../utils/apiService';

export type AuthScreenMode = 'login' | 'signup' | 'verify' | 'reset';

interface AuthViewsProps {
  mode: AuthScreenMode;
  pendingUser: UserProfile | null;
  onSwitchMode: (mode: AuthScreenMode, user?: UserProfile | null) => void;
  onAuthenticated: (user: UserProfile) => void;
}

export const AuthViews: React.FC<AuthViewsProps> = ({
  mode,
  pendingUser,
  onSwitchMode,
  onAuthenticated,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    setInfo('');
    try {
      const user = await apiGoogleSignIn();
      onAuthenticated(user);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Google sign-in failed.';
      if (msg) setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('please enter your email and password.');
      return;
    }
    setLoading(true);
    setError('');
    setInfo('');
    try {
      const res = await apiLogin(email.trim(), password);
      if (res.needsVerification) {
        onSwitchMode('verify', res.user);
      } else {
        onAuthenticated(res.user);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('please enter your name.');
      return;
    }
    if (!email.trim()) {
      setError("that email address doesn't look valid.");
      return;
    }
    if (password.length < 8) {
      setError('password is too weak — use at least 8 characters.');
      return;
    }
    setLoading(true);
    setError('');
    setInfo('');
    try {
      const res = await apiSignup(name.trim(), email.trim(), password);
      if (res.verificationMessage) {
        setInfo(res.verificationMessage);
      }
      if (res.needsVerification) {
        onSwitchMode('verify', res.user);
      } else {
        onAuthenticated(res.user);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'signup failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyContinue = async () => {
    setLoading(true);
    setError('');
    setInfo('');
    try {
      const verifiedUser = await apiCheckEmailVerified();
      if (verifiedUser) {
        onAuthenticated(verifiedUser);
      } else {
        setError('not verified yet — open the link in the email first.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'verification check failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setError('');
    setInfo('');
    try {
      await apiResendVerificationEmail();
      setInfo('a new verification email is on its way.');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'could not resend verification email.'
      );
    }
  };

  const handleCancelVerification = async () => {
    setError('');
    setInfo('');
    await apiLogout();
    onSwitchMode('login', null);
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('please enter your email address.');
      return;
    }
    setLoading(true);
    setError('');
    setInfo('');
    try {
      const res = await apiResetPassword(email.trim());
      setInfo(res.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'reset failed.');
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'verify') {
    const targetEmail = pendingUser?.email || email || 'your email';
    return (
      <div className="max-w-lg">
        <h1 className="font-mono text-2xl font-bold text-[#e6edf3] mb-1.5">
          verify your email<span className="terminal-cursor" />
        </h1>
        <p className="text-sm text-[#8b96a3] mb-6 leading-relaxed">
          We sent a verification link to <span className="font-mono text-[#e6edf3]">{targetEmail}</span>. Open it, then come back and press continue. Check spam if it doesn&apos;t show up.
        </p>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleVerifyContinue}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-[#00d9a0] hover:bg-[#00e6aa] text-[#04140f] font-mono font-bold text-xs px-5 py-2.5 rounded-lg cursor-pointer transition-all disabled:opacity-50 whitespace-nowrap"
          >
            {loading ? 'checking...' : "i've verified — continue →"}
          </button>

          {pendingUser && (
            <button
              type="button"
              onClick={() => onAuthenticated(pendingUser)}
              className="bg-transparent hover:border-[#8b96a3] border border-[#232b35] text-[#8b96a3] hover:text-[#e6edf3] font-mono text-xs px-4 py-2.5 rounded-lg cursor-pointer transition-colors whitespace-nowrap"
            >
              continue to practice →
            </button>
          )}
        </div>

        {error && <div className="font-mono text-xs text-[#ff6b6b] mt-3">{error}</div>}
        {info && <div className="font-mono text-xs text-[#00d9a0] mt-3">{info}</div>}

        <div className="pt-4 text-xs text-[#8b96a3] flex items-center gap-2 flex-wrap">
          <span>didn&apos;t get it?</span>
          <button
            type="button"
            onClick={handleResendVerification}
            className="text-[#00d9a0] hover:underline cursor-pointer font-mono"
          >
            resend email
          </button>
          <span aria-hidden="true">·</span>
          <button
            type="button"
            onClick={handleCancelVerification}
            className="text-[#00d9a0] hover:underline cursor-pointer font-mono"
          >
            use a different account
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'reset') {
    return (
      <div className="max-w-lg">
        <h1 className="font-mono text-2xl font-bold text-[#e6edf3] mb-1.5">
          reset password<span className="terminal-cursor" />
        </h1>
        <p className="text-sm text-[#8b96a3] mb-6 leading-relaxed">
          Enter your email and we&apos;ll send you a link to choose a new password.
        </p>

        <form onSubmit={handleResetSubmit} className="space-y-4">
          <div>
            <label htmlFor="rs-email" className="block font-mono text-xs text-[#8b96a3] mb-1.5">
              email
            </label>
            <input
              id="rs-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@college.edu"
              autoComplete="email"
              required
              className="w-full bg-[#161d26] border border-[#232b35] focus:border-[#00d9a0] rounded-lg px-3.5 py-2.5 font-mono text-sm text-[#e6edf3] outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 bg-[#00d9a0] hover:bg-[#00e6aa] text-[#04140f] font-mono font-bold text-xs px-5 py-2.5 rounded-lg cursor-pointer transition-all disabled:opacity-50 whitespace-nowrap"
          >
            {loading ? 'sending...' : 'send reset link →'}
          </button>

          {error && <div className="font-mono text-xs text-[#ff6b6b]">{error}</div>}
          {info && <div className="font-mono text-xs text-[#00d9a0]">{info}</div>}

          <div className="pt-2 text-xs text-[#8b96a3]">
            <button
              type="button"
              onClick={() => {
                setError('');
                setInfo('');
                onSwitchMode('login');
              }}
              className="text-[#00d9a0] hover:underline cursor-pointer font-mono"
            >
              ← back to login
            </button>
          </div>
        </form>
      </div>
    );
  }

  const isSignup = mode === 'signup';

  return (
    <div className="max-w-lg">
      <h1 className="font-mono text-2xl font-bold text-[#e6edf3] mb-1.5">
        {isSignup ? 'create account' : 'login'}
        <span className="terminal-cursor" />
      </h1>
      <p className="text-sm text-[#8b96a3] mb-6 leading-relaxed">
        {isSignup
          ? "We'll email you a link to confirm your address. The leaderboard shows your name and scores only — never your email."
          : 'Sign in to practice Python, Java, C, C++, HTML, CRT aptitude, GK, NEET, and JEE Mains — then see where you rank.'}
      </p>

      <div className="mb-4">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2.5 bg-[#161d26] hover:bg-[#1b2430] border border-[#232b35] hover:border-[#364252] text-[#e6edf3] font-mono font-semibold text-xs py-2.5 px-4 rounded-lg cursor-pointer transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
            <path
              fill="#EA4335"
              d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"
            />
            <path
              fill="#4285F4"
              d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z"
            />
            <path
              fill="#FBBC05"
              d="M10.5 28.7c-.5-1.5-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.5 0 20.1 0 24s.9 7.5 2.6 10.8l7.9-6.1z"
            />
            <path
              fill="#34A853"
              d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.8 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"
            />
          </svg>
          <span>{loading ? 'signing in...' : 'continue with google'}</span>
        </button>

        <div className="flex items-center gap-3 my-4 font-mono text-[11px] text-[#8b96a3]">
          <span className="flex-1 h-px bg-[#232b35]" />
          <span>or use email</span>
          <span className="flex-1 h-px bg-[#232b35]" />
        </div>
      </div>

      <form onSubmit={isSignup ? handleSignupSubmit : handleLoginSubmit} className="space-y-3.5">
        {isSignup && (
          <div>
            <label htmlFor="su-name" className="block font-mono text-xs text-[#8b96a3] mb-1.5">
              full name
            </label>
            <input
              id="su-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              maxLength={40}
              autoComplete="name"
              required
              className="w-full bg-[#161d26] border border-[#232b35] focus:border-[#00d9a0] rounded-lg px-3.5 py-2.5 font-mono text-sm text-[#e6edf3] outline-none transition-colors"
            />
          </div>
        )}

        <div>
          <label htmlFor="auth-email" className="block font-mono text-xs text-[#8b96a3] mb-1.5">
            email
          </label>
          <input
            id="auth-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@college.edu"
            autoComplete="email"
            required
            className="w-full bg-[#161d26] border border-[#232b35] focus:border-[#00d9a0] rounded-lg px-3.5 py-2.5 font-mono text-sm text-[#e6edf3] outline-none transition-colors"
          />
        </div>

        <div>
          <label htmlFor="auth-pass" className="block font-mono text-xs text-[#8b96a3] mb-1.5">
            password
          </label>
          <input
            id="auth-pass"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isSignup ? 'min 8 characters' : '••••••••'}
            minLength={isSignup ? 8 : undefined}
            autoComplete={isSignup ? 'new-password' : 'current-password'}
            required
            className="w-full bg-[#161d26] border border-[#232b35] focus:border-[#00d9a0] rounded-lg px-3.5 py-2.5 font-mono text-sm text-[#e6edf3] outline-none transition-colors"
          />
        </div>

        <div className="pt-1">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 bg-[#00d9a0] hover:bg-[#00e6aa] text-[#04140f] font-mono font-bold text-xs px-5 py-2.5 rounded-lg cursor-pointer transition-all disabled:opacity-50 whitespace-nowrap"
          >
            {loading
              ? isSignup
                ? 'creating...'
                : 'checking...'
              : isSignup
                ? 'create account →'
                : 'log in →'}
          </button>
        </div>

        {error && <div className="font-mono text-xs text-[#ff6b6b] pt-1">{error}</div>}
        {info && <div className="font-mono text-xs text-[#00d9a0] pt-1">{info}</div>}

        <div className="pt-2 text-xs text-[#8b96a3] flex items-center gap-2 flex-wrap">
          {isSignup ? (
            <>
              <span>already registered?</span>
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setInfo('');
                  onSwitchMode('login');
                }}
                className="text-[#00d9a0] hover:underline cursor-pointer font-mono"
              >
                log in
              </button>
            </>
          ) : (
            <>
              <span>new here?</span>
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setInfo('');
                  onSwitchMode('signup');
                }}
                className="text-[#00d9a0] hover:underline cursor-pointer font-mono"
              >
                create an account
              </button>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setInfo('');
                  onSwitchMode('reset');
                }}
                className="text-[#00d9a0] hover:underline cursor-pointer font-mono"
              >
                forgot password?
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};
