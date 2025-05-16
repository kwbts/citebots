# GitHub Integration

## Repository Details

- **URL**: https://github.com/kwbts/citebots.git
- **Type**: Private repository
- **Organization**: kwbts
- **Default Branch**: main
- **Connected**: ✅ Successfully connected

## Integration Status

### Claude Desktop Integration
- **Status**: Active
- **Configuration**: `.github/` directory contains CI/CD workflows
- **Purpose**: AI-assisted development with version control

### Repository Setup
```bash
# Initial setup completed:
git init
git remote add origin https://github.com/kwbts/citebots.git
git branch -M main
git push -u origin main
```

## Workflow

1. **Development**: Use Claude Desktop for AI-assisted coding
2. **Version Control**: Commit changes locally
3. **Sync**: Push to GitHub for backup and collaboration
4. **Deploy**: Netlify auto-deploys from main branch

## Current Structure

```
.github/
├── README.md          # GitHub configuration docs
└── workflows/
    └── ci.yml         # Basic CI pipeline
```

## CI/CD Pipeline

The repository includes a basic GitHub Actions workflow that:
- Triggers on pushes to main
- Runs Node.js 18.x build
- Validates the build process

## Best Practices

1. **Commit Often**: Small, focused commits
2. **Descriptive Messages**: Clear commit messages
3. **Branch Strategy**: Use feature branches for major changes
4. **PR Reviews**: Even for solo work, document changes

## Access & Authentication

- Using HTTPS authentication
- Credentials managed by system keychain
- Claude Desktop has repository access

## Important Commands

```bash
# Check status
git status

# View remote
git remote -v

# Push changes
git add .
git commit -m "Description of changes"
git push

# Pull latest
git pull origin main
```

## Deployment Connection

- GitHub → Netlify (auto-deploy on push to main)
- Build triggers automatically
- Deploy previews for PRs (when configured)

## Security Notes

- Repository is private
- No sensitive data in commits
- Use environment variables for secrets
- `.gitignore` configured properly

## Troubleshooting

If push fails:
```bash
# Check remote
git remote -v

# Update remote URL if needed
git remote set-url origin https://github.com/kwbts/citebots.git

# Force push (use carefully)
git push -f origin main
```

---

*Last Updated: Weekend MVP Sprint*  
*Status: Fully Integrated and Operational*