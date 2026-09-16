import { SERVICES_DATA } from './servicesData';

export const MAIN_CATEGORIES = [
  {
    id: 'appliance',
    slug: 'appliance',
    url: '/appliance',
    title: 'Appliance Repair Services in Indore',
    name: 'Appliance Repair',
    shortName: 'Appliance Repair',
    badge: 'Popular',
    iconName: 'Wrench',
    startingPrice: 199,
    bannerImage: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1200&q=80',
    description: 'Doorstep home appliance repair and maintenance services in Indore. AC repair & foam jet servicing, refrigerator cooling fix, washing machine drum repair, RO purifier filter change, geyser, microwave, chimney & cooler repairs by certified technicians.',
    heroSubtitle: 'Prompt Doorstep Service | 30-Day Service Warranty | 100% Genuine OEM Spares',
    metaTitle: 'Appliance Repair in Indore | Prompt Doorstep Service | PlumberIndore',
    metaDescription: 'Book certified doorstep appliance repair in Indore: AC repair, Refrigerator, Washing Machine, RO Purifier, Geyser, Microwave, Chimney & Coolers. prompt doorstep arrival with 30-day warranty.',
    subcategories: [
      {
        slug: 'ac-repair',
        name: 'AC Repair & Service',
        url: '/appliance/ac-repair',
        startingPrice: 399,
        serviceId: 'ac-repair',
        bannerImage: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=800&q=80',
        description: 'Expert doorstep Air Conditioner repair, foam jet servicing, gas leak refill, and installation by certified HVAC technicians across Indore.',
        metaTitle: 'AC Repair & Service in Indore | Doorstep AC Gas Refill & Service',
        metaDescription: 'Book certified split & window AC repair in Indore. Power foam jet service, R32/R410 gas refill, PCB repair, and prompt doorstep arrival across Vijay Nagar, Palasia & all sectors.'
      },
      {
        slug: 'refrigerator',
        name: 'Refrigerator Repair',
        url: '/appliance/refrigerator',
        startingPrice: 299,
        serviceId: 'refrigerator',
        bannerImage: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=800&q=80',
        description: 'Single door, double door, and side-by-side refrigerator repair in Indore. Cooling coil fix, compressor relay, defrost heater & gas charging.',
        metaTitle: 'Refrigerator Repair in Indore | Single & Double Door Fridge Service',
        metaDescription: 'Doorstep refrigerator repair in Indore. LG, Samsung, Whirlpool fridge cooling fix, gas charging, defrost thermostat repair with prompt doorstep arrival.'
      },
      {
        slug: 'washing-machine',
        name: 'Washing Machine Repair',
        url: '/appliance/washing-machine',
        startingPrice: 299,
        serviceId: 'washing-machine',
        bannerImage: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=800&q=80',
        description: 'Top load, front load, and semi-automatic washing machine repair at your doorstep in Indore. Drum bearing, motor belt, and drain pump repair.',
        metaTitle: 'Washing Machine Repair in Indore | Front Load & Top Load Service',
        metaDescription: 'Expert washing machine repair in Indore. Drum noise, OE/IE error codes, drain pump replacement, and descaling with 30-day post service warranty.'
      },
      {
        slug: 'ro-purifier',
        name: 'RO Water Purifier Repair',
        url: '/appliance/ro-purifier',
        startingPrice: 199,
        serviceId: 'ro-purifier',
        bannerImage: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4e?auto=format&fit=crop&w=800&q=80',
        description: 'RO water purifier filter change, high TDS membrane replacement, booster pump repair, and UV/UF servicing in Indore.',
        metaTitle: 'RO Purifier Repair & Service in Indore | Filter Change & Membrane',
        metaDescription: 'Doorstep RO purifier repair in Indore. Kent, Aquaguard filter kit change, membrane replacement, and TDS balancing with prompt doorstep technician arrival.'
      },
      {
        slug: 'geyser',
        name: 'Geyser & Water Heater Repair',
        url: '/appliance/geyser',
        startingPrice: 249,
        serviceId: 'geyser',
        bannerImage: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
        description: 'Electric and gas geyser repair, heating element replacement, thermostat repair, and tank leakage fix in Indore.',
        metaTitle: 'Geyser Repair & Service in Indore | Water Heater Heating Element Fix',
        metaDescription: 'Instant & storage geyser repair in Indore. Heating coil change, thermostat test, and safety valve fitting with prompt doorstep service.'
      },
      {
        slug: 'microwave',
        name: 'Microwave Oven Repair',
        url: '/appliance/microwave',
        startingPrice: 249,
        serviceId: 'microwave',
        bannerImage: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=800&q=80',
        description: 'Convection, Grill, and Solo microwave oven repair. Magnetron heating fix, spark mica replacement, and touchpad PCB repair in Indore.',
        metaTitle: 'Microwave Oven Repair in Indore | Magnetron & Touchpad PCB Fix',
        metaDescription: 'Doorstep microwave oven repair in Indore. Fixing heating failure, sparks inside cavity, and turntable plate issues with 30-day warranty.'
      },
      {
        slug: 'kitchen-chimney',
        name: 'Kitchen Chimney Deep Clean & Repair',
        url: '/appliance/kitchen-chimney',
        startingPrice: 399,
        serviceId: 'kitchen-chimney',
        bannerImage: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
        description: 'Deep chemical degreasing, baffle filter washing, suction motor repair, and flexible duct pipe installation in Indore.',
        metaTitle: 'Kitchen Chimney Repair & Cleaning in Indore | Deep Degreasing Service',
        metaDescription: 'Doorstep kitchen chimney repair and deep degreasing in Indore. Faber, Elica, Glen chimney filter cleaning and motor suction restoration.'
      },
      {
        slug: 'air-cooler',
        name: 'Air Cooler Repair & Servicing',
        url: '/appliance/air-cooler',
        startingPrice: 199,
        serviceId: 'air-cooler',
        bannerImage: 'https://images.unsplash.com/photo-1618941709602-92849f611320?auto=format&fit=crop&w=800&q=80',
        description: 'High-density honeycomb pad replacement, submersible pump fix, and fan motor rewinding for all cooler brands in Indore.',
        metaTitle: 'Air Cooler Repair & Servicing in Indore | Honeycomb Pad & Pump Fix',
        metaDescription: 'Same-day air cooler repair in Indore. Symphony, Kenstar, Bajaj cooler pump replacement, tank descaling, and motor capacitor overhaul.'
      },
      {
        slug: 'inverter',
        name: 'Inverter & Battery Servicing',
        url: '/appliance/inverter',
        startingPrice: 249,
        serviceId: 'inverter',
        bannerImage: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80',
        description: 'Inverter PCB repair, charging circuit diagnostics, battery gravity test, and distilled water acid top-up in Indore.',
        metaTitle: 'Inverter & Battery Repair in Indore | Microtek & Luminous Service',
        metaDescription: 'Doorstep inverter repair and battery maintenance in Indore. Fast PCB repair, charging fault correction, and prompt doorstep arrival across all sectors.'
      },
      {
        slug: 'atta-chakki',
        name: 'Atta Chakki (Flour Mill) Repair',
        url: '/appliance/atta-chakki',
        startingPrice: 249,
        serviceId: 'atta-chakki',
        bannerImage: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
        description: 'Domestic flour mill cutter replacement, stone grinding clearance alignment, and motor capacitor repair in Indore.',
        metaTitle: 'Atta Chakki Repair in Indore | Domestic Flour Mill Doorstep Service',
        metaDescription: 'Doorstep Atta Chakki repair in Indore. Cutter sharpening, grinding alignment, and motor repairs with transparent fixed rates.'
      }
    ]
  },
  {
    id: 'plumbing',
    slug: 'plumber',
    url: '/plumber',
    title: 'Plumbing Services in Indore',
    name: 'Plumbing Services',
    shortName: 'Plumber',
    badge: 'Essential',
    iconName: 'Wrench',
    startingPrice: 69,
    bannerImage: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=1200&q=80',
    description: 'Expert doorstep plumbing services in Indore. Tap & mixer repair, toilet flush tank fix, sink & drain blockage removal, overhead water tank cleaning, bathroom fittings, and concealed pipe seepage inspection.',
    heroSubtitle: 'Master Plumbers | Leakage & Blockage Specialists | Prompt Doorstep Service',
    metaTitle: 'Plumber in Indore | Prompt Doorstep Plumbing Services | PlumberIndore',
    metaDescription: 'Book certified plumbers in Indore. Tap leakage, toilet flush tank repair, drain blockage removal, water tank cleaning, and bathroom fittings with prompt doorstep arrival.',
    subcategories: [
      {
        slug: 'tap-mixer-repair',
        name: 'Tap, Nozzle & Wall Mixer Repair',
        url: '/plumber/tap-mixer-repair',
        startingPrice: 149,
        serviceId: 'plumber',
        bannerImage: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80',
        description: 'Dripping tap repair, ceramic spindle replacement, washer gasket renewal, and single lever basin wall mixer repair in Indore.',
        metaTitle: 'Tap & Wall Mixer Repair in Indore | Spindle Change & Leak Fix',
        metaDescription: 'Fix leaking taps and basin wall mixers in Indore. Ceramic spindle replacement, rubber washers, and Jaquar/Hindware fittings with prompt doorstep arrival.'
      },
      {
        slug: 'toilet-flush-repair',
        name: 'Toilet & Flush Tank Cistern Repair',
        url: '/plumber/toilet-flush-repair',
        startingPrice: 199,
        serviceId: 'plumber',
        bannerImage: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
        description: 'Continuous flush tank overflow fix, syphon valve replacement, push button repair, jet spray installation, and Western commode leak fixes.',
        metaTitle: 'Toilet Flush Tank Repair in Indore | Western Cistern & Syphon Fix',
        metaDescription: 'Doorstep toilet flush tank and cistern repair in Indore. Syphon replacement, push button repair, and commode leak fixes with 30-day warranty.'
      },
      {
        slug: 'drain-blockage',
        name: 'Drainage & Pipe Blockage Removal',
        url: '/plumber/drain-blockage',
        startingPrice: 349,
        serviceId: 'plumber',
        bannerImage: 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=800&q=80',
        description: 'Heavy-duty steel snake blockage clearing for clogged kitchen sinks, washbasins, bathroom floor traps, and main sewer drain lines in Indore.',
        metaTitle: 'Drain & Sink Blockage Removal in Indore | Heavy Duty Unclogging',
        metaDescription: 'Unclog kitchen sinks, bathroom floor drains, and sewer pipes in Indore without breaking tiles. Fast electric drain snake cleaning with prompt doorstep arrival.'
      },
      {
        slug: 'water-tank-cleaning',
        name: 'Overhead Water Tank & Motor Pump Fitting',
        url: '/plumber/water-tank-cleaning',
        startingPrice: 499,
        serviceId: 'plumber',
        bannerImage: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
        description: 'Overhead water tank deep pressure wash (up to 1000L), automatic water level controller sensor wiring, and booster pump connection.',
        metaTitle: 'Water Tank Cleaning & Motor Pump Fitting in Indore | PlumberIndore',
        metaDescription: 'Overhead water tank deep cleaning and automatic motor pump installation in Indore. Clean, hygienic water supply with prompt doorstep arrival.'
      },
      {
        slug: 'bathroom-fittings',
        name: 'Bathroom Accessory & Shower Fitting',
        url: '/plumber/bathroom-fittings',
        startingPrice: 69,
        serviceId: 'plumber',
        bannerImage: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
        description: 'Overhead shower arm mounting, health faucet installation, towel rods, mirrors, soap holders, and sanitaryware fitting in Indore.',
        metaTitle: 'Bathroom Fitting & Shower Installation in Indore | Sanitaryware Fitting',
        metaDescription: 'Doorstep bathroom fittings and shower installation in Indore. Precision drilling and sanitaryware mounting with genuine hardware.'
      }
    ]
  },
  {
    id: 'electrician',
    slug: 'electrician',
    url: '/electrician',
    title: 'Electrician Services in Indore',
    name: 'Electrician Services',
    shortName: 'Electrician',
    badge: 'Essential',
    iconName: 'PlugZap',
    startingPrice: 149,
    bannerImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80',
    description: 'Certified doorstep electrician services in Indore. Switchboard & power socket repair, ceiling fan installation, decorative light & chandelier mounting, MCB tripping fix, and concealed short circuit fault finding.',
    heroSubtitle: 'Safety First | ITI-Certified Electricians | Prompt Doorstep Service',
    metaTitle: 'Electrician in Indore | Prompt Doorstep Electrical Services | PlumberIndore',
    metaDescription: 'Book certified electricians in Indore. Switchboard socket repair, ceiling fan installation, MCB tripping fix, chandelier mounting & house wiring with prompt doorstep arrival.',
    subcategories: [
      {
        slug: 'switchboard-socket',
        name: 'Switchboard & Power Socket Repair',
        url: '/electrician/switchboard-socket',
        startingPrice: 149,
        serviceId: 'electrician',
        bannerImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
        description: 'Modular switch replacement, 16A/25A heavy appliance power sockets for AC/Geyser, and fan speed regulator repair in Indore.',
        metaTitle: 'Switchboard & Power Socket Repair in Indore | Electrician Services',
        metaDescription: 'Doorstep switchboard and power socket replacement in Indore. Heavy AC/Geyser sockets with genuine copper wiring and 30-day warranty.'
      },
      {
        slug: 'ceiling-fan',
        name: 'Ceiling Fan & Exhaust Fan Repair',
        url: '/electrician/ceiling-fan',
        startingPrice: 199,
        serviceId: 'electrician',
        bannerImage: 'https://images.unsplash.com/photo-1618941709602-92849f611320?auto=format&fit=crop&w=800&q=80',
        description: 'Ceiling fan mounting/uninstallation, motor capacitor replacement, noisy bearing lubrication, and BLDC smart fan installation in Indore.',
        metaTitle: 'Ceiling Fan Installation & Repair in Indore | BLDC & Exhaust Fan Fix',
        metaDescription: 'Ceiling fan installation and capacitor replacement in Indore. Fast doorstep servicing for Havells, Orient, Crompton, and Atomberg fans.'
      },
      {
        slug: 'lights-chandelier',
        name: 'Chandelier & LED Lighting Installation',
        url: '/electrician/lights-chandelier',
        startingPrice: 249,
        serviceId: 'electrician',
        bannerImage: 'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&w=800&q=80',
        description: 'False ceiling LED cob lights, decorative chandelier assembly & balance hanging, wall battens, and cove profile strip lights in Indore.',
        metaTitle: 'Chandelier & LED Light Installation in Indore | False Ceiling Lights',
        metaDescription: 'Chandelier assembly and LED lighting installation in Indore. Safe ceiling anchor fitting and aesthetic wiring with prompt doorstep arrival.'
      },
      {
        slug: 'mcb-db-box',
        name: 'MCB Box & Distribution Panel Repair',
        url: '/electrician/mcb-db-box',
        startingPrice: 399,
        serviceId: 'electrician',
        bannerImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
        description: 'Tripping MCB replacement, main RCCB/ELCB safety breaker installation, and 3-phase distribution panel rewire in Indore.',
        metaTitle: 'MCB Box & RCCB Safety Breaker Repair in Indore | Electrical Panel',
        metaDescription: 'Fix frequently tripping MCBs and install RCCB earth leakage protection in Indore. Professional distribution board wiring overhaul.'
      },
      {
        slug: 'wiring-short-circuit',
        name: 'Home Wiring & Short Circuit Fault Finding',
        url: '/electrician/wiring-short-circuit',
        startingPrice: 499,
        serviceId: 'electrician',
        bannerImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
        description: 'Emergency short circuit diagnosis with digital multimeters, concealed wire continuity testing, and house rewiring in Indore.',
        metaTitle: 'Short Circuit Repair & Home Wiring in Indore | Emergency Electrician',
        metaDescription: 'Emergency short circuit fault finding and concealed copper wiring in Indore. ITI-certified electricians with prompt doorstep arrival.'
      }
    ]
  },
  {
    id: 'pest-control',
    slug: 'pest-control',
    url: '/pest-control',
    title: 'Pest Control Services in Indore',
    name: 'Pest Control Services',
    shortName: 'Pest Control',
    badge: 'Popular',
    iconName: 'Shield',
    startingPrice: 499,
    bannerImage: 'https://images.unsplash.com/photo-1632833239869-a37e3a5806d2?auto=format&fit=crop&w=1200&q=80',
    description: 'Certified doorstep Pest Control services in Indore. 100% odorless herbal cockroach control, anti-termite drill-and-inject wood treatment, bed bugs eradication, and comprehensive home pest shield protection.',
    heroSubtitle: 'Hospital-Grade Sanitization | Odorless & Safe Chemicals | Prompt Doorstep Service',
    metaTitle: 'Pest Control in Indore | Herbal & Odorless Pest Control | PlumberIndore',
    metaDescription: 'Book certified pest control in Indore. Odorless cockroach control, anti-termite wood treatment, bed bugs eradication with up to 45-day warranty and prompt doorstep arrival.',
    subcategories: [
      {
        slug: 'cockroach-ants',
        name: 'Cockroaches, Ants & General Pest Control',
        url: '/pest-control/cockroach-ants',
        startingPrice: 599,
        serviceId: 'pest-control',
        bannerImage: 'https://images.unsplash.com/photo-1632833239869-a37e3a5806d2?auto=format&fit=crop&w=800&q=80',
        description: '100% odorless herbal gel baiting and chemical spray in kitchen cabinets, sink drains, and room skirtings in Indore.',
        metaTitle: 'Cockroach & Ant Pest Control in Indore | Odorless Herbal Gel',
        metaDescription: 'Odorless cockroach and ant pest control in Indore. Safe herbal gel baiting without needing to empty kitchen cabinets.'
      },
      {
        slug: 'bed-bugs',
        name: 'Bed Bugs Intensive Treatment',
        url: '/pest-control/bed-bugs',
        startingPrice: 799,
        serviceId: 'pest-control',
        bannerImage: 'https://images.unsplash.com/photo-1632833239869-a37e3a5806d2?auto=format&fit=crop&w=800&q=80',
        description: 'Two-stage deep chemical spray in mattress seams, wooden bed frames, sofas, and wardrobe crevices in Indore.',
        metaTitle: 'Bed Bug Treatment in Indore | 2-Stage Deep Eradication Spray',
        metaDescription: 'Intensive bed bug pest control in Indore. Complete mattress and furniture spray with guaranteed egg and nymph eradication.'
      },
      {
        slug: 'termite-control',
        name: 'Termite & Wood Borer Control',
        url: '/pest-control/termite-control',
        startingPrice: 999,
        serviceId: 'pest-control',
        bannerImage: 'https://images.unsplash.com/photo-1632833239869-a37e3a5806d2?auto=format&fit=crop&w=800&q=80',
        description: 'Anti-termite drill-and-inject barrier treatment along walls, wooden door frames, and floor boundaries in Indore.',
        metaTitle: 'Termite Control in Indore | Anti-Termite Drilling & Wood Treatment',
        metaDescription: 'Professional termite control in Indore. Drill-and-inject chemical barrier protection for doors, modular kitchens, and foundations.'
      },
      {
        slug: 'full-home-pest-control',
        name: 'Full Home Complete Pest Shield',
        url: '/pest-control/full-home-pest-control',
        startingPrice: 1499,
        serviceId: 'pest-control',
        bannerImage: 'https://images.unsplash.com/photo-1632833239869-a37e3a5806d2?auto=format&fit=crop&w=800&q=80',
        description: 'Comprehensive 360° coverage against cockroaches, termites, bed bugs, ants, and drain flies with a 90-day protection warranty in Indore.',
        metaTitle: 'Full Home Pest Control in Indore | Complete Pest Shield Package',
        metaDescription: 'Total home pest shield in Indore. Complete coverage for all 1BHK, 2BHK, 3BHK flats and villas with 90-day warranty.'
      }
    ]
  },
  {
    id: 'carpenter-paint',
    slug: 'carpenter-paint',
    url: '/carpenter-paint',
    title: 'Carpenter & Painting Services in Indore',
    name: 'Carpenter & Paint',
    shortName: 'Carpenter & Paint',
    badge: 'Trending',
    iconName: 'Hammer',
    startingPrice: 199,
    bannerImage: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
    description: 'Professional doorstep carpenter and painting services in Indore. Door lock replacement, wardrobe hinge repair, furniture assembly, precision hammer drilling, dust-free wall painting, and wall dampness waterproofing.',
    heroSubtitle: 'Master Carpenters & Painters | Mechanized Tools | Prompt Doorstep Service',
    metaTitle: 'Carpenter & Painting in Indore | Prompt Doorstep Service | PlumberIndore',
    metaDescription: 'Book master carpenters and painters in Indore. Door locks, wardrobe hinges, furniture assembly, wall painting & waterproofing with prompt doorstep arrival.',
    subcategories: [
      {
        slug: 'carpenter',
        name: 'Carpenter Services & Woodwork Repair',
        url: '/carpenter-paint/carpenter',
        startingPrice: 199,
        serviceId: 'carpenter',
        bannerImage: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
        description: 'Door lock replacement, hydraulic cupboard hinge alignment, drawer channel repair, bed assembly, and wall drilling in Indore.',
        metaTitle: 'Carpenter in Indore | Door Locks, Hinges & Furniture Repair',
        metaDescription: 'Expert doorstep carpenters in Indore. Door lock repair, wardrobe hinges, drawer channels, and precision drill work with prompt doorstep arrival.'
      },
      {
        slug: 'painting-waterproofing',
        name: 'Home Painting & Wall Waterproofing',
        url: '/carpenter-paint/painting-waterproofing',
        startingPrice: 999,
        serviceId: 'painting-waterproofing',
        bannerImage: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=800&q=80',
        description: 'Dust-free interior painting, wall putty touch-up, and Dr. Fixit / Asian Paints wall dampness (Seelan) barrier waterproofing in Indore.',
        metaTitle: 'Home Painting & Waterproofing in Indore | Asian Paints & Dr Fixit',
        metaDescription: 'Professional house painting and wall dampness waterproofing in Indore. Free doorstep laser measurement and color consultation.'
      },
      {
        slug: 'door-locks',
        name: 'Door Lock & Security Latch Fitting',
        url: '/carpenter-paint/door-locks',
        startingPrice: 199,
        serviceId: 'carpenter',
        bannerImage: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
        description: 'Main door computerized lock replacement, Godrej/Europa rim lock fitting, magnetic door catchers, and handle repairs in Indore.',
        metaTitle: 'Door Lock Replacement & Repair in Indore | Godrej & Europa Locks',
        metaDescription: 'Main door lock replacement and latch fitting in Indore. Master carpenters with genuine security hardware and 30-day warranty.'
      },
      {
        slug: 'furniture-assembly',
        name: 'Furniture Assembly & Dismantling',
        url: '/carpenter-paint/furniture-assembly',
        startingPrice: 399,
        serviceId: 'carpenter',
        bannerImage: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
        description: 'Flat-pack furniture assembly and dismantling for IKEA, Wakefit, Pepperfry, hydraulic beds, and modular wardrobes in Indore.',
        metaTitle: 'Furniture Assembly in Indore | IKEA, Wakefit & Hydraulic Bed Setup',
        metaDescription: 'Professional flat-pack furniture assembly in Indore. Precision setup for beds, wardrobes, and modular study desks with prompt doorstep arrival.'
      },
      {
        slug: 'wall-waterproofing',
        name: 'Wall Dampness (Seelan) & Leakage Fix',
        url: '/carpenter-paint/wall-waterproofing',
        startingPrice: 1499,
        serviceId: 'painting-waterproofing',
        bannerImage: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=800&q=80',
        description: 'Permanent wall dampness treatment, white efflorescence salt barrier, and bathroom wall seepage waterproofing in Indore.',
        metaTitle: 'Wall Dampness (Seelan) Treatment in Indore | Waterproofing Experts',
        metaDescription: 'Permanent wall dampness and peeling paint waterproofing in Indore. Advanced Dr. Fixit chemical barrier coating with up to 1-year warranty.'
      }
    ]
  }
];

export function getCategoryBySlug(slug) {
  if (!slug) return null;
  return MAIN_CATEGORIES.find((cat) => cat.slug === slug || cat.id === slug);
}

export function getSubcategory(categorySlug, serviceSlug) {
  const category = getCategoryBySlug(categorySlug);
  if (!category) return null;
  
  const sub = category.subcategories.find((s) => s.slug === serviceSlug);
  if (!sub) return null;

  // Enrich with full service details from SERVICES_DATA if linked
  const baseService = SERVICES_DATA.find((s) => s.id === sub.serviceId || s.slug === sub.serviceId) || SERVICES_DATA[0];

  return {
    ...sub,
    parentCategory: category,
    packages: baseService.packages || [],
    issues: baseService.issues || [],
    faqs: baseService.faqs || []
  };
}

export function getAllSubcategories() {
  const all = [];
  MAIN_CATEGORIES.forEach((cat) => {
    cat.subcategories.forEach((sub) => {
      all.push({
        categorySlug: cat.slug,
        serviceSlug: sub.slug,
        url: sub.url
      });
    });
  });
  return all;
}

export function getLegacyServiceRedirect(serviceSlug) {
  if (!serviceSlug) return '/services';
  
  for (const cat of MAIN_CATEGORIES) {
    const matchedSub = cat.subcategories.find((sub) => sub.slug === serviceSlug || sub.serviceId === serviceSlug);
    if (matchedSub) {
      return matchedSub.url;
    }
  }

  if (serviceSlug === 'plumber') return '/plumber';
  if (serviceSlug === 'electrician') return '/electrician';
  if (serviceSlug === 'pest-control') return '/pest-control';
  if (serviceSlug === 'carpenter') return '/carpenter-paint/carpenter';
  if (serviceSlug === 'painting-waterproofing') return '/carpenter-paint/painting-waterproofing';

  return `/appliance/${serviceSlug}`;
}
