import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'entities',
  timestamps: true,
})
export class Entity extends Model {
  @Column({
    type: DataType.STRING,
    primaryKey: true,
    allowNull: false,
  })
  address: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.ENUM('exchange', 'nft_marketplace', 'defi_protocol', 'token', 'project', 'foundation'),
    allowNull: false,
  })
  type: 'exchange' | 'nft_marketplace' | 'defi_protocol' | 'token' | 'project' | 'foundation';

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  subtype: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  verified: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  website: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description: string;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: false,
    defaultValue: [],
  })
  relatedAddresses: string[];

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  icon: string;
}