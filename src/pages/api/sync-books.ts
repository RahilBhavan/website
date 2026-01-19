/**
 * API endpoint for manually triggering book sync
 * Supports webhook authentication
 * Note: This triggers the sync script via subprocess
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

export const POST: APIRoute = async ({ request }) => {
  // Check for webhook secret if configured
  const webhookSecret = import.meta.env.WEBHOOK_SECRET;
  const authHeader = request.headers.get('authorization');

  if (webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    console.log('Manual sync triggered via API');
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
    console.error('API sync error:', error);
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

// Also support GET for easy manual triggers
export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  const webhookSecret = import.meta.env.WEBHOOK_SECRET;

  if (webhookSecret && token !== webhookSecret) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized. Provide ?token=YOUR_SECRET' }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    console.log('Manual sync triggered via GET');
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
    console.error('API sync error:', error);
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
