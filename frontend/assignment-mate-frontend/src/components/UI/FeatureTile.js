import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const FeatureTile = ({ title, description, image, linkTo, isHovered, onHoverStart, onHoverEnd, onTileClick }) => {
  return (
    <motion.div
      className="feature-tile"
      whileHover={{ scale: 1.2, zIndex: 2 }} // Enlarges tile on hover
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
      onClick={() => onTileClick(image)} // Trigger image transition
      style={{
        opacity: isHovered ? 1 : 0.4,
        filter: isHovered ? 'brightness(1.3)' : 'brightness(1)',
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <motion.img
        src={image}
        alt={title}
        className="feature-tile-image"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      />
      <div className="feature-tile-content">
        <motion.h3
          className="feature-tile-title"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25, delay: 0.2 }}
        >
          {title}
        </motion.h3>
        <motion.p 
          className="feature-tile-description"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
          transition={{ type: 'spring', stiffness: 150, damping: 20 }}
        >
          {description}
        </motion.p>
      </div>
    </motion.div>
  );
};

export default FeatureTile;
