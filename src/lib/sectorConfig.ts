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
  },
  {
    id: 'PHARMACY',
    name: 'Pharmacy, Chemist & Medical Store',
    shortLabel: 'Pharmacy & Medical',
    tagline: 'Batch & Expiry Management • Schedule H/H1, Strips, Vials & MRP Control',
    iconName: 'Pill',
    color: 'emerald',
    description: 'Pharmaceuticals, prescription drugs, OTC medicines, surgical supplies, ayurvedic remedies & medical devices.',
    primaryUnits: ['Strip', 'Tablet', 'Bottle', 'Box', 'Vial', 'Ampoule', 'Pcs'],
    categories: [
      'Prescription Antibiotics & Antivirals',
      'Analgesics & Pain Relievers',
      'Chronic Care (Diabetes/Cardiac/BP)',
      'Vitamins & Health Supplements',
      'Ayurvedic & Herbal Remedies',
      'Surgical & Diagnostic Devices',
      'Baby Care & Hygiene',
      'Other'
    ],
    defaultGstPercent: 12,
    invoiceScanHint: 'Look for Batch Number, Expiry Date (MM/YY), HSN Code 3004, Schedule H/H1 flag, MRP, Composition, Strip/Tablet count, and 5%/12% GST.',
    demoStoreId: 'store-demo-pharmacy',
    defaultSettings: {
      storeName: 'Sanjivani Medicos & Pharma Chemist',
      tagline: 'Licensed Retail Chemist & Wholesale Pharma Supplier • 100% Genuine Medicines',
      invoicePrefix: 'MED-2026-'
    },
    sampleSuppliers: [
      { name: 'Sun Pharma & Cipla Distributors', contactPerson: 'Ramesh Chawla', mobile: '9811122334', city: 'Delhi', outstandingBalance: 42000 },
      { name: 'Mankind & Zydus Wholesale Agency', contactPerson: 'Alok Saxena', mobile: '9829033221', city: 'Jaipur', outstandingBalance: 18500 }
    ],
    sampleProducts: [
      { name: 'Crocin 650mg Paracetamol Tablets (Strip of 15)', category: 'Analgesics & Pain Relievers', brand: 'GSK Pharma', unit: 'Strip', purchasePrice: 22, sellingPrice: 30, mrp: 33, currentStock: 120, minStock: 20, gstPercent: 12, batchNumber: 'B-2026-X8', expiryDate: '2027-11-30', scheduleCategory: 'OTC' },
      { name: 'Augmentin 625 Duo Tablets (Strip of 10)', category: 'Prescription Antibiotics & Antivirals', brand: 'GSK', unit: 'Strip', purchasePrice: 168, sellingPrice: 200, mrp: 220, currentStock: 45, minStock: 10, gstPercent: 12, batchNumber: 'AUG-9912', expiryDate: '2027-08-31', scheduleCategory: 'Schedule H' },
      { name: 'Glycomet GP 2mg Diabetes Tablet (Strip of 15)', category: 'Chronic Care (Diabetes/Cardiac/BP)', brand: 'USV', unit: 'Strip', purchasePrice: 82, sellingPrice: 105, mrp: 115, currentStock: 80, minStock: 15, gstPercent: 12, batchNumber: 'GLY-4402', expiryDate: '2028-02-28', scheduleCategory: 'Schedule H1' },
      { name: 'Becosules Z Multivitamin Capsules (Strip of 20)', category: 'Vitamins & Health Supplements', brand: 'Pfizer', unit: 'Strip', purchasePrice: 38, sellingPrice: 48, mrp: 52, currentStock: 150, minStock: 25, gstPercent: 12, batchNumber: 'BCS-1020', expiryDate: '2027-05-31', scheduleCategory: 'OTC' }
    ]
  },
  {
    id: 'ELECTRICAL_ELECTRONICS',
    name: 'Electricals, Cables & Consumer Electronics',
    shortLabel: 'Electricals & Electronics',
    tagline: 'Brand Warranty Tracking • Coils, Switches, MCBs, LED Lights & Appliances',
    iconName: 'Tv',
    color: 'blue',
    description: 'Electrical wires, MCB switchgear, modular plates, LED bulbs, ceiling fans, power cables & home electronics.',
    primaryUnits: ['Piece', 'Coil (90m)', 'Meter', 'Box', 'Set', 'Roll'],
    categories: [
      'Flame Retardant Electrical Wires',
      'Modular Switches & Sockets',
      'MCB Switchgear & DB Boxes',
      'LED Lighting & Commercial Panel Lights',
      'Ceiling & Exhaust Fans',
      'Water Heaters & Kitchen Appliances',
      'Other'
    ],
    defaultGstPercent: 18,
    invoiceScanHint: 'Look for Wire gauge sq.mm, Coil length 90m, Voltage/Wattage, Brand Warranty years, Model No, and 18% GST.',
    demoStoreId: 'store-demo-electrical',
    defaultSettings: {
      storeName: 'Havells & Polycab Electrical Trade Depot',
      tagline: 'Authorized Electrical Wholesaler • Wires, Switchgear, Lighting & Fans',
      invoicePrefix: 'ELC-2026-'
    },
    sampleSuppliers: [
      { name: 'Polycab Wires & Cables Ltd', contactPerson: 'Suresh Singhal', mobile: '9820033441', city: 'Mumbai', outstandingBalance: 125000 },
      { name: 'Schneider Electric & Anchor Depot', contactPerson: 'Manish Jain', mobile: '9810044552', city: 'Delhi', outstandingBalance: 88000 }
    ],
    sampleProducts: [
      { name: 'Polycab Green Wire FR 1.5 sq.mm 90m Coil', category: 'Flame Retardant Electrical Wires', brand: 'Polycab', unit: 'Coil (90m)', purchasePrice: 1150, sellingPrice: 1380, mrp: 1550, currentStock: 60, minStock: 12, gstPercent: 18, warrantyMonths: 120 },
      { name: 'Havells 16A Single Pole MCB C-Curve', category: 'MCB Switchgear & DB Boxes', brand: 'Havells', unit: 'Piece', purchasePrice: 140, sellingPrice: 180, mrp: 210, currentStock: 110, minStock: 20, gstPercent: 18, warrantyMonths: 24 },
      { name: 'Philips 9W Cool Day Light LED Bulb', category: 'LED Lighting & Commercial Panel Lights', brand: 'Philips', unit: 'Piece', purchasePrice: 65, sellingPrice: 90, mrp: 100, currentStock: 200, minStock: 30, gstPercent: 18, warrantyMonths: 24 }
    ]
  },
  {
    id: 'AUTO_PARTS',
    name: 'Automobile, Spare Parts & Accessories',
    shortLabel: 'Auto & Spare Parts',
    tagline: 'OEM Compatibility • Engine Components, Brakes, Filters, Tyres & Lubricants',
    iconName: 'Car',
    color: 'orange',
    description: 'OEM spare parts, brake pads, oil filters, clutch plates, shock absorbers, batteries, tyres & auto accessories.',
    primaryUnits: ['Piece', 'Pair', 'Set', 'Box', 'Litre'],
    categories: [
      'Engine Parts & Piston Assembly',
      'Braking Systems & Brake Pads',
      'Filters (Oil/Air/Fuel)',
      'Electricals & Automotive Batteries',
      'Clutch & Transmission Assemblies',
      'Tyres, Tubes & Alloy Wheels',
      'Other'
    ],
    defaultGstPercent: 18,
    invoiceScanHint: 'Look for OEM Part Number, Vehicle Compatibility (e.g. Maruti Swift / Hero Splendor), Brand, and 18% / 28% GST.',
    demoStoreId: 'store-demo-autoparts',
    defaultSettings: {
      storeName: 'Royal Auto Spares & Motor Components',
      tagline: 'Wholesale OEM Automobile Parts • Maruti, Hyundai, Tata & Hero Compatible',
      invoicePrefix: 'AUT-2026-'
    },
    sampleSuppliers: [
      { name: 'Minda & Bosch Auto Components Depot', contactPerson: 'Rajesh Narang', mobile: '9810055667', city: 'Gurugram', outstandingBalance: 92000 }
    ],
    sampleProducts: [
      { name: 'Bosch Premium Synthetic Oil Filter Maruti Swift', category: 'Filters (Oil/Air/Fuel)', brand: 'Bosch', unit: 'Piece', purchasePrice: 120, sellingPrice: 165, mrp: 185, currentStock: 80, minStock: 15, gstPercent: 18, oemNumber: 'BS-OIL-091', vehicleModel: 'Maruti Swift / Dzire Diesel' },
      { name: 'TVS Eurogrip Tyre 90/90-12 Tubeless Scooter', category: 'Tyres, Tubes & Alloy Wheels', brand: 'TVS Tyres', unit: 'Piece', purchasePrice: 980, sellingPrice: 1250, mrp: 1380, currentStock: 35, minStock: 8, gstPercent: 28, warrantyMonths: 36, vehicleModel: 'Activa / Jupiter' }
    ]
  },
  {
    id: 'DAIRY_BEVERAGE',
    name: 'Dairy, Milk & Beverage Distribution',
    shortLabel: 'Dairy & Beverage',
    tagline: 'Crate & Route Management • Cold Chain, Pouches, Bottles & Expiry Alerts',
    iconName: 'Milk',
    color: 'sky',
    description: 'Fresh pasteurized milk, paneer, curd, butter, ghee, ice creams, cold drinks & juices.',
    primaryUnits: ['Packet', 'Litre', 'Crate', 'Bottle', 'Kg', 'Box'],
    categories: [
      'Fresh Milk Pouches & Toned Milk',
      'Fresh Paneer, Butter & Ghee',
      'Curd, Lassi & Flavored Milk',
      'Packaged Fruit Juices & Carbonated Drinks',
      'Ice Creams & Frozen Desserts',
      'Other'
    ],
    defaultGstPercent: 5,
    invoiceScanHint: 'Look for Crate deposit charges, Milk fat %, Batch time, Expiry Date (Daily), and 0% / 5% / 12% GST.',
    demoStoreId: 'store-demo-dairy',
    defaultSettings: {
      storeName: 'Amul & Mother Dairy Express Distributor',
      tagline: 'Fresh Cold Chain Dairy Delivery • Daily Morning Wholesale Routes',
      invoicePrefix: 'DRY-2026-'
    },
    sampleSuppliers: [
      { name: 'Amul Dairy Co-operative Depot', contactPerson: 'Nilesh Patel', mobile: '9825099887', city: 'Anand', outstandingBalance: 65000 }
    ],
    sampleProducts: [
      { name: 'Amul Taaza Toned Milk 500ml Pouch', category: 'Fresh Milk Pouches & Toned Milk', brand: 'Amul', unit: 'Packet', purchasePrice: 26, sellingPrice: 28, mrp: 28, currentStock: 250, minStock: 40, gstPercent: 0, expiryDate: '2026-08-09' },
      { name: 'Amul Fresh Malai Paneer 200g Pack', category: 'Fresh Paneer, Butter & Ghee', brand: 'Amul', unit: 'Packet', purchasePrice: 72, sellingPrice: 85, mrp: 90, currentStock: 40, minStock: 10, gstPercent: 5, expiryDate: '2026-08-15' }
    ]
  },
  {
    id: 'FRUITS_VEGETABLES',
    name: 'Fruits, Vegetables & Perishables Mandi',
    shortLabel: 'Fruits & Veg Mandi',
    tagline: 'Daily Rates & Weight Loss Tracking • Farm Fresh Fruits & Veggies',
    iconName: 'Apple',
    color: 'emerald',
    description: 'Fresh vegetables, seasonal fruits, exotic greens, organic produce & wholesale mandi crates.',
    primaryUnits: ['Kg', 'Crate', 'Quintal', 'Basket', 'Dozen', 'Pcs'],
    categories: [
      'Daily Vegetables (Potato/Onion/Tomato)',
      'Green Leafy Vegetables',
      'Seasonal Fruits (Apples/Mangoes/Grapes)',
      'Citrus & Melons',
      'Exotic & Organic Greens',
      'Other'
    ],
    defaultGstPercent: 0,
    invoiceScanHint: 'Look for Mandi Daily Rate, Net Crate Weight, Weight Loss %, Quality Grade, and 0% GST exempt flag.',
    demoStoreId: 'store-demo-fruits',
    defaultSettings: {
      storeName: 'Subzi Mandi Farm Fresh Wholesalers',
      tagline: 'Direct Farmer Sourcing • Daily Fresh Fruit & Vegetable Supplies',
      invoicePrefix: 'FRT-2026-'
    },
    sampleSuppliers: [
      { name: 'Azadpur Fruit & Veg Market Commission', contactPerson: 'Harish Saini', mobile: '9811088776', city: 'Delhi', outstandingBalance: 34000 }
    ],
    sampleProducts: [
      { name: 'Nashik Red Onions Premium Grade', category: 'Daily Vegetables (Potato/Onion/Tomato)', brand: 'Mandi Sourced', unit: 'Kg', purchasePrice: 22, sellingPrice: 28, mrp: 32, currentStock: 800, minStock: 100, gstPercent: 0 },
      { name: 'Kashmir Royal Delicious Red Apples 20kg Crate', category: 'Seasonal Fruits (Apples/Mangoes/Grapes)', brand: 'Kashmir Orchards', unit: 'Crate', purchasePrice: 1400, sellingPrice: 1750, mrp: 1900, currentStock: 25, minStock: 5, gstPercent: 0 }
    ]
  },
  {
    id: 'BAKERY',
    name: 'Bakery, Confectionery & Sweet Mart',
    shortLabel: 'Bakery & Sweets',
    tagline: 'Production Batch & Shelf Life • Breads, Cakes, Pastries & Mithai',
    iconName: 'Cake',
    color: 'amber',
    description: 'Fresh breads, artisan cakes, cookies, traditional Indian mithai, chocolates & bakery raw materials.',
    primaryUnits: ['Kg', 'Tray', 'Box', 'Packet', 'Piece'],
    categories: [
      'Fresh Bread & Buns',
      'Custom Birthday Cakes & Pastries',
      'Traditional Indian Mithai & Sweets',
      'Artisan Cookies & Dry Bakery',
      'Chocolates & Gift Hampers',
      'Other'
    ],
    defaultGstPercent: 5,
    invoiceScanHint: 'Look for Manufacturing Date/Time, Shelf Life in hours/days, Eggless flag, and 5% / 18% GST.',
    demoStoreId: 'store-demo-bakery',
    defaultSettings: {
      storeName: 'Mithas Artisan Bakery & Sweet Mart',
      tagline: 'Fresh Pure Desi Ghee Sweets & Daily Baked Breads & Designer Cakes',
      invoicePrefix: 'BKR-2026-'
    },
    sampleSuppliers: [
      { name: 'Haldiram Raw Ingredients Supplier', contactPerson: 'Deepak Agrawal', mobile: '9810022119', city: 'Noida', outstandingBalance: 28000 }
    ],
    sampleProducts: [
      { name: 'Fresh White Sandwich Bread 400g', category: 'Fresh Bread & Buns', brand: 'In-House Bakery', unit: 'Packet', purchasePrice: 22, sellingPrice: 35, mrp: 35, currentStock: 60, minStock: 15, gstPercent: 0, expiryDate: '2026-08-11' },
      { name: 'Pure Desi Ghee Kaju Katli 1kg Box', category: 'Traditional Indian Mithai & Sweets', brand: 'Mithas Sweets', unit: 'Box', purchasePrice: 650, sellingPrice: 880, mrp: 950, currentStock: 20, minStock: 5, gstPercent: 5, expiryDate: '2026-08-25' }
    ]
  },
  {
    id: 'FURNITURE_WOOD',
    name: 'Furniture, Plywood & Interior Hardware',
    shortLabel: 'Furniture & Plywood',
    tagline: 'Thickness & Material Specs • Plywood Sheets, Laminates, Hardwood & Fittings',
    iconName: 'Sofa',
    color: 'stone',
    description: 'Commercial plywood, waterproof BWP ply, decorative laminates, office furniture, wooden logs & hardware.',
    primaryUnits: ['Sheet', 'Piece', 'Set', 'Sq.Ft', 'Meter'],
    categories: [
      'BWP Waterproof Plywood & Blockboards',
      'Decorative Mica Laminates',
      'Office Ergonomic Chairs & Tables',
      'Wooden Doors & Frames',
      'Modular Kitchen Fittings',
      'Other'
    ],
    defaultGstPercent: 18,
    invoiceScanHint: 'Look for Ply thickness in mm (12mm, 18mm), Sheet size (8x4 ft), IS grade 710/303, and 18% / 28% GST.',
    demoStoreId: 'store-demo-furniture',
    defaultSettings: {
      storeName: 'Century Plywood & Teak Furniture Mart',
      tagline: 'Wholesale Timber, Waterproof Marine Ply & Premium Office Furniture',
      invoicePrefix: 'FUR-2026-'
    },
    sampleSuppliers: [
      { name: 'Century Ply & Greenply Depot', contactPerson: 'Subhash Kedia', mobile: '9811099112', city: 'Kolkata', outstandingBalance: 145000 }
    ],
    sampleProducts: [
      { name: 'Century Club Prime BWP Marine Plywood 18mm (8x4 Ft Sheet)', category: 'BWP Waterproof Plywood & Blockboards', brand: 'CenturyPly', unit: 'Sheet', purchasePrice: 2800, sellingPrice: 3400, mrp: 3700, currentStock: 45, minStock: 10, gstPercent: 18, thickness: '18mm', size: '8x4 Ft' },
      { name: 'Greenlam High Gloss Decorative Laminate 1mm Sheet', category: 'Decorative Mica Laminates', brand: 'Greenlam', unit: 'Sheet', purchasePrice: 850, sellingPrice: 1150, mrp: 1300, currentStock: 90, minStock: 15, gstPercent: 18, thickness: '1mm' }
    ]
  },
  {
    id: 'PLASTICS_PACKAGING',
    name: 'Plastics, Packaging & Polymer Goods',
    shortLabel: 'Plastics & Packaging',
    tagline: 'Rolls, Polybags, Strapping & Corrugated Cartons',
    iconName: 'Package',
    color: 'teal',
    description: 'Industrial polybags, stretch film rolls, bubble wrap, plastic containers, BOPP tapes & strapping rolls.',
    primaryUnits: ['Roll', 'Bag', 'Bundle', 'Kg', 'Box', 'Piece'],
    categories: [
      'Stretch Film & Bubble Wrap Rolls',
      'Polybags & Ziplock Bags',
      'Corrugated Packing Boxes',
      'Plastic Buckets & Drums',
      'Strapping & Binding Tapes',
      'Other'
    ],
    defaultGstPercent: 18,
    invoiceScanHint: 'Look for Micron thickness, Roll width, Net Weight in Kg, and 18% GST.',
    demoStoreId: 'store-demo-plastics',
    defaultSettings: {
      storeName: 'Vardhman Packaging & Plastic Traders',
      tagline: 'Bulk Industrial Packaging Solutions • Stretch Film, Cartons & Polybags',
      invoicePrefix: 'PKG-2026-'
    },
    sampleSuppliers: [
      { name: 'Supreme Industries Plastic Division', contactPerson: 'Manish Shah', mobile: '9820066554', city: 'Mumbai', outstandingBalance: 78000 }
    ],
    sampleProducts: [
      { name: 'Industrial Transparent Stretch Film Roll 23 Micron 3kg', category: 'Stretch Film & Bubble Wrap Rolls', brand: 'PackMaster', unit: 'Roll', purchasePrice: 380, sellingPrice: 480, mrp: 540, currentStock: 120, minStock: 20, gstPercent: 18 }
    ]
  },
  {
    id: 'MOBILE_COMPUTERS',
    name: 'Mobiles, Laptops, Computers & Accessories',
    shortLabel: 'Mobile & Computers',
    tagline: 'IMEI & Serial Number Tracking • Smartphones, Laptops, Keyboards & Accessories',
    iconName: 'Smartphone',
    color: 'indigo',
    description: 'Smartphones, laptops, desktop PCs, monitors, hard drives, chargers, headphones & mobile covers.',
    primaryUnits: ['Piece', 'Set', 'Box'],
    categories: [
      'Smartphones & 5G Handsets',
      'Laptops & Desktop Workstations',
      'PC Components (RAM/SSD/Graphics)',
      'Mobile Accessories & Chargers',
      'Audio & Wireless Headphones',
      'Printers & Networking Routers',
      'Other'
    ],
    defaultGstPercent: 18,
    invoiceScanHint: 'Look for IMEI Number (15 digits), Laptop Serial No, Brand Warranty, and 18% GST.',
    demoStoreId: 'store-demo-mobile',
    defaultSettings: {
      storeName: 'TechnoHub Mobile & Computer World',
      tagline: 'Authorized Mobile & Laptop Dealer • Apple, Samsung, HP & Lenovo',
      invoicePrefix: 'MOB-2026-'
    },
    sampleSuppliers: [
      { name: 'Redington India IT Distribution', contactPerson: 'Venkatesh Iyer', mobile: '9840011223', city: 'Chennai', outstandingBalance: 280000 }
    ],
    sampleProducts: [
      { name: 'Samsung Galaxy A35 5G (8GB RAM, 128GB Storage)', category: 'Smartphones & 5G Handsets', brand: 'Samsung', unit: 'Piece', purchasePrice: 22500, sellingPrice: 25999, mrp: 27999, currentStock: 12, minStock: 3, gstPercent: 18, imei: '864210987654321', warrantyMonths: 12 },
      { name: 'HP 15s Intel Core i5 12th Gen Laptop 16GB/512GB SSD', category: 'Laptops & Desktop Workstations', brand: 'HP', unit: 'Piece', purchasePrice: 46000, sellingPrice: 51990, mrp: 56000, currentStock: 6, minStock: 2, gstPercent: 18, serialNumber: 'HP-CND9912X', warrantyMonths: 12 }
    ]
  },
  {
    id: 'FOOTWEAR_GARMENTS',
    name: 'Footwear, Garments & Apparel Store',
    shortLabel: 'Footwear & Garments',
    tagline: 'Size & Color Matrix • Shoes, Sandals, Shirts, Trousers & Kids Wear',
    iconName: 'Shirt',
    color: 'rose',
    description: 'Leather shoes, sports sneakers, gents formal shirts, ladies ethnic suits, kids wear & apparel.',
    primaryUnits: ['Pair', 'Piece', 'Box', 'Dozen'],
    categories: [
      'Sports Shoes & Running Sneakers',
      'Leather Formal & Casual Shoes',
      'Men\'s Formal Shirts & Trousers',
      'Ladies Salwar Suits & Kurtis',
      'Kids Apparel & School Uniforms',
      'Other'
    ],
    defaultGstPercent: 5,
    invoiceScanHint: 'Look for Shoe Size (e.g. UK 8 / 9), Article Number, Color, Garment HSN 6109 / 6203, and 5% / 12% GST.',
    demoStoreId: 'store-demo-footwear',
    defaultSettings: {
      storeName: 'Bata & Liberty Footwear & Garment World',
      tagline: 'Family Shoe & Fashion Apparel Store • Top Brands & Trendy Styles',
      invoicePrefix: 'APP-2026-'
    },
    sampleSuppliers: [
      { name: 'Bata India Wholesale Depot', contactPerson: 'Sanjay Dutt', mobile: '9810033221', city: 'Kolkata', outstandingBalance: 64000 }
    ],
    sampleProducts: [
      { name: 'Bata Power Men\'s Air Cushion Running Shoes Black', category: 'Sports Shoes & Running Sneakers', brand: 'Bata Power', unit: 'Pair', purchasePrice: 1200, sellingPrice: 1699, mrp: 1899, currentStock: 25, minStock: 5, gstPercent: 12, size: 'UK 8', color: 'Black' }
    ]
  },
  {
    id: 'COSMETICS',
    name: 'Cosmetics, Beauty & Personal Care',
    shortLabel: 'Cosmetics & Beauty',
    tagline: 'Shade & Brand Variety • Skincare, Perfumes, Hair Care & Makeup',
    iconName: 'Sparkles',
    color: 'purple',
    description: 'Lipsticks, foundations, skin creams, hair oils, shampoos, perfumes, grooming kits & salon products.',
    primaryUnits: ['Bottle', 'Tube', 'Box', 'Piece', 'Set'],
    categories: [
      'Face Makeup & Lipsticks',
      'Skincare & Moisturizing Creams',
      'Hair Oils, Shampoos & Conditioners',
      'Perfumes, Deodorants & Colognes',
      'Grooming Kits & Salon Equipment',
      'Other'
    ],
    defaultGstPercent: 18,
    invoiceScanHint: 'Look for Shade Code / Name, Volume ml, Batch No, Expiry Date, and 18% GST.',
    demoStoreId: 'store-demo-cosmetics',
    defaultSettings: {
      storeName: 'Glamour Cosmetics & Beauty Supplies',
      tagline: 'Wholesale Beauty, Hair Care & Salon Essentials • Lakme, Loreal & Maybelline',
      invoicePrefix: 'COS-2026-'
    },
    sampleSuppliers: [
      { name: 'L\'Oreal & Lakme India Agencies', contactPerson: 'Anjali Kapur', mobile: '9820044112', city: 'Mumbai', outstandingBalance: 48000 }
    ],
    sampleProducts: [
      { name: 'Lakme Absolute Matte Melt Liquid Lipstick (Red Velvet)', category: 'Face Makeup & Lipsticks', brand: 'Lakme', unit: 'Piece', purchasePrice: 380, sellingPrice: 499, mrp: 525, currentStock: 40, minStock: 8, gstPercent: 18, shade: 'Red Velvet' }
    ]
  },
  {
    id: 'SEEDS_FERTILIZERS',
    name: 'Seeds, Fertilizers & Pesticides Store',
    shortLabel: 'Seeds & Fertilizers',
    tagline: 'Crop Season & License Rules • Hybrid Seeds, DAP, Urea & Insecticides',
    iconName: 'Sprout',
    color: 'emerald',
    description: 'Certified hybrid seeds, DAP, NPK fertilizers, bio-pesticides, fungicides & agrochemical sprays.',
    primaryUnits: ['Bag', 'Bottle', 'Kg', 'Litre', 'Pouch'],
    categories: [
      'Hybrid Crop Seeds (Wheat/Paddy/Cotton)',
      'Chemical Fertilizers (DAP/Urea/MOP)',
      'Insecticides & Pesticides',
      'Fungicides & Plant Tonics',
      'Organic Bio-Fertilizers',
      'Other'
    ],
    defaultGstPercent: 5,
    invoiceScanHint: 'Look for Seed Germination %, Lot No, Expiry Date, Fertilizer Subsidy MRP, Insecticide CIB License, and 5% / 18% GST.',
    demoStoreId: 'store-demo-seeds',
    defaultSettings: {
      storeName: 'Kisan Seva Kendra - Seeds & Agri Chemicals',
      tagline: 'Government Licensed Dealer • Certified Hybrid Seeds, DAP & Pesticides',
      invoicePrefix: 'AGC-2026-'
    },
    sampleSuppliers: [
      { name: 'UPL Agro & Bayer CropScience Depot', contactPerson: 'Balraj Singh', mobile: '9810088991', city: 'Chandigarh', outstandingBalance: 110000 }
    ],
    sampleProducts: [
      { name: 'Kaveri Hybrid Cotton Seeds 450g Pouch', category: 'Hybrid Crop Seeds (Wheat/Paddy/Cotton)', brand: 'Kaveri Seeds', unit: 'Pouch', purchasePrice: 720, sellingPrice: 850, mrp: 864, currentStock: 80, minStock: 15, gstPercent: 5, cropSeason: 'Kharif 2026' }
    ]
  },
  {
    id: 'WATER_RO',
    name: 'Water Purifier, RO & Service Business',
    shortLabel: 'Water Purifier & RO',
    tagline: 'AMC & Filter Service Reminders • RO Systems, Membranes & Spares',
    iconName: 'Droplets',
    color: 'sky',
    description: 'Domestic & commercial RO water purifiers, sediment filters, RO membranes, pumps & annual service contracts.',
    primaryUnits: ['Piece', 'Filter', 'Set', 'Kit'],
    categories: [
      'Domestic RO Water Purifiers',
      'RO Membranes & Carbon Filters',
      'Booster Pumps & UV Lamps',
      'Commercial RO Plants & Chillers',
      'AMC & Annual Service Contracts',
      'Other'
    ],
    defaultGstPercent: 18,
    invoiceScanHint: 'Look for RO GPD capacity, Filter micron size, Brand warranty, and 18% GST.',
    demoStoreId: 'store-demo-waterro',
    defaultSettings: {
      storeName: 'AquaPure RO Systems & Water Care',
      tagline: 'Kent & Aquaguard Sales & Service Center • Genuine RO Filters & AMC',
      invoicePrefix: 'WTR-2026-'
    },
    sampleSuppliers: [
      { name: 'Kent RO Systems Regional Depot', contactPerson: 'Suresh Bhatia', mobile: '9811044556', city: 'Delhi', outstandingBalance: 35000 }
    ],
    sampleProducts: [
      { name: 'Kent Grand Plus 8L Mineral RO Water Purifier', category: 'Domestic RO Water Purifiers', brand: 'Kent', unit: 'Piece', purchasePrice: 13500, sellingPrice: 16500, mrp: 18500, currentStock: 8, minStock: 2, gstPercent: 18, warrantyMonths: 12, amcCost: 2500 }
    ]
  },
  {
    id: 'GENERAL_TRADING',
    name: 'General Wholesale & Retail Trading',
    shortLabel: 'General Trading',
    tagline: 'Universal Multi-Unit Configurator • Flexible Categories & Units',
    iconName: 'Building2',
    color: 'slate',
    description: 'Universal setup for multi-category trading businesses, general merchants, importers & distributors.',
    primaryUnits: ['Piece', 'Box', 'Packet', 'Kg', 'Carton', 'Dozen', 'Meter', 'Set'],
    categories: [
      'Fast Moving Consumer Goods',
      'Hardware & Tools',
      'Stationery & Packaging',
      'Garments & Accessories',
      'General Merchandise',
      'Other'
    ],
    defaultGstPercent: 18,
    invoiceScanHint: 'Look for Product Item Name, Quantity, Unit Rate, HSN Code, and GST Tax Amount.',
    demoStoreId: 'store-demo-general',
    defaultSettings: {
      storeName: 'Universal Traders & Merchants',
      tagline: 'All-in-One Multi-Product Wholesale & Retail Business ERP',
      invoicePrefix: 'GEN-2026-'
    },
    sampleSuppliers: [
      { name: 'Universal Wholesale Distributors', contactPerson: 'Ashok Kumar', mobile: '9876543210', city: 'Delhi', outstandingBalance: 25000 }
    ],
    sampleProducts: [
      { name: 'Multi-Purpose Stainless Steel Utility Scissors 8 Inch', category: 'Hardware & Tools', brand: 'MasterCut', unit: 'Piece', purchasePrice: 45, sellingPrice: 75, mrp: 95, currentStock: 150, minStock: 25, gstPercent: 18 }
    ]
  }
];

export function getSectorConfig(sectorId?: TradingSector | string): SectorDefinition {
  const found = TRADING_SECTORS.find(s => s.id === sectorId);
  return found || TRADING_SECTORS[0]; // Default to Kirana FMCG
}
