import { TestBed } from '@angular/core/testing';

import { PlanBuilderService } from './plan-builder.service';

describe('PlanBuilderService', () => {
  let service: PlanBuilderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlanBuilderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
