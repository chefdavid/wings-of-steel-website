const LoadingSpinner = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-steel-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-steel-gray">Loading...</p>
      </div>
    </div>
  )
}

export default LoadingSpinner