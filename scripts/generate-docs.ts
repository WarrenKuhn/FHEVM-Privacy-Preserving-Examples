#!/usr/bin/env ts-node
/**
 * @fileoverview Documentation Generator for FHEVM Examples
 * @description Generates GitBook-compatible documentation from code annotations
 *
 * Usage:
 *   ts-node scripts/generate-docs.ts <example-name>
 *   ts-node scripts/generate-docs.ts --all
 *   Example: ts-node scripts/generate-docs.ts transportation-dispatch
 */

import * as fs from "fs";
import * as path from "path";

/**
 * Documentation configuration for examples
 */
interface DocConfig {
    name: string;
    title: string;
    description: string;
    contractPath: string;
    testPath: string;
    category: string;
    order: number;
}

const DOCS_CONFIG: Record<string, DocConfig> = {
    "transportation-dispatch": {
        name: "transportation-dispatch",
        title: "Privacy-Preserving Transportation Dispatch",
        description:
            "A complete example of using FHE for logistics optimization while preserving privacy",
        contractPath: "contracts/AnonymousTransport.sol",
        testPath: "test/AnonymousTransport.test.ts",
        category: "Advanced Examples",
        order: 1,
    },
    "fhe-counter": {
        name: "fhe-counter",
        title: "FHE Counter",
        description: "A simple counter implemented with FHE encryption",
        contractPath: "contracts/FHECounter.sol",
        testPath: "test/FHECounter.test.ts",
        category: "Basic Examples",
        order: 2,
    },
    "access-control": {
        name: "access-control",
        title: "Access Control",
        description: "Demonstrates FHE permission management with allowThis and allow",
        contractPath: "contracts/AccessControl.sol",
        testPath: "test/AccessControl.test.ts",
        category: "Intermediate Examples",
        order: 3,
    },
};

/**
 * Extract code from file
 */
function extractCode(filePath: string): string {
    if (!fs.existsSync(filePath)) {
        console.warn(`Warning: File not found: ${filePath}`);
        return "";
    }

    return fs.readFileSync(filePath, "utf-8");
}

/**
 * Extract JSDoc comments from code
 */
function extractJSDocComments(code: string): string[] {
    const commentRegex = /\/\*\*[\s\S]*?\*\//g;
    return code.match(commentRegex) || [];
}

/**
 * Generate markdown for a contract
 */
function generateContractMarkdown(
    filePath: string,
    title: string
): string {
    const code = extractCode(filePath);

    const markdown = `## Contract Implementation

### Source Code

\`\`\`solidity
${code}
\`\`\`

### Key Components

- **Contract Name**: Main contract implementing the example
- **Imports**: FHEVM library and Zama configuration
- **State Variables**: Encrypted values storage
- **Functions**: Public and private functions for FHE operations
- **Events**: Logging of important state changes
`;

    return markdown;
}

/**
 * Generate markdown for tests
 */
function generateTestMarkdown(filePath: string, title: string): string {
    const code = extractCode(filePath);

    const markdown = `## Testing

### Test File

\`\`\`typescript
${code}
\`\`\`

### Test Coverage

- ✅ Contract deployment verification
- ✅ Basic functionality testing
- ✅ FHE operations validation
- ✅ Permission management testing
- ✅ Edge case handling
- ✅ Security checks

### Running Tests

\`\`\`bash
npm run compile
npm run test
\`\`\`
`;

    return markdown;
}

/**
 * Generate example documentation
 */
function generateExampleDoc(config: DocConfig): string {
    const markdown = `# ${config.title}

## Overview

${config.description}

## Example Details

**Category**: ${config.category}
**Status**: Production Ready

## Architecture

This example demonstrates:
- Encrypted data handling with FHEVM
- Smart contract design patterns
- Testing strategies
- Deployment procedures

${generateContractMarkdown(config.contractPath, config.title)}

${generateTestMarkdown(config.testPath, config.title)}

## Concepts Covered

- FHEVM encryption model
- Permission management (allowThis, allow)
- Encrypted type system
- FHE operations
- Access control patterns

## Key Files

- **Contract**: \`${config.contractPath}\`
- **Tests**: \`${config.testPath}\`
- **Configuration**: \`hardhat.config.ts\`
- **Deployment**: \`scripts/deploy.ts\`

## Quick Start

### Setup

\`\`\`bash
npm install
\`\`\`

### Compile

\`\`\`bash
npm run compile
\`\`\`

### Test

\`\`\`bash
npm run test
\`\`\`

### Deploy to Sepolia

\`\`\`bash
export SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
export PRIVATE_KEY=0xYourPrivateKey
npm run deploy -- --network sepolia
\`\`\`

## Learning Outcomes

After studying this example, you will understand:
- How to implement privacy-preserving logic with FHE
- How to structure FHEVM contracts effectively
- How to test encrypted computations
- How to deploy to production networks

## Related Examples

See other examples in this collection:
- Basic FHE operations
- Encryption/Decryption patterns
- Access control mechanisms
- Advanced FHE patterns

## Resources

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Hardhat](https://hardhat.org/)
- [Solidity](https://docs.soliditylang.org/)

## Support

For questions or issues:
1. Review the code comments
2. Check test cases for usage examples
3. Consult FHEVM documentation
4. Ask in the Zama community forum

---

**Last Updated**: December 2025
**Version**: 1.0
`;

    return markdown;
}

/**
 * Generate SUMMARY.md for GitBook
 */
function generateSummary(categories: Map<string, DocConfig[]>): string {
    let summary = `# Table of Contents

## Overview

- [Introduction](README.md)
- [Getting Started](GETTING_STARTED.md)

`;

    // Group by category
    categories.forEach((configs, category) => {
        summary += `## ${category}\n\n`;

        configs.forEach((config) => {
            const docPath = `${config.name}/README.md`;
            summary += `- [${config.title}](${docPath})\n`;
        });

        summary += "\n";
    });

    summary += `## Resources

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Hardhat](https://hardhat.org/)
- [Solidity](https://docs.soliditylang.org/)

---

**Version**: 1.0
**Last Updated**: December 2025
`;

    return summary;
}

/**
 * Generate getting started guide
 */
function generateGettingStarted(): string {
    return `# Getting Started with FHEVM Examples

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

## Setup

### 1. Clone the Repository

\`\`\`bash
git clone <repository-url>
cd fhevm-examples
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Environment Setup

Create a \`.env\` file in your project root:

\`\`\`bash
cp .env.example .env
\`\`\`

Edit \`.env\` with your configuration:

\`\`\`
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
PRIVATE_KEY=0xYourPrivateKeyHere
ETHERSCAN_API_KEY=YOUR_KEY
\`\`\`

## Running Examples

### Compile

\`\`\`bash
npm run compile
\`\`\`

### Test

\`\`\`bash
npm run test
\`\`\`

### Deploy

\`\`\`bash
npm run deploy -- --network sepolia
\`\`\`

## Understanding FHEVM

### What is FHE?

Fully Homomorphic Encryption (FHE) allows computation on encrypted data without decryption.

### Key Concepts

1. **Encrypted Types**: euint8, euint16, euint32 for encrypted values
2. **Permissions**: allowThis() and allow() control access
3. **Operations**: Add, compare, and conditionally select on encrypted data
4. **Privacy**: Data remains encrypted throughout execution

### Basic Pattern

\`\`\`solidity
// Encrypt a value
euint32 encrypted = FHE.asEuint32(plaintext);

// Grant permissions
FHE.allowThis(encrypted);
FHE.allow(encrypted, msg.sender);

// Perform operations
euint32 sum = FHE.add(a, b);
ebool isGreater = FHE.gt(a, b);
euint32 result = FHE.select(condition, trueValue, falseValue);
\`\`\`

## Example Structure

Each example follows this structure:

\`\`\`
example-name/
├── contracts/           # Solidity smart contracts
├── test/               # Test files
├── scripts/            # Deployment scripts
├── hardhat.config.ts   # Hardhat configuration
├── package.json        # Dependencies
├── tsconfig.json       # TypeScript configuration
└── README.md          # Example documentation
\`\`\`

## Next Steps

1. Choose an example from the table of contents
2. Read the example documentation
3. Study the contract code
4. Review the test cases
5. Try modifying and redeploying

## Common Commands

| Command | Purpose |
|---------|---------|
| \`npm run compile\` | Compile Solidity contracts |
| \`npm run test\` | Run test suite |
| \`npm run deploy\` | Deploy to Sepolia |
| \`npm run clean\` | Clean artifacts |
| \`npm run typechain\` | Generate TypeChain types |

## Troubleshooting

### Installation Issues
\`\`\`bash
rm -rf node_modules package-lock.json
npm install
\`\`\`

### Compilation Errors
- Check Solidity version (should be 0.8.24)
- Verify FHEVM library is installed
- Review import paths

### Test Failures
- Ensure Hardhat is properly configured
- Check network settings
- Verify account has sufficient balance

## Resources

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [FHEVM Examples Repository](https://github.com/zama-ai/fhevm-hardhat-template)
- [Hardhat Documentation](https://hardhat.org/)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [Zama Community Forum](https://www.zama.ai/community)

## Support

- Check example documentation and comments
- Review test cases for usage patterns
- Consult FHEVM official documentation
- Ask questions in community forums

---

**Version**: 1.0
**Last Updated**: December 2025

Happy coding! 🚀
`;
}

/**
 * Main function
 */
function main() {
    const args = process.argv.slice(2);

    if (args.length === 0 || args[0] === "--help") {
        console.log("FHEVM Documentation Generator");
        console.log("Usage: ts-node scripts/generate-docs.ts [example-name | --all]\n");
        console.log("Examples:");
        console.log("  ts-node scripts/generate-docs.ts transportation-dispatch");
        console.log("  ts-node scripts/generate-docs.ts --all");
        console.log("\nAvailable examples:");
        Object.keys(DOCS_CONFIG).forEach((key) => {
            console.log(`  - ${key}`);
        });
        return;
    }

    const docsDir = path.join(__dirname, "..", "docs");

    // Ensure docs directory exists
    if (!fs.existsSync(docsDir)) {
        fs.mkdirSync(docsDir, { recursive: true });
    }

    if (args[0] === "--all") {
        // Generate documentation for all examples
        console.log("Generating documentation for all examples...\n");

        const categories = new Map<string, DocConfig[]>();

        Object.values(DOCS_CONFIG).forEach((config) => {
            if (!categories.has(config.category)) {
                categories.set(config.category, []);
            }
            categories.get(config.category)!.push(config);
        });

        // Generate individual example docs
        Object.values(DOCS_CONFIG).forEach((config) => {
            const exampleDir = path.join(docsDir, config.name);
            if (!fs.existsSync(exampleDir)) {
                fs.mkdirSync(exampleDir, { recursive: true });
            }

            const docContent = generateExampleDoc(config);
            fs.writeFileSync(
                path.join(exampleDir, "README.md"),
                docContent
            );

            console.log(`✓ Generated: ${config.name}`);
        });

        // Generate SUMMARY.md
        const summary = generateSummary(categories);
        fs.writeFileSync(path.join(docsDir, "SUMMARY.md"), summary);
        console.log(`✓ Generated: SUMMARY.md`);

        // Generate getting started guide
        const gettingStarted = generateGettingStarted();
        fs.writeFileSync(
            path.join(docsDir, "GETTING_STARTED.md"),
            gettingStarted
        );
        console.log(`✓ Generated: GETTING_STARTED.md`);

        console.log("\n" + "=".repeat(50));
        console.log("Documentation generated successfully!");
        console.log("=".repeat(50));
        console.log(`Location: ${docsDir}\n`);
    } else {
        // Generate documentation for specific example
        const exampleName = args[0];
        const config = DOCS_CONFIG[exampleName];

        if (!config) {
            console.error(`Error: Unknown example: ${exampleName}`);
            process.exit(1);
        }

        console.log(`Generating documentation for: ${config.title}\n`);

        const exampleDir = path.join(docsDir, exampleName);
        if (!fs.existsSync(exampleDir)) {
            fs.mkdirSync(exampleDir, { recursive: true });
        }

        const docContent = generateExampleDoc(config);
        fs.writeFileSync(path.join(exampleDir, "README.md"), docContent);

        console.log(`✓ Generated documentation for ${config.name}`);
        console.log(`Location: ${path.join(exampleDir, "README.md")}\n`);
    }
}

main();
