import { PrismaClient } from "@prisma/client";
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
     const hashedPassword = await bcrypt.hash('1234567890', 10);

     const admin = await prisma.user.upsert({
          where: { username: 'admin' },
          update: {},
          create: {
               username: 'admin',
               password: hashedPassword,
               role: 'ADMIN',
          }
     });

     const cashier = await prisma.user.upsert({
          where: { username: 'cashier' },
          update: {},
          create: {
               username: 'cashier',
               password: hashedPassword,
               role: 'CASHIER',
          }
     });

     console.log('Seeding Completed!');
     console.log({ admin, cashier });
}

main()
     .catch((e) => {
          console.error(e);
          process.exit(1);
     })
     .finally(async () => {
          await prisma.$disconnect();
     });