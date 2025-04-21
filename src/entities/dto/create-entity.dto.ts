import { IsString, IsEnum, IsBoolean, IsOptional, IsArray } from 'class-validator';

export type EntityType = 'exchange' | 'nft_marketplace' | 'defi_protocol' | 'token' | 'project' | 'foundation';

export class CreateEntityDto {
  @IsString()
  address: string;

  @IsString()
  name: string;

  @IsEnum(['exchange', 'nft_marketplace', 'defi_protocol', 'token', 'project', 'foundation'])
  type: EntityType;

  @IsString()
  @IsOptional()
  subtype?: string;

  @IsBoolean()
  @IsOptional()
  verified?: boolean;

  @IsString()
  @IsOptional()
  website?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  relatedAddresses?: string[];

  @IsString()
  @IsOptional()
  icon?: string;
}