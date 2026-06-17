-- Plans de assinatura
CREATE TABLE subscription_plans (
  id text PRIMARY KEY,
  nome text NOT NULL,
  preco numeric NOT NULL DEFAULT 0,
  matches_mensais int NOT NULL DEFAULT 5,
  boosts_mensais int NOT NULL DEFAULT 0,
  pode_ver_quem_curtiu boolean NOT NULL DEFAULT false,
  chat_ilimitado boolean NOT NULL DEFAULT false,
  primeira_impressao boolean NOT NULL DEFAULT false,
  perfil_verificado boolean NOT NULL DEFAULT false,
  ranking_premium boolean NOT NULL DEFAULT false,
  relatorios text NOT NULL DEFAULT 'none',
  destaque_nacional boolean NOT NULL DEFAULT false,
  selo_autoridade boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO subscription_plans (id, nome, preco, matches_mensais, boosts_mensais, pode_ver_quem_curtiu, chat_ilimitado, primeira_impressao, perfil_verificado, ranking_premium, relatorios, destaque_nacional, selo_autoridade) VALUES
  ('free', 'Grátis', 0, 5, 0, false, false, false, false, false, 'none', false, false),
  ('pro', 'Pro', 49, 999999, 2, true, true, false, false, false, 'basico', false, false),
  ('elite', 'Elite', 129, 999999, 5, true, true, true, true, true, 'completo', true, true);

-- Assinaturas dos usuários
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id text NOT NULL REFERENCES subscription_plans(id),
  status text NOT NULL DEFAULT 'active',
  current_period_start timestamptz NOT NULL DEFAULT now(),
  current_period_end timestamptz NOT NULL DEFAULT (now() + interval '1 month'),
  boosts_remaining int NOT NULL DEFAULT 0,
  matches_used_this_month int NOT NULL DEFAULT 0,
  stripe_customer_id text,
  stripe_subscription_id text,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Profile views (para FOMO / curiosidade)
CREATE TABLE profile_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  viewer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_profile_views_target ON profile_views(target_id, created_at);

-- Boost activations
CREATE TABLE boost_activations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  source text NOT NULL DEFAULT 'purchased',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_boost_activations_active ON boost_activations(user_id, expires_at);

-- Notificações do sistema
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}',
  cta_text text,
  cta_link text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, read, created_at DESC);

-- Mensagem de primeira impressão (junto com swipe)
ALTER TABLE swipes ADD COLUMN IF NOT EXISTS message text;

-- Flag de boost ativo no perfil
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS boost_active_until timestamptz;

-- Stats do usuário para dashboard financeiro
CREATE TABLE user_financial_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mes int NOT NULL,
  ano int NOT NULL,
  conexoes int NOT NULL DEFAULT 0,
  parcerias_fechadas int NOT NULL DEFAULT 0,
  honorarios_receita numeric NOT NULL DEFAULT 0,
  oportunidades_recebidas int NOT NULL DEFAULT 0,
  valor_negociacao numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, mes, ano)
);

-- Trigger para criar subscription free ao criar perfil
CREATE OR REPLACE FUNCTION handle_new_user_subscription()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan_id, status)
  VALUES (NEW.user_id, 'free', 'active')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_created_create_subscription ON public.profiles;
CREATE TRIGGER on_profile_created_create_subscription
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION handle_new_user_subscription();

-- Trigger monthly reset for matches_used
CREATE OR REPLACE FUNCTION reset_monthly_matches()
RETURNS void AS $$
BEGIN
  UPDATE public.subscriptions
  SET matches_used_this_month = 0,
      boosts_remaining = CASE plan_id
        WHEN 'pro' THEN 2
        WHEN 'elite' THEN 5
        ELSE 0
      END,
      current_period_start = date_trunc('month', now()),
      current_period_end = date_trunc('month', now()) + interval '1 month';
END;
$$ LANGUAGE plpgsql;
