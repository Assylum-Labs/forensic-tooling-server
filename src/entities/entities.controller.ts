import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    HttpStatus,
    HttpCode,
  } from '@nestjs/common';
  import { EntitiesService } from './entities.service';
  import { CreateEntityDto } from './dto/create-entity.dto';
  import { UpdateEntityDto } from './dto/update-entity.dto';
  import { Entity } from './models/entity.model';
  
  @Controller('entities')
  export class EntitiesController {
    constructor(private readonly entitiesService: EntitiesService) {}
  
    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() createEntityDto: CreateEntityDto): Promise<Entity> {
      return this.entitiesService.create(createEntityDto);
    }
  
    @Get()
    findAll(
      @Query('type') type?: Entity['type'],
      @Query('verified') verified?: boolean,
      @Query('search') search?: string,
      @Query('limit') limit?: number,
      @Query('offset') offset?: number,
    ): Promise<{ entities: Entity[]; total: number }> {
      return this.entitiesService.findAll({
        type,
        verified,
        search,
        limit: limit ? Number(limit) : undefined,
        offset: offset ? Number(offset) : undefined,
      });
    }
  
    @Get(':address')
    findOne(@Param('address') address: string): Promise<Entity> {
      return this.entitiesService.findOne(address);
    }
  
    @Post('bulk')
    @HttpCode(HttpStatus.CREATED)
    bulkCreate(@Body() createEntityDtos: CreateEntityDto[]): Promise<Entity[]> {
      return this.entitiesService.bulkCreate(createEntityDtos);
    }
  
    @Patch('bulk')
    bulkUpdate(
      @Body() updates: { address: string; data: UpdateEntityDto }[],
    ): Promise<Entity[]> {
      return this.entitiesService.bulkUpdate(updates);
    }
  
    @Post('by-addresses')
    @HttpCode(HttpStatus.OK)
    findByAddresses(@Body() addresses: string[]): Promise<Entity[]> {
      return this.entitiesService.findByAddresses(addresses);
    }
  
    @Patch(':address')
    update(
      @Param('address') address: string,
      @Body() updateEntityDto: UpdateEntityDto,
    ): Promise<Entity> {
      return this.entitiesService.update(address, updateEntityDto);
    }
  
    @Delete(':address')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('address') address: string): Promise<void> {
      return this.entitiesService.remove(address);
    }
  
    @Post(':address/related/:relatedAddress')
    addRelatedAddress(
      @Param('address') address: string,
      @Param('relatedAddress') relatedAddress: string,
    ): Promise<Entity> {
      return this.entitiesService.addRelatedAddress(address, relatedAddress);
    }
  
    @Delete(':address/related/:relatedAddress')
    removeRelatedAddress(
      @Param('address') address: string,
      @Param('relatedAddress') relatedAddress: string,
    ): Promise<Entity> {
      return this.entitiesService.removeRelatedAddress(address, relatedAddress);
    }
  }