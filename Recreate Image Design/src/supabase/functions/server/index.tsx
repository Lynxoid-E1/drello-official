import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "jsr:@supabase/supabase-js@2";

const app = new Hono();

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Storage bucket name
const BUCKET_NAME = 'make-b09af621-media';

// Initialize storage bucket
async function initStorage() {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);
    
    if (!bucketExists) {
      await supabase.storage.createBucket(BUCKET_NAME, { public: false });
      console.log(`Created bucket: ${BUCKET_NAME}`);
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
}

// Initialize storage on startup
initStorage();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Helper to generate unique URL slugs
function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const random = Math.random().toString(36).substring(2, 8);
  return `${base}-${random}`;
}

// Health check endpoint
app.get("/make-server-b09af621/health", (c) => {
  return c.json({ status: "ok" });
});

// Get all contests
app.get("/make-server-b09af621/contests", async (c) => {
  try {
    const contests = await kv.getByPrefix('contest:');
    
    // Sort by created date (newest first)
    const sorted = contests.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return c.json({ contests: sorted });
  } catch (error) {
    console.error('Error fetching contests:', error);
    return c.json({ error: 'Failed to fetch contests' }, 500);
  }
});

// Get single contest by ID or slug
app.get("/make-server-b09af621/contests/:id", async (c) => {
  try {
    const id = c.req.param('id');
    
    // Try to get by ID first
    let contest = await kv.get(`contest:${id}`);
    
    // If not found, search by slug
    if (!contest) {
      const allContests = await kv.getByPrefix('contest:');
      contest = allContests.find((c: any) => c.urlSlug === id);
    }
    
    if (!contest) {
      return c.json({ error: 'Contest not found' }, 404);
    }
    
    // Get contestants
    const contestants = await kv.get(`contestants:${contest.id}`) || [];
    
    return c.json({ contest, contestants });
  } catch (error) {
    console.error('Error fetching contest:', error);
    return c.json({ error: 'Failed to fetch contest' }, 500);
  }
});

// Create contest
app.post("/make-server-b09af621/contests", async (c) => {
  try {
    const body = await c.req.json();
    const { title, description, isPaid, votePrice, paymentLink, customization } = body;
    
    const id = crypto.randomUUID();
    const urlSlug = generateSlug(title);
    
    const contest = {
      id,
      title,
      description,
      urlSlug,
      status: 'active',
      isPaid: isPaid || false,
      votePrice: votePrice || 0,
      paymentLink: paymentLink || '',
      customization: customization || {},
      totalVotes: 0,
      createdAt: new Date().toISOString(),
    };
    
    await kv.set(`contest:${id}`, contest);
    
    return c.json({ contest });
  } catch (error) {
    console.error('Error creating contest:', error);
    return c.json({ error: 'Failed to create contest' }, 500);
  }
});

// Add contestant to contest
app.post("/make-server-b09af621/contests/:id/contestants", async (c) => {
  try {
    const contestId = c.req.param('id');
    const body = await c.req.json();
    const { name, description, mediaUrls } = body;
    
    const contest = await kv.get(`contest:${contestId}`);
    if (!contest) {
      return c.json({ error: 'Contest not found' }, 404);
    }
    
    const contestants = await kv.get(`contestants:${contestId}`) || [];
    
    const contestant = {
      id: crypto.randomUUID(),
      name,
      description: description || '',
      mediaUrls: mediaUrls || [],
      votes: 0,
      createdAt: new Date().toISOString(),
    };
    
    contestants.push(contestant);
    await kv.set(`contestants:${contestId}`, contestants);
    
    return c.json({ contestant });
  } catch (error) {
    console.error('Error adding contestant:', error);
    return c.json({ error: 'Failed to add contestant' }, 500);
  }
});

// Delete contest
app.delete("/make-server-b09af621/contests/:id", async (c) => {
  try {
    const id = c.req.param('id');
    
    // Delete contest
    await kv.del(`contest:${id}`);
    
    // Delete contestants
    await kv.del(`contestants:${id}`);
    
    // Delete votes
    await kv.del(`votes:${id}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting contest:', error);
    return c.json({ error: 'Failed to delete contest' }, 500);
  }
});

// Vote for contestant
app.post("/make-server-b09af621/contests/:contestId/vote", async (c) => {
  try {
    const contestId = c.req.param('contestId');
    const body = await c.req.json();
    const { contestantId } = body;
    
    // Get contest
    const contest = await kv.get(`contest:${contestId}`);
    if (!contest) {
      return c.json({ error: 'Contest not found' }, 404);
    }
    
    // Get contestants
    const contestants = await kv.get(`contestants:${contestId}`) || [];
    const contestantIndex = contestants.findIndex((c: any) => c.id === contestantId);
    
    if (contestantIndex === -1) {
      return c.json({ error: 'Contestant not found' }, 404);
    }
    
    // Increment vote
    contestants[contestantIndex].votes = (contestants[contestantIndex].votes || 0) + 1;
    await kv.set(`contestants:${contestId}`, contestants);
    
    // Update contest total votes
    contest.totalVotes = (contest.totalVotes || 0) + 1;
    await kv.set(`contest:${contestId}`, contest);
    
    // Record vote
    const votes = await kv.get(`votes:${contestId}`) || [];
    votes.push({
      contestantId,
      timestamp: new Date().toISOString(),
    });
    await kv.set(`votes:${contestId}`, votes);
    
    return c.json({ success: true, votes: contestants[contestantIndex].votes });
  } catch (error) {
    console.error('Error voting:', error);
    return c.json({ error: 'Failed to record vote' }, 500);
  }
});

// Export contests to CSV
app.get("/make-server-b09af621/export-csv", async (c) => {
  try {
    const contests = await kv.getByPrefix('contest:');
    
    // Create CSV header
    let csv = 'Title,Description,Status,Total Votes,Paid,Vote Price,Created At,URL\n';
    
    // Add contest rows
    for (const contest of contests) {
      const row = [
        contest.title,
        contest.description || '',
        contest.status,
        contest.totalVotes,
        contest.isPaid ? 'Yes' : 'No',
        contest.isPaid ? contest.votePrice : 0,
        new Date(contest.createdAt).toLocaleString(),
        `${c.req.url.split('/')[2]}/vote/${contest.urlSlug}`,
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
      
      csv += row + '\n';
    }
    
    return c.json({ csv });
  } catch (error) {
    console.error('Error exporting CSV:', error);
    return c.json({ error: 'Failed to export CSV' }, 500);
  }
});

// Upload file
app.post("/make-server-b09af621/upload", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }
    
    // Generate unique filename
    const ext = file.name.split('.').pop();
    const filename = `${crypto.randomUUID()}.${ext}`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filename, file, {
        contentType: file.type,
      });
    
    if (error) {
      console.error('Upload error:', error);
      return c.json({ error: 'Upload failed' }, 500);
    }
    
    // Get signed URL (valid for 1 year)
    const { data: signedUrl } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filename, 31536000);
    
    return c.json({ url: signedUrl?.signedUrl || '' });
  } catch (error) {
    console.error('Error uploading file:', error);
    return c.json({ error: 'Failed to upload file' }, 500);
  }
});

Deno.serve(app.fetch);