import { PrismaClient } from "@prisma/client";
import * as argon2 from "argon2";
const prisma = new PrismaClient();

async function main() {
  const hash = await argon2.hash("1234", {
    hashLength: 10,
  });

  await prisma.user.create({
    data: {
      user_password: hash,
      user_national_id: 37451861,
      user_username: "Mike",
      Profile: {
        create: {
          profile_status: "active",
          profile_description: "i am the admin of this app",
          profile_email: "admin@email.com",
          profile_full_name: "Michael Mambo Mwaura",
          profile_phone_number: "0741882041",
          profile_image: "image.png",
        },
      },
      user_role: "admin",
    },
  });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
