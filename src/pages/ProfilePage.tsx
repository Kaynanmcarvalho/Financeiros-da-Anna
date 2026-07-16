import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  User, LogOut, KeyRound, Palette, Camera, Moon, Sun, Monitor, ShieldAlert, ShieldCheck,
  ChevronRight, ArrowLeft, Mail, Calendar, UserCog, Paintbrush, Loader2
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { signOut, reauthenticate, updateUserPassword, deleteUserAccount } from '@/firebase/auth';
import { uploadFile } from '@/firebase/storage';
import { useUpdateProfile, useUpdatePreferences } from '@/hooks/useProfile';
import { useUIStore } from '@/stores/uiStore';
import { usePreferencesStore } from '@/stores/preferencesStore';
import type { ThemePreset } from '@/types';
import { THEME_PRESETS } from '@/constants/app';
import { updateNameSchema, changePasswordSchema, type UpdateNameFormData, type ChangePasswordFormData } from '@/validators/schemas';
import { getGreeting } from '@/utils/greeting';

import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

type ActiveSection = 'main' | 'name' | 'password' | 'theme' | 'delete';

export default function ProfilePage() {
  const { user, userProfile } = useAuth();
  const [activeSection, setActiveSection] = useState<ActiveSection>('main');

  if (!user || !userProfile) return null;

  return (
    <div className="page max-w-2xl mx-auto flex flex-col gap-6">
      {activeSection === 'main' && (
        <MainProfileView onNavigate={setActiveSection} />
      )}
      
      {activeSection === 'name' && (
        <EditNameView onBack={() => setActiveSection('main')} />
      )}

      {activeSection === 'password' && (
        <ChangePasswordView onBack={() => setActiveSection('main')} />
      )}

      {activeSection === 'theme' && (
        <ThemePreferencesView onBack={() => setActiveSection('main')} />
      )}

      {activeSection === 'delete' && (
        <DeleteAccountView onBack={() => setActiveSection('main')} />
      )}
    </div>
  );
}

// -------------------------------------------------------------
// MAIN VIEW - PREMIUM REDESIGNED LAYOUT
// -------------------------------------------------------------

function MainProfileView({ onNavigate }: { onNavigate: (s: ActiveSection) => void }) {
  const { userProfile, user } = useAuth();
  const navigate = useNavigate();
  const updateProfile = useUpdateProfile();
  const openConfirmDialog = useUIStore((s) => s.openConfirmDialog);
  const addToast = useUIStore((s) => s.addToast);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const handleLogout = () => {
    openConfirmDialog({
      title: 'Sair da conta',
      description: 'Tem certeza que deseja desconectar deste dispositivo?',
      variant: 'info',
      onConfirm: () => signOut(),
    });
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file || !user) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      addToast({ type: 'warning', title: 'Formato não suportado', description: 'Escolha uma imagem JPG, PNG, WEBP ou GIF.' });
      input.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      addToast({ type: 'warning', title: 'Imagem muito grande', description: 'Escolha uma imagem de até 5 MB.' });
      input.value = '';
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const extension = file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1];
      const path = `avatars/${user.uid}_${Date.now()}.${extension}`;
      const url = await uploadFile(user.uid, path, file);
      await updateProfile.mutateAsync({ photoURL: url });
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code?.startsWith('storage/')) {
        const description = code === 'storage/unauthorized'
          ? 'O Firebase Storage não autorizou o envio. Verifique se as regras do Storage foram publicadas.'
          : code === 'storage/bucket-not-found'
            ? 'O bucket de imagens do Firebase não foi encontrado.'
            : 'Não foi possível enviar a foto. Verifique sua conexão e tente novamente.';
        addToast({ type: 'error', title: 'Erro ao enviar foto', description });
      }
      console.error('Erro ao atualizar a foto:', error);
    } finally {
      setIsUploadingPhoto(false);
      input.value = '';
    }
  };

  const [currentHour, setCurrentHour] = useState(() => new Date().getHours());

  useEffect(() => {
    const updateHour = () => setCurrentHour(new Date().getHours());
    const timer = window.setInterval(updateHour, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const profileGreeting = getGreeting(undefined, currentHour);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Premium Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-[var(--color-button)] to-purple-600 p-6 text-white shadow-xl">
        {/* Decorative circle shapes */}
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white opacity-10 blur-xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-32 h-32 rounded-full bg-white opacity-10 blur-lg pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
          {/* Avatar Container with Hover Effect */}
          <div className="relative group">
            <div className="rounded-full p-1.5 bg-white/20 backdrop-blur-sm transition-all duration-300 group-hover:scale-105">
              <Avatar 
                src={userProfile?.photoURL}
                name={userProfile?.name} 
                size="xl" 
                className="w-24 h-24 md:w-28 md:h-28 border-2 border-white/50 object-cover shadow-inner"
              />
            </div>
            
            <button 
              type="button"
              className="absolute bottom-1 right-1 bg-white text-[var(--color-button)] p-2.5 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all duration-200 border border-white/20 disabled:cursor-wait disabled:opacity-70"
              onClick={() => fileInputRef.current?.click()}
              title="Alterar foto de perfil"
              aria-label="Alterar foto de perfil"
              disabled={isUploadingPhoto}
            >
              {isUploadingPhoto ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} className="font-bold stroke-[2.5]" />}
            </button>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handlePhotoUpload}
              disabled={isUploadingPhoto}
            />
          </div>

          <div className="flex-1 flex flex-col gap-2">
            <span className="text-white/85 text-xs font-semibold uppercase tracking-wider bg-white/10 px-3 py-1 rounded-full self-center md:self-start backdrop-blur-md">
              {userProfile?.role === 'admin' ? '🛡️ Desenvolvedora e administradora' : '🏦 Membro Premium'}
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {userProfile?.name}
            </h2>
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-white/90 text-sm justify-center md:justify-start">
              <span className="flex items-center gap-1.5 justify-center md:justify-start">
                <Mail size={15} className="opacity-80" /> {userProfile?.email}
              </span>
              <span className="hidden md:inline text-white/40">•</span>
              <span className="flex items-center gap-1.5 justify-center md:justify-start">
                <Calendar size={15} className="opacity-80" /> {profileGreeting}!
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Opções de perfil */}
      <div className="flex flex-col gap-6">
        {userProfile?.role === 'admin' && (
          <div>
            <h3 className="mb-2 flex items-center gap-1.5 px-1 text-xs font-bold uppercase tracking-wider text-violet-500">
              <ShieldCheck size={14} /> Administração
            </h3>
            <PremiumMenuCard
              icon={<ShieldCheck size={22} className="text-violet-500" />}
              title="Painel da desenvolvedora"
              description="Usuários cadastrados, bloqueios e métricas de visitas"
              onClick={() => navigate('/admin')}
              fullWidth
            />
          </div>
        )}

        {/* Personalização */}
        <div>
          <h3 className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5">
            <Paintbrush size={14} /> Aparência e Estilo
          </h3>
          <PremiumMenuCard 
            icon={<Palette size={22} className="text-purple-500" />}
            title="Personalizar Tema"
            description="Escolha cores, modo escuro ou tema baseado no sistema"
            onClick={() => onNavigate('theme')}
            fullWidth
          />
        </div>

        {/* Group 3: Cadastro e Segurança */}
        <div>
          <h3 className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5">
            <UserCog size={14} /> Dados e Conta
          </h3>
          <div className="flex flex-col rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] shadow-md overflow-hidden divide-y divide-[var(--color-border)]">
            <SettingItem icon={<User size={18} className="text-amber-500" />} label="Alterar Nome" onClick={() => onNavigate('name')} />
            <SettingItem icon={<KeyRound size={18} className="text-indigo-500" />} label="Alterar Senha" onClick={() => onNavigate('password')} />
          </div>
        </div>

        {/* Group 4: Sessão & Segurança Crítica */}
        <div className="flex flex-col rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] shadow-md overflow-hidden divide-y divide-[var(--color-border)]">
          <SettingItem icon={<LogOut size={18} className="text-gray-500" />} label="Sair do Aplicativo" onClick={handleLogout} className="hover:bg-red-500/5" />
          <SettingItem 
            icon={<ShieldAlert size={18} className="text-red-500" />} 
            label="Excluir Conta Permanentemente" 
            onClick={() => onNavigate('delete')} 
            className="text-red-500 hover:bg-red-500/10" 
            hideChevron 
          />
        </div>
      </div>
    </div>
  );
}

// Interactive Premium Card Component
function PremiumMenuCard({ 
  icon, 
  title, 
  description, 
  onClick, 
  fullWidth = false 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  onClick: () => void;
  fullWidth?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`group flex items-start gap-4 p-5 bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl shadow-sm text-left hover:scale-[1.01] hover:shadow-md hover:border-[var(--color-button)] transition-all duration-200 ${fullWidth ? 'w-full' : ''}`}
    >
      <div className="p-3 rounded-xl bg-[var(--color-bg-secondary)] group-hover:bg-[var(--color-button)] group-hover:text-white transition-all duration-300">
        {icon}
      </div>
      <div className="flex flex-col gap-1 flex-1">
        <div className="flex items-center justify-between">
          <span className="font-bold text-[var(--color-text)] group-hover:text-[var(--color-button)] transition-colors">
            {title}
          </span>
          <ChevronRight size={16} className="text-[var(--color-text-secondary)] opacity-50 group-hover:translate-x-1 transition-transform" />
        </div>
        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
          {description}
        </p>
      </div>
    </button>
  );
}

function SettingItem({ icon, label, onClick, className = '', hideChevron = false }: { icon: React.ReactNode, label: string, onClick: () => void, className?: string, hideChevron?: boolean }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center justify-between p-4 bg-transparent hover:bg-[var(--color-bg-secondary)] transition-all text-left ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-[var(--color-bg-secondary)]">{icon}</div>
        <span className="font-semibold text-sm">{label}</span>
      </div>
      {!hideChevron && <ChevronRight size={16} className="text-[var(--color-text-secondary)] opacity-60" />}
    </button>
  );
}

// -------------------------------------------------------------
// EDIT NAME
// -------------------------------------------------------------

function EditNameView({ onBack }: { onBack: () => void }) {
  const { userProfile } = useAuth();
  const updateProfile = useUpdateProfile();
  
  const { register, handleSubmit, formState: { errors } } = useForm<UpdateNameFormData>({
    resolver: zodResolver(updateNameSchema),
    defaultValues: { name: userProfile?.name || '' },
  });

  const onSubmit = async (data: UpdateNameFormData) => {
    if (data.name !== userProfile?.name) {
      await updateProfile.mutateAsync({ name: data.name });
    }
    onBack();
  };

  return (
    <Card className="p-6 shadow-lg border border-[var(--color-border)] rounded-3xl bg-[var(--color-card)]">
      <Button variant="ghost" size="sm" onClick={onBack} icon={<ArrowLeft size={16} />} className="mb-4">
        Voltar ao Perfil
      </Button>
      <h2 className="text-xl font-black mb-1">Alterar Nome</h2>
      <p className="text-xs text-[var(--color-text-secondary)] mb-6">Atualize como você gostaria de ser chamado no aplicativo.</p>
      
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Seu nome completo"
          error={errors.name?.message}
          {...register('name')}
          className="rounded-xl border-[var(--color-border)] focus:border-[var(--color-button)]"
        />
        <Button type="submit" variant="primary" loading={updateProfile.isPending} className="rounded-xl py-3 mt-2 shadow-md">
          Salvar Alteração
        </Button>
      </form>
    </Card>
  );
}

// -------------------------------------------------------------
// CHANGE PASSWORD
// -------------------------------------------------------------

function ChangePasswordView({ onBack }: { onBack: () => void }) {
  const addToast = useUIStore((s) => s.addToast);
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      setIsLoading(true);
      await reauthenticate(data.currentPassword);
      await updateUserPassword(data.newPassword);
      
      addToast({ type: 'success', title: 'Senha atualizada com sucesso!' });
      reset();
      onBack();
    } catch (error) {
      console.error(error);
      addToast({ 
        type: 'error', 
        title: 'Erro ao alterar senha', 
        description: 'Verifique se a senha atual está correta.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 shadow-lg border border-[var(--color-border)] rounded-3xl bg-[var(--color-card)]">
      <Button variant="ghost" size="sm" onClick={onBack} icon={<ArrowLeft size={16} />} className="mb-4">
        Voltar ao Perfil
      </Button>
      <h2 className="text-xl font-black mb-1">Segurança</h2>
      <p className="text-xs text-[var(--color-text-secondary)] mb-6">Mantenha sua conta protegida alterando sua senha regularmente.</p>
      
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Senha atual"
          type="password"
          error={errors.currentPassword?.message}
          {...register('currentPassword')}
        />
        <Input
          label="Nova senha (mínimo 6 caracteres)"
          type="password"
          error={errors.newPassword?.message}
          {...register('newPassword')}
        />
        <Input
          label="Confirme a nova senha"
          type="password"
          error={errors.confirmNewPassword?.message}
          {...register('confirmNewPassword')}
        />
        <Button type="submit" variant="primary" loading={isLoading} className="rounded-xl py-3 mt-2 shadow-md">
          Atualizar Senha
        </Button>
      </form>
    </Card>
  );
}

// -------------------------------------------------------------
// THEME PREFERENCES
// -------------------------------------------------------------

function ThemePreferencesView({ onBack }: { onBack: () => void }) {
  const preferences = usePreferencesStore((s) => s.preferences);
  const updatePreferencesMutation = useUpdatePreferences();

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    updatePreferencesMutation.mutate({ ...preferences, theme });
  };

  const handlePresetChange = (preset: ThemePreset) => {
    updatePreferencesMutation.mutate({ ...preferences, ...preset.preferences });
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <Button variant="ghost" size="sm" onClick={onBack} icon={<ArrowLeft size={16} />} className="self-start">
        Voltar ao Perfil
      </Button>
      
      <Card className="p-6 shadow-md border border-[var(--color-border)] rounded-3xl bg-[var(--color-card)]">
        <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
          <Moon size={20} className="text-[var(--color-button)]" /> 
          Modo de Exibição
        </h3>
        <p className="text-xs text-[var(--color-text-secondary)] mb-5">Escolha a aparência ideal para o seu momento de uso.</p>
        
        <div className="grid grid-cols-3 gap-3">
          <ThemeModeButton 
            icon={<Sun size={20} />} label="Claro" 
            isActive={preferences.theme === 'light'} 
            onClick={() => handleThemeChange('light')} 
          />
          <ThemeModeButton 
            icon={<Moon size={20} />} label="Escuro" 
            isActive={preferences.theme === 'dark'} 
            onClick={() => handleThemeChange('dark')} 
          />
          <ThemeModeButton 
            icon={<Monitor size={20} />} label="Sistema" 
            isActive={preferences.theme === 'system'} 
            onClick={() => handleThemeChange('system')} 
          />
        </div>
      </Card>

      <Card className="p-6 shadow-md border border-[var(--color-border)] rounded-3xl bg-[var(--color-card)]">
        <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
          <Palette size={20} className="text-[var(--color-button)]" /> 
          Cores do Aplicativo
        </h3>
        <p className="text-xs text-[var(--color-text-secondary)] mb-5">Selecione uma combinação de cores premium de sua preferência.</p>
        
        <div className="flex flex-col gap-3">
          {THEME_PRESETS.map((preset) => {
            const isActive = preferences.primaryColor === preset.preferences.primaryColor;
            return (
              <button
                key={preset.name}
                onClick={() => handlePresetChange(preset)}
                className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-200 ${isActive ? 'border-[var(--color-button)] bg-[var(--color-button)] bg-opacity-[0.06] shadow-sm' : 'border-transparent bg-[var(--color-bg-secondary)] hover:bg-[var(--color-border)]'}`}
              >
                <span className="font-semibold text-sm">{preset.name}</span>
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full shadow-sm" style={{ backgroundColor: preset.preferences.primaryColor }} />
                  <div className="w-6 h-6 rounded-full shadow-sm" style={{ backgroundColor: preset.preferences.buttonColor }} />
                </div>
              </button>
            );
          })}
        </div>
      </Card>
      
      <Card className="p-6 shadow-md border border-[var(--color-border)] rounded-3xl bg-[var(--color-card)]">
        <h3 className="font-bold text-lg mb-4">Configurações de Experiência</h3>
        
        <div className="flex items-center justify-between py-3 border-b border-[var(--color-border)]">
          <div>
            <p className="font-semibold text-sm">Modo Privacidade</p>
            <p className="text-xs text-[var(--color-text-secondary)]">Oculta valores na tela inicial por padrão</p>
          </div>
          <Toggle 
            checked={preferences.hideValues} 
            onChange={(checked) => updatePreferencesMutation.mutate({ ...preferences, hideValues: checked })} 
          />
        </div>
        
        <div className="flex items-center justify-between py-3">
          <div>
            <p className="font-semibold text-sm">Animações UI</p>
            <p className="text-xs text-[var(--color-text-secondary)]">Reduza o movimento desativando</p>
          </div>
          <Toggle 
            checked={preferences.animationsEnabled} 
            onChange={(checked) => updatePreferencesMutation.mutate({ ...preferences, animationsEnabled: checked })} 
          />
        </div>
      </Card>
    </div>
  );
}

function ThemeModeButton({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-250 ${isActive ? 'border-[var(--color-button)] text-[var(--color-button)] bg-[var(--color-button)] bg-opacity-[0.06]' : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-text-muted)]'}`}
    >
      {icon}
      <span className="text-xs font-semibold">{label}</span>
    </button>
  );
}

function Toggle({ checked, onChange }: { checked: boolean, onChange: (c: boolean) => void }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" className="sr-only peer" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <div className="w-11 h-6 bg-[var(--color-border)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-button)]"></div>
    </label>
  );
}

// -------------------------------------------------------------
// DELETE ACCOUNT
// -------------------------------------------------------------

function DeleteAccountView({ onBack }: { onBack: () => void }) {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const addToast = useUIStore((s) => s.addToast);

  const handleDelete = async () => {
    if (!password) {
      addToast({ type: 'warning', title: 'Digite sua senha para confirmar' });
      return;
    }

    try {
      setIsLoading(true);
      await reauthenticate(password);
      await deleteUserAccount();
    } catch (error) {
      console.error(error);
      addToast({ 
        type: 'error', 
        title: 'Erro ao excluir conta', 
        description: 'Senha incorreta ou erro de servidor.' 
      });
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 border-red-200 bg-red-50/50 dark:bg-red-950/20 dark:border-red-900 rounded-3xl">
      <Button variant="ghost" size="sm" onClick={onBack} icon={<ArrowLeft size={16} />} className="mb-4 text-red-700 dark:text-red-300">
        Voltar ao Perfil
      </Button>
      <div className="flex flex-col items-center text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center dark:bg-red-900/50 dark:text-red-200">
          <ShieldAlert size={32} />
        </div>
        <h2 className="text-xl font-bold text-red-700 dark:text-red-400">Excluir sua conta?</h2>
        <p className="text-sm text-red-600 dark:text-red-300">
          Esta ação é <strong>irreversível</strong>. Todos os seus lançamentos, contas e preferências serão apagados permanentemente.
        </p>
        
        <div className="w-full max-w-xs flex flex-col gap-3 mt-2">
          <Input
            placeholder="Confirme sua senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="text-center bg-white dark:bg-zinc-900 border-red-200"
          />
          <Button 
            variant="danger" 
            onClick={handleDelete} 
            loading={isLoading}
            className="w-full py-3 rounded-xl shadow-lg shadow-red-500/10"
          >
            Excluir permanentemente
          </Button>
        </div>
      </div>
    </Card>
  );
}
