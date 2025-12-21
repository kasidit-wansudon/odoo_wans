# Service Interfaces and Schema Mapping

This document outlines the design for integration services to connect the catering frontend with Odoo backend. All services will be implemented as integration services using NestJS (Node.js 18) to handle XML-RPC/JSON-RPC communication with Odoo.

## Architecture Overview

- **Technology Stack**: NestJS (Node.js 18) for backend services
- **Communication**: XML-RPC/JSON-RPC with Odoo
- **Authentication**: API keys, DB name, endpoints configured via environment variables
- **Data Flow**: Frontend → Service Layer → Odoo API → Service Layer → Frontend

## Service Interfaces

### RecipeService

Handles recipe management, including BOM (Bill of Materials) and scheduling.

**Interface Definition:**
```typescript
interface RecipeService {
  // CRUD Operations
  createRecipe(recipe: RecipeCreateInput): Promise<Recipe>;
  getRecipe(id: number): Promise<Recipe>;
  updateRecipe(id: number, recipe: RecipeUpdateInput): Promise<Recipe>;
  deleteRecipe(id: number): Promise<void>;
  listRecipes(filters: RecipeFilters): Promise<Recipe[]>;

  // BOM Management
  getRecipeBOM(recipeId: number): Promise<Ingredient[]>;
  updateRecipeBOM(recipeId: number, ingredients: Ingredient[]): Promise<void>;

  // Scheduling
  createSchedule(schedule: RecipeScheduleInput): Promise<RecipeSchedule>;
  getSchedules(recipeId?: number, dateRange?: DateRange): Promise<RecipeSchedule[]>;
  updateSchedule(id: number, schedule: RecipeScheduleUpdateInput): Promise<RecipeSchedule>;
  deleteSchedule(id: number): Promise<void>;
}
```

**Odoo Mapping:**
- Recipe → `mrp.bom` (Bill of Materials)
- Recipe BOM lines → `mrp.bom.line`
- Scheduling → Custom module or `mrp.production` with planning dates

**Schema Mapping:**
```typescript
interface Recipe {
  id: number;
  name: string;
  category: string;
  factory: string;
  portions: number;
  costPerPlate: number;
  margin: number;
  ingredients: Ingredient[];
  schedules: RecipeSchedule[];
}

// Maps to Odoo mrp.bom fields:
// - name → product_tmpl_id.name
// - category → custom field or product category
// - factory → location_id or custom field
// - portions → product_qty
// - costPerPlate → custom calculation from BOM lines
// - margin → custom calculation
```

### POService (Purchase Order Service)

Manages procurement orders and supplier interactions.

**Interface Definition:**
```typescript
interface POService {
  // CRUD Operations
  createPO(po: POCreateInput): Promise<PO>;
  getPO(id: number): Promise<PO>;
  updatePO(id: number, po: POUpdateInput): Promise<PO>;
  deletePO(id: number): Promise<void>;
  listPOs(filters: POFilters): Promise<PO[]>;

  // Status Management
  approvePO(id: number): Promise<PO>;
  receivePO(id: number, receivedItems: ReceivedItem[]): Promise<PO>;

  // Supplier Management
  getSuppliers(): Promise<Supplier[]>;
  getSupplierProducts(supplierId: number): Promise<Product[]>;
}
```

**Odoo Mapping:**
- PO → `purchase.order`
- PO Lines → `purchase.order.line`
- Supplier → `res.partner` with supplier flag
- Products → `product.product`

**Schema Mapping:**
```typescript
interface PO {
  id: number;
  poNumber: string;
  supplier: string;
  status: 'รออนุมัติ' | 'สั่งซื้อแล้ว' | 'รับเข้าแล้ว';
  total: number;
  eta: string;
  itemSummary: string;
  items: POItem[];
}

// Maps to Odoo purchase.order fields:
// - poNumber → name
// - supplier → partner_id.name
// - status → state (draft → รออนุมัติ, purchase → สั่งซื้อแล้ว, done → รับเข้าแล้ว)
// - total → amount_total
// - eta → date_planned
// - itemSummary → computed from order lines
```

### QuoteService

Handles quote/quotation management for client orders.

**Interface Definition:**
```typescript
interface QuoteService {
  // CRUD Operations
  createQuote(quote: QuoteCreateInput): Promise<Quote>;
  getQuote(id: number): Promise<Quote>;
  updateQuote(id: number, quote: QuoteUpdateInput): Promise<Quote>;
  deleteQuote(id: number): Promise<void>;
  listQuotes(filters: QuoteFilters): Promise<Quote[]>;

  // Status Management
  sendQuote(id: number): Promise<Quote>;
  approveQuote(id: number): Promise<Quote>;

  // Client Management
  getClients(): Promise<Client[]>;
  searchClients(query: string): Promise<Client[]>;
}
```

**Odoo Mapping:**
- Quote → `sale.order` with quotation state
- Quote Lines → `sale.order.line`
- Client → `res.partner` with customer flag

**Schema Mapping:**
```typescript
interface Quote {
  id: number;
  client: string;
  plant: string;
  mealCount: number;
  pricePerHead: number;
  status: 'ร่าง' | 'ส่งแล้ว' | 'อนุมัติ';
  effectiveDate: string;
  note?: string;
}

// Maps to Odoo sale.order fields:
// - client → partner_id.name
// - plant → custom field or location
// - mealCount → custom calculation from order lines
// - pricePerHead → price_unit on lines
// - status → state (draft → ร่าง, sent → ส่งแล้ว, sale → อนุมัติ)
// - effectiveDate → date_order
```

### StockService

Manages inventory levels and stock adjustments.

**Interface Definition:**
```typescript
interface StockService {
  // Inventory Operations
  getStockLevels(filters: StockFilters): Promise<StockLevel[]>;
  updateStockLevel(productId: number, quantity: number, reason: string): Promise<StockLevel>;

  // Coverage Calculations
  getCoverageDays(productId: number): Promise<number>;
  getLowStockAlerts(threshold: number): Promise<StockAlert[]>;

  // Product Management
  getProducts(): Promise<Product[]>;
  searchProducts(query: string): Promise<Product[]>;
}
```

**Odoo Mapping:**
- Stock Levels → `stock.quant`
- Stock Moves → `stock.move`
- Products → `product.product`
- Locations → `stock.location`

**Schema Mapping:**
```typescript
interface StockLevel {
  ingredient: string;
  onHand: number;
  uom: string;
  location: string;
  coverageDays: number;
  lastUpdated: string;
}

// Maps to Odoo stock.quant fields:
// - ingredient → product_id.name
// - onHand → quantity
// - uom → product_uom_id.name
// - location → location_id.name
// - coverageDays → custom calculation from consumption rates
```

## Common Types

```typescript
interface Ingredient {
  name: string;
  quantity: number;
  uom: string;
  cost?: number;
}

interface RecipeSchedule {
  date: string;
  factory: string;
  client: string;
  meal: string;
  recipe: string;
  portions: number;
}

interface Supplier {
  id: number;
  name: string;
  contact: string;
  products: Product[];
}

interface Product {
  id: number;
  name: string;
  uom: string;
  cost: number;
  suppliers: Supplier[];
}

interface Client {
  id: number;
  name: string;
  contact: string;
}

interface ReceivedItem {
  productId: number;
  receivedQuantity: number;
  notes?: string;
}

// Filter interfaces
interface RecipeFilters {
  category?: string;
  factory?: string;
  searchTerm?: string;
}

interface POFilters {
  supplier?: string;
  status?: string;
  searchTerm?: string;
  dateRange?: DateRange;
}

interface QuoteFilters {
  status?: string;
  plant?: string;
  client?: string;
  searchTerm?: string;
}

interface StockFilters {
  location?: string;
  productCategory?: string;
  lowStockOnly?: boolean;
}

interface DateRange {
  start: string;
  end: string;
}
```

## Implementation Plan

1. **Setup NestJS Project Structure**
   - Create separate modules for each service
   - Configure Odoo XML-RPC client
   - Set up environment configuration

2. **Authentication & Configuration**
   - API key management
   - Odoo connection parameters
   - Error handling and retry logic

3. **Data Transformation Layer**
   - Map internal schemas to Odoo models
   - Handle field conversions and validations
   - Implement caching for frequently accessed data

4. **Error Handling & Logging**
   - Standardized error responses
   - Integration with frontend error states
   - Audit logging for stock/PO changes

5. **Testing Strategy**
   - Unit tests for service methods
   - Integration tests with mock Odoo responses
   - E2E tests with actual Odoo instance (staging)

## Next Steps

- Implement RecipeService first (highest priority for recipe management)
- Create shared utilities for Odoo communication
- Design authentication flow and API key rotation
- Plan data synchronization strategy for offline/online modes
