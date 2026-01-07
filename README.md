# ThreatWatch SOC - Network Threat Intelligence Platform

A real-time network security monitoring and threat intelligence platform that captures, analyzes, and visualizes network traffic to detect potential security threats.

## Features

- Real-time network packet capture and analysis
- Intelligent threat detection (port scans, brute force attacks, malware traffic)
- Interactive global threat map
- Live packet feed with threat classification
- Comprehensive threat intelligence database
- PDF export of threat reports
- Automated geolocation of threat sources

## Architecture

The system consists of two main components:

1. **Web Dashboard** (React + Vite + Supabase)
   - Real-time visualization of network threats
   - Statistics and analytics panels
   - Threat intelligence feed
   - PDF report generation

2. **Capture Agent** (Node.js)
   - Local packet capture from network interfaces
   - Real-time threat analysis
   - Automatic data submission to Supabase

## Quick Start

### 1. Setup the Web Dashboard

```bash
npm install
```

Make sure your `.env` file contains:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Start the dashboard:
```bash
npm run dev
```

### 2. Setup the Capture Agent

Navigate to the capture agent directory:
```bash
cd capture-agent
```

Install dependencies:
```bash
npm install
```

#### Linux/macOS

Install libpcap:
```bash
sudo apt-get install libpcap-dev
```

Start the agent:
```bash
sudo ./start.sh
```

#### Windows

Install [Npcap](https://npcap.com/#download), then run as Administrator:
```bash
start.bat
```

See [capture-agent/README.md](capture-agent/README.md) for detailed setup instructions.

## How It Works

1. The **Capture Agent** runs on your machine with elevated privileges
2. It captures network packets in real-time from your network interface
3. Each packet is analyzed for potential threats using multiple detection algorithms
4. Malicious traffic is identified and classified by threat type
5. Data is sent to your Supabase database
6. The **Web Dashboard** displays everything in real-time with visualizations

## Threat Detection

The system automatically detects:

- **Port Scanning**: Multiple ports accessed from a single IP
- **Brute Force Attacks**: Repeated authentication attempts
- **Malware Traffic**: Known malicious ports and protocols
- **ICMP Floods**: Large or unusual ICMP packets
- **High-Frequency Traffic**: Abnormal traffic patterns
- **Suspicious Connections**: Unusual protocols or ports

## Security & Privacy

- Only packet headers are captured, not content
- Private IP ranges are filtered
- All data stays in your Supabase instance
- No third-party analytics or tracking
- Secure communication between agent and database

## Database Schema

The system uses three main tables:

- `packets`: Individual network packets with metadata
- `threats`: Aggregated threat intelligence by IP
- `analytics`: Historical statistics and trends

## Tech Stack

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- Vite
- Supabase Client
- Lucide Icons

### Capture Agent
- Node.js
- Cap (libpcap bindings)
- Supabase Client
- IP Geolocation API

### Backend
- Supabase (PostgreSQL)
- Real-time subscriptions
- Row Level Security

## Development

```bash
npm run dev
```

Type checking:
```bash
npm run typecheck
```

Build for production:
```bash
npm run build
```

## Requirements

- Node.js 18+
- Administrator/root privileges (for packet capture)
- Active network interface
- Supabase account

## Troubleshooting

### Dashboard shows "WAITING FOR AGENT"
- Make sure the capture agent is running
- Check that the agent has proper permissions
- Verify database connection in .env file

### No packets captured
- Verify network interface name
- Check if interface has active traffic
- Try running with elevated privileges

### Permission errors
- Linux/macOS: Use `sudo`
- Windows: Run as Administrator

## Performance

- Capture Agent: 1-5% CPU, ~50-100MB RAM
- Dashboard: Minimal resource usage
- Database: Efficient indexing and querying

## License

MIT

## Support

For detailed capture agent documentation, see [capture-agent/README.md](capture-agent/README.md)
