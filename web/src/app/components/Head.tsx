import { useState } from "react";
// import headLogo from "../assets/headerLogo.png";
import PrimaryButton from "./primaryButton";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "./variants";
function Head() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <>
      <motion.nav variants={fadeInUp} className="     ">
        <header className="bg-[#000]">
          <nav
            className="mx-auto flex  items-center justify-between  "
            aria-label="Global"
          >
            <div className="flex  lg:flex-1">
              <a href="#" className=" ">
                <img
                  className="md:h-[25px] h-[16px] w-auto"
                  src="/assets/headerLogo.png"
                  alt=""
                />
              </a>
            </div>

            <div className=" lg:flex lg:flex-1 lg:justify-end">
              <PrimaryButton children={"Launchpad (soon)"} />
            </div>
          </nav>
        </header>
      </motion.nav>
    </>
  );
}

export default Head;
