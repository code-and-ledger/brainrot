"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import { motion } from "framer-motion";

import styles from "../../styles/Home.module.css";
import Navbar from "../components/Navbar";
import PrimaryButton from "../components/primaryButton";
import Footer from "../components/Footer";

const Working = () => {
  return (
    <div className="bg-black min-h-screen">
      <Navbar />
      <main className="bg-black">
        <div className="  mx-auto px-4 pt-20 gap-10 pb-16 h-screen">
          <div className="flex flex-col items-center justify-center text-center gap-5">
            <div className="flex flex-col items-start justify-start text-start w-full">
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                style={{ fontFamily: "var(--font-permanent-marker)" }}
                className="font-Pretendard text-[#FFFFFF] text-[48px]  md:text-[68px] font-bold text-left"
              >
                How it works!
              </motion.h1>
            </div>
            <div
              className="flex flex-col items-start justify-start text-start w-full"
              style={{ marginTop: "40px" }}
            >
              <div className="flex gap-4 flex-col mb-10  ">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="font-Pretendard text-[#FFFFFF] text-[18px] md:text-[24px] max-w-2xl mb-10 text-left w-full"
                >
                  1. Think you've got the next viral meme?
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="font-Pretendard text-[#FFFFFF] text-[18px] md:text-[24px] max-w-2xl mb-10 text-left w-full"
                >
                  2. Submit your meme and compete to create the next big
                  memecoin sensation
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="font-Pretendard text-[#FFFFFF] text-[18px] md:text-[24px] max-w-2xl mb-10 text-left w-full"
                >
                  3. Watch as memes battle for supremacy in the game. The
                  winning meme will launch as an official memecoin, funded by
                  the prize pool's liquidity
                </motion.div>
              </div>
            </div>{" "}
          </div>
          <div
            className="flex flex-col items-start justify-start text-start w-full"
            style={{ marginTop: "40px" }}
          >
            <div className="flex justify-center ">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex justify-center mt-10"
              >
                <PrimaryButton children={"Launch App"} onClick={() => {}} />
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Working;
