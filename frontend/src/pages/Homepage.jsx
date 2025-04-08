

const Homepage = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-500 to-orange-600 py-24 px-8 text-center text-white shadow-lg">
        <h1 className="text-5xl font-bold mb-6 animate-fadeIn">Welcome to DishCraft</h1>
        <p className="text-xl mb-8 text-white opacity-90 max-w-xl mx-auto animate-slideUp">Discover amazing recipes and share your culinary creations with food lovers worldwide!</p>
        <button className="bg-white text-orange-600 py-3 px-8 rounded-lg hover:bg-orange-50 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg font-medium animate-bounce">Get Started</button>
      </section>
    </div>
  );  
};

export default Homepage;
