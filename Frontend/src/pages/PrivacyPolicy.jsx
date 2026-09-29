import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 py-10 px-8">
          <h1 className="text-3xl font-bold text-white">Business Policies & Privacy</h1>
          <p className="text-gray-400 mt-2">Roots Classes - Professional & Secure Educational Standards</p>
        </div>

        {/* Content Section */}
        <div className="p-8 sm:p-12 space-y-10 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
              Refund Policy
            </h2>
            <p className="bg-blue-50 p-6 rounded-xl border border-blue-100">
              Fees once paid are non-refundable . Exceptions may be made only in rare medical or relocation cases and must be approved by the institute head. Any eligible refunds will be processed within <b>7-10 working days</b> through the original payment method.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-2 h-8 bg-purple-600 rounded-full"></span>
              Privacy Policy
            </h2>
            <p>
              Roots Classes values your privacy. We collect basic details such as name, contact number, and school information only to enhance your academic journey. We do <b>not sell or share</b> your data with third parties. Your information is stored securely and used strictly for educational communication purposes.
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-2">Return Policy</h3>
              <p className="text-sm">
                Roots Classes does not sell physical goods. Therefore, no return policy is applicable.
              </p>
            </section>
            <section className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-2">Shipping Policy</h3>
              <p className="text-sm">
                Roots Classes does not ship physical goods. All educational content is provided digitally or at the institute location.
              </p>
            </section>
          </div>

          <section className="pt-8 border-t">
            <h2 className="text-xl font-bold text-gray-900 mb-4 italic">Summary of Terms</h2>
            <p className="text-sm">
              By enrolling in our programs, you agree to abide by our class schedules, payment terms, and student conduct policies. Misconduct or fee defaults may lead to termination of enrollment. Course material is for personal use only and may not be redistributed. Roots Classes reserves the right to change schedules, faculty, and fees as needed.
            </p>
          </section>

          <div className="pt-8 text-center text-sm text-gray-500">
            Last updated: {new Date().toLocaleDateString()} | Roots Classes Portal
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
