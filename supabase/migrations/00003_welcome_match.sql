-- Welcome match notification on profile creation
CREATE OR REPLACE FUNCTION handle_new_user_subscription()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan_id, status)
  VALUES (NEW.user_id, 'free', 'active')
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.notifications (user_id, type, title, message, cta_text, cta_link)
  VALUES (
    NEW.user_id,
    'welcome',
    'Bem-vindo ao Nextrigon! 🎉',
    'Seu primeiro match está garantido! Complete seu perfil e comece a construir conexões profissionais.',
    'Começar agora',
    '/app/match'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
