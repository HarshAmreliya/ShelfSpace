/**
 * Utility functions for personalized greetings and user display
 */

/**
 * Get time-based greeting
 */
export function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return "Good Morning";
  } else if (hour >= 12 && hour < 17) {
    return "Good Afternoon";
  } else if (hour >= 17 && hour < 22) {
    return "Good Evening";
  } else {
    return "Good Night";
  }
}

/**
 * Get personalized greeting with user name
 */
export function getPersonalizedGreeting(userName?: string | null): string {
  const greeting = getTimeBasedGreeting();
  
  if (!userName) {
    return `${greeting}, Reader`;
  }

  // Extract first name if full name is provided
  const firstName = userName.split(" ")[0];
  return `${greeting}, ${firstName}`;
}

/**
 * Get user display name (fallback to email or "User")
 */
export function getUserDisplayName(
  name?: string | null,
  email?: string | null
): string {
  if (name) {
    return name;
  }
  
  if (email) {
    // Extract name from email (before @)
    const emailName = email.split("@")[0];
    if (emailName) {
      // Capitalize first letter
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
  }
  
  return "User";
}

/**
 * Get user initials for avatar
 */
export function getUserInitials(
  name?: string | null,
  email?: string | null
): string {
  if (name) {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
    }
    return (name.substring(0, 2) || "U").toUpperCase();
  }
  
  if (email) {
    return (email.substring(0, 2) || "U").toUpperCase();
  }
  
  return "U";
}

/**
 * Get motivational reading quote based on time of day
 */
export function getReadingQuote(): string {
  const hour = new Date().getHours();
  
  const morningQuotes = [
    "Start your day with a good book!",
    "A morning read sets the tone for the day.",
    "Rise and read!",
  ];
  
  const afternoonQuotes = [
    "Perfect time for a reading break!",
    "Dive into a new chapter this afternoon.",
    "Let's continue your reading journey.",
  ];
  
  const eveningQuotes = [
    "Unwind with a good book tonight.",
    "Evening is the perfect time to read.",
    "Let's explore new worlds together.",
  ];
  
  const nightQuotes = [
    "A book before bed makes for sweet dreams.",
    "Night reading is the best reading.",
    "End your day with a great story.",
  ];
  
  let quotes = afternoonQuotes;
  
  if (hour >= 5 && hour < 12) {
    quotes = morningQuotes;
  } else if (hour >= 17 && hour < 22) {
    quotes = eveningQuotes;
  } else if (hour >= 22 || hour < 5) {
    quotes = nightQuotes;
  }
  
  return quotes[Math.floor(Math.random() * quotes.length)] ?? quotes[0] ?? "";
}
