"use client";

import { useState } from "react";
import headLogo from "../assets/headerLogo.png";
import PrimaryButton from "./primaryButton";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "./variants.js";
import HowItWorksPopup from "./HowItWorksPopup";
import { useRouter } from "next/navigation";
import SecondaryButton from "./secondarybutton";

function Navbar() {
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const router = useRouter();
  return (
    <>
      <motion.nav variants={fadeInUp} className="p-4">
        <header className="bg-[#000] p-2">
          <nav
            className="mx-auto flex p-2 items-center justify-between"
            aria-label="Global"
          >
            <div className="flex items-center lg:flex-1">
              <div className="flex items-center text-white gap-2">
                <img
                  className="h-[56px] w-auto"
                  src={"/assets/logo.png"}
                  alt=""
                />
                <span className="font-Pretendard text-[#FFFFFF] text-center text-[28px] md:text-[48px] mt-10">
                  brain_rot
                </span>
              </div>
            </div>

            <div className="flex items-center gap-5   lg:justify-end">
              <div
                className="flex items-center text-[#fff] gap-4 mr-10"
                style={{ fontSize: "18px", marginRight: "10px" }}
                onClick={() => {
                  router.push("/working");
                }}
              >
                Working
              </div>
              <PrimaryButton
                children={"Launch App"}
                onClick={() => {
                  router.push("/app");
                }}
              />
            </div>
          </nav>
        </header>
      </motion.nav>

      {/* <HowItWorksPopup
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
      /> */}
    </>
  );
}

export default Navbar;
