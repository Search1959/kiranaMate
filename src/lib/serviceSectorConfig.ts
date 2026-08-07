import { ServiceSector, ServiceSectorGroup, ServiceItem, ServiceStaff, ServicePackage } from '../types';

export interface ServiceSectorConfig {
  id: ServiceSector;
  name: string;
  group: ServiceSectorGroup;
  iconName: string; // lucide icon identifier
  tagline: string;
  customerTerm: string; // e.g., "Client", "Patient", "Student", "Customer", "Member", "Guest"
  staffTerm: string; // e.g., "Stylist", "Doctor", "Technician", "Lawyer", "Trainer"
  workOrderTerm: string; // e.g., "Job Card", "Case File", "Prescription", "Ticket", "Work Order"
  categories: string[];
  subIndustries: string[];
  defaultServices: Omit<ServiceItem, 'id' | 'sector'>[];
  defaultStaff: Omit<ServiceStaff, 'id'>[];
  defaultPackages: Omit<ServicePackage, 'id' | 'sector'>[];
}

export const SERVICE_SECTOR_GROUPS: { name: ServiceSectorGroup; icon: string; count: number; description: string }[] = [
  { name: 'Healthcare', icon: 'Stethoscope', count: 12, description: 'Doctor Clinic, Diagnostic, Dental, Hospital & Veterinary' },
  { name: 'Beauty & Wellness', icon: 'Scissors', count: 12, description: 'Salon, Spa, Nails, Tattoo, Yoga & Gym' },
  { name: 'Legal & Professional', icon: 'Briefcase', count: 12, description: 'Lawyer, Law Firm, CA, Tax, Financial & Architect' },
  { name: 'Education & Training', icon: 'GraduationCap', count: 11, description: 'Coaching, Tuition, Computer, Languages & Skill Development' },
  { name: 'Repair & Maintenance', icon: 'Smartphone', count: 12, description: 'Mobile, Laptop, TV, AC & RO Purifier Repair' },
  { name: 'Automobile', icon: 'Wrench', count: 10, description: 'Car Garage, Bike Workshop, Washing, Alignment & Detailing' },
  { name: 'Home Services', icon: 'Zap', count: 10, description: 'Electrician, Plumbing, Pest Control, Cleaning & Gardening' },
  { name: 'IT & Technology', icon: 'Server', count: 11, description: 'Software, Web Development, Digital Marketing & Computer AMC' },
  { name: 'Creative Services', icon: 'Camera', count: 10, description: 'Photography, Videography, Printing Press & Event Management' },
  { name: 'Hospitality & Travel', icon: 'Hotel', count: 10, description: 'Hotel, Guest House, Travel Agency, Car Rental & Catering' },
  { name: 'Property & Construction', icon: 'Building', count: 8, description: 'Real Estate, Construction, Contractors & Facility Management' },
  { name: 'Laundry & Cleaning', icon: 'Shirt', count: 6, description: 'Laundry, Dry Cleaning, Carpet & Tank Cleaning' },
  { name: 'Security Services', icon: 'Shield', count: 4, description: 'Security Guard Agency, CCTV & Fire Safety' },
  { name: 'Agriculture Services', icon: 'Sprout', count: 5, description: 'Farm Advisory, Irrigation, Soil Testing & Machinery Rental' },
  { name: 'Logistics & Courier', icon: 'Truck', count: 5, description: 'Courier, Packers Movers, Transport & Warehousing' },
  { name: 'Financial Services', icon: 'Landmark', count: 6, description: 'Loans, Microfinance, Stock Broker & Accounting' },
  { name: 'Government & NGO', icon: 'Building2', count: 6, description: 'NGO, CSC Service Centre, Trusts & Panchayats' },
  { name: 'Religious Services', icon: 'Sun', count: 5, description: 'Temple, Mosque, Church & Ashram Management' },
  { name: 'Entertainment & Sports', icon: 'Gamepad2', count: 5, description: 'Gaming Zone, Sports Club, Cinema & Venues' },
  { name: 'General Service', icon: 'Layers', count: 5, description: 'Universal Service Business & Consultancies' }
];

export const SERVICE_SECTORS: ServiceSectorConfig[] = [
  // 🏥 HEALTHCARE
  {
    id: 'DOCTOR_CLINIC',
    name: 'Doctor & Medical OPD Clinic',
    group: 'Healthcare',
    iconName: 'Stethoscope',
    tagline: 'Patient Consultations, Prescriptions, Follow-ups & Health Records',
    customerTerm: 'Patient',
    staffTerm: 'Doctor / Specialist',
    workOrderTerm: 'Prescription & Treatment',
    categories: ['General Consultation', 'Specialist Visit', 'Minor Procedure', 'Health Checkup'],
    subIndustries: ['Doctor Clinic', 'Multi-Speciality Clinic', 'Pathology Lab', 'Physiotherapy', 'Eye Clinic', 'Home Healthcare'],
    defaultServices: [
      { name: 'General OPD Consultation', category: 'General Consultation', price: 500, durationMinutes: 15, gstPercent: 0, description: 'Primary health checkup and digital prescription', isPopular: true },
      { name: 'Specialist Consultant Visit', category: 'Specialist Visit', price: 800, durationMinutes: 20, gstPercent: 0, description: 'Senior consultant examination and review' },
      { name: 'ECG Heart Monitoring Test', category: 'Minor Procedure', price: 350, durationMinutes: 10, gstPercent: 0, description: '12-Lead Digital ECG printout and diagnosis' },
      { name: 'Diabetes Annual Screening Package', category: 'Health Checkup', price: 1200, durationMinutes: 30, gstPercent: 0, description: 'HbA1c, Fasting Sugar, Kidney & Lipid Profile' },
      { name: 'Wound Dressing & Suturing Care', category: 'Minor Procedure', price: 600, durationMinutes: 25, gstPercent: 0, description: 'Sterile surgical dressing and wound care' }
    ],
    defaultStaff: [
      { name: 'Dr. Anand Kulkarni', role: 'Senior Physician (MD)', mobile: '9833112233', specialty: 'General Medicine & Diabetes', rating: 4.9, totalJobsCompleted: 1250, commissionPercent: 70, dailyTarget: 10000, status: 'Active' },
      { name: 'Dr. Sneha Patil', role: 'Consultant Dermatologist', mobile: '9833223344', specialty: 'Skin & Laser Specialist', rating: 4.8, totalJobsCompleted: 890, commissionPercent: 65, dailyTarget: 12000, status: 'Active' }
    ],
    defaultPackages: [
      { name: 'Senior Citizen Care Plan (3 Months)', price: 3000, durationDays: 90, includedServices: ['3 OPD Visits', 'ECG', 'Sugar Checkup', 'Physio Consultation'], discountPercent: 30, description: '3 Months holistic health monitoring pass' }
    ]
  },
  {
    id: 'DIAGNOSTIC_CENTRE',
    name: 'Diagnostic Centre & Pathology Lab',
    group: 'Healthcare',
    iconName: 'Activity',
    tagline: 'Blood Reports, Imaging, Home Sample Collection & Lab Tickets',
    customerTerm: 'Patient / Client',
    staffTerm: 'Pathologist / Phlebotomist',
    workOrderTerm: 'Lab Sample Ticket',
    categories: ['Blood Tests', 'Full Body Packages', 'Imaging & Radiology', 'Home Sample Collection'],
    subIndustries: ['Pathology Lab', 'Diagnostic Centre', 'Medical Imaging Centre', 'Thyroid Care'],
    defaultServices: [
      { name: 'Complete Blood Count (CBC)', category: 'Blood Tests', price: 350, durationMinutes: 10, gstPercent: 0, description: '24 Parameter blood profile report', isPopular: true },
      { name: 'Thyroid Profile (T3, T4, TSH)', category: 'Blood Tests', price: 600, durationMinutes: 10, gstPercent: 0, description: 'Serum thyroid hormone assessment' },
      { name: 'Full Body Health Checkup (80+ Tests)', category: 'Full Body Packages', price: 1999, durationMinutes: 20, gstPercent: 0, description: 'Comprehensive lipid, liver, kidney, vitamin & CBC screening', isPopular: true },
      { name: 'Home Blood Collection Visit Fee', category: 'Home Sample Collection', price: 150, durationMinutes: 30, gstPercent: 0, description: 'Doorstep sterile sample collection charge' }
    ],
    defaultStaff: [
      { name: 'Sunil Phlebotomist', role: 'Senior Lab Tech', mobile: '9811223344', specialty: 'Painless Venipuncture', rating: 4.9, totalJobsCompleted: 980, commissionPercent: 20, dailyTarget: 4000, status: 'Active' }
    ],
    defaultPackages: [
      { name: 'Annual Family Wellness Shield', price: 4999, durationDays: 365, includedServices: ['2 Full Body Checkups', '4 Sugar Tests', 'Free Home Collection'], discountPercent: 35, description: 'Year-long diagnostic security for 4 family members' }
    ]
  },
  {
    id: 'DENTAL_CLINIC',
    name: 'Dental Care Clinic',
    group: 'Healthcare',
    iconName: 'Smile',
    tagline: 'Teeth Cleaning, Root Canal, Braces, X-Rays & Dental Surgery',
    customerTerm: 'Patient',
    staffTerm: 'Dentist / Dental Surgeon',
    workOrderTerm: 'Dental Treatment Plan',
    categories: ['Dental Cleaning', 'Root Canal & Crown', 'Cosmetic Dentistry', 'Surgical Extraction'],
    subIndustries: ['Dental Clinic', 'Orthodontic Centre', 'Cosmetic Dental Studio'],
    defaultServices: [
      { name: 'Ultrasonic Scaling & Teeth Polishing', category: 'Dental Cleaning', price: 1200, durationMinutes: 30, gstPercent: 0, description: 'Painless plaque removal and enamel polishing', isPopular: true },
      { name: 'Single Visit Painless Root Canal (RCT)', category: 'Root Canal & Crown', price: 3500, durationMinutes: 60, gstPercent: 0, description: 'Rotary endodontics with digital apex locator' },
      { name: 'Zirconia All-Ceramic Dental Crown', category: 'Root Canal & Crown', price: 6500, durationMinutes: 45, gstPercent: 0, description: 'Natural translucency tooth crown with 10 years warranty' }
    ],
    defaultStaff: [
      { name: 'Dr. Neha MDS', role: 'Consultant Endodontist', mobile: '9877445566', specialty: 'Single-Sitting RCT & Smile Design', rating: 4.9, totalJobsCompleted: 920, commissionPercent: 65, dailyTarget: 15000, status: 'Active' }
    ],
    defaultPackages: [
      { name: 'Annual Oral Health Shield', price: 2500, durationDays: 365, includedServices: ['2 Scaling & Polishings', '2 Digital X-Rays', 'Free Dental Checkup'], discountPercent: 30, description: 'Preventive dental wellness pass' }
    ]
  },

  // 💇 BEAUTY & WELLNESS
  {
    id: 'SALON',
    name: 'Beauty Salon, Hair & Makeup Studio',
    group: 'Beauty & Wellness',
    iconName: 'Scissors',
    tagline: 'Hair Cuts, Facials, Makeup, Pedicure & Bridal Grooming',
    customerTerm: 'Client',
    staffTerm: 'Stylist / Beautician',
    workOrderTerm: 'Service Card',
    categories: ['Hair Care', 'Skin & Facial', 'Spa & Body Massage', 'Nails & Pedicure', 'Bridal & Grooming'],
    subIndustries: ['Beauty Salon', 'Hair Salon', 'Nail Studio', 'Makeup Studio', 'Tattoo Studio'],
    defaultServices: [
      { name: 'Hair Cut & Styling (Unisex)', category: 'Hair Care', price: 350, durationMinutes: 30, gstPercent: 18, description: 'Shampoo, precision cut and blow dry styling', isPopular: true },
      { name: 'Hydra-Facial Glow Treatment', category: 'Skin & Facial', price: 1500, durationMinutes: 60, gstPercent: 18, description: 'Deep cleansing, exfoliation and hydration facial', isPopular: true },
      { name: 'Full Body Aromatherapy Massage', category: 'Spa & Body Massage', price: 2200, durationMinutes: 60, gstPercent: 18, description: 'Relaxing full body massage with organic oils' },
      { name: 'Gel Polish Nail Art', category: 'Nails & Pedicure', price: 800, durationMinutes: 45, gstPercent: 18, description: 'Long-lasting UV gel nail art' },
      { name: 'Keratin Hair Smoothing Treatment', category: 'Hair Care', price: 3500, durationMinutes: 120, gstPercent: 18, description: 'Frizz-free intense hair protein treatment' }
    ],
    defaultStaff: [
      { name: 'Pooja Sharma', role: 'Senior Beautician', mobile: '9820123456', specialty: 'Hydra Facial & Skincare', rating: 4.9, totalJobsCompleted: 340, commissionPercent: 15, dailyTarget: 5000, status: 'Active' },
      { name: 'Rahul Verma', role: 'Master Hair Stylist', mobile: '9820234567', specialty: 'Keratin & Creative Cut', rating: 4.8, totalJobsCompleted: 420, commissionPercent: 18, dailyTarget: 6000, status: 'Active' }
    ],
    defaultPackages: [
      { name: 'Silver Glow Monthly Pass', price: 2500, durationDays: 30, includedServices: ['2 Haircuts', '1 Hydra Facial', '1 Pedicure'], discountPercent: 20, description: 'Monthly grooming package with 20% savings' },
      { name: 'Bridal Luxury Package', price: 12000, durationDays: 15, includedServices: ['Pre-Bridal Skincare', 'Hair Spa', 'Gel Nails', 'Full Body Polish'], discountPercent: 25, description: 'Complete head-to-toe bridal transformation' }
    ]
  },
  {
    id: 'GYM',
    name: 'Fitness Gym & Personal Training',
    group: 'Beauty & Wellness',
    iconName: 'Dumbbell',
    tagline: 'Memberships, Personal Trainers, Workouts, Attendance & Diet',
    customerTerm: 'Member',
    staffTerm: 'Fitness Trainer',
    workOrderTerm: 'Training Pass',
    categories: ['Gym Membership', 'Personal Training', 'Diet & Nutrition', 'Special Group Classes'],
    subIndustries: ['Fitness Gym', 'Personal Trainer', 'Weight Loss Centre', 'Crossfit Arena'],
    defaultServices: [
      { name: 'Monthly Gym Access Pass', category: 'Gym Membership', price: 1500, durationMinutes: 0, gstPercent: 18, description: 'Full access to cardio & weight section', isPopular: true },
      { name: 'Personal Fitness Trainer (12 Sessions)', category: 'Personal Training', price: 6000, durationMinutes: 60, gstPercent: 18, description: 'Dedicated 1-on-1 muscle building & fat loss guidance' },
      { name: 'Customized Macro Diet Plan', category: 'Diet & Nutrition', price: 1000, durationMinutes: 30, gstPercent: 18, description: 'Personalized calorie and protein chart' }
    ],
    defaultStaff: [
      { name: 'Karan Fitness', role: 'Head Strength Coach', mobile: '9877112233', specialty: 'Bodybuilding & Fat Loss', rating: 4.9, totalJobsCompleted: 500, commissionPercent: 30, dailyTarget: 8000, status: 'Active' }
    ],
    defaultPackages: [
      { name: 'Annual Unlimited Fitness Shield', price: 12000, durationDays: 365, includedServices: ['12 Months Gym Access', 'Free Steam Bath', '2 Body Comp Tests'], discountPercent: 33, description: '33% off on 1-year transformation commitment' }
    ]
  },
  {
    id: 'YOGA_CENTRE',
    name: 'Yoga & Wellness Centre',
    group: 'Beauty & Wellness',
    iconName: 'Sun',
    tagline: 'Yoga Classes, Meditation, Sound Therapy, Instructors & Passes',
    customerTerm: 'Practitioner / Member',
    staffTerm: 'Yoga Master / Acharya',
    workOrderTerm: 'Batch Pass',
    categories: ['Hatha Yoga', 'Power Yoga & Weight Loss', 'Meditation & Pranayama'],
    subIndustries: ['Yoga Centre', 'Ayurveda Centre', 'Massage Therapy', 'Meditation Studio'],
    defaultServices: [
      { name: 'Power Yoga & Fat Loss Pass (Monthly)', category: 'Power Yoga & Weight Loss', price: 1800, durationMinutes: 60, gstPercent: 0, description: 'Dynamic Vinyasa flow for calorie burning', isPopular: true }
    ],
    defaultStaff: [
      { name: 'Yogini Ananya', role: 'Lead Yoga Acharya', mobile: '9811778899', specialty: 'Hatha Yoga & Chakra Healing', rating: 4.9, totalJobsCompleted: 480, commissionPercent: 40, dailyTarget: 6000, status: 'Active' }
    ],
    defaultPackages: [
      { name: 'Annual Holistic Wellness Shield', price: 15000, durationDays: 365, includedServices: ['12 Months Unlimited Batches', 'Sound Healing Workshop', 'Diet Chart'], discountPercent: 30, description: 'Year-long physical & mental harmony pass' }
    ]
  },

  // ⚖ LEGAL & PROFESSIONAL
  {
    id: 'LAWYER',
    name: 'Lawyer & Legal Consultation Firm',
    group: 'Legal & Professional',
    iconName: 'Briefcase',
    tagline: 'Client Cases, Consultations, Court Dates, Drafts & Case Files',
    customerTerm: 'Client',
    staffTerm: 'Advocate / Legal Counsel',
    workOrderTerm: 'Case Matter',
    categories: ['Consultation', 'Contract Drafting', 'Court Representation', 'Legal Notice'],
    subIndustries: ['Lawyer Office', 'Law Firm', 'Legal Consultant', 'Property Advocate'],
    defaultServices: [
      { name: 'Legal Consultation (Per Hour)', category: 'Consultation', price: 2500, durationMinutes: 60, gstPercent: 18, description: 'In-depth case evaluation and legal strategy', isPopular: true },
      { name: 'Property Title Verification & Opinion', category: 'Contract Drafting', price: 5000, durationMinutes: 120, gstPercent: 18, description: '30-year search report and non-encumbrance certificate' },
      { name: 'Drafting Legal Notice / Reply', category: 'Legal Notice', price: 3500, durationMinutes: 90, gstPercent: 18, description: 'Formal notice drafting and advocate dispatch' }
    ],
    defaultStaff: [
      { name: 'Adv. Suresh Deshmukh', role: 'Senior Advocate', mobile: '9822334455', specialty: 'Civil & Property Disputes', rating: 4.9, totalJobsCompleted: 430, commissionPercent: 60, dailyTarget: 25000, status: 'Active' }
    ],
    defaultPackages: [
      { name: 'Corporate Legal Retainer', price: 25000, durationDays: 30, includedServices: ['10 Agreement Drafts', 'Unlimited Vetting', 'Priority Court Attendance'], discountPercent: 20, isAmc: true, description: 'Monthly dedicated legal support for enterprises' }
    ]
  },
  {
    id: 'CA_ACCOUNTANT',
    name: 'CA, GST & Tax Consultant Firm',
    group: 'Legal & Professional',
    iconName: 'FileText',
    tagline: 'GST Filings, Income Tax Returns, Audit, Registrations & Accounts',
    customerTerm: 'Client',
    staffTerm: 'Chartered Accountant / Executive',
    workOrderTerm: 'Assignment File',
    categories: ['Tax Filings', 'GST Services', 'Business Audit', 'Company Registration'],
    subIndustries: ['Chartered Accountant', 'Tax Consultant', 'GST Consultant', 'Company Secretary', 'Financial Consultant'],
    defaultServices: [
      { name: 'Individual Income Tax Return (ITR-1/2)', category: 'Tax Filings', price: 1200, durationMinutes: 45, gstPercent: 18, description: 'Form 16 computation, deduction optimization and filing', isPopular: true },
      { name: 'Monthly GST Return Filing (GSTR 1 & 3B)', category: 'GST Services', price: 1500, durationMinutes: 60, gstPercent: 18, description: 'ITC reconciliation and timely return filing' },
      { name: 'Pvt Ltd Company Incorporation', category: 'Company Registration', price: 8500, durationMinutes: 120, gstPercent: 18, description: 'DIN, DSC, MOA, AOA, PAN, TAN and Certificate of Incorporation' }
    ],
    defaultStaff: [
      { name: 'CA Ramesh Mehta', role: 'Managing Partner', mobile: '9811998877', specialty: 'Corporate Tax & GST Audit', rating: 4.9, totalJobsCompleted: 750, commissionPercent: 50, dailyTarget: 20000, status: 'Active' }
    ],
    defaultPackages: [
      { name: 'Annual Business Accounting AMC', price: 18000, durationDays: 365, includedServices: ['12 GST Returns', '1 Annual ITR', '4 Advisory Meetings'], discountPercent: 25, isAmc: true, description: 'End-to-end accounting & compliance retainership' }
    ]
  },

  // 🎓 EDUCATION & TRAINING
  {
    id: 'COACHING_CENTRE',
    name: 'Coaching Institute & Academy',
    group: 'Education & Training',
    iconName: 'GraduationCap',
    tagline: 'Entrance Exam Prep, Student Batches, Attendance, Fees & Courses',
    customerTerm: 'Student',
    staffTerm: 'Faculty Member',
    workOrderTerm: 'Batch Enrollment',
    categories: ['JEE / NEET Prep', 'UPSC & Govt Exams', 'Foundation Courses'],
    subIndustries: ['Coaching Centre', 'Tuition Centre', 'Computer Training Centre', 'Spoken English Institute', 'Skill Development'],
    defaultServices: [
      { name: 'NEET Medical Entrance Batch (Monthly)', category: 'JEE / NEET Prep', price: 4500, durationMinutes: 120, gstPercent: 0, description: 'Daily 4 hours intensive coaching with AIIMS faculty', isPopular: true }
    ],
    defaultStaff: [
      { name: 'Dr. Roy Chemistry', role: 'Senior Chemistry Faculty', mobile: '9899667788', specialty: 'Organic Chemistry & NEET', rating: 4.9, totalJobsCompleted: 530, commissionPercent: 55, dailyTarget: 15000, status: 'Active' }
    ],
    defaultPackages: [
      { name: '2-Year Integrated Target NEET Program', price: 75000, durationDays: 730, includedServices: ['Full Syllabus', 'Doubt Sessions', 'All Test Series'], discountPercent: 25, description: 'Comprehensive 2-year entrance guarantee course' }
    ]
  },

  // 🛠 REPAIR & MAINTENANCE
  {
    id: 'REPAIR_SHOP',
    name: 'Mobile, Laptop & TV Repair Shop',
    group: 'Repair & Maintenance',
    iconName: 'Smartphone',
    tagline: 'Electronics Diagnostics, Screen Replacements, Job Cards & Parts',
    customerTerm: 'Customer',
    staffTerm: 'Technician / Service Engineer',
    workOrderTerm: 'Job Card / Repair Ticket',
    categories: ['Mobile Repair', 'Laptop Repair', 'TV & Electronics', 'Software & Data Recovery'],
    subIndustries: ['Mobile Repair', 'Computer Repair', 'Laptop Repair', 'TV Repair', 'Electronics Repair'],
    defaultServices: [
      { name: 'Display Screen Replacement', category: 'Mobile Repair', price: 2200, durationMinutes: 45, gstPercent: 18, description: 'Original AMOLED / FHD display screen fitment', isPopular: true },
      { name: 'Battery Replacement (Mobile / Laptop)', category: 'Mobile Repair', price: 1200, durationMinutes: 30, gstPercent: 18, description: 'High capacity battery replacement with 6 months warranty' },
      { name: 'Motherboard Chip-Level Repair', category: 'Laptop Repair', price: 2500, durationMinutes: 120, gstPercent: 18, description: 'IC replacement and short circuit diagnosis' },
      { name: 'OS Flashing & Data Recovery', category: 'Software & Data Recovery', price: 800, durationMinutes: 60, gstPercent: 18, description: 'Firmware reinstallation and deleted file recovery' }
    ],
    defaultStaff: [
      { name: 'Rohan Tech', role: 'Hardware Technician', mobile: '9877001122', specialty: 'iPhone & Laptop Chip Repair', rating: 4.8, totalJobsCompleted: 640, commissionPercent: 25, dailyTarget: 5000, status: 'Active' }
    ],
    defaultPackages: [
      { name: 'Laptop Annual Service Protection', price: 1499, durationDays: 365, includedServices: ['2 Thermal Paste Cleaning', 'OS Optimization', 'Free Antivirus'], discountPercent: 25, description: 'Keep laptop running cold and fast for 1 year' }
    ]
  },
  {
    id: 'AC_SERVICE',
    name: 'AC, Fridge & Home Appliance Service',
    group: 'Repair & Maintenance',
    iconName: 'Wind',
    tagline: 'Installation, Repair, Jet Chemical Wash, AMC & Technicians',
    customerTerm: 'Customer / Resident',
    staffTerm: 'AC Technician',
    workOrderTerm: 'Service Ticket',
    categories: ['AC Servicing', 'Installation / Removal', 'Gas Charging', 'AMC Contracts'],
    subIndustries: ['AC Repair & Installation', 'Refrigerator Repair', 'Washing Machine Service', 'CCTV Installation', 'Solar Panel Service'],
    defaultServices: [
      { name: 'Split AC High-Pressure Jet Wash Service', category: 'AC Servicing', price: 599, durationMinutes: 45, gstPercent: 18, description: 'Deep coil jet foam wash, blower cleaning & drain check', isPopular: true },
      { name: 'AC Gas Charging (R32 / R410 / R22)', category: 'Gas Charging', price: 2200, durationMinutes: 60, gstPercent: 18, description: 'Leak detection, brazing and full pressure gas refill' },
      { name: 'Split AC New Installation', category: 'Installation / Removal', price: 1500, durationMinutes: 90, gstPercent: 18, description: 'Indoor/outdoor mounting, copper piping and vacuuming' }
    ],
    defaultStaff: [
      { name: 'Manoj Kumar', role: 'Senior HVAC Tech', mobile: '9844001122', specialty: 'Inverter AC & Gas Leaks', rating: 4.8, totalJobsCompleted: 580, commissionPercent: 30, dailyTarget: 4000, status: 'Active' }
    ],
    defaultPackages: [
      { name: 'Annual AC AMC Contract (1 Unit)', price: 1800, durationDays: 365, includedServices: ['3 Foam Jet Services', 'Free Unlimited Breakdown Visits'], discountPercent: 35, isAmc: true, description: 'Full year cooling guarantee with priority visits' }
    ]
  },
  {
    id: 'RO_WATER_PURIFIER',
    name: 'RO Purifier Installation & AMC',
    group: 'Repair & Maintenance',
    iconName: 'Droplets',
    tagline: 'Purifier Service, Filter Replacement, Complaints & AMC Contracts',
    customerTerm: 'Customer / Resident',
    staffTerm: 'Service Engineer',
    workOrderTerm: 'Service Job Card',
    categories: ['Filter Replacement', 'Installation', 'AMC Plans', 'Repair'],
    subIndustries: ['RO Water Purifier Service', 'Water Softener', 'Purifier Maintenance'],
    defaultServices: [
      { name: 'RO Complete Filter Replacement (3 Filters)', category: 'Filter Replacement', price: 1600, durationMinutes: 45, gstPercent: 18, description: 'Sediment, Carbon and Post-Carbon inline cartridge change', isPopular: true },
      { name: 'RO Membrane Upgrade (100 GPD)', category: 'Filter Replacement', price: 1800, durationMinutes: 30, gstPercent: 18, description: 'High TDS water purification membrane replacement' },
      { name: 'RO Servicing & TDS Adjustment', category: 'Repair', price: 450, durationMinutes: 30, gstPercent: 18, description: 'Pump pressure check, UV lamp test & TDS balancing' }
    ],
    defaultStaff: [
      { name: 'Sanjay Water Tech', role: 'Senior RO Technician', mobile: '9899001122', specialty: 'Industrial & Domestic RO', rating: 4.8, totalJobsCompleted: 820, commissionPercent: 25, dailyTarget: 3500, status: 'Active' }
    ],
    defaultPackages: [
      { name: 'Comprehensive RO AMC (All Filters Free)', price: 3500, durationDays: 365, includedServices: ['2 Complete Filter Changes', '1 Membrane Replacement', 'Unlimited Free Visits'], discountPercent: 30, isAmc: true, description: 'Zero maintenance cost for 1 full year' }
    ]
  },

  // 🚗 AUTOMOBILE
  {
    id: 'AUTOMOBILE_GARAGE',
    name: 'Auto Garage & Car Bike Workshop',
    group: 'Automobile',
    iconName: 'Wrench',
    tagline: 'Vehicle Servicing, Mechanics, Job Cards, Parts & Labour',
    customerTerm: 'Vehicle Owner',
    staffTerm: 'Chief Mechanic',
    workOrderTerm: 'Job Card',
    categories: ['Periodic Maintenance', 'Engine & Brakes', 'Body & Paint', 'AC & Electricals'],
    subIndustries: ['Car Garage', 'Bike Garage', 'Car Washing', 'Wheel Alignment', 'Denting & Painting', 'Tyre Shop', 'Towing Service'],
    defaultServices: [
      { name: 'Periodic General Car Service', category: 'Periodic Maintenance', price: 3500, durationMinutes: 180, gstPercent: 18, description: 'Engine oil change, filter replacement, 40-point inspection', isPopular: true },
      { name: 'Brake Pad Cleaning & Replacement', category: 'Engine & Brakes', price: 850, durationMinutes: 60, gstPercent: 18, description: 'Front/rear brake pads inspection and fitment' },
      { name: 'Car AC Gas Top-up & Cleaning', category: 'AC & Electricals', price: 1800, durationMinutes: 90, gstPercent: 18, description: 'Coolant leak check, evaporator flush & R134a refill' },
      { name: 'Full Body Foam Wash & Wax', category: 'Body & Paint', price: 650, durationMinutes: 45, gstPercent: 18, description: 'High-pressure underbody wash & carnauba waxing' }
    ],
    defaultStaff: [
      { name: 'Master Vikram', role: 'Head Automobile Engineer', mobile: '9866112233', specialty: 'Engine Overhaul & Diagnostics', rating: 4.9, totalJobsCompleted: 1100, commissionPercent: 20, dailyTarget: 15000, status: 'Active' }
    ],
    defaultPackages: [
      { name: 'Car AMC Annual Maintenance', price: 5999, durationDays: 365, includedServices: ['2 Full Services', '4 Car Washes', 'Free Breakdown Towing'], discountPercent: 30, description: 'Worry-free vehicle health coverage' }
    ]
  },

  // 🏠 HOME SERVICES
  {
    id: 'ELECTRICIAN',
    name: 'Electrician & Electrical Services',
    group: 'Home Services',
    iconName: 'Zap',
    tagline: 'Short Circuit Repairs, Switchboard Wiring, DB Box & Fixtures',
    customerTerm: 'Customer / Resident',
    staffTerm: 'Licensed Electrician',
    workOrderTerm: 'Electrical Ticket',
    categories: ['Repair & Short Circuit', 'Light & Fan Fitting', 'Inverter & DB Box', 'Commercial Wiring'],
    subIndustries: ['Electrician', 'Plumbing', 'Carpenter', 'Painter', 'Pest Control', 'House Cleaning'],
    defaultServices: [
      { name: 'MCB Tripping & Short Circuit Repair', category: 'Repair & Short Circuit', price: 550, durationMinutes: 45, gstPercent: 18, description: 'Testing phase voltage and replacing burnt MCB/wiring', isPopular: true },
      { name: 'Decorative Light / Chandelier Assembly & Fit', category: 'Light & Fan Fitting', price: 750, durationMinutes: 60, gstPercent: 18, description: 'Ceiling anchoring, wiring and testing' }
    ],
    defaultStaff: [
      { name: 'Kamlesh Electrician', role: 'Wireman License Grade A', mobile: '9855223344', specialty: 'Phase Balancing & Inverters', rating: 4.9, totalJobsCompleted: 890, commissionPercent: 35, dailyTarget: 3500, status: 'Active' }
    ],
    defaultPackages: [
      { name: 'Annual Home Electrical AMC', price: 1800, durationDays: 365, includedServices: ['2 DB Box Inspections', 'Free Unlimited Emergency Breakdown Visits'], discountPercent: 30, isAmc: true, description: 'Complete electrical safety protection' }
    ]
  },
  {
    id: 'PLUMBING',
    name: 'Plumbing & Water Fitting Service',
    group: 'Home Services',
    iconName: 'Wrench',
    tagline: 'Leak Repairs, Pipe Fitting, Sanitaryware & Tank Cleaning',
    customerTerm: 'Customer / Resident',
    staffTerm: 'Plumber',
    workOrderTerm: 'Plumbing Ticket',
    categories: ['Leak Repair', 'Sanitary Installation', 'Water Tank Cleaning', 'Pipe Fitting'],
    subIndustries: ['Plumbing', 'Sanitary Fitting', 'Water Tank Cleaning'],
    defaultServices: [
      { name: 'Bathroom Tap / Mixer Repair & Fitting', category: 'Sanitary Installation', price: 450, durationMinutes: 30, gstPercent: 18, description: 'Replacing washer, cartridge or fitting new faucet', isPopular: true },
      { name: 'Overhead Water Tank Cleaning (1000L)', category: 'Water Tank Cleaning', price: 800, durationMinutes: 60, gstPercent: 18, description: 'High-pressure anti-bacterial vacuum tank cleaning' }
    ],
    defaultStaff: [
      { name: 'Ramesh Plumber', role: 'Master Fitter', mobile: '9844112233', specialty: 'CPVC & Concealed Piping', rating: 4.8, totalJobsCompleted: 710, commissionPercent: 35, dailyTarget: 3000, status: 'Active' }
    ],
    defaultPackages: [
      { name: 'Home Plumbing Annual Safety Shield', price: 1999, durationDays: 365, includedServices: ['2 Complete Pipeline Inspections', 'Free Unlimited Minor Repair Visits'], discountPercent: 25, isAmc: true, description: 'Zero water leak worry contract' }
    ]
  },
  {
    id: 'PEST_CONTROL',
    name: 'Pest Control & Disinfection Services',
    group: 'Home Services',
    iconName: 'Shield',
    tagline: 'Termite Proofing, Cockroach Gel, Bedbugs & Mosquito AMC',
    customerTerm: 'Customer / Commercial',
    staffTerm: 'Pest Exterminator',
    workOrderTerm: 'Service Visit Card',
    categories: ['Cockroach Control', 'Termite Proofing', 'Bedbug Treatment', 'Rodent Control'],
    subIndustries: ['Pest Control', 'House Cleaning', 'Deep Cleaning', 'Disinfection'],
    defaultServices: [
      { name: 'Odorless Cockroach Herbal Gel Treatment', category: 'Cockroach Control', price: 999, durationMinutes: 45, gstPercent: 18, description: 'Kitchen and bathroom German gel baiting with 6 months warranty', isPopular: true },
      { name: 'Anti-Termite Drilling Chemical Barrier (1 BHK)', category: 'Termite Proofing', price: 4500, durationMinutes: 180, gstPercent: 18, description: 'Wall drilling and chemical injection with 5-year guarantee' }
    ],
    defaultStaff: [
      { name: 'Deepak Exterminator', role: 'Senior Pest Specialist', mobile: '9866334455', specialty: 'Herbal Gel & Termite Shield', rating: 4.8, totalJobsCompleted: 620, commissionPercent: 30, dailyTarget: 4500, status: 'Active' }
    ],
    defaultPackages: [
      { name: 'Annual Pest Free Protection (4 Visits)', price: 2999, durationDays: 365, includedServices: ['4 Herbal Gel Treatments', 'Free Mosquito Spraying', 'Complaints Coverage'], discountPercent: 25, isAmc: true, description: 'Guaranteed pest-free home all year' }
    ]
  },

  // 🖥 IT & TECHNOLOGY
  {
    id: 'DIGITAL_MARKETING_AGENCY',
    name: 'Digital Marketing, SEO & Internet Marketing Agency',
    group: 'IT & Technology',
    iconName: 'Globe',
    tagline: 'SEO, Google Ads, Meta Ads, Social Media Marketing, Leads & Content Strategy',
    customerTerm: 'Client / Business',
    staffTerm: 'Digital Strategist / Media Buyer',
    workOrderTerm: 'Campaign Project / Ticket',
    categories: ['SEO & Organic Growth', 'Paid Ads (Google & Meta)', 'Social Media Marketing', 'Website & Landing Pages', 'Lead Generation & Funnels'],
    subIndustries: ['Digital Marketing Agency', 'SEO Agency', 'Social Media Agency', 'Performance Marketing', 'Internet Marketing Consultant', 'Lead Gen Agency'],
    defaultServices: [
      { name: 'Google Ads & Meta Ads Campaign Setup', category: 'Paid Ads (Google & Meta)', price: 12000, durationMinutes: 120, gstPercent: 18, description: 'High-converting PPC ads, keyword targeting & audience setup', isPopular: true },
      { name: 'Complete Monthly SEO & Organic Ranking', category: 'SEO & Organic Growth', price: 15000, durationMinutes: 180, gstPercent: 18, description: 'On-page SEO, technical audit, backlinks & Google Maps ranking', isPopular: true },
      { name: 'Social Media Management (15 Posts + Reels)', category: 'Social Media Marketing', price: 9500, durationMinutes: 90, gstPercent: 18, description: 'Content calendar, graphic design, reel editing & posting' },
      { name: 'High-Converting Landing Page & Funnel Design', category: 'Website & Landing Pages', price: 14500, durationMinutes: 240, gstPercent: 18, description: 'Mobile responsive React/WordPress landing page with CRM integration' },
      { name: 'Local Business Google Business Profile Boost', category: 'SEO & Organic Growth', price: 4999, durationMinutes: 60, gstPercent: 18, description: 'Map pack optimization, citation building & review booster' }
    ],
    defaultStaff: [
      { name: 'Aakash Digital', role: 'Sr Performance Marketer', mobile: '9822334455', specialty: 'Google Ads & ROI Funnels', rating: 4.9, totalJobsCompleted: 540, commissionPercent: 20, dailyTarget: 12000, status: 'Active' },
      { name: 'Riya Sharma', role: 'Social Media & Content Lead', mobile: '9833445566', specialty: 'Instagram Reels & Brand Copy', rating: 4.8, totalJobsCompleted: 420, commissionPercent: 18, dailyTarget: 8000, status: 'Active' }
    ],
    defaultPackages: [
      { name: '360° Internet Growth Accelerator (3 Months)', price: 35000, durationDays: 90, includedServices: ['SEO Optimization', 'Google/Meta Ads Management', '15 Social Posts/Mo', 'Landing Page'], discountPercent: 25, description: 'All-in-one digital marketing retainer for guaranteed business leads' }
    ]
  },
  {
    id: 'SOFTWARE_IT',
    name: 'Software, Mobile App & Web Development',
    group: 'IT & Technology',
    iconName: 'Code',
    tagline: 'Custom Web Apps, Mobile Apps, Cloud Solutions, APIs & Enterprise Software',
    customerTerm: 'Client / Enterprise',
    staffTerm: 'Lead Developer / Software Architect',
    workOrderTerm: 'SOW / Project Milestone',
    categories: ['Web Application', 'Mobile App (iOS / Android)', 'Custom ERP & CRM', 'API & Cloud Integration'],
    subIndustries: ['Software Agency', 'Web Development Studio', 'Mobile App Developers', 'SaaS Development'],
    defaultServices: [
      { name: 'Custom React & Node.js Web Application', category: 'Web Application', price: 45000, durationMinutes: 600, gstPercent: 18, description: 'Full-stack web application with payment gateway & database', isPopular: true },
      { name: 'Flutter Cross-Platform Mobile App (iOS + Android)', category: 'Mobile App (iOS / Android)', price: 65000, durationMinutes: 900, gstPercent: 18, description: 'Native performance mobile app with push notifications' },
      { name: 'REST API & Third-Party Payment Integration', category: 'API & Cloud Integration', price: 15000, durationMinutes: 180, gstPercent: 18, description: 'Razorpay / Stripe / WhatsApp API setup with webhooks' }
    ],
    defaultStaff: [
      { name: 'Vikram Architect', role: 'Principal Software Architect', mobile: '9877889900', specialty: 'React, Node, Cloud & Security', rating: 4.9, totalJobsCompleted: 280, commissionPercent: 30, dailyTarget: 25000, status: 'Active' }
    ],
    defaultPackages: [
      { name: 'Enterprise SaaS MVP Development Sprint', price: 120000, durationDays: 30, includedServices: ['Web App', 'Mobile App', 'Cloud Hosting Setup', '1 Month Support'], discountPercent: 20, description: 'Complete product launch package in 30 days' }
    ]
  },
  {
    id: 'COMPUTER_AMC',
    name: 'IT Support, Networking & Computer AMC',
    group: 'IT & Technology',
    iconName: 'Server',
    tagline: 'Computer Repair, Office Networking, Server Maintenance & Corporate AMC',
    customerTerm: 'Client / Corporate',
    staffTerm: 'IT Network Engineer',
    workOrderTerm: 'IT Service Ticket',
    categories: ['Computer Repair', 'Networking & Wi-Fi', 'Server Maintenance', 'Corporate AMC'],
    subIndustries: ['Software Company', 'Website Development', 'IT Support', 'Computer AMC', 'Cyber Security'],
    defaultServices: [
      { name: 'Desktop / PC Hardware Troubleshooting', category: 'Computer Repair', price: 650, durationMinutes: 45, gstPercent: 18, description: 'RAM, PSU, Storage & Boot failure diagnostic', isPopular: true },
      { name: 'Office Wi-Fi Router & Firewall Setup', category: 'Networking & Wi-Fi', price: 2500, durationMinutes: 90, gstPercent: 18, description: 'Bandwidth allocation, guest portal and VPN configuration' },
      { name: 'Server Backup & Antivirus Deployment', category: 'Server Maintenance', price: 3500, durationMinutes: 120, gstPercent: 18, description: 'Automated off-site cloud backup and central security installation' }
    ],
    defaultStaff: [
      { name: 'Amit Engineer', role: 'Sr Network Consultant', mobile: '9833445566', specialty: 'Cisco, Server & CCTV', rating: 4.9, totalJobsCompleted: 610, commissionPercent: 25, dailyTarget: 6000, status: 'Active' }
    ],
    defaultPackages: [
      { name: 'Corporate Computer AMC (Per Desktop)', price: 2400, durationDays: 365, includedServices: ['4 Quarterly Preventive Checks', 'Unlimited Remote Support', '4-Hour SLA Onsite Visit'], discountPercent: 25, isAmc: true, description: 'Complete IT downtime prevention contract' }
    ]
  },

  // 📷 CREATIVE SERVICES
  {
    id: 'ADVERTISING_CREATIVE',
    name: 'Advertising, PR & Branding Agency',
    group: 'Creative Services',
    iconName: 'Megaphone',
    tagline: 'Brand Strategy, Billboards, Video Ads, PR Media & Influencer Marketing',
    customerTerm: 'Client / Brand',
    staffTerm: 'Creative Director / PR Manager',
    workOrderTerm: 'Creative Brief / Campaign',
    categories: ['Brand Strategy & Logo', 'PR & Press Releases', 'Video Production & Commercials', 'Influencer Marketing', 'Print & Outdoor Media'],
    subIndustries: ['Advertising Agency', 'PR Agency', 'Branding Studio', 'Influencer Marketing Agency', 'Creative Agency'],
    defaultServices: [
      { name: 'Complete Brand Identity & Logo Suite', category: 'Brand Strategy & Logo', price: 18000, durationMinutes: 300, gstPercent: 18, description: '3 Logo concepts, typography, color guide & stationery mockups', isPopular: true },
      { name: 'National Press Release & Digital PR Distribution', category: 'PR & Press Releases', price: 25000, durationMinutes: 120, gstPercent: 18, description: 'PR article publishing on top news portals & media outlets' },
      { name: 'Commercial Video Ad Production (30 Sec)', category: 'Video Production & Commercials', price: 35000, durationMinutes: 480, gstPercent: 18, description: 'Concept, scripting, studio shoot, voiceover & 4K edit' },
      { name: 'Influencer Marketing Campaign (5 Creators)', category: 'Influencer Marketing', price: 28000, durationMinutes: 180, gstPercent: 18, description: 'Micro-influencer outreach, content approval & campaign tracking' }
    ],
    defaultStaff: [
      { name: 'Karan Creative', role: 'Lead Creative Director', mobile: '9811223344', specialty: 'Brand Campaigns & Video Production', rating: 4.9, totalJobsCompleted: 310, commissionPercent: 25, dailyTarget: 20000, status: 'Active' }
    ],
    defaultPackages: [
      { name: 'Brand Launch & Visibility Package', price: 55000, durationDays: 60, includedServices: ['Brand Identity Suite', 'Press Release', '1 Video Ad', 'Outdoor Banner Design'], discountPercent: 20, description: 'Complete end-to-end brand launch campaign' }
    ]
  },
  {
    id: 'PHOTOGRAPHY',
    name: 'Photography & Videography Studio',
    group: 'Creative Services',
    iconName: 'Camera',
    tagline: 'Pre-Wedding, Shoots, Drone Videos, Albums & Editing',
    customerTerm: 'Client',
    staffTerm: 'Lead Photographer / Editor',
    workOrderTerm: 'Shoot Booking',
    categories: ['Pre-Wedding Shoot', 'Wedding Coverage', 'Product Photography', 'Portfolio Shoot'],
    subIndustries: ['Photography Studio', 'Videography', 'Wedding Photography', 'Flex Printing', 'Branding Agency'],
    defaultServices: [
      { name: 'Cinematic Pre-Wedding Video Shoot', category: 'Pre-Wedding Shoot', price: 25000, durationMinutes: 360, gstPercent: 18, description: '2 Locations, 4K Sony Mirrorless + Drone coverage & teasers', isPopular: true },
      { name: 'High-End Canvera Photobook Album (40 Pages)', category: 'Wedding Coverage', price: 12000, durationMinutes: 120, gstPercent: 18, description: 'Velvet metallic print hardcover album with box' }
    ],
    defaultStaff: [
      { name: 'Nikhil Clicks', role: 'Lead Director of Photography', mobile: '9822001122', specialty: 'Candid & Drone Video', rating: 4.9, totalJobsCompleted: 340, commissionPercent: 30, dailyTarget: 20000, status: 'Active' }
    ],
    defaultPackages: [
      { name: 'Royal Wedding Combo Protection', price: 75000, durationDays: 2, includedServices: ['2 Candid Photographers', '2 Cinematic Videographers', 'Drone', '2 Albums'], discountPercent: 20, description: 'Complete 2-day wedding memory preservation' }
    ]
  },
  {
    id: 'PRINTING_PRESS',
    name: 'Printing Press & Digital Design Studio',
    group: 'Creative Services',
    iconName: 'Printer',
    tagline: 'Flex Banners, Visiting Cards, Pamphlets, Printing & Deliveries',
    customerTerm: 'Client',
    staffTerm: 'Print Operator / Designer',
    workOrderTerm: 'Print Job Ticket',
    categories: ['Offset Printing', 'Flex & Vinyl Banner', 'Corporate Stationery'],
    subIndustries: ['Printing Press', 'Flex Printing', 'Branding Agency', 'Advertising Agency'],
    defaultServices: [
      { name: '1000 Premium Visiting Cards (350 GSM Velvet)', category: 'Corporate Stationery', price: 850, durationMinutes: 60, gstPercent: 18, description: 'Matte lamination with spot UV embossing', isPopular: true }
    ],
    defaultStaff: [
      { name: 'Suresh Prints', role: 'Head Print Master', mobile: '9822889900', specialty: 'Large Format Flex & Offset', rating: 4.8, totalJobsCompleted: 790, commissionPercent: 20, dailyTarget: 8000, status: 'Active' }
    ],
    defaultPackages: [
      { name: 'Startup Branding Printing Kit', price: 4999, durationDays: 30, includedServices: ['1000 Visiting Cards', '100 Letterheads', '2 Flex Banners', '500 Flyers'], discountPercent: 25, description: 'Complete grand launch marketing print package' }
    ]
  },
  {
    id: 'EVENT_MANAGEMENT',
    name: 'Event Management & Wedding Planner',
    group: 'Creative Services',
    iconName: 'Calendar',
    tagline: 'Stage Decor, DJ Systems, Lighting, Catering & Vendor Execution',
    customerTerm: 'Client / Host',
    staffTerm: 'Event Manager',
    workOrderTerm: 'Event Project File',
    categories: ['Decor & Stage', 'Sound & Lighting', 'Catering Coordination', 'Full Event Package'],
    subIndustries: ['Event Management', 'Wedding Planner', 'Banquet Hall', 'Catering'],
    defaultServices: [
      { name: 'Wedding Floral Stage Decoration', category: 'Decor & Stage', price: 35000, durationMinutes: 300, gstPercent: 18, description: 'Fresh flower backdrop, canopy, LED lighting and mandap', isPopular: true },
      { name: 'DJ Sound System & Moving Head Lights', category: 'Sound & Lighting', price: 18000, durationMinutes: 240, gstPercent: 18, description: 'JBL VRX line array, bass cabinets, smoke machine & DJ operator' }
    ],
    defaultStaff: [
      { name: 'Rajesh Events', role: 'Creative Director', mobile: '9811223355', specialty: 'Weddings & Corporate Galas', rating: 4.9, totalJobsCompleted: 210, commissionPercent: 20, dailyTarget: 50000, status: 'Active' }
    ],
    defaultPackages: [
      { name: 'Grand Destination Wedding Package', price: 250000, durationDays: 3, includedServices: ['Sangeet DJ & Lighting', 'Mandap Decor', 'Welcome Entry', 'Catering Setup'], discountPercent: 15, description: 'Complete 3-day stress-free wedding management' }
    ]
  },

  // 🏨 HOSPITALITY & TRAVEL
  {
    id: 'HOTEL_GUESTHOUSE',
    name: 'Hotel, Guest House & Resort',
    group: 'Hospitality & Travel',
    iconName: 'Hotel',
    tagline: 'Room Bookings, Guest Folios, Housekeeping, Check-in & Billing',
    customerTerm: 'Guest',
    staffTerm: 'Hotel Manager / Front Desk',
    workOrderTerm: 'Guest Folio',
    categories: ['Room Tariff', 'Room Service', 'Banquet & Events'],
    subIndustries: ['Hotel', 'Guest House', 'Resort', 'Homestay', 'Car Rental', 'Catering'],
    defaultServices: [
      { name: 'Deluxe AC Room (Per Night)', category: 'Room Tariff', price: 2800, durationMinutes: 1440, gstPercent: 12, description: 'King size bed, complimentary breakfast and high-speed Wi-Fi', isPopular: true }
    ],
    defaultStaff: [
      { name: 'Vikram Hotel Lead', role: 'Front Office Executive', mobile: '9811002233', specialty: 'Guest Relations & Check-in', rating: 4.8, totalJobsCompleted: 620, commissionPercent: 10, dailyTarget: 15000, status: 'Active' }
    ],
    defaultPackages: [
      { name: '3 Days / 2 Nights Weekend Getaway Pass', price: 6999, durationDays: 3, includedServices: ['2 Nights Deluxe Room', 'All Meals Included', 'Free Spa Coupon'], discountPercent: 20, description: 'Complete relaxed weekend resort experience' }
    ]
  },

  // 🏢 PROPERTY & CONSTRUCTION
  {
    id: 'REAL_ESTATE',
    name: 'Real Estate Agency & Property Consultant',
    group: 'Property & Construction',
    iconName: 'Building',
    tagline: 'Property Listings, Site Visits, Agreements, Brokerage & Leads',
    customerTerm: 'Client / Buyer',
    staffTerm: 'Property Agent',
    workOrderTerm: 'Property Deal File',
    categories: ['Buy / Sell Brokerage', 'Rental Agreement', 'Property Valuation'],
    subIndustries: ['Real Estate Agency', 'Property Consultant', 'Property Management', 'Civil Contractor'],
    defaultServices: [
      { name: 'Property Site Visit & Valuation Advisory', category: 'Property Valuation', price: 1500, durationMinutes: 60, gstPercent: 18, description: 'Physical inspection and market rate assessment report', isPopular: true }
    ],
    defaultStaff: [
      { name: 'Rajesh Estate', role: 'Senior Property Broker', mobile: '9822331122', specialty: 'Commercial & Luxury Residential', rating: 4.9, totalJobsCompleted: 310, commissionPercent: 50, dailyTarget: 25000, status: 'Active' }
    ],
    defaultPackages: [
      { name: 'Exclusive Seller Marketing Package', price: 9999, durationDays: 60, includedServices: ['High-res Photography', 'Drone Video', '3D Walkthrough', 'Portal Listing'], discountPercent: 20, description: 'Speedy property sale marketing bundle' }
    ]
  },

  // 🧺 LAUNDRY & CLEANING
  {
    id: 'LAUNDRY',
    name: 'Laundry, Dry Cleaning & Carpet Care',
    group: 'Laundry & Cleaning',
    iconName: 'Shirt',
    tagline: 'Dry Cleaning, Steam Ironing, Stain Removal & Home Delivery',
    customerTerm: 'Customer',
    staffTerm: 'Laundry Operator',
    workOrderTerm: 'Laundry Tag Ticket',
    categories: ['Dry Cleaning', 'Steam Ironing', 'Washing & Folding', 'Carpet & Sofa Wash'],
    subIndustries: ['Laundry', 'Dry Cleaning', 'Ironing Service', 'Carpet Cleaning', 'Sofa Cleaning'],
    defaultServices: [
      { name: 'Men Suit / Blazer Dry Cleaning', category: 'Dry Cleaning', price: 350, durationMinutes: 120, gstPercent: 18, description: 'Gentle chemical cleaning with anti-wrinkle steam press', isPopular: true }
    ],
    defaultStaff: [
      { name: 'Sanjay Dry Cleaners', role: 'Master Pressman', mobile: '9833441122', specialty: 'Silk & Woolen Garments', rating: 4.8, totalJobsCompleted: 850, commissionPercent: 20, dailyTarget: 4000, status: 'Active' }
    ],
    defaultPackages: [
      { name: 'Monthly Executive Ironing Pass (50 Clothes)', price: 999, durationDays: 30, includedServices: ['50 Garments Steam Press', 'Free Doorstep Pickup & Delivery'], discountPercent: 25, description: 'Crisp daily workwear delivered to home' }
    ]
  },

  // 🛡 SECURITY SERVICES
  {
    id: 'SECURITY_AGENCY',
    name: 'Security Guard Agency & CCTV',
    group: 'Security Services',
    iconName: 'Shield',
    tagline: 'Guards Roster, CCTV Live Monitoring, Bouncers & Site Patrol',
    customerTerm: 'Client / Society',
    staffTerm: 'Security Officer / Guard',
    workOrderTerm: 'Duty Contract',
    categories: ['Guard Deployment', 'CCTV Monitoring', 'Event Bouncers'],
    subIndustries: ['Security Agency', 'CCTV Monitoring', 'Fire Safety Services'],
    defaultServices: [
      { name: '24x7 Security Guard Deployment (Monthly)', category: 'Guard Deployment', price: 18000, durationMinutes: 0, gstPercent: 18, description: 'Uniformed trained guard with biometric attendance', isPopular: true }
    ],
    defaultStaff: [
      { name: 'Supervisor Rakesh', role: 'Chief Security Officer', mobile: '9844552211', specialty: 'Ex-Serviceman Site Patrol', rating: 4.9, totalJobsCompleted: 240, commissionPercent: 15, dailyTarget: 20000, status: 'Active' }
    ],
    defaultPackages: [
      { name: 'Housing Society Annual Security Contract', price: 180000, durationDays: 365, includedServices: ['2 Guards 24x7', 'CCTV Monitoring', 'Visitor App'], discountPercent: 15, isAmc: true, description: 'Complete safe community guarding' }
    ]
  },

  // 🌾 AGRICULTURE SERVICES
  {
    id: 'AGRICULTURE',
    name: 'Farm Consultancy & Agri Equipment Rental',
    group: 'Agriculture Services',
    iconName: 'Sprout',
    tagline: 'Soil Testing, Crop Advisory, Drones & Machinery Rentals',
    customerTerm: 'Farmer / Client',
    staffTerm: 'Agri Specialist / Operator',
    workOrderTerm: 'Farm Service Ticket',
    categories: ['Soil Testing', 'Machinery Rental', 'Crop Advisory'],
    subIndustries: ['Farm Consultancy', 'Irrigation Service', 'Soil Testing', 'Agriculture Machinery Rental'],
    defaultServices: [
      { name: 'Digital Soil NPK & Micro-Nutrient Test', category: 'Soil Testing', price: 650, durationMinutes: 60, gstPercent: 0, description: 'Comprehensive soil health card report and fertilizer chart', isPopular: true }
    ],
    defaultStaff: [
      { name: 'Dr. Patil Agri', role: 'Senior Agronomist', mobile: '9811882233', specialty: 'Crop Protection & Yield', rating: 4.9, totalJobsCompleted: 410, commissionPercent: 30, dailyTarget: 5000, status: 'Active' }
    ],
    defaultPackages: [
      { name: 'Seasonal Organic Farming Advisory', price: 4999, durationDays: 120, includedServices: ['4 Field Visits', 'Soil Testing', 'Pest Advisory'], discountPercent: 20, description: 'Complete crop cycle yield maximization' }
    ]
  },

  // 📦 LOGISTICS & COURIER
  {
    id: 'COURIER_LOGISTICS',
    name: 'Courier, Packers & Transport Service',
    group: 'Logistics & Courier',
    iconName: 'Truck',
    tagline: 'Consignments, Parcel Tracking, Relocation & Waybills',
    customerTerm: 'Consignor / Client',
    staffTerm: 'Delivery Executive / Driver',
    workOrderTerm: 'Consignment Note / Waybill',
    categories: ['Domestic Express', 'Packers & Movers', 'Cargo Shipping'],
    subIndustries: ['Courier Service', 'Transport Company', 'Packers & Movers', 'Warehouse Service'],
    defaultServices: [
      { name: '1 BHK Home Relocation Service', category: 'Packers & Movers', price: 8500, durationMinutes: 360, gstPercent: 18, description: 'Bubble wrapping, loading, transport, unloading and setup', isPopular: true }
    ],
    defaultStaff: [
      { name: 'Suresh Transport', role: 'Fleet Captain', mobile: '9822993344', specialty: 'Inter-City Express Logistics', rating: 4.8, totalJobsCompleted: 670, commissionPercent: 25, dailyTarget: 10000, status: 'Active' }
    ],
    defaultPackages: [
      { name: 'Corporate Express Courier Monthly Contract', price: 15000, durationDays: 30, includedServices: ['100 Doorstep Pickups', 'Same-Day City Express', 'POD Tracking'], discountPercent: 20, description: 'Dedicated corporate desk logistics' }
    ]
  },

  // 💰 FINANCIAL SERVICES
  {
    id: 'FINANCE_LOANS',
    name: 'Loan Consultant & Financial Advisory',
    group: 'Financial Services',
    iconName: 'Landmark',
    tagline: 'Home Loans, Business Capital, CIBIL Check & Credit Advisory',
    customerTerm: 'Applicant / Client',
    staffTerm: 'Loan Officer / Financial Advisor',
    workOrderTerm: 'Loan Application File',
    categories: ['Home Loan', 'Business Loan', 'CIBIL Improvement'],
    subIndustries: ['Finance Company', 'Microfinance', 'Loan Consultant', 'Stock Broker', 'Mutual Fund Distributor'],
    defaultServices: [
      { name: 'Business Loan Sanction Advisory', category: 'Business Loan', price: 2500, durationMinutes: 60, gstPercent: 18, description: 'Project report preparation, bank file submission and tracking', isPopular: true }
    ],
    defaultStaff: [
      { name: 'Anand Finance', role: 'Senior Banking Executive', mobile: '9833884411', specialty: 'MSME Loans & Balance Transfer', rating: 4.9, totalJobsCompleted: 520, commissionPercent: 40, dailyTarget: 30000, status: 'Active' }
    ],
    defaultPackages: [
      { name: 'Annual Financial Health & Credit Shield', price: 1999, durationDays: 365, includedServices: ['4 CIBIL Monitoring Reports', 'Tax Savings Plan', 'Loan Eligibility Audit'], discountPercent: 30, description: 'Keep credit score above 780 always' }
    ]
  },

  // 🏛 GOVERNMENT & NGO
  {
    id: 'GOVT_CSC',
    name: 'CSC Centre & NGO Public Services',
    group: 'Government & NGO',
    iconName: 'Building2',
    tagline: 'Aadhaar, PAN, Passport, Certificates & Scheme Filings',
    customerTerm: 'Citizen / Applicant',
    staffTerm: 'CSC Operator / VLE',
    workOrderTerm: 'Application Token',
    categories: ['Aadhaar & PAN', 'Passport & Driving', 'Govt Schemes'],
    subIndustries: ['NGO', 'Trust', 'Society', 'CSC Centre', 'Municipality Service Centre'],
    defaultServices: [
      { name: 'New PAN Card Application Filing', category: 'Aadhaar & PAN', price: 250, durationMinutes: 20, gstPercent: 18, description: 'Form 49A submission with biometric verification', isPopular: true }
    ],
    defaultStaff: [
      { name: 'Operator Rajesh', role: 'Certified VLE', mobile: '9811442255', specialty: 'E-Seva & Portal Services', rating: 4.9, totalJobsCompleted: 1400, commissionPercent: 20, dailyTarget: 3000, status: 'Active' }
    ],
    defaultPackages: [
      { name: 'Complete Citizen Documents Bundle', price: 999, durationDays: 30, includedServices: ['PAN Card', 'Ayushman Bharat', 'Income Certificate', 'E-KYC'], discountPercent: 25, description: 'All essential government ID documents' }
    ]
  },

  // 🕌 RELIGIOUS & TRUST
  {
    id: 'RELIGIOUS_TRUST',
    name: 'Temple Trust & Ashram Management',
    group: 'Religious Services',
    iconName: 'Sun',
    tagline: 'Pooja Bookings, Donations, Events & Volunteer Management',
    customerTerm: 'Devotee / Donor',
    staffTerm: 'Trust Manager / Priest',
    workOrderTerm: 'Pooja Receipt',
    categories: ['Pooja Booking', 'Donation Slip', 'Special Archana'],
    subIndustries: ['Temple Management', 'Trust', 'Ashram', 'Event Donation'],
    defaultServices: [
      { name: 'Special Archana & Abhishek Service', category: 'Pooja Booking', price: 501, durationMinutes: 30, gstPercent: 0, description: 'Personalized priest rituals with prasad delivery', isPopular: true }
    ],
    defaultStaff: [
      { name: 'Panditji Sharma', role: 'Head Priest', mobile: '9822114433', specialty: 'Vedic Chanting & Rituals', rating: 4.9, totalJobsCompleted: 880, commissionPercent: 10, dailyTarget: 5000, status: 'Active' }
    ],
    defaultPackages: [
      { name: 'Annual Devotee Pooja Subscription', price: 5001, durationDays: 365, includedServices: ['12 Monthly Sankalp Poojas', 'VIP Darshan Pass', 'Prasad Home Courier'], discountPercent: 20, description: 'Year-round divine blessings for family' }
    ]
  },

  // 🎭 ENTERTAINMENT & SPORTS
  {
    id: 'ENTERTAINMENT_SPORTS',
    name: 'Gaming Zone, Sports Club & Venue',
    group: 'Entertainment & Sports',
    iconName: 'Gamepad2',
    tagline: 'Turf Bookings, VR Games, Bowling & Birthday Parties',
    customerTerm: 'Player / Visitor',
    staffTerm: 'Game Marshall / Coach',
    workOrderTerm: 'Turf / Game Slot',
    categories: ['Turf Booking', 'VR & Console Gaming', 'Party Booking'],
    subIndustries: ['Cinema', 'Gaming Zone', 'Sports Club', 'Amusement Centre'],
    defaultServices: [
      { name: 'Box Cricket / Football Turf (1 Hour)', category: 'Turf Booking', price: 1200, durationMinutes: 60, gstPercent: 18, description: 'Floodlit FIFA artificial grass turf with gear', isPopular: true }
    ],
    defaultStaff: [
      { name: 'Coach Rohit', role: 'Turf Manager', mobile: '9833552211', specialty: 'Cricket & Event Management', rating: 4.8, totalJobsCompleted: 450, commissionPercent: 15, dailyTarget: 8000, status: 'Active' }
    ],
    defaultPackages: [
      { name: 'Weekend Players Pass (10 Hours)', price: 8999, durationDays: 60, includedServices: ['10 Hours Turf Booking', 'Free Refreshments', 'Priority Night Slots'], discountPercent: 25, description: 'Save 25% on regular turf rentals' }
    ]
  },

  // ⚙ GENERAL SERVICE
  {
    id: 'GENERAL_SERVICE',
    name: 'General Service & Universal Agency',
    group: 'General Service',
    iconName: 'Layers',
    tagline: 'Service Billing, Work Orders, Appointments & Client Tracking',
    customerTerm: 'Customer / Client',
    staffTerm: 'Service Staff / Engineer',
    workOrderTerm: 'Work Order',
    categories: ['General Service', 'Consultation', 'Contract Work'],
    subIndustries: ['General Service Business', 'Multi-Service Agency'],
    defaultServices: [
      { name: 'General Service Consultation', category: 'General Service', price: 1000, durationMinutes: 60, gstPercent: 18, description: 'Standard professional service delivery', isPopular: true }
    ],
    defaultStaff: [
      { name: 'Senior Specialist', role: 'Lead Agent', mobile: '9800011122', specialty: 'Service Operations', rating: 4.8, totalJobsCompleted: 500, commissionPercent: 20, dailyTarget: 5000, status: 'Active' }
    ],
    defaultPackages: [
      { name: 'Annual Service Retainer', price: 12000, durationDays: 365, includedServices: ['Priority Support', 'Quarterly Audit', 'Discounted Labour'], discountPercent: 20, description: 'Full year retainership' }
    ]
  }
];

export function getServiceSectorConfig(sectorId: ServiceSector): ServiceSectorConfig {
  return SERVICE_SECTORS.find(s => s.id === sectorId) || SERVICE_SECTORS[0];
}
