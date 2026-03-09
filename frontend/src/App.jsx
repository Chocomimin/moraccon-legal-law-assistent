import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./components/AuthContext";
import Header from "./components/Header";
import Hero from "./components/Hero";
import ChatPage from "./components/ChatPage";
import LoginCard from "./components/LoginCard";
import SignUpCard from "./components/SignUpCard";
import Features from "./components/Features";
import About from "./components/About";
import Footer from "./components/Footer";

function App() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />

      <Routes>
        <Route
          path="/"
          element={
            <>
              <Hero user={user} />
              <Features />
              <About />
              <Footer />
            </>
          }
        />

        <Route
          path="/login"
          element={!user ? <LoginCard /> : <Navigate to="/" />}
        />

        <Route
          path="/signup"
          element={!user ? <SignUpCard /> : <Navigate to="/" />}
        />

        <Route
          path="/features"
          element={
            <>
              <Features />
              <Footer />
            </>
          }
        />

        <Route
          path="/about"
          element={
            <>
              <About />
              <Footer />
            </>
          }
        />

        {/* 🔐 Protected Chat */}
        <Route
          path="/chat"
          element={user ? <ChatPage /> : <Navigate to="/login" />}
        />
      </Routes>
    </div>
  );
}

export default App;
