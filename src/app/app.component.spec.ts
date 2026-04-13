import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();

    httpMock.expectOne('/api/health').flush({
      status: 'ok',
      service: 'Luma Dashboard API',
      timestamp: new Date().toISOString(),
      uptime: 1,
      version: '1.0.0'
    });
    httpMock.expectOne('/api/server/metrics').flush({
      hostname: 'test-host',
      cpu: 12,
      memory: { total: 100, used: 40, free: 60, usage: 40 },
      disk: [],
      network: [],
      uptime: 300,
      temperature: null,
      power: { watts: 42, powerSource: 'estimated' },
      processes: [],
      gpu: { available: false, message: 'No GPU detected — placeholder' },
      timestamp: new Date().toISOString()
    });
    httpMock.expectOne('/api/server/cost').flush({
      ratePerKwh: 0.117,
      dailyCost: 0.1,
      weeklyCost: 0.7,
      monthlyCost: 3,
      yearlyCost: 36
    });
  });

  it(`should have the 'Luma Dashboard ✨' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('Luma Dashboard ✨');

    httpMock.expectOne('/api/health').flush({ status: 'ok', service: 'Luma Dashboard API', timestamp: new Date().toISOString(), uptime: 1, version: '1.0.0' });
    httpMock.expectOne('/api/server/metrics').flush({ hostname: 'test-host', cpu: 12, memory: { total: 100, used: 40, free: 60, usage: 40 }, disk: [], network: [], uptime: 300, temperature: null, power: { watts: 42, powerSource: 'estimated' }, processes: [], gpu: { available: false, message: 'No GPU detected — placeholder' }, timestamp: new Date().toISOString() });
    httpMock.expectOne('/api/server/cost').flush({ ratePerKwh: 0.117, dailyCost: 0.1, weeklyCost: 0.7, monthlyCost: 3, yearlyCost: 36 });
  });

  it('should render dashboard title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    httpMock.expectOne('/api/health').flush({ status: 'ok', service: 'Luma Dashboard API', timestamp: new Date().toISOString(), uptime: 1, version: '1.0.0' });
    httpMock.expectOne('/api/server/metrics').flush({ hostname: 'test-host', cpu: 12, memory: { total: 100, used: 40, free: 60, usage: 40 }, disk: [], network: [], uptime: 300, temperature: null, power: { watts: 42, powerSource: 'estimated' }, processes: [], gpu: { available: false, message: 'No GPU detected — placeholder' }, timestamp: new Date().toISOString() });
    httpMock.expectOne('/api/server/cost').flush({ ratePerKwh: 0.117, dailyCost: 0.1, weeklyCost: 0.7, monthlyCost: 3, yearlyCost: 36 });

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Luma Dashboard ✨');
    expect(compiled.textContent).toContain('Server Monitor');
  });
});
