# Matrix Commonplace Bot

A Matrix bot that posts messages from a room to Commonplace books via the Supabase Edge Function.

## Features

- **Plain messages** → Added to Custodian's commonplace book
- **@Surname mentions** → Added to that faculty's book with AI analysis from their perspective
- **URLs** → Summarized and analyzed
- **@Surname + URL** → Faculty analyzes the linked content

## Examples

| Message | Result |
|---------|--------|
| `The pursuit of knowledge requires humility` | Custodian's book |
| `@Plato What is justice?` | Plato analyzes it |
| `https://example.com/article` | Custodian summarizes |
| `@Darwin https://nature.com/evolution` | Darwin analyzes |

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create `.env` file:**
   ```env
   MATRIX_HOMESERVER=https://matrix.inquiry.institute
   MATRIX_USER_ID=@commonplace-bot:inquiry.institute
   MATRIX_ACCESS_TOKEN=syt_your_access_token_here
   MATRIX_ROOM_ID=!your_room_id:inquiry.institute
   ```

3. **Get your access token:**
   - Log into Element with the bot account
   - Go to Settings → Help & About → Advanced → Access Token
   - Or use the Matrix SDK to login programmatically

4. **Get the room ID:**
   - In Element: Room Settings → Advanced → Internal room ID

5. **Run the bot:**
   ```bash
   npm start
   ```

## Available Faculty

The bot recognizes these faculty surnames (case-sensitive, first letter capitalized):

- `@Plato`
- `@Darwin`
- `@Turing`
- `@Dewey`
- `@Keynes`
- `@Sartre`
- `@Steiner`
- `@Shelley`
- `@Aquinas`
- `@Carson`
- `@Chizhevsky`
- `@Picasso`
- `@Watt`
- And more...

## Running as a Service

For production, use PM2 or systemd:

```bash
# With PM2
npm install -g pm2
pm2 start bot.js --name matrix-commonplace
pm2 save
pm2 startup

# Or with systemd
sudo nano /etc/systemd/system/matrix-commonplace.service
```

Example systemd service:
```ini
[Unit]
Description=Matrix Commonplace Bot
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/bots/matrix-commonplace
ExecStart=/usr/bin/node bot.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```
