import { Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from '../Frontend/src/components/AdminComponent/Sidebar'
import socketService from "./src/services/socket";
import { toast } from "react-toastify";
import useNotificationStore from "./src/Store/notificationStore";

const AdminLayout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const addNotification = useNotificationStore((state) => state.addNotification);

  useEffect(() => {
    const socket = socketService.connect();
    
    socketService.joinAdmin();

    socketService.on("new_student_registered", (data) => {
      addNotification({
        title: "New Student Registered",
        message: `${data.fullName} joined the platform.`,
        type: "registration",
        data: data
      });

      toast.info(`New Student Registered: ${data.fullName}`, {
        position: "top-right",
        autoClose: 5000,
      });
    });

    return () => {
      socketService.off("new_student_registered");
    };
  }, []);

  const hideSidebar = location.pathname.startsWith("/instructor/courses/");

  return (
    <div className="min-h-screen bg-white flex">
      
      {!hideSidebar && (
        <Sidebar
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />
      )}

      <div
        className={`transition-all duration-300 w-full ${
          !hideSidebar ? "lg:ml-64" : ""
        }`}
      >
        <main className="p-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;