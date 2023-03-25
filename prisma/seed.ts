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
      user_username: "Mitchele",
      Admin: {
        create: {
          admin_full_name: "Mitchele Mambo Mwaura",
          admin_main: true,
        },
      },
      Profile: {
        create: {
          profile_status: "active",
          profile_description: "i am the admin of this app",
          profile_email: "mitchele@email.com",
          profile_full_name: "Mitchele Mambo Mwaura",
          profile_phone_number: "0741882052",
          profile_image: "sexy.png",
        },
      },
      user_role: "admin",
    },
  });

  //seed test users
  //1 //optimus done
  await prisma.user.create({
    data: {
      user_password: hash,
      user_national_id: 37451862,
      user_username: "Optimus",
      Profile: {
        create: {
          profile_status: "active",
          profile_description: "i am the user of this app",
          profile_email: "user@email.com",
          profile_full_name: "Optimus Prime .",
          profile_phone_number: "0741882042",
          profile_image: "optimus.png",
        },
      },
      user_role: "user",
    },
  });
  //2 //remmy done
  await prisma.user.create({
    data: {
      user_password: hash,
      user_national_id: 37451863,
      user_username: "Remmy",
      Profile: {
        create: {
          profile_status: "active",
          profile_description: "i am the user of this app",
          profile_email: "remmy@email.com",
          profile_full_name: "Remmy Martins Kamau",
          profile_phone_number: "0741882043",
          profile_image: "remmy.png",
        },
      },
      user_role: "user",
    },
  });
  //3 //clare done
  await prisma.user.create({
    data: {
      user_password: hash,
      user_national_id: 37451864,
      user_username: "Clare",
      Profile: {
        create: {
          profile_status: "active",
          profile_description: "i am the user of this app",
          profile_email: "clare@email.com",
          profile_full_name: "Clare Nice Eyes",
          profile_phone_number: "0741882043",
          profile_image: "clare.png",
        },
      },
      user_role: "user",
    },
  });
  //4 //stacy done
  await prisma.user.create({
    data: {
      user_password: hash,
      user_national_id: 37451865,
      user_username: "Stacy",
      Profile: {
        create: {
          profile_status: "active",
          profile_description: "i am the user of this app",
          profile_email: "stacy@email.com",
          profile_full_name: "Stacy Smooth Skin",
          profile_phone_number: "074188204",
          profile_image: "sexy.png",
        },
      },
      user_role: "user",
    },
  });
  //5 //simon done
  await prisma.user.create({
    data: {
      user_password: hash,
      user_national_id: 37451866,
      user_username: "Simon",
      Profile: {
        create: {
          profile_status: "active",
          profile_description: "i am the user of this app",
          profile_email: "simon@email.com",
          profile_full_name: "Simon Tall Man",
          profile_phone_number: "0741882045",
          profile_image: "simon.png",
        },
      },
      user_role: "user",
    },
  });
  //6 //Jenniffer done
  await prisma.user.create({
    data: {
      user_password: hash,
      user_national_id: 37451867,
      user_username: "Jenniffer",
      Profile: {
        create: {
          profile_status: "active",
          profile_description: "i am the user of this app",
          profile_email: "jennifer@email.com",
          profile_full_name: "Jennifer Sims Mtia",
          profile_phone_number: "0741882046",
          profile_image: "clare.png",
        },
      },
      user_role: "user",
    },
  });
  //7 //Manuel done
  await prisma.user.create({
    data: {
      user_password: hash,
      user_national_id: 37451868,
      user_username: "Manuel",
      Profile: {
        create: {
          profile_status: "active",
          profile_description: "i am the user of this app",
          profile_email: "manuel@email.com",
          profile_full_name: "Emmanuel Omole Oms",
          profile_phone_number: "0741882047",
          profile_image: "simon.png",
        },
      },
      user_role: "user",
    },
  });
  //8 //Michael done
  await prisma.user.create({
    data: {
      user_password: hash,
      user_national_id: 37451869,
      user_username: "Michael",
      Profile: {
        create: {
          profile_status: "active",
          profile_description: "i am the user of this app",
          profile_email: "michael@email.com",
          profile_full_name: "Michael Mambo Mwaura",
          profile_phone_number: "0741882048",
          profile_image: "image.png",
        },
      },
      user_role: "user",
    },
  });
  //9 //clarice done
  await prisma.user.create({
    data: {
      user_password: hash,
      user_national_id: 37451870,
      user_username: "Clarice",
      Profile: {
        create: {
          profile_status: "active",
          profile_description: "i am the user of this app",
          profile_email: "clarice@email.com",
          profile_full_name: "Clarice Brown Hair",
          profile_phone_number: "0741882050",
          profile_image: "optimus.png",
        },
      },
      user_role: "user",
    },
  });
  //10 //Mambo done
  await prisma.user.create({
    data: {
      user_password: hash,
      user_national_id: 37451871,
      user_username: "Mambo",
      Profile: {
        create: {
          profile_status: "active",
          profile_description: "i am the user of this app",
          profile_email: "mambo@email.com",
          profile_full_name: "Mambo Imechemka Leo",
          profile_phone_number: "0741882051",
          profile_image: "remmy.png",
        },
      },
      user_role: "user",
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
