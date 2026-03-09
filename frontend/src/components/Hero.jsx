import { useNavigate } from "react-router-dom";
import heroImg from "../assets/hero.png";
import bgImg from "../assets/bg.png";

export default function Hero({ user }) {
  const navigate = useNavigate();

  const handleStartChat = () => {
    if (user) {
      navigate("/chat");
    } else {
      navigate("/login");
    }
  };

  return (
    <div
      className="w-full min-h-screen bg-cover bg-center flex items-center justify-center p-10"
      style={{ backgroundImage: `url(${bgImg})` }}
    >
      <div className="w-full flex items-center justify-between gap-20">
        {/* Left Content */}
        <div className="flex flex-col gap-6 max-w-xl p-6 ml-32">
          <h1 className="text-6xl font-bold text-gray-900 leading-tight">
            Your AI Legal <br /> Assistant
          </h1>
          <p className="text-gray-700 text-xl leading-relaxed">
            Get simplified legal explanations, rights awareness, and
            law-related knowledge – for educational purposes.
          </p>
          <div className="flex gap-4 mt-4">
            <button
              onClick={handleStartChat}
              className="px-8 py-4 bg-[#2c7df0] text-white rounded-full shadow hover:opacity-90 text-xl transition duration-300"
            >
              Start Chat
            </button>
            <button className="px-8 py-4 border border-gray-400 text-gray-900 rounded-full text-xl hover:bg-gray-100 transition duration-300">
              Learn More
            </button>
          </div>
        </div>

        {/* Right Image */}
        <div className="w-[600px] h-auto object-contain drop-shadow-2xl">
          <img
            src={heroImg}
            alt="AI Legal Assistant"
            className="w-[600px] h-auto object-contain drop-shadow-lg"
          />
        </div>
      </div>
    </div>
  );
}
