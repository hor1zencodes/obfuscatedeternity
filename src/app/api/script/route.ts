import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // This looks for yearnerzen.lua in the ROOT of your project folder
    const filePath = path.join(process.cwd(), 'yearnerzen.lua');
    const content = fs.readFileSync(filePath, 'utf8');
    
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error) {
    return new NextResponse('-- Script not found or error reading file.', { status: 404 });
  }
}
