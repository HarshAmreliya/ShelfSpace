import { Book, BookOpen, Star, Target, TrendingUp, Users } from "lucide-react";
import BookCard from "./BookCard";
import GroupCard from "./GroupCard";
import RecommendationCard from "./RecommendationCard";
import StatsCard from "./StatsCard";

// Dummy data (should be passed as props or fetched later)
const currentlyReading = [
  {
    id: 1,
    title: "Atomic Habits",
    author: "James Clear",
    cover: "📘",
    progress: 68,
  },
];

const recentActivity = [
  {
    id: 1,
    action: "rated",
    book: "Deep Work",
    rating: 5,
    time: "2 hours ago",
  },
  {
    id: 2,
    action: "joined",
    group: "Productivity Ninjas",
    time: "3 hours ago",
  },
];

const recommendations = [
  {
    id: 1,
    title: "The Power of Habit",
    author: "Charles Duhigg",
    cover: "📙",
    reason: "Based on your recent reads",
  },
];

const readingGroups = [
  {
    id: 1,
    name: "Mindset Matters",
    members: 12,
    currentBook: "Mindset by Carol Dweck",
  },
];

export default function DashboardContent() {
  return (
    <div className="p-6 space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Books Read" 
          value="24" 
          subtitle="This year" 
          icon={Book}
          color="purple"
        />
        <StatsCard 
          title="Pages Read" 
          value="6,847" 
          subtitle="Total pages" 
          icon={BookOpen}
          color="blue"
        />
        <StatsCard 
          title="Reading Streak" 
          value="12" 
          subtitle="Days in a row" 
          icon={Target}
          color="green"
        />
        <StatsCard 
          title="Reviews Written" 
          value="18" 
          subtitle="This month" 
          icon={Star}
          color="yellow"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Currently Reading */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Currently Reading</h3>
              <button className="text-purple-600 hover:text-purple-800 font-medium">View All</button>
            </div>
            <div className="space-y-4">
              {currentlyReading.map(book => (
                <BookCard key={book.id} book={book} showProgress={true} />
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {recentActivity.map(activity => (
                <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  <p className="text-sm text-gray-700">
                    You {activity.action} <span className="font-medium">{activity.book || activity.group}</span>
                    {activity.rating && (
                      <span className="ml-2">
                        {[...Array(activity.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 inline text-yellow-400 fill-current" />
                        ))}
                      </span>
                    )}
                  </p>
                  <span className="text-xs text-gray-500 ml-auto">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Recommendations */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">AI Recommendations</h3>
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div className="space-y-3">
              {recommendations.map(book => (
                <RecommendationCard key={book.id} book={book} />
              ))}
            </div>
          </div>

          {/* Reading Groups */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">My Reading Groups</h3>
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div className="space-y-3">
              {readingGroups.map(group => (
                <GroupCard key={group.id} group={group} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
