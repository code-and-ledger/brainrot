import { useInView } from "react-intersection-observer";
import { useMediaQuery } from "react-responsive";

import { useEffect, useState } from "react";
import Head from "./Head";

function Hero() {
  const [heroLoaded, setHeroLoaded] = useState(true);
  const [startAnimation, setStartAnimation] = useState(false);
  const [startAnimation2, setStartAnimation2] = useState(false);
  const [showFinalLogo, setShowFinalLogo] = useState(false);
  const [showLast, setShowLast] = useState(false);
  const [isScrolling, setIsScrolling] = useState(true);

  const isMobile = useMediaQuery({ maxWidth: 767 });
  const { ref: myRef, inView: myElementIsVisible } = useInView();
  const { ref: revitalizeRef, inView: revitalizeRefVisible } = useInView();

  useEffect(() => {
    if (myElementIsVisible) {
      const timer1 = setTimeout(() => {
        setStartAnimation(true);
        const timer2 = setTimeout(() => {
          setStartAnimation2(true);
          const timer3 = setTimeout(() => {
            setShowFinalLogo(true);
            const timer4 = setTimeout(() => {
              setShowLast(true);
            }, 1500);
            return () => clearTimeout(timer4);
          }, 2000);
          return () => clearTimeout(timer3);
        }, 1000);
        return () => clearTimeout(timer2);
      }, 1000);
      return () => clearTimeout(timer1);
    }

    if (revitalizeRefVisible) {
      setIsScrolling(false);
    }
  }, [myElementIsVisible, revitalizeRefVisible]);

  const pfps = [
    "/assets/CloneX9169.png",
    "/assets/PudgyPenguin111.png",
    "/assets/Doodle7071.png",
    "/assets/bayc9637.png",
    "/assets/BitcoinFrog39671.png",
    "/assets/CryptoPunk2283.png",
    "/assets/azuki5596.png",
    "/assets/bitcoincats1.png",
    "/assets/badkid49841.png",
    "/assets/bayc3928.png",
    "/assets/MadLads84591.png",
    "/assets/azuki6653.png",
    "/assets/CloneX35892.png",
    "/assets/PudgyPenguin1881.png",
    "/assets/Doodle1120.png",
  ];

  const pfpsMobiles = [
    "/assets/CloneX9169.png",
    "/assets/CryptoPunk2283.png",
    "/assets/BitcoinFrog39671.png",
    "/assets/bitcoincats1.png",
    "/assets/bayc3928.png",
    "/assets/MadLads84591.png",
    "/assets/azuki6653.png",
    "/assets/CloneX35892.png",
    "/assets/PudgyPenguin1881.png",
    "/assets/Doodle1120.png",
  ];

  const pfpsScribbles = [
    "/assets/scribbleChat.png",
    "/assets/scribbleStar.png",
    "/assets/scribbleSpark.png",
    "/assets/scribbleSmiley.png",
    "/assets/scribbleDollar.png",
    "/assets/scribbleLine.png",
    "/assets/scribbleChat2.png",
  ];

  const getRandomDelay = () => Math.random() * 0.7;

  const renderPfpWithScribble = (
    pfpIndex: number,
    scribblesIndex: number,
    dimensions: {
      width?: string;
      height?: string;
      top?: string;
      left?: string;
    } = {}
  ) => {
    const {
      width = "66px",
      height = "68px",
      top = "-10px",
      left = "24px",
    } = dimensions;

    return (
      <div
        className="pfp md:h-[190px] md:w-[180px] relative"
        key={`pfp-${pfpIndex}`}
      >
        <img
          src={pfps[pfpIndex % pfps.length]}
          style={{ animationDelay: `${getRandomDelay()}s` }}
          className="pfp md:h-[190px] md:w-[180px]"
          alt={`Profile ${pfpIndex}`}
        />
        <img
          src={pfpsScribbles[scribblesIndex % pfpsScribbles.length]}
          style={{
            animationDelay: `${getRandomDelay()}s`,
            width,
            height,
          }}
          className={`pfpscribbles absolute ${top} ${left} z-10`}
          alt="Scribble"
        />
      </div>
    );
  };

  const renderPfp = (pfpIndex: number) => (
    <img
      src={pfps[pfpIndex % pfps.length]}
      style={{ animationDelay: `${getRandomDelay()}s` }}
      className="pfp md:h-[190px] md:w-[180px] mb-4"
      alt={`Profile ${pfpIndex}`}
    />
  );

  return (
    <div className=" ">
      <Head />
      <main className="  ">
        <div
          className={`flex flex-col items-center lg:justify-center  mt-5 h-screen 
             bg-contain bg-no-repeat bg-center  `}
        >
          {heroLoaded && (
            <>
              <div className="relative w-full">
                <div className="flex justify-start items-start  h-full overflow-hidden">
                  <div className="flex flex-col w-1/2">
                    <div className="mb-10 ml-32 md:block hidden animate-slideLeft">
                      <img
                        src="/assets/cloudLeft.png"
                        alt="Cloud Left"
                        className="w-[120px] h-[70px]"
                      />
                    </div>
                    <div className="mb-10 -ml-9 md:mt-0 mt-48 animate-slideLeft">
                      <img
                        src="/assets/cloudLeft.png"
                        alt="Cloud Left"
                        className="w-[120px] h-[70px]"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col items-end w-1/2">
                    <div className="mb-10 mr-32 md:block animate-slideRight">
                      <img
                        src="/assets/cloudRight.png"
                        alt="Cloud Right"
                        className="w-[120px] h-[70px]"
                      />
                    </div>
                    <div className="mb-10 -mr-10 animate-slideRight">
                      <img
                        src="/assets/cloudRight.png"
                        alt="Cloud Right"
                        className="w-[120px] h-[70px]"
                      />
                    </div>
                  </div>
                </div>

                <div className="absolute inset-0 flex      justify-center items-center">
                  <div className="flex flex-col items-center w-full max-w-4xl mx-auto px-4">
                    <img
                      className="h-[40px] w-[25px]"
                      src="/assets/heroSymbol.png"
                      alt="Hero Symbol"
                    />
                    <span className="font-Pretendard text-[#FFFFFF]  text-center text-[32px] md:text-[56px] mt-10">
                      Meet Your Other Self in the Web3
                    </span>
                    <span className="font-Pretendard text-center text-[#FFFFFF] opacity-75 font-light mt-5 text-[20px] md:mt-2 md:text-[28px]">
                      Where Your Digital Clone Comes to Life powered by AI
                    </span>
                  </div>
                </div>

                <div className="absolute bottom-0 mb-24 w-full">
                  {!isMobile && (
                    <div className="hero-section flex flex-row justify-between items-end overflow-x-clip w-full px-4 md:px-8 lg:px-16">
                      <div className="pfp-container flex justify-between w-full">
                        {renderPfpWithScribble(0, 0, {
                          top: "-top-12",
                          left: "left-32",
                          width: "95px",
                          height: "54px",
                        })}
                        {renderPfp(1)}
                        {renderPfpWithScribble(2, 1, {
                          top: "-top-10",
                          left: "left-24",
                          width: "66px",
                          height: "68px",
                        })}
                        {renderPfp(3)}
                        {renderPfp(4)}
                        {renderPfpWithScribble(5, 2, {
                          top: "-top-12",
                          left: "left-16",
                          width: "66px",
                          height: "65px",
                        })}
                        {renderPfp(6)}
                        {renderPfp(7)}
                        {renderPfp(8)}
                        {renderPfp(9)}
                        {renderPfp(10)}
                        {renderPfpWithScribble(11, 3, {
                          top: "-top-20",
                          left: "left-10",
                          width: "73px",
                          height: "72px",
                        })}
                        {renderPfpWithScribble(12, 4, {
                          top: "-top-24",
                          left: "left-10",
                          width: "39px",
                          height: "83px",
                        })}
                        {renderPfpWithScribble(13, 5, {
                          top: "-top-10",
                          left: "left-20",
                          width: "57px",
                          height: "43px",
                        })}
                        {renderPfpWithScribble(14, 6, {
                          top: "-top-10",
                          left: "left-10",
                          width: "66px",
                          height: "66px",
                        })}
                      </div>
                    </div>
                  )}

                  {isMobile && (
                    <div className="hero-section flex flex-row justify-between items-end overflow-x-clip w-full px-4">
                      <div className="pfp-container flex-col-reverse flex items-center w-full">
                        <div className="flex flex-row items-center -mt-16 z-10 justify-between w-full">
                          {pfpsMobiles.slice(0, 5).map((src, i) => (
                            <img
                              key={`mobile-pfp-${i}`}
                              src={src}
                              style={{ animationDelay: `${getRandomDelay()}s` }}
                              className="pfp w-[60px] h-[60px] md:w-[80px] md:h-[80px]"
                              alt={`Mobile Profile ${i}`}
                            />
                          ))}
                        </div>
                        <div className="flex flex-row items-center justify-between w-full">
                          {pfpsMobiles.slice(5, 10).map((src, i) => (
                            <img
                              key={`mobile-pfp-${i + 5}`}
                              src={src}
                              style={{ animationDelay: `${getRandomDelay()}s` }}
                              className="pfp w-[60px] h-[60px] md:w-[80px] md:h-[80px]"
                              alt={`Mobile Profile ${i + 5}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="relative w-full mt-0 md:mt-32 overflow-hidden">
                  <div className="  justify-start items-start h-screen overflow-hidden absolute top-0">
                    {startAnimation && (
                      <>
                        <div className="flex flex-col w-1/2">
                          <div className="mb-10 ml-32 animate-slideLeft">
                            {showLast && (
                              <img
                                src="/assets/smallStar.png"
                                className="h-[15px] fadeStar w-[15px]"
                                alt="Small Star"
                              />
                            )}
                            <img
                              src="/assets/cloudFaded.png"
                              alt="Cloud Faded"
                              className="w-[120px] h-[70px]"
                            />
                            {showLast && (
                              <img
                                src="/assets/smallStar.png"
                                className="h-[15px] ml-10 mt-5 fadeStar w-[15px]"
                                alt="Small Star"
                              />
                            )}
                          </div>
                          <div className="mb-10 ml-96 animate-slideLeft">
                            {showLast && (
                              <img
                                src="/assets/smallStar.png"
                                className="h-[15px] fadeStar w-[15px]"
                                alt="Small Star"
                              />
                            )}
                            <img
                              src="/assets/cloudFaded.png"
                              alt="Cloud Faded"
                              className="w-[120px] h-[70px]"
                            />
                            {showLast && (
                              <img
                                src="/assets/smallStar.png"
                                className="h-[15px] ml-72 fadeStar w-[15px]"
                                alt="Small Star"
                              />
                            )}
                          </div>
                          <div className="mb-10 -ml-9 animate-slideLeft">
                            {showLast && (
                              <img
                                src="/assets/smallStar.png"
                                className="h-[15px] ml-72 fadeStar w-[15px]"
                                alt="Small Star"
                              />
                            )}
                            <img
                              src="/assets/cloudFaded.png"
                              alt="Cloud Faded"
                              className="w-[120px] h-[70px]"
                            />
                            {showLast && (
                              <img
                                src="/assets/smallStar.png"
                                className="h-[15px] ml-44 fadeStar w-[15px]"
                                alt="Small Star"
                              />
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end w-1/2">
                          <div className="mb-10 mr-32 animate-slideRight">
                            {showLast && (
                              <img
                                src="/assets/smallStar.png"
                                className="h-[15px] fadeStar w-[15px]"
                                alt="Small Star"
                              />
                            )}
                            <img
                              src="/assets/cloudFaded.png"
                              alt="Cloud Faded"
                              className="w-[120px] h-[70px]"
                            />
                            {showLast && (
                              <img
                                src="/assets/smallStar.png"
                                className="h-[15px] ml-72 fadeStar w-[15px]"
                                alt="Small Star"
                              />
                            )}
                          </div>
                          <div className="mb-10 -mr-10 animate-slideRight">
                            <img
                              src="/assets/cloudFaded.png"
                              alt="Cloud Faded"
                              className="w-[120px] h-[70px]"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div>
                    <div className="relative w-full mt-32 overflow-hidden">
                      <div className="flex justify-start items-start overflow-hidden">
                        {startAnimation && (
                          <>
                            <div className="flex flex-col w-1/2">
                              <div className="mb-10 ml-32 animate-slideLeft">
                                {showLast && (
                                  <img
                                    src="/assets/smallStar.png"
                                    className="h-[15px] fadeStar w-[15px]"
                                    alt="Small Star"
                                  />
                                )}
                                <img
                                  src="/assets/cloudFaded.png"
                                  alt="Cloud Faded"
                                  className="w-[120px] h-[70px]"
                                />
                                {showLast && (
                                  <img
                                    src="/assets/smallStar.png"
                                    className="h-[15px] ml-10 mt-5 fadeStar w-[15px]"
                                    alt="Small Star"
                                  />
                                )}
                              </div>
                              <div className="mb-10 ml-96 animate-slideLeft">
                                {showLast && (
                                  <img
                                    src="/assets/smallStar.png"
                                    className="h-[15px] fadeStar w-[15px]"
                                    alt="Small Star"
                                  />
                                )}
                                <img
                                  src="/assets/cloudFaded.png"
                                  alt="Cloud Faded"
                                  className="w-[120px] h-[70px]"
                                />
                                {showLast && (
                                  <img
                                    src="/assets/smallStar.png"
                                    className="h-[15px] ml-72 fadeStar w-[15px]"
                                    alt="Small Star"
                                  />
                                )}
                              </div>
                              <div className="mb-10 -ml-9 animate-slideLeft">
                                {showLast && (
                                  <img
                                    src="/assets/smallStar.png"
                                    className="h-[15px] ml-72 fadeStar w-[15px]"
                                    alt="Small Star"
                                  />
                                )}
                                <img
                                  src="/assets/cloudFaded.png"
                                  alt="Cloud Faded"
                                  className="w-[120px] h-[70px]"
                                />
                                {showLast && (
                                  <img
                                    src="/assets/smallStar.png"
                                    className="h-[15px] ml-44 fadeStar w-[15px]"
                                    alt="Small Star"
                                  />
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end w-1/2">
                              <div className="mb-10 mr-32 animate-slideRight">
                                {showLast && (
                                  <img
                                    src="/assets/smallStar.png"
                                    className="h-[15px] fadeStar w-[15px]"
                                    alt="Small Star"
                                  />
                                )}
                                <img
                                  src="/assets/cloudFaded.png"
                                  alt="Cloud Faded"
                                  className="w-[120px] h-[70px]"
                                />
                                {showLast && (
                                  <img
                                    src="/assets/smallStar.png"
                                    className="h-[15px] ml-72 fadeStar w-[15px]"
                                    alt="Small Star"
                                  />
                                )}
                              </div>
                              <div className="mb-10 -mr-10 animate-slideRight">
                                <img
                                  src="/assets/cloudFaded.png"
                                  alt="Cloud Faded"
                                  className="w-[120px] h-[70px]"
                                />
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      {showLast && (
                        <div className="absolute fadeAlterim inset-0 flex mt-20 justify-center items-center">
                          <div className="flex flex-col items-center z-10">
                            <img
                              className="h-[190px] w-[190px] absolute bottom-100 z-0"
                              src="/assets/starWithBG.png"
                              alt="Star with Background"
                            />

                            <span className="font-Pretendard text-[#FFFFFF] text-center font-extralight text-[20px] md:text-[40px] mt-10 z-10">
                              <span className="custom-gradient-text-normal mt-20">
                                Revitalize Your{" "}
                              </span>
                              <span className="font-normal text-[20px] md:text-[40px] leading-[80px] -tracking-[0.8px] custom-gradient-text">
                                PFP{" "}
                              </span>
                              <span className="custom-gradient-text-normal">
                                into{" "}
                              </span>
                              <span className="text-[20px] md:text-[40px] font-normal leading-[80px] -tracking-[0.8px] custom-gradient-text">
                                Clone
                              </span>
                            </span>

                            <div className="text-[#fff] text-[12px] md:text-[20px] text-center mt-10 font-light z-10">
                              Your PFP is no longer just a collectible;
                              <br /> it's uniquely crafted personas with their
                              own identity
                              <br />
                              powered by{" "}
                              <span className="text-[#44FFD2]">Alterim.ai</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* <div
            ref={revitalizeRef}
            className="inset-0 flex justify-center items-start"
          >
            <StepForm isMobile={isMobile} />
          </div>

          <div className="inset-0 flex -mt-48 justify-center items-center">
            <ChatWindow isMobile={isMobile} />
          </div>

          <div className="inset-0 flex -mt-96 md:-mt-48 justify-center items-center">
            <SocialWindow isMobile={isMobile} />
          </div>

          <div className="inset-0 flex -mt-96 md:-mt-48 justify-center items-center">
            <TradingWindow isMobile={isMobile} />
          </div> */}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default Hero;
