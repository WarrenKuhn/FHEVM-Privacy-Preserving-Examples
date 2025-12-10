// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

/**
 * @title Example
 * @dev Base example contract using FHEVM
 * Replace this with your specific contract implementation
 */

import { FHE, euint32, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract Example is ZamaEthereumConfig {
    /**
     * @notice Example state variable
     * @dev Demonstrates storing encrypted values
     */
    euint32 private _exampleValue;

    /**
     * @notice Owner of the contract
     */
    address public owner;

    /**
     * @notice Event emitted when example function is called
     */
    event ExampleEvent(address indexed caller, uint256 timestamp);

    /**
     * @notice Initialize the contract
     */
    constructor() {
        owner = msg.sender;
        _exampleValue = FHE.asEuint32(0);
    }

    /**
     * @notice Modifier to restrict functions to owner
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    /**
     * @notice Example function that updates encrypted value
     * @param newValue The new value to set
     */
    function setExampleValue(uint32 newValue) external {
        _exampleValue = FHE.asEuint32(newValue);

        // Grant permissions
        FHE.allowThis(_exampleValue);
        FHE.allow(_exampleValue, msg.sender);

        emit ExampleEvent(msg.sender, block.timestamp);
    }

    /**
     * @notice Example function that performs FHE computation
     * @param a First encrypted value
     * @param b Second encrypted value
     * @dev This is a placeholder - implement your FHE logic here
     */
    function exampleComputation(euint32 a, euint32 b) external pure returns (euint32) {
        return FHE.add(a, b);
    }

    /**
     * @notice Get contract metadata
     * @return The owner address
     * @return The contract creation timestamp
     */
    function getInfo() external view returns (address, uint256) {
        return (owner, block.timestamp);
    }
}
