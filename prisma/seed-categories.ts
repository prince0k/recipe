import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding categories...");

  const categories = [
    {
      name: "Breakfast",
      slug: "breakfast",
      tag: "breakfast",
      imageUrl: "/uploads/images/category_breakfast.png",
      order: 1,
    },
    {
      name: "Lunch",
      slug: "lunch",
      tag: "lunch",
      imageUrl: "/uploads/images/category_lunch.png",
      order: 2,
    },
    {
      name: "Dinner",
      slug: "dinner",
      tag: "dinner",
      imageUrl: "/uploads/images/category_dinner.png",
      order: 3,
    },
    {
      name: "VEG",
      slug: "veg",
      tag: "veg",
      imageUrl: "/uploads/images/category_veg.png",
      order: 4,
    },
    {
      name: "Non VEG",
      slug: "non-veg",
      tag: "non-veg",
      imageUrl: "/uploads/images/category_non_veg.png",
      order: 5,
    },
    {
      name: "Drinks",
      slug: "drinks",
      tag: "drinks",
      imageUrl: "/uploads/images/category_drinks.png",
      order: 6,
    },
    {
      name: "Snacks",
      slug: "snacks",
      tag: "snacks",
      imageUrl: "/uploads/images/category_snacks.png",
      order: 7,
    },
    {
      name: "Desserts",
      slug: "desserts",
      tag: "desserts",
      imageUrl: "/uploads/images/category_desserts.png",
      order: 8,
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        tag: category.tag,
        imageUrl: category.imageUrl,
        order: category.order,
      },
      create: category,
    });
  }

  console.log("Categories seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
