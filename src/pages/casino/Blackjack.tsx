import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BlackjackGame from "@/components/BlackjackGame";

const Blackjack = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 overflow-y-auto h-[calc(100vh-4rem)]">
          <BlackjackGame />
        </main>
      </div>
    </div>
  );
};

export default Blackjack;
