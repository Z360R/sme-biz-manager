import 'dotenv/config'
import mysql from 'mysql2/promise'
import bcrypt from 'bcryptjs'
import type { ResultSetHeader, RowDataPacket } from 'mysql2'

// ── Types ──────────────────────────────────────────────────────────────────

type MovementType = 'stock_in' | 'stock_out'
type OrderStatus = 'pending' | 'fulfilled' | 'cancelled'
type DealStage = 'lead' | 'active' | 'closed'

interface StockMovement { type: MovementType; qty: number; reason: string }
interface OrderItem { productIdx: number; qty: number }

// ── Seed Data ──────────────────────────────────────────────────────────────

const USERS = [
  { email: 'admin@demo.com', password: 'Demo@1234', role: 'admin' },
  { email: 'staff@demo.com', password: 'Demo@1234', role: 'staff' },
]

const CONTACTS = [
  // PH (10)
  { firstName: 'Maria',       lastName: 'Santos',     email: 'maria.santos@techsolutions.ph',  phone: '+639171234567', company: 'TechSolutions PH'      },
  { firstName: 'Juan',        lastName: 'Dela Cruz',  email: 'juan.delacruz@globaltraders.ph', phone: '+639281234567', company: 'Global Traders Inc.'    },
  { firstName: 'Ana',         lastName: 'Reyes',      email: 'ana.reyes@creativestudio.ph',    phone: '+639391234567', company: 'Creative Studio PH'     },
  { firstName: 'Jose',        lastName: 'Garcia',     email: 'jose.garcia@buildpro.ph',        phone: '+639451234567', company: 'BuildPro Construction'  },
  { firstName: 'Rosa',        lastName: 'Mendoza',    email: 'rosa.mendoza@shopmart.ph',       phone: '+639561234567', company: 'ShopMart Retail'        },
  { firstName: 'Miguel',      lastName: 'Torres',     email: 'miguel.torres@itservices.ph',    phone: '+639671234567', company: 'IT Services PH'         },
  { firstName: 'Elena',       lastName: 'Bautista',   email: 'elena.bautista@foodchain.ph',    phone: '+639781234567', company: 'FoodChain PH'           },
  { firstName: 'Carlos',      lastName: 'Villanueva', email: 'carlos.v@logisticsplus.ph',      phone: '+639891234567', company: 'Logistics Plus'         },
  { firstName: 'Liza',        lastName: 'Aquino',     email: 'liza.aquino@medcenter.ph',       phone: '+639171234568', company: 'MedCenter Clinic'       },
  { firstName: 'Ramon',       lastName: 'Cruz',       email: 'ramon.cruz@edutech.ph',          phone: '+639281234568', company: 'EduTech Academy'        },
  // US/EU (15)
  { firstName: 'James',       lastName: 'Anderson',   email: 'j.anderson@innovatellc.com',     phone: '+14155551234',  company: 'Innovate LLC'           },
  { firstName: 'Sarah',       lastName: 'Williams',   email: 'sarah.w@nextgenretail.com',      phone: '+14255551234',  company: 'NextGen Retail'         },
  { firstName: 'Michael',     lastName: 'Brown',      email: 'mbrown@cloudworks.io',           phone: '+14355551234',  company: 'CloudWorks'             },
  { firstName: 'Emily',       lastName: 'Davis',      email: 'emily.d@greensupply.com',        phone: '+14455551234',  company: 'Green Supply Co.'       },
  { firstName: 'David',       lastName: 'Martinez',   email: 'david.m@alphaconsult.com',       phone: '+14555551234',  company: 'Alpha Consulting'       },
  { firstName: 'Laura',       lastName: 'Wilson',     email: 'laura.w@peakhomes.com',          phone: '+14655551234',  company: 'Peak Homes Realty'      },
  { firstName: 'Robert',      lastName: 'Taylor',     email: 'rtaylor@digitalmedia.com',       phone: '+14755551234',  company: 'Digital Media Group'    },
  { firstName: 'Jessica',     lastName: 'Thomas',     email: 'j.thomas@swiftlogistics.com',    phone: '+14855551234',  company: 'Swift Logistics'        },
  { firstName: 'Christopher', lastName: 'Jackson',    email: 'c.jackson@vertex.io',            phone: '+14955551234',  company: 'Vertex Tech'            },
  { firstName: 'Amanda',      lastName: 'White',      email: 'a.white@brightfinance.com',      phone: '+15055551234',  company: 'Bright Finance'         },
  { firstName: 'Hans',        lastName: 'Mueller',    email: 'h.mueller@eurotrade.de',         phone: '+4989551234',   company: 'EuroTrade GmbH'         },
  { firstName: 'Sophie',      lastName: 'Dubois',     email: 's.dubois@frenchsolutions.fr',    phone: '+33155551234',  company: 'French Solutions SAS'   },
  { firstName: 'Luca',        lastName: 'Rossi',      email: 'l.rossi@italtech.it',            phone: '+3902551234',   company: 'ItalTech SRL'           },
  { firstName: 'Emma',        lastName: 'Nielsen',    email: 'e.nielsen@nordicsys.dk',         phone: '+4535551234',   company: 'Nordic Systems ApS'     },
  { firstName: 'Raj',         lastName: 'Patel',      email: 'r.patel@techbridge.co.uk',       phone: '+4420551234',   company: 'TechBridge Ltd.'        },
]

const CONTACT_NOTES: Record<number, string[]> = {
  0:  ['Called to discuss website redesign scope — client prefers minimalist, mobile-first approach.', 'Sent proposal PDF. Awaiting feedback by end of month.'],
  1:  ['Initial meeting done. CRM integration timeline set to 12 weeks.', 'Technical requirements document shared via email.'],
  2:  ['Interested in full infrastructure audit. Prefers onsite assessment over remote.'],
  3:  ['Signed Q1 supply agreement. Delivery scheduled for Jan 15.', 'Follow up on Q2 renewal in March.'],
  5:  ['Visited office for site survey. Network upgrade scope confirmed — 3 floors.'],
  6:  ['Security installation completed and signed off. Client satisfied with CCTV placement.'],
  9:  ['Training program dates confirmed: July 14–15.', 'Need to prepare workbooks and hands-on exercise files.'],
  11: ['License renewal discussion ongoing. Client wants to add Slack and Jira integrations.'],
  14: ['ERP kick-off meeting completed. Phase 1 scope locked — core modules only.', 'Weekly status calls every Monday 9AM EST.'],
  16: ['Laptop fleet delivery confirmed. All 50 units pre-imaged and configured before handover.'],
  20: ['Accounting software demo completed. Client requested a 3-month pilot before full rollout.'],
  24: ['Initial contact via LinkedIn referral from Raj Patel. High interest in CRM module.'],
}

const PRODUCTS = [
  // Electronics (5)
  { sku: 'ELT-001', name: 'Business Laptop 14"',           category: 'Electronics',     unitPrice: 850.00, stockQty: 45,  lowStockThreshold: 5  },
  { sku: 'ELT-002', name: 'Wireless Mouse',                category: 'Electronics',     unitPrice: 25.00,  stockQty: 120, lowStockThreshold: 20 },
  { sku: 'ELT-003', name: 'USB-C Hub 7-Port',              category: 'Electronics',     unitPrice: 45.00,  stockQty: 8,   lowStockThreshold: 15 }, // low
  { sku: 'ELT-004', name: '27" LED Monitor',               category: 'Electronics',     unitPrice: 320.00, stockQty: 22,  lowStockThreshold: 5  },
  { sku: 'ELT-005', name: 'Mechanical Keyboard',           category: 'Electronics',     unitPrice: 110.00, stockQty: 35,  lowStockThreshold: 10 },
  // Office Supplies (4)
  { sku: 'OFF-001', name: 'A4 Paper Ream (500 sheets)',    category: 'Office Supplies', unitPrice: 5.50,   stockQty: 200, lowStockThreshold: 50 },
  { sku: 'OFF-002', name: 'Black Ballpen Box (12pcs)',     category: 'Office Supplies', unitPrice: 3.00,   stockQty: 85,  lowStockThreshold: 30 },
  { sku: 'OFF-003', name: 'Whiteboard Marker Set',         category: 'Office Supplies', unitPrice: 8.00,   stockQty: 6,   lowStockThreshold: 15 }, // low
  { sku: 'OFF-004', name: 'Sticky Notes Pack',             category: 'Office Supplies', unitPrice: 4.00,   stockQty: 150, lowStockThreshold: 40 },
  // Furniture (4)
  { sku: 'FRN-001', name: 'Ergonomic Office Chair',        category: 'Furniture',       unitPrice: 280.00, stockQty: 12,  lowStockThreshold: 3  },
  { sku: 'FRN-002', name: 'Electric Standing Desk',        category: 'Furniture',       unitPrice: 450.00, stockQty: 4,   lowStockThreshold: 3  },
  { sku: 'FRN-003', name: '3-Drawer Filing Cabinet',       category: 'Furniture',       unitPrice: 180.00, stockQty: 9,   lowStockThreshold: 2  },
  { sku: 'FRN-004', name: '5-Tier Bookshelf',              category: 'Furniture',       unitPrice: 120.00, stockQty: 7,   lowStockThreshold: 2  },
  // Software (4)
  { sku: 'SFT-001', name: 'Project Mgmt License (Annual)', category: 'Software',        unitPrice: 99.00,  stockQty: 50,  lowStockThreshold: 10 },
  { sku: 'SFT-002', name: 'Antivirus Suite (5 Dev, 1yr)',  category: 'Software',        unitPrice: 45.00,  stockQty: 30,  lowStockThreshold: 10 },
  { sku: 'SFT-003', name: 'Accounting Software License',   category: 'Software',        unitPrice: 199.00, stockQty: 3,   lowStockThreshold: 5  }, // low
  { sku: 'SFT-004', name: 'Design Suite License (Annual)', category: 'Software',        unitPrice: 149.00, stockQty: 18,  lowStockThreshold: 5  },
  // Hardware (3)
  { sku: 'HRD-001', name: 'Network Switch 24-Port',        category: 'Hardware',        unitPrice: 210.00, stockQty: 14,  lowStockThreshold: 3  },
  { sku: 'HRD-002', name: 'UPS 650VA',                     category: 'Hardware',        unitPrice: 85.00,  stockQty: 22,  lowStockThreshold: 5  },
  { sku: 'HRD-003', name: 'Ethernet Cable Cat6 (25m)',     category: 'Hardware',        unitPrice: 18.00,  stockQty: 60,  lowStockThreshold: 20 },
]

// 3 movements per product = 60 total; order matches PRODUCTS array
const MOVEMENTS_BY_PRODUCT: StockMovement[][] = [
  /* ELT-001 */ [{ type: 'stock_in',  qty: 60, reason: 'Initial procurement — Q1 batch' },           { type: 'stock_out', qty: 20, reason: 'Sold to Digital Media Group' },            { type: 'stock_in',  qty: 5,  reason: 'Restocking — returned units' }],
  /* ELT-002 */ [{ type: 'stock_in',  qty: 150,reason: 'Bulk order — office peripherals' },          { type: 'stock_out', qty: 40, reason: 'Distributed to all departments' },          { type: 'stock_in',  qty: 10, reason: 'Replenishment order' }],
  /* ELT-003 */ [{ type: 'stock_in',  qty: 30, reason: 'Initial stock' },                            { type: 'stock_out', qty: 15, reason: 'Client order — Vertex Tech' },              { type: 'stock_out', qty: 7,  reason: 'Internal IT use' }],
  /* ELT-004 */ [{ type: 'stock_in',  qty: 30, reason: 'Q2 procurement batch' },                     { type: 'stock_out', qty: 10, reason: 'Sold — bulk client order' },                { type: 'stock_in',  qty: 2,  reason: 'Warranty replacement received' }],
  /* ELT-005 */ [{ type: 'stock_in',  qty: 50, reason: 'Initial stock' },                            { type: 'stock_out', qty: 20, reason: 'New hire office setup — 20 units' },       { type: 'stock_in',  qty: 5,  reason: 'Restocking' }],
  /* OFF-001 */ [{ type: 'stock_in',  qty: 250,reason: 'Quarterly supply run' },                     { type: 'stock_out', qty: 60, reason: 'Office consumption — all floors' },         { type: 'stock_in',  qty: 10, reason: 'Emergency restock' }],
  /* OFF-002 */ [{ type: 'stock_in',  qty: 100,reason: 'Quarterly stationery order' },               { type: 'stock_out', qty: 20, reason: 'Distributed to all departments' },          { type: 'stock_in',  qty: 5,  reason: 'Top-up restock' }],
  /* OFF-003 */ [{ type: 'stock_in',  qty: 20, reason: 'Initial stock' },                            { type: 'stock_out', qty: 10, reason: 'Conference room restocking' },              { type: 'stock_out', qty: 4,  reason: 'Training room supply' }],
  /* OFF-004 */ [{ type: 'stock_in',  qty: 200,reason: 'Bulk purchase' },                            { type: 'stock_out', qty: 60, reason: 'Office-wide distribution' },                { type: 'stock_in',  qty: 10, reason: 'Replenishment' }],
  /* FRN-001 */ [{ type: 'stock_in',  qty: 20, reason: 'Office furniture procurement' },             { type: 'stock_out', qty: 6,  reason: 'Client order — Alpha Consulting' },         { type: 'stock_out', qty: 2,  reason: 'Internal office expansion' }],
  /* FRN-002 */ [{ type: 'stock_in',  qty: 10, reason: 'New product line — initial stock' },         { type: 'stock_out', qty: 4,  reason: 'Showroom and demo units' },                 { type: 'stock_out', qty: 2,  reason: 'Client order — EduTech Academy' }],
  /* FRN-003 */ [{ type: 'stock_in',  qty: 15, reason: 'Furniture procurement batch' },              { type: 'stock_out', qty: 4,  reason: 'Sold — BuildPro Construction' },             { type: 'stock_out', qty: 2,  reason: 'Internal office use' }],
  /* FRN-004 */ [{ type: 'stock_in',  qty: 12, reason: 'Initial procurement' },                      { type: 'stock_out', qty: 3,  reason: 'Internal office setup' },                   { type: 'stock_out', qty: 2,  reason: 'Client delivery' }],
  /* SFT-001 */ [{ type: 'stock_in',  qty: 60, reason: 'License batch purchase' },                   { type: 'stock_out', qty: 15, reason: 'Sold — Innovate LLC (15 seats)' },          { type: 'stock_in',  qty: 5,  reason: 'Additional batch' }],
  /* SFT-002 */ [{ type: 'stock_in',  qty: 40, reason: 'Annual license renewal batch' },             { type: 'stock_out', qty: 12, reason: 'Client deployments — 4 accounts' },         { type: 'stock_in',  qty: 2,  reason: 'Top-up' }],
  /* SFT-003 */ [{ type: 'stock_in',  qty: 10, reason: 'Initial license batch' },                    { type: 'stock_out', qty: 4,  reason: 'Sold — EuroTrade GmbH' },                   { type: 'stock_out', qty: 3,  reason: 'Client pilot deployments' }],
  /* SFT-004 */ [{ type: 'stock_in',  qty: 25, reason: 'License procurement' },                      { type: 'stock_out', qty: 8,  reason: 'Sold — French Solutions SAS' },             { type: 'stock_in',  qty: 1,  reason: 'Additional license' }],
  /* HRD-001 */ [{ type: 'stock_in',  qty: 20, reason: 'Hardware procurement batch' },               { type: 'stock_out', qty: 5,  reason: 'Installed — IT Services PH office' },      { type: 'stock_out', qty: 1,  reason: 'Warranty replacement unit' }],
  /* HRD-002 */ [{ type: 'stock_in',  qty: 30, reason: 'Power backup stock' },                       { type: 'stock_out', qty: 10, reason: 'Installed across office floors' },           { type: 'stock_in',  qty: 2,  reason: 'Restocking' }],
  /* HRD-003 */ [{ type: 'stock_in',  qty: 80, reason: 'Cable bulk order' },                         { type: 'stock_out', qty: 25, reason: 'Network installation — Logistics Plus' },   { type: 'stock_in',  qty: 5,  reason: 'Replenishment' }],
]

const DEALS: { title: string; contactIdx: number; stage: DealStage; value: number; notes: string }[] = [
  // Lead (5)
  { title: 'Website Redesign Project',        contactIdx: 0,  stage: 'lead',   value: 3500.00,  notes: 'Client wants a modern redesign with a mobile-first approach.' },
  { title: 'IT Infrastructure Audit',         contactIdx: 2,  stage: 'lead',   value: 8000.00,  notes: 'Full network audit and security posture assessment.' },
  { title: 'Inventory System License',        contactIdx: 10, stage: 'lead',   value: 2400.00,  notes: 'Interested in annual licensing for 10 users.' },
  { title: 'Office Furniture Package',        contactIdx: 4,  stage: 'lead',   value: 6200.00,  notes: 'Expanding office space — needs chairs and standing desks.' },
  { title: 'Cloud Migration Consulting',      contactIdx: 12, stage: 'lead',   value: 12000.00, notes: 'Moving legacy on-prem to AWS, 3-month engagement.' },
  // Active (6)
  { title: 'CRM Integration Project',         contactIdx: 1,  stage: 'active', value: 15000.00, notes: 'Custom CRM integration with existing ERP system.' },
  { title: 'Annual Software Licenses',        contactIdx: 11, stage: 'active', value: 4500.00,  notes: 'Renewal + 5 new seats for Q2 expansion.' },
  { title: 'Network Infrastructure Upgrade',  contactIdx: 5,  stage: 'active', value: 22000.00, notes: 'Full office rewire + new managed switches and APs.' },
  { title: 'ERP Implementation Phase 1',      contactIdx: 14, stage: 'active', value: 35000.00, notes: 'Phase 1 of 3 — core modules and data migration only.' },
  { title: 'Hardware Procurement 2026',       contactIdx: 7,  stage: 'active', value: 18500.00, notes: 'Bulk laptop + peripheral procurement for 30 staff.' },
  { title: 'Staff Training Program',          contactIdx: 9,  stage: 'active', value: 5800.00,  notes: '2-day onsite training covering productivity tools.' },
  // Closed (4)
  { title: 'Q1 Office Supplies Contract',     contactIdx: 3,  stage: 'closed', value: 3200.00,  notes: 'Won — quarterly supply agreement signed and fulfilled.' },
  { title: 'Security System Installation',    contactIdx: 6,  stage: 'closed', value: 9500.00,  notes: 'Won — CCTV and access control system fully installed.' },
  { title: 'Accounting Software Rollout',     contactIdx: 20, stage: 'closed', value: 7800.00,  notes: 'Won — deployed across 3 departments successfully.' },
  { title: 'Laptop Fleet Refresh',            contactIdx: 16, stage: 'closed', value: 42000.00, notes: 'Won — 50 units delivered, configured, and handed over.' },
]

const ORDERS: { contactIdx: number; status: OrderStatus; items: OrderItem[] }[] = [
  // Pending (6)
  { contactIdx: 2,  status: 'pending',   items: [{ productIdx: 0,  qty: 2 }, { productIdx: 4, qty: 3 }] },
  { contactIdx: 11, status: 'pending',   items: [{ productIdx: 6,  qty: 10 }] },
  { contactIdx: 17, status: 'pending',   items: [{ productIdx: 13, qty: 5 }, { productIdx: 14, qty: 5 }] },
  { contactIdx: 8,  status: 'pending',   items: [{ productIdx: 9,  qty: 4 }] },
  { contactIdx: 21, status: 'pending',   items: [{ productIdx: 1,  qty: 20 }, { productIdx: 2, qty: 5 }] },
  { contactIdx: 24, status: 'pending',   items: [{ productIdx: 16, qty: 3 }] },
  // Fulfilled (8)
  { contactIdx: 3,  status: 'fulfilled', items: [{ productIdx: 5,  qty: 20 }, { productIdx: 7, qty: 10 }] },
  { contactIdx: 16, status: 'fulfilled', items: [{ productIdx: 0,  qty: 50 }] },
  { contactIdx: 6,  status: 'fulfilled', items: [{ productIdx: 17, qty: 3 }, { productIdx: 18, qty: 5 }] },
  { contactIdx: 20, status: 'fulfilled', items: [{ productIdx: 15, qty: 2 }] },
  { contactIdx: 1,  status: 'fulfilled', items: [{ productIdx: 3,  qty: 5 }] },
  { contactIdx: 13, status: 'fulfilled', items: [{ productIdx: 9,  qty: 2 }, { productIdx: 10, qty: 1 }] },
  { contactIdx: 23, status: 'fulfilled', items: [{ productIdx: 19, qty: 30 }] },
  { contactIdx: 4,  status: 'fulfilled', items: [{ productIdx: 8,  qty: 50 }, { productIdx: 6, qty: 20 }] },
  // Cancelled (4)
  { contactIdx: 15, status: 'cancelled', items: [{ productIdx: 11, qty: 3 }] },
  { contactIdx: 19, status: 'cancelled', items: [{ productIdx: 13, qty: 10 }] },
  { contactIdx: 22, status: 'cancelled', items: [{ productIdx: 4,  qty: 2 }] },
  { contactIdx: 7,  status: 'cancelled', items: [{ productIdx: 3,  qty: 3 }, { productIdx: 4, qty: 1 }] },
]

// ── Main ───────────────────────────────────────────────────────────────────

async function seed() {
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST,
    port:     Number(process.env.DB_PORT ?? 3306),
    database: process.env.DB_NAME,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  })

  try {
    // ── 1. Users (upsert — preserves existing passwords) ─────────────────────
    for (const u of USERS) {
      const hash = await bcrypt.hash(u.password, 12)
      await conn.execute(
        `INSERT INTO users (email, password_hash, role)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), role = VALUES(role)`,
        [u.email, hash, u.role],
      )
      console.log(`✓ Upserted user: ${u.email} (${u.role})`)
    }

    const [adminRows] = await conn.query<RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      ['admin@demo.com'],
    )
    const adminId: number = adminRows[0].id

    // ── 2. Clear existing demo data (FK checks off to avoid ordering issues) ─
    await conn.query('SET FOREIGN_KEY_CHECKS = 0')
    for (const table of ['order_status_history', 'order_items', 'orders', 'stock_movements', 'deal_activities', 'contact_notes', 'deals', 'contacts', 'products']) {
      await conn.query(`DELETE FROM ${table}`)
    }
    await conn.query('SET FOREIGN_KEY_CHECKS = 1')
    console.log('✓ Cleared existing demo data')

    // ── 3. Contacts ──────────────────────────────────────────────────────────
    const contactIds: number[] = []
    for (const c of CONTACTS) {
      const [res] = await conn.execute<ResultSetHeader>(
        'INSERT INTO contacts (first_name, last_name, email, phone, company, created_by) VALUES (?, ?, ?, ?, ?, ?)',
        [c.firstName, c.lastName, c.email, c.phone, c.company, adminId],
      )
      contactIds.push(res.insertId)
    }
    console.log(`✓ Inserted ${contactIds.length} contacts`)

    // ── 4. Contact Notes ─────────────────────────────────────────────────────
    let noteCount = 0
    for (const [idxStr, notes] of Object.entries(CONTACT_NOTES)) {
      const contactId = contactIds[Number(idxStr)]
      for (const content of notes) {
        await conn.execute(
          'INSERT INTO contact_notes (contact_id, user_id, content) VALUES (?, ?, ?)',
          [contactId, adminId, content],
        )
        noteCount++
      }
    }
    console.log(`✓ Inserted ${noteCount} contact notes`)

    // ── 5. Deals + Deal Activities ───────────────────────────────────────────
    let activityCount = 0
    for (const d of DEALS) {
      const [res] = await conn.execute<ResultSetHeader>(
        'INSERT INTO deals (title, contact_id, stage, value, notes, created_by) VALUES (?, ?, ?, ?, ?, ?)',
        [d.title, contactIds[d.contactIdx], d.stage, d.value, d.notes, adminId],
      )
      const dealId = res.insertId

      await conn.execute(
        'INSERT INTO deal_activities (deal_id, user_id, action) VALUES (?, ?, ?)',
        [dealId, adminId, `Deal created — initial stage: ${d.stage}`],
      )
      activityCount++

      if (d.stage === 'active') {
        await conn.execute(
          'INSERT INTO deal_activities (deal_id, user_id, action) VALUES (?, ?, ?)',
          [dealId, adminId, 'Stage changed: Lead → Active — proposal accepted by client'],
        )
        activityCount++
      } else if (d.stage === 'closed') {
        await conn.execute(
          'INSERT INTO deal_activities (deal_id, user_id, action) VALUES (?, ?, ?)',
          [dealId, adminId, 'Stage changed: Lead → Active — evaluation started'],
        )
        await conn.execute(
          'INSERT INTO deal_activities (deal_id, user_id, action) VALUES (?, ?, ?)',
          [dealId, adminId, 'Stage changed: Active → Closed — contract signed'],
        )
        activityCount += 2
      }
    }
    console.log(`✓ Inserted ${DEALS.length} deals with ${activityCount} activities`)

    // ── 6. Products ──────────────────────────────────────────────────────────
    const productIds: number[] = []
    for (const p of PRODUCTS) {
      const [res] = await conn.execute<ResultSetHeader>(
        'INSERT INTO products (sku, name, category, unit_price, stock_qty, low_stock_threshold) VALUES (?, ?, ?, ?, ?, ?)',
        [p.sku, p.name, p.category, p.unitPrice, p.stockQty, p.lowStockThreshold],
      )
      productIds.push(res.insertId)
    }
    console.log(`✓ Inserted ${productIds.length} products`)

    // ── 7. Stock Movements (3 per product = 60 total) ────────────────────────
    let movementCount = 0
    for (let i = 0; i < PRODUCTS.length; i++) {
      for (const m of MOVEMENTS_BY_PRODUCT[i]) {
        await conn.execute(
          'INSERT INTO stock_movements (product_id, type, qty, reason, user_id) VALUES (?, ?, ?, ?, ?)',
          [productIds[i], m.type, m.qty, m.reason, adminId],
        )
        movementCount++
      }
    }
    console.log(`✓ Inserted ${movementCount} stock movements`)

    // ── 8. Orders + Items + Status History ───────────────────────────────────
    for (const o of ORDERS) {
      const total = o.items.reduce(
        (sum, item) => sum + PRODUCTS[item.productIdx].unitPrice * item.qty,
        0,
      )

      const [orderRes] = await conn.execute<ResultSetHeader>(
        'INSERT INTO orders (contact_id, status, total, created_by) VALUES (?, ?, ?, ?)',
        [contactIds[o.contactIdx], o.status, total, adminId],
      )
      const orderId = orderRes.insertId

      for (const item of o.items) {
        const unitPrice = PRODUCTS[item.productIdx].unitPrice
        await conn.execute(
          'INSERT INTO order_items (order_id, product_id, qty, unit_price, subtotal) VALUES (?, ?, ?, ?, ?)',
          [orderId, productIds[item.productIdx], item.qty, unitPrice, unitPrice * item.qty],
        )
      }

      // Status history: always record initial pending entry
      await conn.execute(
        'INSERT INTO order_status_history (order_id, status, changed_by) VALUES (?, ?, ?)',
        [orderId, 'pending', adminId],
      )
      if (o.status !== 'pending') {
        await conn.execute(
          'INSERT INTO order_status_history (order_id, status, changed_by) VALUES (?, ?, ?)',
          [orderId, o.status, adminId],
        )
      }
    }
    console.log(`✓ Inserted ${ORDERS.length} orders with line items and status history`)

    console.log('\n✅ Seed complete!')
    console.log('   Admin: admin@demo.com / Demo@1234')
    console.log('   Staff: staff@demo.com / Demo@1234')
  } finally {
    await conn.end()
  }
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
