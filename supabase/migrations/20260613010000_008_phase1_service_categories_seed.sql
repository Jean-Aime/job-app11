-- ================================================
-- PHASE 1B: SERVICE CATEGORIES SEED DATA
-- ================================================
-- Populate service categories with realistic rates for African market

INSERT INTO service_categories (name, description, icon, hourly_rate_min, hourly_rate_max, is_active) VALUES
-- Home Services
('Plumbing', 'Water pipe installation, leak repairs, drainage, toilet repairs, sink installation', 'Wrench', 3000, 8000, true),
('Electrical Work', 'Wiring, installations, repairs, lighting, circuit breakers, electrical maintenance', 'Zap', 4000, 10000, true),
('Carpentry', 'Furniture making, repairs, door/window installation, custom woodwork', 'Hammer', 3000, 7000, true),
('Painting', 'Interior/exterior painting, wall preparation, spray painting, color consultation', 'PaintBucket', 2500, 6000, true),
('Cleaning', 'House cleaning, deep cleaning, office cleaning, carpet cleaning, window cleaning', 'Sparkles', 2000, 5000, true),
('Masonry', 'Brickwork, concrete work, plastering, tiling, wall construction', 'Blocks', 3500, 8000, true),
('Roofing', 'Roof installation, repairs, waterproofing, gutter installation', 'Home', 4000, 9000, true),

-- Personal Services
('Babysitting', 'Childcare, nanny services, after-school care, infant care', 'Baby', 1500, 4000, true),
('Elderly Care', 'Companion care, assistance with daily activities, medication reminders', 'Heart', 2000, 5000, true),
('Personal Chef', 'Meal preparation, catering, private dining, special dietary needs', 'ChefHat', 3000, 8000, true),
('Laundry Service', 'Washing, ironing, dry cleaning pickup and delivery', 'Shirt', 1500, 3500, true),
('Gardening', 'Lawn mowing, landscaping, tree trimming, plant care', 'Leaf', 2000, 5000, true),

-- Professional Services
('Tutoring', 'Academic tutoring, language lessons, music lessons, test preparation', 'GraduationCap', 3000, 10000, true),
('Photography', 'Event photography, portraits, product photography, photo editing', 'Camera', 5000, 15000, true),
('Videography', 'Event videography, video editing, drone footage, corporate videos', 'Video', 6000, 20000, true),
('Graphic Design', 'Logo design, branding, flyers, business cards, social media graphics', 'Palette', 4000, 12000, true),
('Web Development', 'Website creation, maintenance, e-commerce, mobile apps', 'Code', 8000, 25000, true),

-- Technical Services
('Computer Repair', 'Hardware repair, software installation, virus removal, data recovery', 'Monitor', 3000, 8000, true),
('Phone Repair', 'Screen replacement, battery replacement, software issues, unlocking', 'Smartphone', 2500, 6000, true),
('Appliance Repair', 'Washing machine, refrigerator, AC, microwave, TV repairs', 'Wrench', 3500, 9000, true),
('CCTV Installation', 'Security camera installation, monitoring setup, maintenance', 'Camera', 4000, 10000, true),
('Solar Installation', 'Solar panel installation, inverter setup, battery systems', 'Sun', 5000, 15000, true),

-- Automotive Services
('Auto Mechanic', 'Car repairs, maintenance, diagnostics, oil change, brake service', 'Wrench', 4000, 12000, true),
('Car Wash', 'Exterior/interior car cleaning, detailing, waxing, polishing', 'Car', 2000, 5000, true),
('Driving Instructor', 'Driving lessons, defensive driving, license test preparation', 'CarFront', 3000, 7000, true),

-- Beauty & Wellness
('Hair Styling', 'Haircuts, styling, braiding, coloring, hair treatments', 'Scissors', 2500, 8000, true),
('Makeup Artist', 'Event makeup, bridal makeup, special occasion makeup', 'Sparkles', 3000, 10000, true),
('Massage Therapy', 'Therapeutic massage, sports massage, relaxation massage', 'Hand', 3000, 8000, true),
('Fitness Training', 'Personal training, workout plans, nutrition guidance, home workouts', 'Dumbbell', 3000, 10000, true),

-- Moving & Delivery
('Moving Service', 'House/office moving, packing, loading, unloading, furniture assembly', 'Truck', 5000, 15000, true),
('Delivery Service', 'Package delivery, food delivery, grocery delivery, courier service', 'Package', 1500, 5000, true),

-- Event Services
('Event Planning', 'Party planning, wedding planning, corporate events, decorations', 'PartyPopper', 5000, 20000, true),
('DJ Services', 'Music for events, sound equipment, MC services', 'Music', 10000, 30000, true),
('Catering', 'Event catering, menu planning, food preparation, service staff', 'UtensilsCrossed', 5000, 20000, true),

-- Specialized Services
('Pest Control', 'Fumigation, termite treatment, bed bug removal, rodent control', 'Bug', 3000, 8000, true),
('Locksmith', 'Lock installation, key cutting, lockout assistance, security upgrades', 'Key', 2500, 7000, true),
('Tailoring', 'Clothing alterations, custom tailoring, repairs, embroidery', 'Scissors', 2000, 6000, true),
('Welding', 'Metal fabrication, gate installation, structural welding, repairs', 'Flame', 4000, 10000, true),
('Upholstery', 'Furniture reupholstering, cushion replacement, fabric work', 'Armchair', 3000, 8000, true)

ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  hourly_rate_min = EXCLUDED.hourly_rate_min,
  hourly_rate_max = EXCLUDED.hourly_rate_max;

-- ================================================
-- Summary Stats
-- ================================================
DO $$
DECLARE
  category_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO category_count FROM service_categories;
  
  RAISE NOTICE '';
  RAISE NOTICE '✅ SERVICE CATEGORIES SEEDED';
  RAISE NOTICE '📊 Total Categories: %', category_count;
  RAISE NOTICE '💰 Rate Range: RWF 1,500 - 30,000 per hour';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Categories Include:';
  RAISE NOTICE '   🏠 Home Services (7): Plumbing, Electrical, Carpentry, etc.';
  RAISE NOTICE '   👤 Personal Services (5): Babysitting, Cleaning, Chef, etc.';
  RAISE NOTICE '   🎓 Professional Services (5): Tutoring, Photography, Design, etc.';
  RAISE NOTICE '   🔧 Technical Services (5): Computer, Phone, Appliance Repair, etc.';
  RAISE NOTICE '   🚗 Automotive Services (3): Mechanic, Car Wash, Driving';
  RAISE NOTICE '   💄 Beauty & Wellness (4): Hair, Makeup, Massage, Fitness';
  RAISE NOTICE '   📦 Moving & Delivery (2): Moving, Delivery';
  RAISE NOTICE '   🎉 Event Services (3): Planning, DJ, Catering';
  RAISE NOTICE '   🔨 Specialized Services (6): Pest Control, Locksmith, Tailoring, etc.';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Ready for Phase 2: Service Provider Registration';
END $$;
