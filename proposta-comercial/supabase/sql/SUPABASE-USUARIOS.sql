-- Tabela de gestão de usuários e papéis
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NULL,
  email TEXT UNIQUE NOT NULL,
  nome TEXT NULL,
  papel TEXT NOT NULL DEFAULT 'viewer' CHECK (papel IN ('admin','editor','viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Helper: checar se quem está logado é admin
CREATE OR REPLACE FUNCTION public.is_admin(u UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.usuarios x WHERE x.user_id = u AND x.papel = 'admin'
  );
$$;

-- Trigger para bloquear mudança de papel por não-admin
CREATE OR REPLACE FUNCTION public.bloquear_papel_update()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  uid UUID := NULL;
BEGIN
  -- Obter UID do JWT (Supabase)
  BEGIN
    uid := current_setting('request.jwt.claim.sub', true)::uuid;
  EXCEPTION WHEN others THEN
    uid := NULL;
  END;

  IF NEW.papel IS DISTINCT FROM OLD.papel THEN
    IF uid IS NULL OR NOT public.is_admin(uid) THEN
      RAISE EXCEPTION 'Apenas administradores podem alterar papel' USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bloquear_papel_update ON public.usuarios;
CREATE TRIGGER trg_bloquear_papel_update
BEFORE UPDATE ON public.usuarios
FOR EACH ROW EXECUTE FUNCTION public.bloquear_papel_update();

-- Policies
-- SELECT: próprio registro
CREATE POLICY "usuarios_select_self"
ON public.usuarios FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- SELECT: admin pode ver todos
CREATE POLICY "usuarios_select_admin"
ON public.usuarios FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- INSERT: usuário pode inserir seu próprio registro
CREATE POLICY "usuarios_insert_self"
ON public.usuarios FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- INSERT: admin pode inserir qualquer registro (pré-cadastro por email)
CREATE POLICY "usuarios_insert_admin"
ON public.usuarios FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

-- UPDATE: usuário pode atualizar seu próprio registro (exceto troca de papel, controlado por trigger)
CREATE POLICY "usuarios_update_self"
ON public.usuarios FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- UPDATE: admin pode atualizar qualquer registro
CREATE POLICY "usuarios_update_admin"
ON public.usuarios FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- DELETE: apenas admin
CREATE POLICY "usuarios_delete_admin"
ON public.usuarios FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

COMMENT ON TABLE public.usuarios IS 'Gestão de papéis de usuários para o Admin da Proposta Comercial';
COMMENT ON FUNCTION public.is_admin IS 'Retorna true se o UID for de usuário com papel=admin';