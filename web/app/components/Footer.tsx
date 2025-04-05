function Footer() {
  return (
    <footer className="py-6 mt-12 border-t border-gray-800 text-center items-center text-[#fff]">
      <div className="container mx-auto">
        <div
          className="flex flex-col items-center justify-center text-center w-full"
          style={{ fontFamily: "var(--font-permanent-marker)" }}
        >
          <div className="flex items-center font-Pretendard font-[800] gap-2 text-[#FFFFFF] text-[28px] md:text-[24px]     text-left">
            <img
              className="h-[26px] w-auto mr-2"
              src={"/assets/logo.png"}
              alt=""
            />
            <span style={{ fontFamily: "var(--font-permanent-marker)" }}>
              brain_rot
            </span>
            {"   "}
            <span className="font-normal">
              is place where memes come to life!
            </span>
            <span className="font-normal  ">
              Made with <span className="text-red-500">❤️</span> by{" "}
              <a
                href="https://x.com/corotvoid"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#2AD8D3] hover:underline"
              >
                COROT
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
