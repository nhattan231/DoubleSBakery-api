import { IsNotEmpty, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePurchaseOrderStatusDto {
  @ApiProperty({ enum: ['draft', 'confirmed', 'received', 'cancelled'] })
  @IsNotEmpty()
  @IsIn(['draft', 'confirmed', 'received', 'cancelled'])
  status: string;
}
