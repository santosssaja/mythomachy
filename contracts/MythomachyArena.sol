// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title MythomachyArena
 * @dev On-chain arena state, summon temple (gacha with pity), matchmaking, and match settlement
 * Optimized for Monad Testnet (Chain ID 10143) with parallel execution friendly state mappings.
 */
contract MythomachyArena {
    // Bit 0..7 (value 255 = 0x00FF) unlocked by default for the first 8 Vanguard characters.
    // Bit 8 = Gilgamesh (ID 8), Bit 9 = Nyi Roro Kidul (ID 9), Bit 10 = Chronos-Aethelgard (ID 10).
    uint16 public constant DEFAULT_UNLOCKED_MASK = 0x00FF; // 0000000011111111 in binary
    uint16 public constant ALL_UNLOCKED_MASK = 0x07FF;     // 0000011111111111 (11 characters)

    struct PlayerProfile {
        uint16 unlockedMask;
        uint8 pityCounter;
        uint32 relicShards;
        uint32 victories;
        uint32 matchesPlayed;
    }

    struct Room {
        bytes6 roomCode;
        address host;
        address challenger;
        uint8 mapId;
        bool isPrivate;
        bool isActive;
        address winner;
    }

    mapping(address => PlayerProfile) private profiles;
    mapping(bytes6 => Room) public rooms;
    bytes6[] public publicRoomCodes;

    event SummonExecuted(
        address indexed player,
        bool isNewLegend,
        uint8 legendId,
        uint32 totalRelicShards,
        uint16 updatedMask
    );
    event RoomCreated(bytes6 indexed roomCode, address indexed host, bool isPrivate, uint8 mapId);
    event RoomJoined(bytes6 indexed roomCode, address indexed challenger);
    event MatchSettled(bytes6 indexed roomCode, address indexed winner, uint8 hostLegend, uint8 challengerLegend);

    // Fetch player profile (automatically activates first 8 legends for new accounts)
    function getPlayerProfile(address player) external view returns (
        uint16 unlockedMask,
        uint8 pityCounter,
        uint32 relicShards,
        uint32 victories,
        uint32 matchesPlayed
    ) {
        PlayerProfile memory p = profiles[player];
        uint16 mask = p.unlockedMask == 0 ? DEFAULT_UNLOCKED_MASK : (p.unlockedMask | DEFAULT_UNLOCKED_MASK);
        return (mask, p.pityCounter, p.relicShards, p.victories, p.matchesPlayed);
    }

    // On-Chain Gacha Summon ("Kuil Pemanggilan") with guaranteed Apex Legend by pull 4 or 75 Shards
    function summonApexLegend(uint256 clientSeed) external payable returns (bool isNewLegend, uint8 legendId) {
        PlayerProfile storage p = profiles[msg.sender];
        if (p.unlockedMask == 0) {
            p.unlockedMask = DEFAULT_UNLOCKED_MASK;
        }

        p.pityCounter += 1;

        // Pseudo-random on-chain source utilizing block context and entropy
        uint256 rand = uint256(
            keccak256(
                abi.encodePacked(
                    block.prevrandao,
                    block.timestamp,
                    msg.sender,
                    p.pityCounter,
                    p.relicShards,
                    clientSeed
                )
            )
        );

        // 35% base chance of Apex Legend, OR 100% guaranteed if pityCounter >= 4
        bool hitJackpot = (rand % 100 < 35) || (p.pityCounter >= 4);

        if (hitJackpot && (p.unlockedMask & ALL_UNLOCKED_MASK) != ALL_UNLOCKED_MASK) {
            p.pityCounter = 0;

            // Search for unowned Apex character (ID 8, 9, 10)
            uint8[3] memory apexIds = [uint8(8), uint8(9), uint8(10)];
            uint8 startIdx = uint8((rand >> 8) % 3);

            for (uint8 i = 0; i < 3; i++) {
                uint8 candidate = apexIds[(startIdx + i) % 3];
                if ((p.unlockedMask & uint16(1 << candidate)) == 0) {
                    p.unlockedMask |= uint16(1 << candidate);
                    emit SummonExecuted(msg.sender, true, candidate, p.relicShards, p.unlockedMask);
                    return (true, candidate);
                }
            }
        }

        // When not unlocking an apex legend or all are owned, award 25 Relic Shards
        uint8 pickedId = uint8(8 + ((rand >> 16) % 3));
        p.relicShards += 25;

        // If player has accumulated 75 Relic Shards, redeem for 1 missing Apex Legend
        if (p.relicShards >= 75 && (p.unlockedMask & ALL_UNLOCKED_MASK) != ALL_UNLOCKED_MASK) {
            for (uint8 candidate = 8; candidate <= 10; candidate++) {
                if ((p.unlockedMask & uint16(1 << candidate)) == 0) {
                    p.relicShards -= 75;
                    p.pityCounter = 0;
                    p.unlockedMask |= uint16(1 << candidate);
                    emit SummonExecuted(msg.sender, true, candidate, p.relicShards, p.unlockedMask);
                    return (true, candidate);
                }
            }
        }

        emit SummonExecuted(msg.sender, false, pickedId, p.relicShards, p.unlockedMask);
        return (false, pickedId);
    }

    function createRoom(bytes6 roomCode, bool isPrivate, uint8 mapId) external {
        require(rooms[roomCode].host == address(0), "Room code already used");
        rooms[roomCode] = Room({
            roomCode: roomCode,
            host: msg.sender,
            challenger: address(0),
            mapId: mapId,
            isPrivate: isPrivate,
            isActive: true,
            winner: address(0)
        });
        if (!isPrivate) {
            publicRoomCodes.push(roomCode);
        }
        emit RoomCreated(roomCode, msg.sender, isPrivate, mapId);
    }

    function joinRoom(bytes6 roomCode) external {
        Room storage r = rooms[roomCode];
        require(r.isActive, "Room not active");
        require(r.challenger == address(0), "Room full");
        r.challenger = msg.sender;
        emit RoomJoined(roomCode, msg.sender);
    }

    function settleMatch(bytes6 roomCode, address winner, uint8 hostLegend, uint8 challengerLegend) external {
        Room storage r = rooms[roomCode];
        if (r.isActive) {
            r.isActive = false;
            r.winner = winner;
        }
        PlayerProfile storage wp = profiles[winner];
        if (wp.unlockedMask == 0) wp.unlockedMask = DEFAULT_UNLOCKED_MASK;
        wp.victories += 1;
        wp.matchesPlayed += 1;
        wp.relicShards += 15; // Award 15 relic shards for victory
        emit MatchSettled(roomCode, winner, hostLegend, challengerLegend);
    }

    // Helper for public rooms listing
    function getPublicRoomsCount() external view returns (uint256) {
        return publicRoomCodes.length;
    }
}
