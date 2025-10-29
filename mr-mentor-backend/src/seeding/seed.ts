import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();

import { DataSource } from 'typeorm';
import fs from 'fs';
import path from 'path';
import { User } from '../entities/User';
import { Mentor } from '../entities/Mentor';
import { Token } from '../entities/Tokens';
import { UserRole } from '../types/UserTypes';
import { DatabaseService } from '../config/database';

// Helper to load JSON seed files placed alongside this file
const loadSeedJson = (filename: string) => {
  const p = path.resolve(__dirname, filename);
  if (!fs.existsSync(p)) return null;
  try {
    const raw = fs.readFileSync(p, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read seed json', filename, err);
    return null;
  }
};

export const seed = async (dataSource: DataSource) => {
  const userRepository = dataSource.getRepository(User);
  const mentorRepository = dataSource.getRepository(Mentor);
  const tokenRepository = dataSource.getRepository(Token);
  
  // Clear existing data (optional)
  // Truncate in order to avoid FK constraint issues
  await userRepository.query('TRUNCATE TABLE tokens CASCADE');
  await userRepository.query('TRUNCATE TABLE mentors CASCADE');
  await userRepository.query('TRUNCATE TABLE users CASCADE');
  
  // Try to load provided seed JSON files
  const mentorJson = loadSeedJson('mentorData.json');
  const studentJson = loadSeedJson('studentData.json');

  const mentorsRaw: any[] = mentorJson && Array.isArray(mentorJson.users) ? mentorJson.users : [];
  const studentsRaw: any[] = studentJson && Array.isArray(studentJson.users) ? studentJson.users : [];

  // Merge and create users list (dedupe by email)
  const usersToCreate: User[] = [];
  const emailToRawMap: Map<string, { raw: any; type: 'mentor' | 'student' }> = new Map();

  const safeEmail = (e: any, fallbackIndex: number) => {
    if (!e || typeof e !== 'string' || e.trim() === '') return `user${fallbackIndex}@seed.local`;
    return e.toLowerCase();
  };

  let idx = 0;
  for (const m of mentorsRaw) {
    idx++;
    const email = safeEmail(m.email, idx);
    if (emailToRawMap.has(email)) continue;
    emailToRawMap.set(email, { raw: m, type: 'mentor' });
  }
  for (const s of studentsRaw) {
    idx++;
    const email = safeEmail(s.email, idx);
    if (emailToRawMap.has(email)) continue;
    emailToRawMap.set(email, { raw: s, type: 'student' });
  }

  for (const [email, info] of emailToRawMap.entries()) {
    const raw = info.raw;
    const user = new User();
    user.fullName = raw.name || raw.fullName || '';
    user.email = email;
    user.role = info.type === 'mentor' ? UserRole.EXPERT : UserRole.USER;
    user.isVerified = true;
    user.phone=raw.phoneNumber || raw.phone || '';
    user.isProfileComplete = true;
    // prefer profileImage or profilePhoto
    user.profilePhoto = raw.profileImage || raw.profilePhoto || raw.profilePhotoUrl || '';
    usersToCreate.push(user);
  }

  // Save users
  const savedUsers = await userRepository.save(usersToCreate);

  // Create mentors from mentorRaw entries by matching email
  const mentorsToSave: Mentor[] = [];
  for (const m of mentorsRaw) {
    const email = safeEmail(m.email, 0);
    const user = savedUsers.find(u => u.email === email);
    if (!user) continue;
    const mentor = new Mentor();
    mentor.company = m.company || m.companyName || '';
    // designation or role or use "Mentor"
    mentor.role = m.designation || m.role || 'Mentor';
    mentor.institute = m.college || m.institute || '';
    mentor.slotsLeft = typeof m.slotsLeft === 'number' ? m.slotsLeft : (m.totalMeets ? Math.max(1, m.totalMeets) : 10);
    mentor.description = m.resumeUrl || m.description || m.designation || '';
    // Try to infer category/subCategory from expertise array
    if (Array.isArray(m.expertise) && m.expertise.length > 0) {
      mentor.category = m.expertise[0] || 'General';
      mentor.subCategory = m.expertise[1] || mentor.role || 'General';
    } else {
      mentor.category = m.branch || 'General';
      mentor.subCategory = mentor.role || 'General';
    }
    mentor.image = m.profileImage || m.profilePhoto || '';
    mentor.user = user;
    mentorsToSave.push(mentor);
  }

  await mentorRepository.save(mentorsToSave);

  // Create tokens for student meetTokens
  const tokensToSave: Token[] = [];
  for (const s of studentsRaw) {
    const email = safeEmail(s.email, 0);
    const user = savedUsers.find(u => u.email === email);
    if (!user) continue;
    if (!Array.isArray(s.meetTokens)) continue;
    for (const mt of s.meetTokens) {
      // Create one Token row per meetTokens entry. If the entry marks unused token, token=1, else 0
      const tokenEnt = new Token();
      tokenEnt.user = user;
      tokenEnt.userId = user.id;
      tokenEnt.token = mt.isUsed ? 0 : 1;
      // parse expiration if present (format YYYY-MM-DD)
      try {
        if (mt.expires) {
          const d = new Date(mt.expires);
          if (!isNaN(d.getTime())) tokenEnt.expiresAt = d;
        }
      } catch (e) {
        // ignore
      }
      tokensToSave.push(tokenEnt);
    }
  }

  if (tokensToSave.length > 0) await tokenRepository.save(tokensToSave);

  console.log(`Seeded ${mentorsToSave.length} mentors, ${savedUsers.length} users and ${tokensToSave.length} tokens successfully!`);
};

async function main() {
  const dbService = DatabaseService.getInstance();
  await dbService.initialize();
  await seed(dbService.dataSource);
  await dbService.close();
}

main().catch(console.error);