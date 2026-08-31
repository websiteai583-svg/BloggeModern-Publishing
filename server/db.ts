import fs from 'fs';
import path from 'path';
import { 
  initialPosts, 
  initialComments, 
  initialPages, 
  initialThemes, 
  initialWidgets, 
  initialAdSlots, 
  initialMedia, 
  initialSettings, 
  initialLogs, 
  initialUsers,
  initialAnalytics,
  initialDonations,
  initialPayments,
  initialCampaigns,
  initialNotifications
} from '../src/data/initialData';

export interface DatabaseSchema {
  users: any[];
  posts: any[];
  comments: any[];
  pages: any[];
  widgets: any[];
  themes: any[];
  adSlots: any[];
  media: any[];
  settings: any;
  logs: any[];
  subscribers: any[];
  chatMessages: any[];
  donations: any[];
  payments: any[];
  campaigns: any[];
  analytics: any;
  readingLists: any[];
  notifications: any[];
  followers: any[];
  likes: any[];
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');
const DB_BACKUP_FILE = path.join(DB_DIR, 'db.backup.json');
const DB_BACKUP_FILE_OLD = path.join(DB_DIR, 'db.backup.1.json');

let dbState: DatabaseSchema;
let isWriting = false;
let pendingSave = false;

function getInitialState(): DatabaseSchema {
  return {
    users: initialUsers,
    posts: initialPosts,
    comments: initialComments,
    pages: initialPages,
    widgets: initialWidgets,
    themes: initialThemes,
    adSlots: initialAdSlots,
    media: initialMedia,
    settings: initialSettings,
    logs: initialLogs,
    subscribers: [
      { id: 'sub_1', email: 'reader1@example.com', subscribedAt: '2026-08-10', isActive: true },
      { id: 'sub_2', email: 'techfan@gmail.com', subscribedAt: '2026-08-12', isActive: true },
      { id: 'sub_3', email: 'banglablogger@yahoo.com', subscribedAt: '2026-08-15', isActive: true }
    ],
    chatMessages: [
      {
        id: 'msg_init_1',
        sender: 'admin',
        senderName: 'সাপোর্ট টিম (Blogge Helpdesk)',
        text: 'আসসালামু আলাইকুম! Blogge প্ল্যাটফর্মে আপনাকে স্বাগতম। আপনার ব্লগ তৈরি বা কন্টেন্ট প্রকাশে কোনো সহায়তার প্রয়োজন হলে লিখুন।',
        timestamp: '10:00 AM'
      }
    ],
    donations: initialDonations,
    payments: initialPayments,
    campaigns: initialCampaigns,
    analytics: initialAnalytics,
    readingLists: [
      {
        id: 'rl_init_1',
        userId: 'usr_1787561633296',
        postId: 'post_1',
        savedAt: new Date().toISOString()
      },
      {
        id: 'rl_init_2',
        userId: 'usr_1787561633296',
        postId: 'post_2',
        savedAt: new Date().toISOString()
      }
    ],
    notifications: initialNotifications || [],
    followers: [
      { id: 'fol_1', authorId: 'usr_1787561633296', followerId: 'usr_editor', followedAt: '2026-08-01' },
      { id: 'fol_2', authorId: 'usr_1787561633296', followerId: 'usr_author', followedAt: '2026-08-05' }
    ],
    likes: []
  };
}

export function initDatabase(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const data = fs.readFileSync(DB_FILE, 'utf-8');
        dbState = JSON.parse(data);
      } catch (parseErr) {
        console.warn('[DB] Primary db.json corrupted, attempting backup recovery...', parseErr);
        if (fs.existsSync(DB_BACKUP_FILE)) {
          try {
            const backupData = fs.readFileSync(DB_BACKUP_FILE, 'utf-8');
            dbState = JSON.parse(backupData);
            console.log('[DB] Successfully restored from db.backup.json');
          } catch (bErr) {
            if (fs.existsSync(DB_BACKUP_FILE_OLD)) {
              try {
                const oldBackupData = fs.readFileSync(DB_BACKUP_FILE_OLD, 'utf-8');
                dbState = JSON.parse(oldBackupData);
                console.log('[DB] Successfully restored from db.backup.1.json');
              } catch {
                dbState = getInitialState();
              }
            } else {
              dbState = getInitialState();
            }
          }
        } else {
          dbState = getInitialState();
        }
      }

      // Ensure all schema collections exist
      const defaultState = getInitialState();
      dbState = { ...defaultState, ...dbState };
      
      // Ensure arrays are arrays
      dbState.users = Array.isArray(dbState.users) ? dbState.users : defaultState.users;
      dbState.posts = Array.isArray(dbState.posts) ? dbState.posts : defaultState.posts;
      dbState.comments = Array.isArray(dbState.comments) ? dbState.comments : defaultState.comments;
      dbState.pages = Array.isArray(dbState.pages) ? dbState.pages : defaultState.pages;
      dbState.widgets = Array.isArray(dbState.widgets) ? dbState.widgets : defaultState.widgets;
      dbState.themes = Array.isArray(dbState.themes) ? dbState.themes : defaultState.themes;
      dbState.adSlots = Array.isArray(dbState.adSlots) ? dbState.adSlots : defaultState.adSlots;
      dbState.media = Array.isArray(dbState.media) ? dbState.media : defaultState.media;
      dbState.logs = Array.isArray(dbState.logs) ? dbState.logs : defaultState.logs;
      dbState.subscribers = Array.isArray(dbState.subscribers) ? dbState.subscribers : defaultState.subscribers;
      dbState.chatMessages = Array.isArray(dbState.chatMessages) ? dbState.chatMessages : defaultState.chatMessages;
      dbState.donations = Array.isArray(dbState.donations) ? dbState.donations : defaultState.donations;
      dbState.payments = Array.isArray(dbState.payments) ? dbState.payments : defaultState.payments;
      dbState.campaigns = Array.isArray(dbState.campaigns) ? dbState.campaigns : defaultState.campaigns;
      dbState.readingLists = Array.isArray(dbState.readingLists) ? dbState.readingLists : defaultState.readingLists;
      dbState.notifications = Array.isArray(dbState.notifications) ? dbState.notifications : defaultState.notifications;
      dbState.followers = Array.isArray(dbState.followers) ? dbState.followers : defaultState.followers;
      dbState.likes = Array.isArray(dbState.likes) ? dbState.likes : defaultState.likes;

      if (dbState.analytics) {
        dbState.analytics = {
          ...defaultState.analytics,
          ...dbState.analytics,
          sessions: Array.isArray(dbState.analytics.sessions) ? dbState.analytics.sessions : [],
          postViews: Array.isArray(dbState.analytics.postViews) ? dbState.analytics.postViews : []
        };
      }
    } else {
      dbState = getInitialState();
      saveDatabaseSync();
    }
  } catch (err) {
    console.error('Error initializing database file, using safe in-memory store:', err);
    dbState = getInitialState();
  }
  return dbState;
}

/**
 * Synchronous atomic file write with multi-tier backup rotation
 */
function saveDatabaseSync(): void {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    const jsonStr = JSON.stringify(dbState, null, 2);
    const tempFile = path.join(DB_DIR, `db.tmp.${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2)}.json`);
    
    fs.writeFileSync(tempFile, jsonStr, 'utf-8');
    
    // Backup rotation: db.backup.json -> db.backup.1.json, db.json -> db.backup.json
    if (fs.existsSync(DB_FILE)) {
      try {
        if (fs.existsSync(DB_BACKUP_FILE)) {
          fs.copyFileSync(DB_BACKUP_FILE, DB_BACKUP_FILE_OLD);
        }
        fs.copyFileSync(DB_FILE, DB_BACKUP_FILE);
      } catch (backupErr) {
        console.warn('[DB] Backup rotation warning:', backupErr);
      }
    }

    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Error saving database to file atomically:', err);
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(dbState, null, 2), 'utf-8');
    } catch (fallbackErr) {
      console.error('Fatal: Failed to write database file fallback:', fallbackErr);
    }
  }
}

/**
 * Thread-safe / asynchronous-safe write queue
 */
export function saveDatabase(): void {
  if (isWriting) {
    pendingSave = true;
    return;
  }
  isWriting = true;
  try {
    saveDatabaseSync();
  } finally {
    isWriting = false;
    if (pendingSave) {
      pendingSave = false;
      saveDatabase();
    }
  }
}

export function getDb(): DatabaseSchema {
  if (!dbState) {
    return initDatabase();
  }
  return dbState;
}

export function logActivity(userId: string, userName: string, action: string, actionBn: string, details: string, ip?: string) {
  const db = getDb();
  const newLog = {
    id: 'log_' + Date.now(),
    userId,
    userName,
    action,
    actionBn,
    details,
    timestamp: new Date().toISOString(),
    ipAddress: ip || '127.0.0.1'
  };
  db.logs.unshift(newLog);
  if (db.logs.length > 200) db.logs = db.logs.slice(0, 200);
  saveDatabase();
  return newLog;
}
