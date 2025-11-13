-- Enable RLS on clientes
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

-- Read policy for authenticated users
DROP POLICY IF EXISTS clientes_read ON public.clientes;
CREATE POLICY clientes_read
  ON public.clientes
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert policy for authenticated users
DROP POLICY IF EXISTS clientes_insert ON public.clientes;
CREATE POLICY clientes_insert
  ON public.clientes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Update policy for authenticated users
DROP POLICY IF EXISTS clientes_update ON public.clientes;
CREATE POLICY clientes_update
  ON public.clientes
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);