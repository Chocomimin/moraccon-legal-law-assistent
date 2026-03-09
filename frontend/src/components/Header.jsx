import { Link, useNavigate } from "react-router-dom";
import { Scale, User } from "lucide-react";
import { useState } from "react";
import { useAuth } from "./AuthContext";
export default function Header({ user }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
const { logout } = useAuth();
  const handleChatClick = () => {
    if (user) {
      navigate("/chat");
    } else {
      navigate("/login");
    }
  };

  return (
    <header className="w-full bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Scale className="text-blue-600" size={26} />
          <span className="font-semibold text-lg">AI Legal Assistant</span>
        </div>

        {/* Menu */}
        <nav>
          <ul className="flex items-center gap-10 text-gray-700 font-medium">
            <li><Link to="/" className="hover:text-blue-600">Home</Link></li>
            <li><button onClick={() => document.getElementById("about-section")?.scrollIntoView({behavior:'smooth'})} className="hover:text-blue-600">About</button></li>
            <li><button onClick={() => document.getElementById("features-section")?.scrollIntoView({behavior:'smooth'})} className="hover:text-blue-600">Features</button></li>
            <li><button onClick={() => document.getElementById("contact-section")?.scrollIntoView({behavior:'smooth'})} className="hover:text-blue-600">Contact</button></li>
          </ul>
        </nav>

        {/* Right — Login/Profile */}
        <div className="relative flex items-center gap-4">


          {!user ? (
            <Link
              to="/login"
              className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-500 text-white shadow-md hover:opacity-90 transition"
            >
              Login
            </Link>
          ) : (
            <div
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
              className="relative"
            >
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white cursor-pointer">
                <User size={20} />
              </div>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="font-semibold text-gray-800">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <ul className="flex flex-col text-gray-700">
                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Profile</li>
                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Settings</li>
                    <li
  onClick={logout}
  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-500"
>
  Logout
</li>

                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
