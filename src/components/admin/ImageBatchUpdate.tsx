import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaImage, FaCheck, FaTimes, FaSearch } from 'react-icons/fa';
import { updateAllImages, checkCurrentImages } from '../../utils/updatePlayerImages';

const ImageBatchUpdate = () => {
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleBatchUpdate = async () => {
    setUpdating(true);
    setMessage('');
    
    try {
      await updateAllImages();
      setMessage('All player and coach images have been updated successfully! Refresh the page to see the changes.');
      setSuccess(true);
    } catch (error) {
      console.error('Error updating images:', error);
      setMessage('Error updating images. Please check the console for details.');
      setSuccess(false);
    } finally {
      setUpdating(false);
    }
  };

  const handleCheckImages = async () => {
    setMessage('Checking current images... Check the browser console for details.');
    setSuccess(true);
    await checkCurrentImages();
  };

  const imageList = [
    { name: 'AJ', file: 'aj.webp' },
    { name: 'Andrew', file: 'andrew.webp' },
    { name: 'Colin', file: 'colin.webp' },
    { name: 'Colton', file: 'colton.webp' },
    { name: 'Jack', file: 'jack.webp' },
    { name: 'Laurel', file: 'laurel.webp' },
    { name: 'Logan', file: 'logan.webp' },
    { name: 'Zach', file: 'zach.webp' },
    { name: 'Coach Norm', file: 'Coach Norm.webp' },
    { name: 'Coach Rico', file: 'coach rico.webp' },
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <FaImage className="text-steel-blue" />
        Batch Update Player & Coach Images
      </h2>

      <div className="mb-6">
        <p className="text-gray-600 mb-4">
          This will update all player and coach profiles with their corresponding images from the uploaded files.
        </p>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h3 className="font-semibold text-gray-700 mb-2">Images to be mapped:</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {imageList.map((item) => (
              <div key={item.file} className="flex items-center gap-2">
                <img 
                  src={`/images/players/${item.file}`} 
                  alt={item.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span className="text-sm text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleBatchUpdate}
        disabled={updating}
        className={`px-6 py-3 rounded-lg font-medium text-white flex items-center gap-2 ${
          updating 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-steel-blue hover:bg-dark-steel transition-colors'
        }`}
      >
        {updating ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Updating...
          </>
        ) : (
          <>
            <FaImage />
            Update All Images
          </>
        )}
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleCheckImages}
        className="ml-4 px-6 py-3 rounded-lg font-medium text-white bg-gray-600 hover:bg-gray-700 transition-colors flex items-center gap-2"
      >
        <FaSearch />
        Check Current Images
      </motion.button>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-4 p-4 rounded-lg flex items-center gap-2 ${
            success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {success ? <FaCheck /> : <FaTimes />}
          {message}
        </motion.div>
      )}
    </div>
  );
};

export default ImageBatchUpdate;