import { SetMetadata } from '@nestjs/common/decorators/core/set-metadata.decorator';

export const PUBLIC_KEY = 'isPublic';

export const Public = () => SetMetadata(PUBLIC_KEY, true);
