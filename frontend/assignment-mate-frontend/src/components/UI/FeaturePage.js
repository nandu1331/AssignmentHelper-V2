import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import FeatureTile from './FeatureTile';
import '../../featurestyles.css';

const FeatureTilesPage = () => {
  const [hoveredTile, setHoveredTile] = useState(null);
  const [imageToTransition, setImageToTransition] = useState(null);
  const navigate = useNavigate();

  const onTileClick = (image, page) => {
    setImageToTransition(image);

    // Delay navigation until after the image transition completes
    setTimeout(() => {
      navigate(page);
    }, 2000); // Adjust this timeout to match the duration of the image transition
  };

  const tileInfo = hoveredTile ? (
    <motion.div
      className="tile-info"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 150, damping: 25 }}
    >
      <h2 className="info-title">{hoveredTile.title}</h2>
      <p className="info-description">{hoveredTile.description}</p>
    </motion.div>
  ) : null;

  const onTileHoverStart = (title, description) => {
    setHoveredTile({ title, description });
  };

  const onTileHoverEnd = () => {
    setHoveredTile(null);
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="header-title">Welcome to Assignment Mate V2</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
        <FeatureTile
          title="Chat with PDFs"
          description="Ask questions and get insights from your PDFs."
          image="https://imageio.forbes.com/specials-images/imageserve/65c08bba43faeeedd41c7a2f/Five-Generative-AI-Chatbots-Everyone-Should-Know-About/960x0.jpg?format=jpg&width=960"
          linkTo="/pdf-chat"
          isHovered={hoveredTile?.title === 'Chat with PDFs'}
          onHoverStart={() => onTileHoverStart('Chat with PDFs', 'Ask questions and get insights from your PDFs.')}
          onHoverEnd={onTileHoverEnd}
          onTileClick={onTileClick}
        />
        <FeatureTile
          title="Assignment Assist"
          description="Get help with your assignments."
          image="https://www.ilovepdf.com/storage/blog/226-1684403944-How-to-summarize-and-extract-text-from-PDF-with-AI-.png"
          linkTo="/assignment-assist/uploadPDF"
          isHovered={hoveredTile?.title === 'Assignment Assist'}
          onHoverStart={() => onTileHoverStart('Assignment Assist', 'Get help with your assignments.')}
          onHoverEnd={onTileHoverEnd}
          onTileClick={onTileClick}
        />
        <FeatureTile
          title="Quiz Generator"
          description="Create custom quizzes on various topics."
          image="https://cdn.analyticsvidhya.com/wp-content/uploads/2024/01/cover-page--scaled.jpg"
          linkTo="/quiz/generate"
          isHovered={hoveredTile?.title === 'Quiz Generator'}
          onHoverStart={() => onTileHoverStart('Quiz Generator', 'Create custom quizzes on various topics.')}
          onHoverEnd={onTileHoverEnd}
          onTileClick={onTileClick}
        />
      </div>

      {/* Fullscreen Image Transition */}
      {imageToTransition && (
        <motion.div
          className="fullscreen-image-container"
          initial={{ opacity: 0, scale: 1 }}
          animate={{ opacity: 1, scale: 4 }} // Animate image to full screen
          transition={{ duration: 1.5, ease: "easeInOut" }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${imageToTransition})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 10,
          }}
        />
      )}
    </div>
  );
};

export default FeatureTilesPage;
