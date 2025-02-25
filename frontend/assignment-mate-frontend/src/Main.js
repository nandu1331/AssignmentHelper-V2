import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Signup from './components/Authentication/Signup';
import Login from './components/Authentication/Login';
import AssignmentAssistRoutes from './components/RoutingComps/AssignmentAssistRoutes';
import QuizRoutes from "./components/RoutingComps/QuizRoutes";
import FeatureTilePage from "./components/UI/FeaturePage";

function Main() {
  const location = useLocation(); // Get current route location

  return (
    <div
      className="min-h-screen text-white pt-1"
      style={{
        backgroundImage: 'url(/Images/bg.jpg)', // Correct way to set the background image
        backgroundSize: 'cover', // Ensure the background covers the entire container
        backgroundPosition: 'center', // Center the background image
        backgroundRepeat: 'no-repeat', // Prevent tiling
      }}
    >
      <div className="container mx-auto px-16">
        {/* Wrapping the Routes in motion.div for page transition */}
        <motion.div
          key={location.pathname} // Ensure animation triggers when pathname changes
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }} // Animation duration
        >
          {location.pathname.startsWith('/assignment-assist') && <AssignmentAssistRoutes />}
          {location.pathname.startsWith('/quiz') && <QuizRoutes />}
          {location.pathname.startsWith('/features') && <FeatureTilePage />}
          {location.pathname === '/login' && <Login />}
          {location.pathname === '/signup' && <Signup />}
        </motion.div>
      </div>
    </div>
  );
}

export default Main;
