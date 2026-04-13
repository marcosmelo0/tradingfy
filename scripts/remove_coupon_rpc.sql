CREATE OR REPLACE FUNCTION admin_remove_coupon(target_user_id UUID)
RETURNS void AS $$
BEGIN
  -- Atualiza o profile e apaga o cupom atual do afiliado
  -- O afiliado continuará sendo afiliado, mas precisará criar um novo cupom
  UPDATE profiles
  SET coupon_code = NULL
  WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
