import { IsNotEmpty, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateOrderStatusDto {
  @ApiProperty({
    enum: ['pending', 'confirmed', 'processing', 'completed', 'cancelled'],
  })
  @IsNotEmpty()
  @IsIn(['pending', 'confirmed', 'processing', 'completed', 'cancelled'])
  status: string;
}
