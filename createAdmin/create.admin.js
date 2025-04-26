import prisma from "../lib/prisma.js"
import bcrypt from "bcrypt";

async function createAdminUser() {
    const username = 'adminUser';
    const email = 'admin@gmail.com';
    const password = 'admin123'; 
    const hashedPassword = await bcrypt.hash(password, 10);
  
    try {
      const newUser = await prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          role: 'ADMIN', 
        },
      });
  
      console.log('Admin user created:', newUser);
    } catch (error) {
      console.error('Error creating admin user:', error);
    } finally {
      await prisma.$disconnect();
    }
  }
  
  createAdminUser();

  
