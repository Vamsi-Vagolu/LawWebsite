// Make sure you have this file:
// filepath: c:\Users\vamsi\law-firm-site\src\app\api\maintenance-check\route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CACHE_FILE = path.join(process.cwd(), '.maintenance-cache.json');

function getMaintenanceFromFile() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const data = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
      // Check if cache is still valid (5 minutes)
      if (Date.now() - data.timestamp < 300000) {
        return data.maintenance;
      }
    }
  } catch (error) {
    console.error('Error reading maintenance cache:', error);
  }
  return null;
}

export async function GET() {
  try {
    // ✅ Check file cache first (lightweight for middleware)
    const cachedMaintenance = getMaintenanceFromFile();
    if (cachedMaintenance) {
      return NextResponse.json({ 
        isEnabled: cachedMaintenance.isEnabled || false 
      });
    }

    // ✅ If no cache, call main API to generate it
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/maintenance`);
    
    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({ 
        isEnabled: data.isEnabled || false 
      });
    }

    return NextResponse.json({ isEnabled: false });
  } catch (error) {
    console.error('Error checking maintenance:', error);
    return NextResponse.json({ isEnabled: false });
  }
}