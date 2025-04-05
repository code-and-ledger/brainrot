import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import { motion } from "framer-motion";

import styles from "../styles/Home.module.css";
import Navbar from "../app/components/Navbar";
import PrimaryButton from "../app/components/primaryButton";

const Home: NextPage = () => {
  return (
    <div className="bg-black min-h-screen">
      <Navbar />
      <main className="bg-black">
        <div className="container mx-auto px-4 pt-20 pb-16 h-screen">
          <div className="flex flex-col items-center justify-center text-center">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-Pretendard text-[#FFFFFF] text-[48px] md:text-[68px] font-bold mb-6"
            >
              Meme. Compete. Earn.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-Pretendard text-[#FFFFFF] text-[18px] md:text-[24px] max-w-2xl mb-10"
            >
              Join daily meme competitions where your creativity turns into
              crypto tokens
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <PrimaryButton children={"Launch App"} onClick={() => {}} />
            </motion.div>
          </div>
        </div>
      </main>

      <footer className="py-6 mt-12 border-t border-gray-800 text-center text-[#fff]">
        <div className="container mx-auto">
          <p className="flex items-center justify-center gap-2">
            Made with <span className="text-red-500">❤️</span> by
            <a
              href="https://github.com/brain-rot"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#2AD8D3] hover:underline"
            >
              brain_rot
            </a>
          </p>
          <p className="mt-2 text-sm">
            © {new Date().getFullYear()} All rights reserved
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
