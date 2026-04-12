-- Adiciona colunas para integração com o Stripe
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Índice para busca rápida de assinaturas
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON public.profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_subscription_id ON public.profiles(stripe_subscription_id);

-- Garante permissão para o service_role ler e editar (o webhook usa service_role)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- (As políticas existentes de RLS já devem permitir que o usuário veja seu próprio perfil)
