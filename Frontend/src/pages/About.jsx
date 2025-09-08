import React from "react";

const About = () => {
  return (
    <div className="min-h-screen">
      {/* 1. About SkillSwap - Hero Section */}
      <div
        className="relative min-h-screen flex items-center justify-center bg-cover bg-center bg-gray-800"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('./images/background.avif')`,
        }}
      >
        <div className="text-center text-white max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            About SkillSwap
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed">
            Learn more about our mission, values, and the team behind SkillSwap.
          </p>
        </div>
      </div>

      {/* 2. Our Mission */}
      <div className="py-20 bg-white">
        <div
          className="mx-auto px-4 sm:px-6 lg:px-8"
          style={{ maxWidth: "100rem" }}
        >
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            {/* Left side - Content (70% width) */}
            <div className="lg:w-7/10" style={{ width: "70%" }}>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                Our Mission
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p class="text-[1.4rem]">
                  At SkillSwap, our mission is to democratize knowledge sharing
                  and create a global community where everyone can learn from
                  each other. We believe that everyone has valuable skills and
                  knowledge to share, and we're committed to making skill
                  sharing accessible, enjoyable, and rewarding for all.
                </p>
                <p class="text-[1.4rem]">
                  We're building a platform that connects people who want to
                  learn with those who want to teach, breaking down barriers to
                  education and creating opportunities for personal and
                  professional growth.
                </p>
              </div>
            </div>

            {/* Right side - Polaroid Images (30% width) */}
            <div
              className="relative h-96 w-full bg-slate-800 rounded-lg p-4 flex items-center justify-center"
              style={{ width: "30%" }}
            >
              {/* Top Left Polaroid - Orange Background with Woman */}
              <div className="absolute top-6 left-6 bg-white p-3 rounded-lg shadow-xl transform -rotate-12 hover:rotate-0 transition-transform duration-300">
                <div className="w-28 h-28 bg-gradient-to-r from-orange-400 to-orange-500 rounded-md overflow-hidden mb-2 flex items-center justify-center">
                  <img
                    src="./images/m1.webp"
                    alt="Professional woman"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Top Right Polaroid - Man Portrait */}
              <div className="absolute top-4 right-6 bg-white p-3 rounded-lg shadow-xl transform rotate-12 hover:rotate-0 transition-transform duration-300">
                <div className="w-28 h-28 bg-gray-300 rounded-md overflow-hidden mb-2">
                  <img
                    src="./images/m2.webp"
                    alt="Professional man"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Bottom Left Polaroid - Yellow Text Card */}
              <div className="absolute bottom-6 left-4 bg-white p-3 rounded-lg shadow-xl transform rotate-6 hover:rotate-0 transition-transform duration-300">
                <div className="w-28 h-28 bg-gray-200 rounded-md flex items-start justify-start p-2">
                  <img
                    src="./images/m4.png"
                    alt="Team collaboration"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Bottom Right Polaroid - Team Collaboration */}
              <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-xl transform -rotate-6 hover:rotate-0 transition-transform duration-300">
                <div className="w-28 h-28 bg-gray-200 rounded-md overflow-hidden mb-2">
                  <img
                    src="./images/m3.jpg"
                    alt="Team collaboration"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Right Image */}

          </div>
        </div>
      </div>

      {/* 3. Our Values */}
      <div className="py-20 bg-gray-50">
        <div
          className="mx-auto px-4 sm:px-6 lg:px-8"
          style={{ maxWidth: "100rem" }}
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Our Values
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              These core principles guide everything we do at SkillSwap.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Community First */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-primary-10 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-lg">👥</span>
                </div>
                <h3 className="text-[2rem] font-bold text-gray-800">
                  Community First
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed text-[1.4rem]">
                We believe in the power of community. By bringing together
                diverse individuals with different skills and backgrounds, we
                create a rich learning environment where everyone can grow and
                thrive.
              </p>
            </div>

            {/* Accessibility */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-primary-10 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-lg">🌐</span>
                </div>
                <h3 className="text-[2rem] font-bold text-gray-800">
                  Accessibility
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed text-[1.4rem]">
                Knowledge should be accessible to everyone. We're committed to
                breaking down barriers to education and making skill sharing
                available to people from all walks of life, regardless of their
                background or circumstances.
              </p>
            </div>

            {/* Mutual Benefit */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-primary-10 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-lg">🤝</span>
                </div>
                <h3 className="text-[2rem] font-bold text-gray-800">
                  Mutual Benefit
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed text-[1.4rem]">
                We create win-win situations where both learners and teachers
                benefit. Learners gain valuable skills, while teachers can share
                their passion, refine their own understanding, and earn rewards
                for their expertise.
              </p>
            </div>

            {/* Continuous Innovation */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-primary-10 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-lg">💡</span>
                </div>
                <h3 className="text-[2rem] font-bold text-gray-800">
                  Continuous Innovation
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed text-[1.4rem]">
                We're constantly looking for new ways to improve the learning
                and teaching experience. By embracing innovation and staying at
                the forefront of educational technology, we can better serve our
                community.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Exchange Philosophy */}
      <div className="py-20 bg-white">
        <div
          className="mx-auto px-4 sm:px-6 lg:px-8"
          style={{ maxWidth: "100rem" }}
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Content */}
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                Exchange Philosophy
              </h2>
              <div className="w-16 h-1 bg-green-500 mb-8"></div>
              <p className="text-gray-600 mb-8 leading-relaxed text-[1.4rem]">
                We believe that skill exchange surpasses traditional learning
                for several reasons:
              </p>

              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-4 mt-1">
                    <div className="w-6 h-6 text-green-500">
                      <span>✨</span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-[1.4rem]">
                    Mutual benefit - both participants receive value
                  </p>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-4 mt-1">
                    <div className="w-6 h-6 text-green-500">
                      <span>✨</span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-[1.4rem]">
                    Practical knowledge from practicing professionals
                  </p>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-4 mt-1">
                    <div className="w-6 h-6 text-green-500">
                      <span>✨</span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-[1.4rem]">
                    Building community and social connections
                  </p>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-4 mt-1">
                    <div className="w-6 h-6 text-green-500">
                      <span>✨</span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-[1.4rem]">
                    Accessibility for everyone, regardless of financial
                    capabilities
                  </p>
                </div>
              </div>
            </div>

            {/* Right side - Image */}
            <div>
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Team collaboration"
                className="rounded-lg shadow-lg w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 5. Meet Our Team */}
      <div className="py-20 bg-gray-50">
        <div
          className="mx-auto px-4 sm:px-6 lg:px-8"
          style={{ maxWidth: "100rem" }}
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Meet Our Team
            </h2>
            <p className="text-gray-600 text-[1.4rem] max-w-2xl mx-auto">
              The passionate individuals behind SkillSwap who are dedicated to
              our mission.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Sarah Johnson */}
            <div className="bg-white rounded-lg p-6 shadow-sm text-center">
              <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4 overflow-hidden">
                <img
                  src="./images/mariam.jpg"
                  alt="Ms. Mariam Memon"
                  className="w-full h-full object-fill"
                />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">
                Ms. Mariam Memon
              </h3>
              <p className="text-sm text-gray-500 mb-3">Supervisor</p>
              <p className="text-gray-600 text-sm leading-relaxed">
                Ms. Mariam Memon is passionate about education and believes in the power of
                skill sharing to transform lives.
              </p>
            </div>

            {/* Michael Chen */}
            <div className="bg-white rounded-lg p-6 shadow-sm text-center">
              <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4 overflow-hidden">
                <img
                  src="./images/Haresh.png"
                  alt="Mr. Haresh Kumar"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">
                Haresh Kumar
              </h3>
              <p className="text-sm text-gray-500 mb-3">Full Stack developer</p>
              <p className="text-gray-600 text-sm leading-relaxed">
                Haresh brings his technical expertise to build a platform that
                connects learners and teachers.
              </p>
            </div>

            {/* Emily Rodriguez */}
            <div className="bg-white rounded-lg p-6 shadow-sm text-center">
              <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4 overflow-hidden">
                <img
                  src="./images/sohail.png"
                  alt="Mr. Sohail Karmani"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">
                Sohail Karmani
              </h3>
              <p className="text-sm text-gray-500 mb-3">Java Developer</p>
              <p className="text-gray-600 text-sm leading-relaxed">
                Sohail works to create a vibrant and supportive community where
                everyone feels welcome.
              </p>
            </div>

            {/* Khushal */}
            <div className="bg-white rounded-lg p-6 shadow-sm text-center">
              <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4 overflow-hidden">
                <img
                  src="./images/khushal.jpg"
                  alt="Mr. Khushal"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">
                Khushal
              </h3>
              <p className="text-sm text-gray-500 mb-3">Java Developer</p>
              <p className="text-gray-600 text-sm leading-relaxed">
                Khushal focuses on creating an intuitive and enjoyable experience
                for both learners and teachers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
