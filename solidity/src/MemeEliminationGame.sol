// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import "../lib/openzeppelin-contracts/contracts/access/Ownable.sol";
import "../lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";

/**
 * @title MemeEliminationGame
 * @dev A game where creators submit memes, users vote to eliminate memes, and the last meme standing wins
 */
contract MemeEliminationGame is Ownable, ReentrancyGuard {
    // USDC token interface
    IERC20 public usdcToken;
    
    // Cost of voting (in USDC)
    uint256 public constant VOTE_COST = 5 * 10**6; // 5 USDC with 6 decimal places
    
    // Game states
    enum GameState { Registration, Voting, Completed }
    GameState public currentState;
    
    // Meme struct
    struct Meme {
        address creator;
        string contentURI;
        bool eliminated;
        uint256 eliminationVotes;
    }
    
    // Mapping of meme ID to Meme
    mapping(uint256 => Meme) public memes;
    
    // Total number of memes
    uint256 public memeCount;
    
    // Number of active (non-eliminated) memes
    uint256 public activeMemeCount;
    
    // Tracks user votes on which meme to eliminate
    mapping(address => mapping(uint256 => bool)) public userVotedOnMeme;
    
    // Tracks users who voted for each meme (for reward distribution)
    mapping(uint256 => address[]) public memeVoters;
    
    // Prize pool
    uint256 public prizePool;
    
    // Winner ID
    uint256 public winnerMemeId;
    
    // Fee percentage for the platform (in basis points: 250 = 2.5%)
    uint256 public platformFeePercentage = 250;
    
    // Events
    event MemeCreated(uint256 indexed memeId, address indexed creator, string contentURI);
    event VoteCast(address indexed voter, uint256 indexed memeId);
    event MemeEliminated(uint256 indexed memeId);
    event GameCompleted(uint256 indexed winnerMemeId, address indexed creator, uint256 prizePool);
    event RewardsDistributed(uint256 indexed memeId, uint256 creatorReward, uint256 votersReward);
    
    /**
     * @dev Constructor sets the USDC token address and initializes the contract
     * @param _usdcToken Address of the USDC token contract
     */
    constructor(address _usdcToken) Ownable(msg.sender) {
        usdcToken = IERC20(_usdcToken);
        currentState = GameState.Registration;
    }
    
    /**
     * @dev Updates the USDC token address
     * @param _usdcToken New USDC token address
     */
    function updateUSDCToken(address _usdcToken) external onlyOwner {
        usdcToken = IERC20(_usdcToken);
    }
    
    /**
     * @dev Sets the platform fee percentage (in basis points)
     * @param _feePercentage New fee percentage (2.5% = 250)
     */
    function setPlatformFee(uint256 _feePercentage) external onlyOwner {
        require(_feePercentage <= 1000, "Fee too high"); // Max 10%
        platformFeePercentage = _feePercentage;
    }
    
    /**
     * @dev Creates a new meme
     * @param _contentURI URI pointing to the meme content (IPFS hash or similar)
     */
    function createMeme(string calldata _contentURI) external {
        require(currentState == GameState.Registration, "Not in registration phase");
        require(bytes(_contentURI).length > 0, "Content URI cannot be empty");
        
        uint256 memeId = memeCount;
        
        memes[memeId] = Meme({
            creator: msg.sender,
            contentURI: _contentURI,
            eliminated: false,
            eliminationVotes: 0
        });
        
        memeCount++;
        activeMemeCount++;
        
        emit MemeCreated(memeId, msg.sender, _contentURI);
    }
    
    /**
     * @dev Starts the voting phase
     */
    function startVoting() external onlyOwner {
        require(currentState == GameState.Registration, "Not in registration phase");
        require(memeCount >= 2, "Need at least 2 memes to start");
        
        currentState = GameState.Voting;
    }
    
    /**
     * @dev Vote to eliminate a meme
     * @param _memeId ID of the meme to vote for elimination
     */
    function voteToEliminate(uint256 _memeId) external nonReentrant {
        require(currentState == GameState.Voting, "Not in voting phase");
        require(_memeId < memeCount, "Invalid meme ID");
        require(!memes[_memeId].eliminated, "Meme already eliminated");
        require(!userVotedOnMeme[msg.sender][_memeId], "Already voted on this meme");
        
        // Transfer USDC from user to contract
        require(usdcToken.transferFrom(msg.sender, address(this), VOTE_COST), "USDC transfer failed");
        
        // Record the vote
        memes[_memeId].eliminationVotes++;
        userVotedOnMeme[msg.sender][_memeId] = true;
        memeVoters[_memeId].push(msg.sender);
        
        // Add to prize pool
        prizePool += VOTE_COST;
        
        emit VoteCast(msg.sender, _memeId);
    }
    
    /**
     * @dev Eliminates the meme with the most elimination votes
     */
    function eliminateMeme() external onlyOwner {
        require(currentState == GameState.Voting, "Not in voting phase");
        require(activeMemeCount > 1, "Only one meme left");
        
        uint256 maxVotes = 0;
        uint256 memeToEliminate = 0;
        bool found = false;
        
        // Find the meme with the most elimination votes
        for (uint256 i = 0; i < memeCount; i++) {
            if (!memes[i].eliminated && memes[i].eliminationVotes > maxVotes) {
                maxVotes = memes[i].eliminationVotes;
                memeToEliminate = i;
                found = true;
            }
        }
        
        require(found, "No meme to eliminate");
        
        // Eliminate the meme
        memes[memeToEliminate].eliminated = true;
        activeMemeCount--;
        
        emit MemeEliminated(memeToEliminate);
        
        // If only one meme remains, complete the game
        if (activeMemeCount == 1) {
            // Find the winning meme
            for (uint256 i = 0; i < memeCount; i++) {
                if (!memes[i].eliminated) {
                    winnerMemeId = i;
                    break;
                }
            }
            
            currentState = GameState.Completed;
            emit GameCompleted(winnerMemeId, memes[winnerMemeId].creator, prizePool);
        }
    }
    
    /**
     * @dev Distributes rewards to the winner meme creator and voters
     */
    function distributeRewards() external onlyOwner nonReentrant {
        require(currentState == GameState.Completed, "Game not completed");
        require(prizePool > 0, "No prize to distribute");
        
        // Calculate platform fee
        uint256 platformFee = (prizePool * platformFeePercentage) / 10000;
        uint256 remainingPrize = prizePool - platformFee;
        
        // 40% to creator, 60% to voters
        uint256 creatorReward = (remainingPrize * 40) / 100;
        uint256 votersReward = remainingPrize - creatorReward;
        
        // Get winning meme details
        Meme storage winnerMeme = memes[winnerMemeId];
        address[] storage voters = memeVoters[winnerMemeId];
        
        // Send creator reward
        require(usdcToken.transfer(winnerMeme.creator, creatorReward), "Creator reward transfer failed");
        
        // Distribute to voters if there are any
        if (voters.length > 0) {
            uint256 rewardPerVoter = votersReward / voters.length;
            
            for (uint256 i = 0; i < voters.length; i++) {
                require(usdcToken.transfer(voters[i], rewardPerVoter), "Voter reward transfer failed");
            }
        } else {
            // If no voters, add to creator reward
            require(usdcToken.transfer(winnerMeme.creator, votersReward), "Additional creator reward transfer failed");
        }
        
        // Send platform fee to owner
        require(usdcToken.transfer(owner(), platformFee), "Platform fee transfer failed");
        
        // Reset prize pool
        prizePool = 0;
        
        emit RewardsDistributed(winnerMemeId, creatorReward, votersReward);
    }
    
    /**
     * @dev Resets the game for a new round
     */
    function resetGame() external onlyOwner {
        require(currentState == GameState.Completed, "Game not completed");
        require(prizePool == 0, "Distribute rewards first");
        
        // Reset game state
        currentState = GameState.Registration;
        winnerMemeId = 0;
        
        // Reset meme count
        memeCount = 0;
        activeMemeCount = 0;
    }
    
    /**
     * @dev Returns all meme IDs and their details
     */
    function getAllMemes() external view returns (
        uint256[] memory ids,
        address[] memory creators,
        string[] memory contentURIs,
        bool[] memory eliminatedStatus,
        uint256[] memory votes
    ) {
        ids = new uint256[](memeCount);
        creators = new address[](memeCount);
        contentURIs = new string[](memeCount);
        eliminatedStatus = new bool[](memeCount);
        votes = new uint256[](memeCount);
        
        for (uint256 i = 0; i < memeCount; i++) {
            Meme storage meme = memes[i];
            ids[i] = i;
            creators[i] = meme.creator;
            contentURIs[i] = meme.contentURI;
            eliminatedStatus[i] = meme.eliminated;
            votes[i] = meme.eliminationVotes;
        }
        
        return (ids, creators, contentURIs, eliminatedStatus, votes);
    }
    
    /**
     * @dev Emergency withdraw function to recover any ERC20 tokens sent to the contract
     * @param _token Address of the token to withdraw
     */
    function emergencyWithdraw(address _token) external onlyOwner {
        IERC20 token = IERC20(_token);
        uint256 balance = token.balanceOf(address(this));
        require(balance > 0, "No tokens to withdraw");
        
        require(token.transfer(owner(), balance), "Transfer failed");
    }
}