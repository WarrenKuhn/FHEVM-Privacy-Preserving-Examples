# Getting Started with FHEVM Examples

## Welcome to FHEVM Examples

This comprehensive collection demonstrates how to build privacy-preserving smart contracts using Fully Homomorphic Encryption (FHE). From simple encrypted counters to complex transportation logistics systems, these examples will teach you everything you need to know about FHEVM development.

---

## Prerequisites

Before getting started, ensure you have:

- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 9.0.0 or higher
- **Git**: Latest version for version control
- **A text editor**: VS Code recommended
- **Basic Solidity knowledge**: Understanding of smart contracts
- **Ethereum basics**: Knowledge of accounts, transactions, and gas

## Installation

### 1. Clone or Download

```bash
# Clone repository
git clone <repository-url>
cd TransportationDispatchFHE

# Or navigate to your downloaded folder
cd TransportationDispatchFHE
```

### 2. Install Root Dependencies

```bash
npm install
```

This installs tools and scripts needed for example generation and documentation.

### 3. Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Sepolia Testnet
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=0xYourPrivateKeyHere

# Optional: For contract verification
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_KEY

# Optional: Alchemy RPC
ALCHEMY_API_KEY=YOUR_ALCHEMY_KEY
```

> ⚠️ **Important**: Never commit your `.env` file with real private keys to version control!

---

## Understanding the Project Structure

```
TransportationDispatchFHE/
├── base-template/                    # Foundation template
│   ├── contracts/                    # Base contract template
│   ├── test/                         # Base test template
│   ├── scripts/                      # Base deployment script
│   ├── hardhat.config.ts
│   ├── package.json
│   └── tsconfig.json
│
├── scripts/                          # Automation tools
│   ├── create-fhevm-example.ts      # Generate examples
│   └── generate-docs.ts             # Generate documentation
│
├── docs/                             # Documentation
│   ├── SUMMARY.md                   # Table of contents
│   ├── GETTING_STARTED.md           # This file
│   └── [examples]/                  # Example-specific docs
│
├── contracts/                        # Example contracts
│   ├── AnonymousTransport.sol       # Transportation system
│   ├── FHECounter.sol               # Basic counter
│   └── AccessControl.sol            # Access control demo
│
├── test/                             # Example tests
│   ├── AnonymousTransport.test.ts
│   ├── FHECounter.test.ts
│   └── AccessControl.test.ts
│
└── [Documentation Files]             # Guides and references
    ├── COMPETITION_SUBMISSION.md
    ├── TECHNICAL_DOCUMENTATION.md
    ├── IMPLEMENTATION_GUIDE.md
    └── ...more files
```

---

## Quick Start Paths

### Path 1: I'm a Beginner

Start here to learn FHEVM basics:

1. **Read**: [Quick Reference Guide](../QUICK_REFERENCE.md)
2. **Learn**: Study [FHE Counter Example](fhe-counter/README.md)
3. **Implement**: Create your own encrypted counter
4. **Next**: Move to [Access Control Example](access-control/README.md)

**Estimated Time**: 1-2 hours

### Path 2: I Have Solidity Experience

Dive into intermediate and advanced topics:

1. **Review**: [Technical Documentation](../TECHNICAL_DOCUMENTATION.md)
2. **Study**: [Access Control Example](access-control/README.md)
3. **Explore**: [Transportation Dispatch System](transportation-dispatch/README.md)
4. **Implement**: Build your own privacy-preserving smart contract

**Estimated Time**: 2-4 hours

### Path 3: I Want to Build Something

Jump straight into development:

1. **Setup**: Follow [Implementation Guide](../IMPLEMENTATION_GUIDE.md)
2. **Choose**: Pick an example that's closest to your use case
3. **Extend**: Modify the example for your needs
4. **Deploy**: Deploy to Sepolia testnet
5. **Share**: Contribute back to the community

**Estimated Time**: 2-6 hours depending on complexity

---

## Running Your First Example

### Option A: Using Generated Repository

#### Step 1: Generate Example Repository

```bash
# Create standalone transportation dispatch example
ts-node scripts/create-fhevm-example.ts transportation-dispatch ./my-example

# Navigate to the generated repository
cd my-example

# Install dependencies
npm install

# Verify compilation
npm run compile

# Run tests
npm run test
```

#### Step 2: Deploy to Testnet

```bash
# Set network environment variable
export SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
export PRIVATE_KEY=0xYourPrivateKey

# Deploy
npm run deploy -- --network sepolia
```

#### Step 3: Interact with Contract

```typescript
// See generated example files for how to interact
// Check hardhat tasks or write custom scripts
```

### Option B: Using Source Examples

#### Step 1: Compile Contracts

```bash
# From project root
npm run compile
```

#### Step 2: Run Tests

```bash
# All tests
npm run test

# Specific test file
npm run test -- test/FHECounter.test.ts

# With coverage
npm run test -- --coverage
```

#### Step 3: Start Local Network (Optional)

```bash
# Terminal 1: Start local Hardhat node
npx hardhat node

# Terminal 2: Deploy and interact
npx hardhat run scripts/deploy.ts --network localhost
```

---

## Key Concepts to Understand

### 1. Encrypted Types

FHEVM provides encrypted integer types:

```solidity
euint8  value8;    // 8-bit encrypted unsigned integer
euint16 value16;   // 16-bit encrypted unsigned integer
euint32 value32;   // 32-bit encrypted unsigned integer
ebool   flag;      // Encrypted boolean
```

### 2. Encryption

Convert plaintext to encrypted:

```solidity
uint32 plainValue = 42;
euint32 encrypted = FHE.asEuint32(plainValue);
```

### 3. Permissions (CRITICAL!)

Always grant permissions to use encrypted values:

```solidity
// Grant contract permission
FHE.allowThis(encryptedValue);

// Grant user permission
FHE.allow(encryptedValue, msg.sender);
```

### 4. Operations

Perform computations on encrypted data:

```solidity
// Arithmetic
euint32 sum = FHE.add(a, b);
euint32 product = FHE.mul(a, b);

// Comparisons
ebool isGreater = FHE.gt(a, b);

// Conditionals
euint32 result = FHE.select(condition, trueValue, falseValue);
```

---

## Common Tasks

### Task: Compile Contracts

```bash
npm run compile
```

**What it does**:
- Compiles all Solidity files in `contracts/`
- Generates ABI and bytecode
- Creates TypeChain types

### Task: Run Tests

```bash
npm run test

# With specific filter
npm run test -- --grep "Route"

# With coverage report
npm run test -- --coverage

# Detailed output
npm run test -- --reporter spec
```

**What it does**:
- Executes all test files
- Verifies contract behavior
- Reports coverage

### Task: Deploy Contract

```bash
# To Sepolia
npm run deploy -- --network sepolia

# To local network
npx hardhat run scripts/deploy.ts --network localhost

# To hardhat
npx hardhat run scripts/deploy.ts --network hardhat
```

**What it does**:
- Deploys contract to selected network
- Logs deployment address
- Verifies deployment

### Task: Generate Example Repository

```bash
ts-node scripts/create-fhevm-example.ts example-name ./output-dir
```

**What it does**:
- Creates standalone repository
- Copies template files
- Adds example code
- Generates README

### Task: Generate Documentation

```bash
# Single example
ts-node scripts/generate-docs.ts example-name

# All examples
ts-node scripts/generate-docs.ts --all
```

**What it does**:
- Extracts code from contracts
- Generates markdown documentation
- Creates SUMMARY.md index
- Produces guides

---

## Troubleshooting

### Problem: Installation Fails

```
Error: npm install fails
```

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Problem: Compilation Error

```
Error: Cannot find module '@fhevm/solidity'
```

**Solution**:
```bash
# Reinstall FHEVM packages
npm install @fhevm/solidity@latest @fhevm/hardhat-plugin@latest

# Or reinstall everything
npm ci
```

### Problem: Tests Won't Run

```
Error: Cannot find typechain types
```

**Solution**:
```bash
# Recompile
npm run compile

# Clear cache
npm run clean

# Reinstall
npm install
```

### Problem: Deployment Fails

```
Error: Insufficient funds or invalid RPC URL
```

**Solution**:
```bash
# Check .env file is configured
cat .env

# Verify RPC URL is valid
curl https://sepolia.infura.io/v3/YOUR_KEY

# Ensure you have testnet ETH
# Get from faucet: https://sepoliafaucet.com
```

### Problem: Script Not Found

```
Error: ts-node: command not found
```

**Solution**:
```bash
# Install ts-node globally
npm install -g ts-node

# Or run via npx
npx ts-node scripts/create-fhevm-example.ts example-name ./output
```

---

## Learning Resources

### Inside This Repository

- **COMPETITION_SUBMISSION.md**: Full project overview
- **TECHNICAL_DOCUMENTATION.md**: Deep dive into FHEVM
- **IMPLEMENTATION_GUIDE.md**: Development walkthrough
- **QUICK_REFERENCE.md**: Command and function reference
- **DEVELOPER_GUIDE.md**: How to extend the project
- **AUTOMATION_TOOLS.md**: Script documentation

### External Resources

- **FHEVM Official Documentation**: https://docs.zama.ai/fhevm
- **Hardhat Documentation**: https://hardhat.org/
- **Solidity Documentation**: https://docs.soliditylang.org/
- **Zama Website**: https://www.zama.ai/
- **Community Forum**: https://www.zama.ai/community
- **Discord Server**: https://discord.com/invite/zama

### Helpful Patterns

See example code in:
- `contracts/` - Production examples
- `test/` - Usage patterns and test strategies
- Generated examples - Complete standalone repositories

---

## Next Steps

### Short Term (Today)

- [ ] Install dependencies
- [ ] Run tests to verify setup
- [ ] Read one example's documentation
- [ ] Study the example code

### Medium Term (This Week)

- [ ] Complete one example tutorial
- [ ] Modify an example to test understanding
- [ ] Create your own simple encrypted contract
- [ ] Deploy to testnet

### Long Term (This Month)

- [ ] Build a real-world application
- [ ] Contribute back to project
- [ ] Share your learnings
- [ ] Create your own examples

---

## Getting Help

### Debugging Steps

1. **Check Documentation**: Review relevant documentation file
2. **Review Examples**: Look for similar code in existing examples
3. **Run Tests**: See test cases for usage patterns
4. **Search Issues**: Check repository issues for similar problems
5. **Ask Community**: Post in forums with detailed context

### Creating Minimal Reproducible Example

When asking for help, provide:

```typescript
// Contract code
contract MyContract {
    // Minimal code that reproduces the issue
}

// Test case
describe("Issue", () => {
    it("reproduces the problem", async () => {
        // Steps to reproduce
    });
});

// Error message
// Full error output
```

### Community Support

- **GitHub Issues**: Report bugs
- **Discussion Forum**: Ask questions
- **Discord**: Real-time chat with community
- **Stack Exchange**: Blockchain-specific questions

---

## Tips for Success

✅ **DO**:
- Read the documentation thoroughly
- Study working examples before building
- Test extensively before deploying
- Start simple and gradually increase complexity
- Save private keys securely
- Join the community

❌ **DON'T**:
- Skip the tutorial
- Hardcode private keys
- Deploy untested contracts
- Assume you understand FHE without studying
- Copy code without understanding
- Use mainnet before testing thoroughly

---

## Quick Reference Commands

```bash
# Setup
npm install
npm run compile

# Testing
npm run test
npm run test -- --coverage

# Deployment
npm run deploy -- --network sepolia

# Generation
ts-node scripts/create-fhevm-example.ts example-name ./output
ts-node scripts/generate-docs.ts --all

# Cleanup
npm run clean
rm -rf node_modules
```

---

## Checklist for New Developers

Before you start building:

- [ ] Node.js and npm installed
- [ ] Repository cloned/downloaded
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created and configured
- [ ] Tests running successfully (`npm run test`)
- [ ] At least one example understood
- [ ] Sepolia testnet ETH obtained
- [ ] Wallet configured in `.env`

---

## What's Next?

You're ready to start! Choose your path:

**Beginner?** → Start with [FHE Counter Example](fhe-counter/README.md)

**Experienced?** → Explore [Transportation Dispatch Example](transportation-dispatch/README.md)

**Want to build?** → Follow [Implementation Guide](../IMPLEMENTATION_GUIDE.md)

**Want to extend?** → Read [Developer Guide](../DEVELOPER_GUIDE.md)

---

## Project Roadmap

- ✅ Basic examples complete
- ✅ Advanced example (Transportation Dispatch)
- ✅ Comprehensive documentation
- 🔄 Community contributions (your input!)
- 🔜 More advanced patterns
- 🔜 Integration examples

---

**Happy Coding!** 🚀

For any questions, check the documentation or reach out to the community.

---

**Version**: 1.0
**Last Updated**: December 2025
**Status**: Production Ready

[Back to Table of Contents](SUMMARY.md)
