-- Pakizzle v2 — demo data so every admin/customer surface has something to show.
-- Idempotent: each block only fires if its target table is empty, so real data
-- is never clobbered.

DO $$
DECLARE
  v_admin_id  BIGINT;
  v_user_id   BIGINT;
  v_seller_id BIGINT;
BEGIN
  SELECT id INTO v_admin_id  FROM users WHERE role = 'admin'              ORDER BY id LIMIT 1;
  SELECT id INTO v_user_id   FROM users WHERE email LIKE '%sagar%'        ORDER BY id LIMIT 1;
  SELECT id INTO v_seller_id FROM users WHERE id <> COALESCE(v_admin_id, 0) ORDER BY id LIMIT 1;
  IF v_seller_id IS NULL THEN v_seller_id := v_admin_id; END IF;
  IF v_user_id   IS NULL THEN v_user_id   := v_seller_id; END IF;

  -- If there are no users yet (fresh boot, before anyone has registered),
  -- skip every block that needs a user_id. Re-running this migration after
  -- the first user signs up will populate the demo data.
  IF v_seller_id IS NULL THEN
    RAISE NOTICE '005_seed_demo: no users yet, skipping demo data';
    RETURN;
  END IF;

  -- ── profiles ──────────────────────────────────────────────────────────
  IF (SELECT COUNT(*) FROM profiles) = 0 AND v_user_id IS NOT NULL THEN
    INSERT INTO profiles (user_id, display_name, city, bio, whatsapp) VALUES
      (v_user_id,   'Sagar S.',   'Karachi',   'Car enthusiast & seller.',           '+923001234567'),
      (v_admin_id,  'Redspots',   'Lahore',    'Pakizzle admin team.',                '+923009876543')
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  -- ── listings ──────────────────────────────────────────────────────────
  -- 18 listings covering every status so Approval Center, Listings table,
  -- and dashboard tiles all light up.
  IF (SELECT COUNT(*) FROM listings) = 0 THEN
    INSERT INTO listings (seller_id, make_id, model_id, title, description, price, year, mileage, city, condition, transmission, fuel_type, color, images, status, view_count, created_at) VALUES
      (v_seller_id, 1, 1,  '2019 Toyota Corolla XLI — single owner',          'Pristine condition, all original parts, full service history.', 4250000, 2019, 54000, 'Karachi',   'good',      'manual',    'petrol',  'White',  ARRAY['https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200'], 'active',   245, NOW() - INTERVAL '14 days'),
      (v_seller_id, 1, 2,  '2021 Toyota Camry Hybrid — top of the line',      'Hybrid, full options, panoramic sunroof, JBL sound.',           9450000, 2021, 32000, 'Lahore',    'excellent', 'automatic', 'hybrid',  'Black',  ARRAY['https://images.unsplash.com/photo-1617469767053-d3b523a0b982?auto=format&fit=crop&q=80&w=1200'], 'active',   612, NOW() - INTERVAL '10 days'),
      (v_seller_id, 2, 5,  '2020 Honda Civic Oriel UG — Pearl White',         '1.8L Oriel CVT, sunroof, cruise control, perfect condition.',   6850000, 2020, 41000, 'Islamabad', 'excellent', 'cvt',       'petrol',  'White',  ARRAY['https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80&w=1200'], 'active',   389, NOW() - INTERVAL '7 days'),
      (v_seller_id, 2, 6,  '2018 Honda City Aspire 1.5 — first owner',        'Family used, well maintained, complete book.',                  3450000, 2018, 67000, 'Karachi',   'good',      'manual',    'petrol',  'Silver', ARRAY['https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&q=80&w=1200'], 'active',   178, NOW() - INTERVAL '4 days'),
      (v_seller_id, 3, 8,  '2017 Suzuki Alto 660 VXR — fuel efficient',       'City driven, AC chilled, fresh paint, smooth engine.',          1450000, 2017, 89000, 'Lahore',    'fair',      'manual',    'petrol',  'Red',    ARRAY['https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=1200'], 'active',   523, NOW() - INTERVAL '3 days'),
      (v_seller_id, 3, 10, '2022 Suzuki Swift GL CVT — bank leased',          'Brand new condition, bank leased, easy transfer.',              4250000, 2022, 18000, 'Peshawar',  'excellent', 'cvt',       'petrol',  'Blue',   ARRAY['https://images.unsplash.com/photo-1604843108936-9b7ec4f17d20?auto=format&fit=crop&q=80&w=1200'], 'active',   201, NOW() - INTERVAL '2 days'),
      (v_seller_id, 4, 12, '2020 Kia Sportage AWD — top variant',             'Full options, panoramic sunroof, 360 camera.',                  6850000, 2020, 48000, 'Islamabad', 'excellent', 'automatic', 'petrol',  'Grey',   ARRAY['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1200'], 'active',   934, NOW() - INTERVAL '20 days'),
      (v_seller_id, 5, 14, '2021 Hyundai Tucson GLS Sport — flagship',        'Flagship SUV, every option ticked.',                            8950000, 2021, 35000, 'Karachi',   'excellent', 'automatic', 'petrol',  'White',  ARRAY['https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&q=80&w=1200'], 'active',   452, NOW() - INTERVAL '5 days'),

      -- pending listings -> show in Approval Center
      (v_seller_id, 1, 3,  '2023 Toyota Yaris Aero 1.5 CVT — almost new',     'Showroom condition, 12k km only, all standard accessories.',    4850000, 2023, 12000, 'Karachi',   'excellent', 'cvt',       'petrol',  'Silver', ARRAY['https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=1200'], 'pending',   12, NOW() - INTERVAL '6 hours'),
      (v_seller_id, 2, 7,  '2019 Honda BR-V S 1.5 — 7 seater family',         'Spacious family SUV, all 7 seats, captain chairs.',             4250000, 2019, 78000, 'Lahore',    'good',      'manual',    'petrol',  'Bronze', ARRAY['https://images.unsplash.com/photo-1606611013016-969c19ba27bb?auto=format&fit=crop&q=80&w=1200'], 'pending',    8, NOW() - INTERVAL '3 hours'),
      (v_seller_id, 6, 16, '2022 MG HS Trophy — turbocharged',                'Turbo SUV, big screen, ventilated seats.',                      7250000, 2022, 22000, 'Islamabad', 'excellent', 'automatic', 'petrol',  'Black',  ARRAY['https://images.unsplash.com/photo-1626668893648-c1a4a3a9be3a?auto=format&fit=crop&q=80&w=1200'], 'pending',    3, NOW() - INTERVAL '1 hour'),
      (v_seller_id, 7, 17, '2021 Changan Alsvin Lumiere — automatic',         'Stylish sedan, cheaper to run, low maintenance.',               2850000, 2021, 42000, 'Karachi',   'good',      'automatic', 'petrol',  'White',  ARRAY['https://images.unsplash.com/photo-1554744512-d6c603f27c54?auto=format&fit=crop&q=80&w=1200'], 'pending',    1, NOW() - INTERVAL '20 minutes'),

      -- rejected
      (v_seller_id, 1, 1,  '2010 Corolla Sport (TRD swap) — heavy mods',      'Engine swap, body kit. Listing too speculative — buyer beware.',  950000, 2010, 220000,'Quetta',    'fair',      'manual',    'petrol',  'Red',    ARRAY['https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&q=80&w=1200'], 'rejected', 134, NOW() - INTERVAL '8 days'),

      -- sold
      (v_seller_id, 1, 4,  '2019 Toyota Fortuner V — 4x4',                    'Sold to a verified dealer.',                                    9450000, 2019, 86000, 'Lahore',    'good',      'automatic', 'diesel',  'White',  ARRAY['https://images.unsplash.com/photo-1554223090-7e4837eb9d5e?auto=format&fit=crop&q=80&w=1200'], 'sold',     889, NOW() - INTERVAL '32 days'),
      (v_seller_id, 3, 9,  '2018 Suzuki Cultus VXL — first owner',            'Sold same week of listing.',                                    1650000, 2018, 72000, 'Karachi',   'good',      'manual',    'petrol',  'White',  ARRAY['https://images.unsplash.com/photo-1541443131876-44b03de101c5?auto=format&fit=crop&q=80&w=1200'], 'sold',     341, NOW() - INTERVAL '45 days'),

      -- banned
      (v_seller_id, 3, 11, '2020 Wagon R — fake odo claim',                   'Listing banned — odometer rollback evidence reported.',         1450000, 2020, 12000, 'Multan',    'fair',      'manual',    'petrol',  'Grey',   ARRAY['https://images.unsplash.com/photo-1583268901517-2566c3eed2c5?auto=format&fit=crop&q=80&w=1200'], 'banned',    67, NOW() - INTERVAL '12 days'),

      -- drafts (only visible to owner)
      (v_user_id,   8, 18, 'Proton Saga 2024 — draft',                        '',                                                              2350000, 2024,  5000, 'Karachi',   'excellent', 'automatic', 'petrol',  'White',  ARRAY[]::TEXT[], 'draft', 0, NOW() - INTERVAL '2 days'),
      (v_user_id,   2, 5,  '2017 Honda Civic Turbo RS — draft',               'Still writing the description.',                                5650000, 2017, 95000, 'Karachi',   'good',      'cvt',       'petrol',  'Red',    ARRAY[]::TEXT[], 'draft', 0, NOW() - INTERVAL '6 hours');

    -- Reject reason on the rejected row (so the column has content).
    UPDATE listings SET reject_reason = 'Listing fails authenticity check — modifications not disclosed in title.'
      WHERE status = 'rejected' AND title LIKE '%TRD swap%';

    -- Ban reason via the listings table is informal; show in reject_reason column too.
    UPDATE listings SET reject_reason = 'Odometer fraud reported by 3 separate buyers; banned pending investigation.'
      WHERE status = 'banned';
  END IF;

  -- ── wishlists (saves) ─────────────────────────────────────────────────
  -- Put 5 saves on sagar's account so the customer Wishlist page is full.
  IF (SELECT COUNT(*) FROM wishlists) = 0 AND v_user_id IS NOT NULL THEN
    INSERT INTO wishlists (user_id, listing_id)
      SELECT v_user_id, id FROM listings WHERE status = 'active' ORDER BY view_count DESC LIMIT 5
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── notifications ─────────────────────────────────────────────────────
  IF (SELECT COUNT(*) FROM notifications) = 0 AND v_user_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, type, title, body, link, created_at) VALUES
      (v_user_id,  'listing', 'Your listing was approved',           'Your 2019 Corolla XLI is now live.',                '/dashboard/ads',      NOW() - INTERVAL '6 hours'),
      (v_user_id,  'message', 'New message from a buyer',            'Ahmed R. asked about your Civic Oriel.',            '/dashboard/messages', NOW() - INTERVAL '1 day'),
      (v_user_id,  'system',  'Price drop alert',                    'A saved listing dropped from 7.4M to 6.9M PKR.',    '/dashboard/wishlist', NOW() - INTERVAL '3 days'),
      (v_admin_id, 'system',  '12 listings awaiting review',         'Head to the Approval Center to clear the queue.',   '/admin/approvals',    NOW() - INTERVAL '20 minutes'),
      (v_admin_id, 'payment', 'Featured-listing purchase',            'Premium Motors paid Rs 4,500 for Featured 30 Days.', '/admin/payments',     NOW() - INTERVAL '2 hours');
  END IF;

  -- ── dealers ───────────────────────────────────────────────────────────
  IF (SELECT COUNT(*) FROM dealers) = 0 THEN
    INSERT INTO dealers (owner_id, name, slug, city, phone, whatsapp, status, is_verified, listings_count) VALUES
      (v_seller_id, 'Premium Motors',          'premium-motors',          'Karachi',   '+92 21 35663300', '+923009000001', 'active',    TRUE,  47),
      (v_seller_id, 'Elite Wheels',            'elite-wheels',            'Lahore',    '+92 42 35884400', '+923009000002', 'active',    TRUE,  38),
      (v_seller_id, 'City Drive Motors',       'city-drive-motors',       'Islamabad', '+92 51 28443301', '+923009000003', 'active',    FALSE, 22),
      (v_seller_id, 'Velocity Cars',           'velocity-cars',           'Karachi',   '+92 21 34000000', '+923009000004', 'active',    FALSE, 19),
      (v_seller_id, 'Northern Auto Galleria',  'northern-auto-galleria',  'Peshawar',  '+92 91 5840012',  '+923009000005', 'pending',   FALSE,  0),
      (v_seller_id, 'Southside Imports',       'southside-imports',       'Karachi',   '+92 21 35550099', '+923009000006', 'pending',   FALSE,  0),
      (v_seller_id, 'Faisalabad Auto Hub',     'faisalabad-auto-hub',     'Faisalabad','+92 41 8550044',  '+923009000007', 'suspended', FALSE,  4);
  END IF;

  -- ── payments ──────────────────────────────────────────────────────────
  IF (SELECT COUNT(*) FROM payments) = 0 THEN
    INSERT INTO payments (user_id, amount, currency, method, status, purpose, reference, created_at) VALUES
      (v_seller_id, 4500,  'PKR', 'card',       'completed', 'featured_listing',     'PAK-2604-0001', NOW() - INTERVAL '2 hours'),
      (v_seller_id, 1500,  'PKR', 'easypaisa',  'completed', 'featured_listing',     'PAK-2604-0002', NOW() - INTERVAL '8 hours'),
      (v_seller_id, 25000, 'PKR', 'bank',       'completed', 'dealer_subscription',  'PAK-2604-0003', NOW() - INTERVAL '1 day'),
      (v_seller_id, 4500,  'PKR', 'card',       'completed', 'featured_listing',     'PAK-2604-0004', NOW() - INTERVAL '2 days'),
      (v_seller_id, 1500,  'PKR', 'jazzcash',   'completed', 'featured_listing',     'PAK-2604-0005', NOW() - INTERVAL '3 days'),
      (v_seller_id, 25000, 'PKR', 'bank',       'completed', 'dealer_subscription',  'PAK-2604-0006', NOW() - INTERVAL '5 days'),
      (v_seller_id, 4500,  'PKR', 'card',       'failed',    'featured_listing',     'PAK-2604-0007', NOW() - INTERVAL '6 days'),
      (v_seller_id, 1500,  'PKR', 'card',       'pending',   'featured_listing',     'PAK-2604-0008', NOW() - INTERVAL '4 hours'),
      (v_seller_id, 8500,  'PKR', 'card',       'refunded',  'inspection',           'PAK-2604-0009', NOW() - INTERVAL '10 days'),
      (v_seller_id, 4500,  'PKR', 'easypaisa',  'completed', 'featured_listing',     'PAK-2604-0010', NOW() - INTERVAL '12 hours');
  END IF;

  -- ── reports ───────────────────────────────────────────────────────────
  IF (SELECT COUNT(*) FROM reports) = 0 THEN
    INSERT INTO reports (reporter_id, target_type, target_id, reason, description, status, created_at) VALUES
      (v_user_id, 'listing', '14', 'scam',           'Seller asking for advance payment via bank transfer, refusing inspection.', 'open',      NOW() - INTERVAL '5 hours'),
      (v_user_id, 'listing', '13', 'misleading',     'Photos don''t match the actual car — pictures from showroom.',              'open',      NOW() - INTERVAL '1 day'),
      (v_user_id, 'user',    '3',  'spam',           'User posting the same ad 4 times with different titles.',                    'resolved',  NOW() - INTERVAL '3 days'),
      (v_user_id, 'listing', '10', 'price_anomaly',  'Price way above market — possible price fixing.',                            'dismissed', NOW() - INTERVAL '5 days');

    UPDATE reports SET resolution_note = 'Duplicate ads removed, user warned.', resolved_at = NOW() - INTERVAL '2 days', resolved_by = v_admin_id WHERE status = 'resolved';
    UPDATE reports SET resolution_note = 'Reviewed — pricing within seller''s discretion.',                             resolved_at = NOW() - INTERVAL '4 days', resolved_by = v_admin_id WHERE status = 'dismissed';
  END IF;

  -- ── inspection_requests ───────────────────────────────────────────────
  IF (SELECT COUNT(*) FROM inspection_requests) = 0 THEN
    INSERT INTO inspection_requests (user_id, customer_name, customer_email, customer_phone, vehicle_make, vehicle_model, vehicle_year, vehicle_city, address, package, preferred_date, status, created_at) VALUES
      (v_user_id, 'Ahmed Raza',    'ahmed.raza@example.com', '+923001112233', 'Honda',  'Civic',    2020, 'Karachi',   'DHA Phase 6, House 27-B',  'premium',  NOW() + INTERVAL '2 days',  'pending',   NOW() - INTERVAL '4 hours'),
      (v_user_id, 'Sara Khan',     'sara.k@example.com',     '+923332224455', 'Toyota', 'Corolla',  2019, 'Lahore',    'Gulberg III, M-Block',     'standard', NOW() + INTERVAL '1 day',   'pending',   NOW() - INTERVAL '1 day'),
      (v_user_id, 'Bilal Ahmad',   'bilal.a@example.com',    '+923215554433', 'Suzuki', 'Swift',    2022, 'Islamabad', 'F-7 Markaz',               'basic',    NOW() + INTERVAL '3 days',  'scheduled', NOW() - INTERVAL '2 days'),
      (v_user_id, 'Umar Farooq',   'umar.f@example.com',     '+923009998877', 'Kia',    'Sportage', 2020, 'Karachi',   'Clifton Block 8',          'premium',  NOW() - INTERVAL '1 day',   'completed', NOW() - INTERVAL '6 days'),
      (v_user_id, 'Mariam Akhtar', 'mariam.a@example.com',   '+923336667788', 'Hyundai','Tucson',   2021, 'Lahore',    'Bahria Town, Sector C',    'standard', NOW() - INTERVAL '3 days',  'completed', NOW() - INTERVAL '8 days'),
      (v_user_id, 'Zain Malik',    'zain.m@example.com',     '+923014445566', 'MG',     'HS',       2022, 'Karachi',   'PECHS Block 6',            'premium',  NOW() + INTERVAL '4 days',  'pending',   NOW() - INTERVAL '12 hours'),
      (v_user_id, 'Hira Yusuf',    'hira.y@example.com',     '+923125557788', 'Honda',  'City',     2018, 'Faisalabad','Citizen Colony',           'basic',    NOW() - INTERVAL '7 days',  'cancelled', NOW() - INTERVAL '10 days');
  END IF;

  -- ── insurance_requests ────────────────────────────────────────────────
  IF (SELECT COUNT(*) FROM insurance_requests) = 0 THEN
    INSERT INTO insurance_requests (user_id, customer_name, customer_email, customer_phone, vehicle_make, vehicle_model, vehicle_year, vehicle_value, plan, provider, quoted_premium, status, created_at) VALUES
      (v_user_id, 'Ahmed Raza',    'ahmed.raza@example.com', '+923001112233', 'Honda',  'Civic',    2020, 6850000, 'comprehensive', 'EFU',     205500, 'quoted',    NOW() - INTERVAL '4 hours'),
      (v_user_id, 'Sara Khan',     'sara.k@example.com',     '+923332224455', 'Toyota', 'Corolla',  2019, 4250000, 'third-party',   'Adamjee',  47000, 'pending',   NOW() - INTERVAL '1 day'),
      (v_user_id, 'Bilal Ahmad',   'bilal.a@example.com',    '+923215554433', 'Suzuki', 'Swift',    2022, 4250000, 'comprehensive', 'Jubilee', 127500, 'bound',     NOW() - INTERVAL '4 days'),
      (v_user_id, 'Umar Farooq',   'umar.f@example.com',     '+923009998877', 'Kia',    'Sportage', 2020, 6850000, 'comprehensive', 'EFU',     189000, 'pending',   NOW() - INTERVAL '2 hours'),
      (v_user_id, 'Mariam Akhtar', 'mariam.a@example.com',   '+923336667788', 'Hyundai','Tucson',   2021, 8950000, 'comprehensive', 'Adamjee', 268500, 'quoted',    NOW() - INTERVAL '8 hours'),
      (v_user_id, 'Zain Malik',    'zain.m@example.com',     '+923014445566', 'MG',     'HS',       2022, 7250000, 'comprehensive', 'Jubilee', 217500, 'pending',   NOW() - INTERVAL '30 minutes');
  END IF;

  -- ── financing_requests ────────────────────────────────────────────────
  IF (SELECT COUNT(*) FROM financing_requests) = 0 THEN
    INSERT INTO financing_requests (user_id, customer_name, customer_email, customer_phone, vehicle_make, vehicle_model, vehicle_year, vehicle_price, down_payment, tenure_months, employment, monthly_income, bank, status, approved_amount, rate_apr, created_at) VALUES
      (v_user_id, 'Ahmed Raza',    'ahmed.raza@example.com', '+923001112233', 'Honda',  'Civic',    2020, 6850000, 2000000, 60, 'salaried', 350000, 'HBL',          'reviewing', NULL,     NULL, NOW() - INTERVAL '6 hours'),
      (v_user_id, 'Sara Khan',     'sara.k@example.com',     '+923332224455', 'Toyota', 'Corolla',  2019, 4250000, 1000000, 48, 'salaried', 220000, 'Meezan Bank',  'approved',  3250000, 18.5, NOW() - INTERVAL '3 days'),
      (v_user_id, 'Bilal Ahmad',   'bilal.a@example.com',    '+923215554433', 'Suzuki', 'Swift',    2022, 4250000, 1500000, 36, 'business', 450000, 'Standard Chartered','approved',  2750000, 17.9, NOW() - INTERVAL '7 days'),
      (v_user_id, 'Umar Farooq',   'umar.f@example.com',     '+923009998877', 'Kia',    'Sportage', 2020, 6850000, 2500000, 60, 'salaried', 500000, 'UBL',          'pending',   NULL,     NULL, NOW() - INTERVAL '2 hours'),
      (v_user_id, 'Mariam Akhtar', 'mariam.a@example.com',   '+923336667788', 'Hyundai','Tucson',   2021, 8950000, 3000000, 60, 'business', 600000, 'HBL',          'rejected',  NULL,     NULL, NOW() - INTERVAL '5 days'),
      (v_user_id, 'Zain Malik',    'zain.m@example.com',     '+923014445566', 'MG',     'HS',       2022, 7250000, 2000000, 60, 'salaried', 400000, 'Faysal Bank',  'disbursed', 5250000, 19.2, NOW() - INTERVAL '14 days');
  END IF;

  -- ── audit_logs ────────────────────────────────────────────────────────
  IF (SELECT COUNT(*) FROM audit_logs) = 0 AND v_admin_id IS NOT NULL THEN
    INSERT INTO audit_logs (actor_id, actor_email, action, target_type, target_id, meta, created_at) VALUES
      (v_admin_id, 'admin@pakizzle.com', 'listing.active',  'listing', '1',  '{"reason":"approved"}'::jsonb,                 NOW() - INTERVAL '2 days'),
      (v_admin_id, 'admin@pakizzle.com', 'listing.rejected','listing', '13', '{"reason":"modifications not disclosed"}'::jsonb, NOW() - INTERVAL '8 days'),
      (v_admin_id, 'admin@pakizzle.com', 'listing.banned',  'listing', '16', '{"reason":"odometer fraud"}'::jsonb,           NOW() - INTERVAL '12 days'),
      (v_admin_id, 'admin@pakizzle.com', 'user.update',     'user',    '2',  '{"changed":"badge"}'::jsonb,                   NOW() - INTERVAL '3 days'),
      (v_admin_id, 'admin@pakizzle.com', 'banner.create',   'banner',  '1',  '{}'::jsonb,                                    NOW() - INTERVAL '30 days'),
      (v_admin_id, 'admin@pakizzle.com', 'banner.update',   'banner',  '2',  '{}'::jsonb,                                    NOW() - INTERVAL '4 days');
  END IF;

  -- ── admin_settings ────────────────────────────────────────────────────
  IF (SELECT COUNT(*) FROM admin_settings) = 0 THEN
    INSERT INTO admin_settings (key, value, updated_by) VALUES
      ('maintenance_mode',  '{"enabled": false, "message": "We''re back shortly."}'::jsonb,            v_admin_id),
      ('feature_flags',     '{"ai_valuation": true, "chat": false, "auction_verification": true}'::jsonb, v_admin_id),
      ('homepage_hero',     '{"headline": "Pakistan''s smartest car marketplace", "cta": "Start exploring"}'::jsonb, v_admin_id),
      ('email_throttle',    '{"otp_per_hour": 5, "welcome_enabled": true}'::jsonb,                    v_admin_id),
      ('listing_defaults',  '{"default_status": "active", "max_images": 20, "min_price": 100000}'::jsonb, v_admin_id),
      ('contact_support',   '{"email": "support@pakizzle.com", "whatsapp": "+923009990000"}'::jsonb,   v_admin_id);
  END IF;

  -- ── custom_fields ─────────────────────────────────────────────────────
  IF (SELECT COUNT(*) FROM custom_fields) = 0 THEN
    INSERT INTO custom_fields (slug, label, field_type, options, required, applies_to, sort_order) VALUES
      ('registration_city', 'Registration City', 'select',  '["Karachi","Lahore","Islamabad","Peshawar","Quetta","Multan","Faisalabad","Other"]'::jsonb, FALSE, 'listing', 1),
      ('owner_count',       'Number of Owners',   'select',  '["1","2","3","4+"]'::jsonb,                                                                  TRUE,  'listing', 2),
      ('assembly',          'Assembly',           'select',  '["Local","Imported","CBU"]'::jsonb,                                                          FALSE, 'listing', 3),
      ('insurance_until',   'Insurance valid until','text',  '[]'::jsonb,                                                                                  FALSE, 'listing', 4),
      ('vin_or_chassis',    'VIN / Chassis no.',  'text',    '[]'::jsonb,                                                                                  FALSE, 'listing', 5);
  END IF;

  -- ── auction_verifications ─────────────────────────────────────────────
  IF (SELECT COUNT(*) FROM auction_verifications) = 0 THEN
    INSERT INTO auction_verifications (listing_id, seller_id, sheet_url, grade, notes, status, created_at)
    SELECT
      pick.id,
      v_seller_id,
      'https://auctionsheets.example.com/' || pick.id || '.pdf',
      data.grade,
      data.notes,
      data.status,
      NOW() - (data.rn * INTERVAL '3 days')
    FROM (
      SELECT id, row_number() OVER (ORDER BY id) AS rn
        FROM listings
       WHERE status IN ('active','sold')
       LIMIT 5
    ) pick
    JOIN (VALUES
        (1, '4.5', 'Engine A, body B, interior A.',                                'verified'),
        (2, '4',   'Front bumper repainted; otherwise mint.',                      'pending'),
        (3, '3.5', 'Minor scratches on rear quarter panel.',                       'verified'),
        (4, '5',   'Grade 5 — virtually new.',                                     'verified'),
        (5, '4',   'Full service history, original auction sheet attached.',       'rejected')
    ) AS data(rn, grade, notes, status) ON pick.rn = data.rn;
  END IF;

END $$;
