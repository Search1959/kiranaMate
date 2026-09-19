import { ServiceItem, ServiceSector } from '../types';

type StarterService = Omit<ServiceItem, 'id' | 'sector'>;

// Compact builder: name, category, price (INR), minutes, GST %, description
const s = (
  name: string,
  category: string,
  price: number,
  durationMinutes: number,
  gstPercent: number,
  description: string,
  isPopular?: boolean
): StarterService => ({ name, category, price, durationMinutes, gstPercent, description, ...(isPopular ? { isPopular } : {}) });

/**
 * Extra starter menu per sector, merged on top of each sector's own
 * defaultServices in serviceSectorConfig.ts (existing names are kept, these
 * only add). A brand-new Zero-Data company should open with a realistic
 * price list it can edit or delete, not a nearly empty catalog. Prices are
 * typical Indian small-business starting points — owners are expected to
 * change them.
 */
export const STARTER_CATALOG: Partial<Record<ServiceSector, { categories?: string[]; services: StarterService[] }>> = {
  DOCTOR_CLINIC: { services: [
    s('Follow-up Consultation (within 7 days)', 'General Consultation', 300, 10, 0, 'Review visit for the same complaint'),
    s('Child / Paediatric Consultation', 'Specialist Visit', 600, 20, 0, 'Growth, vaccination advice and illness care'),
    s('Blood Pressure & Sugar Check', 'Health Checkup', 100, 5, 0, 'Quick BP and random blood sugar reading'),
    s('Injection / IV Administration', 'Minor Procedure', 200, 15, 0, 'Nurse-administered injection or drip'),
    s('Nebulisation Session', 'Minor Procedure', 250, 20, 0, 'Breathing treatment for asthma and cough'),
    s('Medical Certificate / Fitness Report', 'General Consultation', 300, 10, 0, 'Signed fitness or sick-leave certificate')
  ] },
  DIAGNOSTIC_CENTRE: { services: [
    s('Liver Function Test (LFT)', 'Blood Tests', 550, 10, 0, 'Bilirubin, SGOT, SGPT, ALP profile'),
    s('Kidney Function Test (KFT)', 'Blood Tests', 500, 10, 0, 'Urea, creatinine, uric acid'),
    s('Lipid Profile', 'Blood Tests', 450, 10, 0, 'Cholesterol, HDL, LDL, triglycerides'),
    s('HbA1c (Diabetes Control)', 'Blood Tests', 400, 10, 0, '3-month average blood sugar'),
    s('Vitamin D (25-OH)', 'Blood Tests', 900, 10, 0, 'Vitamin D level test'),
    s('Urine Routine & Microscopy', 'Blood Tests', 120, 10, 0, 'Complete urine examination'),
    s('Chest X-Ray', 'Imaging & Radiology', 400, 15, 0, 'Digital PA view chest X-ray'),
    s('Ultrasound Abdomen', 'Imaging & Radiology', 900, 25, 0, 'Whole abdomen ultrasound scan')
  ] },
  DENTAL_CLINIC: { services: [
    s('Dental Consultation & X-Ray', 'Dental Cleaning', 300, 15, 0, 'Check-up with single IOPA X-ray'),
    s('Scaling & Polishing', 'Dental Cleaning', 1200, 30, 0, 'Ultrasonic cleaning and polish'),
    s('Tooth Filling (Composite)', 'Dental Cleaning', 1000, 30, 0, 'Tooth-coloured filling per tooth'),
    s('Root Canal Treatment (RCT)', 'Root Canal & Crown', 4500, 60, 0, 'Single-sitting RCT per tooth'),
    s('Zirconia Crown', 'Root Canal & Crown', 7500, 45, 0, 'Metal-free ceramic crown'),
    s('Teeth Whitening', 'Cosmetic Dentistry', 6000, 60, 0, 'In-clinic professional whitening'),
    s('Wisdom Tooth Extraction', 'Surgical Extraction', 3500, 45, 0, 'Surgical removal with local anaesthesia'),
    s('Braces Consultation & Plan', 'Cosmetic Dentistry', 500, 30, 0, 'Orthodontic assessment and estimate')
  ] },
  SALON: { services: [
    s('Beard Trim & Styling', 'Hair Care', 150, 20, 18, 'Shaping and line-up'),
    s('Hair Spa Treatment', 'Hair Care', 900, 45, 18, 'Deep conditioning hair spa'),
    s('Hair Colour (Global)', 'Hair Care', 2500, 90, 18, 'Full head colour, ammonia-free'),
    s('Clean-up (Face)', 'Skin & Facial', 500, 30, 18, 'Quick deep-clean facial'),
    s('Threading (Eyebrow & Upper Lip)', 'Skin & Facial', 80, 10, 18, 'Precision threading'),
    s('Manicure', 'Nails & Pedicure', 450, 30, 18, 'Nail shaping and hand care'),
    s('Pedicure', 'Nails & Pedicure', 650, 45, 18, 'Foot scrub, massage and polish'),
    s('Bridal Makeup Package', 'Bridal & Grooming', 15000, 180, 18, 'HD makeup, hairstyling and draping', true)
  ] },
  GYM: { services: [
    s('Monthly Membership', 'Gym Membership', 1500, 60, 18, 'Unlimited gym access for 1 month', true),
    s('Quarterly Membership', 'Gym Membership', 3900, 60, 18, '3 months, save vs monthly'),
    s('Annual Membership', 'Gym Membership', 12000, 60, 18, '12 months best-value plan'),
    s('Day Pass / Trial Session', 'Gym Membership', 200, 60, 18, 'Single-day access'),
    s('Personal Training (10 Sessions)', 'Personal Training', 6000, 60, 18, 'One-to-one coaching with a trainer'),
    s('Diet Plan (Monthly)', 'Diet & Nutrition', 1500, 30, 18, 'Customised meal plan with follow-ups'),
    s('Zumba Batch (Monthly)', 'Special Group Classes', 1200, 60, 18, 'Group dance-fitness classes')
  ] },
  YOGA_CENTRE: { services: [
    s('Monthly Yoga Batch', 'Hatha Yoga', 1200, 60, 18, 'Daily morning or evening batch', true),
    s('Drop-in Class', 'Hatha Yoga', 250, 60, 18, 'Single class, no commitment'),
    s('Weight Loss Yoga (Monthly)', 'Power Yoga & Weight Loss', 1800, 60, 18, 'Power yoga for fat loss'),
    s('Pranayama & Meditation Workshop', 'Meditation & Pranayama', 800, 90, 18, 'Weekend breathing and stress-relief workshop'),
    s('Private Yoga Session (Home)', 'Hatha Yoga', 700, 60, 18, 'One-to-one session at your home'),
    s('Prenatal Yoga (Monthly)', 'Hatha Yoga', 2000, 60, 18, 'Safe practice for expecting mothers')
  ] },
  LAWYER: { services: [
    s('Initial Legal Consultation', 'Consultation', 1000, 30, 18, 'First meeting to assess your case', true),
    s('Rental / Lease Agreement Drafting', 'Contract Drafting', 3000, 60, 18, '11-month rent agreement'),
    s('Sale Deed / Property Document Vetting', 'Contract Drafting', 7500, 90, 18, 'Title and document verification'),
    s('Legal Notice Drafting & Dispatch', 'Legal Notice', 2500, 45, 18, 'Notice drafted and sent by registered post'),
    s('Cheque Bounce Case Filing', 'Court Representation', 10000, 60, 18, 'NI Act 138 complaint filing'),
    s('Court Appearance (Per Hearing)', 'Court Representation', 3000, 120, 18, 'Advocate appearance per date'),
    s('Affidavit & Notary', 'Contract Drafting', 500, 20, 18, 'Affidavit drafting with notarisation')
  ] },
  CA_ACCOUNTANT: { services: [
    s('ITR Filing (Salaried)', 'Tax Filings', 1500, 45, 18, 'Income tax return for salaried individuals', true),
    s('ITR Filing (Business / Professional)', 'Tax Filings', 4500, 90, 18, 'Return with books and audit support'),
    s('GST Registration', 'GST Services', 2500, 60, 18, 'New GSTIN application'),
    s('GST Return Filing (Monthly)', 'GST Services', 1000, 45, 18, 'GSTR-1 and GSTR-3B per month'),
    s('Company / LLP Registration', 'Company Registration', 12000, 120, 18, 'Incorporation with PAN, TAN and certificate'),
    s('Tax Audit (44AB)', 'Business Audit', 15000, 180, 18, 'Statutory tax audit report'),
    s('Monthly Bookkeeping', 'Business Audit', 3000, 120, 18, 'Accounts write-up and reconciliation'),
    s('TDS Return (Quarterly)', 'Tax Filings', 1500, 60, 18, 'Form 24Q / 26Q filing')
  ] },
  COACHING_CENTRE: { services: [
    s('Class 9-10 Foundation (Monthly)', 'Foundation Courses', 2500, 120, 0, 'Maths and Science batch'),
    s('Class 11-12 Science (Monthly)', 'Foundation Courses', 4500, 180, 0, 'PCM / PCB board and entrance batch'),
    s('JEE Main Crash Course', 'JEE / NEET Prep', 12000, 180, 0, '3-month intensive revision'),
    s('UPSC Prelims Test Series', 'UPSC & Govt Exams', 5000, 180, 0, '20 full-length mock tests with analysis'),
    s('Bank / SSC Exam Batch (Monthly)', 'UPSC & Govt Exams', 2000, 120, 0, 'Quant, reasoning and English'),
    s('Spoken English (Monthly)', 'Foundation Courses', 1500, 60, 0, 'Fluency and interview practice'),
    s('Doubt-Clearing Session', 'Foundation Courses', 300, 45, 0, 'One-on-one doubt solving')
  ] },
  REPAIR_SHOP: { services: [
    s('Mobile Screen Replacement', 'Mobile Repair', 2500, 45, 18, 'Display replacement, 3-month warranty', true),
    s('Mobile Battery Replacement', 'Mobile Repair', 900, 30, 18, 'New battery fitted'),
    s('Charging Port Repair', 'Mobile Repair', 600, 30, 18, 'Port cleaning or replacement'),
    s('Laptop Screen Replacement', 'Laptop Repair', 4500, 60, 18, 'Panel replacement'),
    s('Laptop OS Install & Setup', 'Software & Data Recovery', 800, 60, 18, 'Windows install with drivers'),
    s('Data Recovery (Basic)', 'Software & Data Recovery', 2000, 120, 18, 'Recover files from a failing drive'),
    s('LED TV Panel / Board Repair', 'TV & Electronics', 3000, 90, 18, 'Diagnosis and repair'),
    s('Diagnosis / Inspection Fee', 'Mobile Repair', 200, 15, 18, 'Adjusted against the final repair bill')
  ] },
  AC_SERVICE: { services: [
    s('Split AC General Service', 'AC Servicing', 600, 45, 18, 'Jet wash of indoor and outdoor unit', true),
    s('Window AC Service', 'AC Servicing', 500, 40, 18, 'Full cleaning and check'),
    s('Split AC Installation', 'Installation / Removal', 1800, 90, 18, 'Mounting and piping up to 3 m'),
    s('AC Uninstallation', 'Installation / Removal', 700, 45, 18, 'Safe removal with gas pump-down'),
    s('Gas Refill (R32 / R410)', 'Gas Charging', 2500, 60, 18, 'Leak test and full gas top-up'),
    s('PCB / Compressor Repair Visit', 'AC Servicing', 1500, 90, 18, 'Diagnosis and repair estimate'),
    s('Annual AMC (2 Services)', 'AMC Contracts', 1100, 45, 18, 'Two scheduled services per year')
  ] },
  RO_WATER_PURIFIER: { services: [
    s('RO General Service', 'Repair', 500, 40, 18, 'Cleaning, sanitisation and TDS check', true),
    s('Sediment / Carbon Filter Set', 'Filter Replacement', 700, 30, 18, 'Pre-filter cartridges replaced'),
    s('RO Membrane Replacement', 'Filter Replacement', 2200, 45, 18, 'New membrane fitted'),
    s('New RO Installation', 'Installation', 800, 60, 18, 'Wall-mount installation and demo'),
    s('Annual AMC (Filters Included)', 'AMC Plans', 3500, 45, 18, '3 services with consumables'),
    s('Pump / Adaptor Repair', 'Repair', 600, 40, 18, 'Faulty electrical part replaced')
  ] },
  AUTOMOBILE_GARAGE: { services: [
    s('Car General Service', 'Periodic Maintenance', 2500, 180, 18, 'Oil, filters and 40-point check', true),
    s('Bike Service', 'Periodic Maintenance', 600, 60, 18, 'Oil change, wash and tune-up'),
    s('Brake Pad Replacement', 'Engine & Brakes', 1800, 90, 18, 'Front or rear pads fitted'),
    s('Wheel Alignment & Balancing', 'Engine & Brakes', 900, 60, 18, 'Computerised, 4 wheels'),
    s('Car AC Gas & Service', 'AC & Electricals', 2200, 90, 18, 'Gas refill and cooling check'),
    s('Battery Replacement', 'AC & Electricals', 4500, 30, 18, 'New battery with old exchange'),
    s('Dent & Paint (Per Panel)', 'Body & Paint', 3500, 240, 18, 'Denting and paint per panel'),
    s('Full Car Wash & Interior Detailing', 'Periodic Maintenance', 1200, 90, 18, 'Foam wash, vacuum and dashboard polish')
  ] },
  ELECTRICIAN: { services: [
    s('Visit & Inspection Charge', 'Repair & Short Circuit', 250, 30, 18, 'Diagnosis at your location', true),
    s('Fan Installation / Repair', 'Light & Fan Fitting', 350, 30, 18, 'Ceiling or exhaust fan'),
    s('Switch / Socket Replacement', 'Repair & Short Circuit', 150, 15, 18, 'Per point'),
    s('MCB / DB Box Replacement', 'Inverter & DB Box', 1200, 60, 18, 'Distribution board work'),
    s('Inverter / UPS Installation', 'Inverter & DB Box', 1500, 90, 18, 'Wiring and battery connection'),
    s('New Point Wiring (Per Point)', 'Commercial Wiring', 600, 60, 18, 'Concealed wiring per point'),
    s('Geyser Installation', 'Light & Fan Fitting', 700, 45, 18, 'Mounting with safety switch')
  ] },
  PLUMBING: { services: [
    s('Visit & Inspection Charge', 'Leak Repair', 250, 30, 18, 'Diagnosis at your location', true),
    s('Tap / Mixer Replacement', 'Sanitary Installation', 350, 30, 18, 'Per tap'),
    s('Wash Basin Installation', 'Sanitary Installation', 900, 60, 18, 'Fixing with fittings'),
    s('Toilet / Commode Fitting', 'Sanitary Installation', 1200, 90, 18, 'Western or Indian type'),
    s('Water Tank Cleaning (1000 L)', 'Water Tank Cleaning', 1200, 90, 18, 'Mechanised cleaning and disinfection'),
    s('Blocked Drain Cleaning', 'Leak Repair', 600, 60, 18, 'Choke removal'),
    s('Pipeline Leak Repair', 'Pipe Fitting', 800, 60, 18, 'Concealed or open pipe leak')
  ] },
  PEST_CONTROL: { services: [
    s('General Pest Control (1 BHK)', 'Cockroach Control', 1200, 60, 18, 'Gel and spray treatment', true),
    s('General Pest Control (2 BHK)', 'Cockroach Control', 1800, 90, 18, 'Full home treatment'),
    s('Termite Treatment (Per Sq Ft)', 'Termite Proofing', 15, 180, 18, 'Drill-and-inject anti-termite'),
    s('Bed Bug Treatment', 'Bedbug Treatment', 2000, 90, 18, 'Two-round treatment with follow-up'),
    s('Rodent Control', 'Rodent Control', 1500, 60, 18, 'Baiting and entry-point sealing'),
    s('Annual Pest Contract (Home)', 'Cockroach Control', 4500, 60, 18, '4 quarterly visits'),
    s('Commercial Kitchen Treatment', 'Cockroach Control', 3500, 120, 18, 'Restaurant and canteen safe treatment')
  ] },
  DIGITAL_MARKETING_AGENCY: { services: [
    s('SEO Starter (Monthly)', 'SEO & Organic Growth', 15000, 0, 18, '10 keywords, on-page and reporting', true),
    s('Google Ads Management (Monthly)', 'Paid Ads (Google & Meta)', 12000, 0, 18, 'Setup and optimisation, ad spend extra'),
    s('Meta Ads Management (Monthly)', 'Paid Ads (Google & Meta)', 12000, 0, 18, 'Facebook and Instagram campaigns'),
    s('Social Media Handling (Monthly)', 'Social Media Marketing', 18000, 0, 18, '12 posts and 4 reels'),
    s('Business Website (5 Pages)', 'Website & Landing Pages', 25000, 0, 18, 'Responsive site with contact form'),
    s('Landing Page + Lead Funnel', 'Lead Generation & Funnels', 12000, 0, 18, 'Conversion page with WhatsApp CTA'),
    s('Google Business Profile Setup', 'SEO & Organic Growth', 3500, 0, 18, 'Verified listing with optimisation')
  ] },
  SOFTWARE_IT: { services: [
    s('Business Website (Custom)', 'Web Application', 40000, 0, 18, 'Design, build and deploy', true),
    s('E-Commerce Store', 'Web Application', 75000, 0, 18, 'Catalogue, cart and payments'),
    s('Android App (MVP)', 'Mobile App (iOS / Android)', 120000, 0, 18, 'Core features, one platform'),
    s('Custom CRM / ERP Module', 'Custom ERP & CRM', 60000, 0, 18, 'Per module, requirement-based'),
    s('Payment / API Integration', 'API & Cloud Integration', 15000, 0, 18, 'Third-party gateway or API'),
    s('Monthly Maintenance & Support', 'Web Application', 5000, 0, 18, 'Updates, backups and bug fixes'),
    s('Cloud Hosting Setup', 'API & Cloud Integration', 8000, 0, 18, 'Server, SSL and deployment')
  ] },
  COMPUTER_AMC: { services: [
    s('Desktop / Laptop Repair Visit', 'Computer Repair', 500, 60, 18, 'Onsite diagnosis and fix', true),
    s('Virus Removal & OS Cleanup', 'Computer Repair', 700, 90, 18, 'Malware clean and tune-up'),
    s('Wi-Fi / LAN Setup (Office)', 'Networking & Wi-Fi', 3500, 180, 18, 'Router, switch and cabling'),
    s('Printer Setup & Repair', 'Computer Repair', 600, 45, 18, 'Driver, network and head cleaning'),
    s('Server Health Check', 'Server Maintenance', 4000, 120, 18, 'Monitoring, backup and patch review'),
    s('CCTV Installation (4 Cameras)', 'Networking & Wi-Fi', 18000, 300, 18, 'Cameras, DVR and configuration'),
    s('Annual AMC (Per Computer)', 'Corporate AMC', 1500, 60, 18, 'Quarterly checks and priority support')
  ] },
  ADVERTISING_CREATIVE: { services: [
    s('Logo Design (3 Concepts)', 'Brand Strategy & Logo', 8000, 0, 18, 'Logo with 2 revisions', true),
    s('Brand Identity Kit', 'Brand Strategy & Logo', 25000, 0, 18, 'Logo, palette, typography and guidelines'),
    s('Press Release Writing & Distribution', 'PR & Press Releases', 6000, 0, 18, 'Written and sent to media list'),
    s('Corporate Video (60 sec)', 'Video Production & Commercials', 35000, 0, 18, 'Shoot, edit and voice-over'),
    s('Influencer Campaign (Micro)', 'Influencer Marketing', 20000, 0, 18, '5 micro-influencers, fee extra'),
    s('Flex / Hoarding Design', 'Print & Outdoor Media', 1500, 0, 18, 'Print-ready artwork')
  ] },
  PHOTOGRAPHY: { services: [
    s('Pre-Wedding Shoot (1 Location)', 'Pre-Wedding Shoot', 25000, 240, 18, 'Photos and highlight reel', true),
    s('Wedding Photography (1 Day)', 'Wedding Coverage', 45000, 720, 18, 'Candid and traditional coverage'),
    s('Wedding Photo + Video (2 Days)', 'Wedding Coverage', 110000, 1440, 18, 'Full coverage with album'),
    s('Product Shoot (Per 10 Products)', 'Product Photography', 5000, 120, 18, 'White-background and lifestyle'),
    s('Birthday / Baby Shoot', 'Portfolio Shoot', 6000, 120, 18, 'Studio or home shoot'),
    s('Professional Portfolio Shoot', 'Portfolio Shoot', 4500, 90, 18, '20 edited images'),
    s('Photo Album (30 Sheets)', 'Wedding Coverage', 7000, 0, 18, 'Premium printed album')
  ] },
  PRINTING_PRESS: { services: [
    s('Visiting Cards (1000)', 'Corporate Stationery', 800, 0, 18, '300 GSM matte-laminated', true),
    s('Letterhead (500)', 'Corporate Stationery', 1800, 0, 18, 'Bond paper, single colour'),
    s('Flex Banner (Per Sq Ft)', 'Flex & Vinyl Banner', 15, 0, 18, 'Weather-proof flex print'),
    s('Vinyl Sticker (Per Sq Ft)', 'Flex & Vinyl Banner', 40, 0, 18, 'Cut-to-shape adhesive vinyl'),
    s('Brochure / Pamphlet (1000)', 'Offset Printing', 4500, 0, 18, 'A4, 130 GSM art paper'),
    s('Invoice / Bill Book (10 Books)', 'Corporate Stationery', 1500, 0, 18, 'Duplicate carbon-less'),
    s('Wedding Card (Per 100)', 'Offset Printing', 2500, 0, 18, 'Customised design and print')
  ] },
  EVENT_MANAGEMENT: { services: [
    s('Birthday Party Decor', 'Decor & Stage', 8000, 240, 18, 'Balloons, backdrop and theme setup', true),
    s('Wedding Stage Decoration', 'Decor & Stage', 60000, 480, 18, 'Floral stage and entrance'),
    s('DJ & Sound System (5 Hours)', 'Sound & Lighting', 15000, 300, 18, 'DJ, speakers and console'),
    s('Stage Lighting Package', 'Sound & Lighting', 12000, 240, 18, 'Par lights and moving heads'),
    s('Catering Coordination (Per Plate)', 'Catering Coordination', 450, 0, 5, 'Menu planning and vendor management'),
    s('Corporate Event Package', 'Full Event Package', 150000, 720, 18, 'Venue, AV, decor and coordination'),
    s('Emcee / Anchor', 'Full Event Package', 8000, 240, 18, 'Professional host')
  ] },
  HOTEL_GUESTHOUSE: { services: [
    s('Standard Room (Per Night)', 'Room Tariff', 1800, 1440, 12, 'AC room with breakfast'),
    s('Family Suite (Per Night)', 'Room Tariff', 4500, 1440, 12, 'Two-bedroom suite with living area'),
    s('Extra Bed', 'Room Tariff', 500, 1440, 12, 'Mattress with linen per night'),
    s('Airport / Station Pickup', 'Room Service', 800, 60, 5, 'Cab pickup for guests'),
    s('Laundry Service (Per Piece)', 'Room Service', 60, 0, 18, 'Same-day wash and press'),
    s('Conference Hall (Per Day)', 'Banquet & Events', 12000, 480, 18, 'Projector, mic and tea service'),
    s('Banquet Lunch (Per Plate)', 'Banquet & Events', 600, 0, 5, 'Buffet for group bookings')
  ] },
  REAL_ESTATE: { services: [
    s('Property Site Visit Coordination', 'Buy / Sell Brokerage', 500, 120, 18, 'Guided visits to shortlisted properties'),
    s('Rental Brokerage (1 Month Rent)', 'Rental Agreement', 20000, 0, 18, 'Tenant finding and closure'),
    s('Rental Agreement Drafting', 'Rental Agreement', 2500, 60, 18, '11-month agreement with registration help'),
    s('Property Valuation Report', 'Property Valuation', 6000, 120, 18, 'Market-value assessment'),
    s('Legal Document Verification', 'Property Valuation', 5000, 90, 18, 'Title and encumbrance check'),
    s('Property Listing (Premium)', 'Buy / Sell Brokerage', 3000, 0, 18, 'Featured listing with photos')
  ] },
  LAUNDRY: { services: [
    s('Wash & Fold (Per Kg)', 'Washing & Folding', 80, 0, 18, 'Everyday wear, 48-hour delivery', true),
    s('Wash & Iron (Per Piece)', 'Steam Ironing', 25, 0, 18, 'Shirt, trouser or kurta'),
    s('Steam Iron Only (Per Piece)', 'Steam Ironing', 12, 0, 18, 'Steam press'),
    s('Dry Clean Suit (2 Piece)', 'Dry Cleaning', 450, 0, 18, 'Professional suit cleaning'),
    s('Saree Dry Clean', 'Dry Cleaning', 250, 0, 18, 'Silk and heavy sarees'),
    s('Blanket / Quilt Wash', 'Washing & Folding', 350, 0, 18, 'Single or double'),
    s('Sofa Cleaning (Per Seat)', 'Carpet & Sofa Wash', 300, 0, 18, 'Shampoo and vacuum'),
    s('Carpet Wash (Per Sq Ft)', 'Carpet & Sofa Wash', 12, 0, 18, 'Deep clean and dry')
  ] },
  SECURITY_AGENCY: { services: [
    s('Unarmed Guard (12 Hr, Monthly)', 'Guard Deployment', 18000, 0, 18, 'Trained day or night guard', true),
    s('Unarmed Guard (8 Hr, Monthly)', 'Guard Deployment', 14000, 0, 18, 'Single-shift guard'),
    s('Supervisor (Monthly)', 'Guard Deployment', 24000, 0, 18, 'Site supervisor with reporting'),
    s('CCTV Monitoring (Per Camera, Monthly)', 'CCTV Monitoring', 800, 0, 18, 'Remote monitoring and alerts'),
    s('Event Bouncers (Per Person, Per Day)', 'Event Bouncers', 1500, 0, 18, 'Crowd control staff'),
    s('Night Patrolling (Monthly)', 'Guard Deployment', 9000, 0, 18, 'Scheduled patrol rounds')
  ] },
  AGRICULTURE: { services: [
    s('Soil Testing (Per Sample)', 'Soil Testing', 400, 0, 0, 'NPK and pH report'),
    s('Crop Advisory Visit', 'Crop Advisory', 1000, 90, 0, 'Field visit with recommendations', true),
    s('Tractor Rental (Per Hour)', 'Machinery Rental', 700, 60, 0, 'With operator'),
    s('Rotavator / Cultivator (Per Acre)', 'Machinery Rental', 1200, 0, 0, 'Land preparation'),
    s('Drip Irrigation Design & Estimate', 'Crop Advisory', 3000, 120, 18, 'Layout and cost estimate'),
    s('Spraying Service (Per Acre)', 'Machinery Rental', 300, 0, 0, 'Drone or power sprayer')
  ] },
  COURIER_LOGISTICS: { services: [
    s('Document Courier (Within City)', 'Domestic Express', 60, 0, 18, 'Same-day delivery', true),
    s('Parcel up to 5 Kg (Domestic)', 'Domestic Express', 350, 0, 18, '2-4 day delivery'),
    s('Parcel up to 20 Kg (Domestic)', 'Domestic Express', 900, 0, 18, 'Surface express'),
    s('Home Shifting (1 BHK)', 'Packers & Movers', 9000, 0, 18, 'Packing, loading and transport'),
    s('Home Shifting (2 BHK)', 'Packers & Movers', 15000, 0, 18, 'Local shifting with insurance'),
    s('Bike / Car Transport', 'Cargo Shipping', 6000, 0, 18, 'City-to-city vehicle carriage'),
    s('Part Load (Per Kg)', 'Cargo Shipping', 18, 0, 18, 'Surface cargo')
  ] },
  FINANCE_LOANS: { services: [
    s('Home Loan Processing', 'Home Loan', 5000, 0, 18, 'Documentation and bank liaison'),
    s('Personal Loan Assistance', 'Business Loan', 2500, 0, 18, 'Eligibility check and filing'),
    s('Business / MSME Loan File', 'Business Loan', 8000, 0, 18, 'Project report and lender coordination', true),
    s('Loan Against Property Assistance', 'Home Loan', 6000, 0, 18, 'Valuation and document handling'),
    s('CIBIL Score Report & Advice', 'CIBIL Improvement', 500, 0, 18, 'Report review and action plan'),
    s('Credit Repair Programme', 'CIBIL Improvement', 6000, 0, 18, 'Dispute handling and follow-up'),
    s('Insurance Advisory', 'Business Loan', 1000, 30, 18, 'Life and health cover comparison')
  ] },
  GOVT_CSC: { services: [
    s('PAN Card Application', 'Aadhaar & PAN', 200, 20, 18, 'New or correction', true),
    s('Aadhaar Update Assistance', 'Aadhaar & PAN', 100, 15, 18, 'Address or mobile update'),
    s('Passport Application Assistance', 'Passport & Driving', 500, 45, 18, 'Form fill and appointment booking'),
    s('Driving Licence Application', 'Passport & Driving', 400, 30, 18, 'Learner or permanent licence'),
    s('Income / Caste Certificate', 'Govt Schemes', 150, 30, 18, 'e-District application'),
    s('Voter ID Application', 'Aadhaar & PAN', 100, 20, 18, 'New or correction'),
    s('Ration Card Service', 'Govt Schemes', 150, 30, 18, 'Application and status'),
    s('Online Form / Printout (Per Page)', 'Govt Schemes', 10, 5, 18, 'Print, scan or photocopy')
  ] },
  RELIGIOUS_TRUST: { services: [
    s('Satyanarayan Pooja Booking', 'Pooja Booking', 2100, 120, 0, 'Pandit and samagri included', true),
    s('Abhishek (Rudrabhishek)', 'Special Archana', 1100, 60, 0, 'Abhishek with mantras'),
    s('Griha Pravesh Pooja', 'Pooja Booking', 5100, 180, 0, 'Complete ritual with havan'),
    s('Annadaan Donation (Per Meal)', 'Donation Slip', 50, 0, 0, 'Sponsor a meal for devotees'),
    s('General Donation Receipt', 'Donation Slip', 501, 0, 0, 'Receipt with 80G if eligible'),
    s('Special Archana (Per Name)', 'Special Archana', 101, 15, 0, 'Archana in your name and gotra'),
    s('Hall Booking (Per Day)', 'Pooja Booking', 5000, 480, 0, 'Community hall for functions')
  ] },
  ENTERTAINMENT_SPORTS: { services: [
    s('Football Turf (Per Hour)', 'Turf Booking', 1200, 60, 18, '5-a-side turf', true),
    s('Cricket Turf (Per Hour)', 'Turf Booking', 1500, 60, 18, 'Box cricket booking'),
    s('Badminton Court (Per Hour)', 'Turf Booking', 400, 60, 18, 'Indoor court'),
    s('PS5 Gaming (Per Hour)', 'VR & Console Gaming', 150, 60, 18, 'Console with 2 controllers'),
    s('VR Gaming Session (30 Min)', 'VR & Console Gaming', 300, 30, 18, 'Immersive VR experience'),
    s('Birthday Party Package (10 Kids)', 'Party Booking', 6000, 180, 18, 'Games, cake table and host'),
    s('Snooker / Pool (Per Hour)', 'VR & Console Gaming', 250, 60, 18, 'Table booking')
  ] },
  GENERAL_SERVICE: { services: [
    s('Standard Service Visit', 'General Service', 500, 60, 18, 'Basic service charge', true),
    s('Consultation (30 Min)', 'Consultation', 800, 30, 18, 'Expert advice session'),
    s('Site Inspection', 'General Service', 1000, 90, 18, 'On-site assessment and report'),
    s('Annual Contract (Monthly)', 'Contract Work', 5000, 0, 18, 'Recurring service retainer'),
    s('Emergency / Urgent Call-out', 'General Service', 1500, 60, 18, 'Priority same-day service'),
    s('Project Work (Per Day)', 'Contract Work', 3000, 480, 18, 'Day-rate skilled labour')
  ] }
};
