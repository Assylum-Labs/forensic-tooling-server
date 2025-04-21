import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Entity } from '../../entities/models/entity.model';
import * as fs from 'fs';
import * as path from 'path';

interface UnverifiedList {
  program: { [key: string]: string };
  address: { [key: string]: string };
  hacker: { [key: string]: string };
  trust_token: { [key: string]: string };
}

interface VerifiedList1Item {
  title: string;
  icon: string;
  defi_type: string;
  address: string;
}

@Injectable()
export class EntitySeeder {
  constructor(
    @InjectModel(Entity)
    private entityModel: typeof Entity,
  ) {}

  async seed() {
    try {
      // Clear existing data
      await this.entityModel.destroy({ where: {}, truncate: true });

      // Load all data sources
      const unverifiedList = this.loadUnverifiedList();
      const verifiedList1 = this.loadVerifiedList1();
      const verifiedList2 = this.loadVerifiedList2();

      // Process and merge all data
      const entities = await this.processAllSources(unverifiedList, verifiedList1, verifiedList2);

      // Batch insert all entities
      await this.entityModel.bulkCreate(entities);

    } catch (error) {
      console.error('Error seeding entities:', error);
      throw error;
    }
  }

  private loadUnverifiedList(): UnverifiedList {
    try {
      const filePath = path.join(__dirname, '../../../data/unverified-list.json');
      if (!fs.existsSync(filePath)) {
        console.warn(`Warning: ${filePath} does not exist`);
        return {
          program: {},
          address: {},
          hacker: {},
          trust_token: {}
        };
      }
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
      console.error('Error loading unverified list:', error);
      return {
        program: {},
        address: {},
        hacker: {},
        trust_token: {}
      };
    }
  }

  private loadVerifiedList1(): { [key: string]: VerifiedList1Item } {
    try {
      const filePath = path.join(__dirname, '../../../data/verified-list-1.json');
      if (!fs.existsSync(filePath)) {
        console.warn(`Warning: ${filePath} does not exist`);
        return {};
      }
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
      console.error('Error loading verified list 1:', error);
      return {};
    }
  }

  private loadVerifiedList2(): { [key: string]: string } {
    try {
      const filePath = path.join(__dirname, '../../../data/verified-list-2.json');
      if (!fs.existsSync(filePath)) {
        console.warn(`Warning: ${filePath} does not exist`);
        return {};
      }
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
      console.error('Error loading verified list 2:', error);
      return {};
    }
  }

  private async processAllSources(
    unverifiedList: UnverifiedList,
    verifiedList1: { [key: string]: VerifiedList1Item },
    verifiedList2: { [key: string]: string },
  ) {
    const entities: Partial<Entity>[] = [];
    const processedAddresses = new Set<string>();

    
    
    // Process Verified List 1 (highest priority)
    for (const [address, data] of Object.entries(verifiedList1)) {
      entities.push({
        address,
        name: data.title,
        type: this.mapDefiTypeToEntityType(data.defi_type),
        subtype: data.defi_type,
        verified: true,
        icon: data.icon,
        relatedAddresses: [],
      });
      processedAddresses.add(address);
    }
    
    // Process Verified List 2 (second priority)
    for (const [address, name] of Object.entries(verifiedList2)) {
      if (!processedAddresses.has(address)) {
        entities.push({
          address,
          name,
          type: 'project', // Default type for verified list 2
          verified: true,
          relatedAddresses: [],
        });
        processedAddresses.add(address);
      }
    }
    
    // Process Unverified List (lowest priority)
    this.processUnverifiedEntities(unverifiedList, entities, processedAddresses);

    return entities;
  }

  private processUnverifiedEntities(
    unverifiedList: UnverifiedList,
    entities: Partial<Entity>[],
    processedAddresses: Set<string>,
  ) {
    if (!unverifiedList) {
      console.warn('Warning: unverifiedList is null or undefined');
      return;
    }
    
    // Process programs
    for (const [address, name] of Object.entries(unverifiedList.program)) {
      if (!processedAddresses.has(address)) {
        entities.push({
          address,
          name,
          type: 'project',
          subtype: 'program',
          verified: false,
          relatedAddresses: [],
        });
        processedAddresses.add(address);
      }
    }
    
    // Process trusted tokens
    for (const [address, name] of Object.entries(unverifiedList.trust_token)) {
      if (!processedAddresses.has(address)) {
        entities.push({
          address,
          name,
          type: 'token',
          verified: false,
          relatedAddresses: [],
        });
        processedAddresses.add(address);
      }
    }
    
    // Process regular addresses
    for (const [address, name] of Object.entries(unverifiedList.address)) {
      if (!processedAddresses.has(address)) {
        entities.push({
          address,
          name,
          type: 'project',
          verified: false,
          relatedAddresses: [],
        });
        processedAddresses.add(address);
      }
    }
    
    // Process hacker addresses (marked as project type but with hacker subtype)
    for (const [address, name] of Object.entries(unverifiedList.hacker)) {
      if (!processedAddresses.has(address)) {
        entities.push({
          address,
          name,
          type: 'project',
          subtype: 'hacker',
          verified: false,
          relatedAddresses: [],
        });
        processedAddresses.add(address);
      }
    }
  }

  private mapDefiTypeToEntityType(defiType: string): Entity['type'] {
    const typeMap: { [key: string]: Entity['type'] } = {
      'aggregator': 'defi_protocol',
      'dex': 'defi_protocol',
      'lending': 'defi_protocol',
      'nft': 'nft_marketplace',
      'exchange': 'exchange',
      'foundation': 'foundation',
    };

    return typeMap[defiType] || 'project';
  }
}