// src/app/api/test-reminders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { processFollowupReminders } from '@/services/notificationService';

export const dynamic = 'force-dynamic';

// This endpoint allows you to manually trigger the reminders process
// Useful for testing without waiting for the cron job to run

export async function GET(request: NextRequest) {
  // Require authorization for security
  const authHeader = request.headers.get('authorization');
  
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ 
      error: 'Unauthorized. Please provide valid authorization header.',
      hint: 'Use: Authorization: Bearer YOUR_CRON_SECRET' 
    }, { status: 401 });
  }
  
  try {
    console.log('Manually triggering followup reminders...');
    
    // Process reminders
    const result = await processFollowupReminders();
    
    console.log('Manual reminder processing complete:', result);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Reminders processed successfully',
      timestamp: new Date().toISOString(),
      ...result 
    });
  } catch (error) {
    console.error('Error processing manual reminders:', error);
    
    return NextResponse.json({ 
      success: false, 
      timestamp: new Date().toISOString(),
      error: error.message || 'An error occurred while processing reminders'
    }, { status: 500 });
  }
}