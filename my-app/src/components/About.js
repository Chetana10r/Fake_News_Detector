import React from "react";
import Footer from "./Footer";

const About = () => {
  return (
    <div className="bg-gray-900 text-white flex flex-col min-h-screen">
      {/* Content Section */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div
          id="about"
          className="w-full max-w-3xl mx-auto p-8 bg-gray-800 shadow-lg rounded-lg flex flex-col md:flex-row items-center"
        >
          {/* Text Content */}
          <div className="md:w-2/3 text-center md:text-left">
            <h2 className="text-2xl font-bold text-white mb-3">
              About This Project
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              Fake news has become a major issue in today's digital world,
              influencing public opinion, politics, and even economies.
              Misinformation spreads rapidly through social media and news
              platforms, making it difficult for people to distinguish between
              real and fake news. This leads to widespread confusion,
              manipulation, and loss of trust in reliable sources. Addressing
              this challenge requires a robust solution that can efficiently
              detect and flag misleading content.
            </p>

            <p className="mt-3 text-sm text-gray-300 leading-relaxed">
              Our AI-powered Fake News Detection system utilizes
              state-of-the-art Machine Learning and Natural Language Processing
              techniques to analyze news articles and determine their
              authenticity in real time. By inputting a news article, users
              receive an instant classification along with confidence scores,
              helping them make informed decisions. This tool empowers
              individuals and organizations to identify misinformation and
              contribute to a more reliable information ecosystem.
            </p>
          </div>

          {/* Image */}
          <div className="md:w-1/3 mt-6 md:mt-0 md:ml-8 flex justify-center">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZn_jkFG9NGw7sFFCxqZsc7TEpjxh4_r7PrUPitpiM92f6JP58v17EmRj6VJvOVtw2iCg&usqp=CAU"
              alt="Fake News Detection"
              className="rounded-lg shadow-md w-300"

            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default About;
