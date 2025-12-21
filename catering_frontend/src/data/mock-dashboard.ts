export type RecipeIngredient = {
  name: string;
  quantity: number;
  uom: string;
};

export type Recipe = {
  name: string;
  category: string;
  factory: string;
  portions: number;
  costPerPlate: number;
  margin: number;
  ingredients: RecipeIngredient[];
};

export type StockSnapshot = {
  ingredient: string;
  onHand: number;
  uom: string;
  coverageDays: number;
  status: "พร้อมใช้" | "เริ่มตึง" | "วิกฤต";
};

export type CostInsight = {
  title: string;
  value: string;
  delta: string;
  trend: "up" | "down" | "flat";
  note: string;
};

export type ProcurementAlert = {
  ingredient: string;
  status: "คงเหลือน้อย" | "ราคาพุ่ง" | "ปกติ";
  supplier: string;
  nextDelivery: string;
};

export type ProductionPlan = {
  day: string;
  shift: string;
  headcount: number;
  menu: string[];
};

export type RecipeSchedule = {
  date: string;
  factory: string;
  client: string;
  meal: "Breakfast" | "Lunch" | "Dinner";
  recipe: string;
  portions: number;
};

export type ContractKPI = {
  label: string;
  value: string;
  detail: string;
};

export type FactoryProfile = {
  name: string;
  location: string;
  capacityPerDay: number;
  activeContracts: number;
  kitchenLead: string;
  status: "พร้อมใช้งาน" | "ระหว่างซ่อมบำรุง" | "กำลังขยาย";
};

export type PriceBookEntry = {
  ingredient: string;
  category: string;
  avgCost: number;
  lastWeekCost: number;
  recommendedPrice: number;
  variance: number;
};

export type QuoteRecord = {
  id: string;
  client: string;
  plant: string;
  mealCount: number;
  pricePerHead: number;
  status: "ร่าง" | "ส่งแล้ว" | "อนุมัติ";
  effectiveDate: string;
  note: string;
};

export type ProcurementOrder = {
  poNumber: string;
  supplier: string;
  itemSummary: string;
  eta: string;
  status: "รออนุมัติ" | "สั่งซื้อแล้ว" | "รับเข้าแล้ว";
  total: number;
};

export type StockAdjustment = {
  kitchen: string;
  item: string;
  change: number;
  reason: string;
  timestamp: string;
};

export type MealShareSlice = {
  label: string;
  value: number;
  color: string;
};

export type WeeklyCostPoint = {
  week: string;
  cost: number;
  margin: number;
};

export type IngredientPricePoint = {
  month: string;
  chicken: number;
  basil: number;
  coconut: number;
};

export const recipes: Recipe[] = [
  {
    name: "แกงเขียวหวานไก่",
    category: "มื้อกลางวัน | เผ็ด",
    factory: "ครัวกลางกรุงเทพฯ",
    portions: 1200,
    costPerPlate: 41.8,
    margin: 18,
    ingredients: [
      { name: "เนื้ออกไก่", quantity: 90, uom: "กก." },
      { name: "กะทิ", quantity: 120, uom: "ลิตร" },
      { name: "พริกแกงเขียวหวาน", quantity: 35, uom: "กก." },
      { name: "ใบโหระพา", quantity: 25, uom: "กก." },
    ],
  },
  {
    name: "ปลานึ่งซีอิ๊วขิง",
    category: "มื้อกลางวัน | โปรตีนลีน",
    factory: "โรงครัวระยอง",
    portions: 980,
    costPerPlate: 39.5,
    margin: 22,
    ingredients: [
      { name: "ปลากะพง", quantity: 110, uom: "กก." },
      { name: "ซีอิ๊วขาว", quantity: 35, uom: "ลิตร" },
      { name: "ขิงซอย", quantity: 18, uom: "กก." },
      { name: "ต้นหอม", quantity: 20, uom: "กก." },
    ],
  },
  {
    name: "ผัดกะเพราถั่วเหลือง",
    category: "มื้อเย็น | มังสวิรัติ",
    factory: "ศูนย์แหลมฉบัง",
    portions: 760,
    costPerPlate: 32.2,
    margin: 16,
    ingredients: [
      { name: "เต้าหู้ถั่วเหลือง", quantity: 70, uom: "กก." },
      { name: "ใบกะเพรา", quantity: 22, uom: "กก." },
      { name: "พริกแดงบด", quantity: 8, uom: "กก." },
      { name: "ถั่วฝักยาว", quantity: 25, uom: "กก." },
    ],
  },
];

export const stockLevels: StockSnapshot[] = [
  {
    ingredient: "เนื้ออกไก่",
    onHand: 850,
    uom: "กก.",
    coverageDays: 2.1,
    status: "วิกฤต",
  },
  {
    ingredient: "กะเพราขาว",
    onHand: 120,
    uom: "กก.",
    coverageDays: 1.4,
    status: "เริ่มตึง",
  },
  {
    ingredient: "ข้าวหอมมะลิ",
    onHand: 5200,
    uom: "กก.",
    coverageDays: 8.5,
    status: "พร้อมใช้",
  },
  {
    ingredient: "ซีอิ๊วขาว",
    onHand: 940,
    uom: "ลิตร",
    coverageDays: 5.2,
    status: "พร้อมใช้",
  },
  {
    ingredient: "กะทิกล่อง",
    onHand: 360,
    uom: "ลิตร",
    coverageDays: 2.9,
    status: "เริ่มตึง",
  },
];

export const insights: CostInsight[] = [
  {
    title: "ต้นทุนเฉลี่ยต่อจาน",
    value: "฿38.90",
    delta: "-3.4%",
    trend: "down",
    note: "ลดลงหลังต่อสัญญาสมุนไพรล็อตใหม่",
  },
  {
    title: "อัตรากำไรขั้นต้น",
    value: "21.2%",
    delta: "+1.1%",
    trend: "up",
    note: "ควบคุม portion โรงงานระยองได้เสถียร",
  },
  {
    title: "ปริมาณการผลิตต่อวัน",
    value: "5,420 จาน",
    delta: "+320",
    trend: "up",
    note: "โรงงาน B เพิ่มกะดึก",
  },
  {
    title: "ความเสี่ยงของเสีย",
    value: "ต่ำ",
    delta: "−12 กก./สัปดาห์",
    trend: "down",
    note: "เฝ้าระวังห้องเย็นแบบเรียลไทม์",
  },
];

export const procurementAlerts: ProcurementAlert[] = [
  {
    ingredient: "เนื้ออกไก่",
    status: "คงเหลือน้อย",
    supplier: "AgriPro",
    nextDelivery: "23 ธ.ค. 06:00 น.",
  },
  {
    ingredient: "กะเพราขาว",
    status: "ราคาพุ่ง",
    supplier: "FreshHerb Co.",
    nextDelivery: "22 ธ.ค. 04:30 น.",
  },
  {
    ingredient: "ข้าวหอมมะลิ",
    status: "ปกติ",
    supplier: "Golden Grain",
    nextDelivery: "24 ธ.ค. 02:00 น.",
  },
];

export const productionPlan: ProductionPlan[] = [
  {
    day: "จันทร์ 22",
    shift: "กะเช้า",
    headcount: 1800,
    menu: ["ไข่นึ่งทรงเครื่อง", "ไก่เทอริยากิ", "ซุปผักรวม"],
  },
  {
    day: "จันทร์ 22",
    shift: "กะดึก",
    headcount: 1550,
    menu: ["ผัดกะเพราหมู", "คะน้าน้ำมันหอย", "วุ้นกะทิใบเตย"],
  },
  {
    day: "อังคาร 23",
    shift: "กะเช้า",
    headcount: 1900,
    menu: ["มัสมั่นเนื้อ", "สลัดกะหล่ำปลี", "ฟักทองสังขยา"],
  },
];

export const recipeSchedules: RecipeSchedule[] = [
  {
    date: "2025-12-22",
    factory: "ครัวกลางกรุงเทพฯ",
    client: "Alpha Robotics",
    meal: "Lunch",
    recipe: "แกงเขียวหวานไก่",
    portions: 650,
  },
  {
    date: "2025-12-23",
    factory: "ครัวกลางกรุงเทพฯ",
    client: "Mega Electronics",
    meal: "Dinner",
    recipe: "แกงเขียวหวานไก่",
    portions: 520,
  },
  {
    date: "2025-12-22",
    factory: "โรงครัวระยอง",
    client: "Eastern Tech Park",
    meal: "Lunch",
    recipe: "ปลานึ่งซีอิ๊วขิง",
    portions: 480,
  },
  {
    date: "2025-12-23",
    factory: "โรงครัวระยอง",
    client: "Eastern Tech Park",
    meal: "Dinner",
    recipe: "ปลานึ่งซีอิ๊วขิง",
    portions: 450,
  },
  {
    date: "2025-12-23",
    factory: "ศูนย์แหลมฉบัง",
    client: "LogiPort DC",
    meal: "Dinner",
    recipe: "ผัดกะเพราถั่วเหลือง",
    portions: 360,
  },
  {
    date: "2025-12-24",
    factory: "ศูนย์แหลมฉบัง",
    client: "LogiPort DC",
    meal: "Lunch",
    recipe: "ผัดกะเพราถั่วเหลือง",
    portions: 400,
  },
];

export const contractKPIs: ContractKPI[] = [
  {
    label: "สัญญาใช้งานจริง",
    value: "18/22",
    detail: "Active vs Running",
  },
  {
    label: "ลูกค้าที่มีกำไร > 20%",
    value: "11 แห่ง",
    detail: "โซน EEC 6 · กรุงเทพฯ 5",
  },
  {
    label: "ค่าเฉลี่ย SLA ส่งมอบ",
    value: "96.4%",
    detail: "เฉลี่ย 28 นาทีต่อรอบ",
  },
];

export const factories: FactoryProfile[] = [
  {
    name: "ครัวกลางกรุงเทพฯ",
    location: "บางนา กม.17",
    capacityPerDay: 6200,
    activeContracts: 9,
    kitchenLead: "ชญานิศ สุนทร",
    status: "พร้อมใช้งาน",
  },
  {
    name: "โรงครัวระยอง",
    location: "นิคมฯ มาบตาพุด",
    capacityPerDay: 4100,
    activeContracts: 6,
    kitchenLead: "วรเมธ ใจดี",
    status: "พร้อมใช้งาน",
  },
  {
    name: "ศูนย์แหลมฉบัง",
    location: "ท่าเรือแหลมฉบัง C",
    capacityPerDay: 3500,
    activeContracts: 4,
    kitchenLead: "ปิติวัชร์ อมร",
    status: "กำลังขยาย",
  },
];

export const priceBook: PriceBookEntry[] = [
  {
    ingredient: "เนื้ออกไก่",
    category: "โปรตีน",
    avgCost: 78,
    lastWeekCost: 81,
    recommendedPrice: 112,
    variance: -3,
  },
  {
    ingredient: "ปลากะพง",
    category: "โปรตีน",
    avgCost: 145,
    lastWeekCost: 152,
    recommendedPrice: 198,
    variance: -7,
  },
  {
    ingredient: "ข้าวหอมมะลิ",
    category: "คาร์บ",
    avgCost: 32,
    lastWeekCost: 31,
    recommendedPrice: 52,
    variance: 1,
  },
  {
    ingredient: "ผักรวมออแกนิก",
    category: "ผัก",
    avgCost: 58,
    lastWeekCost: 62,
    recommendedPrice: 89,
    variance: -4,
  },
];

export const quotes: QuoteRecord[] = [
  {
    id: "QT-2025-021",
    client: "โรงงาน Alpha Robotics",
    plant: "ครัวกลางกรุงเทพฯ",
    mealCount: 1400,
    pricePerHead: 78,
    status: "ส่งแล้ว",
    effectiveDate: "15 ม.ค. 2026",
    note: "ต้องการเมนูสุขภาพ 60%",
  },
  {
    id: "QT-2025-022",
    client: "นิคมฯ Eastern Tech",
    plant: "โรงครัวระยอง",
    mealCount: 900,
    pricePerHead: 74,
    status: "ร่าง",
    effectiveDate: "1 ก.พ. 2026",
    note: "คาดปิดดีล Q1",
  },
  {
    id: "QT-2025-019",
    client: "LogiPort DC",
    plant: "ศูนย์แหลมฉบัง",
    mealCount: 650,
    pricePerHead: 69,
    status: "อนุมัติ",
    effectiveDate: "5 ม.ค. 2026",
    note: "รวมบริการของว่างเย็น",
  },
];

export const procurementOrders: ProcurementOrder[] = [
  {
    poNumber: "PO-8249",
    supplier: "AgriPro Poultry",
    itemSummary: "เนื้ออกไก่ 900 กก.",
    eta: "24 ธ.ค. 05:00 น.",
    status: "สั่งซื้อแล้ว",
    total: 70200,
  },
  {
    poNumber: "PO-8251",
    supplier: "FreshHerb Co.",
    itemSummary: "กะเพราขาว 180 กก.",
    eta: "22 ธ.ค. 04:30 น.",
    status: "รออนุมัติ",
    total: 19800,
  },
  {
    poNumber: "PO-8253",
    supplier: "Golden Grain",
    itemSummary: "ข้าวหอมมะลิ 6 ตัน",
    eta: "26 ธ.ค. 06:45 น.",
    status: "สั่งซื้อแล้ว",
    total: 198000,
  },
];

export const stockAdjustments: StockAdjustment[] = [
  {
    kitchen: "ครัวกลางกรุงเทพฯ",
    item: "ไก่หมักเทอริยากิ",
    change: -85,
    reason: "ปรับสูตรลด portion",
    timestamp: "20 ธ.ค. 09:15 น.",
  },
  {
    kitchen: "โรงครัวระยอง",
    item: "มันฝรั่งปอกเปลือก",
    change: 120,
    reason: "รับเข้า lot พิเศษ",
    timestamp: "20 ธ.ค. 05:50 น.",
  },
  {
    kitchen: "ศูนย์แหลมฉบัง",
    item: "น้ำปลาพรีเมียม",
    change: -40,
    reason: "โอนให้ครัวกรุงเทพฯ",
    timestamp: "19 ธ.ค. 21:10 น.",
  },
];

export const mealShare: MealShareSlice[] = [
  { label: "อาหารเช้า", value: 24, color: "#E6D0B1" },
  { label: "อาหารกลางวัน", value: 46, color: "#0F4C3A" },
  { label: "อาหารเย็น", value: 30, color: "#D75F4B" },
];

export const weeklyCostTrend: WeeklyCostPoint[] = [
  { week: "สัปดาห์ 1", cost: 42.1, margin: 18.2 },
  { week: "สัปดาห์ 2", cost: 40.3, margin: 19.6 },
  { week: "สัปดาห์ 3", cost: 39.2, margin: 20.7 },
  { week: "สัปดาห์ 4", cost: 38.9, margin: 21.2 },
];

export const ingredientPriceTrend: IngredientPricePoint[] = [
  { month: "ก.ค.", chicken: 78, basil: 54, coconut: 66 },
  { month: "ส.ค.", chicken: 81, basil: 56, coconut: 64 },
  { month: "ก.ย.", chicken: 76, basil: 52, coconut: 62 },
  { month: "ต.ค.", chicken: 74, basil: 49, coconut: 61 },
  { month: "พ.ย.", chicken: 73, basil: 47, coconut: 59 },
  { month: "ธ.ค.", chicken: 75, basil: 52, coconut: 58 },
];
