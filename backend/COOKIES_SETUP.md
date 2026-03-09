# YouTube Cookies Setup Guide

This guide explains how to export and use YouTube authentication cookies to reduce bot verification errors when fetching video streams.

## Why Cookies?

YouTube frequently blocks automated requests with "Sign in to confirm you're not a bot" errors. By providing cookies from a logged-in YouTube session, yt-dlp can bypass these checks and successfully fetch video stream URLs.

## Setup Steps

### 1. Install Browser Extension

Choose one of these extensions based on your browser:

**Chrome/Edge:**
- [Get cookies.txt LOCALLY](https://chrome.google.com/webstore/search/cookies.txt)
- [Cookie-Editor](https://chromewebstore.google.com/detail/cookie-editor/hlkenndednhfkekhgcdicdfddnkalmdb)

**Firefox:**
- [cookies.txt](https://addons.mozilla.org/en-US/firefox/addon/cookies-txt/)

### 2. Log In to YouTube

1. Open [youtube.com](https://www.youtube.com/) in your browser
2. **IMPORTANT**: Log in to your YouTube/Google account
3. Wait for the page to fully load

### 3. Export Cookies

1. Click the extension icon in your toolbar
2. Click "Export" or "Download cookies.txt" 
3. Save the file as `youtube.cookies.txt`
4. Verify the file starts with: `# Netscape HTTP Cookie File`

### 4. Place Cookies in Backend Directory

```bash
# Move to backend directory
cd /home/santhoshmk/EDUCATION CONTENT/Projects/M14U-js/backend

# Place your file here
mv /path/to/youtube.cookies.txt ./
```

**NOTE**: The file is automatically ignored by git (.gitignore). Never commit cookies to version control!

## Railway Production Deployment

Upload the file to persistent storage:

1. In Railway dashboard, go to your project
2. Navigate to "Settings" → "Persistent Storage"
3. Upload your `youtube.cookies.txt` file
4. Restart your application
5. Verify in logs: `✓ Using cookies for YouTube authentication`

## Verification

### Local Testing

1. Start the server:
```bash
cd backend
npm start
```

2. Check for this message in logs:
```
✓ Using cookies for YouTube authentication
```

3. Test an endpoint:
```bash
curl http://localhost:3000/api/stream/JAfZ594rzHw
```

### Production Testing

1. Check deployment logs in Railway
2. Look for: `✓ Using cookies for YouTube authentication`
3. Monitor for retry attempts (if cookies fail):
```
Attempt 1/3: Fetching stream for https://youtube.com/watch?v=xxx
Attempt 2/3: Fetching stream for https://youtube.com/watch?v=xxx
✓ Success on attempt 2
```

## Troubleshooting

### "No cookies file found" warning

**Problem**: The application can't find `youtube.cookies.txt`

**Solution**: 
- Check file exists: `ls backend/youtube.cookies.txt`
- Verify file location is in backend/
- Check Railway persistent storage path

### Still getting "Sign in to confirm you're not a bot" errors

**Problem**: Cookies may be expired or incomplete

**Solution**:
1. Regenerate cookies (repeat steps 1-3 above)
2. Cookies expire after ~30 days - refresh monthly
3. Ensure you're logged into YouTube when exporting
4. Verify cookies contain session tokens (SAPISID, SID, etc.)

## Security Notes

⚠️ **IMPORTANT SAFETY INFORMATION:**

1. **Never commit cookies.txt** - It's already in .gitignore
2. **Treat cookies like passwords** - They contain session tokens
3. **Don't share cookies files** - Others could access your YouTube account
4. **Regenerate if compromised** - Log out and export new cookies
5. **Monitor your account** - Check for unusual activity
6. **Rotate monthly** - Refresh cookies every 30 days

## Refresh Schedule

Set a calendar reminder:

- **Development**: Refresh cookies when you see warnings in logs
- **Production**: Refresh every 30 days minimum
- **Upon Failure**: If you see bot verification errors, refresh immediately

## Cookie File Format

Your `youtube.cookies.txt` should look like:

```
# Netscape HTTP Cookie File
.youtube.com	TRUE	/	TRUE	1788590635.722	VISITOR_PRIVACY_METADATA	CgJJThIEGgAgGg%3D%3D
.youtube.com	TRUE	/	TRUE	1807598636.946	PREF	f6=40000001&tz=Asia.Kolkata&f7=100
.youtube.com	TRUE	/	TRUE	1804574611.274	__Secure-1PSIDTS	sidts-CjUBBj1...
.youtube.com	TRUE	/	FALSE	1806869292.227	HSID	AiXNygsA7bZ5n8aYx
.youtube.com	TRUE	/	TRUE	1806869292.227	SSID	A0QD75U8S5AAtETVa
.youtube.com	TRUE	/	FALSE	1806869292.228	APISID	lkyEfkdYo3nb7cWT/AjxA91zoM76YyZu8q
.youtube.com	TRUE	/	TRUE	1806869292.228	SAPISID	4YF5tHP5fbqLjIji/AWgL3RamAHcJT6LuY
```

**Key cookies to verify:**
- `HSID`, `SSID`, `APISID`, `SAPISID`: Authentication tokens
- `SID`: Session ID
- `__Secure-3PSID`: Secure session variant

## Support

If you continue experiencing issues:

1. Check application logs for specific errors
2. Verify cookie file format (must be Netscape format)
3. Ensure cookies are not expired
4. Try different browser/new YouTube account
5. Check if video is age-restricted or region-blocked
6. Consider implementing proxy rotation for persistent issues
