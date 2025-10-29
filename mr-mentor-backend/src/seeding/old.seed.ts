import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();

import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Mentor } from '../entities/Mentor';
import { UserRole } from '../types/UserTypes';
import { DatabaseService } from '../config/database';

// Base mentor data (unique entries only)
const baseMentors = [
  {
    name: "Aman Gupta",
    company: "Meta",
    role: "Product Manager",
    institute: "Indian Institute of Management (IIM) Ahmedabad",
    slotsLeft: 20,
    image: "/businessman-black-suit-makes-thumbs-up.svg",
    description: "Coaching engineers to shift into product management and leadership roles",
    category: 'Product Management',
    subCategory: 'Product Manager'
  },
  {
    name: "Ritika Singh",
    company: "Adobe",
    role: "Product Designer",
    institute: "National Institute of Design (NID) Ahmedabad",
    slotsLeft: 12,
    image: "/businesswoman-designer.svg",
    description: "Guiding aspiring product designers on UI/UX best practices",
    category: 'Product Management',
    subCategory: 'Product Designer (UI/UX)'
  },
  {
    name: "Manish Kapoor",
    company: "Flipkart",
    role: "Product Analyst",
    institute: "IIT Delhi",
    slotsLeft: 15,
    image: "/businessman-black-suit-makes-thumbs-up.svg",
    description: "Helping analysts turn data into actionable product insights",
    category: 'Product Management',
    subCategory: 'Product Analyst'
  },
  {
    name: "Neha Sharma",
    company: "Swiggy",
    role: "Product Manager",
    institute: "IIM Bangalore",
    slotsLeft: 18,
    image: "/businesswoman-black-suit.svg",
    description: "Mentoring PMs on roadmaps, KPIs, and stakeholder management",
    category: 'Product Management',
    subCategory: 'Product Manager'
  },
  {
    name: "Niti Jain",
    company: "Meta",
    role: "Data Scientist",
    institute: "Indian Institute of Management (IIM) Ahmedabad",
    slotsLeft: 20,
    image: "/businessman-black-suit-makes-thumbs-up.svg",
    description: "Coaching engineers to shift into product management and leadership roles",
    category: 'Data Science',
    subCategory: 'Data Science'
  },
  {
    name: "Hirakjyoti Medhi",
    company: "Virtusa",
    role: "Data Analyst",
    institute: "IIT Bombay",
    slotsLeft: 24,
    image: "/businessman-black-suit-makes-thumbs-up.svg",
    description: "Helping B.Tech grads crack FAANG interviews with system design prep",
    category: 'Business & Consultancy',
    subCategory: 'Business Analyst'
  },
  {
    name: "Priyanka Jain",
    company: "McKinsey",
    role: "Management Consultant",
    institute: "IIM Ahmedabad",
    slotsLeft: 14,
    image: "/businesswoman-black-suit.svg",
    description: "Mentoring on consulting case studies and problem solving",
    category: 'Business & Consultancy',
    subCategory: 'Management Consultant'
  },
  {
    name: "Raghav Mehra",
    company: "KPMG",
    role: "Financial Advisor",
    institute: "Delhi University",
    slotsLeft: 10,
    image: "/businessman-black-suit-makes-thumbs-up.svg",
    description: "Guiding finance enthusiasts on investment and advisory roles",
    category: 'Business & Consultancy',
    subCategory: 'Financial Advisor'
  },
  {
    name: "Ananya Roy",
    company: "Accenture",
    role: "Business Analyst",
    institute: "IIT Madras",
    slotsLeft: 16,
    image: "/businesswoman-black-suit.svg",
    description: "Helping aspiring BAs bridge tech and business requirements",
    category: 'Business & Consultancy',
    subCategory: 'Business Analyst'
  },
  {
    name: "Priya Sharma",
    company: "Amazon",
    role: "Software Development Engineer",
    institute: "DTU",
    slotsLeft: 15,
    image: "/businessman-black-suit-makes-thumbs-up.svg",
    description: "Guiding students in mastering DSA and building scalable backend systems",
    category: 'Engineering',
    subCategory: 'Backend Developer'
  },
  {
    name: "Rohit Verma",
    company: "Microsoft",
    role: "Cloud Engineer",
    institute: "BITS Pilani",
    slotsLeft: 12,
    image: "/businessman-black-suit-makes-thumbs-up.svg",
    description: "Helping engineers transition into cloud & DevOps roles with Azure expertise",
    category: 'Engineering',
    subCategory: 'DevOps Engineer'
  },
  {
    name: "Siddharth Sen",
    company: "Infosys",
    role: "Frontend Developer",
    institute: "IIT Roorkee",
    slotsLeft: 20,
    image: "/businessman-black-suit-makes-thumbs-up.svg",
    description: "Mentoring on React, Angular, and building interactive UIs",
    category: 'Engineering',
    subCategory: 'Frontend Developer'
  },
  {
    name: "Ankit Sharma",
    company: "Google",
    role: "Frontend Developer",
    institute: "IIT Kanpur",
    slotsLeft: 18,
    image: "/businessman-black-suit-makes-thumbs-up.svg",
    description: "Helping students create responsive and performant frontend apps",
    category: 'Engineering',
    subCategory: 'Frontend Developer'
  }
];

// Additional variations for companies, institutes, and names
const companies = [
  "Google", "Microsoft", "Amazon", "Apple", "Meta", "Netflix", "Adobe", "Salesforce", 
  "Oracle", "IBM", "Accenture", "Deloitte", "PwC", "KPMG", "EY", "McKinsey", 
  "BCG", "Bain", "Uber", "Airbnb", "Spotify", "Tesla", "NASA", "ISRO"
];

const institutes = [
  "IIT Bombay", "IIT Delhi", "IIT Madras", "IIT Kanpur", "IIT Kharagpur", "IIT Roorkee",
  "IIT Guwahati", "IIT Hyderabad", "IIT Indore", "IIT Varanasi", "IIT Palakkad",
  "IIT Tirupati", "IIT Dhanbad", "IIT Bhilai", "IIT Goa", "IIT Jammu", "IIT Dharwad",
  "NIT Trichy", "NIT Surathkal", "NIT Warangal", "NIT Calicut", "NIT Kurukshetra",
  "IIM Ahmedabad", "IIM Bangalore", "IIM Calcutta", "IIM Lucknow", "IIM Indore",
  "IIM Kozhikode", "IIM Shillong", "IIM Rohtak", "IIM Ranchi", "IIM Tiruchirappalli",
  "IIM Kashipur", "IIM Udaipur", "IIM Nagpur", "IIM Amritsar", "IIM Bodh Gaya",
  "IIM Sambalpur", "IIM Visakhapatnam", "IIM Jammu", "IIM Sirmaur", "IIM Nagpur"
];

const firstNames = [
  "Aarav", "Aditya", "Ajay", "Akash", "Amit", "Anand", "Anil", "Ankit", "Arjun", "Ashish",
  "Deepak", "Dhruv", "Divya", "Gaurav", "Kavita", "Manish", "Neha", "Nikhil", "Pooja",
  "Prakash", "Priya", "Rahul", "Raj", "Rajesh", "Rakesh", "Ramesh", "Ravi", "Rohit",
  "Sachin", "Sameer", "Sanjay", "Saurabh", "Shivam", "Siddharth", "Suresh", "Vikas",
  "Vivek", "Yash", "Abhishek", "Aman", "Ananya", "Arpita", "Ishita", "Kritika", "Meera"
];

const lastNames = [
  "Agarwal", "Ahmed", "Ali", "Anand", "Bansal", "Chopra", "Das", "Deshmukh", "Dubey",
  "Garg", "Gill", "Goyal", "Gupta", "Iyer", "Jain", "Jha", "Joshi", "Kapoor", "Kumar",
  "Mahajan", "Malhotra", "Mehta", "Mishra", "Nair", "Pandey", "Patel", "Prasad", "Rao",
  "Reddy", "Saha", "Saini", "Saxena", "Shah", "Sharma", "Singh", "Sinha", "Sood", "Tiwari",
  "Varma", "Verma", "Yadav"
];

// Generate 100 mentor entries
const generateMentors = () => {
  const mentors: any[] = [];
  const usedEmails = new Set<string>();
  
  for (let i = 0; i < 100; i++) {
    const baseIndex = i % baseMentors.length;
    const base = baseMentors[baseIndex];
    
    // Create variations with unique email
    let email: string;
    let attempts = 0;
    do {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@myanalyticsschool.com`;
      attempts++;
      if (attempts > 1000) {
        // Fallback to add index to ensure uniqueness
        email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@myanalyticsschool.com`;
        break;
      }
    } while (usedEmails.has(email));
    
    usedEmails.add(email);
    
    const name = email.split('@')[0].split('.').map(part => 
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join(' ');
    const company = companies[Math.floor(Math.random() * companies.length)];
    const institute = institutes[Math.floor(Math.random() * institutes.length)];
    const slotsLeft = Math.floor(Math.random() * 25) + 5; // 5-30 slots
    
    mentors.push({
      ...base,
      name,
      email,
      company,
      institute,
      slotsLeft,
      // Vary description slightly
      description: `${base.description} (Specialization ${Math.floor(i / baseMentors.length) + 1})`
    });
  }
  
  return mentors;
};

export const seed = async (dataSource: DataSource) => {
  const userRepository = dataSource.getRepository(User);
  const mentorRepository = dataSource.getRepository(Mentor);
  
  // Clear existing data (optional)
  await userRepository.query('TRUNCATE TABLE mentors CASCADE');
  await userRepository.query('TRUNCATE TABLE users CASCADE');
  
  // Generate mentor data
  const mentorsData = generateMentors();
  
  // Create users
  const users = mentorsData.map(mentor => {
    const user = new User();
    user.fullName = mentor.name;
    user.email = mentor.email;
    user.role = UserRole.EXPERT;
    user.isVerified = true;
    user.isProfileComplete = true;
    user.profilePhoto = mentor.image;
    return user;
  });
  
  // Save users
  const savedUsers = await userRepository.save(users);
  
  // Create mentors
  const mentors = savedUsers.map((user, index) => {
    const mentorData = mentorsData[index];
    const mentor = new Mentor();
    mentor.company = mentorData.company;
    mentor.role = mentorData.role;
    mentor.institute = mentorData.institute;
    mentor.slotsLeft = mentorData.slotsLeft;
    mentor.description = mentorData.description;
    mentor.category = mentorData.category;
    mentor.subCategory = mentorData.subCategory;
    mentor.image = mentorData.image;
    mentor.user = user;
    return mentor;
  });
  
  // Save mentors
  await mentorRepository.save(mentors);
  
  console.log(`Seeded ${mentors.length} mentors successfully!`);
};

async function main() {
  const dbService = DatabaseService.getInstance();
  await dbService.initialize();
  await seed(dbService.dataSource);
  await dbService.close();
}

main().catch(console.error);