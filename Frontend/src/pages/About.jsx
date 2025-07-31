import { Link } from 'react-router-dom';

const About = () => {
  const values = [
    {
      title: 'Community First',
      description: 'We believe in the power of community-driven learning where everyone has something valuable to contribute.',
      icon: '🤝'
    },
    {
      title: 'Inclusive Learning',
      description: 'Our platform welcomes learners from all backgrounds, skill levels, and walks of life.',
      icon: '🌍'
    },
    {
      title: 'Quality Connections',
      description: 'We focus on creating meaningful connections that lead to genuine learning experiences.',
      icon: '⭐'
    },
    {
      title: 'Continuous Growth',
      description: 'Learning never stops, and we provide the tools to support your lifelong learning journey.',
      icon: '📈'
    }
  ];

  const team = [
    {
      name: 'Sarah Johnson',
      role: 'Founder & CEO',
      description: 'Passionate educator with 10+ years in EdTech, dedicated to democratizing learning.',
      image: '👩‍💼'
    },
    {
      name: 'Michael Chen',
      role: 'CTO',
      description: 'Full-stack developer and learning enthusiast, building the future of peer-to-peer education.',
      image: '👨‍💻'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Head of Community',
      description: 'Community builder focused on creating safe and inclusive learning environments.',
      image: '👩‍🎓'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About GrowTogather
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 max-w-3xl mx-auto">
              Empowering learners worldwide to share knowledge, build connections, and grow together through collaborative education.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                At GrowTogather, we believe that everyone has something valuable to teach and something important to learn. Our mission is to create a global community where knowledge flows freely, connections are meaningful, and learning never stops.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                We're breaking down traditional barriers to education by connecting learners directly with each other, fostering peer-to-peer learning that's accessible, affordable, and authentic.
              </p>
              <Link
                to="/register"
                className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-200 inline-block"
              >
                Join Our Community
              </Link>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-primary-100 to-secondary-100 rounded-lg p-8">
                <div className="text-6xl mb-4">🌱</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Growing Together</h3>
                <p className="text-gray-600">
                  Every interaction on our platform is an opportunity for mutual growth and learning.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              These core values guide everything we do and shape the community we're building together.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Passionate individuals dedicated to revolutionizing how we learn and grow together.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <div className="text-6xl mb-4">{member.image}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-primary-600 font-medium mb-3">{member.role}</p>
                <p className="text-gray-600">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
              Our Story
            </h2>
            <div className="text-lg text-gray-600 space-y-6">
              <p>
                GrowTogather was born from a simple observation: traditional education often creates barriers between learners, when the most powerful learning happens through connection and collaboration.
              </p>
              <p>
                Our founders experienced firsthand how peer-to-peer learning could transform understanding and build lasting relationships. They envisioned a platform where anyone could be both teacher and student, where skills could be exchanged freely, and where learning communities could flourish naturally.
              </p>
              <p>
                Today, we're proud to serve thousands of learners worldwide, facilitating meaningful connections and enabling knowledge exchange across borders, cultures, and disciplines. But this is just the beginning of our journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Be Part of Our Story?
          </h2>
          <p className="text-xl mb-8 text-primary-100 max-w-2xl mx-auto">
            Join our community of learners and start your journey of growth and connection today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
            >
              Get Started
            </Link>
            <Link
              to="/contact"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors duration-200"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
