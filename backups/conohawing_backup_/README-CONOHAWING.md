# StudySphere ConoHaWing Deployment Files

## Deployment Steps

1. Upload all files in this directory to ConoHaWing public_html
2. Ensure .htaccess file is uploaded correctly
3. Test access in browser

## File Structure

- index.html: React application entry point
- static/: Static files (JS, CSS, images, etc.)
- .htaccess: ConoHaWing Apache configuration

## Important Notes

- API runs on separate server (backend.studysphere.ayatori-inc.co.jp)
- API requests are automatically proxied via .htaccess configuration
- React Router requires SPA configuration in .htaccess

## Troubleshooting

- 404 errors: Check .htaccess file configuration
- API errors: Check backend server status
- Static files not loading: Check file upload status
