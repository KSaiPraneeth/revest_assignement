import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateOrdersTables1719500000001 implements MigrationInterface {
  name = 'CreateOrdersTables1719500000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TYPE "order_status_enum" AS ENUM (
        'PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'
      )
    `);

    await queryRunner.createTable(
      new Table({
        name: 'orders',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'customer_name', type: 'varchar', length: '255' },
          { name: 'customer_email', type: 'varchar', length: '255' },
          { name: 'total_amount', type: 'decimal', precision: 12, scale: 2 },
          {
            name: 'status',
            type: 'order_status_enum',
            default: "'CONFIRMED'",
          },
          { name: 'created_at', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'order_items',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'order_id', type: 'uuid' },
          { name: 'product_id', type: 'uuid' },
          { name: 'product_name', type: 'varchar', length: '255' },
          { name: 'quantity', type: 'int' },
          { name: 'unit_price', type: 'decimal', precision: 12, scale: 2 },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'order_items',
      new TableForeignKey({
        columnNames: ['order_id'],
        referencedTableName: 'orders',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createIndex(
      'orders',
      new TableIndex({
        name: 'IDX_orders_status',
        columnNames: ['status'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('order_items');
    await queryRunner.dropTable('orders');
    await queryRunner.query(`DROP TYPE "order_status_enum"`);
  }
}
