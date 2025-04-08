import React from 'react';

const About = () => {
  return (
    <div>
      

      {/* Header Section */}
      <section className="bg-orange-500 text-white py-20 px-6 text-center">
        <h1 className="text-5xl font-bold mb-4">About DishCraft</h1>
        <p className="text-xl max-w-3xl mx-auto opacity-90">
          We're more than just recipes — we're a community of passionate cooks, curious foodies, and creative creators.
        </p>
      </section>

      {/* Content Section */}
      <section className="py-16 px-8 bg-white text-gray-800 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-semibold mb-4">Our Mission</h2>
            <p className="mb-6 text-lg leading-relaxed">
              At DishCraft, we aim to bring people together through the love of cooking. Whether you're a beginner in the kitchen or a seasoned chef, our platform offers a space to discover new dishes, share personal recipes, and connect with food enthusiasts around the globe.
            </p>
            <h2 className="text-2xl font-semibold mb-2">What We Offer</h2>
            <ul className="list-disc pl-6 text-lg space-y-2">
              <li>Curated recipes for all skill levels</li>
              <li>User-uploaded meals with step-by-step guides</li>
              <li>Community ratings, comments, and suggestions</li>
              <li>Bookmark and organize your favorites</li>
            </ul>
          </div>
          <div>
            <img
              src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80"
              alt="Cooking"
              className="rounded-xl shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Team or Vision Section (Optional) */}
      <section className="bg-gray-100 py-16 px-8 text-center">
        <h2 className="text-3xl font-bold mb-4">Join the Movement</h2>
        <p className="max-w-2xl mx-auto mb-6 text-lg">
          Cooking should be fun, expressive, and shared. That's why we built DishCraft — to turn your kitchen into a creative studio and your meals into moments of joy.
        </p>
        <a href="/register">
          <button className="bg-orange-500 text-white py-3 px-8 rounded-lg hover:bg-orange-600 transition-all duration-300 shadow-md hover:shadow-lg font-medium">
            Get Cooking Today
          </button>
        </a>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6 text-center">
        <p>© 2025 DishCraft. Made with flavor & love.</p>
      </footer>
    </div>
  );
};

export default About;