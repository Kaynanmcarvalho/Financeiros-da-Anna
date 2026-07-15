import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, KeyRound, ArrowLeft } from 'lucide-react';
import { FirebaseError } from 'firebase/app';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/stores/uiStore';
import { resetPassword } from '@/firebase/auth';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/validators/schemas';

export default function ForgotPasswordPage() {
  const addToast = useUIStore((s) => s.addToast);
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      setIsLoading(true);
      await resetPassword(data.email);
      setIsSent(true);
      addToast({
        type: 'success',
        title: 'E-mail enviado!',
        description: 'Verifique sua caixa de entrada para redefinir a senha.',
      });
    } catch (error) {
      console.error(error);
      let message = 'Ocorreu um erro ao tentar recuperar a senha.';
      
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/user-not-found') {
          // Por segurança, às vezes é melhor não revelar se o email existe, 
          // mas como é um app pessoal, vamos dar o feedback claro.
          message = 'Não há usuário cadastrado com este e-mail.';
        } else if (error.code === 'auth/invalid-email') {
          message = 'E-mail inválido.';
        }
      }
      
      addToast({
        type: 'error',
        title: 'Erro',
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <div className="card card-glass card-p-lg w-full max-w-md mx-auto text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-[var(--color-success)] rounded-full flex items-center justify-center text-white opacity-90">
            <Mail size={32} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">E-mail enviado!</h2>
        <p className="text-[var(--color-text-secondary)] mb-8">
          Enviamos um link de recuperação para o seu e-mail. Por favor, verifique sua caixa de entrada e também a pasta de spam.
        </p>
        <Link to="/login">
          <Button variant="primary" size="lg" fullWidth icon={<ArrowLeft size={18} />}>
            Voltar para o Login
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="card card-glass card-p-lg w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">Recuperar Senha</h1>
        <p className="text-[var(--color-text-secondary)] text-sm">
          Informe seu e-mail cadastrado e enviaremos instruções para redefinir sua senha.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <Input
          label="E-mail"
          type="email"
          placeholder="seu@email.com"
          leftIcon={<Mail size={18} />}
          error={errors.email?.message}
          {...register('email')}
        />

        <div className="flex flex-col gap-3">
          <Button 
            type="submit" 
            variant="primary" 
            size="lg" 
            fullWidth 
            loading={isLoading}
            icon={<KeyRound size={18} />}
          >
            Enviar link de recuperação
          </Button>
          
          <Link to="/login">
            <Button type="button" variant="ghost" size="md" fullWidth>
              Cancelar
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
