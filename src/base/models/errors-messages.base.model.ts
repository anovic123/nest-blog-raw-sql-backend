import { ApiProperty } from '@nestjs/swagger';

class ErrorMessage {
  @ApiProperty({ description: 'Error description', example: 'string' })
  message: string;

  @ApiProperty({ description: 'The field related to the error', example: 'string' })
  field: string;
}

export class ErrorResponseDto {
  @ApiProperty({
    description: 'Array of error messages',
    type: [ErrorMessage],
    example: [
      { message: 'Invalid input', field: 'email' },
      { message: 'Password is required', field: 'password' },
    ],
  })
  errorsMessages: ErrorMessage[];
}
