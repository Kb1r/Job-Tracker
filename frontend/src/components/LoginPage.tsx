import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { loginUser, registerUser } from '../api/auth';
import { ApiValidationError } from '../api/jobs';

type Mode = 'login' | 'register';

export default function LoginPage() {
  const { login } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, [mode]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFieldErrors({});
    setSubmitError(null);
    setSubmitting(true);

    try {
      const { token, firstName: returnedName } = mode === 'login'
        ? await loginUser(email, password)
        : await registerUser(email, password, firstName);
      login(token, returnedName);
    } catch (err) {
      if (err instanceof ApiValidationError) {
        setFieldErrors(err.fieldErrors);
        if (Object.keys(err.fieldErrors).length === 0) {
          setSubmitError(err.message);
        }
      } else {
        setSubmitError('Network error. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setEmail('');
    setPassword('');
    setFirstName('');
    setFieldErrors({});
    setSubmitError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 font-sans">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">Job Tracker</h1>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-2">Your pipeline, your data</p>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <div className="flex bg-gray-50 rounded-2xl p-1 mb-8">
            {(['login', 'register'] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  mode === m
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={(e) => { void handleSubmit(e); }} noValidate>
            <div className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)}
                    autoComplete="given-name"
                    className={`w-full px-4 py-3 rounded-2xl border text-sm font-medium outline-none transition-all ${
                      fieldErrors.first_name
                        ? 'border-red-300 bg-red-50 focus:border-red-400'
                        : 'border-gray-200 bg-gray-50 focus:border-blue-400 focus:bg-white'
                    }`}
                  />
                  {fieldErrors.first_name && (
                    <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-red-500">{fieldErrors.first_name}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5">
                  Email
                </label>
                <input
                  ref={emailRef}
                  type="email"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  className={`w-full px-4 py-3 rounded-2xl border text-sm font-medium outline-none transition-all ${
                    fieldErrors.email
                      ? 'border-red-300 bg-red-50 focus:border-red-400'
                      : 'border-gray-200 bg-gray-50 focus:border-blue-400 focus:bg-white'
                  }`}
                />
                {fieldErrors.email && (
                  <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-red-500">{fieldErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5">
                  Password
                  {mode === 'register' && (
                    <span className="ml-1 text-gray-400 normal-case font-medium tracking-normal">(min. 8 characters)</span>
                  )}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  required
                  className={`w-full px-4 py-3 rounded-2xl border text-sm font-medium outline-none transition-all ${
                    fieldErrors.password
                      ? 'border-red-300 bg-red-50 focus:border-red-400'
                      : 'border-gray-200 bg-gray-50 focus:border-blue-400 focus:bg-white'
                  }`}
                />
                {fieldErrors.password && (
                  <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-red-500">{fieldErrors.password}</p>
                )}
              </div>
            </div>

            {submitError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-[10px] font-black uppercase tracking-widest text-center">
                {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 w-full bg-blue-600 text-white py-4 rounded-2xl hover:bg-blue-700 transition-all font-black shadow-xl shadow-blue-100 text-[11px] uppercase tracking-widest active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? '...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
