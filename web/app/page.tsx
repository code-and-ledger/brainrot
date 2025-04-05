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
                <h1 className="text-4xl font-bold mb-4">Meme Competition</h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Create and vote on memes to win cryptocurrency rewards! The
                  winning meme will be turned into a real token on the Flow
                  blockchain.
                </p>
              </div>

              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6 text-center">
                  How It Works
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="text-3xl font-bold text-blue-500 mb-4">
                      1
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Join a Game</h3>
                    <p className="text-gray-600">
                      Connect your wallet and pay the entry fee to join an
                      active meme competition.
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="text-3xl font-bold text-blue-500 mb-4">
                      2
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      Submit Your Meme
                    </h3>
                    <p className="text-gray-600">
                      Create and submit your best meme, including a name and
                      description for the potential token.
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="text-3xl font-bold text-blue-500 mb-4">
                      3
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Vote & Win</h3>
                    <p className="text-gray-600">
                      Vote on memes in multiple rounds. The winning meme creator
                      gets the prize pool and their meme becomes a token!
                    </p>
                  </div>
                </div>
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
