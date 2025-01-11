import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion'; // Import motion from framer-motion
import QuizList from './components/Quiz-comps/QuizList';
import QuizAttempt from './components/Quiz-comps/QuizAttempt';
import QuizResults from './components/Quiz-comps/QuizResults';
import QuizGenerator from './components/Quiz-comps/QuizGenerator';
import QuizHistory from './components/Quiz-comps/QuizHistory';
import Login from './Login';
import Signup from './Signup';
import NavBar from './components/NavBar';
import PrivateRoute from './PrivateRoute';
import AttemptsList from './components/Quiz-comps/AttemptList';
import FeatureTilesPage from './components/UI/FeaturePage';

function App() {
  return (
    <Router>
      <Main />
    </Router>
  );
}

function Main() {
  const location = useLocation(); // Get current route location

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 min-h-screen text-white pt-1">
      {location.pathname !== '/login' && location.pathname !== '/signup' && location.pathname !== '/features' && <NavBar />}
      <div className="container mx-auto p-10 mt-8">
        <Routes location={location}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<Navigate to="/features" />} />
          <Route path="/features" element={<PrivateRoute><FeatureTilesPage /></PrivateRoute>} />
          <Route path="/quizzes" element={<PrivateRoute><QuizList /></PrivateRoute>} />
          <Route path="/quiz/attempt/:quizId" element={<PrivateRoute><QuizAttempt /></PrivateRoute>} />
          <Route path="/quiz/results/:quizId" element={<PrivateRoute><AttemptsList /></PrivateRoute>} />
          <Route path="/quiz/results/:quizId/:attemptId" element={<PrivateRoute><QuizResults /></PrivateRoute>} />
          <Route path="/quiz/generate" element={<PrivateRoute><QuizGenerator /></PrivateRoute>} />
          <Route path="/quiz/history" element={<PrivateRoute><QuizHistory /></PrivateRoute>} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
