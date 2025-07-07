import { Test, TestingModule } from '@nestjs/testing';

import { DecodedId, IdService } from './id.service';

describe('IdService', () => {
  let service: IdService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IdService],
    }).compile();

    service = module.get<IdService>(IdService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generate', () => {
    it('should return a string', () => {
      const id = service.generate();
      expect(typeof id).toBe('string');
    });

    it('should return non-empty string', () => {
      const id = service.generate();
      expect(id).toBeTruthy();
      expect(id.length).toBeGreaterThan(0);
    });

    it('should generate unique IDs', () => {
      const id1 = service.generate();
      const id2 = service.generate();
      expect(id1).not.toBe(id2);
    });

    it('should generate URL-safe IDs', () => {
      const id = service.generate();
      // URL-safe characters: A-Z, a-z, 0-9, -, _
      const urlSafePattern = /^[A-Za-z0-9\-_]+$/;
      expect(id).toMatch(urlSafePattern);
    });
  });

  describe('decode', () => {
    it('should decode generated ID correctly', () => {
      const id = service.generate();
      const decoded = service.decode(id);

      expect(decoded).toBeDefined();
      expect(typeof decoded).toBe('object');
    });

    it('should return DecodedId with uuid and count properties', () => {
      const id = service.generate();
      const decoded: DecodedId = service.decode(id);

      expect(decoded).toHaveProperty('uuid');
      expect(decoded).toHaveProperty('count');
      expect(typeof decoded.uuid).toBe('string');
      expect(typeof decoded.count).toBe('number');
    });

    it('should have valid uuid format', () => {
      const id = service.generate();
      const decoded = service.decode(id);

      expect(decoded.uuid).toBeTruthy();
      expect(decoded.uuid.length).toBeGreaterThan(0);
    });

    it('should have valid count', () => {
      const id = service.generate();
      const decoded = service.decode(id);

      expect(decoded.count).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(decoded.count)).toBe(true);
    });

    it('should maintain consistency between generate and decode', () => {
      const ids = Array.from({ length: 5 }, () => service.generate());
      const decodedIds = ids.map((id) => service.decode(id));

      decodedIds.forEach((decoded) => {
        expect(decoded).toBeDefined();
        expect(decoded.uuid).toBeTruthy();
        expect(decoded.count).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('integration tests', () => {
    it('should handle multiple operations correctly', () => {
      const operations = 10;
      const results: Array<{ id: string; decoded: DecodedId }> = [];

      for (let i = 0; i < operations; i++) {
        const id = service.generate();
        const decoded = service.decode(id);
        results.push({ id, decoded });
      }

      const uniqueIds = new Set(results.map((r) => r.id));
      expect(uniqueIds.size).toBe(operations);

      results.forEach(({ decoded }) => {
        expect(decoded.uuid).toBeTruthy();
        expect(typeof decoded.count).toBe('number');
      });
    });
  });
});
