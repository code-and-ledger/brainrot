import React from "react";
import { useMediaQuery } from "react-responsive";
const UIContainer = ({ children }) => {
  const Desktop = ({ children }) => {
    const isDesktop = useMediaQuery({ minWidth: 1200 });
    return isDesktop ? children : null;
  };
  const Tablet = ({ children }) => {
    const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1200 });
    return isTablet ? children : null;
  };
  const Mobile = ({ children }) => {
    const isMobile = useMediaQuery({ maxWidth: 767 });
    return isMobile ? children : null;
  };
  return (
    <>
      <Desktop>
        <div className=" p-4">{children}</div>
      </Desktop>
      <Tablet>
        <div className="my-[20px] mx-[40px] p-0">{children}</div>
      </Tablet>
      <Mobile>
        <div className="p-4 ">{children}</div>
      </Mobile>
    </>
  );
};

export default UIContainer;
