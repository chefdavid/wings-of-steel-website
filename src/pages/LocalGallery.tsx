import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Gallery as PhotoSwipeGallery } from 'react-photoswipe-gallery'
import { motion, AnimatePresence } from 'framer-motion'
import Navigation from '../components/Navigation'
import ImageWithDimensions from '../components/ImageWithDimensions'
import { galleryFolders, getLocalImages } from '../data/localGalleryImages'
import 'photoswipe/dist/photoswipe.css'

const LocalGallery = () => {
  const [selectedFolder, setSelectedFolder] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [imagesPerPage, setImagesPerPage] = useState(50)
  const [viewMode, setViewMode] = useState<'folders' | 'images'>('folders')
  
  // Get current folder data
  const currentFolder = galleryFolders.find(f => 
    f.path === (selectedFolder || '*')
  ) || galleryFolders[0]
  
  // Get images for current view
  const imageData = viewMode === 'images' 
    ? getLocalImages(selectedFolder, currentPage, imagesPerPage)
    : { images: [], total: 0, totalPages: 0, page: 1, limit: 50 }

  const handleFolderClick = (folderPath: string) => {
    setSelectedFolder(folderPath === '*' ? '' : folderPath)
    setCurrentPage(1)
    setViewMode('images')
  }

  const handleBackToFolders = () => {
    setViewMode('folders')
    setSelectedFolder('')
    setCurrentPage(1)
  }

  const pageSizeOptions = [20, 50, 100, 200]

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-steel to-black">
      {/* Navigation */}
      <Navigation />
      
      {/* Gallery Title */}
      <div className="bg-gradient-to-r from-steel-blue to-ice-blue py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white font-sport tracking-wider text-center">
            PHOTO GALLERY
          </h1>
        </div>
      </div>

      {/* Header Controls */}
      <header className="bg-black/50 backdrop-blur-sm sticky top-16 z-30 border-b border-steel-blue/20">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link 
              to="/" 
              className="flex items-center gap-2 text-white hover:text-ice-blue transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="hidden sm:inline">Back to Home</span>
            </Link>
            <h2 className="text-xl sm:text-2xl font-bebas text-white tracking-wider">
              {viewMode === 'folders' ? 'Browse Albums' : currentFolder.name}
            </h2>
            <div className="text-steel-gray text-sm">
              1,191 total photos
            </div>
          </div>
        </div>
      </header>


      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        {viewMode === 'images' && (
          <motion.div 
            className="mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <button
              onClick={handleBackToFolders}
              className="flex items-center gap-2 text-steel-gray hover:text-ice-blue transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Folders
            </button>
            <h2 className="text-xl font-oswald text-white mt-2">
              {currentFolder.name}
              <span className="text-steel-gray ml-2">({currentFolder.imageCount} photos)</span>
            </h2>
          </motion.div>
        )}

        {/* Folder View */}
        {viewMode === 'folders' ? (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {galleryFolders.filter(f => f.path !== '*').map((folder, index) => (
              <motion.div
                key={folder.path}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleFolderClick(folder.path)}
                className="group cursor-pointer"
              >
                <div className="relative bg-steel-gray/10 rounded-lg p-6 border border-steel-gray/20 hover:border-steel-blue/50 hover:bg-steel-gray/20 transition-all">
                  <div className="flex flex-col items-center text-center">
                    <svg className="w-16 h-16 text-steel-blue mb-3 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z"/>
                    </svg>
                    <h3 className="text-white font-oswald text-lg mb-1">
                      {folder.name}
                    </h3>
                    <p className="text-steel-gray text-sm">{folder.imageCount} photos</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          // Images View
          <>
            {/* Pagination Controls Top */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
              <div className="flex items-center gap-4">
                <label className="text-steel-gray">Images per page:</label>
                <select
                  value={imagesPerPage}
                  onChange={(e) => {
                    setImagesPerPage(Number(e.target.value))
                    setCurrentPage(1)
                  }}
                  className="bg-steel-gray/20 text-white px-3 py-1 rounded border border-steel-gray/30 focus:border-steel-blue outline-none"
                >
                  {pageSizeOptions.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-steel-gray/20 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-steel-gray/30 transition-colors"
                >
                  Previous
                </button>
                <span className="text-steel-gray px-3">
                  Page {currentPage} of {imageData.totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(imageData.totalPages, prev + 1))}
                  disabled={currentPage === imageData.totalPages}
                  className="px-3 py-1 bg-steel-gray/20 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-steel-gray/30 transition-colors"
                >
                  Next
                </button>
              </div>

              <div className="text-steel-gray text-sm">
                Showing {Math.min((currentPage - 1) * imagesPerPage + 1, imageData.total)}-{Math.min(currentPage * imagesPerPage, imageData.total)} of {imageData.total}
              </div>
            </div>

            {/* Image Grid */}
            <PhotoSwipeGallery
              options={{
                zoom: true,
                showHideAnimationType: 'fade',
                bgOpacity: 0.95,
                pinchToClose: true,
                closeOnVerticalDrag: true,
                padding: { top: 20, bottom: 20, left: 20, right: 20 },
                maxWidthToAnimate: 400,
                hideAnimationDuration: 300,
                showAnimationDuration: 300,
                zoomAnimationDuration: 300,
                errorMsg: 'The image could not be loaded',
                preload: [1, 2], // Preload 1 image before and 2 after
                allowPanToNext: true,
                spacing: 0.1,
                loop: true,
                wheelToZoom: true
              }}
            >
              <motion.div 
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <AnimatePresence mode="wait">
                  {imageData.images.map((image, index) => (
                    <ImageWithDimensions
                      key={image.id}
                      src={image.src}
                      alt={image.alt}
                      index={index}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            </PhotoSwipeGallery>

            {/* Pagination Controls Bottom */}
            {imageData.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-steel-gray/20 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-steel-gray/30 transition-colors"
                >
                  First
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-steel-gray/20 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-steel-gray/30 transition-colors"
                >
                  ← Previous
                </button>
                
                {/* Page numbers */}
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, imageData.totalPages) }, (_, i) => {
                    let pageNum
                    if (imageData.totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= imageData.totalPages - 2) {
                      pageNum = imageData.totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 rounded transition-colors ${
                          currentPage === pageNum
                            ? 'bg-steel-blue text-white'
                            : 'bg-steel-gray/20 text-white hover:bg-steel-gray/30'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(imageData.totalPages, prev + 1))}
                  disabled={currentPage === imageData.totalPages}
                  className="px-3 py-1 bg-steel-gray/20 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-steel-gray/30 transition-colors"
                >
                  Next →
                </button>
                <button
                  onClick={() => setCurrentPage(imageData.totalPages)}
                  disabled={currentPage === imageData.totalPages}
                  className="px-3 py-1 bg-steel-gray/20 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-steel-gray/30 transition-colors"
                >
                  Last
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default LocalGallery