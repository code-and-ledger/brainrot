import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import Navbar from "../app/components/Navbar";

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Navbar />
      <main className={styles.main}>
        <div className="absolute inset-0 flex -mt-80 justify-center items-center">
          <div className="flex flex-col items-center">
            {/* <img className="h-[40px] w-[25px]" src={heroSymbol} /> */}
            <span className="font-Pretendard text-[#FFFFFF] text-center text-[68px] md:text-[48px] mt-10">
              Meme. Compete. Earn.
            </span>
            <span className="font-Pretendard text-center text-[#FFFFFF] opacity-75 font-light mt-5 text-[18px] md:mt-2 md:text-[24px]">
              Join daily meme competitions where your creativity turns into
              crypto tokens
            </span>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <a href="https://rainbow.me" rel="noopener noreferrer" target="_blank">
          Made with ❤️ by your frens at 🌈
        </a>
      </footer>
    </div>
  );
};

export default Home;
