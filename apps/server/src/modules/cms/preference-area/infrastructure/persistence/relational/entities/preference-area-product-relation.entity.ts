import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('cms_prefrence_area_product_relation')
export class PreferenceAreaProductRelationEntity {
  @ApiProperty({ description: '主键ID', type: 'integer' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiPropertyOptional({ description: '优选专区ID', type: 'integer' })
  @Column({ name: 'prefrence_area_id', nullable: true })
  preferenceAreaId: number;

  @ApiPropertyOptional({ description: '商品ID', type: 'integer' })
  @Column({ name: 'product_id', nullable: true })
  productId: number;
}
