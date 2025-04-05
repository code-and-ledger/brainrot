import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import { motion } from "framer-motion";

import styles from "../styles/Home.module.css";
import Navbar from "../app/components/Navbar";
import PrimaryButton from "../app/components/primaryButton";

export default function Home() {
  return (
    <>
      <main className="flex flex-col gap-[32px] row-start-2 w-full items-center sm:items-start">
        <div className="bg-black min-h-screen w-full">
          <Navbar />
          <main className="bg-black">
            <div className="container mx-auto px-4 pt-20 pb-16 h-screen">
              <div className="flex flex-col items-center justify-center text-center">
                <h1 className="font-Pretendard text-[#FFFFFF] text-[48px] md:text-[68px] font-bold mb-6">
                  Meme. Compete. Earn.
                </h1>

                <p className="font-Pretendard text-[#FFFFFF] text-[18px] md:text-[24px] max-w-2xl mb-10">
                  Join daily meme competitions where your creativity turns into
                  crypto tokens
                </p>

                <div>
                  <PrimaryButton children={"Launch App"} onClick={() => {}} />
                </div>
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
      </main>
    </>
  );
}
