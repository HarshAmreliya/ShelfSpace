 import { Bell } from "lucide-react";
 
 const Header = () => (
    <div className="bg-white border-b border-gray-200 p-6 flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Good morning, Reader!</h2>
        <p className="text-gray-600">Ready to dive into your next chapter?</p>
      </div>
      <div className="flex items-center space-x-4">
        <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
          <Bell className="w-5 h-5 text-gray-600" />
        </button>
        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
          U
        </div>
      </div>
    </div>
  );

  export default Header;