import { Test, TestingModule } from '@nestjs/testing';
import { HttpModule, HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import * as nock from 'nock';
import { NlrcVerifierService } from './nlrc-verifier.service';
import { PrismaService } from './prisma.service';

describe('NlrcVerifierService', () => {
  let service: NlrcVerifierService;
  let httpService: HttpService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    nlrcLicence: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    process.env.NLRC_API_URL = 'https://api.nlrc.gov.ng/v1/verify';
    process.env.NLRC_LICENCE_NUMBER = 'TEST-LICENCE-12345';
    process.env.NLRC_API_KEY = 'test-api-key';

    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [
        NlrcVerifierService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<NlrcVerifierService>(NlrcVerifierService);
    httpService = module.get<HttpService>(HttpService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    nock.cleanAll();
    jest.clearAllMocks();
  });

  describe('verifyLicence', () => {
    it('should successfully verify an ACTIVE licence', async () => {
      const mockResponse = {
        status: 'ACTIVE',
        licenceNumber: 'TEST-LICENCE-12345',
        expiryDate: '2025-12-31',
        operatorName: 'Betfuz Nigeria',
        issuedDate: '2024-01-01',
      };

      nock('https://api.nlrc.gov.ng')
        .get('/v1/verify')
        .query({ licence: 'TEST-LICENCE-12345' })
        .reply(200, mockResponse);

      await service.verifyLicence();

      expect(mockPrismaService.nlrcLicence.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: 'ACTIVE',
          licenceNumber: 'TEST-LICENCE-12345',
          errorMessage: null,
          responseData: mockResponse,
        }),
      });
    });

    it('should handle EXPIRED licence status', async () => {
      const mockResponse = {
        status: 'EXPIRED',
        licenceNumber: 'TEST-LICENCE-12345',
        expiryDate: '2024-01-01',
        operatorName: 'Betfuz Nigeria',
        issuedDate: '2023-01-01',
      };

      nock('https://api.nlrc.gov.ng')
        .get('/v1/verify')
        .query({ licence: 'TEST-LICENCE-12345' })
        .reply(200, mockResponse);

      await service.verifyLicence();

      expect(mockPrismaService.nlrcLicence.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: 'EXPIRED',
          errorMessage: null,
        }),
      });
    });

    it('should handle API errors gracefully', async () => {
      nock('https://api.nlrc.gov.ng')
        .get('/v1/verify')
        .query({ licence: 'TEST-LICENCE-12345' })
        .replyWithError('Network error');

      await service.verifyLicence();

      expect(mockPrismaService.nlrcLicence.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: 'UNKNOWN',
          errorMessage: expect.stringContaining('Network error'),
        }),
      });
    });

    it('should handle missing configuration', async () => {
      delete process.env.NLRC_LICENCE_NUMBER;

      await service.verifyLicence();

      expect(mockPrismaService.nlrcLicence.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: 'UNKNOWN',
          errorMessage: 'Configuration missing',
        }),
      });
    });
  });

  describe('getCurrentLicenceStatus', () => {
    it('should return current licence status', async () => {
      const mockLicence = {
        id: 1,
        status: 'ACTIVE',
        licenceNumber: 'TEST-LICENCE-12345',
        expiryDate: new Date('2025-12-31'),
        lastChecked: new Date(),
        responseData: null,
        errorMessage: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.nlrcLicence.findFirst.mockResolvedValue(mockLicence);

      const result = await service.getCurrentLicenceStatus();

      expect(result.status).toBe('ACTIVE');
      expect(result.isValid).toBe(true);
    });

    it('should return UNKNOWN status when no data exists', async () => {
      mockPrismaService.nlrcLicence.findFirst.mockResolvedValue(null);

      const result = await service.getCurrentLicenceStatus();

      expect(result.status).toBe('UNKNOWN');
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe('No licence verification data available');
    });
  });

  describe('isBettingAllowed', () => {
    it('should return true when licence is ACTIVE', async () => {
      const mockLicence = {
        id: 1,
        status: 'ACTIVE',
        licenceNumber: 'TEST-LICENCE-12345',
        expiryDate: new Date('2025-12-31'),
        lastChecked: new Date(),
        responseData: null,
        errorMessage: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.nlrcLicence.findFirst.mockResolvedValue(mockLicence);

      const result = await service.isBettingAllowed();

      expect(result).toBe(true);
    });

    it('should return false when licence is EXPIRED', async () => {
      const mockLicence = {
        id: 1,
        status: 'EXPIRED',
        licenceNumber: 'TEST-LICENCE-12345',
        expiryDate: new Date('2024-01-01'),
        lastChecked: new Date(),
        responseData: null,
        errorMessage: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.nlrcLicence.findFirst.mockResolvedValue(mockLicence);

      const result = await service.isBettingAllowed();

      expect(result).toBe(false);
    });
  });
});
