export const SERVICES_DATA = [
  {
    id: 'ac-repair',
    name: 'AC Repair & Service',
    slug: 'ac-repair',
    iconName: 'Wind',
    badge: 'Popular',
    startingPrice: 399,
    bannerImage: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=800&q=80',
    description: 'Expert doorstep Air Conditioner repair, foam jet servicing, gas leak refill, and installation by certified HVAC technicians across Indore.',
    heroSubtitle: 'Prompt Doorstep Service | 30-Day Warranty | Certified HVAC Pros in Indore',
    packages: [
      { id: 'ac-foam', title: 'Power Foam Jet Service', price: 499, originalPrice: 699, duration: '45 mins', description: 'Deep foam jet cleaning of indoor cooling coils, outdoor condenser unit, drain pipe flush & gas check.' },
      { id: 'ac-gas', title: 'Gas Refill & Leak Fix', price: 1499, originalPrice: 1999, duration: '60 mins', description: 'Nitrogen pressure testing, copper pipe brazing gas leak repair & full R32 / R410 refrigerant charging.' },
      { id: 'ac-repair-diag', title: 'AC Inspection & Diagnostics', price: 299, originalPrice: 499, duration: '30 mins', description: 'Complete electrical, PCB, compressor & cooling checkup. Fee adjusted against final repair bill.' },
      { id: 'ac-install', title: 'Split AC Installation / Uninstallation', price: 999, originalPrice: 1299, duration: '90 mins', description: 'Precision mounting, outdoor bracket installation, vacuuming & copper pipe connectivity.' }
    ],
    issues: [
      { title: 'AC Not Cooling Properly (Warm Air Blow)', startingPrice: 399, cause: 'Heavy dust choking cooling coil, low R32/R410 gas pressure, or faulty run capacitor' },
      { title: 'Water Dripping / Leaking Indoors from AC', startingPrice: 299, cause: 'Choked condensate drain tray, disconnected drain hose, or ice melting from low refrigerant' },
      { title: 'Compressor Tripping & Loud Humming Noise', startingPrice: 499, cause: 'Failed compressor start capacitor, high ambient outdoor temperature, or voltage fluctuation' },
      { title: 'Foul / Musty Odor from AC Vents', startingPrice: 399, cause: 'Bacterial and fungal mold accumulation inside wet evaporator fins and blower fan wheel' },
      { title: 'AC Remote Not Working / Display Error Code (E1/E6/F0)', startingPrice: 299, cause: 'Indoor PCB communication sensor error, thermistor fault, or power surge damage' },
      { title: 'Ice Accumulation on Copper Pipes & Cooling Coil', startingPrice: 499, cause: 'Severe refrigerant gas leakage, restricted airflow due to dirty air filter, or expansion valve block' }
    ],
    faqs: [
      { q: 'Is there a warranty on AC repair in Indore?', a: 'Yes, PlumberIndore provides an official 30-day post-service warranty on all repairs and a 60-day warranty on gas refill services.' },
      { q: 'How fast can a technician reach my home in Vijay Nagar or Palasia?', a: 'Our assigned local technician reaches your doorstep promptly upon booking confirmation across all Indore sectors.' },
      { q: 'Do you service inverter ACs from Daikin, Voltas, LG, and Hitachi?', a: 'Yes, our technicians are certified for all inverter split and window AC brands with genuine OEM PCB boards and copper spares.' },
      { q: 'What is the difference between normal water cleaning and Power Foam Jet service?', a: 'Power Foam Jet uses high-pressure water guns and antibacterial foam that cuts through deeply embedded grease without bending delicate aluminum coil fins.' },
      { q: 'How do you check for gas leaks before refilling refrigerant?', a: 'We inject 150+ PSI dry nitrogen pressure, test all copper joints with soap bubble solution, braze pinholes with silver solder, and vacuum lines before charging gas.' },
      { q: 'What payment methods do you accept after AC servicing?', a: 'You can pay securely after inspecting the cooling fix via UPI (GPay, PhonePe, Paytm), Cash, or online Cards with an instant GST tax invoice.' }
    ]
  },
  {
    id: 'plumber',
    name: 'Plumber Services',
    slug: 'plumber',
    iconName: 'Wrench',
    badge: 'Essential',
    startingPrice: 149,
    bannerImage: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80',
    description: 'Expert doorstep plumbing services in Indore. Tap & mixer repair, toilet flush tank fix, sink & floor drain blockage removal, water tank installation, and bathroom fittings.',
    heroSubtitle: 'Expert Plumbers | Leakage & Blockage Specialists | Prompt Doorstep Service',
    packages: [
      { id: 'plm-tap', title: 'Tap, Nozzle & Wall Mixer Repair', price: 149, originalPrice: 249, duration: '30 mins', description: 'Fixing dripping taps, ceramic spindle change, washer replacement, and single lever basin mixer repair.' },
      { id: 'plm-toilet', title: 'Toilet & Flush Tank Service', price: 199, originalPrice: 299, duration: '30 mins', description: 'Cistern syphon repair, flush button change, jet spray fitting, and Western/Indian commode leak fix.' },
      { id: 'plm-drain', title: 'Drainage & Pipe Blockage Removal', price: 349, originalPrice: 499, duration: '45 mins', description: 'Heavy-duty drain snake blockage cleaning for clogged kitchen sinks, washbasins, and bathroom floor traps.' },
      { id: 'plm-tank', title: 'Water Tank & Motor Pump Fitting', price: 499, originalPrice: 799, duration: '60 mins', description: 'Overhead water tank deep cleaning (up to 1000L), automatic water level controller fitting, and pump connection.' },
      { id: 'plm-fittings', title: 'Bathroom Accessory & Shower Fitting', price: 299, originalPrice: 449, duration: '45 mins', description: 'Overhead shower arm replacement, towel rod, mirror, soap holder, and health faucet installation.' }
    ],
    issues: [
      { title: 'Dripping Tap / Wall Mixer Leakage', startingPrice: 149, cause: 'Worn out ceramic spindle, damaged rubber washer gasket, or hard water scale corrosion' },
      { title: 'Continuous Water Overflow in Toilet Flush Tank', startingPrice: 199, cause: 'Faulty syphon valve, damaged inlet float valve, or loose flapper seal' },
      { title: 'Choked Kitchen Sink / Slow Bathroom Drain', startingPrice: 349, cause: 'Accumulated cooking oil grease, food debris, hair tangles, or floor trap blockage' },
      { title: 'Low Water Pressure in Overhead Shower & Taps', startingPrice: 199, cause: 'Mineral limescale choking shower nozzles, blocked aerators, or air lock in terrace pipe line' },
      { title: 'Concealed Wall Seepage & Joint Leaks', startingPrice: 499, cause: 'Cracked CPVC/UPVC pipe elbows, solvent joint loosening, or bathroom tile grout failure' },
      { title: 'Water Motor / Submersible Pump Not Lifting Water', startingPrice: 349, cause: 'Dry run air lock in suction line, worn check foot valve, or damaged impeller seal' }
    ],
    faqs: [
      { q: 'How quickly can a plumber reach Vijay Nagar, Palasia, or Rau?', a: 'Our assigned plumber reaches your home promptly upon booking confirmation across all Indore sectors.' },
      { q: 'Do you bring spare parts like ceramic spindles, washers, and flush valves?', a: 'Yes, our plumbers carry 100% genuine spares compatible with Jaquar, Hindware, Cera, Kohler, and Parryware.' },
      { q: 'Is there a warranty on plumbing repairs?', a: 'Yes, PlumberIndore provides a 30-day post-service warranty on all fittings, blockages, and pipe repairs.' },
      { q: 'What if the plumber inspects but I decide not to do the repair?', a: 'You only pay a nominal doorstep inspection fee of ₹149, which is 100% adjusted if you approve the repair work.' },
      { q: 'Can you unclog severely blocked drain pipes without breaking tiles?', a: 'Yes, we use professional electric drain snake machinery and high-pressure jet rodding that clears clogs without damaging bathroom flooring.' },
      { q: 'Do you install automatic water motor controllers on overhead tanks?', a: 'Yes, we supply and wire fully automatic magnetic sensor controllers that switch on/off motors to prevent terrace overflow.' }
    ]
  },
  {
    id: 'electrician',
    name: 'Electrician Services',
    slug: 'electrician',
    iconName: 'PlugZap',
    badge: 'Essential',
    startingPrice: 149,
    bannerImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
    description: 'Certified doorstep electrician services in Indore. Switchboard & socket repair, ceiling fan installation, light & chandelier mounting, MCB tripping fix, and short circuit fault finding.',
    heroSubtitle: 'Safety First | ITI-Certified Electricians | Prompt Doorstep Service',
    packages: [
      { id: 'elec-switch', title: 'Switchboard & Power Socket Repair', price: 149, originalPrice: 249, duration: '30 mins', description: 'Modular switch replacement, 16A heavy power socket fitting for AC/Geyser, and fan speed regulator fix.' },
      { id: 'elec-fan', title: 'Ceiling Fan & Wall Fan Repair', price: 199, originalPrice: 299, duration: '30 mins', description: 'Ceiling fan installation/uninstallation, motor capacitor change, noisy bearing greasing, and exhaust fan fitting.' },
      { id: 'elec-light', title: 'Lights & Chandelier Installation', price: 249, originalPrice: 399, duration: '45 mins', description: 'False ceiling LED cob light fitting, decorative tube light/batten mounting, and chandelier assembly.' },
      { id: 'elec-mcb', title: 'MCB & Distribution Box Safety', price: 399, originalPrice: 599, duration: '45 mins', description: 'Tripping MCB replacement, main RCCB/ELCB safety breaker installation, and 3-phase DB box wiring overhaul.' },
      { id: 'elec-wiring', title: 'Home Wiring & Short Circuit Fix', price: 499, originalPrice: 799, duration: '60 mins', description: 'Emergency short circuit fault finding with digital multimeter, open casing/concealed copper wiring, and earthing test.' }
    ],
    issues: [
      { title: 'Switchboard Sparking & Burning Smell', startingPrice: 149, cause: 'Loose wire termination, overloaded circuit socket, or internal carbon accumulation' },
      { title: 'Ceiling Fan Rotating Slowly / Humming Sound', startingPrice: 199, cause: 'Weak 2.25/2.5 MFD motor capacitor, dry ball bearings, or burnt auxiliary winding' },
      { title: 'Main MCB / RCCB Continuously Tripping', startingPrice: 399, cause: 'Earth leakage fault in home wiring, shorted appliance element, or overloaded circuit breaker' },
      { title: 'Total Power Failure in a Single Room', startingPrice: 299, cause: 'Phase wire disconnection inside concealed conduit, burnt junction box wire cap, or neutral line break' },
      { title: 'Flickering LED Lights & Voltage Drop', startingPrice: 199, cause: 'Loose neutral return wire, faulty LED driver choke, or low line voltage from transformer' },
      { title: 'Mild Electric Shock from Geyser, Refrigerator, or Taps', startingPrice: 349, cause: 'Broken earth pit electrode, missing ground wire continuity, or high earthing resistance' }
    ],
    faqs: [
      { q: 'Are your electricians certified for high-voltage short circuit fixes?', a: 'Yes, all our electricians are ITI-certified technicians carrying digital multimeters, insulation testers, and insulated safety tools.' },
      { q: 'Do you install heavy 16A/25A sockets for ACs and Geysers in Indore?', a: 'Yes, we fit heavy-duty modular sockets with 2.5mm/4mm Finolex/Havells copper wiring and independent earth lines.' },
      { q: 'How fast can an electrician reach my home in Indore?', a: 'Our electrician arrives at your doorstep in Vijay Nagar, Palasia, Bhanwarkuan, or any Indore location promptly.' },
      { q: 'Is there a warranty on electrical installations?', a: 'Yes, PlumberIndore offers a 30-day doorstep warranty on all switch, socket, fan, light, and MCB installations.' },
      { q: 'Can you trace short circuits hidden inside walls?', a: 'Yes, we use digital continuity and insulation resistance testers to locate concealed cable faults without breaking open entire walls.' },
      { q: 'Do you assemble heavy decorative chandeliers and smart ceiling fans?', a: 'Yes, we assemble, balance, and safely hang chandeliers, smart BLDC fans, and false ceiling profile strip lights.' }
    ]
  },
  {
    id: 'pest-control',
    name: 'Pest Control Services',
    slug: 'pest-control',
    iconName: 'Shield',
    badge: 'Popular',
    startingPrice: 499,
    bannerImage: 'https://images.unsplash.com/photo-1632833239869-a37e3a5806d2?auto=format&fit=crop&w=800&q=80',
    description: 'Certified doorstep Pest Control services in Indore. Odorless herbal cockroach control, anti-termite wood treatment, bed bugs eradication, and mosquito/ant control.',
    heroSubtitle: 'Hospital-Grade Sanitization | Odorless Pest Control | Prompt Doorstep Service',
    packages: [
      { id: 'pest-cockroach', title: 'Cockroaches, Ants & General Pest Control', price: 599, originalPrice: 899, duration: '45 mins', description: '100% odorless herbal gel baiting and chemical spray in kitchen, cabinets, drain holes & rooms.' },
      { id: 'pest-bedbugs', title: 'Bed Bugs Intensive Treatment', price: 799, originalPrice: 1199, duration: '60 mins', description: 'Two-stage deep chemical spray in mattress seams, bed frames, sofas, and wardrobe crevices.' },
      { id: 'pest-termite', title: 'Termite & Wood Borer Control', price: 999, originalPrice: 1499, duration: '90 mins', description: 'Anti-termite chemical drilling, wall-wood boundary treatment, and persistent barrier creation.' },
      { id: 'pest-full', title: 'Full Home Complete Pest Shield', price: 1499, originalPrice: 2199, duration: '120 mins', description: 'Comprehensive coverage against cockroaches, termites, bed bugs, ants, and drain pests with 90-day protection.' }
    ],
    issues: [
      { title: 'Cockroach Colony Behind Kitchen Appliances & Sinks', startingPrice: 599, cause: 'Warmth from refrigerator/microwave motors, grease accumulation, and moist drain pipe crevices' },
      { title: 'Bed Bug Bites & Mattress Seam Infestation', startingPrice: 799, cause: 'Bed bug nesting inside wooden headboards, mattress pleats, and luggage cross-contamination' },
      { title: 'Termite Mud Tubes & Hollow Wood Damage', startingPrice: 999, cause: 'Subterranean termites penetrating wall foundations and consuming wooden door frames/wardrobes' },
      { title: 'Red & Black Ants Crawling on Kitchen Slabs', startingPrice: 499, cause: 'Sugar trails, cracks in tile grouting, and hidden ant nests inside switchboards or walls' },
      { title: 'Drain Flies & Mosquitoes Breeding in Washrooms', startingPrice: 499, cause: 'Stagnant water sludge in floor drain P-traps, unsealed utility pipes, and terrace drain blockages' },
      { title: 'Wood Borers / Yellow Powder Falling from Furniture', startingPrice: 799, cause: 'Wood borer larvae boring microscopic exit holes and turning solid timber into fine wood dust' }
    ],
    faqs: [
      { q: 'Are your pest control chemicals safe for children, seniors, and pets?', a: 'Yes, we use odorless Bayer / herbal government-approved gel baits and safe synthetic pyrethroids that require no evacuation.' },
      { q: 'Is there a warranty on pest control treatments?', a: 'Yes, PlumberIndore provides up to 45-day warranty with a 100% free re-treatment if pests reappear in the treated areas.' },
      { q: 'Do I need to empty kitchen cabinets before cockroach treatment?', a: 'No, our advanced odorless gel dot application is placed precisely in corners and hinges without having to empty utensils.' },
      { q: 'How many sessions are required for complete bed bug elimination?', a: 'Bed bugs require a 2-stage chemical treatment spaced 12-15 days apart to destroy newly hatched nymphs and unhatched eggs.' },
      { q: 'How does drill-and-inject anti-termite treatment work?', a: 'We drill tiny 12mm holes along the wall-floor perimeter and door frames, pump anti-termite emulsion (Imidacloprid), and seal holes with matching white cement.' },
      { q: 'How quickly can your pest control team reach my area in Indore?', a: 'Our certified pest technicians arrive with sanitized spray equipment promptly across all Indore sectors.' }
    ]
  },
  {
    id: 'washing-machine',
    name: 'Washing Machine Repair',
    slug: 'washing-machine',
    iconName: 'Shirt',
    badge: 'Trending',
    startingPrice: 349,
    bannerImage: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=800&q=80',
    description: 'Top load, front load, and semi-automatic washing machine repair at your doorstep in Indore.',
    heroSubtitle: 'Drum & Motor Specialists | Genuine Spares | Doorstep Inspection',
    packages: [
      { id: 'wm-descaling', title: 'Deep Descaling & Drum Service', price: 499, originalPrice: 699, duration: '45 mins', description: 'Complete drum descaling, inlet filter cleaning, and vibration dampening adjustment.' },
      { id: 'wm-motor', title: 'Motor & Belt Repair', price: 799, originalPrice: 1099, duration: '60 mins', description: 'Drive belt replacement, gear box repair, and PCB error code resolution.' },
      { id: 'wm-drain', title: 'Drain Pump & Water Inlet Valve Fix', price: 399, originalPrice: 599, duration: '30 mins', description: 'Clogged drain pump cleaning, solenoid inlet valve replacement & pipe leak fix.' }
    ],
    issues: [
      { title: 'Severe Vibration, Banging Noise & Shaking During Spin', startingPrice: 349, cause: 'Worn-out drum spider bracket, broken suspension damper shock absorbers, or unbalanced legs' },
      { title: 'Water Not Draining / Drain Error (OE, 5E, E20)', startingPrice: 299, cause: 'Coins/lint choking drain pump filter, jammed impeller, or faulty drain motor assembly' },
      { title: 'Machine Not Filling Water / Inlet Error (IE, 4E, E10)', startingPrice: 299, cause: 'Hard water scale clogging inlet mesh, defective 220V solenoid valve, or low household water pressure' },
      { title: 'Drum Not Rotating but Motor Humming', startingPrice: 349, cause: 'Slipped or snapped drive belt, worn motor carbon brushes, or capacitor failure in semi-automatic units' },
      { title: 'Door Locked / Error dE & Won’t Open', startingPrice: 349, cause: 'Faulty thermal PTC door interlock switch, broken handle latch, or uncompleted drain cycle' },
      { title: 'Machine Tripping MCB as Soon as Power Turned On', startingPrice: 399, cause: 'Short circuit in internal water heating element, wire insulation rub-through, or burnt main PCB circuit' }
    ],
    faqs: [
      { q: 'Do you repair front load and top load machines from IFB, Bosch, LG, and Samsung?', a: 'Yes, our technicians specialize in inverter direct drive (DD) and belt drive models from all major brands with genuine OEM spares.' },
      { q: 'How fast can you replace noisy drum bearings in Indore?', a: 'We inspect on the spot and replace worn bearings and oil seals at your home within 2-3 hours.' },
      { q: 'Is there a warranty on washing machine repairs?', a: 'Yes, all replacement components including drain pumps, inlet valves, belts, and motors carry a 30-day PlumberIndore warranty.' },
      { q: 'Why does my washing machine show error codes like OE or IE?', a: 'OE means drain failure (often choked pump filter) and IE means water filling timeout (blocked inlet valve). Our technician resolves these in 30 mins.' },
      { q: 'What is drum descaling and why is it essential in Indore?', a: 'Indore hard water causes mineral scale buildup inside the outer drum, which strains the motor and soils clothes. Descaling restores factory efficiency.' },
      { q: 'Can you repair inverter motherboard PCB circuits on the spot?', a: 'Yes, our electronic repair engineers diagnose microcontrollers, relays, and capacitors with mobile SMD rework tools.' }
    ]
  },
  {
    id: 'refrigerator',
    name: 'Refrigerator Repair',
    slug: 'refrigerator',
    iconName: 'Refrigerator',
    badge: 'High Demand',
    startingPrice: 299,
    bannerImage: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=800&q=80',
    description: 'Expert single door, double door, and side-by-side refrigerator repair services in Indore.',
    heroSubtitle: 'Same-Day Cooling Repair | Original Spare Parts | Doorstep Service',
    packages: [
      { id: 'ref-gas', title: 'Compressor & Gas Charging', price: 1299, originalPrice: 1699, duration: '60 mins', description: 'Eco-friendly R600a/R134a gas charging, filter drier replacement, and copper pipe sealing.' },
      { id: 'ref-defrost', title: 'Defrost & Thermostat Repair', price: 499, originalPrice: 699, duration: '45 mins', description: 'Fixing ice buildup, defrost timer/heater issues, and temperature sensor replacement.' },
      { id: 'ref-pcb', title: 'Inverter Fridge PCB Board Repair', price: 799, originalPrice: 1199, duration: '60 mins', description: 'Micro-controller diagnostics, capacitor replacement, and power supply circuit repair.' }
    ],
    issues: [
      { title: 'Freezer Working but Lower Fridge Compartment Warm', startingPrice: 299, cause: 'Frost buildup blocking air damper duct, failed defrost bimetal sensor, or broken evaporator fan motor' },
      { title: 'Complete Loss of Cooling & Compressor Not Starting', startingPrice: 349, cause: 'Burnt PTC starter relay/overload protector, faulty inverter driver PCB, or low R600a/R134a refrigerant' },
      { title: 'Excessive Ice Buildup (Freezer Snow Storm)', startingPrice: 349, cause: 'Burned defrost heating element, stuck mechanical defrost timer, or cracked magnetic door gasket seal' },
      { title: 'Water Leaking on Kitchen Floor from Bottom of Fridge', startingPrice: 299, cause: 'Choked defrost drain hole, cracked rear evaporation drain pan, or dislodged condensation tube' },
      { title: 'Loud Rattling / Vibrating Noise from Back', startingPrice: 299, cause: 'Loose compressor rubber grommets, noisy condenser cooling fan blade, or vibrating copper capillary tube' },
      { title: 'Fridge Body Giving Mild Electrical Current / Shocks', startingPrice: 349, cause: 'Internal insulation breakdown in defrost heater, missing earthing in 3-pin plug, or pinched wiring harness' }
    ],
    faqs: [
      { q: 'Do you repair double door, side-by-side, and inverter refrigerators in Indore?', a: 'Yes, we service single door, frost-free double door, French door, and smart inverter refrigerators from LG, Samsung, Whirlpool, Haier, Godrej, and Bosch.' },
      { q: 'What refrigerant gas do you use for fridge charging?', a: 'We use genuine, eco-friendly R600a and R134a refrigerants with nitrogen pressure testing and filter-drier replacement.' },
      { q: 'How quickly can a fridge repair technician reach my home?', a: 'Our refrigerator technicians arrive promptly across Vijay Nagar, Palasia, Bhanwarkuan, and all Indore areas.' },
      { q: 'Is there a warranty on compressor relay and gas charging?', a: 'Yes, PlumberIndore offers a 30-day warranty on electrical parts and a 60-day warranty on refrigerator gas charging.' },
      { q: 'Why is my fridge cooling in the freezer but not downstairs?', a: 'This is the classic defrost failure where ice blocks the cold air passage to the bottom cabin. We diagnose and fix it right at your home.' },
      { q: 'Can you replace torn magnetic rubber door gaskets?', a: 'Yes, we supply and fit brand-specific food-grade magnetic door gaskets to restore airtight sealing and save electricity.' }
    ]
  },
  {
    id: 'ro-purifier',
    name: 'RO Purifier Repair',
    slug: 'ro-purifier',
    iconName: 'Droplets',
    badge: 'Popular',
    startingPrice: 299,
    bannerImage: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4e?auto=format&fit=crop&w=800&q=80',
    description: 'RO water purifier filter change, membrane replacement, and TDS balancing in Indore.',
    heroSubtitle: '100% Pure Drinking Water | Authentic Membrane & Carbon Filters',
    packages: [
      { id: 'ro-service', title: 'Complete Filter Kit Service', price: 799, originalPrice: 1199, duration: '45 mins', description: 'Pre-filter, sediment filter, activated carbon, and post-carbon filter replacement.' },
      { id: 'ro-membrane', title: 'RO Membrane & Pump Replacement', price: 1299, originalPrice: 1799, duration: '60 mins', description: 'High TDS 80 GPD Filmtec/CSM membrane installation and booster pump pressure test.' }
    ],
    issues: [
      { title: 'Bad Water Taste, Odor, or High TDS Output', startingPrice: 299, cause: 'Exhausted RO membrane pores, choked activated carbon filter, or bypass valve leakage' },
      { title: 'RO Machine Not Powering On / No Light Indicator', startingPrice: 299, cause: 'Blown 24V/36V SMPS power adapter, loose float switch connection, or low water pressure cutout' },
      { title: 'Water Constantly Flowing to Reject Drain Pipe', startingPrice: 299, cause: 'Defective solenoid valve (SV) stuck open, choked pre-filter, or malfunctioning auto-shut-off valve' },
      { title: 'Pure Water Flow Extremely Slow (Thin Trickle)', startingPrice: 299, cause: 'Clogged spun sediment filter, depleted booster pump pressure (below 60 PSI), or scaled membrane' },
      { title: 'Water Leaking from Purifier Body or Push-Fit Elbows', startingPrice: 199, cause: 'Cracked filter housing bowl, loose O-ring seal, or burst 1/4 inch food-grade PE pipe' },
      { title: 'Vibrating Loud Humming Sound from RO Booster Pump', startingPrice: 349, cause: 'Worn pump head diaphragm, air lock inside pump chamber, or low water inlet supply' }
    ],
    faqs: [
      { q: 'What should be the ideal drinking water TDS in Indore?', a: 'For healthy drinking water with natural essential minerals, our technician balances TDS between 80 to 150 ppm using a digital calibrated meter.' },
      { q: 'Do you service Kent, Aquaguard, Pureit, and Livpure RO systems?', a: 'Yes, we service all standard and smart RO+UV+UF+Alkaline water purifiers with 100% authentic filter components.' },
      { q: 'How often should RO pre-filter and sediment filters be replaced in Indore?', a: 'Due to groundwater hardness in areas like Rau and Nipania, pre-filters should be replaced every 3-6 months and membranes every 12-18 months.' },
      { q: 'Do you carry high-TDS RO membranes?', a: 'Yes, we supply genuine 80/100 GPD Filmtec, CSM, and Vontron membranes capable of purifying water up to 2500+ ppm TDS.' },
      { q: 'Is there a warranty on RO service and membrane replacement?', a: 'Yes, PlumberIndore provides a 30-day doorstep warranty on service and up to 6-month warranty on original RO membranes.' },
      { q: 'Can you install an Alkaline Mineral Booster cartridge?', a: 'Yes, we add natural mineralizer cartridges that enrich purified water with calcium, magnesium, and healthy alkaline pH (7.5-8.5).' }
    ]
  },
  {
    id: 'geyser',
    name: 'Geyser Repair',
    slug: 'geyser',
    iconName: 'Flame',
    startingPrice: 299,
    bannerImage: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    description: 'Electric and gas geyser repair, heating element replacement, and safety valve fitting in Indore.',
    heroSubtitle: 'Safe & Instant Heating Fix | Thermostat & Element Specialists',
    packages: [
      { id: 'gys-element', title: 'Heating Element & Thermostat Replacement', price: 599, originalPrice: 899, duration: '45 mins', description: 'Heavy-duty copper heating element installation with safety thermostat testing.' },
      { id: 'gys-install', title: 'Geyser Installation / Uninstallation', price: 399, originalPrice: 599, duration: '45 mins', description: 'Wall mounting with heavy fastener anchors, inlet-outlet connection & earthing verification.' }
    ],
    issues: [
      { title: 'Geyser Water Not Heating at All', startingPrice: 299, cause: 'Burnt 2kW/3kW copper heating element, open thermal fuse, or tripped manual reset thermostat' },
      { title: 'Geyser Tripping MCB as Soon as Switched On', startingPrice: 349, cause: 'Heating element insulation puncture causing direct live-to-water earth leakage fault' },
      { title: 'Water Leaking from Geyser Bottom / Safety Valve', startingPrice: 299, cause: 'Excess pressure buildup in tank, corroded heating element flange gasket, or faulty pressure relief valve' },
      { title: 'Water Taking Extremely Long to Heat', startingPrice: 299, cause: 'Thick hard water limescale coating around heating coil or decalibrated capillary thermostat' },
      { title: 'Burning Electrical Smell or Sparks Near Geyser Plug', startingPrice: 199, cause: 'Melted 16A top plug, loose terminal block screws, or undersized power cable' },
      { title: 'Rust-Colored / Scaled Water Coming from Hot Tap', startingPrice: 299, cause: 'Depleted sacrificial magnesium anode rod or inner tank enamel corrosion' }
    ],
    faqs: [
      { q: 'Do you repair Bajaj, Havells, Racold, AO Smith, and Venus geysers?', a: 'Yes, our technicians carry genuine elements, thermostats, and multi-function safety valves for all 5L, 10L, 15L, and 25L geyser brands.' },
      { q: 'Is it safe to use a geyser that gives minor electric shocks?', a: 'NO! Turn off the geyser switch immediately. This indicates a ruptured heating element or broken ground wire. Call us for instant emergency repair.' },
      { q: 'How fast can a geyser technician reach my home in Indore?', a: 'Our geyser specialist reaches your doorstep promptly across all Indore localities.' },
      { q: 'Do you use heavy-duty copper heating elements with warranty?', a: 'Yes, we install ISI-certified heavy copper or glass-coated incoloy elements backed by a 30-day doorstep warranty.' },
      { q: 'Why is water dripping continuously from the small side valve?', a: 'That is the pressure release valve. In high-rise apartments with booster pumps, excess tank pressure vents through it. We test and adjust line pressure.' },
      { q: 'Do you install new geysers on tiled bathroom walls?', a: 'Yes, we use precision hammer drills, heavy expansion anchors, stainless steel flexible connection braided pipes, and ensure zero tile cracks.' }
    ]
  },
  {
    id: 'microwave',
    name: 'Microwave Repair',
    slug: 'microwave',
    iconName: 'Microwave',
    startingPrice: 299,
    bannerImage: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=800&q=80',
    description: 'Solo, Grill, and Convection microwave repair. Magnetron and touch panel fixes.',
    heroSubtitle: 'Magnetron & High-Voltage Repair | Doorlock & Touch Panel Fixes',
    packages: [
      { id: 'mw-heat', title: 'Heating & Magnetron Repair', price: 699, originalPrice: 999, duration: '45 mins', description: 'High-voltage diode, capacitor & magnetron diagnostic and replacement.' },
      { id: 'mw-touch', title: 'Touchpad & PCB Repair', price: 499, originalPrice: 799, duration: '45 mins', description: 'Membrane keypad replacement, display circuit repair & door switch alignment.' }
    ],
    issues: [
      { title: 'Glass Turntable Plate Rotating but Food Completely Cold', startingPrice: 299, cause: 'Burnt magnetron emission tube, blown high-voltage fuse (5KV), or failed high-voltage diode/capacitor' },
      { title: 'Sparks and Crackling Fire Inside Microwave Cavity', startingPrice: 299, cause: 'Burnt or carbonized mica waveguide cover sheet, peeling internal enamel paint, or metal rack arcing' },
      { title: 'Touch Keypad Buttons Not Responding / Error Codes', startingPrice: 349, cause: 'Damaged flexible membrane keypad ribbon, moisture intrusion, or main microcontroller PCB fault' },
      { title: 'Microwave Trips Main MCB When Start Button Pressed', startingPrice: 349, cause: 'Defective primary/secondary micro door safety interlock switch or shorted high-voltage transformer' },
      { title: 'Glass Plate Not Spinning / Jerking Unevenly', startingPrice: 249, cause: 'Burnt synchronous turntable motor (21V/220V), broken plastic roller ring, or cracked drive coupling' },
      { title: 'Loud Buzzing / Humming Noise During Operation', startingPrice: 299, cause: 'Failing cooling fan motor, vibrating transformer core laminations, or failing high-voltage capacitor' }
    ],
    faqs: [
      { q: 'Do you repair Convection, Grill, and Solo microwaves in Indore?', a: 'Yes, we service Samsung, LG, IFB, Panasonic, Whirlpool, Godrej, and Morphy Richards microwaves on site at your home.' },
      { q: 'Is it safe to repair high-voltage microwave components at home?', a: 'Yes, our certified technicians carry professional high-voltage discharge probes and safety gear to safely replace parts on site.' },
      { q: 'Why does my microwave spark when turned on?', a: 'Sparks are almost always caused by a burnt mica sheet covered in food splatter. We replace it with fresh heat-resistant mica in 15 minutes.' },
      { q: 'Is there a warranty on magnetron and touch panel replacements?', a: 'Yes, all replacement magnetrons, diodes, touchpads, and PCB boards carry a 30-day PlumberIndore warranty.' },
      { q: 'How quickly can a microwave technician reach my home in Indore?', a: 'Our doorstep technician arrives promptly across all residential sectors of Indore.' },
      { q: 'Can you repair a microwave whose door latch is broken?', a: 'Yes, we carry genuine brand door hooks, spring latches, and safety interlock switches.' }
    ]
  },
  {
    id: 'kitchen-chimney',
    name: 'Kitchen Chimney Repair',
    slug: 'kitchen-chimney',
    iconName: 'UtensilsCrossed',
    startingPrice: 399,
    bannerImage: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
    description: 'Deep degreasing, baffle filter washing, motor repair, and ducting installation in Indore.',
    heroSubtitle: 'High Suction Restored | Baffle & Mesh Cleaning | Motor Repair',
    packages: [
      { id: 'chm-clean', title: 'Deep Degreasing Service', price: 599, originalPrice: 899, duration: '60 mins', description: 'Chemical degreasing of blower, motor housing, and baffle filters.' },
      { id: 'chm-motor', title: 'Chimney Motor & Duct Pipe Fix', price: 699, originalPrice: 999, duration: '60 mins', description: 'Heavy suction motor capacitor fix, noise reduction, and flexible duct pipe installation.' }
    ],
    issues: [
      { title: 'Poor Suction / Smoke & Oil Vapor Not Clearing', startingPrice: 399, cause: 'Baffle filters and blower rotor blades clogged with hardened cooking grease, or choked duct pipe' },
      { title: 'Loud Rattling / Excessive Vibrating Sound from Motor', startingPrice: 399, cause: 'Unbalanced blower wheel due to uneven oil accumulation, dry motor bearings, or loose wall mount' },
      { title: 'Oil Dripping from Chimney Body onto Kitchen Stove', startingPrice: 299, cause: 'Full or misaligned oil collector tray, grease saturation inside inner housing, or missing seal tape' },
      { title: 'Touch Control / Auto-Clean Motion Sensor Not Working', startingPrice: 349, cause: 'Oil film coating optical sensor window, PCB relay failure, or burnt capacitor on auto-clean heating pad' },
      { title: 'Chimney Halogen / LED Lamps Not Glowing', startingPrice: 199, cause: 'Blown 12V LED driver transformer, damaged lamp socket, or touch panel switch contact fault' },
      { title: 'Flexible Aluminum Duct Pipe Torn or Crushed', startingPrice: 349, cause: 'Rodent damage, bird nesting in exterior louver, or grease degradation in foil ducting' }
    ],
    faqs: [
      { q: 'Do you service Faber, Elica, Glen, Hindware, and Kaff chimneys in Indore?', a: 'Yes, our technicians are trained in filterless, baffle filter, curved glass, and island chimneys from all leading brands.' },
      { q: 'How does your chimney deep degreasing service work?', a: 'We dismantle the outer housing, soak baffle filters in specialized non-corrosive chemical baths, and pressure-clean the blower rotor.' },
      { q: 'How often should a kitchen chimney be serviced in Indian cooking?', a: 'For regular Indian cooking with spices and frying, we recommend deep degreasing every 4 to 6 months to maintain peak motor suction.' },
      { q: 'Can you install anti-bird cowl caps on the exterior duct outlet?', a: 'Yes, we supply and install heavy PVC and stainless steel anti-bird louvers that prevent pigeons and rain from entering ducts.' },
      { q: 'Is there a warranty on chimney motor and PCB repairs?', a: 'Yes, PlumberIndore provides an official 30-day doorstep warranty on all motor, capacitor, and PCB board fixes.' },
      { q: 'How fast can a chimney technician arrive at my home in Indore?', a: 'Our technician reaches your home promptly across Vijay Nagar, Palasia, Sudama Nagar, and all Indore hubs.' }
    ]
  },
  {
    id: 'air-cooler',
    name: 'Air Cooler Repair',
    slug: 'air-cooler',
    iconName: 'Fan',
    startingPrice: 199,
    bannerImage: 'https://images.unsplash.com/photo-1618941709602-92849f611320?auto=format&fit=crop&w=800&q=80',
    description: 'Honey-comb pad replacement, water pump repair, and motor rewinding for all cooler types.',
    heroSubtitle: 'Quick Summer Servicing | Pump & Motor Repair | Original Honeycomb Pads',
    packages: [
      { id: 'clr-full', title: 'Complete Cooler Overhaul & Tank Clean', price: 299, originalPrice: 449, duration: '30 mins', description: 'Tank descaling, motor lubrication, fan blade balancing, and water distribution check.' },
      { id: 'clr-pump', title: 'Submersible Water Pump Replacement', price: 249, originalPrice: 399, duration: '30 mins', description: 'High-lift submersible pump installation with anti-rust wiring.' }
    ],
    issues: [
      { title: 'Submersible Water Pump Not Working / No Water on Pads', startingPrice: 199, cause: 'Burned 18W/25W pump motor winding, limescale jamming impeller rotor, or broken supply wire' },
      { title: 'Cooler Fan Motor Humming but Blade Not Spinning', startingPrice: 199, cause: 'Weak 3.15/4 MFD motor capacitor, dry copper bush bearing, or jammed motor shaft' },
      { title: 'Unpleasant Foul / Fishy Smell from Cooler Air', startingPrice: 249, cause: 'Algae growth in old honeycomb pads, stagnant water bacterial slime in bottom tank, or dust clogging' },
      { title: 'Water Splashing Out of Front Grille with Air', startingPrice: 199, cause: 'Over-flooded water distributor channel, misaligned side pad frame, or high fan speed turbulence' },
      { title: 'Air Cooler Giving Mild Electric Shock on Body', startingPrice: 249, cause: 'Water pump short circuit, missing ground earthing, or uninsulated wire touching wet plastic body' },
      { title: 'Swing Louvers Not Oscillating Left & Right', startingPrice: 199, cause: 'Broken 4W synchronous swing motor gear, cracked connector linkage arm, or switch fault' }
    ],
    faqs: [
      { q: 'Do you replace original honeycomb cooling pads for Symphony, Kenstar, and Bajaj?', a: 'Yes, we supply high-density 5090/7090 original cellulose honeycomb pads with antimicrobial coating for all cooler sizes.' },
      { q: 'How fast can you replace a burned cooler pump in Indore summers?', a: 'Our technician reaches your home promptly with fresh submersible pumps and tests water flow on the spot.' },
      { q: 'Is there a warranty on air cooler repair and pump replacement?', a: 'Yes, PlumberIndore offers a 30-day warranty on all cooler pump, motor, and capacitor replacements.' },
      { q: 'Can you service large commercial desert coolers and metal coolers in Indore?', a: 'Yes, we repair heavy-duty Crompton, Havells, and local sheet metal desert coolers with powerful 1400 RPM motors.' },
      { q: 'Why is my cooler not giving cool air despite full water?', a: 'Often water distribution holes on top of the pads are choked by hard water scale. We clear all nozzles and descale pads.' },
      { q: 'What safety precautions do you take against electrical shocks in coolers?', a: 'We inspect the entire 3-pin wiring harness, test insulation resistance, and install shockproof submersible pump connections.' }
    ]
  },
  {
    id: 'carpenter',
    name: 'Carpenter Services',
    slug: 'carpenter',
    iconName: 'Hammer',
    badge: 'Essential',
    startingPrice: 199,
    bannerImage: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    description: 'Doorstep carpenter services in Indore. Door lock replacement, wardrobe & cupboard hinge repair, bed and sofa assembly, wall hanging drill work, and custom furniture adjustments.',
    heroSubtitle: 'Master Carpenters | Precision Woodwork & Hardware Fixes | Prompt Doorstep Service',
    packages: [
      { id: 'crp-lock', title: 'Door Lock, Latch & Handle Repair', price: 199, originalPrice: 299, duration: '30 mins', description: 'Main door lock replacement, cylindrical lock fix, tower bolt, handle & magnetic catcher fitting.' },
      { id: 'crp-hinge', title: 'Cupboard & Wardrobe Hinge / Slider Fix', price: 249, originalPrice: 399, duration: '30 mins', description: 'Hydraulic soft-close hinge fitting, drawer channel replacement, and sliding door alignment.' },
      { id: 'crp-drill', title: 'Drill & Hang (Frames, Mirrors, Curtains)', price: 199, originalPrice: 299, duration: '30 mins', description: 'Precision hammer drilling for TV mounts, curtain rods, heavy mirrors, paintings & wall shelves.' },
      { id: 'crp-bed', title: 'Bed Assembly & Furniture Repair', price: 399, originalPrice: 599, duration: '45 mins', description: 'Hydraulic bed lift repair, dining table wobble fix, chair joint tightening, and wardrobe dismantling/assembly.' }
    ],
    issues: [
      { title: 'Main Door Scraping Floor, Sagging, or Not Latching', startingPrice: 199, cause: 'Loose hinge screws in wooden frame, seasonal wood expansion/swelling, or misaligned latch strike plate' },
      { title: 'Wardrobe Drawer Jammed / Sliding Door Sticking', startingPrice: 249, cause: 'Bent telescopic ball-bearing channel, broken nylon sliding wheel roller, or track dust obstruction' },
      { title: 'Cabinet Doors Not Closing / Broken Soft-Close Hinges', startingPrice: 199, cause: 'Hydraulic fluid leak in auto-close hinge, stripped screw holes in particle board, or misaligned pivot' },
      { title: 'Main Door Lock / Deadbolt Key Turning Hard or Jammed', startingPrice: 199, cause: 'Worn brass cylinder pins, internal spring failure in Godrej/Europa lock, or dry mechanism friction' },
      { title: 'Wooden Bed Squeaking, Loose Headboard, or Broken Slats', startingPrice: 299, cause: 'Loose corner connector bolts, cracked center support beam, or failed hydraulic gas lift struts' },
      { title: 'Heavy TV Unit, Wall Shelf, Mirror, or Curtain Rod Mounting', startingPrice: 199, cause: 'Need precision hammer drilling with heavy-duty Fischer rawl plugs in concrete/brick walls' }
    ],
    faqs: [
      { q: 'Do your carpenters carry power tools and standard hardware?', a: 'Yes, our carpenters bring professional hammer drills, circular wood trimmers, screws, rawl plugs, and standard fittings.' },
      { q: 'Can you assemble flat-pack furniture from IKEA, Wakefit, and Pepperfry in Indore?', a: 'Yes, our carpenters specialize in precision assembly and dismantling of beds, wardrobes, study desks, and modular units.' },
      { q: 'How fast can a carpenter reach my home in Indore?', a: 'Our carpenter reaches your doorstep promptly upon booking across all Indore sectors.' },
      { q: 'Do you supply genuine Godrej and Europa door locks?', a: 'Yes, we supply and fit brand-new computerized cylinder locks, deadbolts, and security latches with keys and warranty.' },
      { q: 'Is there a warranty on carpenter repair work?', a: 'Yes, PlumberIndore provides an official 30-day post-service warranty on all hardware fittings and woodwork alignments.' },
      { q: 'Can you fix stripped screw holes in modular particle board wardrobes?', a: 'Yes, we use specialized wooden dowels and heavy-duty anchor plates designed specifically for engineered wood and MDF.' }
    ]
  },
  {
    id: 'painting-waterproofing',
    name: 'Painting & Waterproofing',
    slug: 'painting-waterproofing',
    iconName: 'Paintbrush',
    badge: 'Trending',
    startingPrice: 999,
    bannerImage: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=800&q=80',
    description: 'Professional home painting, wall dampness waterproofing, wall putty, and touch-up services in Indore with dust-free mechanized tools and Asian Paints/Berger products.',
    heroSubtitle: 'Dust-Free Mechanized Painting | Wall Dampness Fix | Asian Paints Certified',
    packages: [
      { id: 'pnt-touch', title: 'Wall Putty, Crack & Touch-up Painting', price: 999, originalPrice: 1499, duration: '60 mins', description: 'Filling cracks, anti-fungal putty application, sanding & double coat touch-up paint match.' },
      { id: 'pnt-damp', title: 'Wall Dampness & Leakage Waterproofing', price: 1499, originalPrice: 2199, duration: '90 mins', description: 'Dr. Fixit / Asian Paints SmartCare waterproofing barrier coating for peeling paint and wet patches.' },
      { id: 'pnt-room', title: 'Single Room Painting (Walls & Ceiling)', price: 2499, originalPrice: 3499, duration: '180 mins', description: 'Primer coat, 2 coats of premium plastic emulsion paint, and complete masking protection.' }
    ],
    issues: [
      { title: 'Wall Dampness, Peeling Paint & White Salt Efflorescence (Seelan)', startingPrice: 999, cause: 'Rising groundwater moisture through brickwork, bathroom tile water seepage, or terrace rainwater accumulation' },
      { title: 'Hairline & Structural Cracks on Plaster Walls', startingPrice: 499, cause: 'Thermal expansion, poor initial sand-cement plaster mix, or building settlement' },
      { title: 'Black Mold & Fungal Patches on Bathroom/Bedroom Ceilings', startingPrice: 699, cause: 'Condensation from geyser steam, inadequate room ventilation, or upper-floor bathroom leakage' },
      { title: 'Discolored, Faded, or Stained Interior Walls', startingPrice: 999, cause: 'Years of dust accumulation, sunlight UV degradation, and furniture scuff marks' },
      { title: 'Ceiling Paint Flaking & Rainwater Drips During Monsoons', startingPrice: 1499, cause: 'Damaged terrace waterproofing membrane, blocked rainwater outlet khurra, or parapet wall cracks' },
      { title: 'Door & Window Enamel Paint Chipping & Wood Weathering', startingPrice: 799, cause: 'Exposure to moisture and direct sunlight degrading old oil-based enamel paint film' }
    ],
    faqs: [
      { q: 'Do you offer a free site inspection and laser measurement for home painting in Indore?', a: 'Yes! We provide free doorstep laser area measurement, digital color shade consultation, and transparent itemized estimates.' },
      { q: 'What brands of paint and waterproofing chemicals do you use?', a: 'We exclusively use 100% genuine Asian Paints (Royale/Apex), Berger Paints, and Dr. Fixit waterproofing solutions.' },
      { q: 'How do you permanently treat wall dampness (Seelan)?', a: 'We scrape off degraded plaster, apply Dr. Fixit Dampguard / SmartCare crystal barrier chemical coating, and finish with anti-fungal waterproof putty.' },
      { q: 'Do you protect furniture and flooring with masking sheets during painting?', a: 'Yes, our painters cover all furniture, floors, electrical switches, and appliances with heavy plastic drop sheets before starting.' },
      { q: 'Is there a warranty on painting and waterproofing services?', a: 'Yes, we provide up to 1-year warranty on waterproofing treatments and a 30-day touch-up warranty on interior painting.' },
      { q: 'How fast can you complete painting for a single room or apartment?', a: 'With our mechanized sanding and roller teams, single rooms are completed within 1 day and full 2BHK/3BHK homes in 3-4 days.' }
    ]
  }
];
