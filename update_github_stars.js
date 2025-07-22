#!/usr/bin/env node

const fs = require('fs');
const https = require('https');

// GitHub repository data to update
const repositories = {
    'PyTorch': 'pytorch/pytorch',
    'TensorFlow': 'tensorflow/tensorflow',
    'JAX': 'jax-ml/jax', 
    'Triton': 'triton-lang/triton',
    'RAPIDS': 'rapidsai/cudf',
    'CuPy': 'cupy/cupy',
    'CUTLASS': 'NVIDIA/cutlass',
    'Thrust': 'NVIDIA/thrust',
    'CUB': 'NVIDIA/cub',
    'libcu++': 'NVIDIA/libcudacxx',
    'NCCL': 'NVIDIA/nccl',
    'numba-cuda': 'numba/numba',
    'NVBENCH': 'NVIDIA/nvbench',
    'mpi4py': 'mpi4py/mpi4py',
    'nvComp': 'NVIDIA/nvcomp'
};

// Function to format star count (e.g., 84532 -> 84.5k)
function formatStarCount(count) {
    if (count >= 1000) {
        return (count / 1000).toFixed(1) + 'k';
    }
    return count.toString();
}

// Function to fetch GitHub repository data
function fetchRepoData(repo) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.github.com',
            path: `/repos/${repo}`,
            method: 'GET',
            headers: {
                'User-Agent': 'CUDA-Ecosystem-Star-Updater',
                'Accept': 'application/vnd.github.v3+json'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                if (res.statusCode === 200) {
                    try {
                        const repoData = JSON.parse(data);
                        resolve({
                            repo: repo,
                            stars: repoData.stargazers_count,
                            formatted: formatStarCount(repoData.stargazers_count)
                        });
                    } catch (error) {
                        reject(new Error(`Failed to parse JSON for ${repo}: ${error.message}`));
                    }
                } else {
                    reject(new Error(`HTTP ${res.statusCode} for ${repo}: ${data}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(new Error(`Request failed for ${repo}: ${error.message}`));
        });

        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error(`Timeout for ${repo}`));
        });

        req.end();
    });
}

// Function to update HTML file with new star counts
function updateHtmlFile(starData) {
    console.log('Reading index.html...');
    
    let htmlContent = fs.readFileSync('index.html', 'utf8');
    
    // Find the githubRepoData object in the HTML
    const startPattern = /const githubRepoData = \{/;
    const endPattern = /\s*\};/;
    
    const startMatch = htmlContent.match(startPattern);
    if (!startMatch) {
        throw new Error('Could not find githubRepoData object in HTML file');
    }
    
    const startIndex = startMatch.index;
    const afterStart = htmlContent.substring(startIndex);
    const endMatch = afterStart.match(endPattern);
    
    if (!endMatch) {
        throw new Error('Could not find end of githubRepoData object');
    }
    
    const endIndex = startIndex + endMatch.index + endMatch[0].length;
    
    // Build new githubRepoData object
    let newGitHubData = '        // GitHub repository data for open source projects\n';
    newGitHubData += '        const githubRepoData = {\n';
    
    for (const [library, data] of Object.entries(starData)) {
        newGitHubData += `            '${library}': {\n`;
        newGitHubData += `                repo: '${data.repo}',\n`;
        newGitHubData += `                stars: '${data.formatted}'\n`;
        newGitHubData += `            },\n`;
    }
    
    // Remove trailing comma and close object
    newGitHubData = newGitHubData.slice(0, -2) + '\n';
    newGitHubData += '        };';
    
    // Replace old data with new data
    const newHtmlContent = htmlContent.substring(0, startIndex) + 
                          newGitHubData + 
                          htmlContent.substring(endIndex);
    
    // Write back to file
    fs.writeFileSync('index.html', newHtmlContent, 'utf8');
    console.log('✅ Successfully updated index.html');
}

// Main function
async function updateStars() {
    console.log('🚀 Fetching GitHub star counts...\n');
    
    const starData = {};
    const promises = [];
    
    // Create promises for all repositories
    for (const [library, repo] of Object.entries(repositories)) {
        promises.push(
            fetchRepoData(repo)
                .then(data => {
                    console.log(`✅ ${library.padEnd(12)} → ${data.formatted.padStart(6)} stars (${data.stars})`);
                    starData[library] = data;
                })
                .catch(error => {
                    console.error(`❌ ${library.padEnd(12)} → ${error.message}`);
                })
        );
    }
    
    // Wait for all requests to complete
    await Promise.allSettled(promises);
    
    if (Object.keys(starData).length === 0) {
        console.error('\n❌ No star data was fetched successfully');
        process.exit(1);
    }
    
    console.log(`\n📊 Successfully fetched ${Object.keys(starData).length}/${Object.keys(repositories).length} repositories`);
    
    try {
        updateHtmlFile(starData);
        console.log('\n🎉 Star counts have been updated!');
        console.log('💡 Refresh your browser to see the latest counts.');
    } catch (error) {
        console.error(`\n❌ Failed to update HTML file: ${error.message}`);
        process.exit(1);
    }
}

// Add some delay between requests to be nice to GitHub API
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Run the update
if (require.main === module) {
    updateStars().catch(error => {
        console.error('❌ Script failed:', error.message);
        process.exit(1);
    });
} 