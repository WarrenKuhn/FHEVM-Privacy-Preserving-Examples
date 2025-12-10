# Automation Scripts Documentation

## Overview

This directory contains TypeScript automation tools for creating and managing FHEVM examples. These scripts handle scaffolding, documentation generation, and project maintenance.

---

## Available Scripts

### 1. create-fhevm-example.ts

**Purpose**: Scaffold standalone FHEVM example repositories

**Installation**:
```bash
npm install -g ts-node  # If not already installed
```

**Basic Usage**:
```bash
ts-node scripts/create-fhevm-example.ts <example-name> <output-directory>
```

**Examples**:
```bash
# Create transportation dispatch example
ts-node scripts/create-fhevm-example.ts transportation-dispatch ./examples/dispatch

# Create in current directory with simple name
ts-node scripts/create-fhevm-example.ts fhe-counter ./counter

# List available examples
ts-node scripts/create-fhevm-example.ts --help
```

**What It Creates**:
```
output-directory/
├── contracts/                # Solidity contracts
├── test/                    # Test files
├── scripts/                 # Deployment scripts
├── hardhat.config.ts       # Hardhat configuration
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
├── README.md               # Quick start guide
├── .env.example            # Configuration template
└── .gitignore              # Git ignore rules
```

**Configuration**:

Located in the `EXAMPLES_MAP` object in the script:

```typescript
const EXAMPLES_MAP: Record<string, ExampleConfig> = {
    "your-example": {
        name: "your-example",                  // Unique identifier
        title: "Example Display Name",         // Human-readable name
        description: "What this example does",  // Brief description
        category: "category-name",             // Category for organization
        contractFile: "contracts/YourExample.sol",  // Source contract
        testFile: "test/YourExample.test.ts",      // Source test
        docFile: "docs/YOUR_EXAMPLE.md",           // Documentation
    },
};
```

**Adding New Examples**:

1. Create contract and test files
2. Add entry to `EXAMPLES_MAP`
3. Run script to generate standalone repository

```bash
# After adding to EXAMPLES_MAP:
ts-node scripts/create-fhevm-example.ts your-example ./examples/your-example
cd examples/your-example
npm install
npm run test
```

**Available Examples**:

| Name | Title | Category |
|------|-------|----------|
| transportation-dispatch | Privacy-Preserving Transportation Dispatch | advanced |
| fhe-counter | FHE Counter | basic |
| access-control | Access Control | intermediate |

**Output Details**:

The script creates:
- ✅ Complete Hardhat project structure
- ✅ Package.json with proper dependencies
- ✅ Hardhat configuration for Sepolia
- ✅ TypeScript configuration
- ✅ Example contract and tests
- ✅ Deployment script
- ✅ README with quick start
- ✅ .env.example for configuration
- ✅ .gitignore with sensible defaults
- ✅ Git repository initialization

### 2. generate-docs.ts

**Purpose**: Generate GitBook-compatible documentation from code

**Installation**:
```bash
npm install -g ts-node  # If not already installed
```

**Basic Usage**:
```bash
ts-node scripts/generate-docs.ts <example-name | --all>
```

**Examples**:
```bash
# Generate documentation for specific example
ts-node scripts/generate-docs.ts transportation-dispatch

# Generate all documentation
ts-node scripts/generate-docs.ts --all

# Get help
ts-node scripts/generate-docs.ts --help
```

**What It Creates**:
```
docs/
├── SUMMARY.md                      # GitBook table of contents
├── GETTING_STARTED.md              # Quick start guide
├── example-name/
│   └── README.md                   # Example documentation
├── fhe-counter/
│   └── README.md
└── access-control/
    └── README.md
```

**Configuration**:

Located in the `DOCS_CONFIG` object:

```typescript
const DOCS_CONFIG: Record<string, DocConfig> = {
    "example-name": {
        name: "example-name",                  // Identifier
        title: "Display Name",                 // Title
        description: "What it demonstrates",    // Description
        contractPath: "contracts/Example.sol", // Contract location
        testPath: "test/Example.test.ts",      // Test location
        category: "Category Name",             // Documentation category
        order: 1,                              // Display order
    },
};
```

**Adding Documentation**:

1. Add entry to `DOCS_CONFIG`
2. Run generation script

```bash
ts-node scripts/generate-docs.ts --all
```

**Documentation Features**:

- ✅ Extracts code from contracts and tests
- ✅ Generates formatted markdown
- ✅ Creates organized structure
- ✅ Builds GitBook index
- ✅ Generates getting started guide
- ✅ Links related examples

**Output Examples**:

- Individual example docs with code samples
- Organized by category
- Cross-linked references
- Complete getting started guide
- GitBook-compatible format

---

## Using with npm Scripts

Add to your `package.json`:

```json
{
  "scripts": {
    "create-example": "ts-node scripts/create-fhevm-example.ts",
    "generate-docs": "ts-node scripts/generate-docs.ts",
    "generate-all-docs": "ts-node scripts/generate-docs.ts --all"
  }
}
```

Then use:
```bash
npm run create-example transportation-dispatch ./output
npm run generate-docs example-name
npm run generate-all-docs
```

---

## Workflow Examples

### Creating and Testing a New Example

```bash
# 1. Create standalone repository
ts-node scripts/create-fhevm-example.ts my-example ./examples/my-example

# 2. Navigate to it
cd examples/my-example

# 3. Install dependencies
npm install

# 4. Test it works
npm run compile
npm run test

# 5. Verify deployment
npm run deploy -- --network sepolia
```

### Generating All Documentation

```bash
# Generate complete documentation
ts-node scripts/generate-docs.ts --all

# Check generated files
ls -la docs/

# Verify GitBook structure
cat docs/SUMMARY.md
```

### Batch Creating Multiple Examples

```bash
#!/bin/bash
# create-all-examples.sh

for example in "transportation-dispatch" "fhe-counter" "access-control"; do
    echo "Creating $example..."
    ts-node scripts/create-fhevm-example.ts $example ./output/$example
    cd ./output/$example
    npm install
    npm run test
    cd ../..
done
```

Run with:
```bash
chmod +x create-all-examples.sh
./create-all-examples.sh
```

---

## Advanced Usage

### Custom Templates

Extend the base template for specific examples:

```typescript
function copyCustomFiles(outputDir: string, exampleName: string) {
    // Copy example-specific files
    // Modify configuration for specific needs
    // Add custom deployment scripts
}
```

### CI/CD Integration

### GitHub Actions

```yaml
name: Generate Examples

on:
  push:
    branches: [main]

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run generate-all-docs
      - run: npm run test
```

### Pre-commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit

# Generate docs before commit
npm run generate-all-docs

# Add generated docs to commit
git add docs/
```

---

## Troubleshooting

### Issue: ts-node: command not found

**Solution**:
```bash
# Install globally
npm install -g ts-node

# Or use npx
npx ts-node scripts/create-fhevm-example.ts example-name ./output
```

### Issue: ENOENT: no such file or directory

**Solution**:
```bash
# Verify base-template exists
ls -la base-template/

# Check file paths in script
grep "contractFile" scripts/create-fhevm-example.ts
```

### Issue: Failed to copy files

**Solution**:
```bash
# Ensure source files exist
ls contracts/
ls test/

# Check script paths match actual files
```

### Issue: TypeScript compilation error

**Solution**:
```bash
# Update TypeScript
npm install --save-dev typescript@latest

# Clear cache
npm run clean
rm -rf dist/
```

---

## Performance Tips

### Faster Execution

```bash
# Cache TypeScript compilation
npm install --save-dev ts-node-transpile-only
ts-node --transpile-only scripts/create-fhevm-example.ts example ./output
```

### Batch Processing

```typescript
// Process multiple examples in parallel
async function createMultiple(examples: string[]) {
    await Promise.all(
        examples.map(ex => createExample(ex))
    );
}
```

### Incremental Documentation

```typescript
// Only regenerate changed examples
function generateIfChanged(example: string) {
    if (hasChanged(example)) {
        generateDocs(example);
    }
}
```

---

## Extending the Scripts

### Adding New Automation Script

1. Create new file: `scripts/my-tool.ts`
2. Implement main function
3. Add TypeScript logic
4. Make executable

```typescript
#!/usr/bin/env ts-node

import * as fs from "fs";

async function main() {
    // Your implementation
}

main().catch(console.error);
```

### Integration Points

- Before generation: Validate configurations
- During generation: Customize creation
- After generation: Run tests, linting
- Post-deployment: Verification

---

## Best Practices

✅ **DO**:
- Validate all configurations
- Create meaningful output messages
- Handle errors gracefully
- Test generated output
- Document any custom extensions
- Keep scripts DRY (Don't Repeat Yourself)

❌ **DON'T**:
- Hardcode paths
- Skip error handling
- Create overly complex logic
- Leave debugging code
- Remove backward compatibility
- Ignore edge cases

---

## Maintenance

### Updating Scripts

```bash
# After updating dependencies
npm install

# Regenerate examples to test
ts-node scripts/create-fhevm-example.ts test-example ./test-output
cd test-output && npm test && cd ..
rm -rf test-output
```

### Monitoring Changes

```bash
# Track script modifications
git log --follow scripts/

# Diff recent changes
git diff HEAD~1 scripts/
```

---

## Related Documentation

- **[DEVELOPER_GUIDE.md](../DEVELOPER_GUIDE.md)** - How to use these scripts
- **[AUTOMATION_TOOLS.md](../AUTOMATION_TOOLS.md)** - Detailed tool reference
- **[IMPLEMENTATION_GUIDE.md](../IMPLEMENTATION_GUIDE.md)** - Setup and deployment
- **[QUICK_REFERENCE.md](../QUICK_REFERENCE.md)** - Quick command reference

---

## Command Reference

```bash
# Create examples
ts-node scripts/create-fhevm-example.ts name ./output
ts-node scripts/create-fhevm-example.ts --help

# Generate documentation
ts-node scripts/generate-docs.ts name
ts-node scripts/generate-docs.ts --all
ts-node scripts/generate-docs.ts --help

# Using npm scripts
npm run create-example name ./output
npm run generate-docs name
npm run generate-all-docs
```

---

**Version**: 1.0
**Last Updated**: December 2025
**Status**: Production Ready

For more information, see [AUTOMATION_TOOLS.md](../AUTOMATION_TOOLS.md).
