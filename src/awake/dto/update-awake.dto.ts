import { PartialType } from '@nestjs/mapped-types';
import { CreateAwakeDto } from './create-awake.dto';

export class UpdateAwakeDto extends PartialType(CreateAwakeDto) {}
