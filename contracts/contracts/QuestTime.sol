// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title QuestTime
/// @notice On-chain event-engagement platform: participants register for an
///         Event Pass NFT, complete quests to earn Participation Tokens,
///         unlock Achievement Badges, and redeem Tokens for Rewards.
///         All state changes are emitted as events for full transparency.
contract QuestTime is ERC721, Ownable {
    // =========================================================
    //                       EVENT PASS NFT
    // =========================================================

    uint256 private _nextPassId = 1;

    /// @dev participant => registered flag
    mapping(address => bool) public isRegistered;

    /// @dev participant => their Event Pass tokenId
    mapping(address => uint256) public eventPassOf;

    // =========================================================
    //                    PARTICIPATION TOKENS
    // =========================================================
    // Kept as a simple internal ledger (not a full ERC20) to keep the
    // MVP self-contained. Can be swapped for a real ERC20 later without
    // changing the public API of this contract.

    mapping(address => uint256) public participationTokens;

    // =========================================================
    //                            QUESTS
    // =========================================================

    struct Quest {
        string name;
        uint256 tokenReward;
        bool exists;
    }

    /// @dev questId => Quest
    mapping(uint256 => Quest) public quests;
    uint256 public questCount;

    /// @dev participant => questId => completed
    mapping(address => mapping(uint256 => bool)) public questCompleted;
    mapping(address => uint256) public completedQuestCount;

    // =========================================================
    //                     ACHIEVEMENT BADGES
    // =========================================================

    struct Badge {
        string name;
        string metadataURI;
    }

    /// @dev badgeId (array index) => Badge definition
    Badge[] public badgeTypes;

    /// @dev participant => badgeId => owned
    mapping(address => mapping(uint256 => bool)) public hasBadge;
    mapping(address => uint256[]) private _badgesOf;

    // =========================================================
    //                    REWARDS & REDEMPTIONS
    // =========================================================

    struct Reward {
        string name;
        uint256 tokenCost;
        uint256 stock; // use type(uint256).max for "unlimited"
        bool exists;
    }

    mapping(uint256 => Reward) public rewards;
    uint256 public rewardCount;

    struct Redemption {
        uint256 rewardId;
        uint256 timestamp;
    }

    mapping(address => Redemption[]) public redemptionsOf;

    // =========================================================
    //                        LEADERBOARD
    // =========================================================

    address[] private _participants;

    // =========================================================
    //                          EVENTS
    // =========================================================

    event ParticipantRegistered(address indexed participant, uint256 passId);
    event QuestCreated(uint256 indexed questId, string name, uint256 tokenReward);
    event QuestCompleted(address indexed participant, uint256 indexed questId, uint256 tokensAwarded);
    event TokensAwarded(address indexed participant, uint256 amount, string reason);
    event BadgeTypeCreated(uint256 indexed badgeId, string name);
    event BadgeMinted(address indexed participant, uint256 indexed badgeId);
    event RewardCreated(uint256 indexed rewardId, string name, uint256 tokenCost);
    event RewardRedeemed(address indexed participant, uint256 indexed rewardId, uint256 tokensSpent);

    // =========================================================
    //                         MODIFIERS
    // =========================================================

    modifier onlyRegistered() {
        require(isRegistered[msg.sender], "QuestTime: not registered");
        _;
    }

    constructor() ERC721("QuestTime Event Pass", "QTPASS") Ownable(msg.sender) {}

    // =========================================================
    //                REGISTRATION / EVENT PASS NFT
    // =========================================================

    /// @notice Register as a participant and mint a soulbound-style Event Pass NFT.
    function registerParticipant() external {
        require(!isRegistered[msg.sender], "QuestTime: already registered");

        isRegistered[msg.sender] = true;

        uint256 passId = _nextPassId++;
        _safeMint(msg.sender, passId);
        eventPassOf[msg.sender] = passId;

        _participants.push(msg.sender);

        emit ParticipantRegistered(msg.sender, passId);
    }

    // =========================================================
    //                      QUEST MANAGEMENT
    // =========================================================

    /// @notice Organizer creates a new quest with a token reward.
    function createQuest(string calldata name, uint256 tokenReward) external onlyOwner returns (uint256 questId) {
        questId = ++questCount;
        quests[questId] = Quest({name: name, tokenReward: tokenReward, exists: true});
        emit QuestCreated(questId, name, tokenReward);
    }

    /// @notice Participant marks a quest as completed and receives its token reward.
    function completeQuest(uint256 questId) external onlyRegistered {
        Quest memory q = quests[questId];
        require(q.exists, "QuestTime: quest does not exist");
        require(!questCompleted[msg.sender][questId], "QuestTime: quest already completed");

        questCompleted[msg.sender][questId] = true;
        completedQuestCount[msg.sender] += 1;

        _awardTokens(msg.sender, q.tokenReward, "quest completion");

        emit QuestCompleted(msg.sender, questId, q.tokenReward);
    }

    // =========================================================
    //                    PARTICIPATION TOKENS
    // =========================================================

    /// @notice Organizer can award bonus tokens outside of quest completion
    ///         (e.g. manual recognition, event check-in, etc).
    function awardTokens(address participant, uint256 amount, string calldata reason) external onlyOwner {
        require(isRegistered[participant], "QuestTime: participant not registered");
        _awardTokens(participant, amount, reason);
    }

    function _awardTokens(address participant, uint256 amount, string memory reason) internal {
        participationTokens[participant] += amount;
        emit TokensAwarded(participant, amount, reason);
    }

    // =========================================================
    //                     ACHIEVEMENT BADGES
    // =========================================================

    /// @notice Organizer defines a new badge type (e.g. "Speed Runner", "Explorer").
    function createBadgeType(string calldata name, string calldata metadataURI)
        external
        onlyOwner
        returns (uint256 badgeId)
    {
        badgeTypes.push(Badge({name: name, metadataURI: metadataURI}));
        badgeId = badgeTypes.length - 1;
        emit BadgeTypeCreated(badgeId, name);
    }

    /// @notice Organizer awards a badge to a participant (e.g. after reviewing quest proof).
    function mintBadge(address participant, uint256 badgeId) external onlyOwner {
        require(isRegistered[participant], "QuestTime: participant not registered");
        require(badgeId < badgeTypes.length, "QuestTime: badge type does not exist");
        require(!hasBadge[participant][badgeId], "QuestTime: badge already minted");

        hasBadge[participant][badgeId] = true;
        _badgesOf[participant].push(badgeId);

        emit BadgeMinted(participant, badgeId);
    }

    // =========================================================
    //                  REWARDS & REDEMPTIONS
    // =========================================================

    /// @notice Organizer defines a reward that can be redeemed with tokens.
    function createReward(string calldata name, uint256 tokenCost, uint256 stock)
        external
        onlyOwner
        returns (uint256 rewardId)
    {
        rewardId = ++rewardCount;
        rewards[rewardId] = Reward({name: name, tokenCost: tokenCost, stock: stock, exists: true});
        emit RewardCreated(rewardId, name, tokenCost);
    }

    /// @notice Participant redeems a reward, spending their participation tokens.
    function redeemReward(uint256 rewardId) external onlyRegistered {
        Reward storage r = rewards[rewardId];
        require(r.exists, "QuestTime: reward does not exist");
        require(r.stock > 0, "QuestTime: reward out of stock");
        require(participationTokens[msg.sender] >= r.tokenCost, "QuestTime: insufficient tokens");

        participationTokens[msg.sender] -= r.tokenCost;
        r.stock -= 1;

        redemptionsOf[msg.sender].push(Redemption({rewardId: rewardId, timestamp: block.timestamp}));

        emit RewardRedeemed(msg.sender, rewardId, r.tokenCost);
    }

    // =========================================================
    //                            VIEWS
    // =========================================================

    struct Progress {
        bool registered;
        uint256 passId;
        uint256 tokens;
        uint256 questsCompleted;
        uint256[] badgeIds;
        uint256 redemptionCount;
    }

    /// @notice Returns a single participant's full on-chain progress snapshot.
    function viewProgress(address participant) external view returns (Progress memory) {
        return Progress({
            registered: isRegistered[participant],
            passId: eventPassOf[participant],
            tokens: participationTokens[participant],
            questsCompleted: completedQuestCount[participant],
            badgeIds: _badgesOf[participant],
            redemptionCount: redemptionsOf[participant].length
        });
    }

    struct LeaderboardEntry {
        address participant;
        uint256 tokens;
    }

    /// @notice Returns all participants ranked by token balance, descending.
    /// @dev O(n^2) insertion sort — fine for MVP-scale participant counts.
    ///      For large events, move sorting off-chain and use this only as
    ///      a raw data source (or paginate).
    function getLeaderboard() external view returns (LeaderboardEntry[] memory) {
        uint256 n = _participants.length;
        LeaderboardEntry[] memory board = new LeaderboardEntry[](n);

        for (uint256 i = 0; i < n; i++) {
            address p = _participants[i];
            board[i] = LeaderboardEntry({participant: p, tokens: participationTokens[p]});
        }

        for (uint256 i = 1; i < n; i++) {
            LeaderboardEntry memory key = board[i];
            uint256 j = i;
            while (j > 0 && board[j - 1].tokens < key.tokens) {
                board[j] = board[j - 1];
                j--;
            }
            board[j] = key;
        }

        return board;
    }

    function participantCount() external view returns (uint256) {
        return _participants.length;
    }

    function badgeTypeCount() external view returns (uint256) {
        return badgeTypes.length;
    }

    // =========================================================
    //                  EVENT PASS: NON-TRANSFERABLE
    // =========================================================
    // Event passes are meant to represent a participant's identity for the
    // event, so we block transfers (soulbound-style) after minting.

    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        require(from == address(0) || to == address(0), "QuestTime: Event Pass is non-transferable");
        return super._update(to, tokenId, auth);
    }
}
