import Navbar from "../app/components/Navbar";
import Footer from "./components/Footer";
import ActiveGames from "./components/ActiveGames";

export default function Home() {
  return (
    <>
      <main className="flex flex-col gap-[32px] row-start-2 w-full items-center sm:items-start">
        <div className="bg-black min-h-screen w-full">
          <Navbar />
          <main className="bg-black">
            <div className="container mx-auto px-4 pt-20 pb-16 h-screen">
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">
                  {" "}
                  Meme. Compete. Earn.
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Join daily meme competitions where your humorous brainrot
                  turns into crypto tokens by competing with other humorous
                  brain rotters.
                </p>
              </div>

              <ActiveGames />
            </div>
          </main>

          <Footer />
        </div>
      </main>
    </>
  );
}
