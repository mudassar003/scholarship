// src/app/api/cron/reminders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { processFollowupReminders } from '@/services/notificationService';

export const dynamic = 'force-dynamic'; // Important for cron routes

export async function GET(request: NextRequest) {
  // Verify the request is legitimate
  // Vercel automatically adds authorization headers to cron job requests
  const authHeader = request.headers.get('authorization');
  
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.error('Unauthorized cron job access attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    console.log('Running professor followup reminders cron job...');
    
    // Process reminders
    const result = await processFollowupReminders();
    
    console.log('Reminder processing complete:', result);
    
    // Return the response with timestamp and the result data
    return NextResponse.json({ 
      timestamp: new Date().toISOString(),
      ...result 
    });
  } catch (error) {
    console.error('Error processing reminders:', error);
    
    return NextResponse.json({ 
      success: false, 
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'An error occurred while processing reminders'
    }, { status: 500 });
  }
}