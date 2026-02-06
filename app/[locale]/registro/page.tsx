'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { useAuth } from '@/lib/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

interface RegisterPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default function RegisterPage({ params }: RegisterPageProps) {
  const t = useTranslations();
  const router = useRouter();
  const { user, register } = useAuth();

  const [locale, setLocale] = useState<string>('');
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Unwrap params
  useEffect(() => {
    params.then((p) => {
      setLocale(p.locale);
    });
  }, [params]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/cuenta/perfil');
    }
  }, [user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 5) {
      setError('La contraseña debe tener al menos 5 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        email: formData.email,
        password: formData.password,
        firstname: formData.firstname,
        lastname: formData.lastname,
      });
      router.push('/cuenta/perfil');
    } catch (err: any) {
      setError(err.message || 'Error al crear la cuenta');
    } finally {
      setIsLoading(false);
    }
  };

  // Breadcrumb items
  const breadcrumbItems = [
    {
      label: t('auth.register'),
      href: `/${locale}/registro`,
    },
  ];

  if (user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* Register Form */}
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              {t('auth.register')}
            </h1>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label={t('checkout.firstName')}
                type="text"
                name="firstname"
                value={formData.firstname}
                onChange={handleChange}
                required
                autoComplete="given-name"
              />

              <Input
                label={t('checkout.lastName')}
                type="text"
                name="lastname"
                value={formData.lastname}
                onChange={handleChange}
                required
                autoComplete="family-name"
              />

              <Input
                label={t('auth.email')}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />

              <Input
                label={t('auth.password')}
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
                helperText="Mínimo 5 caracteres"
              />

              <Input
                label={t('auth.confirmPassword')}
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />

              <div className="pt-2">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    className="mt-1 w-4 h-4 text-purple-900 border-gray-300 rounded focus:ring-purple-900"
                  />
                  <span className="text-sm text-gray-600">
                    Acepto los{' '}
                    <a href="#" className="text-purple-900 hover:underline">
                      términos y condiciones
                    </a>{' '}
                    y la{' '}
                    <a href="#" className="text-purple-900 hover:underline">
                      política de privacidad
                    </a>
                  </span>
                </label>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isLoading}
              >
                {t('auth.signUp')}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {t('auth.haveAccount')}{' '}
                <Link href="/login" className="text-purple-900 font-medium hover:underline">
                  {t('auth.signIn')}
                </Link>
              </p>
            </div>
          </div>

          {/* Security Section */}
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Tus datos están seguros</h3>
                <p className="text-sm text-gray-600">
                  Cumplimos con el RGPD y protegemos tu información personal. Nunca compartiremos tus datos con terceros sin tu consentimiento.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
