import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, LogIn } from 'lucide-react';
import { FirebaseError } from 'firebase/app';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/stores/uiStore';
import { signInWithEmail } from '@/firebase/auth';
import { loginSchema, type LoginFormData } from '@/validators/schemas';

export default function LoginPage() {
  const navigate = useNavigate();
  const addToast = useUIStore((s) => s.addToast);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      await signInWithEmail(data.email, data.password, data.rememberMe);
      
      addToast({
        type: 'success',
        title: 'Login realizado com sucesso!',
      });
      
      navigate('/');
    } catch (error) {
      console.error(error);
      let message = 'Ocorreu um erro ao fazer login.';
      
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/invalid-credential') {
          message = 'E-mail ou senha incorretos.';
        } else if (error.code === 'auth/user-not-found') {
          message = 'Usuário não encontrado.';
        } else if (error.code === 'auth/wrong-password') {
          message = 'Senha incorreta.';
        } else if (error.code === 'auth/too-many-requests') {
          message = 'Muitas tentativas falhas. Tente novamente mais tarde.';
        }
      }
      
      addToast({
        type: 'error',
        title: 'Erro ao entrar',
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card card-glass card-p-lg w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">Bem-vinda(o) de volta!</h1>
        <p className="text-[var(--color-text-secondary)] text-sm">
          Entre com seus dados para acessar seus financeiros.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <Input
          label="E-mail"
          type="email"
          placeholder="seu@email.com"
          leftIcon={<Mail size={18} />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Senha"
          type="password"
          placeholder="••••••••"
          leftIcon={<Lock size={18} />}
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex items-center justify-between text-sm mt-1">
          <label className="flex items-center gap-2 cursor-pointer text-[var(--color-text-secondary)]">
            <input 
              type="checkbox" 
              className="rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
              {...register('rememberMe')}
            />
            Lembrar-me
          </label>
          <Link 
            to="/recuperar-senha" 
            className="text-[var(--color-button)] hover:underline font-medium"
          >
            Esqueceu a senha?
          </Link>
        </div>

        <Button 
          type="submit" 
          variant="primary" 
          size="lg" 
          fullWidth 
          loading={isLoading}
          icon={<LogIn size={18} />}
          className="mt-2"
        >
          Entrar
        </Button>

        <div className="text-center mt-4 text-sm text-[var(--color-text-secondary)]">
          Ainda não tem uma conta?{' '}
          <Link to="/cadastro" className="text-[var(--color-button)] hover:underline font-medium">
            Cadastre-se
          </Link>
        </div>
      </form>
    </div>
  );
}
