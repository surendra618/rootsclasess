import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import ErrorPage from "../pages/ErrorPage";
import Studentroutes from "../routes/Studentroutes";
import Adminroutes from '../routes/Adminroutes';
import Instructorroutes from '../routes/Instructorroutes';

const route = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      ...Studentroutes,   
      ...Adminroutes,
      ...Instructorroutes,
      {
        path: "*",
        element: <ErrorPage />,
      }
    ],
  },
]);

export default route;