import React, { useState } from "react";
import { Link } from "react-router-dom";

const Home = () => {
  // FAQ state management
  const [activeCategory, setActiveCategory] = useState("All questions");
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  // FAQ data
  const faqData = [
    {
      id: 1,
      category: "GENERAL",
      question: "How to start skill exchange?",
      answer:
        "To start skill exchange, simply create an account, complete your profile with your skills and interests, browse available skills or mentors, and connect with someone whose expertise matches what you want to learn.",
    },
    {
      id: 2,
      category: "SKILL EXCHANGE",
      question: "How long does an exchange usually take?",
      answer:
        "The duration of skill exchanges varies depending on the complexity of the skill and the arrangement between participants. Most exchanges range from a few weeks to several months, with sessions typically lasting 1-2 hours.",
    },
    {
      id: 3,
      category: "TECHNICAL",
      question: "What technology do I need for online exchanges?",
      answer:
        "For online exchanges, you need a stable internet connection, a computer or mobile device with a camera and microphone, and access to video calling platforms like Zoom, Google Meet, or Skype. Some skills may require specific software.",
    },
    {
      id: 4,
      category: "GENERAL",
      question: "Is SkillSwap available worldwide?",
      answer:
        "Yes, SkillSwap is available worldwide. Our platform connects learners and mentors from all countries, allowing for global skill exchange and cultural learning experiences.",
    },
    {
      id: 5,
      category: "SKILL EXCHANGE",
      question: "Can I exchange multiple skills at once?",
      answer:
        "Yes, you can participate in multiple skill exchanges simultaneously. However, we recommend starting with one or two exchanges to ensure you can dedicate adequate time and attention to each learning experience.",
    },
    {
      id: 6,
      category: "TECHNICAL",
      question: "How secure is my personal information?",
      answer:
        "We take data security seriously. All personal information is encrypted, and we never share your data with third parties without consent. We comply with global data protection regulations including GDPR.",
    },
  ];

  // Filter FAQs based on active category
  const filteredFAQs =
    activeCategory === "All questions"
      ? faqData
      : faqData.filter((faq) => faq.category === activeCategory.toUpperCase());

  // Toggle FAQ expansion
  const toggleFAQ = (faqId) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  // Get category color
  const getCategoryColor = (category) => {
    switch (category) {
      case "GENERAL":
        return "text-green-500";
      case "SKILL EXCHANGE":
        return "text-primary-10";
      case "TECHNICAL":
        return "text-purple-500";
      default:
        return "text-gray-500";
    }
  };
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div
        className="relative min-h-screen flex items-center justify-center bg-cover bg-center bg-gray-800"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('./images/background.avif')`,
        }}
      >
        <div className="text-center text-white max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Welcome to <span className="text-primary-10">SkillSwap</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl mb-8 text-gray-200 max-w-2xl mx-auto leading-relaxed">
            Exchange skills, learn together, and grow with a vibrant community
            of learners and mentors where knowledge flows both ways.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/discover"
              className="bg-primary-10 hover:bg-secondary-10 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl inline-block"
            >
              Find Skills to Learn
            </Link>

            <Link
              to="/discover"
              className="border-2 border-white text-white hover:bg-white hover:text-gray-800 font-semibold py-3 px-8 rounded-lg transition-all duration-200 inline-block"
            >
              Share Your Skills
            </Link>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="min-h-screen flex items-center bg-gray-100">
        <div
          className="mx-auto px-4 sm:px-6 lg:px-8"
          style={{ maxWidth: "100rem" }}
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              How It Works
            </h2>
            <div className="w-16 h-1 bg-gray-400 mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 - Register */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden relative">
              {/* Gray top half */}
              <div className="bg-gray-200 h-40 relative flex items-center justify-center">
                <div className="absolute top-4 left-4 bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-sm rotating-circle">
                  <span className="text-gray-600 text-xl font-bold">1</span>
                </div>
                <h3
                  className="font-bold text-gray-800"
                  style={{ fontSize: "2.5rem" }}
                >
                  Register
                </h3>
              </div>
              {/* White bottom half */}
              <div className="p-6 text-center">
                <p
                  className="text-gray-600 leading-relaxed"
                  style={{ fontSize: "1.5rem" }}
                >
                  Create an account and specify your skills and interests
                </p>
              </div>
            </div>

            {/* Step 2 - Choose a skill */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden relative">
              {/* Gray top half */}
              <div className="bg-gray-200 h-40 relative flex items-center justify-center">
                <div className="absolute top-4 left-4 bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-sm rotating-circle">
                  <span className="text-gray-600 text-xl font-bold">2</span>
                </div>
                <h3
                  className="font-bold text-gray-800"
                  style={{ fontSize: "2.5rem" }}
                >
                  Choose a skill
                </h3>
              </div>
              {/* White bottom half */}
              <div className="p-6 text-center">
                <p
                  className="text-gray-600 leading-relaxed"
                  style={{ fontSize: "1.5rem" }}
                >
                  Find a skill you're interested in or people to exchange with
                </p>
              </div>
            </div>

            {/* Step 3 - Start exchanging */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden relative">
              {/* Gray top half */}
              <div className="bg-gray-200 h-40 relative flex items-center justify-center">
                <div className="absolute top-4 left-4 bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-sm rotating-circle">
                  <span className="text-gray-600 text-xl font-bold">3</span>
                </div>
                <h3
                  className="font-bold text-gray-800"
                  style={{ fontSize: "2.5rem" }}
                >
                  Start exchanging
                </h3>
              </div>
              {/* White bottom half */}
              <div className="p-6 text-center">
                <p
                  className="text-gray-600 leading-relaxed"
                  style={{ fontSize: "1.5rem" }}
                >
                  Communicate and exchange knowledge in a convenient format
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose SkillSwap Section */}
      <div className="min-h-screen flex items-center bg-gray-50">
        <div
          className="mx-auto px-4 sm:px-6 lg:px-8"
          style={{ maxWidth: "100rem" }}
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Why Choose SkillSwap?
            </h2>
            <div className="w-16 h-1 bg-primary-10 mx-auto"></div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Image */}
            <div className="order-2 lg:order-1">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80"
                alt="People collaborating and learning together"
                className="rounded-lg shadow-lg w-full h-auto"
              />
            </div>

            {/* Right side - Content */}
            <div className="order-1 lg:order-2">
              <p
                className="text-gray-600 leading-relaxed mb-8"
                style={{ fontSize: "1.125rem" }}
              >
                SkillSwap is a platform dedicated to connecting people who want
                to learn with those who want to teach. We believe that everyone
                has valuable skills to share, and our mission is to make skill
                sharing accessible, enjoyable, and rewarding for everyone.
              </p>

              <div className="space-y-6">
                {/* Feature 1 */}
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-8 h-8 bg-primary-10 rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg">👥</span>
                    </div>
                  </div>
                  <p className="text-gray-700" style={{ fontSize: "1.125rem" }}>
                    Connect with a diverse community of experts and learners
                  </p>
                </div>

                {/* Feature 2 */}
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-8 h-8 bg-primary-10 rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg">🎓</span>
                    </div>
                  </div>
                  <p className="text-gray-700" style={{ fontSize: "1.125rem" }}>
                    Learn new skills at your own pace with personalized guidance
                  </p>
                </div>

                {/* Feature 3 */}
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-8 h-8 bg-primary-10 rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg">💡</span>
                    </div>
                  </div>
                  <p className="text-gray-700" style={{ fontSize: "1.125rem" }}>
                    Share your expertise and earn while helping others grow
                  </p>
                </div>

                {/* Feature 4 */}
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-8 h-8 bg-primary-10 rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg">📚</span>
                    </div>
                  </div>
                  <p className="text-gray-700" style={{ fontSize: "1.125rem" }}>
                    Access a wide range of courses and resources in various
                    fields
                  </p>
                </div>
              </div>

              {/* Call to Action Button */}
              <div className="mt-8">
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center">
                  Discover Our Community
                  <span className="ml-2">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Community Feedback Section */}
      <div className="py-20 bg-white">
        <div
          className="mx-auto px-4 sm:px-6 lg:px-8"
          style={{ maxWidth: "100rem" }}
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Community Feedback
            </h2>
            <div className="w-16 h-1 bg-primary-10 mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-gray-50 rounded-lg p-8 shadow-sm">
              <div className="mb-6">
                <p
                  className="text-gray-600 italic leading-relaxed"
                  style={{ fontSize: "1.125rem" }}
                >
                  "SkillSwap changed my life! I found new friends and learned to
                  draw."
                </p>
              </div>
              <div className="flex items-center">
                <span
                  className="text-green-600 font-medium"
                  style={{ fontSize: "1rem" }}
                >
                  — Haresh-Umerkot
                </span>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-gray-50 rounded-lg p-8 shadow-sm">
              <div className="mb-6">
                <p
                  className="text-gray-600 italic leading-relaxed"
                  style={{ fontSize: "1.125rem" }}
                >
                  "I never thought I would learn a programming language so
                  quickly and with such pleasure!"
                </p>
              </div>
              <div className="flex items-center">
                <span
                  className="text-green-600 font-medium"
                  style={{ fontSize: "1rem" }}
                >
                  — Sohail-Mithi
                </span>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-gray-50 rounded-lg p-8 shadow-sm">
              <div className="mb-6">
                <p
                  className="text-gray-600 italic leading-relaxed"
                  style={{ fontSize: "1.125rem" }}
                >
                  "The best platform for those who want to expand their horizons
                  and share knowledge."
                </p>
              </div>
              <div className="flex items-center">
                <span
                  className="text-green-600 font-medium"
                  style={{ fontSize: "1rem" }}
                >
                  — Khushal-Tharparkar
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions Section */}
      <div className="py-20 bg-gray-50">
        <div
          className="mx-auto px-4 sm:px-6 lg:px-8"
          style={{ maxWidth: "100rem" }}
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Frequently Asked Questions
            </h2>
            <div className="w-16 h-1 bg-primary-10 mx-auto mb-6"></div>
            <p className="text-gray-600 text-lg">
              Find answers to the most popular questions about our platform
            </p>
          </div>

          {/* Category Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {["All questions", "General", "Skill exchange", "Technical"].map(
              (category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-6 py-2 rounded-full font-medium transition-colors ${activeCategory === category
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                >
                  {category}
                </button>
              )
            )}
          </div>

          {/* FAQ Items */}
          <div className="mx-auto" style={{ maxWidth: "100rem" }}>
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-4">
                {filteredFAQs
                  .slice(0, Math.ceil(filteredFAQs.length / 2))
                  .map((faq) => (
                    <div
                      key={faq.id}
                      className="bg-white rounded-lg shadow-sm border border-gray-200"
                    >
                      <div
                        className="p-6 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                        onClick={() => toggleFAQ(faq.id)}
                      >
                        <div>
                          <div
                            className={`${getCategoryColor(
                              faq.category
                            )} text-sm font-medium mb-1`}
                          >
                            {faq.category}
                          </div>
                          <h3 className="text-gray-800 font-medium text-lg">
                            {faq.question}
                          </h3>
                        </div>
                        <span className="text-gray-400 text-xl">
                          {expandedFAQ === faq.id ? "-" : "+"}
                        </span>
                      </div>
                      {expandedFAQ === faq.id && (
                        <div className="px-6 pb-6">
                          <div className="pt-4 border-t border-gray-100">
                            <p className="text-gray-600 leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {filteredFAQs
                  .slice(Math.ceil(filteredFAQs.length / 2))
                  .map((faq) => (
                    <div
                      key={faq.id}
                      className="bg-white rounded-lg shadow-sm border border-gray-200"
                    >
                      <div
                        className="p-6 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                        onClick={() => toggleFAQ(faq.id)}
                      >
                        <div>
                          <div
                            className={`${getCategoryColor(
                              faq.category
                            )} text-sm font-medium mb-1`}
                          >
                            {faq.category}
                          </div>
                          <h3 className="text-gray-800 font-medium text-lg">
                            {faq.question}
                          </h3>
                        </div>
                        <span className="text-gray-400 text-xl">
                          {expandedFAQ === faq.id ? "-" : "+"}
                        </span>
                      </div>
                      {expandedFAQ === faq.id && (
                        <div className="px-6 pb-6">
                          <div className="pt-4 border-t border-gray-100">
                            <p className="text-gray-600 leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Call to Action Card */}
          <div className="flex justify-center mt-12 mb-16">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 max-w-md w-full mx-4">
              <div className="text-center">
                <p className="text-gray-600 mb-6 text-lg">
                  Didn't find an answer to your question?
                </p>
                <Link
                  to="/contact"
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-8 rounded-lg transition-colors duration-200 inline-block"
                >
                  Contact us
                </Link>

              </div>
            </div>
          </div>

          {/* Where to Start Section */}
          <div className="py-20 bg-gray-50">
            <div
              className="mx-auto px-4 sm:px-6 lg:px-8"
              style={{ maxWidth: "100rem" }}
            >
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                  Where to Start
                </h2>
                <div className="w-16 h-1 bg-primary-10 mx-auto"></div>
              </div>

              <div className="mx-auto" style={{ maxWidth: "100rem" }}>
                <div className="grid md:grid-cols-2 gap-12 items-start">
                  {/* Left Column - Steps */}
                  <div className="space-y-8">
                    {/* Step 1 */}
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-gray-600 font-bold text-sm">
                            1
                          </span>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-gray-600 font-normal text-lg">
                          Register and create a profile
                        </h3>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-gray-600 font-bold text-sm">
                            2
                          </span>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-gray-600 font-normal text-lg">
                          Specify the skills you have
                        </h3>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-gray-600 font-bold text-sm">
                            3
                          </span>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-gray-600 font-normal text-lg">
                          Choose skills you want to learn
                        </h3>
                      </div>
                    </div>

                    {/* Step 5 */}
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-gray-600 font-bold text-sm">
                            5
                          </span>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-gray-600 font-normal text-lg">
                          Start exchanging skills and knowledge
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Tip and Step 4 */}
                  <div className="space-y-8">
                    {/* Tip */}
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <p className="text-gray-600 font-normal text-center">
                        <span className="font-semibold">Tip:</span> Start small!
                        Choose one skill to learn and one to teach.
                      </p>
                    </div>

                    {/* Step 4 */}
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-gray-600 font-bold text-sm">
                            4
                          </span>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-gray-600 font-normal text-lg">
                          Find a suitable exchange partner
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Join Now Section */}
          <div className="py-20 bg-gray-100 relative overflow-hidden">
            {/* Decorative Elements */}
            <div
              className="absolute bottom-0 left-0 w-60 h-60 bg-green-200 rounded-full opacity-30"
              style={{ marginBottom: "-7.5rem", marginLeft: "-7.5rem" }}
            ></div>
            <div
              className="absolute top-0 right-0 w-60 h-60 bg-green-200 rounded-full opacity-30"
              style={{ marginTop: "-7.5rem", marginRight: "-7.5rem" }}
            ></div>

            <div
              className="mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
              style={{ maxWidth: "100rem" }}
            >
              <div className="text-center">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                  Join Now
                </h2>
                <p className="text-gray-500 text-lg mb-8">
                  Do you want to start your journey?
                </p>
                <Link
                  to="/discover"
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-3 px-8 rounded-md transition-colors duration-200 inline-block"
                >
                  Start Exchanging Skills
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
