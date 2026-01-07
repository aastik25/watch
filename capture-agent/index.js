import Cap from 'cap';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { analyzePacket } from './analyzer.js';
import { getIPGeolocation } from './geolocation.js';
import os from 'os';

dotenv.config({ path: '../.env' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const c = new Cap.Cap();
const device = process.env.NETWORK_INTERFACE || getDefaultDevice();
const filter = process.env.CAPTURE_FILTER || 'ip';
const bufSize = 10 * 1024 * 1024;
const buffer = Buffer.alloc(65535);

const linkType = c.open(device, filter, bufSize, buffer);
console.log(`\n🛡️  ThreatWatch Network Capture Agent Started`);
console.log(`📡 Monitoring interface: ${device}`);
console.log(`🔍 Filter: ${filter}`);
console.log(`⚡ Link type: ${linkType}\n`);

const decoders = Cap.decoders;
const PROTOCOL = decoders.PROTOCOL;

let packetCount = 0;
const threatCache = new Map();

c.on('packet', async function(nbytes, trunc) {
  try {
    packetCount++;

    if (linkType === 'ETHERNET') {
      const ret = decoders.Ethernet(buffer);

      if (ret.info.type === PROTOCOL.ETHERNET.IPV4) {
        const ipv4 = decoders.IPV4(buffer, ret.offset);

        let srcPort = 0;
        let dstPort = 0;
        let protocol = 'IP';

        if (ipv4.info.protocol === PROTOCOL.IP.TCP) {
          const tcp = decoders.TCP(buffer, ipv4.offset);
          srcPort = tcp.info.srcport;
          dstPort = tcp.info.dstport;
          protocol = 'TCP';
        } else if (ipv4.info.protocol === PROTOCOL.IP.UDP) {
          const udp = decoders.UDP(buffer, ipv4.offset);
          srcPort = udp.info.srcport;
          dstPort = udp.info.dstport;
          protocol = 'UDP';
        } else if (ipv4.info.protocol === PROTOCOL.IP.ICMP) {
          protocol = 'ICMP';
        }

        const sourceIP = ipv4.info.srcaddr;
        const destIP = ipv4.info.dstaddr;

        const analysis = analyzePacket({
          sourceIP,
          destIP,
          srcPort,
          dstPort,
          protocol,
          size: nbytes
        });

        let geoData = { country: null, countryCode: null, latitude: null, longitude: null };

        if (analysis.isMalicious && !isPrivateIP(sourceIP)) {
          if (threatCache.has(sourceIP)) {
            geoData = threatCache.get(sourceIP);
          } else {
            geoData = await getIPGeolocation(sourceIP);
            threatCache.set(sourceIP, geoData);

            if (threatCache.size > 1000) {
              const firstKey = threatCache.keys().next().value;
              threatCache.delete(firstKey);
            }
          }
        }

        const packetData = {
          source_ip: sourceIP,
          dest_ip: destIP,
          source_port: srcPort,
          dest_port: dstPort,
          protocol: protocol,
          size: nbytes,
          is_malicious: analysis.isMalicious,
          threat_type: analysis.threatType,
          country: geoData.country,
          country_code: geoData.countryCode,
          latitude: geoData.latitude,
          longitude: geoData.longitude,
          captured_at: new Date().toISOString()
        };

        await supabase.from('packets').insert([packetData]);

        if (analysis.isMalicious) {
          console.log(`🚨 THREAT DETECTED: ${sourceIP} -> ${destIP} [${analysis.threatType}]`);
          await updateThreatRecord(sourceIP, analysis.threatType, geoData);
        }

        if (packetCount % 100 === 0) {
          console.log(`📊 Captured ${packetCount} packets (${Math.floor(packetCount * nbytes / 1024 / 1024)} MB)`);
        }
      }
    }
  } catch (error) {
    console.error('Error processing packet:', error.message);
  }
});

async function updateThreatRecord(ip, threatType, geoData) {
  try {
    const { data: existing } = await supabase
      .from('threats')
      .select('*')
      .eq('ip_address', ip)
      .maybeSingle();

    if (existing) {
      const updatedTypes = existing.threat_types.includes(threatType)
        ? existing.threat_types
        : [...existing.threat_types, threatType];

      await supabase
        .from('threats')
        .update({
          last_seen: new Date().toISOString(),
          count: existing.count + 1,
          threat_types: updatedTypes
        })
        .eq('ip_address', ip);
    } else {
      await supabase.from('threats').insert([{
        ip_address: ip,
        threat_types: [threatType],
        severity: getSeverity(threatType),
        country: geoData.country,
        country_code: geoData.countryCode,
        reports: ['ThreatWatch Agent'],
        first_seen: new Date().toISOString(),
        last_seen: new Date().toISOString(),
        count: 1
      }]);
    }
  } catch (error) {
    console.error('Error updating threat record:', error.message);
  }
}

function getSeverity(threatType) {
  const critical = ['Port Scan', 'Brute Force', 'SQL Injection', 'Malware'];
  const high = ['Suspicious Traffic', 'Unknown Protocol', 'High Frequency'];

  if (critical.includes(threatType)) return 'critical';
  if (high.includes(threatType)) return 'high';
  return 'medium';
}

function isPrivateIP(ip) {
  const parts = ip.split('.').map(Number);
  return (
    parts[0] === 10 ||
    parts[0] === 127 ||
    (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
    (parts[0] === 192 && parts[1] === 168)
  );
}

function getDefaultDevice() {
  const interfaces = os.networkInterfaces();

  for (const [name, addrs] of Object.entries(interfaces)) {
    if (addrs && addrs.some(addr => !addr.internal && addr.family === 'IPv4')) {
      return name;
    }
  }

  const devices = Cap.Cap.deviceList();
  return devices.length > 0 ? devices[0].name : 'eth0';
}

process.on('SIGINT', () => {
  console.log('\n\n📊 Final Statistics:');
  console.log(`   Total packets captured: ${packetCount}`);
  console.log(`   Threats detected: ${threatCache.size}`);
  console.log('\n🛡️  ThreatWatch Agent Stopped\n');
  c.close();
  process.exit(0);
});
