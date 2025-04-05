import { useState } from "react";
import headLogo from "../assets/headerLogo.png";
import PrimaryButton from "./primaryButton";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "./variants.js";
import HowItWorksPopup from "./HowItWorksPopup";

function Navbar() {
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);

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

            <div className="flex items-center gap-4 lg:flex-1 lg:justify-end">
              <PrimaryButton children={"Launch App"} onClick={() => {}} />
            </div>
          </nav>
        </header>
      </motion.nav>

      <HowItWorksPopup
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
      />
    </>
  );
}

export default Navbar;
