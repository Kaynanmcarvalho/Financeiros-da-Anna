import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, User as UserIcon, UserPlus } from 'lucide-react';
import { FirebaseError } from 'firebase/app';
import { serverTimestamp } from 'firebase/firestore';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/stores/uiStore';
import { signUpWithEmail } from '@/firebase/auth';
import { setDocument } from '@/firebase/firestore';
import { registerSchema, type RegisterFormData } from '@/validators/schemas';
import { DEFAULT_PREFERENCES, DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from '@/constants/app';
import type { UserProfile, Category } from '@/types';

export default function RegisterPage() {
  const navigate = useNavigate();
  const addToast = useUIStore((s) => s.addToast);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const setupNewUser = async (uid: string, name: string, email: string) => {
    // Cria o perfil
    const profile: Omit<UserProfile, 'id'> = {
      uid,
      name,
      email,
      photoURL: null,
      createdAt: serverTimestamp() as any,
      lastLoginAt: serverTimestamp() as any,
      preferences: DEFAULT_PREFERENCES,
      role: 'user',
      blocked: false,
      blockedAt: null,
      blockedBy: null,
    };
    await setDocument(`users/${uid}`, profile);

    // Cria categorias padrão
    const allDefaultCategories = [...DEFAULT_EXPENSE_CATEGORIES, ...DEFAULT_INCOME_CATEGORIES];
    
    // Como batch operations são limitadas e isso é executado apenas uma vez,
    // podemos usar a criação sequencial ou com Promise.all de forma segura para os defaults.
    // Em produção real com muitos dados seria melhor criar uma Cloud Function.
    await Promise.all(
      allDefaultCategories.map((cat) => {
        const catId = crypto.randomUUID();
        const category: Category = {
          id: catId,
          ...cat,
          createdAt: serverTimestamp() as any,
        };
        return setDocument(`users/${uid}/categories/${catId}`, category);
      })
    );
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      
      // Cria no Auth
      const user = await signUpWithEmail(data.email, data.password, data.name);
      
      // Configura os dados iniciais no Firestore
      await setupNewUser(user.uid, data.name, data.email);
      
      addToast({
        type: 'success',
        title: 'Conta criada com sucesso!',
        description: 'Bem-vinda(o) ao Meu Dinheiro.',
      });
      
      navigate('/');
    } catch (error) {
      console.error(error);
      let message = 'Ocorreu um erro ao criar a conta.';
      
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/email-already-in-use') {
          message = 'Este e-mail já está em uso.';
        } else if (error.code === 'auth/weak-password') {
          message = 'A senha é muito fraca.';
        } else if (error.code === 'auth/invalid-email') {
          message = 'O e-mail é inválido.';
        }
      }
      
      addToast({
        type: 'error',
        title: 'Erro no cadastro',
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card card-glass card-p-lg w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">Crie sua conta</h1>
        <p className="text-[var(--color-text-secondary)] text-sm">
          Comece a organizar suas finanças hoje mesmo.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Nome completo"
          placeholder="Seu nome"
          leftIcon={<UserIcon size={18} />}
          error={errors.name?.message}
          {...register('name')}
        />

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

        <Input
          label="Confirme a senha"
          type="password"
          placeholder="••••••••"
          leftIcon={<Lock size={18} />}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button 
          type="submit" 
          variant="primary" 
          size="lg" 
          fullWidth 
          loading={isLoading}
          icon={<UserPlus size={18} />}
          className="mt-4"
        >
          Criar conta
        </Button>

        <div className="text-center mt-4 text-sm text-[var(--color-text-secondary)]">
          Já tem uma conta?{' '}
          <Link to="/login" className="text-[var(--color-button)] hover:underline font-medium">
            Entrar
          </Link>
        </div>
      </form>
    </div>
  );
}
