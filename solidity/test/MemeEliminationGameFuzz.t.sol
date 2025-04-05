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

contract MemeEliminationGameFuzzTest is Test {
    MemeEliminationGame public game;
    MockUSDC public usdc;
    
    // Test addresses
    address public owner;
    address public creator1;
    address public voter1;
    
    // Constants
    uint256 constant VOTE_COST = 5 * 10**6; // 5 USDC
    uint256 constant INITIAL_BALANCE = 1000 * 10**6; // 1000 USDC
    
    function setUp() public {
        // Deploy contracts
        owner = address(this);
        usdc = new MockUSDC();
        game = new MemeEliminationGame(address(usdc));
        
        // Setup test addresses
        creator1 = makeAddr("creator1");
        voter1 = makeAddr("voter1");
        
        // Distribute USDC
        usdc.transfer(creator1, INITIAL_BALANCE);
        usdc.transfer(voter1, INITIAL_BALANCE);
    }
    
    // Fuzz test for platform fee setting
    function testFuzz_PlatformFee(uint256 feePercentage) public {
        // Bound the fee to a reasonable range (0-1000 basis points, or 0-10%)
        feePercentage = bound(feePercentage, 0, 1000);
        
        game.setPlatformFee(feePercentage);
        
        assertEq(game.platformFeePercentage(), feePercentage);
    }
    
    // Fuzz test for meme creation
    function testFuzz_CreateMeme(string calldata contentURI) public {
        // Skip empty strings or extremely long strings
        vm.assume(bytes(contentURI).length > 0 && bytes(contentURI).length < 1000);
        
        uint256 initialMemeCount = game.memeCount();
        
        vm.prank(creator1);
        game.createMeme(contentURI);
        
        assertEq(game.memeCount(), initialMemeCount + 1);
        
        // Verify meme details
        (address creator, string memory storedURI, bool eliminated, uint256 votes) = game.memes(initialMemeCount);
        assertEq(creator, creator1);
        assertEq(storedURI, contentURI);
        assertEq(eliminated, false);
        assertEq(votes, 0);
    }
    
    // Fuzz test for voting with different meme IDs
    function testFuzz_Voting(uint256 memeId, uint64 numMemes) public {
        // Bound inputs to reasonable ranges
        numMemes = uint64(bound(numMemes, 2, 10)); // Create between 2-10 memes
        
        // Create memes
        for (uint64 i = 0; i < numMemes; i++) {
            vm.prank(creator1);
            game.createMeme(string(abi.encodePacked("meme", i)));
        }
        
        // Bound memeId to valid range
        memeId = bound(memeId, 0, numMemes - 1);
        
        // Start voting phase
        game.startVoting();
        
        // Approve and vote
        vm.startPrank(voter1);
        usdc.approve(address(game), VOTE_COST);
        game.voteToEliminate(memeId);
        vm.stopPrank();
        
        // Verify vote was counted
        (, , , uint256 votes) = game.memes(memeId);
        assertEq(votes, 1);
        assertTrue(game.userVotedOnMeme(voter1, memeId));
        assertEq(game.prizePool(), VOTE_COST);
    }
    
    // Fuzz test that trying to vote on an eliminated meme fails
    function testFuzz_CannotVoteOnEliminatedMeme(uint8 numMemes, uint8 eliminatedMemeIndex) public {
        // Bound inputs
        numMemes = uint8(bound(numMemes, 3, 10)); // Create between 3-10 memes
        
        // Create memes
        for (uint8 i = 0; i < numMemes; i++) {
            vm.prank(creator1);
            game.createMeme(string(abi.encodePacked("meme", i)));
        }
        
        // Bound eliminatedMemeIndex to valid range
        eliminatedMemeIndex = uint8(bound(eliminatedMemeIndex, 0, numMemes - 1));
        
        // Start voting phase
        game.startVoting();
        
        // Vote on the meme to be eliminated
        vm.startPrank(voter1);
        usdc.approve(address(game), VOTE_COST);
        game.voteToEliminate(eliminatedMemeIndex);
        vm.stopPrank();
        
        // Eliminate the meme
        game.eliminateMeme();
        
        // Verify meme is eliminated
        (, , bool eliminated, ) = game.memes(eliminatedMemeIndex);
        assertTrue(eliminated);
        
        // Create a new voter with sufficient funds
        address newVoter = makeAddr("newVoter");
        usdc.transfer(newVoter, VOTE_COST * 2); // Ensure plenty of tokens
        
        // Try to vote on the eliminated meme (should fail)
        vm.startPrank(newVoter);
        usdc.approve(address(game), VOTE_COST);
        vm.expectRevert("Meme already eliminated");
        game.voteToEliminate(eliminatedMemeIndex);
        vm.stopPrank();
    }
    
    // Property-based test: Total votes * VOTE_COST should equal prize pool
    function testProperty_TotalVotesMatchPrizePool(uint8 numMemes, uint8 numVoters) public {
        // Bound inputs to reasonable ranges
        numMemes = uint8(bound(numMemes, 2, 5));
        numVoters = uint8(bound(numVoters, 1, 10));
        
        // Create memes
        for (uint8 i = 0; i < numMemes; i++) {
            vm.prank(creator1);
            game.createMeme(string(abi.encodePacked("meme", i)));
        }
        
        // Start voting phase
        game.startVoting();
        
        // Create voters and have them vote on random memes
        uint256 totalVotes = 0;
        for (uint8 i = 0; i < numVoters; i++) {
            address voter = makeAddr(string(abi.encodePacked("voter", i)));
            usdc.transfer(voter, VOTE_COST);
            
            uint256 memeId = uint256(keccak256(abi.encodePacked(i))) % numMemes;
            
            // Skip if meme is eliminated or already voted by this voter
            (, , bool eliminated, ) = game.memes(memeId);
            if (eliminated || game.userVotedOnMeme(voter, memeId)) {
                continue;
            }
            
            vm.startPrank(voter);
            usdc.approve(address(game), VOTE_COST);
            game.voteToEliminate(memeId);
            vm.stopPrank();
            
            totalVotes++;
        }
        
        // Verify property: prize pool equals total votes * VOTE_COST
        assertEq(game.prizePool(), totalVotes * VOTE_COST);
    }
}