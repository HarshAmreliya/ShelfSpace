 import { Book, BookOpen, Search, Users, MessageCircle, User, Settings } from "lucide-react";


 
 const Navigation = () => (
    <div className="w-64 bg-gradient-to-b from-purple-900 to-indigo-900 text-white p-6 min-h-screen">
      <div className="flex items-center mb-8">
        <Book className="w-8 h-8 mr-3 text-yellow-400" />
        <h1 className="text-2xl font-bold">ShelfSpace</h1>
      </div>
      
      <nav className="space-y-2">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: BookOpen },
          { id: 'library', label: 'My Library', icon: Book },
          { id: 'discover', label: 'Discover', icon: Search },
          { id: 'groups', label: 'Reading Groups', icon: Users },
          { id: 'chat', label: 'AI Assistant', icon: MessageCircle },
          { id: 'profile', label: 'Profile', icon: User },
          { id: 'settings', label: 'Settings', icon: Settings }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 ${
              activeTab === item.id 
                ? 'bg-white/20 text-white shadow-lg' 
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );

  export default Navigation;