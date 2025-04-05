// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {MemeEliminationGame} from "../src/MemeEliminationGame.sol";

contract MemeEliminationGameScript is Script {
    MemeEliminationGame public memeEliminationGame;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        memeEliminationGame = new MemeEliminationGame(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);

        vm.stopBroadcast();
    }
}
