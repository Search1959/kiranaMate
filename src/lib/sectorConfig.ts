import { TradingSector, StoreSettings, Product, Supplier, Customer, Sale, Purchase, Expense } from '../types';

export interface SectorDefinition {
  id: TradingSector;
  name: string;
  tagline: string;
  shortLabel: string;
  iconName: string;
  color: string; // Tailwind color string for badges
  description: string;
  primaryUnits: string[];
  categories: string[];
  defaultGstPercent: number;
  invoiceScanHint: string;
  demoStoreId: string;
  defaultSettings: Partial<StoreSettings>;
  sampleSuppliers: Partial<Supplier>[];
  sampleProducts: Partial<Product>[];
}

export const TRADING_SECTORS: SectorDefinition[] = [
  {
    id: 'KIRANA_FMCG',
    name: 'Kirana & FMCG Retail / Wholesale',
    shortLabel: 'Kirana & FMCG',
    tagline: 'Groceries, Daily Essentials & Packaged Consumer Goods',
    iconName: 'ShoppingBag',
    color: 'emerald',
    description: 'Packaged foods, grains, pulses, personal care, soaps, beverages & household essentials.',
    primaryUnits: ['kg', 'g', 'pkt', 'box', 'bottle', 'pouch', 'jar', 'tin', 'pcs'],
    categories: [
      'Rice & Grains',
      'Atta & Flours',
      'Dals & Pulses',
      'Edible Oils & Ghee',
      'Spices & Masalas',
      'Biscuits & Cookies',
      'Snacks & Namkeen',
      'Beverages & Tea/Coffee',
      'Dairy & Bakery',
      'Personal Care & Soap',
      'Cleaning & Household',
      'Other'
    ],
    defaultGstPercent: 5,
    invoiceScanHint: 'Look for FMCG brand names, MRP, batch numbers, tax rates (0%, 5%, 18%), item quantities in pouches/packets/kg.',
    demoStoreId: 'store-demo-kirana',
    defaultSettings: {
      storeName: 'Gupta Kirana & FMCG Wholesale',
      tagline: 'Your Trusted Neighborhood Grocer • Fast Delivery & Fresh Stock',
      invoicePrefix: 'KRN-2026-'
    },
    sampleSuppliers: [
      { name: 'Fortune & Adani Wilmar Wholesalers', contactPerson: 'Vikram Sharma', mobile: '9829011223', city: 'Jaipur', outstandingBalance: 12500 },
      { name: 'ITC Foods Wholesale Depot', contactPerson: 'Sunil Agrawal', mobile: '9829022334', city: 'Jaipur', outstandingBalance: 8400 },
      { name: 'Parle & Britannia Agencies', contactPerson: 'Manoj Jain', mobile: '9829033445', city: 'Jaipur', outstandingBalance: 0 },
      { name: 'HUL & Personal Care Depot', contactPerson: 'Rajesh Verma', mobile: '9829044556', city: 'Jaipur', outstandingBalance: 18200 }
    ],
    sampleProducts: [
      { name: 'Aashirvaad Shudh Chakki Atta 10kg', category: 'Atta & Flours', brand: 'Aashirvaad', unit: 'pkt', purchasePrice: 380, sellingPrice: 420, mrp: 445, currentStock: 25, minStock: 8, gstPercent: 0 },
      { name: 'Fortune Kachi Ghani Mustard Oil 1L', category: 'Edible Oils & Ghee', brand: 'Fortune', unit: 'pouch', purchasePrice: 122, sellingPrice: 138, mrp: 155, currentStock: 40, minStock: 10, gstPercent: 5 },
      { name: 'Tata Salt Vacuum Evaporated 1kg', category: 'Spices & Masalas', brand: 'Tata', unit: 'pkt', purchasePrice: 22, sellingPrice: 28, mrp: 28, currentStock: 90, minStock: 20, gstPercent: 0 },
      { name: 'India Gate Dubar Basmati Rice 5kg', category: 'Rice & Grains', brand: 'India Gate', unit: 'pkt', purchasePrice: 460, sellingPrice: 520, mrp: 560, currentStock: 15, minStock: 5, gstPercent: 0 },
      { name: 'Maggi 2-Min Masala Noodles (4-Pack)', category: 'Snacks & Namkeen', brand: 'Nestle', unit: 'pkt', purchasePrice: 46, sellingPrice: 56, mrp: 60, currentStock: 50, minStock: 12, gstPercent: 18 }
    ]
  },
  {
    id: 'METALS_STEEL',
    name: 'Iron, Steel & Metals Trading',
    shortLabel: 'Metals & Steel',
    tagline: 'Primary & Secondary Steel • TMT Bars, Coils, Pipes & Wire Rods',
    iconName: 'Boxes',
    color: 'blue',
    description: 'TMT Rebars, HR/CR Coils, GI Pipes, Structural Steel, Copper Wires, Aluminum Sheets & Scrap Trading.',
    primaryUnits: ['MT', 'Quintal', 'Kg', 'Meter', 'Length', 'Sheet', 'Bundle', 'Pcs'],
    categories: [
      'TMT Rebars & Construction Steel',
      'Hot & Cold Rolled Coils/Sheets',
      'Structural Steel (I-Beam/Angle/Channel)',
      'GI & MS Steel Pipes',
      'Non-Ferrous Metals (Copper/Brass/Aluminum)',
      'Wire Rods & Mesh',
      'Metal Scrap & Billets',
      'Other'
    ],
    defaultGstPercent: 18,
    invoiceScanHint: 'Look for Weigh Bridge Slip weight in Metric Tonnes (MT) or Quintals, Heat Number, Mill Test Certificate No, BIS Grade (e.g. Fe500D), Rate per Tonne, and 18% GST.',
    demoStoreId: 'store-demo-steel',
    defaultSettings: {
      storeName: 'Apex Steel & Metal Traders',
      tagline: 'Authorized Distributor • TMT Fe500D, Steel Coils, Structural Beams & Pipes',
      invoicePrefix: 'STL-2026-'
    },
    sampleSuppliers: [
      { name: 'Tata Steel BSL Distribution', contactPerson: 'Harpreet Singh', mobile: '9810012345', city: 'Ludhiana', outstandingBalance: 420000 },
      { name: 'JSW Steel Stockists Ltd.', contactPerson: 'Anand Kulkarni', mobile: '9822023456', city: 'Mumbai', outstandingBalance: 280000 },
      { name: 'Jindal Panther TMT Depot', contactPerson: 'Pravin Mittal', mobile: '9833034567', city: 'Raigarh', outstandingBalance: 150000 },
      { name: 'Hindalco Copper & Aluminum Alloys', contactPerson: 'Ramesh Shah', mobile: '9844045678', city: 'Ahmedabad', outstandingBalance: 85000 }
    ],
    sampleProducts: [
      { name: 'Tata Tiscon Fe500D TMT Bar 12mm', category: 'TMT Rebars & Construction Steel', brand: 'Tata Steel', unit: 'MT', purchasePrice: 52000, sellingPrice: 56500, mrp: 58000, currentStock: 45, minStock: 10, gstPercent: 18 },
      { name: 'JSW Neosteel Fe550D TMT Bar 16mm', category: 'TMT Rebars & Construction Steel', brand: 'JSW Steel', unit: 'MT', purchasePrice: 51500, sellingPrice: 55800, mrp: 57500, currentStock: 30, minStock: 8, gstPercent: 18 },
      { name: 'Hot Rolled (HR) Steel Sheet Coil 2.5mm', category: 'Hot & Cold Rolled Coils/Sheets', brand: 'SAIL', unit: 'MT', purchasePrice: 54000, sellingPrice: 58900, mrp: 61000, currentStock: 18, minStock: 5, gstPercent: 18 },
      { name: 'Galvanized Iron (GI) Pipe 2 Inch Class B', category: 'GI & MS Steel Pipes', brand: 'Jindal Star', unit: 'Length', purchasePrice: 1850, sellingPrice: 2150, mrp: 2300, currentStock: 120, minStock: 25, gstPercent: 18 },
      { name: 'Electrolytic Copper Wire Rod 8mm (99.9% Pure)', category: 'Non-Ferrous Metals (Copper/Brass/Aluminum)', brand: 'Hindalco', unit: 'Kg', purchasePrice: 780, sellingPrice: 840, mrp: 870, currentStock: 850, minStock: 150, gstPercent: 18 },
      { name: 'MS Equal Angle Steel 50x50x5mm', category: 'Structural Steel (I-Beam/Angle/Channel)', brand: 'Kamdhenu', unit: 'MT', purchasePrice: 49500, sellingPrice: 53800, mrp: 55000, currentStock: 22, minStock: 5, gstPercent: 18 }
    ]
  },
  {
    id: 'AGRICULTURE',
    name: 'Agricultural Commodities & Grain Trading',
    shortLabel: 'Agri Commodities',
    tagline: 'Direct Mandi Sourcing • Wheat, Paddy, Pulses, Oilseeds & Cotton',
    iconName: 'Wheat',
    color: 'amber',
    description: 'Bulk grain trading, mandi arhat, paddy, wheat, soybeans, mustard, pulses, cotton bales & oilseeds.',
    primaryUnits: ['Quintal', 'MT', 'Bags (50kg)', 'Kg', 'Bales'],
    categories: [
      'Food Grains (Wheat/Paddy/Maize)',
      'Pulses & Legumes (Chana/Toor/Moong)',
      'Oilseeds (Mustard/Soybean/Groundnut)',
      'Cash Crops & Cotton Bales',
      'Spices & Whole Herbs (Jeera/Coriander)',
      'Animal Feed & Cattle Chow',
      'Other'
    ],
    defaultGstPercent: 0,
    invoiceScanHint: 'Look for Mandi Gate Pass / Sauda Slip No, Moisture Content %, Quality Grade (FAQ), Bag Count (50kg), Weight in Quintals, Arhat / Brokerage Fees, and Mandi Tax.',
    demoStoreId: 'store-demo-agri',
    defaultSettings: {
      storeName: 'Kisan Grain & Agri Commodity Traders',
      tagline: 'Mandi Commission Agent & Bulk Exporter • High Quality Food Grains & Oilseeds',
      invoicePrefix: 'AGR-2026-'
    },
    sampleSuppliers: [
      { name: 'Jaipur Grain Mandi Traders Association', contactPerson: 'Ramswaroop Meena', mobile: '9829088990', city: 'Jaipur', outstandingBalance: 180000 },
      { name: 'Kota Soyabean Producer Co-op', contactPerson: 'Devendra Patel', mobile: '9829011999', city: 'Kota', outstandingBalance: 95000 },
      { name: 'Sri Ganganagar Mustard & Wheat Mandi', contactPerson: 'Gurbachan Singh', mobile: '9829022888', city: 'Sri Ganganagar', outstandingBalance: 210000 }
    ],
    sampleProducts: [
      { name: 'Sharbati Wheat Premium FAQ Grade', category: 'Food Grains (Wheat/Paddy/Maize)', brand: 'Desi Mandi Sourced', unit: 'Quintal', purchasePrice: 2450, sellingPrice: 2750, mrp: 2900, currentStock: 350, minStock: 50, gstPercent: 0 },
      { name: 'Sona Masoori Raw Paddy Grain', category: 'Food Grains (Wheat/Paddy/Maize)', brand: 'Kaveri Basin', unit: 'Quintal', purchasePrice: 2100, sellingPrice: 2380, mrp: 2500, currentStock: 500, minStock: 80, gstPercent: 0 },
      { name: 'Yellow Soybean Non-GMO High Oil', category: 'Oilseeds (Mustard/Soybean/Groundnut)', brand: 'Malwa Sourced', unit: 'Quintal', purchasePrice: 4300, sellingPrice: 4750, mrp: 4900, currentStock: 220, minStock: 40, gstPercent: 0 },
      { name: 'Black Mustard Seed (Rai) Bold', category: 'Oilseeds (Mustard/Soybean/Groundnut)', brand: 'Hadoti Agro', unit: 'Quintal', purchasePrice: 5100, sellingPrice: 5600, mrp: 5800, currentStock: 180, minStock: 30, gstPercent: 0 },
      { name: 'Desi Cotton Bales Pressed (170kg)', category: 'Cash Crops & Cotton Bales', brand: 'Gujarat Cotton Federation', unit: 'Bales', purchasePrice: 10200, sellingPrice: 11400, mrp: 12000, currentStock: 85, minStock: 15, gstPercent: 5 }
    ]
  },
  {
    id: 'TEXTILES',
    name: 'Textiles, Fabrics & Garments Trading',
    shortLabel: 'Textiles & Fabrics',
    tagline: 'Wholesale Fabrics, Yarns, Suitings, Sarees & Readymade Garments',
    iconName: 'Scissors',
    color: 'purple',
    description: 'Cotton/Synthetic fabrics, yarn bales, suitings, shirtings, denim rolls, sarees, unstitched dress material & garments.',
    primaryUnits: ['Meter', 'Bale', 'Roll', 'Piece', 'Box', 'Dozen'],
    categories: [
      'Cotton & Rayon Printing Fabrics',
      'Suitings & Shirtings Material',
      'Denim & Heavy Canvas Fabrics',
      'Yarns & Sewing Threads',
      'Sarees & Ethnic Wear Collections',
      'Readymade Garments & Hosiery',
      'Other'
    ],
    defaultGstPercent: 5,
    invoiceScanHint: 'Look for Fabric Than / Roll Length in Meters, Design Number, Shade No, Yarn Count (e.g. 60s Combed), GSM, HSN 5208 / 5407, and 5% GST.',
    demoStoreId: 'store-demo-textile',
    defaultSettings: {
      storeName: 'Royal Fabric & Textile Mill Outlet',
      tagline: 'Wholesale Textile Merchant • Surat & Ahmedabad Direct Mill Supply',
      invoicePrefix: 'TXT-2026-'
    },
    sampleSuppliers: [
      { name: 'Surat Textile Processors & Mills', contactPerson: 'Dinesh Reshamwala', mobile: '9825011122', city: 'Surat', outstandingBalance: 165000 },
      { name: 'Bhilwara Suiting & Fabric Corp', contactPerson: 'Kailash Kabra', mobile: '9828022233', city: 'Bhilwara', outstandingBalance: 98000 },
      { name: 'Ludhiana Hosiery & Yarn Depot', contactPerson: 'Manmohan Thapar', mobile: '9814033344', city: 'Ludhiana', outstandingBalance: 112000 }
    ],
    sampleProducts: [
      { name: '100% Combed Cotton Printed Fabric 60s Count', category: 'Cotton & Rayon Printing Fabrics', brand: 'Surat Mills', unit: 'Meter', purchasePrice: 62, sellingPrice: 85, mrp: 98, currentStock: 2400, minStock: 300, gstPercent: 5 },
      { name: 'Indigo Blue Denim Fabric 12oz Stretch', category: 'Denim & Heavy Canvas Fabrics', brand: 'Arvind Denim', unit: 'Roll', purchasePrice: 4200, sellingPrice: 5100, mrp: 5500, currentStock: 45, minStock: 10, gstPercent: 5 },
      { name: 'Poly-Viscose Premium Trouser Suiting', category: 'Suitings & Shirtings Material', brand: 'Raymond', unit: 'Meter', purchasePrice: 180, sellingPrice: 240, mrp: 280, currentStock: 850, minStock: 150, gstPercent: 5 },
      { name: 'Pure Silk Banarasi Zari Border Saree', category: 'Sarees & Ethnic Wear Collections', brand: 'Varanasi Weavers', unit: 'Piece', purchasePrice: 2800, sellingPrice: 3800, mrp: 4200, currentStock: 35, minStock: 8, gstPercent: 5 },
      { name: 'Polyester Spun Yarn 30s Count (50kg Bale)', category: 'Yarns & Sewing Threads', brand: 'Vardhman Yarns', unit: 'Bale', purchasePrice: 7200, sellingPrice: 8100, mrp: 8500, currentStock: 28, minStock: 5, gstPercent: 12 }
    ]
  },
  {
    id: 'CHEMICALS',
    name: 'Chemicals, Petrochemicals & Polymers',
    shortLabel: 'Chemicals & Polymers',
    tagline: 'Industrial Solvents, Polymer Granules, Resins & Fertilizers',
    iconName: 'FlaskConical',
    color: 'teal',
    description: 'Solvents, virgin polymer granules (HDPE/PP/PVC), industrial resins, fertilizers, specialty chemicals & bulk drums.',
    primaryUnits: ['MT', 'Drum (200L)', 'Barrel', 'Bag (25kg)', 'Litres', 'Kg'],
    categories: [
      'Industrial Solvents & Alcohols',
      'Polymer & Plastic Granules (HDPE/PP/LLDPE)',
      'Resins & Adhesives',
      'Agricultural Fertilizers & Micronutrients',
      'Industrial Acids & Alkalis',
      'Paints, Pigments & Dyes',
      'Other'
    ],
    defaultGstPercent: 18,
    invoiceScanHint: 'Look for Chemical CAS Number, Batch / Lot No, Purity % (e.g. 99.9%), MSDS / Safety Data Sheet ref, Drum / Tanker Net Weight, and HSN Code 28/29/39.',
    demoStoreId: 'store-demo-chemical',
    defaultSettings: {
      storeName: 'Bharat Industrial Chemicals & Polymers',
      tagline: 'Authorized Stockists • Solvents, Polymer Granules, DAP & Specialty Chemicals',
      invoicePrefix: 'CHM-2026-'
    },
    sampleSuppliers: [
      { name: 'Reliance Industries Polymer Division', contactPerson: 'Sameer Parikh', mobile: '9820055443', city: 'Hazira', outstandingBalance: 520000 },
      { name: 'Gujarat Alkalis & Chemicals Ltd', contactPerson: 'Bhavesh Patel', mobile: '9826066554', city: 'Vadodara', outstandingBalance: 240000 },
      { name: 'Deepak Nitrite & Solvents Corp', contactPerson: 'Pankaj Mehta', mobile: '9827077665', city: 'Ankleshwar', outstandingBalance: 180000 }
    ],
    sampleProducts: [
      { name: 'HDPE Virgin Polymer Granules Blow Moulding', category: 'Polymer & Plastic Granules (HDPE/PP/LLDPE)', brand: 'Reliance Repol', unit: 'MT', purchasePrice: 94000, sellingPrice: 102500, mrp: 106000, currentStock: 25, minStock: 5, gstPercent: 18 },
      { name: 'Isopropyl Alcohol (IPA) 99.9% Pure (200L Drum)', category: 'Industrial Solvents & Alcohols', brand: 'Deepak Phenolics', unit: 'Drum (200L)', purchasePrice: 18500, sellingPrice: 21200, mrp: 22500, currentStock: 30, minStock: 8, gstPercent: 18 },
      { name: 'Industrial Grade Toluene Solvent (200L Drum)', category: 'Industrial Solvents & Alcohols', brand: 'BPCL Petrochem', unit: 'Drum (200L)', purchasePrice: 16200, sellingPrice: 18800, mrp: 20000, currentStock: 18, minStock: 5, gstPercent: 18 },
      { name: 'NPK Water Soluble Fertilizer 19-19-19 (25kg Bag)', category: 'Agricultural Fertilizers & Micronutrients', brand: 'Mahadhan', unit: 'Bag (25kg)', purchasePrice: 1450, sellingPrice: 1720, mrp: 1850, currentStock: 140, minStock: 30, gstPercent: 5 },
      { name: 'Caustic Soda Flakes 98.5% Pure (50kg Bag)', category: 'Industrial Acids & Alkalis', brand: 'GACL', unit: 'Bag (25kg)', purchasePrice: 1100, sellingPrice: 1350, mrp: 1450, currentStock: 90, minStock: 20, gstPercent: 18 }
    ]
  },
  {
    id: 'ENERGY',
    name: 'Energy & Fuel Commodities Trading',
    shortLabel: 'Energy & Fuel',
    tagline: 'Industrial Lubricants, Fuel Oil, Natural Gas & Steam Coal',
    iconName: 'Zap',
    color: 'orange',
    description: 'Industrial lubricants, engine oils, commercial LPG, compressed natural gas, coal, furnace oil & DEF AdBlue.',
    primaryUnits: ['Litres', 'Drum (210L)', 'Cylinder (19kg)', 'MT', 'Barrel'],
    categories: [
      'Industrial Lubricants & Hydraulic Oils',
      'Automotive Engine Oils & Greases',
      'Light Diesel & Furnace Fuel Oil',
      'LPG & Compressed Natural Gas Cylinders',
      'Steam Coal & Biomass Pellets',
      'Diesel Exhaust Fluid (AdBlue DEF)',
      'Other'
    ],
    defaultGstPercent: 18,
    invoiceScanHint: 'Look for Viscosity Grade (e.g. ISO VG 68, 15W40), Flash Point, Density at 15C, Gross Calorific Value (GCV) for Coal, and Tanker / Cylinder Serial Numbers.',
    demoStoreId: 'store-demo-energy',
    defaultSettings: {
      storeName: 'National Energy & Lubricants Depot',
      tagline: 'Industrial Energy Partner • Castrol, Servo, Commercial LPG & Steam Coal',
      invoicePrefix: 'NRG-2026-'
    },
    sampleSuppliers: [
      { name: 'Indian Oil Corporation Lubricants Depot', contactPerson: 'Sunil Mathur', mobile: '9811099887', city: 'Delhi', outstandingBalance: 310000 },
      { name: 'Castrol India Industrial Wholesalers', contactPerson: 'Nitin Roy', mobile: '9820088776', city: 'Mumbai', outstandingBalance: 195000 },
      { name: 'Adani Gas & Energy Solutions', contactPerson: 'Alok Gupta', mobile: '9825077665', city: 'Ahmedabad', outstandingBalance: 140000 }
    ],
    sampleProducts: [
      { name: 'Servo System 68 Hydraulic Oil (210L Barrel)', category: 'Industrial Lubricants & Hydraulic Oils', brand: 'IOCL Servo', unit: 'Drum (210L)', purchasePrice: 32500, sellingPrice: 36800, mrp: 39000, currentStock: 18, minStock: 4, gstPercent: 18 },
      { name: 'Castrol CRB Turbomax 15W-40 Engine Oil (20L)', category: 'Automotive Engine Oils & Greases', brand: 'Castrol', unit: 'Bucket', purchasePrice: 4800, sellingPrice: 5500, mrp: 5900, currentStock: 40, minStock: 10, gstPercent: 18 },
      { name: 'Commercial LPG Gas Cylinder 19kg Red', category: 'LPG & Compressed Natural Gas Cylinders', brand: 'Indane Commercial', unit: 'Cylinder (19kg)', purchasePrice: 1650, sellingPrice: 1850, mrp: 1950, currentStock: 85, minStock: 20, gstPercent: 18 },
      { name: 'Imported Indonesian Steam Coal 5500 GAR', category: 'Steam Coal & Biomass Pellets', brand: 'Adani Energy', unit: 'MT', purchasePrice: 8200, sellingPrice: 9400, mrp: 9800, currentStock: 120, minStock: 25, gstPercent: 5 },
      { name: 'Diesel Exhaust Fluid DEF AdBlue 205L Barrel', category: 'Diesel Exhaust Fluid (AdBlue DEF)', brand: 'Veedol DEF', unit: 'Barrel', purchasePrice: 7200, sellingPrice: 8500, mrp: 9100, currentStock: 22, minStock: 5, gstPercent: 18 }
    ]
  },
  {
    id: 'JEWELLERY',
    name: 'Jewellery & Precious Metals Trading',
    shortLabel: 'Jewellery & Gold',
    tagline: 'Certified 22K/24K Gold Bullion, Silver Bars, Solitaires & Fine Jewelry',
    iconName: 'Gem',
    color: 'rose',
    description: 'Gold bullion 24K, silver 999 bars, 22K gold ornaments, hallmark HUID items, solitaire diamonds & gemstones.',
    primaryUnits: ['g', 'Tola (11.66g)', 'Carat (ct)', 'Pcs'],
    categories: [
      '24K Gold Bullion Bars & Coins',
      '22K Gold Antique & Bridal Ornaments',
      'Fine Silver Bars & Utensils (999 Pure)',
      'Diamond Solitaires & Gemstones',
      '18K Modern Diamond Jewelry',
      'Other'
    ],
    defaultGstPercent: 3,
    invoiceScanHint: 'Look for Fine Gold Weight in Grams, Gold Purity (999 / 916 / 750), Hallmark HUID Number, Making Charges per gram, Wastage %, and 3% GST rate.',
    demoStoreId: 'store-demo-jewellery',
    defaultSettings: {
      storeName: 'Swarna Jewellers & Bullion Traders',
      tagline: 'BIS Hallmarked 916 Gold • Certified 24K Bullion Coins & Solitaire Diamonds',
      invoicePrefix: 'JWL-2026-'
    },
    sampleSuppliers: [
      { name: 'MMTC-PAMP India Refineries', contactPerson: 'Subhash Agrawal', mobile: '9810077112', city: 'Delhi', outstandingBalance: 850000 },
      { name: 'Surat Diamond Exporters Consortium', contactPerson: 'Jignesh Zaveri', mobile: '9825088223', city: 'Surat', outstandingBalance: 620000 },
      { name: 'Zaveri Bazaar Gold Bullion Merchant', contactPerson: 'Chandrakant Soni', mobile: '9820099334', city: 'Mumbai', outstandingBalance: 410000 }
    ],
    sampleProducts: [
      { name: 'MMTC-PAMP 24K Minted Gold Bullion Bar 10g (999.9)', category: '24K Gold Bullion Bars & Coins', brand: 'MMTC-PAMP', unit: 'g', purchasePrice: 71000, sellingPrice: 73500, mrp: 75000, currentStock: 15, minStock: 3, gstPercent: 3 },
      { name: '22K Gold Antique Kundan Bridal Necklace (HUID)', category: '22K Gold Antique & Bridal Ornaments', brand: 'In-House Artisan', unit: 'Pcs', purchasePrice: 285000, sellingPrice: 315000, mrp: 330000, currentStock: 4, minStock: 1, gstPercent: 3 },
      { name: '999 Fine Silver Bullion Bar 1kg Sealed', category: 'Fine Silver Bars & Utensils (999 Pure)', brand: 'Augmont', unit: 'Pcs', purchasePrice: 84000, sellingPrice: 88500, mrp: 91000, currentStock: 12, minStock: 2, gstPercent: 3 },
      { name: 'VVS1 Clarity Round Brilliant Diamond Solitaire 1.05ct', category: 'Diamond Solitaires & Gemstones', brand: 'GIA Certified', unit: 'Carat (ct)', purchasePrice: 195000, sellingPrice: 235000, mrp: 250000, currentStock: 3, minStock: 1, gstPercent: 3 }
    ]
  },
  {
    id: 'STATIONERY',
    name: 'Stationery, Paper & Office Supplies',
    shortLabel: 'Stationery & Paper',
    tagline: 'Copier Paper, Commercial Stationery, Packaging & Office Supplies',
    iconName: 'FileText',
    color: 'indigo',
    description: 'A4 copier paper reams, executive registers, pens, corrugated packaging boxes, tapes, printer cartridges & office gear.',
    primaryUnits: ['Ream', 'Box', 'Dozen', 'Pcs', 'Packet', 'Bundle'],
    categories: [
      'Copier & Commercial Printing Paper',
      'Notebooks, Diaries & Account Registers',
      'Writing Instruments & Markers',
      'Packaging Tapes & Corrugated Boxes',
      'Office Automation & Printer Toners',
      'School & Art Supplies',
      'Other'
    ],
    defaultGstPercent: 12,
    invoiceScanHint: 'Look for GSM (e.g. 75 GSM A4), Paper Brand (JK, BILT, Century), Ream / Box Count, HSN 4802 / 9608, and 12% / 18% GST.',
    demoStoreId: 'store-demo-stationery',
    defaultSettings: {
      storeName: 'Metro Paper & Office Supplies Wholesalers',
      tagline: 'Bulk Commercial Paper Wholesaler • JK Copier, Classmate & Office Depot',
      invoicePrefix: 'STN-2026-'
    },
    sampleSuppliers: [
      { name: 'JK Paper & BILT Mills Agency', contactPerson: 'Anil Jhunjhunwala', mobile: '9811022334', city: 'Delhi', outstandingBalance: 45000 },
      { name: 'ITC Classmate Stationery Depot', contactPerson: 'Manoj Goyal', mobile: '9829033445', city: 'Jaipur', outstandingBalance: 28000 },
      { name: 'Reynolds & Cello Pen Corp', contactPerson: 'Sanjay Jain', mobile: '9820044556', city: 'Mumbai', outstandingBalance: 19000 }
    ],
    sampleProducts: [
      { name: 'JK Copier Paper A4 Size 75GSM (500 Sheets)', category: 'Copier & Commercial Printing Paper', brand: 'JK Paper', unit: 'Ream', purchasePrice: 220, sellingPrice: 265, mrp: 290, currentStock: 350, minStock: 50, gstPercent: 12 },
      { name: 'Classmate Hardbound Register 400 Pages Rule', category: 'Notebooks, Diaries & Account Registers', brand: 'ITC Classmate', unit: 'Pcs', purchasePrice: 110, sellingPrice: 145, mrp: 160, currentStock: 120, minStock: 25, gstPercent: 12 },
      { name: 'Cello Butterflow Ball Pen Blue (Box of 50)', category: 'Writing Instruments & Markers', brand: 'Cello', unit: 'Box', purchasePrice: 380, sellingPrice: 460, mrp: 500, currentStock: 65, minStock: 15, gstPercent: 12 },
      { name: 'Heavy Duty Brown BOPP Packaging Tape 2 Inch', category: 'Packaging Tapes & Corrugated Boxes', brand: 'Wonder Tape', unit: 'Box', purchasePrice: 420, sellingPrice: 520, mrp: 580, currentStock: 40, minStock: 10, gstPercent: 18 }
    ]
  },
  {
    id: 'BUILDING_HARDWARE',
    name: 'Building Materials & Hardware Trading',
    shortLabel: 'Building & Hardware',
    tagline: 'Cement, Bricks, Tiles, Sanitaryware, Paints & Electricals',
    iconName: 'Hammer',
    color: 'stone',
    description: 'Cement bags, floor tiles, sanitary fittings, CPVC pipes, Asian Paints, electrical wire coils, door hardware & glass.',
    primaryUnits: ['Bag (50kg)', 'Sq.Ft', 'Brass', 'Box', 'Piece', 'Coil', 'Bucket'],
    categories: [
      'Cement & Plaster Bags',
      'Ceramic & Vitrified Tiles',
      'Plumbing Pipes & CPVC Fittings',
      'Paints, Primers & Wall Putty',
      'Electrical Wires, Switches & Lighting',
      'Door Lock Hardware & Plywood',
      'Other'
    ],
    defaultGstPercent: 18,
    invoiceScanHint: 'Look for OPC/PPC Grade Cement, Tile Box Sq.Ft coverage, CPVC Fitting Diameter, Paint Litres / Bucket size, Wire sq.mm gauge, and 18% / 28% GST.',
    demoStoreId: 'store-demo-hardware',
    defaultSettings: {
      storeName: 'Shree Ram Building Materials & Hardware',
      tagline: 'Authorized Dealer • UltraTech Cement, Kajaria Tiles, Asian Paints & Havells',
      invoicePrefix: 'BMT-2026-'
    },
    sampleSuppliers: [
      { name: 'UltraTech Cement Distributors', contactPerson: 'Omprakash Sharma', mobile: '9829055112', city: 'Jaipur', outstandingBalance: 185000 },
      { name: 'Kajaria Ceramics Direct Depot', contactPerson: 'Vishal Trivedi', mobile: '9825066223', city: 'Morbi', outstandingBalance: 120000 },
      { name: 'Asian Paints Regional Depot', contactPerson: 'Rajeev Kapoor', mobile: '9820077334', city: 'Delhi', outstandingBalance: 95000 }
    ],
    sampleProducts: [
      { name: 'UltraTech Premium OPC 43 Grade Cement (50kg Bag)', category: 'Cement & Plaster Bags', brand: 'UltraTech', unit: 'Bag (50kg)', purchasePrice: 345, sellingPrice: 385, mrp: 410, currentStock: 400, minStock: 60, gstPercent: 28 },
      { name: 'Kajaria Vitrified Glossy Floor Tiles 2x2 Ft (4 Pcs Box)', category: 'Ceramic & Vitrified Tiles', brand: 'Kajaria', unit: 'Box', purchasePrice: 580, sellingPrice: 720, mrp: 800, currentStock: 110, minStock: 20, gstPercent: 18 },
      { name: 'Asian Paints Apex Exterior Emulsion White (20L Bucket)', category: 'Paints, Primers & Wall Putty', brand: 'Asian Paints', unit: 'Bucket', purchasePrice: 3400, sellingPrice: 3950, mrp: 4300, currentStock: 25, minStock: 5, gstPercent: 18 },
      { name: 'Havells HRFR Flame Retardant Wire 2.5 sq.mm 90m', category: 'Electrical Wires, Switches & Lighting', brand: 'Havells', unit: 'Coil', purchasePrice: 1820, sellingPrice: 2180, mrp: 2400, currentStock: 45, minStock: 10, gstPercent: 18 }
    ]
  }
];

export function getSectorConfig(sectorId?: TradingSector | string): SectorDefinition {
  const found = TRADING_SECTORS.find(s => s.id === sectorId);
  return found || TRADING_SECTORS[0]; // Default to Kirana FMCG
}
