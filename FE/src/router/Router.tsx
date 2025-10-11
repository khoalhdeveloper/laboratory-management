import React from 'react'
import { Routes, Route, Outlet } from 'react-router-dom'
import AuthGuard from '../components/AuthGuard'
import Header from '../source/page/Home/Header'
import Footer from '../source/page/Home/Footer'
import Home from '../source/page/Home/Home'
import Services from '../source/page/Home/Services'
import About from '../source/page/Home/About'
import Contact from '../source/page/Home/Contact'
import Error from '../source/page/Home/Error'
import Login from '../source/page/Home/Login'
import ResetPassword from '../source/page/Home/ResetPassword'

import AdminHome from '../source/page/Admin/Home'
import Dashboard from '../source/page/Admin/Dashboard'
import Accounts from '../source/page/Admin/Accounts'
import Doctors from '../source/page/Admin/Doctors'
import AdminEventLog from '../source/page/Admin/EventLog'
import AdminReagentHistory from '../source/page/Admin/ReagentHistory'

import NurseHome from '../source/page/Nurse/Home'
import NurseLayout from '../source/page/Nurse/Layout'
import NurseProfile from '../source/page/Nurse/Profile'
import TestOrdersList from '../source/page/Nurse/TestOrdersList'
import TestOrderDetail from '../source/page/Nurse/TestOrderDetail'
import NewTestOrder from '../source/page/Nurse/NewTestOrder'
import EditTestOrder from '../source/page/Nurse/EditTestOrder'
import DeviceCheck from '../source/page/Nurse/DeviceCheck'
import ReagentsTable from '../source/page/Nurse/ReagentsTable'
import BloodTestExecution from '../source/page/Nurse/BloodTestExecution'
import ResultsList from '../source/page/Nurse/ResultsList'
import ViewResults from '../source/page/Nurse/ViewResults'
import InstrucmentNurse from '../source/page/Nurse/InstrucmentsNurse'

import PatientSidebar from '../source/page/Patient/Sidebar'
import PatientHeader from '../source/page/Patient/Header'
import PatientHome from '../source/page/Patient/Home'
import PatientProfile from '../source/page/Patient/Profile'
import IncompleteProfile from '../source/page/Patient/IncompleteProfile'

import DoctorLayout from '../source/page/Doctor/DoctorLayout'
import DoctorHome from '../source/page/Doctor/Home'
import DoctorDashboard from '../source/page/Doctor/Dashboard'
import EventLog from '../source/page/Doctor/EventLog'
import Instrucment from '../source/page/Doctor/Instrucment'
import ReagentHistory from '../source/page/Doctor/ReagentHistory'
import ReagentHistoryNurse from '@/source/page/Nurse/ReagentHistoryNurse'

// Define AppRoute type
export type AppRoute = {
  path: string;
  element: React.ReactElement;
  nested?: AppRoute[];
};

// Routes configuration
export const routes: AppRoute[] = [
  {
    path: "",
    element: <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>,
    nested: [
      {
        path: "",
        element: <Home />
      },
      {
        path: "services",
        element: <Services />
      },
      {
        path: "about",
        element: <About />
      },
      {
        path: "contact",
        element: <Contact />
      }
    ]
  },
  {
    path: "login",
    element: <Login />,
    nested: []
  },
  {
    path: "reset-password",
    element: <ResetPassword />,
    nested: []
  },
  {
    path: "admin",
    element: <AuthGuard allowedRoles={['admin']}><AdminHome /></AuthGuard>,
    nested: [
      {
        path: "",
        element: <Dashboard />
      },
      {
        path: "dashboard",
        element: <Dashboard />
      },
      {
        path: "accounts",
        element: <Accounts />
      },
      {
        path: "doctors",
        element: <Doctors />
      },
      {
        path: "event-log",
        element: <AdminEventLog />
      },
      {
        path: "reagent-history",
        element: <AdminReagentHistory />
      }
    ]
  },
  {
    path: "patient",
    element: <AuthGuard allowedRoles={['user']}>
      <div className="h-screen bg-gray-50 flex overflow-hidden">
        <PatientSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <PatientHeader />
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </AuthGuard>,
    nested: [
      {
        path: "",
        element: <PatientHome />
      },
      {
        path: "dashboard",
        element: <PatientHome />
      },
      {
        path: "profile",
        element: <PatientProfile />
      },
      {
        path: "incomplete-profile",
        element: <IncompleteProfile />
      }
    ]
  },
  {
    path: "nurse",
    element: <AuthGuard allowedRoles={['nurse']}><NurseLayout /></AuthGuard>,
    nested: [
      {
        path: "",
        element: <NurseHome />
      },
      {
        path: "dashboard",
        element: <NurseHome />
      },
      {
        path: "profile",
        element: <NurseProfile />
      },
      {
        path: "test-orders",
        element: <TestOrdersList />
      },
      {
        path: "test-orders/new",
        element: <NewTestOrder />
      },
      {
        path: "test-orders/edit/:id",
        element: <EditTestOrder />
      },
      {
        path: "test-orders/device-check",
        element: <DeviceCheck />
      },
      {
        path: "test-orders/reagents",
        element: <ReagentsTable />
      },
      {
        path: "test-orders/blood-test-execution",
        element: <BloodTestExecution />
      },
      {
        path: "results",
        element: <ResultsList />
      },
      {
        path: "instrument",
        element: <InstrucmentNurse />
      },
      {
        path: "reagents",
        element: <ReagentHistoryNurse />
      },
      {
        path: "test-orders/detail/:orderId",
        element: <TestOrderDetail />
      },
      {
        path: "results/view/:resultId",
        element: <ViewResults />
      }
    ]
  },
  {
    path: "doctor",
    element: <AuthGuard allowedRoles={['doctor']}><DoctorLayout /></AuthGuard>,
    nested: [
      {
        path: "",
        element: <DoctorHome />
      },
      {
        path: "dashboard",
        element: <DoctorDashboard />
      },
      {
        path: "event-log",
        element: <EventLog />
      },
      {
        path: "instrument",
        element: <Instrucment />
      },
      {
        path: "reagent-history",
        element: <ReagentHistory />
      }
    ]
  }
];

// Generate routes function
export const generateRoutes = (routes: AppRoute[]) => {
  return routes.map((route) => {
    if (route.nested && route.nested.length > 0) {
      return (
        <Route path={route.path} element={route.element} key={route.path}>
          {route.nested.map((nestedRoute) => (
            <Route
              path={nestedRoute.path}
              element={nestedRoute.element}
              key={nestedRoute.path}
            />
          ))}
        </Route>
      );
    }
    return <Route path={route.path} element={route.element} key={route.path} />;
  });
};

function Router() {
    return (
        <Routes>
            {generateRoutes(routes)}
            <Route path="/error" element={<Error />} />
            <Route path="*" element={<Error />} />
        </Routes>
    )
}

export default Router
