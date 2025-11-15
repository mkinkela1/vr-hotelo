# Traefik Configuration Generator

Automatically generates Traefik configuration labels for VR Hotelo multi-tenant subdomains with large file upload support (5GB max, 60-minute timeout).

## Files

- `generate-config.py` - Main script that generates Traefik configuration
- `subdomains.txt` - List of subdomains (one per line)
- `traefik-config.txt` - Generated configuration (auto-created)

## Usage

### Basic Usage

```bash
# Generate config using default files
python3 generate-config.py fwkw8g8gww00g4ggg0w8gg4s
```

### Custom Files

```bash
# Use custom subdomain file
python3 generate-config.py fwkw8g8gww00g4ggg0w8gg4s my-subdomains.txt

# Specify custom output file
python3 generate-config.py fwkw8g8gww00g4ggg0w8gg4s subdomains.txt custom-output.txt
```

## Managing Subdomains

Edit `subdomains.txt` and add one subdomain per line:

```
test
belvedere-plaza-medulin
apartment-fuma
new-hotel-name
another-property
```

**Note:** Don't include `.app.vrhotelo.com` - just the subdomain prefix.

## Adding a New Subdomain

1. Open `subdomains.txt`
2. Add the new subdomain on a new line
3. Run the generator:
   ```bash
   python3 generate-config.py fwkw8g8gww00g4ggg0w8gg4s
   ```
4. Copy contents from `traefik-config.txt` to Coolify
5. Restart your application

## Configuration Details

The generated configuration includes:

- ✅ **Large file upload support**: 5GB maximum request body size
- ✅ **Extended timeouts**: 60-minute response timeout for uploads
- ✅ **Retry logic**: Automatic retry on network errors (up to 3 attempts)
- ✅ **GZIP compression**: Enabled for all routes
- ✅ **HTTPS redirect**: Automatic redirect from HTTP to HTTPS
- ✅ **Let's Encrypt SSL**: Automatic certificate generation
- ✅ **Caddy support**: Included Caddy reverse proxy configuration

## Example Output

For app ID `fwkw8g8gww00g4ggg0w8gg4s` with subdomains `test` and `hotel-name`, the script generates:

- `http://app.vrhotelo.com`
- `https://app.vrhotelo.com`
- `https://test.app.vrhotelo.com`
- `https://hotel-name.app.vrhotelo.com`
- Plus sslip.io route for development

All routes include proper timeout configurations for uploading files up to 5GB.

## Troubleshooting

### Script won't run
```bash
chmod +x generate-config.py
```

### Missing Python
```bash
# On macOS
brew install python3

# On Ubuntu/Debian
sudo apt install python3
```

### File not found error
Make sure you're running the script from the `/scripts/traefik` directory or use absolute paths.

