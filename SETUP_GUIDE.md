# ThreatWatch SOC Setup Guide

This guide will walk you through setting up ThreatWatch SOC to capture and analyze your real network traffic.

## Prerequisites

Before you begin, make sure you have:

- Node.js 18 or higher installed
- A Supabase account with a project set up
- Administrator/root access on your machine
- An active network connection

## Step 1: Database Setup

Your Supabase database should already have the necessary tables created from migrations. If not, the migrations are in `supabase/migrations/`.

Verify your database has these tables:
- `packets`
- `threats`
- `analytics`

## Step 2: Configure Environment Variables

Create or verify your `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project settings under "API".

## Step 3: Install Dashboard Dependencies

In the project root directory:

```bash
npm install
```

## Step 4: Install Capture Agent Dependencies

Navigate to the capture agent directory:

```bash
cd capture-agent
npm install
```

### Platform-Specific Requirements

#### Linux (Ubuntu/Debian)

Install libpcap development headers:

```bash
sudo apt-get update
sudo apt-get install libpcap-dev
```

For Red Hat/CentOS/Fedora:

```bash
sudo yum install libpcap-devel
```

#### macOS

Install via Homebrew:

```bash
brew install libpcap
```

If you don't have Homebrew, install it from [brew.sh](https://brew.sh)

#### Windows

1. Download and install [Npcap](https://npcap.com/#download)
2. During installation, make sure to check "Install Npcap in WinPcap API-compatible Mode"
3. Restart your computer after installation

## Step 5: Start the Web Dashboard

From the project root:

```bash
npm run dev
```

The dashboard will open at `http://localhost:5173`

You should see "WAITING FOR AGENT" in the header - this is normal.

## Step 6: Start the Capture Agent

The capture agent needs elevated privileges to capture network packets.

### Linux/macOS

From the `capture-agent` directory:

```bash
sudo ./start.sh
```

Or manually:

```bash
sudo node index.js
```

### Windows

1. Open Command Prompt as Administrator
2. Navigate to the `capture-agent` directory
3. Run:

```bash
start.bat
```

Or manually:

```bash
node index.js
```

## Step 7: Verify Everything Works

After starting the capture agent, you should see:

1. Console output showing packet capture has started
2. The dashboard indicator changes from "WAITING FOR AGENT" to "CAPTURE AGENT ACTIVE"
3. Packets start appearing in the dashboard
4. Threats are detected and displayed on the map

## Troubleshooting

### "Permission Denied" Error

**Linux/macOS:**
- Make sure you're using `sudo`
- Verify you have read permissions on `/dev/bpf*` (macOS)

**Windows:**
- Run Command Prompt as Administrator
- Verify Npcap is installed correctly

### "Cannot Find Device" Error

The agent tries to auto-detect your network interface. To specify manually:

1. Find your interface name:

**Linux:**
```bash
ip addr
```

**macOS:**
```bash
ifconfig
```

**Windows:**
```bash
ipconfig
```

2. Set it in the `.env` file:

```env
NETWORK_INTERFACE=eth0
```

Common interface names:
- Linux: `eth0`, `wlan0`, `enp0s3`
- macOS: `en0`, `en1`
- Windows: `\Device\NPF_{GUID}`

### No Packets Showing Up

- Verify the capture agent is running without errors
- Check that your network interface is active and has traffic
- Generate some traffic by browsing the web
- Check Supabase database connection

### "Module Not Found" Errors

Run `npm install` in both directories:

```bash
npm install
cd capture-agent && npm install
```

### Dashboard Shows Old/Simulated Data

The dashboard now only shows real captured packets. If you see old simulated data:

1. Stop the capture agent
2. Clear the database tables (optional)
3. Restart the capture agent

To clear database:

```sql
DELETE FROM packets;
DELETE FROM threats;
DELETE FROM analytics;
```

## Understanding the Output

### Capture Agent Console

The agent shows:
- Total packets captured
- Threats detected (shown in red with 🚨)
- Status updates every 100 packets

### Web Dashboard

- **Threat Map**: Visual representation of global threats
- **Stats Panel**: Real-time metrics and threat rate
- **Packet Feed**: Live stream of captured packets
- **Threat Feed**: Database of malicious IPs
- **Top Threats**: Most active threat sources and types

## Performance Tips

1. **Filter Traffic**: Set `CAPTURE_FILTER` in `.env` to reduce load
   ```env
   CAPTURE_FILTER=tcp port 80 or tcp port 443
   ```

2. **Monitor Resource Usage**: The agent uses 1-5% CPU and ~50-100MB RAM

3. **Database Cleanup**: Regularly clean old packets:
   ```sql
   DELETE FROM packets WHERE captured_at < NOW() - INTERVAL '7 days';
   ```

## Security Considerations

- The agent only captures packet headers, not content
- Private IP addresses are filtered from geolocation lookups
- All data stays in your Supabase instance
- Use Row Level Security policies in Supabase for production

## Next Steps

1. Monitor your network for a few hours to build up data
2. Export PDF reports using the "Export PDF" button
3. Analyze threat patterns in the dashboard
4. Set up alerts for critical threats (custom implementation)

## Getting Help

If you encounter issues:

1. Check the console output for error messages
2. Verify all dependencies are installed
3. Ensure proper permissions for packet capture
4. Review the main README.md and capture-agent/README.md

## Production Deployment

For production use:

1. Deploy the web dashboard to a hosting service (Vercel, Netlify, etc.)
2. Run the capture agent on your server/network gateway
3. Configure firewall rules appropriately
4. Set up monitoring and alerting
5. Implement proper authentication for the dashboard
6. Use Supabase RLS policies for data access control

Enjoy monitoring your network with ThreatWatch SOC!
