/**
 * Matrix Commonplace Bot
 * 
 * Listens to a Matrix room and posts messages to commonplace books
 * via the Supabase Edge Function.
 * 
 * Features:
 * - Posts without @mention go to Custodian's book
 * - Posts with @Surname go to that faculty's book with AI analysis
 */

import sdk from 'matrix-js-sdk';
import dotenv from 'dotenv';

dotenv.config();

// Configuration
const MATRIX_HOMESERVER = process.env.MATRIX_HOMESERVER || 'https://matrix.inquiry.institute';
const MATRIX_USER_ID = process.env.MATRIX_USER_ID;
const MATRIX_ACCESS_TOKEN = process.env.MATRIX_ACCESS_TOKEN;
const MATRIX_ROOM_ID = process.env.MATRIX_ROOM_ID;

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://pilmscrodlitdrygabvo.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpbG1zY3JvZGxpdGRyeWdhYnZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNTAyMTAsImV4cCI6MjA3NzkyNjIxMH0.BZxQiztlwtKjhL1Jjjqd0CnvfIbuwYHV0YL2s50cQiA';

// Validate required config
if (!MATRIX_USER_ID || !MATRIX_ACCESS_TOKEN || !MATRIX_ROOM_ID) {
  console.error('❌ Missing required environment variables:');
  console.error('   MATRIX_USER_ID, MATRIX_ACCESS_TOKEN, MATRIX_ROOM_ID');
  console.error('   Please create a .env file with these values.');
  console.error('');
  console.error('   Example .env:');
  console.error('   MATRIX_HOMESERVER=https://matrix.inquiry.institute');
  console.error('   MATRIX_USER_ID=@bot:inquiry.institute');
  console.error('   MATRIX_ACCESS_TOKEN=syt_...');
  console.error('   MATRIX_ROOM_ID=!roomid:inquiry.institute');
  process.exit(1);
}

console.log('🤖 Matrix Commonplace Bot starting...');
console.log(`   Homeserver: ${MATRIX_HOMESERVER}`);
console.log(`   User: ${MATRIX_USER_ID}`);
console.log(`   Room: ${MATRIX_ROOM_ID}`);

// Create Matrix client
const client = sdk.createClient({
  baseUrl: MATRIX_HOMESERVER,
  accessToken: MATRIX_ACCESS_TOKEN,
  userId: MATRIX_USER_ID,
});

// Track when the bot started to ignore old messages
const startTime = Date.now();

/**
 * Post a message to the Commonplace Edge Function
 */
async function postToCommonplace(message, sender, roomId) {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/matrix-commonplace`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        message,
        sender,
        room: roomId,
      }),
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log(`✅ Posted to ${data.author}'s commonplace: "${data.work?.title?.substring(0, 50)}..."`);
      return { success: true, data };
    } else {
      console.error('❌ Failed to post to Commonplace:', data);
      return { success: false, error: data };
    }
  } catch (error) {
    console.error('❌ Error posting to Commonplace:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Handle incoming room messages
 */
function handleRoomMessage(event, room) {
  // Only process messages from the target room
  if (room.roomId !== MATRIX_ROOM_ID) return;
  
  // Only process text messages
  if (event.getType() !== 'm.room.message') return;
  
  const content = event.getContent();
  if (content.msgtype !== 'm.text') return;
  
  // Ignore messages from before the bot started
  const eventTime = event.getTs();
  if (eventTime < startTime) {
    return;
  }
  
  // Ignore messages from the bot itself
  const sender = event.getSender();
  if (sender === MATRIX_USER_ID) return;
  
  const messageBody = content.body;
  
  // Check for @mentions
  const hasMention = /@[A-Z][a-zA-Z]+/.test(messageBody);
  const targetInfo = hasMention ? `(with faculty mention)` : `(to Custodian)`;
  
  console.log(`📨 Message from ${sender} ${targetInfo}: ${messageBody.substring(0, 50)}...`);
  
  // Post to Commonplace
  postToCommonplace(messageBody, sender, room.roomId).then(result => {
    if (result.success) {
      // Optionally send a reaction or confirmation
      // client.sendEvent(room.roomId, 'm.reaction', { ... });
    }
  });
}

// Set up event listeners
client.on('Room.timeline', handleRoomMessage);

client.on('sync', (state, prevState, data) => {
  if (state === 'PREPARED') {
    console.log('');
    console.log('✅ Bot is ready and listening for messages!');
    console.log(`   Monitoring room: ${MATRIX_ROOM_ID}`);
    console.log('');
    console.log('📝 Usage:');
    console.log('   • Post any message → Added to Custodian\'s commonplace');
    console.log('   • Post with @Surname → Added to that faculty\'s book with AI analysis');
    console.log('   • Example: "@Plato What is justice?" → Plato analyzes it');
    console.log('');
  }
});

// Start the client
console.log('🔄 Connecting to Matrix...');
client.startClient({ initialSyncLimit: 0 });

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down...');
  client.stopClient();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down...');
  client.stopClient();
  process.exit(0);
});
