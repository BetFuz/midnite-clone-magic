// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title BetLedger
 * @dev Immutable audit trail for high-value bet settlements (≥₦1M)
 * @notice Records bet hashes and win amounts on Polygon testnet (Mumbai)
 */
contract BetLedger {
    struct BetRecord {
        uint256 winAmount;
        uint256 timestamp;
        address recorder;
    }

    // Mapping: betHash => BetRecord
    mapping(bytes32 => BetRecord) public ledger;

    // Total number of bets recorded
    uint256 public totalBets;

    // Total win amount recorded (in naira)
    uint256 public totalWinAmount;

    // Event emitted when a bet is recorded
    event BetRecorded(
        bytes32 indexed betHash,
        uint256 winAmount,
        uint256 timestamp,
        address indexed recorder
    );

    /**
     * @dev Record a bet settlement on-chain
     * @param betHash SHA-256 hash of the bet slip ID
     * @param winAmount Win amount in naira (integer, no decimals)
     * @return blockNumber Block number where bet was recorded
     */
    function recordBet(bytes32 betHash, uint256 winAmount) external returns (uint256) {
        require(winAmount >= 1_000_000, "Win amount must be >= 1M naira");
        require(ledger[betHash].timestamp == 0, "Bet already recorded");

        ledger[betHash] = BetRecord({
            winAmount: winAmount,
            timestamp: block.timestamp,
            recorder: msg.sender
        });

        totalBets++;
        totalWinAmount += winAmount;

        emit BetRecorded(betHash, winAmount, block.timestamp, msg.sender);

        return block.number;
    }

    /**
     * @dev Retrieve bet record from ledger
     * @param betHash SHA-256 hash of the bet slip ID
     * @return winAmount Win amount in naira
     * @return timestamp Unix timestamp when bet was recorded
     * @return recorder Address that recorded the bet
     */
    function getBetRecord(bytes32 betHash)
        external
        view
        returns (
            uint256 winAmount,
            uint256 timestamp,
            address recorder
        )
    {
        BetRecord memory record = ledger[betHash];
        return (record.winAmount, record.timestamp, record.recorder);
    }

    /**
     * @dev Check if a bet has been recorded
     * @param betHash SHA-256 hash of the bet slip ID
     * @return exists True if bet exists in ledger
     */
    function betExists(bytes32 betHash) external view returns (bool) {
        return ledger[betHash].timestamp != 0;
    }

    /**
     * @dev Get ledger statistics
     * @return total Total number of bets recorded
     * @return totalAmount Total win amount recorded (naira)
     */
    function getStats() external view returns (uint256 total, uint256 totalAmount) {
        return (totalBets, totalWinAmount);
    }
}
