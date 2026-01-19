/**
 * Vercel Cron endpoint for scheduled book syncing
 * Runs every 6 hours
 */

import type { APIRoute } from 'astro';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const prerender = false;

async function triggerSync(): Promise<{ success: boolean; output: string; error?: string }> {
  try {
    const { stdout, stderr } = await execAsync('npm run sync:books');
    return {
      success: true,
      output: stdout,
      error: stderr || undefined,
    };
  } catch (error: any) {
    return {
      success: false,
      output: error.stdout || '',
      error: error.message,
    };
  }
}

export const GET: APIRoute = async ({ request }) => {
  // Verify this is a Vercel Cron request
  const authHeader = request.headers.get('authorization');
  const cronSecret = import.meta.env.VERCEL_CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const result = await triggerSync();

    return new Response(
      JSON.stringify({
        success: result.success,
        message: 'Sync triggered',
        output: result.output,
        timestamp: new Date().toISOString(),
      }),
      {
        status: result.success ? 200 : 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: any) {
    console.error('Cron sync error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};
