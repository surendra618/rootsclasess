import React from 'react';
import { useRouteError, useNavigate, Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Home, RefreshCw } from 'lucide-react';

const ErrorPage = () => {
  const error = useRouteError();
  const navigate = useNavigate();
  
  const is404 = !error || error?.status === 404;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-lg w-full bg-white border border-gray-200 rounded-2xl p-8 sm:p-10 text-center shadow-xs">
        
        {/* Warning Icon */}
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center shadow-sm relative group">
            <AlertCircle size={42} className="text-[#FB0500] transition-transform duration-300 group-hover:scale-110" />
          </div>
        </div>

        {/* Error Info */}
        <div className="space-y-3 mb-8">
          <div className="flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FB0500] animate-ping" />
            <span className="text-[11px] font-bold text-[#FB0500] uppercase tracking-widest">
              {is404 ? 'Resource Not Found' : 'Application Error'}
            </span>
          </div>

          <h1 className="text-5xl font-black text-gray-900 tracking-tight">
            {is404 ? '404' : 'Oops! An Error Occurred'}
          </h1>

          <p className="text-sm font-medium text-gray-500 max-w-sm mx-auto leading-relaxed">
            {is404 
              ? "The page or section you're looking for doesn't exist or has been moved."
              : "We've encountered a temporary technical issue. Please try refreshing or returning home."}
          </p>

          {(error?.statusText || error?.message) && (
            <div className="mt-3 px-3.5 py-1.5 bg-gray-50 border border-gray-200/60 rounded-lg inline-block">
              <p className="text-xs font-mono text-gray-500">{error.statusText || error.message}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#FB0500] transition-all shadow-sm group"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /> Go Back
          </button>
          
          <Link 
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200/80 text-gray-700 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-gray-50 hover:border-gray-300 transition-all shadow-xs"
          >
            <Home size={16} className="text-gray-500" /> Return Home
          </Link>

          {!is404 && (
            <button 
              onClick={() => window.location.reload()}
              className="p-3 text-gray-400 hover:text-gray-700 transition-colors rounded-xl border border-gray-200 hover:bg-gray-50"
              title="Refresh Page"
            >
              <RefreshCw size={16} />
            </button>
          )}
        </div>

        {/* Footer Branding */}
        <div className="mt-10 pt-6 border-t border-gray-100 flex items-center justify-center gap-2">
          <img src="/logo.svg" alt="Roots Classes" className="h-5 w-auto" />
          <span className="text-xs font-bold text-gray-400 tracking-wide">Roots Classes</span>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
