import { Pipe, PipeTransform } from '@angular/core';

/** ROLE_ADMIN -> Admin, EARLY_BIRD -> Early Bird, NET_BANKING -> Net Banking */
@Pipe({ name: 'label' })
export class LabelPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    return value
      .replace(/^ROLE_/, '')
      .toLowerCase()
      .split('_')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }
}
