import { ApiProperty } from "@nestjs/swagger";

export class DevicesSessionViewModel {
  @ApiProperty({ example: '192.168.0.1' })
  ip: string;
  @ApiProperty({ example: 'Windows' })
  title: string;
  @ApiProperty({ example: '23.11.2024, 20:46:57' })
  lastActiveDate: string;
  @ApiProperty({ example: '12313qw123' })
  deviceId: string;
};