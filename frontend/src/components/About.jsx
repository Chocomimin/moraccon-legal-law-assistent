const About = () => {
  return (
    <section id="about-section" className="py-16">
      <h2 className="text-2xl font-bold text-gray-700 mb-4">About Us</h2>

      <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-blue-600 h-90 flex flex-col justify-center">
        <p className="text-gray-600 text-lg">
          AI Legal Assistant is an online platform created to make complex legal
          concepts simple, clear, and easy to understand. Our mission is to offer
          accessible, accurate, and user-friendly legal information using
          <strong> AI-powered technology</strong>.
          <br /><br />
          We help users learn about:
          <br />• Their legal rights
          <br />• Important legal terms
          <br />• Common law-related questions
          <br />• How legal processes work
          <br /><br />
          This platform is designed for <strong>educational and awareness purposes only</strong>.
          It provides general legal information and
          <strong> should not be considered professional legal advice</strong>.
          For any serious or personal legal issues, please consult a qualified lawyer.
        </p>
      </div>
    </section>
  );
};

export default About;
