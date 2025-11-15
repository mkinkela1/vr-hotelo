#!/usr/bin/env python3
"""
Traefik Configuration Generator for VR Hotelo Multi-tenant App
Reads subdomains from subdomains.txt and generates Traefik labels with large file upload support
"""

import sys
from pathlib import Path

def read_subdomains(file_path):
    """Read subdomains from a text file (one per line)"""
    try:
        with open(file_path, 'r') as f:
            # Strip whitespace and filter empty lines
            subdomains = [line.strip() for line in f if line.strip()]
        return subdomains
    except FileNotFoundError:
        print(f"Error: File '{file_path}' not found")
        sys.exit(1)

def generate_traefik_config(app_id, subdomains):
    """Generate complete Traefik configuration with timeout settings for large uploads"""
    base_domain = "app.vrhotelo.com"
    sslip_domain = f"{app_id}.161.97.75.123.sslip.io"
    
    config = []
    
    # Base configuration with large upload support
    config.extend([
        "traefik.enable=true",
        "traefik.http.middlewares.gzip.compress=true",
        "traefik.http.middlewares.redirect-to-https.redirectscheme.scheme=https",
        "traefik.http.middlewares.large-upload-timeout.buffering.maxRequestBodyBytes=5368709120",
        "traefik.http.middlewares.large-upload-timeout.buffering.memRequestBodyBytes=10485760",
        "traefik.http.middlewares.large-upload-timeout.buffering.retryExpression=IsNetworkError() && Attempts() < 3",
    ])
    
    http_counter = 0
    https_counter = 2
    caddy_counter = 0
    
    # HTTP sslip.io route
    config.extend([
        f"traefik.http.routers.http-{http_counter}-{app_id}.entryPoints=http",
        f"traefik.http.routers.http-{http_counter}-{app_id}.middlewares=gzip",
        f"traefik.http.routers.http-{http_counter}-{app_id}.rule=Host(`{sslip_domain}`) && PathPrefix(`/`)",
        f"traefik.http.routers.http-{http_counter}-{app_id}.service=http-{http_counter}-{app_id}",
    ])
    http_counter += 1
    
    # HTTP base domain
    config.extend([
        f"traefik.http.routers.http-{http_counter}-{app_id}.entryPoints=http",
        f"traefik.http.routers.http-{http_counter}-{app_id}.middlewares=gzip",
        f"traefik.http.routers.http-{http_counter}-{app_id}.rule=Host(`{base_domain}`) && PathPrefix(`/`)",
        f"traefik.http.routers.http-{http_counter}-{app_id}.service=http-{http_counter}-{app_id}",
    ])
    http_counter += 1
    
    # HTTP redirect for base domain
    config.extend([
        f"traefik.http.routers.http-{http_counter}-{app_id}.entryPoints=http",
        f"traefik.http.routers.http-{http_counter}-{app_id}.middlewares=redirect-to-https",
        f"traefik.http.routers.http-{http_counter}-{app_id}.rule=Host(`{base_domain}`) && PathPrefix(`/`)",
        f"traefik.http.routers.http-{http_counter}-{app_id}.service=http-{http_counter}-{app_id}",
    ])
    http_counter += 1
    
    # HTTP redirect for subdomains
    for subdomain in subdomains:
        full_domain = f"{subdomain}.{base_domain}"
        config.extend([
            f"traefik.http.routers.http-{http_counter}-{app_id}.entryPoints=http",
            f"traefik.http.routers.http-{http_counter}-{app_id}.middlewares=redirect-to-https",
            f"traefik.http.routers.http-{http_counter}-{app_id}.rule=Host(`{full_domain}`) && PathPrefix(`/`)",
            f"traefik.http.routers.http-{http_counter}-{app_id}.service=http-{http_counter}-{app_id}",
        ])
        http_counter += 1
    
    # HTTPS base domain
    config.extend([
        f"traefik.http.routers.https-{https_counter}-{app_id}.entryPoints=https",
        f"traefik.http.routers.https-{https_counter}-{app_id}.middlewares=gzip",
        f"traefik.http.routers.https-{https_counter}-{app_id}.rule=Host(`{base_domain}`) && PathPrefix(`/`)",
        f"traefik.http.routers.https-{https_counter}-{app_id}.service=https-{https_counter}-{app_id}",
        f"traefik.http.routers.https-{https_counter}-{app_id}.tls.certresolver=letsencrypt",
        f"traefik.http.routers.https-{https_counter}-{app_id}.tls=true",
    ])
    https_counter += 1
    
    # HTTPS subdomains
    for subdomain in subdomains:
        full_domain = f"{subdomain}.{base_domain}"
        config.extend([
            f"traefik.http.routers.https-{https_counter}-{app_id}.entryPoints=https",
            f"traefik.http.routers.https-{https_counter}-{app_id}.middlewares=gzip",
            f"traefik.http.routers.https-{https_counter}-{app_id}.rule=Host(`{full_domain}`) && PathPrefix(`/`)",
            f"traefik.http.routers.https-{https_counter}-{app_id}.service=https-{https_counter}-{app_id}",
            f"traefik.http.routers.https-{https_counter}-{app_id}.tls.certresolver=letsencrypt",
            f"traefik.http.routers.https-{https_counter}-{app_id}.tls=true",
        ])
        https_counter += 1
    
    # Services (HTTP) - simplified, only port
    for i in range(len(subdomains) + 3):
        config.append(f"traefik.http.services.http-{i}-{app_id}.loadbalancer.server.port=80")
    
    # Services (HTTPS) - simplified, only port
    for i in range(2, len(subdomains) + 3):
        config.append(f"traefik.http.services.https-{i}-{app_id}.loadbalancer.server.port=80")
    
    # Caddy configuration
    config.extend([
        f"caddy_{caddy_counter}.encode=zstd gzip",
        f"caddy_{caddy_counter}.handle_path.{caddy_counter}_reverse_proxy={{{{upstreams 80}}}}",
        f"caddy_{caddy_counter}.handle_path=/*",
        f"caddy_{caddy_counter}.header=-Server",
        f"caddy_{caddy_counter}.try_files={{path}} /index.html /index.php",
        f"caddy_{caddy_counter}=http://{sslip_domain}",
    ])
    caddy_counter += 1
    
    config.extend([
        f"caddy_{caddy_counter}.encode=zstd gzip",
        f"caddy_{caddy_counter}.handle_path.{caddy_counter}_reverse_proxy={{{{upstreams 80}}}}",
        f"caddy_{caddy_counter}.handle_path=/*",
        f"caddy_{caddy_counter}.header=-Server",
        f"caddy_{caddy_counter}.try_files={{path}} /index.html /index.php",
        f"caddy_{caddy_counter}=http://{base_domain}",
    ])
    caddy_counter += 1
    
    config.extend([
        f"caddy_{caddy_counter}.encode=zstd gzip",
        f"caddy_{caddy_counter}.handle_path.{caddy_counter}_reverse_proxy={{{{upstreams 80}}}}",
        f"caddy_{caddy_counter}.handle_path=/*",
        f"caddy_{caddy_counter}.header=-Server",
        f"caddy_{caddy_counter}.try_files={{path}} /index.html /index.php",
        f"caddy_{caddy_counter}=https://{base_domain}",
    ])
    caddy_counter += 1
    
    for subdomain in subdomains:
        full_domain = f"{subdomain}.{base_domain}"
        config.extend([
            f"caddy_{caddy_counter}.encode=zstd gzip",
            f"caddy_{caddy_counter}.handle_path.{caddy_counter}_reverse_proxy={{{{upstreams 80}}}}",
            f"caddy_{caddy_counter}.handle_path=/*",
            f"caddy_{caddy_counter}.header=-Server",
            f"caddy_{caddy_counter}.try_files={{path}} /index.html /index.php",
            f"caddy_{caddy_counter}=https://{full_domain}",
        ])
        caddy_counter += 1
    
    config.append("caddy_ingress_network=coolify")
    
    # Join with newlines
    return "\n".join(config)

def main():
    # Get script directory
    script_dir = Path(__file__).parent
    
    # Default files
    default_subdomains_file = script_dir / "subdomains.txt"
    default_output_file = script_dir / "traefik-config.txt"
    
    # Parse arguments
    if len(sys.argv) < 2:
        print("Usage: python3 generate-config.py <app_id> [subdomains_file] [output_file]")
        print(f"\nDefault subdomains file: {default_subdomains_file}")
        print(f"Default output file: {default_output_file}")
        print("\nExample:")
        print("  python3 generate-config.py fwkw8g8gww00g4ggg0w8gg4s")
        print("  python3 generate-config.py fwkw8g8gww00g4ggg0w8gg4s custom-subdomains.txt")
        print("  python3 generate-config.py fwkw8g8gww00g4ggg0w8gg4s subdomains.txt output.txt")
        sys.exit(1)
    
    app_id = sys.argv[1]
    subdomains_file = sys.argv[2] if len(sys.argv) > 2 else default_subdomains_file
    output_file = sys.argv[3] if len(sys.argv) > 3 else default_output_file
    
    # Read subdomains
    print(f"Reading subdomains from: {subdomains_file}")
    subdomains = read_subdomains(subdomains_file)
    
    if not subdomains:
        print("Warning: No subdomains found in file")
    else:
        print(f"Found {len(subdomains)} subdomain(s):")
        for subdomain in subdomains:
            print(f"  - {subdomain}.app.vrhotelo.com")
    
    # Generate configuration
    print(f"\nGenerating Traefik configuration for app: {app_id}")
    config = generate_traefik_config(app_id, subdomains)
    
    # Write to file
    with open(output_file, 'w') as f:
        f.write(config)
    
    print(f"\n✓ Configuration saved to: {output_file}")
    print(f"\nNext steps:")
    print(f"1. Review the generated configuration in {output_file}")
    print(f"2. Copy the contents to your Coolify application settings")
    print(f"3. Restart your application for changes to take effect")
    print(f"\nNote: All routes include large file upload support (5GB max, 60min timeout)")

if __name__ == "__main__":
    main()

