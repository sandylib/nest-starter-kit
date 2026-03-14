import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const products = await Promise.all([
    prisma.product.upsert({
      where: { id: "00000000-0000-0000-0000-000000000001" },
      update: {},
      create: {
        id: "00000000-0000-0000-0000-000000000001",
        name: "Wireless Headphones",
        description: "Noise-cancelling over-ear headphones with 30-hour battery life",
        price: 149.99,
        stock: 50,
      },
    }),
    prisma.product.upsert({
      where: { id: "00000000-0000-0000-0000-000000000002" },
      update: {},
      create: {
        id: "00000000-0000-0000-0000-000000000002",
        name: "Mechanical Keyboard",
        description: "RGB backlit mechanical keyboard with Cherry MX switches",
        price: 89.99,
        stock: 100,
      },
    }),
    prisma.product.upsert({
      where: { id: "00000000-0000-0000-0000-000000000003" },
      update: {},
      create: {
        id: "00000000-0000-0000-0000-000000000003",
        name: "USB-C Hub",
        description: "7-in-1 USB-C hub with HDMI, SD card reader, and USB 3.0 ports",
        price: 49.99,
        stock: 200,
      },
    }),
    prisma.product.upsert({
      where: { id: "00000000-0000-0000-0000-000000000004" },
      update: {},
      create: {
        id: "00000000-0000-0000-0000-000000000004",
        name: "Laptop Stand",
        description: "Adjustable aluminium laptop stand with ventilation",
        price: 39.99,
        stock: 75,
      },
    }),
    prisma.product.upsert({
      where: { id: "00000000-0000-0000-0000-000000000005" },
      update: {},
      create: {
        id: "00000000-0000-0000-0000-000000000005",
        name: "Webcam HD",
        description: "1080p HD webcam with built-in microphone and auto-focus",
        price: 69.99,
        stock: 120,
      },
    }),
  ]);

  console.log(`Seeded ${products.length} products`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
