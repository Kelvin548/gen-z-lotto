import { PrismaClient, DrawStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting GEN Z LOTTO Phase 5 Database Seed (DEMO Environment)...');

  // 1. DEMO CUSTOMER WITH 10,000 MINOR UNITS (GHS 100.00)
  const demoUser = await prisma.user.upsert({
    where: { phoneNumber: '+233000000000' },
    update: {},
    create: {
      phoneNumber: '+233000000000',
      email: 'demo@genzlotto.com',
      passwordHash: '$2a$10$DEMO_PASSWORD_HASH_NOT_FOR_PRODUCTION_USE_ONLY',
      termsAcceptedAt: new Date(),
      privacyAcceptedAt: new Date(),
      wallet: {
        create: {
          currency: 'GHS',
          availableBalanceMinor: BigInt(10000), // GHS 100.00 Demo Seed Balance
        },
      },
    },
  });

  // Ensure wallet balance is initialized to at least GHS 100 if user already existed
  const existingWallet = await prisma.wallet.findUnique({
    where: { userId: demoUser.id },
  });

  if (existingWallet && existingWallet.availableBalanceMinor < BigInt(1000)) {
    await prisma.wallet.update({
      where: { id: existingWallet.id },
      data: { availableBalanceMinor: BigInt(10000) },
    });
  }

  console.log(`✅ Demo customer verified: ${demoUser.phoneNumber}`);

  // 2. SEED DEMO GAMES & GAME TYPES
  const genZGame = await prisma.game.upsert({
    where: { slug: 'gen-z-daily-590' },
    update: {
      name: 'GEN Z DAILY 5/90 (DEMO)',
      description: 'Development Demo Game - Standard 5 out of 90 Lotto draw game.',
      isActive: true,
    },
    create: {
      name: 'GEN Z DAILY 5/90 (DEMO)',
      slug: 'gen-z-daily-590',
      description: 'Development Demo Game - Standard 5 out of 90 Lotto draw game.',
      isActive: true,
      gameTypes: {
        create: [
          { name: 'Direct 1', slug: 'direct-1', minSelection: 1, maxSelection: 1, multiplier: 40.0 },
          { name: 'Direct 2', slug: 'direct-2', minSelection: 2, maxSelection: 2, multiplier: 240.0 },
          { name: 'Direct 3', slug: 'direct-3', minSelection: 3, maxSelection: 3, multiplier: 2100.0 },
          { name: 'Direct 4', slug: 'direct-4', minSelection: 4, maxSelection: 4, multiplier: 6000.0 },
          { name: 'Direct 5', slug: 'direct-5', minSelection: 5, maxSelection: 5, multiplier: 44000.0 },
          { name: 'Perm 2', slug: 'perm-2', minSelection: 3, maxSelection: 24, multiplier: 240.0 },
          { name: 'Perm 3', slug: 'perm-3', minSelection: 4, maxSelection: 24, multiplier: 2100.0 },
          { name: 'Banker', slug: 'banker-demo', minSelection: 1, maxSelection: 1, multiplier: 240.0 },
        ],
      },
    },
  });

  const nlaGame = await prisma.game.upsert({
    where: { slug: 'nla-590-demo' },
    update: {
      name: 'NLA 5/90 (DEMO)',
      description: 'Development Demo Game - Simulates national 5/90 draws.',
      isActive: true,
    },
    create: {
      name: 'NLA 5/90 (DEMO)',
      slug: 'nla-590-demo',
      description: 'Development Demo Game - Simulates national 5/90 draws.',
      isActive: true,
    },
  });

  console.log(`✅ Games created/verified: ${genZGame.name}, ${nlaGame.name}`);

  // 3. SEED DEMO DRAWS
  const now = new Date();

  // Draw 1: Open Draw (Closes in 4 hours)
  const openTime = new Date(now.getTime() + 4 * 60 * 60 * 1000);
  await prisma.draw.upsert({
    where: { drawNumber: 'DEMO-DRAW-OPEN-001' },
    update: { status: DrawStatus.OPEN, scheduledAt: openTime },
    create: {
      gameId: genZGame.id,
      drawNumber: 'DEMO-DRAW-OPEN-001',
      scheduledAt: openTime,
      status: DrawStatus.OPEN,
    },
  });

  // Draw 2: Scheduled Draw (Closing soon / scheduled)
  const closingTime = new Date(now.getTime() + 15 * 60 * 1000);
  await prisma.draw.upsert({
    where: { drawNumber: 'DEMO-DRAW-SCHEDULED-002' },
    update: { status: DrawStatus.SCHEDULED, scheduledAt: closingTime },
    create: {
      gameId: genZGame.id,
      drawNumber: 'DEMO-DRAW-SCHEDULED-002',
      scheduledAt: closingTime,
      status: DrawStatus.SCHEDULED,
    },
  });

  // Draw 3: Draft/Future Draw (Tomorrow)
  const futureTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  await prisma.draw.upsert({
    where: { drawNumber: 'DEMO-DRAW-FUTURE-003' },
    update: { status: DrawStatus.DRAFT, scheduledAt: futureTime },
    create: {
      gameId: genZGame.id,
      drawNumber: 'DEMO-DRAW-FUTURE-003',
      scheduledAt: futureTime,
      status: DrawStatus.DRAFT,
    },
  });

  // Draw 4: Closed Draw (Closed 2 hours ago)
  const pastTime = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  await prisma.draw.upsert({
    where: { drawNumber: 'DEMO-DRAW-CLOSED-004' },
    update: { status: DrawStatus.CLOSED, scheduledAt: pastTime, closedAt: pastTime },
    create: {
      gameId: genZGame.id,
      drawNumber: 'DEMO-DRAW-CLOSED-004',
      scheduledAt: pastTime,
      closedAt: pastTime,
      status: DrawStatus.CLOSED,
    },
  });

  console.log('✅ Demo Draws created: OPEN, SCHEDULED, DRAFT, CLOSED');
  console.log('\n==========================================');
  console.log('Seed completed successfully.');
  console.log('Environment: DEMO');
  console.log('==========================================');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });