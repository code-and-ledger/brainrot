// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {MemeEliminationGame} from "../src/MemeEliminationGame.sol";
import "../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";

// Mock USDC token for testing
contract MockUSDC is ERC20 {
    constructor() ERC20("USD Coin", "USDC") {
        _mint(msg.sender, 1000000 * 10**6); // Mint 1M USDC to deployer
    }

    function decimals() public pure override returns (uint8) {
        return 6; // USDC has 6 decimals
    }
}

contract MemeEliminationGameTest is Test {
    MemeEliminationGame public game;
    MockUSDC public usdc;
    
    // Test addresses
    address public owner = makeAddr("owner");
    address public creator1 = makeAddr("creator1");
    address public creator2 = makeAddr("creator2");
    address public creator3 = makeAddr("creator3");
    address public voter1 = makeAddr("voter1");
    address public voter2 = makeAddr("voter2");
    address public voter3 = makeAddr("voter3");
    
    // Constants
    uint256 constant VOTE_COST = 5 * 10**6; // 5 USDC
    uint256 constant INITIAL_BALANCE = 1000 * 10**6; // 1000 USDC
    
    // Events to test
    event MemeCreated(uint256 indexed memeId, address indexed creator, string contentURI);
    event VoteCast(address indexed voter, uint256 indexed memeId);
    event MemeEliminated(uint256 indexed memeId);
    event GameCompleted(uint256 indexed winnerMemeId, address indexed creator, uint256 prizePool);
    event RewardsDistributed(uint256 indexed memeId, uint256 creatorReward, uint256 votersReward);
    
    function setUp() public {
        // Deploy contracts as owner
        vm.startPrank(owner);
        usdc = new MockUSDC();
        game = new MemeEliminationGame(address(usdc));
        vm.stopPrank();
        
        // Distribute USDC to test addresses
        _distributeUSDC();
    }

    function _distributeUSDC() internal {
        vm.startPrank(owner);
        usdc.transfer(creator1, INITIAL_BALANCE);
        usdc.transfer(creator2, INITIAL_BALANCE);
        usdc.transfer(creator3, INITIAL_BALANCE);
        usdc.transfer(voter1, INITIAL_BALANCE);
        usdc.transfer(voter2, INITIAL_BALANCE);
        usdc.transfer(voter3, INITIAL_BALANCE);
        vm.stopPrank();
    }

    function _approveAndVote(address voter, uint256 memeId) internal {
        vm.startPrank(voter);
        usdc.approve(address(game), VOTE_COST);
        game.voteToEliminate(memeId);
        vm.stopPrank();
    }
    
    function _createMemes() internal {
        // Create memes during registration phase
        vm.prank(creator1);
        game.createMeme("ipfs://meme1");
        
        vm.prank(creator2);
        game.createMeme("ipfs://meme2");
        
        vm.prank(creator3);
        game.createMeme("ipfs://meme3");
    }
    
    // Test meme creation
    function testMemeCreation() public {
        // Expect the MemeCreated event
        vm.expectEmit(true, true, false, true);
        emit MemeCreated(0, creator1, "ipfs://meme1");
        
        // Create a meme
        vm.prank(creator1);
        game.createMeme("ipfs://meme1");
        
        // Verify meme count
        assertEq(game.memeCount(), 1);
        assertEq(game.activeMemeCount(), 1);
        
        // Verify meme details
        (address creator, string memory contentURI, bool eliminated, uint256 votes) = game.memes(0);
        assertEq(creator, creator1);
        assertEq(contentURI, "ipfs://meme1");
        assertEq(eliminated, false);
        assertEq(votes, 0);
    }
    
    // Test that meme creation fails after voting has started
    function testCannotCreateMemeAfterVotingStarts() public {
        _createMemes();
        
        // Start voting phase
        vm.prank(owner);
        game.startVoting();
        
        // Try to create a new meme
        vm.prank(creator1);
        vm.expectRevert("Not in registration phase");
        game.createMeme("ipfs://meme4");
    }
    
    // Test that only the owner can start voting
    function testOnlyOwnerCanStartVoting() public {
        _createMemes();
        
        vm.prank(creator1);
        vm.expectRevert();
        game.startVoting();
        
        vm.prank(owner);
        game.startVoting();
        
        assertEq(uint(game.currentState()), uint(MemeEliminationGame.GameState.Voting));
    }
    
    // Test voting mechanism
    function testVoting() public {
        _createMemes();
        
        // Start voting phase
        vm.prank(owner);
        game.startVoting();
        
        // Vote on meme 0
        _approveAndVote(voter1, 0);
        
        // Check votes count
        (, , , uint256 votes) = game.memes(0);
        assertEq(votes, 1);
        
        // Check prize pool
        assertEq(game.prizePool(), VOTE_COST);
        
        // Verify user vote tracking
        assertTrue(game.userVotedOnMeme(voter1, 0));
    }
    
    // Test voting restrictions
    function testCannotVoteTwice() public {
        _createMemes();
        
        // Start voting phase
        vm.prank(owner);
        game.startVoting();
        
        // First vote should succeed
        _approveAndVote(voter1, 0);
        
        // Second vote on same meme should fail
        vm.startPrank(voter1);
        usdc.approve(address(game), VOTE_COST);
        vm.expectRevert("Already voted on this meme");
        game.voteToEliminate(0);
        vm.stopPrank();
    }
    
    // Test elimination
    function testElimination() public {
        _createMemes();
        
        // Start voting phase
        vm.prank(owner);
        game.startVoting();
        
        // Vote on memes
        _approveAndVote(voter1, 0); // 1 vote for meme 0
        _approveAndVote(voter2, 0); // 2 votes for meme 0
        _approveAndVote(voter3, 1); // 1 vote for meme 1
        
        // Expect MemeEliminated event
        vm.expectEmit(true, false, false, false);
        emit MemeEliminated(0);
        
        // Eliminate meme with most votes (meme 0)
        vm.prank(owner);
        game.eliminateMeme();
        
        // Verify meme is eliminated
        (, , bool eliminated, ) = game.memes(0);
        assertTrue(eliminated);
        
        // Verify active meme count
        assertEq(game.activeMemeCount(), 2);
    }
    
    // Test that only owner can eliminate memes
    function testOnlyOwnerCanEliminate() public {
        _createMemes();
        
        // Start voting phase
        vm.prank(owner);
        game.startVoting();
        
        // Vote on meme
        _approveAndVote(voter1, 0);
        
        // Try to eliminate as non-owner
        vm.prank(voter1);
        vm.expectRevert();
        game.eliminateMeme();
    }
    
    // Test game completion
    function testGameCompletion() public {
        _createMemes();
        
        // Start voting phase
        vm.prank(owner);
        game.startVoting();
        
        // Vote on memes
        _approveAndVote(voter1, 0);
        _approveAndVote(voter2, 1);
        
        // Eliminate meme 0 (only because we need to test a specific flow)
        vm.prank(owner);
        game.eliminateMeme();
        
        // Vote on meme 1 with a different voter
        _approveAndVote(voter3, 1);
        
        // Eliminate meme 1
        vm.prank(owner);
        game.eliminateMeme();
        
        // Should have one meme left, game should complete automatically
        assertEq(game.activeMemeCount(), 1);
        assertEq(uint(game.currentState()), uint(MemeEliminationGame.GameState.Completed));
        assertEq(game.winnerMemeId(), 2); // Meme 2 should be the winner
        
        // Check prize pool
        assertEq(game.prizePool(), 3 * VOTE_COST); // 3 votes total
    }
    
    // Test reward distribution
    function testRewardDistribution() public {
        _createMemes();
        
        // Start voting phase
        vm.prank(owner);
        game.startVoting();
        
        // Vote to eliminate meme 0 and meme 1
        _approveAndVote(voter1, 0);
        _approveAndVote(voter2, 0);
        _approveAndVote(voter3, 1);
        
        // Eliminate memes until game completion
        vm.startPrank(owner);
        game.eliminateMeme(); // Eliminate meme 0
        game.eliminateMeme(); // Eliminate meme 1, game completes
        vm.stopPrank();
        
        // Verify winner
        assertEq(game.winnerMemeId(), 2);
        assertEq(uint(game.currentState()), uint(MemeEliminationGame.GameState.Completed));
        
        // Get initial balances
        uint256 initialCreatorBalance = usdc.balanceOf(creator3);
        uint256 initialOwnerBalance = usdc.balanceOf(owner);
        
        // Distribute rewards
        vm.prank(owner);
        game.distributeRewards();
        
        // Calculate expected rewards
        // Total prize = 3 votes * 5 USDC = 15 USDC
        // Platform fee (2.5%) = 0.375 USDC
        // Remaining = 14.625 USDC
        // Creator gets 40% = 5.85 USDC
        // No voters for the winning meme, so creator gets all
        
        uint256 expectedCreatorReward = 14.625 * 10**6;
        uint256 expectedOwnerFee = 0.375 * 10**6;
        
        // Check balances (with small tolerance for rounding)
        assertApproxEqAbs(
            usdc.balanceOf(creator3) - initialCreatorBalance,
            expectedCreatorReward,
            0.01 * 10**6
        );
        
        assertApproxEqAbs(
            usdc.balanceOf(owner) - initialOwnerBalance,
            expectedOwnerFee,
            0.01 * 10**6
        );
        
        // Prize pool should be empty
        assertEq(game.prizePool(), 0);
    }
    
    // Test reward distribution with voters for winning meme
    function testRewardDistributionWithVoters() public {
        _createMemes();
        
        // Start voting phase
        vm.prank(owner);
        game.startVoting();
        
        // Important: The contract tracks votes for elimination, so we need to vote for
        // the OTHER memes, not the one we want to win
        _approveAndVote(voter1, 0); // Vote to eliminate meme 0
        _approveAndVote(voter2, 1); // Vote to eliminate meme 1
        
        // Add votes for the to-be-winning meme's elimination (this is counter-intuitive but our game logic requires it)
        vm.startPrank(voter3);
        usdc.approve(address(game), VOTE_COST);
        game.voteToEliminate(2); // This is a vote FOR eliminating the eventual winner (meme 2)
        vm.stopPrank();
        
        // Eliminate memes until game completion (but NOT meme 2)
        vm.startPrank(owner);
        game.eliminateMeme(); // Eliminate meme 0
        game.eliminateMeme(); // Eliminate meme 1, game completes
        vm.stopPrank();
        
        // Get initial balances
        uint256 initialCreatorBalance = usdc.balanceOf(creator3);
        uint256 initialVoterBalance = usdc.balanceOf(voter3);
        uint256 initialOwnerBalance = usdc.balanceOf(owner);
        
        // Distribute rewards
        vm.prank(owner);
        game.distributeRewards();
        
        // Calculate expected rewards
        // Total prize = 3 votes * 5 USDC = 15 USDC
        // Platform fee (2.5%) = 0.375 USDC
        // Remaining = 14.625 USDC
        
        // Get the actual balances after distribution
        uint256 creatorReward = usdc.balanceOf(creator3) - initialCreatorBalance;
        uint256 voterReward = usdc.balanceOf(voter3) - initialVoterBalance;
        uint256 ownerFee = usdc.balanceOf(owner) - initialOwnerBalance;
        
        // Make sure total distributed is correct (approximately 15 USDC)
        assertApproxEqAbs(
            creatorReward + voterReward + ownerFee,
            15 * 10**6,
            0.01 * 10**6
        );
        
        // Make sure platform fee is correct (approximately 0.375 USDC)
        assertApproxEqAbs(
            ownerFee,
            0.375 * 10**6,
            0.01 * 10**6
        );
        
        // Verify creator and voter both received funds
        assertTrue(creatorReward > 0, "Creator should receive rewards");
        assertTrue(voterReward > 0, "Voter should receive rewards");
    }
    
    // Test game reset
    function testGameReset() public {
        // Complete a game
        testRewardDistribution();
        
        // Reset the game
        vm.prank(owner);
        game.resetGame();
        
        // Verify game state
        assertEq(uint(game.currentState()), uint(MemeEliminationGame.GameState.Registration));
        assertEq(game.memeCount(), 0);
        assertEq(game.activeMemeCount(), 0);
    }
    
    // Test cannot reset game without distributing rewards
    function testCannotResetWithoutDistributingRewards() public {
        _createMemes();
        
        // Start voting phase
        vm.prank(owner);
        game.startVoting();
        
        // Cast votes to ensure there are different vote counts
        vm.startPrank(voter1);
        usdc.approve(address(game), VOTE_COST);
        game.voteToEliminate(0);
        vm.stopPrank();
        
        vm.startPrank(voter2);
        usdc.approve(address(game), VOTE_COST);
        game.voteToEliminate(1);
        vm.stopPrank();
        
        // Voter 3 votes twice to ensure a clear maximum
        vm.startPrank(voter3);
        usdc.approve(address(game), VOTE_COST * 2);
        game.voteToEliminate(0);
        game.voteToEliminate(1);
        vm.stopPrank();
        
        // Now meme 0 and meme 1 both have votes, so we can eliminate them
        vm.startPrank(owner);
        game.eliminateMeme(); // Eliminate meme with most votes
        game.eliminateMeme(); // Eliminate the next meme, completing the game
        vm.stopPrank();
        
        // Game is completed but rewards not distributed
        assertEq(uint(game.currentState()), uint(MemeEliminationGame.GameState.Completed));
        assertTrue(game.prizePool() > 0, "Prize pool should have funds");
        
        // Try to reset without distributing rewards
        vm.prank(owner);
        vm.expectRevert("Distribute rewards first");
        game.resetGame();
    }
    
    // Test platform fee update
    function testPlatformFee() public {
        // Update platform fee to 5%
        vm.prank(owner);
        game.setPlatformFee(500);
        
        // Verify the fee was updated correctly
        assertEq(game.platformFeePercentage(), 500);
    }
    
    // Test emergency withdrawal
    function testEmergencyWithdraw() public {
        // Send some USDC directly to the contract
        vm.prank(owner);
        usdc.transfer(address(game), 100 * 10**6); // 100 USDC
        
        // Get initial owner balance
        uint256 initialOwnerBalance = usdc.balanceOf(owner);
        
        // Withdraw
        vm.prank(owner);
        game.emergencyWithdraw(address(usdc));
        
        // Check owner received the tokens
        assertEq(usdc.balanceOf(owner) - initialOwnerBalance, 100 * 10**6);
        assertEq(usdc.balanceOf(address(game)), 0);
    }
    
    // Test getAllMemes view function
    function testGetAllMemes() public {
        _createMemes();
        
        // Start voting and cast votes
        vm.prank(owner);
        game.startVoting();
        
        _approveAndVote(voter1, 0);
        _approveAndVote(voter2, 1);
        
        // Eliminate one meme
        vm.prank(owner);
        game.eliminateMeme();
        
        // Get all memes
        (
            uint256[] memory ids,
            address[] memory creators,
            string[] memory contentURIs,
            bool[] memory eliminatedStatus,
            uint256[] memory votes
        ) = game.getAllMemes();
        
        // Verify data
        assertEq(ids.length, 3);
        assertEq(creators.length, 3);
        assertEq(contentURIs.length, 3);
        assertEq(eliminatedStatus.length, 3);
        assertEq(votes.length, 3);
        
        // Verify specific meme data
        assertEq(ids[0], 0);
        assertEq(creators[0], creator1);
        assertEq(contentURIs[0], "ipfs://meme1");
        assertTrue(eliminatedStatus[0]); // Should be eliminated
        assertEq(votes[0], 1);
        
        assertEq(ids[1], 1);
        assertEq(creators[1], creator2);
        assertEq(contentURIs[1], "ipfs://meme2");
        assertEq(votes[1], 1);
    }
}