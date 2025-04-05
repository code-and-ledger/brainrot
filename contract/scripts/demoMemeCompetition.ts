import { ethers } from "hardhat";
import fs from "fs";
import path from "path";
import readline from "readline";

// Define wallet interface
interface Wallet {
  id: number;
  address: string;
  privateKey: string;
  mnemonic?: string;
}

// Standard transaction options to use for all transactions
const getTxOptions = () => {
  return {
    gasLimit: 3000000,
    gasPrice: ethers.parseUnits("10", "gwei"),
  };
};

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Promise wrapper for readline question
const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

async function main() {
  try {
    // Load wallets from the generated wallets file
    const walletsPath = path.join(__dirname, "../generated-wallets.json");
    const wallets: Wallet[] = JSON.parse(fs.readFileSync(walletsPath, "utf8"));

    if (!wallets || wallets.length < 10) {
      throw new Error(
        "Need at least 10 wallets in the generated-wallets.json file"
      );
    }

    console.log("========== MemeCompetition Demo ==========");
    console.log(`Loaded ${wallets.length} wallets`);

    // Connect to the provider
    const provider = new ethers.JsonRpcProvider(
      "https://testnet.evm.nodes.onflow.org/"
    );

    // Admin wallet (first wallet) will deploy the contract
    const adminWallet = new ethers.Wallet(wallets[0].privateKey, provider);
    console.log(`Using admin wallet: ${adminWallet.address}`);

    const adminBalance = await provider.getBalance(adminWallet.address);
    console.log(
      `Admin wallet balance: ${ethers.formatEther(adminBalance)} FLOW`
    );

    // Connect other wallets
    const participantWallets = wallets
      .slice(1)
      .map((w: any) => new ethers.Wallet(w.privateKey, provider));

    // Declaration for memeIds to fix linter errors
    let memeIds: number[] = [];

    // Deploy the MemeCompetition contract
    console.log("\nDeploying MemeCompetition contract...");
    const MemeCompetition = await ethers.getContractFactory(
      "MemeCompetition",
      adminWallet
    );
    const memeCompetition = await MemeCompetition.deploy({
      gasLimit: 5000000,
      gasPrice: ethers.parseUnits("10", "gwei"),
    });
    await memeCompetition.waitForDeployment();

    const contractAddress = await memeCompetition.getAddress();
    console.log(`MemeCompetition deployed to: ${contractAddress}`);
    console.log("Checking FLOW token address for the testnet...");

    // Fund participant wallets with some FLOW from the admin wallet
    console.log("\nFunding participant wallets with FLOW...");
    // for (let i = 0; i < participantWallets.length; i++) {
    //   const wallet = participantWallets[i];
    //   const balance = await provider.getBalance(wallet.address);

    //   if (balance < ethers.parseEther("35")) {
    //     console.log(`Funding wallet ${wallet.address}...`);
    //     try {
    //       const fundTx = await adminWallet.sendTransaction({
    //         to: wallet.address,
    //         value: ethers.parseEther("40"),
    //         gasLimit: 21000,
    //         gasPrice: ethers.parseUnits("10", "gwei"),
    //       });
    //       await fundTx.wait();
    //       console.log(`Funded ${wallet.address} with 40 FLOW`);
    //     } catch (error: any) {
    //       console.error(`Error funding wallet: ${error.message}`);
    //     }
    //   } else {
    //     console.log(
    //       `Wallet ${
    //         wallet.address
    //       } already has sufficient funds: ${ethers.formatEther(balance)} FLOW`
    //     );
    //   }
    //   const FLOW_TOKEN_ADDRESS = "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9";

    //   // 3. Important fix: Approve the contract to spend FLOW tokens
    //   try {
    //     // Get the FLOW token contract
    //     const flowToken = new ethers.Contract(
    //       FLOW_TOKEN_ADDRESS,
    //       ["function approve(address spender, uint256 amount) returns (bool)"],
    //       wallet
    //     );

    //     // Approve the MemeCompetition contract to spend tokens
    //     const approveTx = await flowToken.approve(
    //       contractAddress,
    //       ethers.parseEther("50"), // Approve more than needed
    //       getTxOptions()
    //     );
    //     await approveTx.wait();
    //     console.log(
    //       `Wallet ${wallet.address} approved contract to spend FLOW tokens`
    //     );
    //   } catch (error: any) {
    //     console.error(`Error approving tokens: ${error.message}`);
    //   }
    // }
    // Create a game
    console.log("\nCreating a new game...");
    const entryFee = ethers.parseEther("30"); // 30 FLOW
    const roundDuration = 60; // 1 minute

    const createGameTx = await memeCompetition.createGame(
      entryFee,
      roundDuration,
      {
        gasLimit: 3000000,
        gasPrice: ethers.parseUnits("10", "gwei"),
      }
    );
    await createGameTx.wait();
    console.log(
      `Game created with entry fee ${ethers.formatEther(
        entryFee
      )} FLOW and round duration ${roundDuration} seconds`
    );

    // Game ID will be 1 as it's the first game
    const gameId = 1;

    // Random selection of 6 wallets to submit memes
    console.log("\nSubmitting memes from random wallets...");
    const memeSubmitters = participantWallets.slice(0, 9);

    // Meme data for submissions
    const memeData = [
      {
        name: "Doge to the Moon",
        description:
          "Classic doge meme wearing a spacesuit heading to the moon",
        tokenName: "DogeMoon",
        tokenSymbol: "DMOON",
        uniqueId: "doge123",
        imageUrl: "https://ipfs.io/ipfs/QmExample1",
      },
      {
        name: "Pepe in Flow",
        description: "Pepe swimming in a flow blockchain",
        tokenName: "FlowPepe",
        tokenSymbol: "FPEPE",
        uniqueId: "pepe456",
        imageUrl: "https://ipfs.io/ipfs/QmExample2",
      },
      {
        name: "Doge to the Moon",
        description:
          "Classic doge meme wearing a spacesuit heading to the moon",
        tokenName: "DogeMoon",
        tokenSymbol: "DMOON",
        uniqueId: "doge123",
        imageUrl: "https://ipfs.io/ipfs/QmExample1",
      },
      {
        name: "Pepe in Flow",
        description: "Pepe swimming in a flow blockchain",
        tokenName: "FlowPepe",
        tokenSymbol: "FPEPE",
        uniqueId: "pepe456",
        imageUrl: "https://ipfs.io/ipfs/QmExample2",
      },
      {
        name: "Wojak Trading",
        description: "Wojak looking at Flow charts",
        tokenName: "TradingWojak",
        tokenSymbol: "WOJAK",
        uniqueId: "wojak789",
        imageUrl: "https://ipfs.io/ipfs/QmExample3",
      },
      {
        name: "Distracted Boyfriend Chain",
        description: "Guy looking at Flow chain instead of Ethereum",
        tokenName: "ChainBoyfriend",
        tokenSymbol: "CBOY",
        uniqueId: "distracted101",
        imageUrl: "https://ipfs.io/ipfs/QmExample4",
      },
      {
        name: "Stonks in Flow",
        description: "Stonks guy investing in Flow",
        tokenName: "FlowStonks",
        tokenSymbol: "FSTONK",
        uniqueId: "stonks202",
        imageUrl: "https://ipfs.io/ipfs/QmExample5",
      },
      {
        name: "This is Fine Flow",
        description: "This is fine dog in a Flow blockchain fire",
        tokenName: "ThisIsFine",
        tokenSymbol: "FINE",
        uniqueId: "fine303",
        imageUrl: "https://ipfs.io/ipfs/QmExample6",
      },
    ];

    // Submit memes

    for (let i = 0; i < memeSubmitters.length; i++) {
      // const wallet = memeSubmitters[i];
      // const meme = memeData[i];

      // console.log(`\nWallet ${wallet.address} submitting meme: ${meme}`);
      try {
        // Get contract instance connected to this wallet
        // const contractWithSigner = new ethers.Contract(
        //   contractAddress,
        //   MemeCompetition.interface,
        //   wallet
        // );

        // First join the game
        // console.log(`Joining the game...`);
        try {
          // First approve the contract to spend FLOW tokens
          // const flowTokenAddress = "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9"; // Replace with actual FLOW token address
          // const flowToken = new ethers.Contract(
          //   flowTokenAddress,
          //   [
          //     "function approve(address spender, uint256 amount) public returns (bool)",
          //   ],
          //   wallet
          // );
          // await flowToken.approve(
          //   contractAddress,
          //   ethers.parseEther("30"), // 30 FLOW tokens
          //   {
          //     gasLimit: 200000,
          //     gasPrice: ethers.parseUnits("10", "gwei"),
          //   }
          // );
          // const joinTx = await contractWithSigner.joinGame(3, {
          //   gasLimit: 300000,
          //   value: entryFee + ethers.parseEther("1"),
          //   gasPrice: ethers.parseUnits("10", "gwei"),
          // });
          // const joinReceipt = await joinTx.wait();
          // console.log(
          //   `Joined game successfully. Gas used: ${joinReceipt.gasUsed}`
          // );
        } catch (error: any) {
          // Check if error is because already joined
          if (error.message.includes("Already joined")) {
            console.log("Already joined the game, continuing to submit meme");
          } else {
            console.error(`Error joining game: ${error.message}`);
            continue; // Skip to next wallet if can't join
          }
        }

        // Then submit meme with increased gas limit
        // console.log(`Submitting meme: ${meme.name}...`);
        // const submitTx = await contractWithSigner.submitMeme(
        //   gameId,
        //   meme.name,
        //   meme.description,
        //   meme.tokenName,
        //   meme.tokenSymbol,
        //   meme.uniqueId,
        //   meme.imageUrl,
        //   {
        //     gasLimit: 500000, // Increased gas limit
        //     gasPrice: ethers.parseUnits("10", "gwei"),
        //   }
        // );

        // const submitReceipt = await submitTx.wait();
        // console.log(
        //   `Meme "${meme.name}" submitted successfully. Gas used: ${submitReceipt.gasUsed}`
        // );
      } catch (error: any) {
        console.error(`Error submitting meme: ${error.message}`);
      }
    }

    // Approve/reject memes
    console.log("\nApproving and rejecting memes...");

    // Check if any memes were created
    try {
      // Get count of memes in the game
      // If getMemeCountForGame doesn't exist, we'll handle it in the catch block
      let memeCount = 0;
      try {
        // Try different method calls that might work to get the meme count
        try {
          memeCount = Number(
            await (memeCompetition as any).getGameMemeCount(gameId)
          );
        } catch {
          try {
            memeCount = Number(
              await (memeCompetition as any).getMemeCount(gameId)
            );
          } catch {
            // Last resort - try to check each meme ID until we find one that doesn't exist
            let foundCount = 0;
            for (let i = 1; i <= 10; i++) {
              try {
                const memeInfo = await memeCompetition.getMemeInfo(i);
                if (memeInfo && Number(memeInfo.gameId) === gameId) {
                  foundCount++;
                }
              } catch {
                // Meme doesn't exist or error
              }
            }
            memeCount = foundCount;
          }
        }
      } catch (err) {
        console.log(
          "Meme count function not found. Assuming no memes exist yet."
        );
      }
      console.log(`Number of memes in the game: ${memeCount}`);

      if (memeCount === 0) {
        console.log(
          "No memes were submitted successfully. Creating some memes directly..."
        );

        // Submit a few memes from the admin account
        for (let i = 0; i < 5; i++) {
          const meme = memeData[i];
          console.log(`  submitting meme: ${meme.name}`);
          const submitMemeTx = await memeCompetition.submitMeme(
            gameId,
            meme.name,
            meme.description,
            meme.tokenName,
            meme.tokenSymbol,
            meme.uniqueId,
            meme.imageUrl,
            getTxOptions()
          );
          let tx = await submitMemeTx.wait();
          console.dir(`Meme "${meme.name}" submitted  : ${tx}`, {
            depth: null,
          });
          console.dir(tx, {
            depth: null,
          });
        }
      }

      // Refresh the meme count
      let updatedMemeCount = 0;
      try {
        try {
          updatedMemeCount = Number(
            await (memeCompetition as any).getGameMemeCount(gameId)
          );
        } catch {
          try {
            updatedMemeCount = Number(
              await (memeCompetition as any).getMemeCount(gameId)
            );
          } catch {
            // Assume we created 3 memes
            updatedMemeCount = 3;
          }
        }
      } catch (err) {
        // If we can't get the count, we'll assume at least 3 memes were created
        updatedMemeCount = 3;
      }

      if (updatedMemeCount === 0) {
        console.log("Still no memes available. Ending demo.");
        rl.close();
        return;
      }

      // Get all valid meme IDs for the game
      const validMemeIds: number[] = [];

      console.log("Getting meme IDs for the game...");
      for (let i = 1; i <= updatedMemeCount; i++) {
        try {
          // Check if meme exists and belongs to this game
          const memeInfo = await memeCompetition.getMemeInfo(i);
          if (memeInfo && Number(memeInfo.gameId) === gameId) {
            validMemeIds.push(i);
            console.log(`Found meme ID ${i}: ${memeInfo.name}`);
          }
        } catch (err: any) {
          console.log(`Error checking meme ID ${i}:`, err.message);
          // Continue to next ID
        }
      }

      console.log(
        `Found ${validMemeIds.length} valid memes for game ${gameId}`
      );

      // We'll reject about 1/3 of the memes if we have enough
      const totalMemesToReject = Math.floor(validMemeIds.length / 3);
      const memesToReject = validMemeIds
        .slice(0, totalMemesToReject)
        .map((id) => Number(id));

      console.log(
        `Will reject ${memesToReject.length} memes: ${memesToReject.join(", ")}`
      );

      // Approve/reject memes
      for (const memeId of validMemeIds) {
        // if (memesToReject.includes(memeId)) {
        // console.log(`Rejecting meme ID ${memeId}...`);
        // try {
        //   const rejectTx = await memeCompetition.rejectMeme(
        //     gameId,
        //     memeId,
        //     getTxOptions()
        //   );
        //   await rejectTx.wait();
        //   console.log(`Meme ID ${memeId} rejected successfully`);
        // } catch (error: any) {
        //   console.error(
        //     `Error rejecting meme ID ${memeId}: ${error.message}`
        //   );
        // }
        // } else {
        console.log(`Approving meme ID ${memeId}...`);
        try {
          const approveTx = await memeCompetition.approveMeme(
            gameId,
            memeId,
            getTxOptions()
          );
          await approveTx.wait();
          console.log(`Meme ID ${memeId} approved successfully`);
        } catch (error: any) {
          console.error(`Error approving meme ID ${memeId}: ${error.message}`);
        }
        // }
      }

      // Refresh the list of approved memes
      const approvedMemeIds: number[] = [];
      for (const memeId of validMemeIds) {
        try {
          const memeInfo = await memeCompetition.getMemeInfo(memeId);
          if (memeInfo && memeInfo.isApproved) {
            approvedMemeIds.push(memeId);
          }
        } catch (err: any) {
          // Skip errors
        }
      }

      // Display all accepted memes
      console.log("\n===== Accepted Memes =====");
      for (const memeId of approvedMemeIds) {
        try {
          const memeInfo = await memeCompetition.getMemeInfo(memeId);
          console.log(`Meme ID: ${memeInfo.memeId}`);
          console.log(`Name: ${memeInfo.name}`);
          console.log(`Description: ${memeInfo.description}`);
          console.log(`Creator: ${memeInfo.creator}`);
          console.log(`Token Name: ${memeInfo.tokenName}`);
          console.log(`Token Symbol: ${memeInfo.tokenSymbol}`);
          console.log(`Image URL: ${memeInfo.imageUrl}`);
          console.log("-------------------------");
        } catch (err: any) {
          console.log(`Error displaying meme ID ${memeId}:`, err.message);
        }
      }

      // Use approved meme IDs for the rest of the script
      memeIds = [...approvedMemeIds];
    } catch (error: any) {
      console.error(`Error checking memes: ${error.message}`);
      rl.close();
      return;
    }

    // Prompt to start the game
    const startGameResponse = await question(
      "\nDo you want to start the game? (yes/no): "
    );
    if (startGameResponse.toLowerCase() !== "yes") {
      console.log("Game not started. Exiting demo.");
      rl.close();
      return;
    }

    // Start the game
    console.log("\nStarting the game...");
    const startGameTx = await memeCompetition.startGame(gameId, getTxOptions());
    await startGameTx.wait();
    console.log("Game started successfully!");

    // Allow users to join the game (exclude admin and already joined users)
    console.log("\nUsers joining the game...");

    // Get all participants that haven't already joined by submitting memes
    const nonMemeSubmitters = participantWallets.slice(6);

    for (const wallet of nonMemeSubmitters) {
      const connectedContract = MemeCompetition.connect(wallet) as any;

      console.log(`\nWallet ${wallet.address} is joining the game...`);
      try {
        const joinGameTx = await connectedContract.joinGame(
          gameId,
          getTxOptions()
        );
        await joinGameTx.wait();
        console.log(`Wallet ${wallet.address} joined the game successfully`);
      } catch (error: any) {
        console.error(`Error joining game: ${error.message}`);
      }
    }

    // Display game info
    const gameInfo = await memeCompetition.getGameInfo(gameId);
    console.log("\n===== Game Info =====");
    console.log(`Game ID: ${gameInfo[0]}`);
    console.log(`Creator: ${gameInfo[1]}`);
    console.log(`Prize Pool: ${ethers.formatEther(gameInfo[2])} FLOW`);
    console.log(`Start Time: ${new Date(Number(gameInfo[3]) * 1000)}`);
    console.log(`Current Round: ${gameInfo[4]}`);
    console.log(`Is Active: ${gameInfo[5]}`);
    console.log(`Is Started: ${gameInfo[6]}`);
    console.log(`Entry Fee: ${ethers.formatEther(gameInfo[7])} FLOW`);
    console.log(`Round Duration: ${gameInfo[8]} seconds`);
    console.log(`Total Participants: ${gameInfo[9]}`);
    console.log(`Remaining Participants: ${gameInfo[10]}`);
    console.log("=====================");

    // Wait for round to be active
    console.log("\nWaiting for round to be active...");
    const roundInfo = await memeCompetition.getRoundInfo(gameId, 0);
    console.log(`Round 0 start time: ${new Date(Number(roundInfo[1]) * 1000)}`);
    console.log(`Round 0 end time: ${new Date(Number(roundInfo[2]) * 1000)}`);

    // Display memes available for voting
    console.log("\n===== Memes Available for Voting =====");
    for (let i = 0; i < roundInfo[3].length; i++) {
      const memeId = roundInfo[3][i];
      const memeInfo = await memeCompetition.getMemeInfo(memeId);
      console.log(`Meme ID: ${memeInfo.memeId} - ${memeInfo.name}`);
    }

    // Wait for user input to proceed with voting
    await question("\nPress Enter to proceed with voting...");

    // All participants vote
    console.log("\n===== Participants Voting =====");

    // Voting strategy: everyone votes for different memes to create competition
    const allParticipants = [...memeSubmitters, ...nonMemeSubmitters];

    for (let i = 0; i < allParticipants.length; i++) {
      const wallet = allParticipants[i];

      // Create a proper contract instance with the correct interface
      const contractWithSigner = new ethers.Contract(
        contractAddress,
        MemeCompetition.interface,
        wallet
      );

      // Choose which meme to vote for (rotate through available memes)
      const memeIndex = i % memeIds.length;
      const memeIdToVote = memeIds[memeIndex];

      // Random vote amount between 500-1000 (out of 1000 available credits)
      const votesToAllocate = Math.floor(Math.random() * 501) + 500;

      console.log(
        `Wallet ${wallet.address} voting ${votesToAllocate} for Meme ID ${memeIdToVote}...`
      );
      try {
        const voteTx = await contractWithSigner.vote(
          gameId,
          memeIdToVote,
          votesToAllocate,
          getTxOptions()
        );
        let tx = await voteTx.wait();
        console.log(`Vote successful!   `, { depth: null });
        console.log(tx, { depth: null });
      } catch (error: any) {
        console.error(`Error voting: ${error.message}`);
      }
    }

    // Wait for round to end
    console.log("\nWaiting for round to end...");
    console.log(`Round ends at: ${new Date(Number(roundInfo[2]) * 1000)}`);

    // Wait until the round end time
    const currentTime = Math.floor(Date.now() / 1000);
    const roundEndTime = Number(roundInfo[2]);

    if (currentTime < roundEndTime) {
      const waitTime = (roundEndTime - currentTime + 5) * 1000; // Add 5 seconds buffer
      console.log(`Waiting ${waitTime / 1000} seconds for round to end...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    // End the round
    console.log("\nEnding the round...");
    const endRoundTx = await memeCompetition.endRound(gameId);
    await endRoundTx.wait();
    console.log("Round ended successfully!");

    // Get updated game info
    const updatedGameInfo = await memeCompetition.getGameInfo(gameId);
    console.log("\n===== Updated Game Info =====");
    console.log(`Game ID: ${updatedGameInfo[0]}`);
    console.log(`Current Round: ${updatedGameInfo[4]}`);
    // console.log(`Is Active: ${updatedGameInfo[5]}`);
    // console.log(`Remaining Participants: ${updatedGameInfo[10]}`);

    // Check for eliminated participants
    // console.log("\n===== Participant Status =====");
    // for (const wallet of allParticipants) {
    //   const participant = await memeCompetition.getParticipantInfo(
    //     gameId,
    //     wallet.address
    //   );
    //   console.log(
    //     `Wallet ${wallet.address} - Eliminated: ${participant.isEliminated}`
    //   );
    // }

    // Get leaderboard
    const leaderboard = await memeCompetition.getLeaderboard(gameId);
    console.log("\n===== Leaderboard =====");
    for (let i = 0; i < leaderboard[0].length; i++) {
      console.log(
        `Rank ${i + 1}: Address ${leaderboard[0][i]} - Score ${
          leaderboard[1][i]
        }`
      );
    }

    // Check top meme
    console.log("\n===== Top Memes =====");
    let highestVotes = 0;
    let topMemeId = 0;

    for (const memeId of memeIds) {
      const memeInfo = await memeCompetition.getMemeInfo(memeId);
      console.log(
        `Meme ID ${memeId}: ${memeInfo.name} - Votes: ${memeInfo.totalVotes}`
      );

      if (Number(memeInfo.totalVotes) > highestVotes) {
        highestVotes = Number(memeInfo.totalVotes);
        topMemeId = Number(memeId);
      }
    }

    console.log(`\nWinning Meme: ID ${topMemeId}`);
    const winningMeme = await memeCompetition.getMemeInfo(topMemeId);
    console.log(`Name: ${winningMeme.name}`);
    console.log(`Token Name: ${winningMeme.tokenName}`);
    console.log(`Token Symbol: ${winningMeme.tokenSymbol}`);
    // Manually create token for the winning meme
    console.log("\n===== Creating Token for Winning Meme =====");
    try {
      console.log(`Creating token for meme ID ${topMemeId}...`);

      // Check if the createToken function exists on the contract
      let createTokenTx;
      try {
        // The contract doesn't have a public createToken method
        // We can try to use endRound to trigger the internal _endGame function
        console.log("Using endRound to trigger token creation");
        createTokenTx = await memeCompetition.endRound(gameId, getTxOptions());
      } catch (error: any) {
        console.log(`Error with endRound method: ${error.message}`);
        console.log("Trying with manual token creation via admin...");

        // Create a new MemeToken directly (workaround)
        const MemeToken = await ethers.getContractFactory(
          "MemeToken",
          adminWallet
        );
        const initialSupply = ethers.parseEther("1000");

        const tokenTx = await MemeToken.deploy(
          winningMeme.tokenName,
          winningMeme.tokenSymbol,
          initialSupply,
          winningMeme.creator,
          winningMeme.uniqueId,
          winningMeme.imageUrl,
          getTxOptions()
        );
        createTokenTx = await tokenTx.deploymentTransaction();
      }

      let receipt;
      if (createTokenTx) {
        receipt = await createTokenTx.wait();
        console.log(
          `Token created successfully for meme "${winningMeme.name}"`
        );
        if (receipt?.hash) {
          console.log(`Transaction hash: ${receipt.hash}`);
        }

        // Try to extract token address from event logs if possible
        if (receipt?.logs) {
          try {
            const tokenCreatedEvent = receipt.logs.find(
              (log: any) =>
                log.topics &&
                log.topics[0] ===
                  ethers
                    .id("TokenCreated(uint256,uint256,address)")
                    .slice(0, 66)
            );

            if (tokenCreatedEvent) {
              const decodedLog = ethers.AbiCoder.defaultAbiCoder().decode(
                ["uint256", "uint256", "address"],
                ethers.dataSlice(tokenCreatedEvent.data, 0)
              );
              console.log(`Token address from event: ${decodedLog[2]}`);
            }
          } catch (error: any) {
            console.log("Could not decode token address from events");
          }
        }
      }
    } catch (error: any) {
      console.error(`Error creating token: ${error.message}`);
    }

    // Check if token was created
    const tokenAddress = await (memeCompetition as any).getGameToken(gameId);

    if (tokenAddress !== "0x0000000000000000000000000000000000000000") {
      console.log(`\n===== Token Created =====`);
      console.log(`Token Address: ${tokenAddress}`);

      // Get token info by creating a contract instance for the token
      const tokenABI = [
        "function name() view returns (string)",
        "function symbol() view returns (string)",
        "function decimals() view returns (uint8)",
        "function totalSupply() view returns (uint256)",
        "function balanceOf(address) view returns (uint256)",
        "function creator() view returns (address)",
        "function memeUniqueId() view returns (string)",
        "function memeImageUrl() view returns (string)",
      ];

      const tokenContract = new ethers.Contract(
        tokenAddress,
        tokenABI,
        provider
      );

      const tokenName = await tokenContract.name();
      const tokenSymbol = await tokenContract.symbol();
      const totalSupply = await tokenContract.totalSupply();
      const creator = await tokenContract.creator();
      const creatorBalance = await tokenContract.balanceOf(creator);

      console.log(`Token Name: ${tokenName}`);
      console.log(`Token Symbol: ${tokenSymbol}`);
      console.log(`Total Supply: ${ethers.formatEther(totalSupply)}`);
      console.log(`Creator: ${creator}`);
      console.log(`Creator Balance: ${ethers.formatEther(creatorBalance)}`);

      console.log(`\nToken successfully launched from prize pool!`);
    } else {
      console.log(`\nNo token was created for the game.`);
    }

    // Closing out
    console.log("\nDemo completed successfully!");
    rl.close();
  } catch (error) {
    console.error("Error in demo:", error);
    rl.close();
    process.exitCode = 1;
  }
}

main();
