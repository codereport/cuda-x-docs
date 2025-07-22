# CUDA Ecosystem Documentation

Interactive visualization of the CUDA ecosystem with dependency mapping and GitHub integration.

## Features

- **Interactive dependency visualization** - Hover over libraries to see their dependencies
- **GitHub star badges** - Shows popularity of open source projects
- **Language categorization** - Color-coded by programming language
- **Official vs unofficial dependencies** - Question marks indicate estimated relationships

## Usage

### Viewing the Documentation

1. **With HTTP Server** (Required for full functionality):
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Or Node.js
   npx serve .
   ```
   
2. **Open in browser**: `http://localhost:8000`

3. **Switch to table view** using the toggle button

4. **Hover over libraries** to see dependency arrows

### Table Settings

Click the gear icon in table view to access:
- **Include non-NVIDIA libraries** - Show third-party projects
- **Show language badge** - Display programming language indicators  
- **Show GitHub stars** - Toggle star badges for open source projects

## Updating GitHub Stars

The GitHub star counts can be updated automatically using the included script:

### Prerequisites

- Node.js installed on your system
- Internet connection for GitHub API access

### Running the Update Script

```bash
# Make the script executable (Unix/Linux/macOS)
chmod +x update_github_stars.js

# Run the script
node update_github_stars.js
```

### What the Script Does

1. **Fetches current star counts** from GitHub API for all open source projects
2. **Updates the HTML file** with fresh data
3. **Formats numbers** (e.g., 84532 → 84.5k)
4. **Preserves all other content** in the HTML file

### Example Output

```
🚀 Fetching GitHub star counts...

✅ PyTorch      →  84.5k stars (84532)
✅ JAX          →  30.2k stars (30234)  
✅ Triton       →  13.8k stars (13789)
✅ CuPy         →   8.9k stars (8901)
...

📊 Successfully fetched 15/15 repositories
✅ Successfully updated index.html

🎉 Star counts have been updated!
💡 Refresh your browser to see the latest counts.
```

### GitHub API Rate Limits

- **Anonymous requests**: 60 per hour
- **Authenticated requests**: 5000 per hour (if you add a GitHub token)

For frequent updates, consider adding authentication by setting the `GITHUB_TOKEN` environment variable.

## File Structure

```
cuda-x-docs/
├── index.html              # Main visualization
├── dependencies.json       # Dependency relationships  
├── update_github_stars.js  # Star count updater
├── logos/                  # Project logos
└── README.md              # This file
```

## Dependencies

The dependency relationships are stored in `dependencies.json` with the following structure:

```json
{
  "PyTorch": {
    "dependencies": ["cuDNN", "cuBLAS", "CUDA C++", "CUDA Runtime"],
    "official": true
  }
}
```

- **official: true** - Well-documented dependency
- **official: false** - Estimated/unofficial dependency (shows ? indicator)

## Contributing

To add new libraries or update dependencies:

1. **Add to dependencies.json** - Include dependency relationships
2. **Update GitHub data** - Add to `githubRepoData` object if open source
3. **Run star updater** - `node update_github_stars.js` to fetch latest counts
4. **Add logos** - Place in `logos/` directory if needed

## Browser Compatibility

- **Modern browsers** with ES6 support
- **HTTP server required** for JSON loading (CORS restrictions)
- **SVG support** needed for dependency arrows 