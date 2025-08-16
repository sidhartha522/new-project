import React from 'react';

const HomePage: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Post Creation */}
      <div className="card p-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-lg font-medium text-gray-600">U</span>
          </div>
          <button className="flex-1 text-left p-3 border border-gray-300 rounded-full text-gray-500 hover:bg-gray-50 transition-colors">
            Start a post...
          </button>
        </div>
        
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <button className="flex items-center space-x-2 text-gray-600 hover:text-linkedin-blue transition-colors">
            <span>📷</span>
            <span className="text-sm font-medium">Photo</span>
          </button>
          <button className="flex items-center space-x-2 text-gray-600 hover:text-linkedin-blue transition-colors">
            <span>🎥</span>
            <span className="text-sm font-medium">Video</span>
          </button>
          <button className="flex items-center space-x-2 text-gray-600 hover:text-linkedin-blue transition-colors">
            <span>📅</span>
            <span className="text-sm font-medium">Event</span>
          </button>
          <button className="flex items-center space-x-2 text-gray-600 hover:text-linkedin-blue transition-colors">
            <span>📝</span>
            <span className="text-sm font-medium">Article</span>
          </button>
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-6">
        {/* Sample Post 1 */}
        <div className="card p-6">
          <div className="flex items-start space-x-3">
            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-lg font-medium text-gray-600">A</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900">Alex Johnson</h3>
                <span className="text-sm text-gray-500">• Manufacturing Manager</span>
              </div>
              <p className="text-sm text-gray-500">2h ago</p>
              
              <div className="mt-3">
                <p className="text-gray-800">
                  Excited to announce that our manufacturing facility has achieved ISO 9001 certification! 
                  This milestone reflects our commitment to quality and continuous improvement. Looking forward 
                  to serving our clients with even higher standards. #Manufacturing #Quality #ISO9001
                </p>
              </div>
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <button className="flex items-center space-x-2 text-gray-600 hover:text-linkedin-blue transition-colors">
                  <span>👍</span>
                  <span className="text-sm">Like</span>
                  <span className="text-sm">24</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-600 hover:text-linkedin-blue transition-colors">
                  <span>💬</span>
                  <span className="text-sm">Comment</span>
                  <span className="text-sm">5</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-600 hover:text-linkedin-blue transition-colors">
                  <span>🔄</span>
                  <span className="text-sm">Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sample Post 2 */}
        <div className="card p-6">
          <div className="flex items-start space-x-3">
            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-lg font-medium text-gray-600">S</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900">Sarah Chen</h3>
                <span className="text-sm text-gray-500">• Retail Operations Director</span>
              </div>
              <p className="text-sm text-gray-500">4h ago</p>
              
              <div className="mt-3">
                <p className="text-gray-800">
                  The future of retail is here! Our new omnichannel platform has increased customer 
                  satisfaction by 40% and streamlined our inventory management. Technology truly 
                  transforms business operations. What innovations are you implementing in your business?
                </p>
                
                <div className="mt-3 bg-gray-50 rounded-lg p-4">
                  <div className="h-40 bg-gray-300 rounded-lg mb-3 flex items-center justify-center">
                    <span className="text-gray-500">Retail Dashboard Image</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <button className="flex items-center space-x-2 text-gray-600 hover:text-linkedin-blue transition-colors">
                  <span>👍</span>
                  <span className="text-sm">Like</span>
                  <span className="text-sm">42</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-600 hover:text-linkedin-blue transition-colors">
                  <span>💬</span>
                  <span className="text-sm">Comment</span>
                  <span className="text-sm">12</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-600 hover:text-linkedin-blue transition-colors">
                  <span>🔄</span>
                  <span className="text-sm">Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sample Post 3 */}
        <div className="card p-6">
          <div className="flex items-start space-x-3">
            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-lg font-medium text-gray-600">M</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900">Michael Torres</h3>
                <span className="text-sm text-gray-500">• Distribution Specialist</span>
              </div>
              <p className="text-sm text-gray-500">6h ago</p>
              
              <div className="mt-3">
                <p className="text-gray-800">
                  Supply chain optimization is more critical than ever. Our latest route optimization 
                  has reduced delivery times by 25% and cut fuel costs significantly. Happy to share 
                  insights with fellow logistics professionals. 📦🚛
                </p>
              </div>
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <button className="flex items-center space-x-2 text-gray-600 hover:text-linkedin-blue transition-colors">
                  <span>👍</span>
                  <span className="text-sm">Like</span>
                  <span className="text-sm">18</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-600 hover:text-linkedin-blue transition-colors">
                  <span>💬</span>
                  <span className="text-sm">Comment</span>
                  <span className="text-sm">7</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-600 hover:text-linkedin-blue transition-colors">
                  <span>🔄</span>
                  <span className="text-sm">Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
