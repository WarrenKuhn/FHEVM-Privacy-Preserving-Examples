# Automation Tools Reference

## Overview

The FHEVM Examples system includes powerful automation tools for creating and maintaining examples. These tools handle repetitive tasks and ensure consistency across all examples.

## Tools Available

### 1. create-fhevm-example.ts

**Purpose**: Scaffold standalone FHEVM example repositories

**Usage**:
```bash
ts-node scripts/create-fhevm-example.ts <example-name> <output-directory>
```

**Examples**:
```bash
# Create transportation dispatch example
ts-node scripts/create-fhevm-example.ts transportation-dispatch ./examples/dispatch

# Create counter example
ts-node scripts/create-fhevm-example.ts fhe-counter ./output/counter

# List available examples
ts-node scripts/create-fhevm-example.ts --help
```

**What It Does**:

1. **Creates Directory Structure**
   ```
   output-directory/
   ├── contracts/
   ├── test/
   ├── scripts/
   ├── hardhat.config.ts
   ├── package.json
   ├── tsconfig.json
   ├── README.md
   ├── .env.example
   └── .gitignore
   ```

2. **Copies Template Files**
   - Hardhat configuration
   - Package.json with dependencies
   - TypeScript configuration
   - Deployment scripts

3. **Adds Example Files**
   - Contract implementation
   - Test suite
   - Documentation

4. **Creates Supporting Files**
   - README with quick start
   - .env.example with configuration template
   - .gitignore with sensible defaults
   - Initializes git repository

**Configuration**:

Located in `scripts/create-fhevm-example.ts`:

```typescript
interface ExampleConfig {
    name: string;                    // Unique identifier
    title: string;                   // Display name
    description: string;             // Brief description
    category: string;                // Example category
    contractFile: string;            // Path to contract
    testFile: string;                // Path to tests
    docFile: string;                 // Path to documentation
}

const EXAMPLES_MAP: Record<string, ExampleConfig> = {
    "example-name": {
        // ... configuration
    },
};
```

**Adding New Examples**:

```typescript
"your-example": {
    name: "your-example",
    title: "Your Example Title",
    description: "What this example demonstrates",
    category: "category-name",
    contractFile: "contracts/YourExample.sol",
    testFile: "test/YourExample.test.ts",
    docFile: "docs/YOUR_EXAMPLE.md",
}
```

### 2. generate-docs.ts

**Purpose**: Generate GitBook-compatible documentation from code

**Usage**:
```bash
ts-node scripts/generate-docs.ts <example-name | --all>
```

**Examples**:
```bash
# Generate docs for specific example
ts-node scripts/generate-docs.ts transportation-dispatch

# Generate all documentation
ts-node scripts/generate-docs.ts --all

# Get help
ts-node scripts/generate-docs.ts --help
```

**What It Does**:

1. **Extracts Code**
   - Reads contract files
   - Reads test files
   - Preserves formatting

2. **Generates Markdown**
   - Creates example documentation
   - Formats code blocks
   - Adds explanations

3. **Creates Index**
   - Generates SUMMARY.md for GitBook
   - Organizes by category
   - Links examples

4. **Produces Resources**
   - Getting started guide
   - Quick reference
   - FAQ section

**Output Structure**:
```
docs/
├── SUMMARY.md                      # GitBook index
├── GETTING_STARTED.md              # Quick start
├── example-name/
│   └── README.md                   # Example docs
└── another-example/
    └── README.md
```

**Configuration**:

Located in `scripts/generate-docs.ts`:

```typescript
interface DocConfig {
    name: string;              // Example identifier
    title: string;             // Display name
    description: string;       // Description
    contractPath: string;      // Contract location
    testPath: string;          // Test location
    category: string;          // Category name
    order: number;             // Display order
}

const DOCS_CONFIG: Record<string, DocConfig> = {
    "example-name": {
        // ... configuration
    },
};
```

**Documentation Metadata**:

Use JSDoc comments in code:

```solidity
/**
 * @title Contract Name
 * @dev Detailed description
 * @chapter category-name
 */

/**
 * @notice Brief function description
 * @dev Technical details
 * @param paramName Parameter description
 * @return Return value description
 */
```

## Workflow Examples

### Creating a New Example

**Step 1: Develop locally**
```bash
# Work on contracts/ and test/
# Update scripts configuration
```

**Step 2: Generate standalone repository**
```bash
ts-node scripts/create-fhevm-example.ts new-example ./examples/new
cd examples/new
npm install
npm run test
```

**Step 3: Verify deployment**
```bash
npm run deploy -- --network sepolia
```

**Step 4: Generate documentation**
```bash
ts-node scripts/generate-docs.ts new-example
```

### Updating All Documentation

```bash
# After updating examples:
ts-node scripts/generate-docs.ts --all

# Verify GitBook compatibility:
# Check docs/SUMMARY.md
# Verify all links work
# Test locally if using GitBook CLI
```

### Bulk Creating Examples

```bash
# Create multiple examples at once:
for example in "example1" "example2" "example3"; do
    ts-node scripts/create-fhevm-example.ts $example ./output/$example
    cd ./output/$example && npm install && npm test && cd ../..
done
```

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Generate Examples and Docs

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  generate:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm install

      - name: Generate all examples
        run: |
          for example in transportation-dispatch fhe-counter access-control; do
            ts-node scripts/create-fhevm-example.ts $example ./examples/$example
          done

      - name: Generate documentation
        run: ts-node scripts/generate-docs.ts --all

      - name: Run tests
        run: npm run test

      - name: Commit and push changes
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add -A
          git commit -m "Auto-generate examples and docs" || true
          git push
```

## Advanced Configuration

### Custom Example Metadata

Extend example configuration with additional fields:

```typescript
interface ExampleConfig {
    // Standard fields
    name: string;
    title: string;
    description: string;

    // Custom fields
    difficulty: "beginner" | "intermediate" | "advanced";
    estimatedTime: string;
    prerequisites: string[];
    tags: string[];
    relatedExamples: string[];
}
```

### Documentation Templates

Create custom templates for different example types:

```typescript
function generateAdvancedExampleDoc(config: DocConfig): string {
    return `# ${config.title}

## Overview
${config.description}

## Prerequisites
${config.prerequisites.join('\n')}

## Learning Path
[Custom learning path]

## Implementation Details
[Detailed explanation]

## Common Pitfalls
[Mistakes to avoid]
`;
}
```

### Pre/Post Generation Hooks

```typescript
// Run before example generation
beforeGenerateExample(exampleName: string): void {
    // Validate example configuration
    // Setup temporary files
    // Download dependencies
}

// Run after example generation
afterGenerateExample(exampleDir: string): void {
    // Run linter
    // Execute tests
    // Generate report
}
```

## Troubleshooting

### Tool Issues

**Issue**: Script not found
```bash
# Solution: Ensure ts-node is installed
npm install --save-dev ts-node

# Or run directly with node
npx ts-node scripts/create-fhevm-example.ts example-name ./output
```

**Issue**: Template files not copied
```bash
# Solution: Verify base-template directory exists
ls base-template/

# Verify file paths in script match actual locations
```

**Issue**: Documentation not generating
```bash
# Solution: Check JSDoc comment format
# Verify files exist at configured paths
# Check DOCS_CONFIG entries match source files
```

### Performance Optimization

**For large example collections**:

```typescript
// Use async operations
async function generateAllDocs() {
    const examples = Object.values(DOCS_CONFIG);

    // Process in parallel with limit
    const batchSize = 3;
    for (let i = 0; i < examples.length; i += batchSize) {
        const batch = examples.slice(i, i + batchSize);
        await Promise.all(batch.map(ex => generateDoc(ex)));
    }
}
```

**For large repositories**:

```bash
# Use faster file operations
# Pre-compile TypeScript
# Cache generated documentation
# Use incremental builds
```

## Best Practices

### Managing Configurations

✅ **DO**:
- Keep configurations in sync
- Document all fields
- Validate configurations
- Test with actual examples
- Version control configurations

❌ **DON'T**:
- Hardcode paths
- Have duplicate configurations
- Use inconsistent naming
- Skip validation
- Change without testing

### Maintaining Tools

✅ **DO**:
- Add meaningful error messages
- Log progress information
- Handle edge cases
- Test tool updates
- Document tool changes

❌ **DON'T**:
- Ignore errors silently
- Remove features without warning
- Create circular dependencies
- Leave debugging code
- Skip testing tool changes

## Command Reference

```bash
# Create examples
ts-node scripts/create-fhevm-example.ts example-name ./output
ts-node scripts/create-fhevm-example.ts --help

# Generate documentation
ts-node scripts/generate-docs.ts example-name
ts-node scripts/generate-docs.ts --all
ts-node scripts/generate-docs.ts --help

# List examples
grep "^[[:space:]]*\"" scripts/create-fhevm-example.ts | grep ": {" | sed 's/.*"\([^"]*\)".*/\1/'

# Count examples
grep -c "name:" scripts/create-fhevm-example.ts

# Validate configuration
npm run test -- --grep "configuration"
```

## Extending the Tools

### Adding New Automation Scripts

```typescript
// scripts/my-tool.ts
#!/usr/bin/env ts-node

import * as fs from "fs";

interface MyConfig {
    // Your configuration
}

function main() {
    // Implementation
}

main().catch(console.error);
```

**Then in package.json**:
```json
{
    "scripts": {
        "my-tool": "ts-node scripts/my-tool.ts"
    }
}
```

### Integration Points

- Before example generation: Validate files
- During generation: Customize creation
- After generation: Run tests, linting, deployment
- Documentation: Custom templates, extraction

---

## Resources

- [Script Source Code](./scripts/)
- [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)
- [TECHNICAL_DOCUMENTATION.md](./TECHNICAL_DOCUMENTATION.md)
- [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)

---

**Document Version**: 1.0
**Last Updated**: December 2025
**Status**: Production Ready

For detailed implementation guides, see [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md).
