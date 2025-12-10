#!/usr/bin/env ts-node
/**
 * @fileoverview Create FHEVM Example Repository Generator
 * @description Scaffolds standalone FHEVM example repositories
 *
 * Usage:
 *   ts-node scripts/create-fhevm-example.ts <example-name> <output-directory>
 *   Example: ts-node scripts/create-fhevm-example.ts transportation-dispatch ./output
 */

import * as fs from "fs";
import * as path from "path";
import * as childProcess from "child_process";

/**
 * Configuration for available examples
 */
interface ExampleConfig {
    name: string;
    title: string;
    description: string;
    category: string;
    contractFile: string;
    testFile: string;
    docFile: string;
}

const EXAMPLES_MAP: Record<string, ExampleConfig> = {
    "transportation-dispatch": {
        name: "transportation-dispatch",
        title: "Privacy-Preserving Transportation Dispatch",
        description:
            "A privacy-first logistics optimization system using FHE that allows secure route coordination while keeping sensitive data encrypted",
        category: "advanced",
        contractFile: "contracts/AnonymousTransport.sol",
        testFile: "test/AnonymousTransport.test.ts",
        docFile: "docs/TRANSPORTATION_DISPATCH.md",
    },
    "fhe-counter": {
        name: "fhe-counter",
        title: "FHE Counter",
        description: "A simple encrypted counter demonstrating basic FHE operations",
        category: "basic",
        contractFile: "contracts/FHECounter.sol",
        testFile: "test/FHECounter.test.ts",
        docFile: "docs/FHE_COUNTER.md",
    },
    "access-control": {
        name: "access-control",
        title: "Access Control Example",
        description: "Demonstrates FHE.allow and FHE.allowThis permission management",
        category: "intermediate",
        contractFile: "contracts/AccessControl.sol",
        testFile: "test/AccessControl.test.ts",
        docFile: "docs/ACCESS_CONTROL.md",
    },
};

/**
 * Get example configuration by name
 */
function getExampleConfig(name: string): ExampleConfig | null {
    return EXAMPLES_MAP[name] || null;
}

/**
 * Create directory if it doesn't exist
 */
function ensureDirectory(dir: string): void {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

/**
 * Copy file from source to destination
 */
function copyFile(src: string, dest: string): void {
    const destDir = path.dirname(dest);
    ensureDirectory(destDir);

    if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
    } else {
        console.warn(`Warning: Source file not found: ${src}`);
    }
}

/**
 * Copy template files from base-template
 */
function copyTemplateFiles(outputDir: string, exampleName: string): void {
    const baseTemplateDir = path.join(__dirname, "..", "base-template");

    // Copy configuration files
    copyFile(
        path.join(baseTemplateDir, "package.json"),
        path.join(outputDir, "package.json")
    );
    copyFile(
        path.join(baseTemplateDir, "tsconfig.json"),
        path.join(outputDir, "tsconfig.json")
    );
    copyFile(
        path.join(baseTemplateDir, "hardhat.config.ts"),
        path.join(outputDir, "hardhat.config.ts")
    );

    // Create example contract
    const exampleConfig = getExampleConfig(exampleName);
    if (exampleConfig) {
        createExampleContract(outputDir, exampleName, exampleConfig);
        createExampleTest(outputDir, exampleName, exampleConfig);
    }

    console.log("✓ Template files copied");
}

/**
 * Create example contract file
 */
function createExampleContract(
    outputDir: string,
    exampleName: string,
    config: ExampleConfig
): void {
    const contractDir = path.join(outputDir, "contracts");
    ensureDirectory(contractDir);

    const sourceContract = path.join(
        __dirname,
        "..",
        config.contractFile
    );

    if (fs.existsSync(sourceContract)) {
        copyFile(sourceContract, path.join(contractDir, path.basename(sourceContract)));
    } else {
        // Create placeholder contract
        const placeholderContract = `// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title ${config.title}
 * @dev ${config.description}
 */
contract ${toPascalCase(exampleName)} is ZamaEthereumConfig {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    // Implement your FHE logic here
}
`;

        const contractPath = path.join(
            contractDir,
            `${toPascalCase(exampleName)}.sol`
        );
        fs.writeFileSync(contractPath, placeholderContract);
    }

    console.log("✓ Example contract created");
}

/**
 * Create example test file
 */
function createExampleTest(
    outputDir: string,
    exampleName: string,
    config: ExampleConfig
): void {
    const testDir = path.join(outputDir, "test");
    ensureDirectory(testDir);

    const sourceTest = path.join(__dirname, "..", config.testFile);

    if (fs.existsSync(sourceTest)) {
        copyFile(sourceTest, path.join(testDir, path.basename(sourceTest)));
    } else {
        // Create placeholder test
        const placeholderTest = `import { expect } from "chai";
import { ethers } from "hardhat";

/**
 * Test suite for ${config.title}
 * @chapter ${config.category}
 */
describe("${config.title}", () => {
    let contract: any;
    let owner: any;

    beforeEach(async () => {
        [owner] = await ethers.getSigners();
        const Factory = await ethers.getContractFactory(
            "${toPascalCase(exampleName)}"
        );
        contract = await Factory.deploy();
        await contract.waitForDeployment();
    });

    describe("Deployment", () => {
        it("should deploy successfully", async () => {
            const contractOwner = await contract.owner();
            expect(contractOwner).to.equal(await owner.getAddress());
        });
    });

    // Add more tests here
});
`;

        const testPath = path.join(
            testDir,
            `${toPascalCase(exampleName)}.test.ts`
        );
        fs.writeFileSync(testPath, placeholderTest);
    }

    console.log("✓ Example test created");
}

/**
 * Create README for the generated example
 */
function createReadme(
    outputDir: string,
    exampleName: string,
    config: ExampleConfig
): void {
    const readme = `# ${config.title}

## Overview

${config.description}

## Quick Start

### Installation

\`\`\`bash
npm install
\`\`\`

### Compilation

\`\`\`bash
npm run compile
\`\`\`

### Testing

\`\`\`bash
npm run test
\`\`\`

### Deployment

\`\`\`bash
npm run deploy -- --network sepolia
\`\`\`

## Project Structure

\`\`\`
.
├── contracts/           # Solidity contracts
├── test/               # Test files
├── scripts/            # Deployment scripts
├── hardhat.config.ts   # Hardhat configuration
├── package.json        # Dependencies
├── tsconfig.json       # TypeScript configuration
└── README.md          # This file
\`\`\`

## Key Features

- Full FHEVM integration
- Comprehensive test suite
- TypeScript support
- Sepolia testnet deployment ready

## Files

- **contracts/**: Smart contract implementation
- **test/**: Test suite using Mocha and Chai
- **scripts/**: Deployment and utility scripts

## Network Configuration

Configured for Ethereum Sepolia testnet (Chain ID: 11155111)

Required environment variables in \`.env\`:
\`\`\`
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
PRIVATE_KEY=0xYourPrivateKey
\`\`\`

## Resources

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Hardhat Documentation](https://hardhat.org/)
- [Solidity Documentation](https://docs.soliditylang.org/)

## License

BSD-3-Clause-Clear
`;

    fs.writeFileSync(path.join(outputDir, "README.md"), readme);
    console.log("✓ README created");
}

/**
 * Create .gitignore file
 */
function createGitignore(outputDir: string): void {
    const gitignore = `# Dependencies
node_modules/
package-lock.json
yarn.lock

# Build artifacts
artifacts/
cache/
dist/
build/

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Hardhat
hardhat.config.js
`;

    fs.writeFileSync(path.join(outputDir, ".gitignore"), gitignore);
    console.log("✓ .gitignore created");
}

/**
 * Create .env.example file
 */
function createEnvExample(outputDir: string): void {
    const envExample = `# Network Configuration
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=0xYourPrivateKeyHere

# Optional: Etherscan for verification
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_KEY

# Optional: Alchemy
ALCHEMY_API_KEY=YOUR_ALCHEMY_KEY
`;

    fs.writeFileSync(path.join(outputDir, ".env.example"), envExample);
    console.log("✓ .env.example created");
}

/**
 * Initialize git repository
 */
function initGit(outputDir: string): void {
    try {
        childProcess.execSync("git init", { cwd: outputDir });
        console.log("✓ Git repository initialized");
    } catch (error) {
        console.warn("Warning: Could not initialize git repository");
    }
}

/**
 * Convert kebab-case to PascalCase
 */
function toPascalCase(str: string): string {
    return str
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join("");
}

/**
 * List available examples
 */
function listExamples(): void {
    console.log("\nAvailable Examples:");
    console.log("─".repeat(60));

    Object.entries(EXAMPLES_MAP).forEach(([key, config]) => {
        console.log(`\n${key}`);
        console.log(`  Title: ${config.title}`);
        console.log(`  Category: ${config.category}`);
        console.log(`  ${config.description}`);
    });

    console.log("\n" + "─".repeat(60));
}

/**
 * Main function
 */
async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
        console.log("FHEVM Example Repository Generator");
        console.log("Usage: ts-node scripts/create-fhevm-example.ts <example-name> <output-dir>\n");
        listExamples();
        console.log("\nUsage Examples:");
        console.log("  ts-node scripts/create-fhevm-example.ts transportation-dispatch ./my-example");
        console.log("  ts-node scripts/create-fhevm-example.ts fhe-counter ./output/counter");
        return;
    }

    const exampleName = args[0];
    const outputDir = args[1] || `./${exampleName}`;

    const exampleConfig = getExampleConfig(exampleName);
    if (!exampleConfig) {
        console.error(`Error: Unknown example: ${exampleName}`);
        listExamples();
        process.exit(1);
    }

    console.log(`\nGenerating example: ${exampleConfig.title}`);
    console.log(`Output directory: ${outputDir}\n`);

    try {
        ensureDirectory(outputDir);
        copyTemplateFiles(outputDir, exampleName);
        createReadme(outputDir, exampleName, exampleConfig);
        createGitignore(outputDir);
        createEnvExample(outputDir);
        initGit(outputDir);

        console.log("\n" + "=".repeat(60));
        console.log("✓ Example repository created successfully!");
        console.log("=".repeat(60));
        console.log("\nNext steps:");
        console.log(`  cd ${outputDir}`);
        console.log("  npm install");
        console.log("  npm run compile");
        console.log("  npm run test");
        console.log("\n");
    } catch (error) {
        console.error("Error creating example repository:", error);
        process.exit(1);
    }
}

main().catch((error) => {
    console.error("Error:", error);
    process.exit(1);
});
