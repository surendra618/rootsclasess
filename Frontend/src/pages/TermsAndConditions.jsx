import React from 'react';

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-10 px-8">
          <h1 className="text-3xl font-bold text-white">Terms and Conditions</h1>
          <p className="text-blue-100 mt-2">Roots Classes - Empowering Academic Excellence</p>
        </div>

        {/* Content Section */}
        <div className="p-8 sm:p-12 space-y-8 text-gray-700 leading-relaxed">
          
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">1. Enrollment & Conduct</h2>
            <p>
              By enrolling in Roots Classes, students and their guardians agree to adhere to the institute’s class schedules, discipline policies, and attendance rules. Repeated absenteeism, disruptive behavior, or violation of institute decorum may lead to suspension or termination of enrollment without refund.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">2. Fee Structure & Payment</h2>
            <p>
              All course fees must be paid in full or as per the defined payment schedule at the time of admission. Any default in fee payments may result in temporary suspension from classes. Roots Classes reserves the right to revise fee structures without prior notice for new batches.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">3. Course Material Usage</h2>
            <p>
              All study material, notes, or resources provided during the course are strictly for personal use. Students are not permitted to reproduce, distribute, or publish the content without explicit written permission from Roots Classes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">4. Schedule and Faculty Changes</h2>
            <p>
              Roots Classes may make necessary changes to class schedules, course durations, or faculty assignments based on academic or administrative requirements. Efforts will be made to inform students in advance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">5. Limitation of Liability</h2>
            <p>
              Roots Classes is not responsible for any loss of personal belongings or injuries occurring on campus premises. While every effort is made to ensure safety, parents and students are advised to remain vigilant and responsible.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">6. Acceptance of Terms</h2>
            <p>
              By continuing with your enrollment and participation in Roots Classes programs, you acknowledge that you have read, understood, and agreed to abide by all terms and conditions stated above.
            </p>
          </section>

          <div className="pt-8 border-t text-center text-sm text-gray-500">
            Last updated: {new Date().toLocaleDateString()} | Roots Classes Portal
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
