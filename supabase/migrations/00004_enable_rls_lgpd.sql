-- ============================================================
-- HABILITAR RLS EM TODAS AS TABELAS PÚBLICAS
-- Políticas compatíveis com LGPD para plataforma de advogados
-- ============================================================

-- 1. PROFILES (perfis públicos para descoberta, mas apenas o dono edita)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Qualquer usuário autenticado pode ver perfis (necessário para o deck)
CREATE POLICY "profiles_select_authenticated" ON public.profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- Apenas o próprio usuário pode inserir/atualizar seu perfil
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "profiles_delete_own" ON public.profiles
  FOR DELETE USING (auth.uid() = user_id);


-- 2. SWIPES (likes/dislikes)
ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;

-- Usuário vê seus próprios swipes (quem ele deu like/dislike)
CREATE POLICY "swipes_select_own" ON public.swipes
  FOR SELECT USING (auth.uid() = from_user);

-- Usuário vê quem deu like nele (para a aba "Quem te curtiu")
CREATE POLICY "swipes_select_incoming" ON public.swipes
  FOR SELECT USING (auth.uid() = to_user);

-- Apenas insere como from_user
CREATE POLICY "swipes_insert_own" ON public.swipes
  FOR INSERT WITH CHECK (auth.uid() = from_user);


-- 3. MATCHES
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "matches_select_participant" ON public.matches
  FOR SELECT USING (auth.uid() = user1 OR auth.uid() = user2);


-- 4. MESSAGES (chat)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Usuário pode ver mensagens de conversas que ele participa
CREATE POLICY "messages_select_participant" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.matches m
      WHERE (m.user1 = auth.uid() OR m.user2 = auth.uid())
        AND 'conv-' || m.id = conversation_id
    )
  );

CREATE POLICY "messages_insert_participant" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.matches m
      WHERE (m.user1 = auth.uid() OR m.user2 = auth.uid())
        AND 'conv-' || m.id = conversation_id
    )
  );


-- 5. PROPOSALS (propostas de negócio)
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "proposals_select_participant" ON public.proposals
  FOR SELECT USING (auth.uid() = from_user OR auth.uid() = to_user);

CREATE POLICY "proposals_insert_own" ON public.proposals
  FOR INSERT WITH CHECK (auth.uid() = from_user);

CREATE POLICY "proposals_update_participant" ON public.proposals
  FOR UPDATE USING (auth.uid() = from_user OR auth.uid() = to_user);


-- 6. PROJECTS (projetos)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "projects_select_own" ON public.projects
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "projects_insert_own" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "projects_update_own" ON public.projects
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "projects_delete_own" ON public.projects
  FOR DELETE USING (auth.uid() = owner_id);


-- 7. PROJECT_STEPS
ALTER TABLE public.project_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "project_steps_select_owner" ON public.project_steps
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_id AND p.owner_id = auth.uid()
    )
  );

CREATE POLICY "project_steps_insert_owner" ON public.project_steps
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_id AND p.owner_id = auth.uid()
    )
  );

CREATE POLICY "project_steps_update_owner" ON public.project_steps
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_id AND p.owner_id = auth.uid()
    )
  );

CREATE POLICY "project_steps_delete_owner" ON public.project_steps
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_id AND p.owner_id = auth.uid()
    )
  );


-- 8. REVIEWS (avaliações)
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reviews_select_participant" ON public.reviews
  FOR SELECT USING (auth.uid() = from_user OR auth.uid() = to_user);

CREATE POLICY "reviews_insert_own" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = from_user);


-- 9. VERIFICATIONS (dados sensíveis LGPD)
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "verifications_select_own" ON public.verifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "verifications_insert_own" ON public.verifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "verifications_update_own" ON public.verifications
  FOR UPDATE USING (auth.uid() = user_id);


-- 10. SUBSCRIPTIONS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions_select_own" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- O trigger handle_new_user_subscription já insere com SECURITY DEFINER, então funciona


-- 11. SUBSCRIPTION_PLANS (público, qualquer um pode ver)
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscription_plans_select_all" ON public.subscription_plans
  FOR SELECT USING (auth.role() = 'authenticated');


-- 12. PROFILE_VIEWS (LGPD: rastreamento controlado)
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profile_views_select_target" ON public.profile_views
  FOR SELECT USING (auth.uid() = target_id);

CREATE POLICY "profile_views_insert_viewer" ON public.profile_views
  FOR INSERT WITH CHECK (auth.uid() = viewer_id);


-- 13. BOOST_ACTIVATIONS
ALTER TABLE public.boost_activations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "boost_activations_select_own" ON public.boost_activations
  FOR SELECT USING (auth.uid() = user_id);


-- 14. NOTIFICATIONS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);


-- 15. USER_FINANCIAL_STATS (LGPD: dados financeiros sigilosos)
ALTER TABLE public.user_financial_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_financial_stats_select_own" ON public.user_financial_stats
  FOR SELECT USING (auth.uid() = user_id);
