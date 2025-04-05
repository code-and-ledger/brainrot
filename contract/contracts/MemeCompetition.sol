// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Interface for creating tokens
interface ITokenCreator {
    function createToken(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        address owner
    ) external returns (address);
}

// Simple token contract for winning memes
contract MemeToken is ERC20 {
    address public creator;
    string public memeUniqueId;
    string public memeImageUrl;

    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        address _creator,
        string memory _memeUniqueId,
        string memory _memeImageUrl
    ) ERC20(name, symbol) {
        creator = _creator;
        memeUniqueId = _memeUniqueId;
        memeImageUrl = _memeImageUrl;
        _mint(_creator, initialSupply);
    }
}

contract MemeCompetition is Ownable {
    using EnumerableSet for EnumerableSet.UintSet;
    using EnumerableSet for EnumerableSet.AddressSet;

    // FLOW token address (adjust for Flow EVM)
    address public constant FLOW_TOKEN =
        0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9; // Flow EVM testnet token

    struct Game {
        uint256 gameId;
        address creator;
        uint256 prizePool;
        uint256 startTime;
        uint256 currentRound;
        bool isActive;
        bool isStarted;
        uint256 entryFee;
        uint256 roundDuration;
        uint256 totalParticipants;
        uint256 remainingParticipants;
        address tokenAddress; // Address of the token created for the winning meme
    }

    struct Meme {
        uint256 memeId;
        uint256 gameId;
        address creator;
        string name;
        string description;
        string tokenName;
        string tokenSymbol;
        string uniqueId;
        string imageUrl;
        bool isApproved;
        uint256 totalVotes;
    }

    struct Participant {
        address user;
        uint256 credits;
        uint256 score;
        bool isEliminated;
        uint256 lastVotedRound;
    }

    struct Round {
        uint256 roundNumber;
        uint256 startTime;
        uint256 endTime;
        uint256[] memeIds;
        mapping(uint256 => uint256) memeVotes; // memeId => total votes
        mapping(address => mapping(uint256 => uint256)) userVotes; // user => memeId => votes allocated
    }

    // Game state
    uint256 public nextGameId = 1;
    mapping(uint256 => Game) public games;
    mapping(uint256 => Meme) public memes;
    uint256 public nextMemeId = 1;
    mapping(uint256 => mapping(address => Participant)) public participants; // gameId => user => Participant
    mapping(uint256 => Round[]) public rounds; // gameId => Round[]
    mapping(uint256 => EnumerableSet.UintSet) private gameMemes; // gameId => memeIds
    mapping(uint256 => EnumerableSet.AddressSet) private gameParticipants; // gameId => participants

    // Events
    event GameCreated(uint256 indexed gameId, address indexed creator);
    event GameStarted(uint256 indexed gameId, uint256 startTime);
    event MemeSubmitted(
        uint256 indexed gameId,
        uint256 indexed memeId,
        address indexed creator
    );
    event MemeApproved(uint256 indexed gameId, uint256 indexed memeId);
    event MemeRejected(uint256 indexed gameId, uint256 indexed memeId);
    event UserJoined(uint256 indexed gameId, address indexed user);
    event RoundStarted(
        uint256 indexed gameId,
        uint256 indexed roundNumber,
        uint256 startTime
    );
    event RoundEnded(
        uint256 indexed gameId,
        uint256 indexed roundNumber,
        uint256 endTime
    );
    event UserVoted(
        uint256 indexed gameId,
        uint256 indexed roundNumber,
        address indexed user,
        uint256 memeId,
        uint256 votes
    );
    event UserEliminated(uint256 indexed gameId, address indexed user);
    event GameEnded(
        uint256 indexed gameId,
        uint256 winningMemeId,
        uint256 prizeAmount
    );
    event TokenCreated(
        uint256 indexed gameId,
        uint256 indexed memeId,
        address tokenAddress,
        uint256 initialSupply
    );
    event PaymentReceived(address indexed from, uint256 amount);

    constructor() Ownable(msg.sender) {}

    // Admin functions
    function createGame(
        uint256 _entryFee,
        uint256 _roundDuration
    ) external onlyOwner returns (uint256) {
        uint256 gameId = nextGameId++;
        games[gameId] = Game({
            gameId: gameId,
            creator: msg.sender,
            prizePool: 0,
            startTime: 0,
            currentRound: 0,
            isActive: true,
            isStarted: false,
            entryFee: _entryFee,
            roundDuration: _roundDuration,
            totalParticipants: 0,
            remainingParticipants: 0,
            tokenAddress: address(0)
        });

        emit GameCreated(gameId, msg.sender);
        return gameId;
    }

    function startGame(uint256 _gameId) external onlyOwner {
        require(games[_gameId].isActive, "Game is not active");
        require(!games[_gameId].isStarted, "Game already started");
        require(
            gameMemes[_gameId].length() >= 3,
            "Need at least 3 approved memes to start"
        );

        games[_gameId].isStarted = true;
        games[_gameId].startTime = block.timestamp;
        games[_gameId].remainingParticipants = games[_gameId].totalParticipants;

        // Start first round
        _startRound(_gameId);

        emit GameStarted(_gameId, block.timestamp);
    }

    function approveMeme(uint256 _gameId, uint256 _memeId) external onlyOwner {
        require(games[_gameId].isActive, "Game is not active");
        require(!games[_gameId].isStarted, "Game already started");
        require(memes[_memeId].gameId == _gameId, "Meme not part of this game");
        require(!memes[_memeId].isApproved, "Meme already approved");

        memes[_memeId].isApproved = true;
        emit MemeApproved(_gameId, _memeId);
    }

    function rejectMeme(uint256 _gameId, uint256 _memeId) external onlyOwner {
        require(games[_gameId].isActive, "Game is not active");
        require(!games[_gameId].isStarted, "Game already started");
        require(memes[_memeId].gameId == _gameId, "Meme not part of this game");

        // Remove meme from game
        gameMemes[_gameId].remove(_memeId);
        emit MemeRejected(_gameId, _memeId);
    }

    // User functions
    function joinGame(uint256 _gameId) external {
        require(games[_gameId].isActive, "Game is not active");
        require(!games[_gameId].isStarted, "Game already started");
        require(
            !gameParticipants[_gameId].contains(msg.sender),
            "Already joined this game"
        );

        // For demo purposes, skip payment and just add the user
        games[_gameId].prizePool += games[_gameId].entryFee; // Admin covers the fee
        games[_gameId].totalParticipants++;
        games[_gameId].remainingParticipants++;

        // Add participant
        gameParticipants[_gameId].add(msg.sender);
        participants[_gameId][msg.sender] = Participant({
            user: msg.sender,
            credits: 0,
            score: 0,
            isEliminated: false,
            lastVotedRound: 0
        });

        emit UserJoined(_gameId, msg.sender);
    }
    // Add this function to allow admin to add users to the game without requiring them to pay
    function addUserToGame(uint256 _gameId, address _user) external onlyOwner {
        require(games[_gameId].isActive, "Game is not active");
        require(!games[_gameId].isStarted, "Game already started");
        require(
            !gameParticipants[_gameId].contains(_user),
            "User already joined this game"
        );

        // Admin covers the entry fee from contract balance
        games[_gameId].prizePool += games[_gameId].entryFee;
        games[_gameId].totalParticipants++;
        games[_gameId].remainingParticipants++;

        // Add participant
        gameParticipants[_gameId].add(_user);
        participants[_gameId][_user] = Participant({
            user: _user,
            credits: 0,
            score: 0,
            isEliminated: false,
            lastVotedRound: 0
        });

        emit UserJoined(_gameId, _user);
    }
    function submitMeme(
        uint256 _gameId,
        string memory _name,
        string memory _description,
        string memory _tokenName,
        string memory _tokenSymbol,
        string memory _uniqueId,
        string memory _imageUrl
    ) external {
        require(games[_gameId].isActive, "Game is not active");
        require(!games[_gameId].isStarted, "Game already started");

        // Automatically join game if not already a participant without payment
        if (!gameParticipants[_gameId].contains(msg.sender)) {
            // For demo purposes, admin covers the entry fee
            games[_gameId].prizePool += games[_gameId].entryFee;
            games[_gameId].totalParticipants++;
            games[_gameId].remainingParticipants++;

            // Add participant
            gameParticipants[_gameId].add(msg.sender);
            participants[_gameId][msg.sender] = Participant({
                user: msg.sender,
                credits: 0,
                score: 0,
                isEliminated: false,
                lastVotedRound: 0
            });

            emit UserJoined(_gameId, msg.sender);
        }

        // Create the meme
        uint256 memeId = nextMemeId++;
        memes[memeId] = Meme({
            memeId: memeId,
            gameId: _gameId,
            creator: msg.sender,
            name: _name,
            description: _description,
            tokenName: _tokenName,
            tokenSymbol: _tokenSymbol,
            uniqueId: _uniqueId,
            imageUrl: _imageUrl,
            isApproved: false,
            totalVotes: 0
        });

        gameMemes[_gameId].add(memeId);
        emit MemeSubmitted(_gameId, memeId, msg.sender);
    }

    function vote(uint256 _gameId, uint256 _memeId, uint256 _votes) external {
        require(games[_gameId].isStarted, "Game not started");
        require(games[_gameId].isActive, "Game already ended");

        require(
            !participants[_gameId][msg.sender].isEliminated,
            "You are eliminated"
        );
        require(
            gameMemes[_gameId].contains(_memeId),
            "Invalid meme for this game"
        );
        require(memes[_memeId].isApproved, "Meme not approved");

        uint256 currentRound = games[_gameId].currentRound;
        Round storage round = rounds[_gameId][currentRound];

        require(
            block.timestamp >= round.startTime &&
                block.timestamp <= round.endTime,
            "Voting not active"
        );

        uint256 credits = participants[_gameId][msg.sender].credits;
        if (credits == 0) {
            // First vote in this round gets 1000 credits
            credits = 1000;
        }

        require(_votes <= credits, "Not enough credits");

        // Update votes
        round.memeVotes[_memeId] += _votes;
        round.userVotes[msg.sender][_memeId] += _votes;
        participants[_gameId][msg.sender].credits = credits - _votes;
        participants[_gameId][msg.sender].lastVotedRound = currentRound;
        participants[_gameId][msg.sender].score += _votes;
        memes[_memeId].totalVotes += _votes;

        emit UserVoted(_gameId, currentRound, msg.sender, _memeId, _votes);
    }

    // Game logic functions
    function _startRound(uint256 _gameId) internal {
        uint256 roundNumber = games[_gameId].currentRound;
        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + games[_gameId].roundDuration;

        Round storage newRound = rounds[_gameId].push();
        newRound.roundNumber = roundNumber;
        newRound.startTime = startTime;
        newRound.endTime = endTime;

        // Reset credits for all active participants
        EnumerableSet.AddressSet storage participantsSet = gameParticipants[
            _gameId
        ];
        for (uint256 i = 0; i < participantsSet.length(); i++) {
            address participant = participantsSet.at(i);
            if (!participants[_gameId][participant].isEliminated) {
                participants[_gameId][participant].credits = 0;
            }
        }

        // Select memes for this round (all approved memes for first round)
        if (roundNumber == 0) {
            EnumerableSet.UintSet storage memeSet = gameMemes[_gameId];
            for (uint256 i = 0; i < memeSet.length(); i++) {
                uint256 memeId = memeSet.at(i);
                if (memes[memeId].isApproved) {
                    newRound.memeIds.push(memeId);
                }
            }
        } else {
            // For subsequent rounds, select top memes (logic to be implemented)
            // This would involve sorting memes by votes and selecting top performers
        }

        emit RoundStarted(_gameId, roundNumber, startTime);
    }

    function endRound(uint256 _gameId) external {
        require(games[_gameId].isStarted, "Game not started");
        require(games[_gameId].isActive, "Game already ended");

        uint256 currentRound = games[_gameId].currentRound;
        Round storage round = rounds[_gameId][currentRound];

        // Eliminate participants who didn't vote
        EnumerableSet.AddressSet storage participantsSet = gameParticipants[
            _gameId
        ];
        uint256 eliminatedCount = 0;

        for (uint256 i = 0; i < participantsSet.length(); i++) {
            address participant = participantsSet.at(i);
            if (
                !participants[_gameId][participant].isEliminated &&
                participants[_gameId][participant].lastVotedRound < currentRound
            ) {
                participants[_gameId][participant].isEliminated = true;
                games[_gameId].remainingParticipants--;
                eliminatedCount++;
                emit UserEliminated(_gameId, participant);
            }
        }

        emit RoundEnded(_gameId, currentRound, block.timestamp);

        _endGame(_gameId);
    }

    function shouldEndGame(uint256 _gameId) internal view returns (bool) {
        // Simplified logic - end game when only 3 memes left
        // You can implement more complex logic here
        uint256 activeMemes = 0;
        EnumerableSet.UintSet storage memeSet = gameMemes[_gameId];
        for (uint256 i = 0; i < memeSet.length(); i++) {
            if (memes[memeSet.at(i)].isApproved) {
                activeMemes++;
            }
        }
        return activeMemes <= 3;
    }

    function _endGame(uint256 _gameId) internal {
        games[_gameId].isActive = false;

        // Determine winner (simplified - meme with most votes)
        uint256 winningMemeId;
        uint256 highestVotes = 0;

        EnumerableSet.UintSet storage memeSet = gameMemes[_gameId];
        for (uint256 i = 0; i < memeSet.length(); i++) {
            uint256 memeId = memeSet.at(i);
            if (memes[memeId].totalVotes > highestVotes) {
                highestVotes = memes[memeId].totalVotes;
                winningMemeId = memeId;
            }
        }

        // Create token for the winning meme
        _createTokenForWinningMeme(_gameId, winningMemeId);

        emit GameEnded(_gameId, winningMemeId, games[_gameId].prizePool);
    }

    // Function to create a token for the winning meme
    function _createTokenForWinningMeme(
        uint256 _gameId,
        uint256 _memeId
    ) internal {
        Meme storage winningMeme = memes[_memeId];

        // Calculate token supply based on the prize pool
        // 1 FLOW = 1000 Meme Tokens
        uint256 initialSupply = games[_gameId].prizePool * 1000;

        // Create new token
        MemeToken newToken = new MemeToken(
            winningMeme.tokenName,
            winningMeme.tokenSymbol,
            initialSupply,
            winningMeme.creator,
            winningMeme.uniqueId,
            winningMeme.imageUrl
        );

        // Store token address in game
        games[_gameId].tokenAddress = address(newToken);

        // Emit token creation event
        emit TokenCreated(_gameId, _memeId, address(newToken), initialSupply);
    }

    // Function to check if a user is a participant
    function isParticipant(
        uint256 _gameId,
        address _user
    ) public view returns (bool) {
        return gameParticipants[_gameId].contains(_user);
    }

    // Function to get number of memes in a game
    function getGameMemeCount(uint256 _gameId) public view returns (uint256) {
        return gameMemes[_gameId].length();
    }

    // View functions
    function getGameInfo(
        uint256 _gameId
    )
        public
        view
        returns (
            uint256 gameId,
            address creator,
            uint256 prizePool,
            uint256 startTime,
            uint256 currentRound,
            bool isActive,
            bool isStarted,
            uint256 entryFee,
            uint256 roundDuration,
            uint256 totalParticipants,
            uint256 remainingParticipants,
            address tokenAddress
        )
    {
        Game storage game = games[_gameId];
        return (
            game.gameId,
            game.creator,
            game.prizePool,
            game.startTime,
            game.currentRound,
            game.isActive,
            game.isStarted,
            game.entryFee,
            game.roundDuration,
            game.totalParticipants,
            game.remainingParticipants,
            game.tokenAddress
        );
    }

    function getMemeInfo(
        uint256 _memeId
    )
        public
        view
        returns (
            uint256 memeId,
            uint256 gameId,
            address creator,
            string memory name,
            string memory description,
            string memory tokenName,
            string memory tokenSymbol,
            string memory uniqueId,
            string memory imageUrl,
            bool isApproved,
            uint256 totalVotes
        )
    {
        Meme storage meme = memes[_memeId];
        return (
            meme.memeId,
            meme.gameId,
            meme.creator,
            meme.name,
            meme.description,
            meme.tokenName,
            meme.tokenSymbol,
            meme.uniqueId,
            meme.imageUrl,
            meme.isApproved,
            meme.totalVotes
        );
    }

    function getParticipantInfo(
        uint256 _gameId,
        address _user
    )
        public
        view
        returns (
            address user,
            uint256 credits,
            uint256 score,
            bool isEliminated,
            uint256 lastVotedRound
        )
    {
        Participant storage participant = participants[_gameId][_user];
        return (
            participant.user,
            participant.credits,
            participant.score,
            participant.isEliminated,
            participant.lastVotedRound
        );
    }

    function getRoundInfo(
        uint256 _gameId,
        uint256 _roundNumber
    )
        public
        view
        returns (
            uint256 roundNumber,
            uint256 startTime,
            uint256 endTime,
            uint256[] memory memeIds,
            uint256[] memory memeVotes
        )
    {
        Round storage round = rounds[_gameId][_roundNumber];

        // Prepare meme votes array
        uint256[] memory votes = new uint256[](round.memeIds.length);
        for (uint256 i = 0; i < round.memeIds.length; i++) {
            votes[i] = round.memeVotes[round.memeIds[i]];
        }

        return (
            round.roundNumber,
            round.startTime,
            round.endTime,
            round.memeIds,
            votes
        );
    }

    function getLeaderboard(
        uint256 _gameId
    ) public view returns (address[] memory users, uint256[] memory scores) {
        EnumerableSet.AddressSet storage participantsSet = gameParticipants[
            _gameId
        ];
        address[] memory userArray = new address[](participantsSet.length());
        uint256[] memory scoreArray = new uint256[](participantsSet.length());

        for (uint256 i = 0; i < participantsSet.length(); i++) {
            userArray[i] = participantsSet.at(i);
            scoreArray[i] = participants[_gameId][userArray[i]].score;
        }

        // Sort by score (descending)
        for (uint256 i = 0; i < userArray.length; i++) {
            for (uint256 j = i + 1; j < userArray.length; j++) {
                if (scoreArray[i] < scoreArray[j]) {
                    // Swap users
                    address tempUser = userArray[i];
                    userArray[i] = userArray[j];
                    userArray[j] = tempUser;

                    // Swap scores
                    uint256 tempScore = scoreArray[i];
                    scoreArray[i] = scoreArray[j];
                    scoreArray[j] = tempScore;
                }
            }
        }

        return (userArray, scoreArray);
    }

    // Function to get token address for a game
    function getGameToken(uint256 _gameId) public view returns (address) {
        return games[_gameId].tokenAddress;
    }

    // Fallback function to receive native tokens
    receive() external payable {
        emit PaymentReceived(msg.sender, msg.value);
    }
}
