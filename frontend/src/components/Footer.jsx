const Footer = () => {
  const quickLinks = ['Home', 'About', 'Features', 'Contact'];

  return (
    <footer id="contact-section" className="bg-gray-800 text-white mt-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Footer Content Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 border-b border-gray-700 pb-6 mb-6">

          {/* Logo and Copyright */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center space-x-2 mb-2">
              <div className="text-blue-400">⚖️</div>
              <span className="text-xl font-semibold">AI Legal Assistant</span>
            </div>
            <p className="text-sm text-gray-400">
              &copy; 2025 AI Assistant - All Rights Reserved.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-3">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              {quickLinks.map(link => (
                <li key={link}>
                  <a href={`#${link.toLowerCase()}`} className="hover:text-blue-400 transition">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="font-bold text-lg mb-3">Contact Info</h4>
            <p className="text-gray-400">
              <span className="font-semibold">Email:</span> info@ailegaps.com<br/>
              <span className="font-semibold">Phone:</span> (555) 123-667
            </p>
          </div>

          {/* Social Media */}
          <div className="col-span-2 md:col-span-1 flex md:justify-end items-center space-x-4">
             <div className="text-blue-400 text-2xl hover:text-blue-500 transition">f</div>
             <div className="text-blue-400 text-2xl hover:text-blue-500 transition">t</div>
             <div className="text-blue-400 text-2xl hover:text-blue-500 transition">in</div>
          </div>
        </div>
      </div>
    </footer>
  );
};


export default Footer;