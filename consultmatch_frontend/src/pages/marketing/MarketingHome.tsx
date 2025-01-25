import React from 'react';
import { Link } from 'react-router-dom';

const MarketingHome = () => {
  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
              <span className="block">Find the Perfect Match for</span>
              <span className="block">Your Consulting Needs</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-100 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Connect with top consultants, manage projects efficiently, and drive success with our intelligent matching platform.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Link
                to="/login"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-primary bg-white hover:bg-gray-50 md:text-lg"
              >
                Get Started
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-dark bg-opacity-60 hover:bg-opacity-70 md:text-lg"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Why Choose Wingman?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Our platform offers unique advantages for consultants and businesses alike.
            </p>
          </div>

          <div className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Smart Matching */}
            <div className="text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-md bg-primary text-white mx-auto">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="mt-4 text-xl font-medium text-gray-900">Smart Matching</h3>
              <p className="mt-2 text-base text-gray-600">
                AI-powered matching algorithm ensures the perfect fit for your projects.
              </p>
            </div>

            {/* Time Saving */}
            <div className="text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-md bg-primary text-white mx-auto">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mt-4 text-xl font-medium text-gray-900">Time Saving</h3>
              <p className="mt-2 text-base text-gray-600">
                Streamlined process reduces time spent on consultant selection.
              </p>
            </div>

            {/* Secure Platform */}
            <div className="text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-md bg-primary text-white mx-auto">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="mt-4 text-xl font-medium text-gray-900">Secure Platform</h3>
              <p className="mt-2 text-base text-gray-600">
                Enterprise-grade security for your data and communications.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div id="how-it-works" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Get started in three simple steps
            </p>
          </div>

          <div className="mt-20">
            <div className="relative">
              {/* Steps */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Step 1 */}
                <div className="relative text-center">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto bg-primary text-white rounded-full text-xl font-bold">
                    1
                  </div>
                  <h3 className="mt-4 text-xl font-medium text-gray-900">Create Profile</h3>
                  <p className="mt-2 text-base text-gray-600">
                    Sign up and create your detailed profile as a consultant or business.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="relative text-center">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto bg-primary text-white rounded-full text-xl font-bold">
                    2
                  </div>
                  <h3 className="mt-4 text-xl font-medium text-gray-900">Match & Connect</h3>
                  <p className="mt-2 text-base text-gray-600">
                    Our AI matches you with the perfect consultants or projects.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="relative text-center">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto bg-primary text-white rounded-full text-xl font-bold">
                    3
                  </div>
                  <h3 className="mt-4 text-xl font-medium text-gray-900">Collaborate</h3>
                  <p className="mt-2 text-base text-gray-600">
                    Work together efficiently with integrated project management tools.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-primary">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block text-white">Join Wingman today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary bg-white hover:bg-gray-50"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingHome; 