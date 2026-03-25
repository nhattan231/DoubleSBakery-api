import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

/**
 * Seed script để tạo dữ liệu mẫu cho development
 * Chạy: npx ts-node src/database/seed.ts
 */
async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'double_s_bakery',
    synchronize: false,
  });

  await dataSource.initialize();
  const queryRunner = dataSource.createQueryRunner();

  try {
    // Seed admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await queryRunner.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO NOTHING`,
      ['Admin', 'admin@doublebakery.com', hashedPassword, 'admin'],
    );

    const staffPassword = await bcrypt.hash('staff123', 10);
    await queryRunner.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO NOTHING`,
      ['Staff', 'staff@doublebakery.com', staffPassword, 'staff'],
    );

    console.log('Seed completed successfully!');
    console.log('Admin: admin@doublebakery.com / admin123');
    console.log('Staff: staff@doublebakery.com / staff123');
  } catch (error) {
    console.error('Seed failed:', error);
  } finally {
    await dataSource.destroy();
  }
}

seed();
