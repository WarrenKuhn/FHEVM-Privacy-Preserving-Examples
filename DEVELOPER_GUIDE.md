# Developer Guide: Creating and Maintaining FHEVM Examples

## Table of Contents

1. [Project Structure](#project-structure)
2. [Adding New Examples](#adding-new-examples)
3. [Documentation Standards](#documentation-standards)
4. [Automation Tools](#automation-tools)
5. [Testing Guidelines](#testing-guidelines)
6. [Code Review Process](#code-review-process)
7. [Version Management](#version-management)
8. [Community Contributions](#community-contributions)

---

## Project Structure

### Directory Organization

```
TransportationDispatchFHE/
├── base-template/                    # Foundation for all examples
│   ├── contracts/
│   │   └── Example.sol              # Base contract template
│   ├── test/
│   │   └── Example.test.ts          # Base test template
│   ├── scripts/
│   │   └── deploy.ts                # Deployment template
│   ├── hardhat.config.ts
│   ├── package.json
│   └── tsconfig.json
│
├── scripts/                          # Automation tools
│   ├── create-fhevm-example.ts      # Scaffold new examples
│   └── generate-docs.ts             # Generate documentation
│
├── docs/                             # Generated documentation
│   ├── SUMMARY.md                   # GitBook index
│   ├── GETTING_STARTED.md           # Quick start guide
│   └── [example-name]/
│       └── README.md                # Example documentation
│
├── contracts/                        # Example contracts (source)
│   ├── AnonymousTransport.sol       # Transportation dispatch
│   ├── FHECounter.sol               # Counter example
│   └── AccessControl.sol            # Access control example
│
├── test/                             # Example tests (source)
│   ├── AnonymousTransport.test.ts
│   ├── FHECounter.test.ts
│   └── AccessControl.test.ts
│
├── COMPETITION_SUBMISSION.md         # Main submission
├── TECHNICAL_DOCUMENTATION.md        # Technical specs
├── IMPLEMENTATION_GUIDE.md           # Setup guide
├── PROJECT_REQUIREMENTS.md           # Requirements
├── QUICK_REFERENCE.md               # Quick lookup
├── DEVELOPER_GUIDE.md               # This file
├── README.md                        # User-facing overview
└── package.json                     # Root dependencies
```

### Key Design Principles

- **Modularity**: Each example is self-contained and independently deployable
- **Consistency**: All examples follow the same structure and patterns
- **Documentation**: Examples include comprehensive inline documentation
- **Testing**: All examples have thorough test coverage
- **Reusability**: Base template provides common functionality
- **Automation**: Scripts handle repetitive tasks

---

## Adding New Examples

### Step 1: Create Example Contract

Create a new contract file in `contracts/`:

```solidity
// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title YourExampleContract
 * @dev Demonstrates [key FHE concept]
 * @chapter [category-name]
 */
contract YourExampleContract is ZamaEthereumConfig {
    // Implementation here
}
```

### Step 2: Create Comprehensive Tests

Create corresponding test file in `test/`:

```typescript
import { expect } from "chai";
import { ethers } from "hardhat";

/**
 * Test suite for YourExampleContract
 * @chapter [category-name]
 */
describe("YourExampleContract", () => {
    // Test implementation
});
```

**Test Requirements**:
- Minimum 80% code coverage
- Unit tests for all functions
- Integration tests for complex flows
- Edge case testing
- Error scenario testing

### Step 3: Register Example in Configuration

Add your example to `scripts/create-fhevm-example.ts`:

```typescript
const EXAMPLES_MAP: Record<string, ExampleConfig> = {
    "your-example": {
        name: "your-example",
        title: "Your Example Title",
        description: "Clear description of what this example demonstrates",
        category: "category-name",
        contractFile: "contracts/YourExample.sol",
        testFile: "test/YourExample.test.ts",
        docFile: "docs/YOUR_EXAMPLE.md",
    },
    // ... other examples
};
```

Add to `scripts/generate-docs.ts`:

```typescript
const DOCS_CONFIG: Record<string, DocConfig> = {
    "your-example": {
        name: "your-example",
        title: "Your Example Title",
        description: "Clear description of what this example demonstrates",
        contractPath: "contracts/YourExample.sol",
        testPath: "test/YourExample.test.ts",
        category: "Category Name",
        order: 10,  // Ordering in docs
    },
    // ... other examples
};
```

### Step 4: Create Example-Specific Documentation

Create documentation file `docs/YOUR_EXAMPLE.md`:

```markdown
# Your Example Title

## Overview

Clear explanation of what this example demonstrates.

## Concepts Covered

- Concept 1
- Concept 2
- Concept 3

## Key Code

### Contract Overview

[Brief contract explanation]

### Important Functions

[Document key functions]

## Testing

[Explain test strategy]

## Use Cases

[Real-world applications]

## Common Pitfalls

[Mistakes to avoid]

## Next Steps

[Learning progression]
```

### Step 5: Test Generated Repository

```bash
# Generate the standalone example
ts-node scripts/create-fhevm-example.ts your-example ./test-output/your-example

# Navigate to generated repo
cd test-output/your-example

# Install and test
npm install
npm run compile
npm run test
```

---

## Documentation Standards

### Code Comments

Use JSDoc/TSDoc style comments for clarity:

```solidity
/**
 * @notice Brief description of function
 * @dev Detailed technical explanation
 * @param paramName Parameter description
 * @return Return value description
 */
function exampleFunction(uint256 paramName) external returns (uint256) {
    // Implementation
}
```

### File Headers

Include file headers:

```solidity
// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

/**
 * @title ContractName
 * @notice User-facing description
 * @dev Technical implementation notes
 * @chapter category-name
 */
```

### Inline Documentation

Explain complex logic:

```solidity
// FHE operations - multiply then select
euint32 baseEfficiency = FHE.mul(urgency, priority);
ebool needsBoost = FHE.gt(weight, FHE.asEuint32(threshold));
return FHE.select(needsBoost, boostedResult, baseResult);
```

### README Standards

Each example README should include:

- Clear overview of concepts
- Quick start instructions
- Project structure explanation
- Key features list
- Architecture diagram (if complex)
- Learning outcomes
- Related examples cross-references

---

## Automation Tools

### Creating Examples Programmatically

```bash
# Create single example
ts-node scripts/create-fhevm-example.ts example-name ./output

# Get help and list available examples
ts-node scripts/create-fhevm-example.ts --help
```

**What the script does**:
1. Creates project directory structure
2. Copies base template files
3. Copies example contract and tests
4. Generates README
5. Creates .gitignore and .env.example
6. Initializes git repository

### Generating Documentation

```bash
# Generate all documentation
ts-node scripts/generate-docs.ts --all

# Generate documentation for specific example
ts-node scripts/generate-docs.ts example-name
```

**What the script does**:
1. Extracts code from contract files
2. Extracts code from test files
3. Generates markdown documentation
4. Creates GitBook-compatible SUMMARY.md
5. Creates getting started guide

### Adding New Automation Tools

To add a new tool:

1. Create TypeScript file in `scripts/`
2. Add proper JSDoc headers
3. Implement main function
4. Add to package.json scripts
5. Document in this guide

---

## Testing Guidelines

### Test Structure

```typescript
describe("Feature Category", () => {
    let contract: ContractType;
    let owner: Signer;
    let user: Signer;

    beforeEach(async () => {
        // Setup: Deploy contract
    });

    describe("Specific Functionality", () => {
        it("should achieve expected behavior", async () => {
            // Arrange: Setup test state
            // Act: Execute function
            // Assert: Verify results
        });
    });
});
```

### Test Categories

**Unit Tests** - Individual functions:
```typescript
it("should encrypt value correctly", async () => {
    // Test single function
});
```

**Integration Tests** - Multiple functions together:
```typescript
it("should complete full workflow", async () => {
    // Test multiple functions in sequence
});
```

**Security Tests** - Access control and permissions:
```typescript
it("should reject unauthorized calls", async () => {
    await expect(contract.connect(hacker).sensitiveFunction()).to.be.reverted;
});
```

**Edge Case Tests** - Boundary conditions:
```typescript
it("should handle maximum values", async () => {
    await contract.setValue(ethers.MaxUint32);
});
```

### Coverage Requirements

- **Target**: >90% statement coverage
- **Minimum**: >80% for acceptance
- **Commands**:
  ```bash
  npm run test -- --coverage
  ```

### Testing FHE Operations

```typescript
it("should perform encrypted addition", async () => {
    // Setup encrypted values
    const tx = await contract.performAddition(encryptedA, encryptedB);

    // Verify transaction succeeds
    const receipt = await tx.wait();
    expect(receipt?.status).to.equal(1);

    // Test with expected values
});
```

---

## Code Review Process

### Pre-Submission Checklist

- [ ] All tests pass locally
- [ ] Coverage >90%
- [ ] No compiler warnings
- [ ] Code follows style guidelines
- [ ] Documentation is complete
- [ ] Examples run successfully
- [ ] No hardcoded secrets
- [ ] SPDX license header present

### Review Criteria

1. **Correctness**
   - FHE operations are semantically correct
   - Access control is properly implemented
   - No security vulnerabilities

2. **Clarity**
   - Code is well-commented
   - Variable names are meaningful
   - Logic is easy to follow

3. **Completeness**
   - All features are tested
   - Documentation is thorough
   - Examples are functional

4. **Quality**
   - Follows Solidity style guide
   - Follows TypeScript conventions
   - No unnecessary complexity

### Peer Review Template

```markdown
## Review Summary
- ✅ Functionality works as expected
- ✅ Code quality is good
- ⚠️ Minor suggestion: [feedback]
- ❌ Blocker: [issue to fix]

## Specific Comments
- Line X: [specific feedback]
- Function Y: [general feedback]

## Questions
- Does this follow FHE best practices?
- Have you considered [alternative approach]?

## Approval
- [ ] Approved pending changes
- [ ] Approved
- [ ] Request changes
```

---

## Version Management

### Semantic Versioning

Format: `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes to API or behavior
- **MINOR**: New features, backwards compatible
- **PATCH**: Bug fixes

### Managing Dependencies

```bash
# Check outdated packages
npm outdated

# Update @fhevm/solidity
npm install @fhevm/solidity@latest

# Update all dependencies
npm update

# Update specific package
npm install package-name@version
```

### Compatibility Matrix

Track which examples work with which versions:

| Example | FHEVM ^0.8 | FHEVM ^0.9 | Status |
|---------|-----------|-----------|--------|
| Transportation | ✅ | ✅ | Active |
| Counter | ✅ | ✅ | Active |
| New Feature | ❌ | ✅ | Updated |

---

## Community Contributions

### How to Contribute

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/my-example`
3. **Develop your example**
4. **Test thoroughly**
5. **Submit pull request**

### Contribution Guidelines

- Follow existing code style
- Include comprehensive tests
- Write clear documentation
- Update automation configurations
- Provide example usage

### Contribution Template

```markdown
## Description
Brief explanation of the example

## What problem does this solve?
Real-world use case

## Testing
How to verify this works

## Concepts Demonstrated
- Concept 1
- Concept 2

## Checklist
- [ ] Tests pass
- [ ] Documentation complete
- [ ] Code reviewed
- [ ] Examples work standalone
```

### Community Recognition

Acknowledge contributions:

```markdown
## Contributors
- [Name] - [Example Name]
- [Name] - [Feature]
```

---

## Best Practices

### Contract Development

✅ **DO**:
- Use detailed comments explaining FHE operations
- Grant both allowThis() and allow() permissions
- Include comprehensive error messages
- Test edge cases thoroughly
- Follow gas optimization patterns

❌ **DON'T**:
- Decrypt values unnecessarily
- Forget permission grants
- Use complex nested conditions
- Skip testing
- Hardcode values

### Testing

✅ **DO**:
- Test success and failure paths
- Use descriptive test names
- Test with multiple users/accounts
- Include edge cases
- Mock external calls

❌ **DON'T**:
- Use magic numbers
- Skip error scenarios
- Assume success
- Test implementation details
- Write untestable code

### Documentation

✅ **DO**:
- Explain the "why" not just "what"
- Use code examples
- Include diagrams where helpful
- Update docs with code
- Provide multiple learning paths

❌ **DON'T**:
- Assume reader knowledge
- Use unclear terminology
- Create outdated docs
- Document trivial code
- Omit examples

---

## Troubleshooting Guide

### Common Issues

**Issue**: Tests failing after FHEVM update
**Solution**:
1. Check FHEVM changelog
2. Update contracts to new API
3. Regenerate documentation
4. Run full test suite

**Issue**: Generated example won't compile
**Solution**:
1. Verify base-template files are complete
2. Check import paths
3. Ensure hardhat.config.ts is correct
4. Try `npm install` and `npm run compile`

**Issue**: Documentation not generating
**Solution**:
1. Check file paths exist
2. Verify script configuration
3. Ensure proper JSDoc comments
4. Try deleting `docs/` and regenerating

---

## Maintenance Checklist

### Weekly
- [ ] Check for security advisories
- [ ] Monitor community issues
- [ ] Review pull requests

### Monthly
- [ ] Update dependencies
- [ ] Run full test suite
- [ ] Check code coverage
- [ ] Review new FHEVM features

### Quarterly
- [ ] Major version updates
- [ ] Documentation refresh
- [ ] Performance optimization
- [ ] Community feedback review

---

## Resources

- **FHEVM Docs**: https://docs.zama.ai/fhevm
- **Hardhat**: https://hardhat.org/
- **Solidity Style Guide**: https://docs.soliditylang.org/style-guide
- **Zama Community**: https://www.zama.ai/community

---

**Document Version**: 1.0
**Last Updated**: December 2025
**Status**: Active

For questions or clarifications, please consult the FHEVM documentation or community forums.
