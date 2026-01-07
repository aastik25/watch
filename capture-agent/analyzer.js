const suspiciousPorts = new Set([
  22, 23, 3389, 5900, 1433, 3306, 5432, 27017, 6379, 9200,
  445, 139, 135, 137, 138, 1521, 8080, 8443, 4444, 31337
]);

const knownMaliciousPorts = new Set([
  4444, 31337, 12345, 54321, 6666, 6667, 6668, 6669
]);

const bruteForceThreshold = new Map();
const portScanDetection = new Map();
const connectionFrequency = new Map();

export function analyzePacket(packet) {
  const { sourceIP, destIP, srcPort, dstPort, protocol, size } = packet;

  const timestamp = Date.now();
  const isMalicious = false;
  let threatType = null;

  if (detectPortScan(sourceIP, dstPort, timestamp)) {
    return { isMalicious: true, threatType: 'Port Scan' };
  }

  if (detectBruteForce(sourceIP, destIP, dstPort, timestamp)) {
    return { isMalicious: true, threatType: 'Brute Force' };
  }

  if (knownMaliciousPorts.has(dstPort) || knownMaliciousPorts.has(srcPort)) {
    return { isMalicious: true, threatType: 'Malware' };
  }

  if (suspiciousPorts.has(dstPort)) {
    if (protocol === 'TCP' && (dstPort === 22 || dstPort === 3389 || dstPort === 23)) {
      if (detectHighFrequency(sourceIP, timestamp)) {
        return { isMalicious: true, threatType: 'Suspicious Traffic' };
      }
    }
  }

  if (size > 10000 && protocol === 'ICMP') {
    return { isMalicious: true, threatType: 'ICMP Flood' };
  }

  if (detectAbnormalTraffic(sourceIP, size, timestamp)) {
    return { isMalicious: true, threatType: 'High Frequency' };
  }

  return { isMalicious: false, threatType: null };
}

function detectPortScan(sourceIP, dstPort, timestamp) {
  if (!portScanDetection.has(sourceIP)) {
    portScanDetection.set(sourceIP, { ports: new Set(), lastSeen: timestamp });
    return false;
  }

  const scanData = portScanDetection.get(sourceIP);

  if (timestamp - scanData.lastSeen > 60000) {
    scanData.ports.clear();
    scanData.lastSeen = timestamp;
    return false;
  }

  scanData.ports.add(dstPort);
  scanData.lastSeen = timestamp;

  if (scanData.ports.size > 10) {
    return true;
  }

  if (portScanDetection.size > 5000) {
    const oldestKey = portScanDetection.keys().next().value;
    portScanDetection.delete(oldestKey);
  }

  return false;
}

function detectBruteForce(sourceIP, destIP, dstPort, timestamp) {
  const authPorts = [22, 23, 3389, 21, 3306, 5432, 1433];

  if (!authPorts.includes(dstPort)) {
    return false;
  }

  const key = `${sourceIP}:${destIP}:${dstPort}`;

  if (!bruteForceThreshold.has(key)) {
    bruteForceThreshold.set(key, { count: 1, firstSeen: timestamp });
    return false;
  }

  const data = bruteForceThreshold.get(key);

  if (timestamp - data.firstSeen > 60000) {
    data.count = 1;
    data.firstSeen = timestamp;
    return false;
  }

  data.count++;

  if (data.count > 20) {
    return true;
  }

  if (bruteForceThreshold.size > 5000) {
    const oldestKey = bruteForceThreshold.keys().next().value;
    bruteForceThreshold.delete(oldestKey);
  }

  return false;
}

function detectHighFrequency(sourceIP, timestamp) {
  if (!connectionFrequency.has(sourceIP)) {
    connectionFrequency.set(sourceIP, { count: 1, window: timestamp });
    return false;
  }

  const data = connectionFrequency.get(sourceIP);

  if (timestamp - data.window > 10000) {
    data.count = 1;
    data.window = timestamp;
    return false;
  }

  data.count++;

  if (data.count > 100) {
    return true;
  }

  if (connectionFrequency.size > 5000) {
    const oldestKey = connectionFrequency.keys().next().value;
    connectionFrequency.delete(oldestKey);
  }

  return false;
}

function detectAbnormalTraffic(sourceIP, size, timestamp) {
  const key = `traffic:${sourceIP}`;

  if (!connectionFrequency.has(key)) {
    connectionFrequency.set(key, { bytes: size, packets: 1, window: timestamp });
    return false;
  }

  const data = connectionFrequency.get(key);

  if (timestamp - data.window > 5000) {
    data.bytes = size;
    data.packets = 1;
    data.window = timestamp;
    return false;
  }

  data.bytes += size;
  data.packets++;

  if (data.packets > 500 && data.bytes > 1000000) {
    return true;
  }

  return false;
}

setInterval(() => {
  const now = Date.now();

  for (const [key, value] of portScanDetection.entries()) {
    if (now - value.lastSeen > 120000) {
      portScanDetection.delete(key);
    }
  }

  for (const [key, value] of bruteForceThreshold.entries()) {
    if (now - value.firstSeen > 120000) {
      bruteForceThreshold.delete(key);
    }
  }

  for (const [key, value] of connectionFrequency.entries()) {
    if (now - value.window > 120000) {
      connectionFrequency.delete(key);
    }
  }
}, 60000);
