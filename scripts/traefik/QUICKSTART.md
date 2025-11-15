# Quick Start Guide - Traefik Config Generator

## Adding a New Subdomain (Quick Steps)

1. **Edit the subdomains list:**
   ```bash
   nano subdomains.txt
   # or
   code subdomains.txt
   ```

2. **Add your new subdomain** (one per line, no domain suffix):
   ```
   test
   belvedere-plaza-medulin
   apartment-fuma
   my-new-hotel  ← Add this
   ```

3. **Generate the configuration:**
   ```bash
   python3 generate-config.py fwkw8g8gww00g4ggg0w8gg4s
   ```

4. **Copy to Coolify:**
   - Open `traefik-config.txt`
   - Copy ALL contents
   - Go to Coolify → Your App → Settings → Custom Labels
   - Replace existing labels with the new ones
   - Save

5. **Restart your app:**
   - In Coolify, restart your application
   - Wait for deployment to complete

6. **Test your new subdomain:**
   ```bash
   curl https://my-new-hotel.app.vrhotelo.com
   ```

## Important Notes

- ✅ All routes automatically get **5GB upload limit** and **60-minute timeout**
- ✅ HTTPS is automatically configured via Let's Encrypt
- ✅ HTTP traffic is automatically redirected to HTTPS
- ⚠️ Make sure to update DNS records for new subdomains in your DNS provider

## Common Tasks

### View Current Subdomains
```bash
cat subdomains.txt
```

### Remove a Subdomain
1. Edit `subdomains.txt`
2. Delete the line with the subdomain
3. Re-run the generator
4. Update Coolify with the new config

### Check Generated Config
```bash
cat traefik-config.txt | grep "rule=Host"
```

### Test Configuration Before Applying
```bash
# Generate to a different file for review
python3 generate-config.py fwkw8g8gww00g4ggg0w8gg4s subdomains.txt test-config.txt
```

## Troubleshooting

### Subdomain not working after update
- Did you restart the app in Coolify?
- Did you update DNS records?
- Check Coolify logs for Traefik errors

### Upload still timing out
- Verify the config was applied (check Coolify labels)
- Restart the app
- Check if `responseHeaderTimeout=3600s` is in the config

### SSL certificate issues
- Wait a few minutes for Let's Encrypt to issue the cert
- Check domain is pointing to correct IP
- Verify `tls.certresolver=letsencrypt` is in the config

