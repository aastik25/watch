# ThreatWatch Network Capture Agent

This agent captures real network traffic from your machine and sends it to ThreatWatch SOC for analysis and visualization.

## Features

- Real-time packet capture from network interfaces
- Intelligent threat detection (port scans, brute force, malware traffic)
- Automatic geolocation of threat sources
- Integration with ThreatWatch dashboard
- Low overhead and efficient processing

## Prerequisites

### System Requirements
- Node.js 18 or higher
- Administrator/root privileges (required for packet capture)
- Active network interface

### Platform-Specific Requirements

#### Linux
```bash
sudo apt-get install libpcap-dev
```

#### macOS
```bash
brew install libpcap
```

#### Windows
- Install [WinPcap](https://www.winpcap.org/install/default.htm) or [Npcap](https://npcap.com/#download)
- Run Command Prompt as Administrator

## Installation

1. Navigate to the capture-agent directory:
```bash
cd capture-agent
```

2. Install dependencies:
```bash
npm install
```

3. Copy the environment file from parent directory or create .env:
```bash
cp ../.env .env
```

Make sure your `.env` file contains:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Configuration

You can configure the agent by setting environment variables in `.env`:

- `NETWORK_INTERFACE`: Network interface to monitor (default: auto-detect)
- `CAPTURE_FILTER`: BPF filter for packet capture (default: "ip")

### Finding Your Network Interface

**Linux/macOS:**
```bash
ifconfig
# or
ip addr
```

**Windows:**
```bash
ipconfig
```

Common interface names:
- Linux: `eth0`, `wlan0`, `enp0s3`
- macOS: `en0`, `en1`
- Windows: `\Device\NPF_{GUID}`

## Running the Agent

### Linux/macOS
```bash
sudo npm start
```

### Windows
```bash
npm start
```
(Run Command Prompt as Administrator)

## What Gets Captured

The agent monitors:
- TCP/UDP/ICMP traffic
- Source and destination IPs
- Port numbers
- Packet sizes
- Protocol information

## Threat Detection

The agent automatically detects:
- **Port Scans**: Multiple ports accessed from single IP
- **Brute Force**: Repeated authentication attempts
- **Malware Traffic**: Known malicious ports
- **ICMP Floods**: Large ICMP packets
- **High Frequency Traffic**: Abnormal traffic patterns
- **Suspicious Connections**: Unusual protocols or ports

## Privacy & Security

- The agent only captures packet headers, not content
- Private IP ranges (10.x.x.x, 192.168.x.x, 127.x.x.x) are filtered
- All data is sent securely to your Supabase instance
- No third-party services except IP geolocation

## Troubleshooting

### Permission Denied
- Make sure you're running with sudo (Linux/macOS) or as Administrator (Windows)

### No Packets Captured
- Verify your network interface name
- Check if the interface is active and has traffic
- Try a different capture filter

### Module Not Found
- Run `npm install` again
- Make sure all dependencies are installed
- Check Node.js version (requires 18+)

### Cannot Find Device
- List available devices and update NETWORK_INTERFACE in .env
- On Linux, try running: `sudo npm start`

## Stopping the Agent

Press `Ctrl+C` to stop the agent gracefully. It will display statistics before exiting.

## Performance

The agent is designed to be lightweight:
- Minimal CPU usage (1-5%)
- Low memory footprint (~50-100MB)
- Efficient database batching
- Smart caching to reduce API calls

## Support

For issues or questions, check the main ThreatWatch SOC documentation.
