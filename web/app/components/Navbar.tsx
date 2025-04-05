"use client";

import { useState } from "react";
import headLogo from "../assets/headerLogo.png";
import PrimaryButton from "./primaryButton";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "./variants.js";
import HowItWorksPopup from "./HowItWorksPopup";
import { useRouter, usePathname } from "next/navigation";
import SecondaryButton from "./secondarybutton";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { CustomButton } from "./CustomButton";

function Navbar() {
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  return (
    <>
      <motion.nav variants={fadeInUp} className="p-2  ">
        <header className="bg-[#000] p-2">
          <nav
            className="mx-auto flex  items-center  justify-center"
            aria-label="Global"
          >
            <div
              className="flex items-center  cursor-pointer  lg:flex-1"
              onClick={() => {
                router.push("/");
              }}
            >
              <div className="flex items-center justify-center  text-white gap-2">
                <img
                  className="h-[46px] w-auto  "
                  src={"/assets/logo.png"}
                  alt=""
                />
                <span
                  className="font-Permanent_Marker text-[#FFFFFF] text-center text-[28px] md:text-[48px]  "
                  style={{ fontFamily: "var(--font-permanent-marker)" }}
                >
                  brain_rot
                </span>
              </div>
            </div>

            <div className="flex items-center gap-5   lg:justify-end">
              <div
                className="flex items-center cursor-pointer text-[#fff] gap-4 mr-10"
                style={{ fontSize: "18px", marginRight: "10px" }}
                onClick={() => {
                  router.push("/working");
                }}
              >
                How it works
              </div>

              {pathname === "/arena" ? (
                <CustomButton />
              ) : (
                <Link href="/arena">
                  <PrimaryButton
                    children={"Launch App"}
                    onClick={() => {
                      router.push("/arena");
                    }}
                  />
                </Link>
              )}
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
