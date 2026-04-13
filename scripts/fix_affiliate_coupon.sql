-- Primeiro, apagamos as duas versões que estão em conflito
DROP FUNCTION IF EXISTS admin_update_profile(UUID, TEXT, TIMESTAMPTZ, BOOLEAN, INTEGER);
DROP FUNCTION IF EXISTS admin_update_profile(UUID, TEXT, TIMESTAMPTZ, BOOLEAN, NUMERIC);

-- Em seguida, recriamos APENAS UMA versão com INTEGER (como era originalmente)
CREATE OR REPLACE FUNCTION admin_update_profile(
  target_user_id UUID,
  new_status TEXT,
  new_end_date TIMESTAMPTZ,
  new_is_affiliate BOOLEAN,
  new_affiliate_discount INTEGER
)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET 
    subscription_status = new_status,
    subscription_end_date = new_end_date,
    is_affiliate = new_is_affiliate,
    affiliate_discount = new_affiliate_discount,
    
    -- Se new_is_affiliate for falso, limpa o campo coupon_code
    coupon_code = CASE 
                    WHEN new_is_affiliate = FALSE THEN NULL 
                    ELSE coupon_code 
                  END
                  
  WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
