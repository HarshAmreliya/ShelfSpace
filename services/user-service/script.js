import axios from "axios";

const users = [
  {
    name: "Jai",
    email: "jai@example.com",
  },
  {
    name: "Viral",
    email: "viral@example.com",
  },
  {
    name: "Harsh",
    email: "harsh@example.com",
  },
  {
    name: "Ritvik",
    email: "ritvik@example.com",
  },
  {
    name: "Divyansh",
    email: "divyansh@example.com",
  },
  {
    name: "Tiwari",
    email: "tiwari@example.com",
  },
  {
    name: "Garv",
    email: "garv@example.com",
  },
  {
    name: "Mohit",
    email: "mohit@example.com",
  },
  {
    name: "Rauneet",
    email: "rauneet@example.com",
  },
];
const API_URL = "http://localhost:3001/api/me";

for (const user of users) {
  // console.log(user);
  try {
    const response = await axios.post(API_URL, user);
    console.log(`✅ Successfully created user: ${response}`);
  } catch (err) {
    console.error(err);
  }
}

// try {
//   const response = await axios.post(API_URL, users[0]);
//   console.log(`✅ Successfully created user: ${response}`);
// } catch (err) {
//   console.error(err);
// }
