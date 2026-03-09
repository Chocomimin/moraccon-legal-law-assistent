// Define the features data
const featureCards = [
  {
    title: 'Law-Only Answers',
    icon: '❓', // Use a relevant icon or SVG here
  },
  {
    title: 'Easy to Understand',
    icon: '💡',
  },
  {
    title: 'Fast AI-Powered Support',
    icon: '⏱️',
  },
];

// FeatureCard component for reuse
// FeatureCard component for reuse
const FeatureCard = ({ title, icon }) => (
  <div className="bg-white p-10 rounded-2xl shadow-lg hover:shadow-2xl transition duration-300 transform hover:-translate-y-1 text-center border border-gray-100 h-60 flex flex-col items-center justify-center">
    <div className="mx-auto w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 text-4xl">
      {icon}
    </div>
    <h3 className="text-2xl font-semibold text-gray-800">{title}</h3>
  </div>
);



const Features = () => {
  return (
    <section id="features-section" className="py-16">
      <h2 className="text-2xl font-bold text-gray-700 mb-8">Key Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {featureCards.map((feature, index) => (
          <FeatureCard key={index} {...feature} />
        ))}
      </div>
    </section>
  );
};

export default Features;