import Navbar from "../app/components/Navbar";
import Footer from "./components/Footer";

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

                <div className="flex justify-center"></div>
              </div>
            </div>
          </main>

          <Footer />
        </div>
      </main>
    </>
  );
}
