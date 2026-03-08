import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

// Database Setup
const db = new Database('spotsense.db');

// Initialize Database Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'driver' -- 'admin', 'driver', 'cashier'
  );

  CREATE TABLE IF NOT EXISTS parking_slots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    label TEXT UNIQUE,
    status TEXT DEFAULT 'available', -- 'available', 'occupied', 'reserved'
    type TEXT DEFAULT 'standard'
  );

  CREATE TABLE IF NOT EXISTS reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    slot_id INTEGER,
    start_time TEXT,
    end_time TEXT,
    status TEXT DEFAULT 'active', -- 'active', 'completed', 'cancelled'
    ticket_code TEXT,
    entry_time TEXT,
    exit_time TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(slot_id) REFERENCES parking_slots(id)
  );
  
  CREATE TABLE IF NOT EXISTS billing (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reservation_id INTEGER,
    amount REAL,
    status TEXT DEFAULT 'pending', -- 'pending', 'paid'
    timestamp TEXT,
    FOREIGN KEY(reservation_id) REFERENCES reservations(id)
  );
`);

// Seed Initial Data
const userCount = db.prepare('SELECT count(*) as count FROM users').get() as { count: number };
if (userCount.count === 0) {
  const insertUser = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)');
  insertUser.run('Admin User', 'admin@spotsense.com', 'admin123', 'admin');
  insertUser.run('Cashier User', 'cashier@spotsense.com', 'cashier123', 'cashier');
  insertUser.run('John Driver', 'driver@test.com', 'driver123', 'driver');
}

// Ensure Walk-in Guest exists (for existing DBs)
const walkInExists = db.prepare('SELECT id FROM users WHERE email = ?').get('walkin@spotsense.com');
if (!walkInExists) {
  db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run('Walk-in Guest', 'walkin@spotsense.com', 'walkin', 'driver');
}

const slotCount = db.prepare('SELECT count(*) as count FROM parking_slots').get() as { count: number };
if (slotCount.count === 0) {
  const insertSlot = db.prepare('INSERT INTO parking_slots (label, type) VALUES (?, ?)');
  // Create 20 slots
  for (let i = 1; i <= 20; i++) {
    insertSlot.run(`A-${i}`, i <= 5 ? 'priority' : 'standard');
  }
}

// --- API Routes ---

// Auth
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ? AND password = ?').get(email, password);
  if (user) {
    res.json({ success: true, user });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;
  try {
    const result = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(name, email, password, 'driver');
    res.json({ success: true, userId: result.lastInsertRowid });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Email already exists' });
  }
});

// Slots
app.get('/api/slots', (req, res) => {
  const slots = db.prepare('SELECT * FROM parking_slots').all();
  res.json(slots);
});

// Simulate CV: Toggle Slot Status (Admin only in real app, but open for demo)
app.post('/api/slots/:id/toggle', (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'available' or 'occupied'
  db.prepare('UPDATE parking_slots SET status = ? WHERE id = ?').run(status, id);
  res.json({ success: true });
});

// Reservations
app.post('/api/reserve', (req, res) => {
  const { userId, slotId } = req.body;
  
  if (!userId || !slotId) {
    return res.status(400).json({ success: false, message: 'Missing User ID or Slot ID' });
  }

  const ticketCode = Math.random().toString(36).substring(7).toUpperCase();
  const startTime = new Date().toISOString();
  
  try {
    // Transaction to ensure slot is available
    const transaction = db.transaction(() => {
      const slot = db.prepare('SELECT status FROM parking_slots WHERE id = ?').get(slotId) as { status: string };
      if (slot.status !== 'available') throw new Error('Slot not available');
      
      db.prepare('UPDATE parking_slots SET status = ? WHERE id = ?').run('reserved', slotId);
      const result = db.prepare('INSERT INTO reservations (user_id, slot_id, start_time, status, ticket_code) VALUES (?, ?, ?, ?, ?)').run(userId, slotId, startTime, 'active', ticketCode);
      return { id: result.lastInsertRowid, ticketCode };
    });
    
    const result = transaction();
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.get('/api/reservations/:userId', (req, res) => {
  const { userId } = req.params;
  const reservations = db.prepare(`
    SELECT r.*, s.label as slot_label 
    FROM reservations r 
    JOIN parking_slots s ON r.slot_id = s.id 
    WHERE r.user_id = ? 
    ORDER BY r.id DESC
  `).all(userId);
  res.json(reservations);
});

// Cashier: Issue Walk-in Ticket
app.post('/api/cashier/issue', (req, res) => {
  const { slotId } = req.body;
  const ticketCode = Math.random().toString(36).substring(7).toUpperCase();
  const startTime = new Date().toISOString();
  
  try {
    const walkInUser = db.prepare('SELECT id FROM users WHERE email = ?').get('walkin@spotsense.com') as { id: number };
    
    const transaction = db.transaction(() => {
      const slot = db.prepare('SELECT status FROM parking_slots WHERE id = ?').get(slotId) as { status: string };
      if (slot.status !== 'available') throw new Error('Slot not available');
      
      db.prepare('UPDATE parking_slots SET status = ? WHERE id = ?').run('occupied', slotId); // Walk-ins occupy immediately
      const result = db.prepare('INSERT INTO reservations (user_id, slot_id, start_time, status, ticket_code) VALUES (?, ?, ?, ?, ?)').run(walkInUser.id, slotId, startTime, 'active', ticketCode);
      return { id: result.lastInsertRowid, ticketCode };
    });
    
    const result = transaction();
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Cashier: Calculate Fee & Checkout
app.post('/api/cashier/checkout', (req, res) => {
  const { ticketCode } = req.body;
  const endTime = new Date();
  
  try {
    const reservation = db.prepare('SELECT * FROM reservations WHERE ticket_code = ? AND status = ?').get(ticketCode, 'active') as any;
    if (!reservation) throw new Error('Invalid or inactive ticket');
    
    const startTime = new Date(reservation.start_time);
    const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    
    // Fee Calculation: 50 PHP first 3 hours, 20 PHP per succeeding hour
    let fee = 50;
    if (durationHours > 3) {
      fee += Math.ceil(durationHours - 3) * 20;
    }
    
    const transaction = db.transaction(() => {
      db.prepare('UPDATE reservations SET status = ?, end_time = ? WHERE id = ?').run('completed', endTime.toISOString(), reservation.id);
      db.prepare('UPDATE parking_slots SET status = ? WHERE id = ?').run('available', reservation.slot_id);
      db.prepare('INSERT INTO billing (reservation_id, amount, status, timestamp) VALUES (?, ?, ?, ?)').run(reservation.id, fee, 'paid', endTime.toISOString());
      return { fee, duration: durationHours.toFixed(2) };
    });
    
    const result = transaction();
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Find My Car
app.get('/api/find-car', (req, res) => {
  const { query } = req.query; // Ticket ID or Slot Label
  const result = db.prepare(`
    SELECT r.*, s.label as slot_label, u.name as driver_name
    FROM reservations r
    JOIN parking_slots s ON r.slot_id = s.id
    JOIN users u ON r.user_id = u.id
    WHERE (r.ticket_code = ? OR s.label = ?)
    AND r.status = 'active'
  `).get(query, query);
  
  if (result) {
    res.json({ success: true, data: result });
  } else {
    res.status(404).json({ success: false, message: 'Vehicle not found' });
  }
});

// Admin Stats
app.get('/api/stats', (req, res) => {
  const totalSlots = db.prepare('SELECT count(*) as count FROM parking_slots').get() as { count: number };
  const occupied = db.prepare('SELECT count(*) as count FROM parking_slots WHERE status = ?').get('occupied') as { count: number };
  const reserved = db.prepare('SELECT count(*) as count FROM parking_slots WHERE status = ?').get('reserved') as { count: number };
  const available = totalSlots.count - occupied.count - reserved.count;
  
  res.json({
    total: totalSlots.count,
    occupied: occupied.count,
    reserved: reserved.count,
    available
  });
});

// Gemini Chatbot
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const model = ai.getGenerativeModel({ model: "gemini-3.1-pro-preview" });

    const systemPrompt = `
      You are the AI assistant for SpotSense, a smart parking management system.
      
      System Details:
      - SpotSense uses computer vision to monitor parking slots.
      - Features: Real-time dashboard, Reservations, Walk-in parking, Auto-billing, Find My Car.
      - Pricing: 50 PHP for first 3 hours, 20 PHP per succeeding hour.
      - Users can reserve slots via the app.
      - Admins can monitor occupancy.
      
      Answer user questions about the system, how to use it, and troubleshooting.
      Keep answers concise and helpful.
    `;

    const result = await model.generateContent({
      contents: [
        { role: 'user', parts: [{ text: systemPrompt + "\n\nUser Question: " + message }] }
      ]
    });

    const response = result.response.text();
    res.json({ reply: response });
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ reply: "I'm having trouble connecting to the AI right now. Please try again later." });
  }
});


// Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
