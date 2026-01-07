# Quick Start - ThreatWatch SOC

Get up and running in 5 minutes!

## 1. Install Dashboard Dependencies

```bash
npm install
```

## 2. Configure Environment

Make sure `.env` exists with:
```env
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
```

## 3. Install Capture Agent

```bash
cd capture-agent
npm install
```

### Install System Dependencies

**Linux:**
```bash
sudo apt-get install libpcap-dev
```

**macOS:**
```bash
brew install libpcap
```

**Windows:**
- Download and install [Npcap](https://npcap.com/#download)

## 4. Start Dashboard

From project root:
```bash
npm run dev
```

Dashboard opens at: http://localhost:5173

## 5. Start Capture Agent

**Linux/macOS:**
```bash
cd capture-agent
sudo ./start.sh
```

**Windows (as Administrator):**
```bash
cd capture-agent
start.bat
```

## Done!

You should now see:
- "CAPTURE AGENT ACTIVE" in the dashboard
- Real packets flowing in
- Threats being detected and mapped

## Common Issues

**Permission Denied:**
- Use `sudo` on Linux/macOS
- Run as Administrator on Windows

**Cannot Find Device:**
- Set `NETWORK_INTERFACE` in `.env`
- Check `ifconfig` or `ipconfig` for interface name

**No Packets:**
- Generate traffic by browsing the web
- Verify interface is active
- Check capture agent console for errors

For detailed setup, see [SETUP_GUIDE.md](SETUP_GUIDE.md)
