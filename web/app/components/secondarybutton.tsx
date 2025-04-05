import React from "react";

const SecondaryButton = ({ children }: any) => {
  return (
    <div className=" flex cursor-pointer justify-center flex-row  px-[10px] py-[13px] bg-[#fff]  rounded-full border-[1px] border-[#312E2A]   shadow-normal  text-[#020202]  ">
      <div className="flex flex-row  items-center justify-center font-Pretendard font-[14px] md:font-[18px]">
        {children}
      </div>
    </div>
  );
};

export default SecondaryButton;
