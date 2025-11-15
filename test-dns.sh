#!/bin/bash

# DNS Troubleshooting Script for R2 Connectivity
# This script helps diagnose DNS resolution issues with Cloudflare R2

echo "========================================="
echo "DNS Troubleshooting for R2 Connectivity"
echo "========================================="
echo ""

# Extract R2 hostname from environment or use provided argument
R2_HOSTNAME="${1:-vr-hotelo-5f7ad06b-a5ff-4924-835b-5e964a9beb0b.643af51677eb9db5c70ccc5452aa4400.r2.cloudflarestorage.com}"

echo "Testing DNS resolution for: $R2_HOSTNAME"
echo ""

# Test 1: System DNS resolution
echo "1. Testing system DNS resolution..."
if host "$R2_HOSTNAME" > /dev/null 2>&1; then
    echo "✓ System DNS resolution: SUCCESS"
    host "$R2_HOSTNAME"
else
    echo "✗ System DNS resolution: FAILED"
fi
echo ""

# Test 2: nslookup with different DNS servers
echo "2. Testing with Cloudflare DNS (1.1.1.1)..."
if nslookup "$R2_HOSTNAME" 1.1.1.1 > /dev/null 2>&1; then
    echo "✓ Cloudflare DNS: SUCCESS"
    nslookup "$R2_HOSTNAME" 1.1.1.1 | grep -A2 "Name:"
else
    echo "✗ Cloudflare DNS: FAILED"
fi
echo ""

echo "3. Testing with Google DNS (8.8.8.8)..."
if nslookup "$R2_HOSTNAME" 8.8.8.8 > /dev/null 2>&1; then
    echo "✓ Google DNS: SUCCESS"
    nslookup "$R2_HOSTNAME" 8.8.8.8 | grep -A2 "Name:"
else
    echo "✗ Google DNS: FAILED"
fi
echo ""

# Test 3: Ping test (if available)
echo "4. Testing ICMP connectivity (ping)..."
if ping -c 2 "$R2_HOSTNAME" > /dev/null 2>&1; then
    echo "✓ Ping: SUCCESS"
else
    echo "⚠ Ping: FAILED (This is normal - R2 may block ICMP)"
fi
echo ""

# Test 4: HTTPS connectivity
echo "5. Testing HTTPS connectivity..."
if curl -s -o /dev/null -w "%{http_code}" "https://$R2_HOSTNAME" --max-time 10 | grep -q "403\|404\|200"; then
    echo "✓ HTTPS connection: SUCCESS (R2 endpoint is reachable)"
else
    echo "✗ HTTPS connection: FAILED"
fi
echo ""

# Test 5: Check Docker DNS configuration
echo "6. Docker DNS Configuration..."
if command -v docker &> /dev/null; then
    echo "Checking Docker daemon DNS settings..."
    docker info 2>/dev/null | grep -i dns || echo "No custom DNS configured"
else
    echo "Docker not available in this environment"
fi
echo ""

# Test 6: Current DNS servers
echo "7. Current system DNS servers..."
if [ -f /etc/resolv.conf ]; then
    echo "DNS servers from /etc/resolv.conf:"
    grep nameserver /etc/resolv.conf
else
    echo "Cannot read /etc/resolv.conf"
fi
echo ""

# Test 7: Network latency
echo "8. Network latency test..."
echo "Testing latency to Cloudflare DNS..."
ping -c 3 1.1.1.1 2>/dev/null | tail -1 || echo "Cannot ping Cloudflare DNS"
echo ""

# Summary
echo "========================================="
echo "Summary"
echo "========================================="
echo ""
echo "If all tests pass, DNS resolution should work."
echo "If DNS tests fail:"
echo "  1. Check your network/firewall settings"
echo "  2. Ensure Docker has internet access"
echo "  3. Verify DNS servers in docker-compose.yml"
echo "  4. Try restarting Docker daemon"
echo ""
echo "To test from inside Docker container:"
echo "  docker-compose exec payload sh -c 'nslookup $R2_HOSTNAME'"
echo ""

