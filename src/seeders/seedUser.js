import { User } from '../models/user.model.js'; // adjust path
import bcrypt from 'bcrypt';

const admins = [
  { name: "Biswajeet Jena", email: "admin1@example.com", password: "Admin@123" },
  { name: "Sankeet Pradhan", email: "admin2@example.com", password: "Admin@123" },
  { name: "Santosh Jena", email: "admin3@example.com", password: "Admin@123" },
  { name: "Haraprasad Rath", email: "admin4@example.com", password: "Admin@123" },
  { name: "Subham Kumar", email: "admin5@example.com", password: "Admin@123" }
];

const seedAdminUsers = async () => {
  try {
    for (const admin of admins) {
      const existing = await User.findOne({ email: admin.email });

      if (!existing) {
        const hashedPassword = await bcrypt.hash(admin.password, 10);
        await User.create({
          name: admin.name,
          email: admin.email,
          password: hashedPassword,
          role: 'admin'
        });
        console.log(`Created: ${admin.email}`);
      } else {
        console.log(`Already exists: ${admin.email}`);
      }
    }
  } catch (error) {
    console.error("Error seeding admin users:", error);
  }
};

export default seedAdminUsers;
