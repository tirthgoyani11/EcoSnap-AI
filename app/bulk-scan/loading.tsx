export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Bulk Product Scanner
          </h1>
          <p className="text-xl text-gray-600">Analyze multiple products efficiently</p>
        </div>
        <div className="text-center py-12">
          <div className="animate-pulse">
            <div className="h-32 w-32 rounded-full bg-gray-200 mx-auto mb-4" />
            <div className="h-4 w-48 bg-gray-200 mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}
