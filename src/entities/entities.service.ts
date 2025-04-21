import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Entity } from './models/entity.model';
import { CreateEntityDto } from './dto/create-entity.dto';
import { UpdateEntityDto } from './dto/update-entity.dto';
import { FindOptions, Op } from 'sequelize';

@Injectable()
export class EntitiesService {
  constructor(
    @InjectModel(Entity)
    private entityModel: typeof Entity,
  ) {}

  async create(createEntityDto: CreateEntityDto): Promise<Entity> {
    // Check if entity with this address already exists
    const existing = await this.entityModel.findByPk(createEntityDto.address);
    if (existing) {
      throw new Error('Entity with this address already exists');
    }
    return this.entityModel.create(createEntityDto as any);
  }

  async findAll(query: {
    type?: Entity['type'];
    verified?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ entities: Entity[]; total: number }> {
    const { type, verified, search, limit = 10, offset = 0 } = query;

    const where: any = {};
    if (type) where.type = type;
    if (verified !== undefined) where.verified = verified;
    if (search) {
      where[Op.or] = [
        { address: { [Op.iLike]: `%${search}%` } },
        { name: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const options: FindOptions = {
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    };

    const [entities, total] = await Promise.all([
      this.entityModel.findAll(options),
      this.entityModel.count({ where }),
    ]);

    return { entities, total };
  }

  async findOne(address: string): Promise<Entity> {
    const entity = await this.entityModel.findByPk(address);
    if (!entity) {
      throw new NotFoundException(`Entity with address ${address} not found`);
    }
    return entity;
  }

  async findByAddresses(addresses: string[]): Promise<Entity[]> {
    return this.entityModel.findAll({
      where: {
        address: {
          [Op.in]: addresses,
        },
      },
    });
  }

  async update(address: string, updateEntityDto: UpdateEntityDto): Promise<Entity> {
    const entity = await this.findOne(address);
    await entity.update(updateEntityDto as any);
    return entity;
  }

  async remove(address: string): Promise<void> {
    const entity = await this.findOne(address);
    await entity.destroy();
  }

  async addRelatedAddress(address: string, relatedAddress: string): Promise<Entity> {
    const entity = await this.findOne(address);
    const relatedAddresses = new Set(entity.relatedAddresses);
    relatedAddresses.add(relatedAddress);
    await entity.update({ relatedAddresses: Array.from(relatedAddresses) } as any);
    return entity;
  }

  async removeRelatedAddress(address: string, relatedAddress: string): Promise<Entity> {
    const entity = await this.findOne(address);
    const relatedAddresses = new Set(entity.relatedAddresses);
    relatedAddresses.delete(relatedAddress);
    await entity.update({ relatedAddresses: Array.from(relatedAddresses) } as any);
    return entity;
  }

  async bulkCreate(entities: CreateEntityDto[]): Promise<Entity[]> {
    const createData = entities.map(entity => ({
      ...entity,
      relatedAddresses: entity.relatedAddresses || [],
    }));
    return this.entityModel.bulkCreate(createData as any[]);
  }

  async bulkUpdate(entities: { address: string; data: UpdateEntityDto }[]): Promise<Entity[]> {
    const results = await Promise.all(
      entities.map(async ({ address, data }) => {
        const entity = await this.findOne(address);
        return entity.update(data as any);
      })
    );
    return results;
  }
}