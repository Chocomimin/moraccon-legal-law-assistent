import { Link, useNavigate } from "react-router-dom";
import { Scale, User } from "lucide-react";
import { useState } from "react";
import { useAuth } from "./AuthContext";

export default function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const { user, logout } = useAuth(); // ✅ get user from context

  const handleLogout = () => {
    logout();
    navigate("/login"); // redirect to login
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
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About</Link></li>
          </ul>
        </nav>

        {/* Right Side */}
        <div className="relative flex items-center gap-4">

          {/* IF USER NOT LOGGED IN */}
          {!user ? (
            <Link
              to="/login"
              className="px-5 py-2 rounded-full bg-blue-500 text-white"
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
                <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg border rounded-lg">

                  <div className="px-4 py-3 border-b">
                    <p className="font-semibold">{user.email}</p>
                  </div>

                  <ul>
                    <li
                      onClick={handleLogout}
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