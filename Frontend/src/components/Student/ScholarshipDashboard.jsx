import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import api from '../../services/endpoints';
import StudentTestPanel from '../../pages/Student/TestList';
import { 
  Award, CheckCircle2, Clock, FileText, ArrowRight, Sparkles, 
  AlertCircle, BookOpen, User, Phone, Mail, ShieldCheck, ChevronRight,
  Lock, Unlock, Key, RefreshCw
} from 'lucide-react';

const ScholarshipDashboard = ({ studentId, studentData }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [scholarshipApp, setScholarshipApp] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [scholarshipTests, setScholarshipTests] = useState([]);
  const [completedResult, setCompletedResult] = useState(null);
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [selectedTestToRun, setSelectedTestToRun] = useState(null);

  const fetchScholarshipData = async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      // 1. Fetch Scholarship Application
      const schRes = await axios.post(api.scholarship.getSchollership, { studentId });
      if (schRes.data?.success && schRes.data.data) {
        setScholarshipApp(schRes.data.data);
        setHasApplied(true);
      } else {
        setScholarshipApp(null);
        setHasApplied(false);
      }

      // 2. Fetch Completed Test Results to see if scholarship test was attempted
      const resRes = await axios.post(api.result.getStudentResults, { studentId });
      if (resRes.data?.success && Array.isArray(resRes.data.data)) {
        const schResult = resRes.data.data.find(r => {
          const title = (r.testId?.title || '').toLowerCase();
          const cat = (r.testId?.category || '').toLowerCase();
          return r.isCompleted && (title.includes('scholarship') || cat.includes('scholarship'));
        });
        setCompletedResult(schResult || null);
      }

      // 3. Fetch Scholarship Tests
      const token = localStorage.getItem('token');
      const testRes = await axios.post(
        api.scholarship.getScholarshipTest,
        { studentId },
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      ).catch(() => null);

      if (testRes?.data?.success && Array.isArray(testRes.data.tests)) {
        setScholarshipTests(testRes.data.tests);
      } else {
        // Fallback: fetch published tests and filter scholarship
        const pubRes = await axios.post(api.test.publishTest).catch(() => null);
        if (pubRes?.data?.success) {
          const raw = pubRes.data.data || pubRes.data.tests || [];
          const filtered = raw.filter(t => (t.title || '').toLowerCase().includes('scholarship'));
          setScholarshipTests(filtered);
        }
      }

    } catch (err) {
      console.error('Error fetching scholarship dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScholarshipData();
  }, [studentId]);

  if (loading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center bg-white border border-slate-200 rounded-md">
        <div className="w-10 h-10 border-3 border-slate-200 border-t-[#FB0500] rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-bold text-slate-500">Loading Scholarship Assessment Portal...</p>
      </div>
    );
  }

  // Active Test-Taking Mode: render the CBT examination interface
  if (isTestStarted) {
    const assignedId = selectedTestToRun?._id 
      || selectedTestToRun?.id 
      || scholarshipApp?.assignedTest?._id 
      || scholarshipApp?.assignedTest 
      || (scholarshipTests[0]?._id);

    return (
      <div className="w-full">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => {
              if (window.confirm("Exit scholarship test view?")) {
                setIsTestStarted(false);
                fetchScholarshipData();
              }
            }}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer bg-white px-3 py-1.5 rounded-md border border-slate-200 shadow-2xs"
          >
            ← Back to Scholarship Portal
          </button>
        </div>
        <StudentTestPanel 
          isEmbedded={true} 
          isScholarshipOnly={true} 
          assignedTestId={assignedId}
          autoStart={true}
          onSwitchTab={() => {
            setIsTestStarted(false);
            fetchScholarshipData();
          }} 
        />
      </div>
    );
  }

  // ==========================================
  // CASE 1: Student has NOT applied for scholarship
  // ==========================================
  if (!hasApplied) {
    return (
      <div className="space-y-6">
        {/* Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-lg p-6 sm:p-8 text-white relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-black uppercase tracking-wider mb-3">
              <Sparkles size={12} />
              Roots Scholarship 2026
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
              Unlock Up to <span className="text-[#FB0500]">100% Fee Waiver</span> on Coaching
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-3 leading-relaxed">
              The official Roots Scholarship Assessment Test is an exclusive merit-based test. Register your scholarship application first. Once approved by the administrator, your test will unlock here.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-6">
              {[
                { title: '100% Max Off', desc: 'Direct tuition waiver' },
                { title: 'Free Test', desc: 'No registration fee' },
                { title: 'Instant Score', desc: 'Detailed analytics' },
              ].map((item, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 rounded-md p-3">
                  <div className="text-sm font-black text-white">{item.title}</div>
                  <div className="text-[10px] text-slate-400 font-medium">{item.desc}</div>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate('/scholarship')}
              className="px-6 py-3 bg-[#FB0500] hover:bg-red-700 text-white font-bold text-xs rounded-md transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <span>Apply for Scholarship Now — It's Free</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Info notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={18} />
          <div className="text-xs text-amber-800">
            <strong className="font-bold">Note for Students:</strong> General Test Series is separate and open for practice. The Scholarship Test is exclusively accessible once your scholarship registration is approved by the admin.
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // CASE 2 & 3: Student HAS Applied
  // ==========================================
  const isApproved = scholarshipApp.status === 'approved';
  const isRejected = scholarshipApp.status === 'rejected';
  const isPending = scholarshipApp.status === 'pending';
  const isTestAccessGranted = Boolean(scholarshipApp.testAccessGranted);

  // Determine active test to display
  const activeTest = scholarshipApp.assignedTest || scholarshipTests[0] || null;

  return (
    <div className="space-y-6">
      
      {/* 1. Application Overview Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Application Status</span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-bold text-slate-600">
                Applied on {scholarshipApp.createdAt ? new Date(scholarshipApp.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently'}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
              Roots Scholarship Application
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Test Access Badge */}
            {isTestAccessGranted ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-black">
                <Unlock size={14} className="text-emerald-600" />
                Test Access Granted
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-50 text-amber-800 border border-amber-300 text-xs font-black">
                <Lock size={14} className="text-amber-600" />
                Test Access Pending
              </span>
            )}

            {/* Scholarship Waiver Status Badge */}
            {isApproved ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200 text-xs font-black">
                <CheckCircle2 size={14} className="text-purple-600" />
                {scholarshipApp.discount}% Fee Waiver
              </span>
            ) : isRejected ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200 text-xs font-black">
                Application Closed
              </span>
            ) : null}
          </div>
        </div>

        {/* Application details grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
          <div>
            <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">Program</span>
            <strong className="text-slate-800 font-black text-sm">{scholarshipApp.program || 'General'}</strong>
          </div>
          <div>
            <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">Target Class</span>
            <strong className="text-slate-800 font-black text-sm capitalize">{scholarshipApp.studentClass || studentData?.currentClass || '10th'}</strong>
          </div>
          <div>
            <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">Registered Email</span>
            <strong className="text-slate-800 font-semibold truncate block">{scholarshipApp.email}</strong>
          </div>
          <div>
            <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">Mobile</span>
            <strong className="text-slate-800 font-semibold">{scholarshipApp.phone}</strong>
          </div>
        </div>

        {/* Approved Callout */}
        {isApproved && (
          <div className="mt-5 p-4 bg-emerald-50 border border-emerald-200 rounded-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-black text-emerald-900 uppercase tracking-wide">
                🎉 Congratulations! {scholarshipApp.discount}% Scholarship Active
              </h4>
              <p className="text-xs text-emerald-700 mt-0.5">
                Your fee discount is ready and will be automatically deducted at course checkout.
                {scholarshipApp.validUntil && (
                  <span> Valid until <strong>{new Date(scholarshipApp.validUntil).toLocaleDateString()}</strong>.</span>
                )}
              </p>
            </div>
            <button
              onClick={() => navigate('/course')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-md shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              Browse Discounted Courses →
            </button>
          </div>
        )}

        {/* Rejected Callout */}
        {isRejected && (
          <div className="mt-5 p-4 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800">
            <strong>Remark:</strong> {scholarshipApp.adminRemark || 'Application did not meet minimum scholarship criteria for this session.'}
          </div>
        )}
      </div>

      {/* 2. Test Access Banner & Status Callout */}
      {!completedResult && (
        <>
          {isTestAccessGranted ? (
            <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-300 rounded-lg p-5">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5">
                  <Sparkles size={20} className="text-emerald-600 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded border border-emerald-300">
                      TEST ACCESS ACTIVATED
                    </span>
                    <span className="text-xs text-emerald-700 font-bold">Admin Approved</span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 mt-1">
                    Your Official Scholarship Assessment is Unlocked!
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    The administrator has granted you access to take your scholarship test. Click below to begin your examination.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300 rounded-lg p-5">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
                  <Clock size={20} className="text-amber-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300">
                      WAITING FOR ADMIN ACCESS
                    </span>
                    <span className="text-xs text-amber-700 font-bold">Review in Progress</span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 mt-1">
                    Scholarship Test Access Under Review
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Your application for <strong>{scholarshipApp.program} (Class {scholarshipApp.studentClass})</strong> has been received. 
                    Our administrator will assign and unlock your official scholarship examination shortly. Once granted, the "Start Test" button will activate below.
                  </p>
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-amber-200 rounded-md text-xs font-bold text-amber-800">
                    <ShieldCheck size={14} className="text-amber-600" />
                    <span>No further action needed. Admin will grant access soon.</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* 3. Scholarship Test Section */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Award className="text-[#FB0500]" size={20} />
              Roots Scholarship Assessment Examination
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Merit evaluation exam to allot coaching fee waiver discounts.
            </p>
          </div>
          <button 
            onClick={fetchScholarshipData} 
            className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-800 p-1.5 rounded hover:bg-slate-100 transition-colors cursor-pointer"
            title="Refresh Status"
          >
            <RefreshCw size={13} />
            <span className="hidden sm:inline">Refresh Status</span>
          </button>
        </div>

        {/* If Already Attempted: Show Scorecard */}
        {completedResult ? (
          <div className="bg-slate-50 border border-slate-200 rounded-md p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Scorecard Submitted</span>
                <h4 className="text-sm font-black text-slate-900 mt-0.5">
                  {completedResult.testTitle || 'Roots Scholarship Mock Test'}
                </h4>
                <p className="text-xs text-slate-500">
                  Attempted on {new Date(completedResult.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-2xl font-black text-emerald-600">
                    {Math.round(completedResult.percentage || 0)}%
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Score</span>
                </div>
                <div className="px-3 py-1.5 rounded-md bg-white border border-slate-200 text-xs font-black text-slate-800">
                  {completedResult.obtainedMarks} / {completedResult.totalMarks} Marks
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-600">
              <p>
                {isApproved
                  ? `✅ Congratulations! Your score qualified you for ${scholarshipApp.discount}% scholarship.`
                  : isPending
                  ? "⏳ Your test scorecard is under evaluation by our administration. Your fee waiver discount will be approved shortly."
                  : "Assessment closed."}
              </p>
            </div>
          </div>
        ) : (
          /* If NOT Attempted Yet: Show Test Card */
          <div className="space-y-4">
            {activeTest ? (
              <div 
                className={`bg-white border-2 rounded-md p-5 transition-all shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  isTestAccessGranted 
                    ? 'border-emerald-300 hover:border-emerald-400 shadow-sm' 
                    : 'border-slate-200 bg-slate-50/50'
                }`}
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    {isTestAccessGranted ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                        <Unlock size={11} />
                        <span>Ready to Attempt</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-200 text-slate-700 border border-slate-300 flex items-center gap-1">
                        <Lock size={11} />
                        <span>Access Locked</span>
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      {activeTest.className ? `Class ${activeTest.className}` : 'All Classes'}
                    </span>
                  </div>

                  <h4 className="text-sm font-black text-slate-900 leading-snug">
                    {activeTest.title}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {activeTest.description || 'Comprehensive scholarship assessment covering core subjects for tuition fee waiver.'}
                  </p>
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-600 pt-1">
                    <span>⏱️ {activeTest.duration || 60} Minutes</span>
                    <span>📄 {activeTest.questions?.length || activeTest.totalQuestions || 20} Questions</span>
                    <span>⭐ {activeTest.totalMarks || 80} Marks</span>
                  </div>
                </div>

                {isTestAccessGranted ? (
                  <button
                    onClick={() => {
                      setSelectedTestToRun(activeTest);
                      setIsTestStarted(true);
                    }}
                    className="w-full sm:w-auto px-6 py-3 bg-[#FB0500] hover:bg-red-700 text-white font-black text-xs rounded-md shadow-xs transition-all shrink-0 flex items-center justify-center gap-2 cursor-pointer animate-pulse"
                  >
                    <span>Attempt Scholarship Test Now</span>
                    <ArrowRight size={14} />
                  </button>
                ) : (
                  <div className="w-full sm:w-auto flex flex-col items-center sm:items-end gap-1 shrink-0">
                    <button
                      disabled={true}
                      className="w-full sm:w-auto px-5 py-2.5 bg-slate-200 text-slate-400 font-bold text-xs rounded-md cursor-not-allowed flex items-center justify-center gap-1.5"
                    >
                      <Lock size={13} />
                      <span>Test Locked (Admin Access Required)</span>
                    </button>
                    <span className="text-[10px] text-amber-600 font-medium">
                      Admin will activate your access soon
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 bg-slate-50 border border-slate-200 rounded-md p-6">
                <FileText className="mx-auto text-slate-400 mb-2" size={32} />
                <h4 className="text-sm font-black text-slate-800">Finalizing scholarship exam paper</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Our faculty is setting the scholarship test paper for your class. You will be notified as soon as access is granted.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};

export default ScholarshipDashboard;
